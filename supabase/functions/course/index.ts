// TRADEVERSITY · Mentorship course (Supabase Edge Function "course", JWT verification OFF: it checks the login itself).
//
// One device per member. When a member activates the course, their browser creates an ECDSA P-256 key pair whose
// private key can't be exported (WebCrypto, non-extractable, kept in IndexedDB). Only the public key is stored here.
// Every request for lessons or a video must be signed by that private key, with a fresh time stamp (no replays).
// Another phone / PC / browser with the same login has no key, so it gets nothing.
//
// Device change (self-service, no admin): code sent to the member's Telegram → the new device waits 24 hours
// (the old device keeps working and can cancel) → then the new device replaces the old one.
// Limits: 1 change per 90 days, 2 per year. The admin can reset or approve at any time.
//
// Videos: VdoCipher DRM (no download, screen capture blocked on most devices) with the member's name/email
// as a moving watermark. Set the secret VDOCIPHER_API_SECRET to turn videos on.
//
// POST JSON {action, ...}. Actions: status, activate, lessons, play, resetCode, resetConfirm, cancelPending,
// and for the admin: adminList, adminGrant, adminRevoke, adminBlock, adminUnblock, adminReset, adminApprove, adminLog.
import { createClient } from "npm:@supabase/supabase-js@2";

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const VDO = (Deno.env.get("VDOCIPHER_API_SECRET") ?? "").replace(/^\s*(api\s*secret\s*:?|apisecret)\s*/i, "").replace(/\s+/g, "");
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST,OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const DAY = 86400e3, WAIT = DAY, GAP = 90 * DAY, YEAR = 365 * DAY, MAX_YEAR = 2, SKEW = 120e3;

const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
async function tg(chat: number | string | null, text: string) {
  if (!chat || !TOKEN) return false;
  try {
    const r = await fetch("https://api.telegram.org/bot" + TOKEN + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }) });
    return r.ok;
  } catch (_) { return false; }
}
async function sha(s: string) {
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, "0")).join("");
}
const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const samePub = (a: any, b: any) => !!a && !!b && a.x === b.x && a.y === b.y && a.crv === "P-256" && b.crv === "P-256";
const cleanPub = (p: any) => (p && p.kty === "EC" && p.crv === "P-256" && typeof p.x === "string" && typeof p.y === "string" && p.x.length < 60 && p.y.length < 60) ? { kty: "EC", crv: "P-256", x: p.x, y: p.y } : null;
async function verify(pub: any, msg: string, sig: string) {
  try {
    const k = await crypto.subtle.importKey("jwk", { ...pub, ext: true }, { name: "ECDSA", namedCurve: "P-256" }, false, ["verify"]);
    return await crypto.subtle.verify({ name: "ECDSA", hash: "SHA-256" }, k, b64(sig), new TextEncoder().encode(msg));
  } catch (_) { return false; }
}
const label = (s: unknown) => String(s || "Device").replace(/[<>]/g, "").slice(0, 60);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ ok: false, error: "post_only" }, 405);
  const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const { data: u } = await sb.auth.getUser(jwt);
  if (!u?.user) return json({ ok: false, error: "not_logged_in" }, 401);
  const uid = u.user.id;
  const b = await req.json().catch(() => ({} as any));
  const action = String(b.action || "");
  const ip = (req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "").split(",")[0].trim().slice(0, 64);
  const country = (req.headers.get("cf-ipcountry") || req.headers.get("x-country") || "").slice(0, 8) || null;
  const ua = (req.headers.get("user-agent") || "").slice(0, 200);
  const { data: me } = await sb.from("profiles").select("id,full_name,email,role,status,telegram_id").eq("id", uid).single();
  const isAdmin = me?.role === "admin";
  const log = (user: string, act: string, ok: boolean, reason: string | null = null, device: string | null = null) =>
    sb.from("course_log").insert({ user_id: user, action: act, ok, reason, device, ip, country, ua });

  // ---------------- admin ----------------
  if (action.startsWith("admin")) {
    if (!isAdmin) return json({ ok: false, error: "admin_only" }, 403);
    const target = String(b.userId || "");
    if (action === "adminList") {
      const { data: ms } = await sb.from("course_members").select("user_id,status,granted_at,note,device_label,device_at,accepted_at,pend_label,pend_at,resets");
      const ids = (ms || []).map((m: any) => m.user_id);
      const { data: ps } = ids.length ? await sb.from("profiles").select("id,full_name,email,telegram").in("id", ids) : { data: [] as any[] };
      const since = new Date(Date.now() - 7 * DAY).toISOString();
      const { data: lg } = ids.length ? await sb.from("course_log").select("user_id,action,ok,reason,ip,country,at").in("user_id", ids).gte("at", since).order("at", { ascending: false }).limit(3000) : { data: [] as any[] };
      const P: Record<string, any> = {}; (ps || []).forEach((p: any) => (P[p.id] = p));
      const out = (ms || []).map((m: any) => {
        const l = (lg || []).filter((x: any) => x.user_id === m.user_id);
        const blocked = l.filter((x: any) => !x.ok && x.reason === "other_device").length;
        const ips = new Set(l.map((x: any) => x.ip).filter(Boolean)).size;
        const countries = new Set(l.map((x: any) => x.country).filter(Boolean)).size;
        const last = l.find((x: any) => x.ok);
        return { ...m, name: P[m.user_id]?.full_name || "", email: P[m.user_id]?.email || "", telegram: P[m.user_id]?.telegram || "",
          blocked7: blocked, ips7: ips, countries7: countries, lastIp: last?.ip || null, lastCountry: last?.country || null, lastAt: last?.at || null,
          suspicious: blocked >= 3 || countries >= 3 || (m.resets || []).length >= MAX_YEAR };
      });
      return json({ ok: true, members: out });
    }
    if (!target) return json({ ok: false, error: "no_user" }, 400);
    if (action === "adminLog") {
      const { data } = await sb.from("course_log").select("at,action,ok,reason,device,ip,country").eq("user_id", target).order("at", { ascending: false }).limit(60);
      return json({ ok: true, log: data || [] });
    }
    if (action === "adminGrant") {
      const { error } = await sb.from("course_members").upsert({ user_id: target, status: "active", granted_by: uid, note: b.note ? String(b.note).slice(0, 200) : null }, { onConflict: "user_id" });
      if (!error) { await log(target, "granted", true); const { data: p } = await sb.from("profiles").select("telegram_id").eq("id", target).single();
        await tg(p?.telegram_id, "🎓 <b>TRADEVERSITY</b>\n\nYour access to the Mentorship course is open. Open the course on the device you will use: it becomes your only course device.\n\nhttps://jointradeversity.com"); }
      return json({ ok: !error, error: error?.message });
    }
    if (action === "adminRevoke") { await sb.from("course_members").delete().eq("user_id", target); await log(target, "revoked", true); return json({ ok: true }); }
    if (action === "adminBlock" || action === "adminUnblock") {
      await sb.from("course_members").update({ status: action === "adminBlock" ? "blocked" : "active" }).eq("user_id", target);
      await log(target, action === "adminBlock" ? "blocked" : "unblocked", true); return json({ ok: true });
    }
    if (action === "adminReset") {
      await sb.from("course_members").update({ device_pub: null, device_label: null, device_at: null, pend_pub: null, pend_label: null, pend_at: null, last_ts: 0 }).eq("user_id", target);
      await log(target, "admin_reset", true); return json({ ok: true });
    }
    if (action === "adminApprove") {
      const { data: m } = await sb.from("course_members").select("pend_pub,pend_label").eq("user_id", target).single();
      if (!m?.pend_pub) return json({ ok: false, error: "no_pending" }, 400);
      await sb.from("course_members").update({ device_pub: m.pend_pub, device_label: m.pend_label, device_at: new Date().toISOString(), pend_pub: null, pend_label: null, pend_at: null, last_ts: 0 }).eq("user_id", target);
      await log(target, "admin_approved_change", true, null, m.pend_label); return json({ ok: true });
    }
    return json({ ok: false, error: "unknown_action" }, 400);
  }

  // ---------------- member ----------------
  // the admin previews the course without a device lock
  if (isAdmin && (action === "status" || action === "lessons" || action === "play")) {
    if (action === "status") return json({ ok: true, admin: true, member: true, device: "this", label: "Admin preview" });
    if (action === "lessons") return json({ ok: true, lessons: await lessons(uid, true) });
    return json(await play(String(b.lessonId || ""), me, true));
  }
  const { data: m0 } = await sb.from("course_members").select("*").eq("user_id", uid).maybeSingle();
  if (!m0) return json({ ok: true, member: false });
  let m: any = m0;
  if (m.status === "blocked") { if (action !== "status") await log(uid, action, false, "blocked"); return json({ ok: true, member: true, blocked: true }); }
  // Windows PC: the course works only in the TRADEVERSITY app (its window is hidden from screen capture)
  const fullUa = req.headers.get("user-agent") || "";
  if (["activate", "lessons", "play", "resetConfirm"].includes(action) && /Windows NT/.test(fullUa) && !/TradeversityApp\//.test(fullUa)) {
    await log(uid, action, false, "use_app"); return json({ ok: false, error: "use_app" });
  }
  // Android: only phones with hardware video protection (Widevine L1); L2/L3 phones can be screen-recorded
  if (["activate", "lessons", "play", "resetConfirm"].includes(action) && /Android/i.test(fullUa) && b.drm !== "L1") {
    await log(uid, action, false, "need_l1", String(b.drm || "none").slice(0, 8)); return json({ ok: false, error: "need_l1" });
  }

  // a device change that waited 24 hours becomes the device now
  if (m.pend_pub && m.pend_at && Date.now() - new Date(m.pend_at).getTime() >= WAIT) {
    const resets = [...(m.resets || []), new Date().toISOString()];
    await sb.from("course_members").update({ device_pub: m.pend_pub, device_label: m.pend_label, device_at: new Date().toISOString(), pend_pub: null, pend_label: null, pend_at: null, resets, last_ts: 0 }).eq("user_id", uid);
    await log(uid, "device_changed", true, null, m.pend_label);
    m = { ...m, device_pub: m.pend_pub, device_label: m.pend_label, device_at: new Date().toISOString(), pend_pub: null, pend_label: null, pend_at: null, resets, last_ts: 0 };
  }
  const pub = cleanPub(b.pub);
  const limits = () => {
    const now = Date.now(), rs = (m.resets || []).map((x: string) => new Date(x).getTime());
    const lastR = rs.length ? Math.max(...rs) : 0, inYear = rs.filter((t: number) => now - t < YEAR).length;
    const nextGap = lastR ? lastR + GAP : 0, nextYear = inYear >= MAX_YEAR ? Math.min(...rs.filter((t: number) => now - t < YEAR)) + YEAR : 0;
    const next = Math.max(nextGap, nextYear);
    return { left: Math.max(0, MAX_YEAR - inYear), nextAt: next > now ? new Date(next).toISOString() : null, allowed: next <= now && inYear < MAX_YEAR };
  };
  const state = () => ({
    ok: true, member: true, blocked: false,
    device: !m.device_pub ? "none" : samePub(m.device_pub, pub) ? "this" : (m.pend_pub && samePub(m.pend_pub, pub)) ? "pending" : "other",
    label: m.device_label, since: m.device_at, accepted: m.accepted_at,
    pending: m.pend_pub ? { label: m.pend_label, at: m.pend_at, readyAt: new Date(new Date(m.pend_at).getTime() + WAIT).toISOString() } : null,
    resets: limits(), telegram: !!me?.telegram_id,
  });
  // signed request from the device: msg = action|uid|extra|ts
  const signed = async (extra = "") => {
    const ts = Number(b.ts || 0);
    if (!pub || !m.device_pub || !samePub(pub, m.device_pub)) return "other_device";
    if (!ts || Math.abs(Date.now() - ts) > SKEW || ts <= Number(m.last_ts || 0)) return "bad_time";
    if (!(await verify(m.device_pub, action + "|" + uid + "|" + extra + "|" + ts, String(b.sig || "")))) return "bad_signature";
    await sb.from("course_members").update({ last_ts: ts }).eq("user_id", uid);
    return "";
  };

  if (action === "status") return json(state());

  if (action === "activate") {
    if (m.device_pub) return json({ ...state(), ok: false, error: "already_active" });
    if (!pub) return json({ ok: false, error: "bad_key" }, 400);
    if (b.accept !== true) return json({ ok: false, error: "must_accept" }, 400);
    const ts = Number(b.ts || 0);
    if (!ts || Math.abs(Date.now() - ts) > SKEW || !(await verify(pub, "activate|" + uid + "||" + ts, String(b.sig || "")))) return json({ ok: false, error: "bad_signature" }, 400);
    const now = new Date().toISOString();
    // only if still empty (two devices racing: the first wins)
    const { data: upd } = await sb.from("course_members").update({ device_pub: pub, device_label: label(b.label), device_at: now, accepted_at: now, last_ts: ts }).eq("user_id", uid).is("device_pub", null).select("user_id");
    if (!upd?.length) return json({ ok: false, error: "already_active" });
    await log(uid, "activated", true, null, label(b.label));
    m = { ...m, device_pub: pub, device_label: label(b.label), device_at: now, accepted_at: now };
    return json(state());
  }

  if (action === "lessons") {
    const bad = await signed();
    if (bad) { await log(uid, "lessons", false, bad); return json({ ...state(), ok: false, error: bad }); }
    await log(uid, "lessons", true, null, m.device_label);
    return json({ ...state(), lessons: await lessons(uid, false, m.granted_at) });
  }

  if (action === "play") {
    const id = String(b.lessonId || "");
    const bad = await signed(id);
    if (bad) { await log(uid, "play", false, bad); return json({ ok: false, error: bad }); }
    await log(uid, "play", true, id, m.device_label);
    return json(await play(id, me, false, m.granted_at));
  }

  if (action === "cancelPending") {
    const bad = await signed();
    if (bad) return json({ ok: false, error: bad });
    await sb.from("course_members").update({ pend_pub: null, pend_label: null, pend_at: null }).eq("user_id", uid);
    await log(uid, "change_cancelled", true, null, m.device_label);
    m = { ...m, pend_pub: null, pend_label: null, pend_at: null };
    return json(state());
  }

  if (action === "resetCode") {
    if (!m.device_pub) return json({ ok: false, error: "no_device" });
    if (m.pend_pub) return json({ ok: false, error: "already_pending" });
    if (!limits().allowed) return json({ ok: false, error: "limit", resets: limits() });
    if (!me?.telegram_id) return json({ ok: false, error: "no_telegram" });
    if (m.code_exp && new Date(m.code_exp).getTime() - 9 * 60e3 > Date.now()) return json({ ok: false, error: "wait_minute" });
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
    await sb.from("course_members").update({ code_hash: await sha(uid + ":" + code), code_exp: new Date(Date.now() + 10 * 60e3).toISOString(), code_tries: 0 }).eq("user_id", uid);
    const sent = await tg(me.telegram_id, "🔐 <b>TRADEVERSITY · course device change</b>\n\nYour code: <b>" + code + "</b>\nIt works for 10 minutes.\n\nIf you didn't ask for this, ignore this message: your course stays on your current device.");
    await log(uid, "change_code", sent, sent ? null : "telegram_failed");
    return json({ ok: sent, error: sent ? undefined : "telegram_failed" });
  }

  if (action === "resetConfirm") {
    if (!pub) return json({ ok: false, error: "bad_key" }, 400);
    if (m.pend_pub) return json({ ok: false, error: "already_pending" });
    if (!limits().allowed) return json({ ok: false, error: "limit", resets: limits() });
    if (!m.code_hash || !m.code_exp || new Date(m.code_exp).getTime() < Date.now()) return json({ ok: false, error: "code_expired" });
    if ((m.code_tries || 0) >= 5) return json({ ok: false, error: "too_many_tries" });
    const ts = Number(b.ts || 0);
    if (!ts || Math.abs(Date.now() - ts) > SKEW || !(await verify(pub, "resetConfirm|" + uid + "||" + ts, String(b.sig || "")))) return json({ ok: false, error: "bad_signature" }, 400);
    if ((await sha(uid + ":" + String(b.code || "").trim())) !== m.code_hash) {
      await sb.from("course_members").update({ code_tries: (m.code_tries || 0) + 1 }).eq("user_id", uid);
      await log(uid, "change_code_wrong", false, "wrong_code"); return json({ ok: false, error: "wrong_code", triesLeft: 4 - (m.code_tries || 0) });
    }
    const now = new Date().toISOString();
    await sb.from("course_members").update({ pend_pub: pub, pend_label: label(b.label), pend_at: now, code_hash: null, code_exp: null, code_tries: 0 }).eq("user_id", uid);
    await log(uid, "change_requested", true, null, label(b.label));
    await tg(me?.telegram_id, "📱 <b>TRADEVERSITY · course device change</b>\n\nNew device: <b>" + esc(label(b.label)) + "</b>\nIt will replace your current course device in 24 hours. Until then your current device keeps working.\n\nNot you? Open the course on your current device and press <b>Cancel the change</b>.");
    m = { ...m, pend_pub: pub, pend_label: label(b.label), pend_at: now };
    return json(state());
  }

  return json({ ok: false, error: "unknown_action" }, 400);
});

// weekly unlock: a lesson opens unlock_days after the member got access (the admin sees everything)
const opensAt = (start: string | null, days: number) => start && days > 0 ? new Date(new Date(start).getTime() + days * DAY).toISOString() : null;

async function lessons(uid: string, admin: boolean, start: string | null = null) {
  let q = sb.from("course_lessons").select("id,position,module,title,summary,minutes,video_id,published,unlock_days,assignment").order("position");
  if (!admin) q = q.eq("published", true);
  const { data } = await q;
  const { data: pr } = await sb.from("course_progress").select("lesson_id,pct,done").eq("user_id", uid);
  const P: Record<string, any> = {}; (pr || []).forEach((p: any) => (P[p.lesson_id] = p));
  // the video ID never goes to the browser: only "has a video"
  return (data || []).map((l: any) => {
    const at = admin ? null : opensAt(start, l.unlock_days || 0), locked = !!at && new Date(at).getTime() > Date.now();
    return { id: l.id, position: l.position, module: l.module, title: l.title, summary: l.summary, minutes: l.minutes, published: l.published,
      video: !!l.video_id, unlock_days: l.unlock_days || 0, locked, opensAt: locked ? at : null, assignment: locked ? null : (l.assignment || null),
      pct: P[l.id]?.pct || 0, done: !!P[l.id]?.done };
  });
}

async function play(id: string, me: any, admin: boolean, start: string | null = null) {
  const { data: l } = await sb.from("course_lessons").select("id,video_id,published,unlock_days").eq("id", id).maybeSingle();
  if (!l || (!l.published && !admin)) return { ok: false, error: "no_lesson" };
  const at = admin ? null : opensAt(start, l.unlock_days || 0);
  if (at && new Date(at).getTime() > Date.now()) return { ok: false, error: "locked", opensAt: at };
  if (!l.video_id) return { ok: false, error: "video_not_ready" };
  if (!VDO) return { ok: false, error: "video_not_configured" };
  const mark = [me?.full_name, me?.email].filter(Boolean).join(" · ");
  // small fixed line top-left + a faint name that moves to a new random place every 20 s (can't be cropped out of a recording)
  const annotate = JSON.stringify([
    { type: "text", text: mark, alpha: "0.55", x: "12", y: "10", color: "0xFFFFFF", size: "11" },
    { type: "rtext", text: mark, alpha: "0.16", color: "0xFFFFFF", size: "12", interval: "20000" },
  ]);
  const r = await fetch("https://dev.vdocipher.com/api/videos/" + encodeURIComponent(l.video_id) + "/otp", {
    method: "POST", headers: { Authorization: "Apisecret " + VDO, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ttl: 300, annotate }),
  });
  if (!r.ok) { const t = (await r.text()).slice(0, 300); console.log("vdocipher otp failed", r.status, t); return { ok: false, error: "video_error", detail: admin ? r.status + " " + t : undefined }; }
  const j = await r.json();
  return { ok: true, otp: j.otp, playbackInfo: j.playbackInfo };
}
