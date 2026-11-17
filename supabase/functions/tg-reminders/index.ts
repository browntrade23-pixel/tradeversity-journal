// Tradeversity Telegram reminders (Supabase Edge Function "tg-reminders", JWT verification OFF).
// Called every 5 minutes by pg_cron (header x-cron-key = public.app_secrets 'cron', which only the database knows).
// Sends, in the student's language (EN / FR / AR), each message only once (public.tg_sent):
//   - red news (High impact) 15 minutes and 5 minutes before
//   - "plan tomorrow" at 21:30 Algiers time (Sunday to Thursday) if tomorrow has no plan
//   - daily loss: 80% of the limit, and limit reached (prop firm rules daily limit, or today's plan max loss)
//   - Sunday 20:00: weekly summary for the admin (top students, broken plans, inactive, requests, affiliate clicks)
// Students can turn each reminder off in the app (user_settings.data.notify). ?test=1 (with the user's login token) sends a test message;
// ?test=weekly (admin) sends the weekly summary now.
import { createClient } from "npm:@supabase/supabase-js@2";

const TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN") ?? "";
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "GET,POST,OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const OFFSET = 60; // Algeria = UTC+1 all year
const SITE = "https://jointradeversity.com";

async function send(chat: number | string, text: string) {
  try {
    const r = await fetch("https://api.telegram.org/bot" + TOKEN + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML", disable_web_page_preview: true }) });
    return r.ok;
  } catch (_) { return false; }
}
// send once: the key is stored in tg_sent; if it is already there, nothing is sent
async function once(key: string, chat: number | string, text: string) {
  const { error } = await sb.from("tg_sent").insert({ key });
  if (error) return false; // already sent (duplicate key)
  const ok = await send(chat, text);
  if (!ok) await sb.from("tg_sent").delete().eq("key", key);
  return ok;
}
const esc = (s: string) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const local = (d: Date) => new Date(d.getTime() + OFFSET * 60000); // Algiers wall clock in the UTC fields
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const hhmm = (iso: string) => local(new Date(iso)).toISOString().slice(11, 16);
const money = (v: number) => (v < 0 ? "-$" : "$") + Math.abs(Math.round(v)).toLocaleString("en-US");

type L = "en" | "fr" | "ar";
const M: Record<string, Record<L, (a: Record<string, string>) => string>> = {
  n15: {
    en: (a) => "🔴 <b>Red news in 15 minutes</b>\n" + a.list + "\n\nProtect or close your trades. No new entry around the news.",
    fr: (a) => "🔴 <b>News rouge dans 15 minutes</b>\n" + a.list + "\n\nProtégez ou fermez vos trades. Pas de nouvelle entrée autour de la news.",
    ar: (a) => "🔴 <b>خبر أحمر بعد 15 دقيقة</b>\n" + a.list + "\n\nاحمِ صفقاتك أو أغلقها. لا دخول جديد قرب الخبر.",
  },
  n5: {
    en: (a) => "🚨 <b>Red news in 5 minutes</b>\n" + a.list + "\n\nHands off the chart until it is out.",
    fr: (a) => "🚨 <b>News rouge dans 5 minutes</b>\n" + a.list + "\n\nNe touchez plus au graphique jusqu'à la sortie.",
    ar: (a) => "🚨 <b>خبر أحمر بعد 5 دقائق</b>\n" + a.list + "\n\nابتعد عن الشارت حتى يصدر الخبر.",
  },
  plan: {
    en: () => "🧭 <b>Plan tomorrow before you sleep</b>\nBias, key levels, max loss and max trades.\n" + SITE + "/#plan",
    fr: () => "🧭 <b>Préparez votre plan de demain avant de dormir</b>\nBiais, niveaux clés, perte max et nombre de trades.\n" + SITE + "/#plan",
    ar: () => "🧭 <b>حضّر خطة الغد قبل النوم</b>\nالاتجاه، المستويات المهمة، أقصى خسارة وعدد الصفقات.\n" + SITE + "/#plan",
  },
  l80: {
    en: (a) => "⚠️ <b>80% of your daily loss limit</b>\n" + a.acct + ": " + a.loss + " / " + a.limit + " today.\nStop here. One more loss can break your account.",
    fr: (a) => "⚠️ <b>80 % de votre limite de perte journalière</b>\n" + a.acct + " : " + a.loss + " / " + a.limit + " aujourd'hui.\nArrêtez-vous ici. Une perte de plus peut casser votre compte.",
    ar: (a) => "⚠️ <b>وصلت إلى 80% من حد الخسارة اليومي</b>\n" + a.acct + ": " + a.loss + " / " + a.limit + " اليوم.\nتوقف هنا. خسارة أخرى قد تكسر حسابك.",
  },
  l100: {
    en: (a) => "🛑 <b>Daily loss limit reached</b>\n" + a.acct + ": " + a.loss + " / " + a.limit + ".\nClose the platform. Closing it is the trade today.",
    fr: (a) => "🛑 <b>Limite de perte journalière atteinte</b>\n" + a.acct + " : " + a.loss + " / " + a.limit + ".\nFermez la plateforme. C'est le meilleur trade aujourd'hui.",
    ar: (a) => "🛑 <b>وصلت إلى حد الخسارة اليومي</b>\n" + a.acct + ": " + a.loss + " / " + a.limit + ".\nأغلق المنصة. إغلاقها هو أفضل صفقة اليوم.",
  },
  test: {
    en: () => "✅ <b>Tradeversity reminders are on</b>\nYou will get: red news 15 and 5 minutes before, \"plan tomorrow\" at 21:30, and daily loss alerts.",
    fr: () => "✅ <b>Les rappels Tradeversity sont activés</b>\nVous recevrez : news rouges 15 et 5 minutes avant, \"plan de demain\" à 21h30, et alertes de perte journalière.",
    ar: () => "✅ <b>تنبيهات Tradeversity مفعلة</b>\nستصلك: الأخبار الحمراء قبل 15 و5 دقائق، تذكير \"خطة الغد\" الساعة 21:30، وتنبيهات حد الخسارة اليومي.",
  },
};
const msg = (k: string, lang: string, a: Record<string, string> = {}) => (M[k][(["en", "fr", "ar"].includes(lang) ? lang : "en") as L])(a);

async function students() {
  const { data: profs } = await sb.from("profiles").select("id,full_name,role,status,telegram_id").not("telegram_id", "is", null);
  const { data: sets } = await sb.from("user_settings").select("user_id,data");
  const S: Record<string, any> = {};
  (sets || []).forEach((s: any) => (S[s.user_id] = s.data || {}));
  return (profs || []).filter((p: any) => p.role !== "admin" && (!p.status || p.status === "approved"))
    .map((p: any) => { const d = S[p.id] || {}; return { ...p, lang: d.lang || "en", notify: { news: true, plan: true, loss: true, ...(d.notify || {}) }, rules: d.rules || {} }; });
}

async function weekly(adminChat: number | string, key: string | null) {
  const since = ymd(new Date(Date.now() - 7 * 864e5));
  const { data: profs } = await sb.from("profiles").select("id,full_name,role,status,created_at");
  const studs = (profs || []).filter((p: any) => p.role !== "admin" && (!p.status || p.status === "approved"));
  const pending = (profs || []).filter((p: any) => p.status === "pending").length;
  const { data: trades } = await sb.from("trades").select("user_id,trade_date,pnl,data").gte("trade_date", since).limit(20000);
  const { data: plans } = await sb.from("plans").select("user_id,plan_date").gte("plan_date", since).limit(20000);
  const { data: clicks } = await sb.from("aff_clicks").select("firm,kind").gte("created_at", new Date(Date.now() - 7 * 864e5).toISOString()).limit(20000);
  const by: Record<string, { net: number; n: number; broke: number }> = {};
  (trades || []).forEach((t: any) => { const o = by[t.user_id] || (by[t.user_id] = { net: 0, n: 0, broke: 0 }); o.net += Number(t.pnl) || 0; o.n++; if (t.data && t.data.followed === "No") o.broke++; });
  const active = new Set([...(trades || []).map((t: any) => t.user_id), ...(plans || []).map((p: any) => p.user_id)]);
  const name = (id: string) => esc((studs.find((s: any) => s.id === id) || { full_name: "?" }).full_name || "?");
  const top = Object.entries(by).filter(([id]) => studs.some((s: any) => s.id === id)).sort((a, b) => b[1].net - a[1].net).slice(0, 3);
  const broke = Object.entries(by).filter(([id, o]) => o.broke > 0 && studs.some((s: any) => s.id === id)).sort((a, b) => b[1].broke - a[1].broke).slice(0, 5);
  const inactive = studs.filter((s: any) => !active.has(s.id));
  const cl: Record<string, number> = {};
  (clicks || []).filter((c: any) => c.kind === "link").forEach((c: any) => (cl[c.firm] = (cl[c.firm] || 0) + 1));
  const lines = [
    "📊 <b>Tradeversity: your week</b> (" + since + " → " + ymd(new Date()) + ")",
    "",
    "🏆 <b>Top students</b>",
    ...(top.length ? top.map(([id, o], i) => (i + 1) + ". " + name(id) + ": " + money(o.net) + " (" + o.n + " trades)") : ["No trades this week."]),
    "",
    "⚠️ <b>Broke their plan</b>",
    ...(broke.length ? broke.map(([id, o]) => "• " + name(id) + ": " + o.broke + "×") : ["Nobody. 👏"]),
    "",
    "😴 <b>No journal and no plan this week:</b> " + inactive.length + " / " + studs.length,
    ...(inactive.slice(0, 8).map((s: any) => "• " + esc(s.full_name || "?"))),
    "",
    "📝 <b>Requests waiting:</b> " + pending,
    "🔗 <b>Affiliate link clicks:</b> " + (Object.keys(cl).length ? Object.entries(cl).map(([f, n]) => f + " " + n).join(" · ") : "0"),
    "",
    SITE + "/#admin",
  ];
  const text = lines.join("\n");
  return key ? await once(key, adminChat, text) : await send(adminChat, text);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!TOKEN) return json({ ok: false, error: "TELEGRAM_BOT_TOKEN secret is missing" }, 500);
  const url = new URL(req.url);

  // test message for the logged-in user (button in the app)
  const test = url.searchParams.get("test");
  if (test) {
    const jwt = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    const { data: u } = await sb.auth.getUser(jwt);
    if (!u?.user) return json({ ok: false, error: "not_logged_in" }, 401);
    const { data: p } = await sb.from("profiles").select("role,telegram_id").eq("id", u.user.id).single();
    if (!p?.telegram_id) return json({ ok: false, error: "no_telegram" });
    if (test === "weekly") { if (p.role !== "admin") return json({ ok: false, error: "admin_only" }, 403); return json({ ok: await weekly(p.telegram_id, null) }); }
    const { data: st } = await sb.from("user_settings").select("data").eq("user_id", u.user.id).maybeSingle();
    return json({ ok: await send(p.telegram_id, msg("test", (st?.data?.lang) || "en")) });
  }

  // scheduled run (pg_cron every 5 minutes)
  const { data: sec } = await sb.from("app_secrets").select("v").eq("k", "cron").single();
  if (!sec?.v || req.headers.get("x-cron-key") !== sec.v) return json({ ok: false }, 403);

  const now = new Date(), loc = local(now), H = loc.getUTCHours(), Mi = loc.getUTCMinutes(), dow = loc.getUTCDay(), today = ymd(loc);
  const out = { news: 0, plan: 0, loss: 0, weekly: 0 };
  const list = await students();

  // 1) red news: 15 minutes and 5 minutes before
  const { data: news } = await sb.from("econ_news").select("title,impact,starts_at").eq("impact", "High")
    .gte("starts_at", now.toISOString()).lte("starts_at", new Date(now.getTime() + 17 * 60000).toISOString()).order("starts_at");
  const groups: Record<string, any[]> = {};
  (news || []).forEach((n: any) => (groups[n.starts_at] = groups[n.starts_at] || []).push(n));
  for (const [at, evs] of Object.entries(groups)) {
    const mins = (new Date(at).getTime() - now.getTime()) / 60000;
    const kind = mins > 9 && mins <= 17 ? "n15" : mins > 0 && mins <= 7 ? "n5" : null;
    if (!kind) continue;
    const ls = evs.map((e: any) => "• " + hhmm(at) + "  " + esc(e.title)).join("\n");
    for (const s of list) if (s.notify.news && (await once(s.id + ":" + kind + ":" + at, s.telegram_id, msg(kind, s.lang, { list: ls })))) out.news++;
  }

  // 2) "plan tomorrow" at 21:30, Sunday to Thursday, if tomorrow has no plan
  if (H === 21 && Mi >= 30 && Mi < 40 && dow >= 0 && dow <= 4) {
    const tm = ymd(new Date(loc.getTime() + 864e5));
    const { data: pl } = await sb.from("plans").select("user_id").eq("plan_date", tm);
    const has = new Set((pl || []).map((p: any) => p.user_id));
    for (const s of list) if (s.notify.plan && !has.has(s.id) && (await once(s.id + ":plan:" + tm, s.telegram_id, msg("plan", s.lang)))) out.plan++;
  }

  // 3) daily loss limit: 80% and 100% (rules of each account, or today's plan max loss)
  if (dow >= 1 && dow <= 5) {
    const ids = list.filter((s: any) => s.notify.loss).map((s: any) => s.id);
    if (ids.length) {
      const { data: tr } = await sb.from("trades").select("user_id,account,pnl").eq("trade_date", today).in("user_id", ids);
      const { data: pl } = await sb.from("plans").select("user_id,data").eq("plan_date", today).in("user_id", ids);
      for (const s of list.filter((x: any) => x.notify.loss)) {
        const mine = (tr || []).filter((t: any) => t.user_id === s.id);
        if (!mine.length) continue;
        const checks: { acct: string; net: number; limit: number }[] = [];
        const accts: Record<string, number> = {};
        mine.forEach((t: any) => (accts[t.account || "—"] = (accts[t.account || "—"] || 0) + (Number(t.pnl) || 0)));
        for (const [a, net] of Object.entries(accts)) { const lim = Number((s.rules[a] || {}).daily) || 0; if (lim > 0) checks.push({ acct: a, net, limit: lim }); }
        const p = (pl || []).find((x: any) => x.user_id === s.id), pm = Number(p?.data?.maxLoss) || 0;
        if (pm > 0) checks.push({ acct: "Plan", net: Object.values(accts).reduce((a, b) => a + b, 0), limit: pm });
        for (const c of checks) {
          const loss = -c.net; if (loss <= 0) continue;
          const lv = loss >= c.limit ? "l100" : loss >= 0.8 * c.limit ? "l80" : null; if (!lv) continue;
          if (await once(s.id + ":" + lv + ":" + today + ":" + c.acct, s.telegram_id, msg(lv, s.lang, { acct: esc(c.acct), loss: money(-loss), limit: money(c.limit) }))) out.loss++;
        }
      }
    }
  }

  // 4) Sunday 20:00: weekly summary for the admin
  if (dow === 0 && H === 20 && Mi < 10) {
    const { data: ad } = await sb.from("profiles").select("id,telegram_id").eq("role", "admin").not("telegram_id", "is", null);
    for (const a of ad || []) if (await weekly(a.telegram_id, a.id + ":weekly:" + today)) out.weekly++;
  }

  // keep the sent-log small (30 days)
  await sb.from("tg_sent").delete().lt("sent_at", new Date(Date.now() - 30 * 864e5).toISOString());
  return json({ ok: true, ...out });
});
