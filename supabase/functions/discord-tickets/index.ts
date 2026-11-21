// TRADEVERSITY Support — the server's own Discord ticket bot (Supabase Edge Function "discord-tickets", JWT verification OFF).
// Discord calls this URL for every interaction (Interactions Endpoint URL of the "TRADEVERSITY Support" app).
// Every request is checked with the app's public Ed25519 key, so nobody else can call it.
//
//   /ticket-panel  (admins only)  posts the "🎫 Open a ticket" panel in the channel where it is used (🆘〢help)
//   🎫 Open a ticket   private channel in the "🎫 Tickets" category: the member + 🛡️ Support Team only,
//                      "you are #N in line", one open ticket per member, log line in the staff channel
//   🔒 Close           member or staff: the member can no longer write, channel renamed closed-…
//   🗑️ Delete          staff only: deletes a closed ticket after 5 seconds
//
// Secrets (Supabase → Edge Functions → Secrets): DISCORD_BOT_TOKEN (entered by the owner, never in this file).
// Not secret, so kept here: application id, public key, server id, staff log channel.
import nacl from "npm:tweetnacl@1.0.3";

const TOKEN = Deno.env.get("DISCORD_BOT_TOKEN") ?? "";
const APP_ID = Deno.env.get("DISCORD_APP_ID") ?? "__APP_ID__";
const PUBLIC_KEY = Deno.env.get("DISCORD_PUBLIC_KEY") ?? "__PUBLIC_KEY__";
const GUILD = "1432173106373460070"; // TRADEVERSITY
const LOG_CHANNEL = "1432251865709674546"; // staff area › support-chat
const CATEGORY_NAME = /tickets/i; // "🎫 Tickets"
const ROLE_NAME = /support team/i; // "🛡️ Support Team"
const API = "https://discord.com/api/v10";

// permission bits
const P = { VIEW: 1n << 10n, SEND: 1n << 11n, EMBED: 1n << 14n, ATTACH: 1n << 15n, HISTORY: 1n << 16n, MANAGE_MSG: 1n << 13n, MANAGE_CH: 1n << 4n, ADMIN: 1n << 3n };
const bits = (...b: bigint[]) => b.reduce((a, c) => a | c, 0n).toString();
const MEMBER_ALLOW = bits(P.VIEW, P.SEND, P.EMBED, P.ATTACH, P.HISTORY);
const STAFF_ALLOW = bits(P.VIEW, P.SEND, P.EMBED, P.ATTACH, P.HISTORY, P.MANAGE_MSG);
const BOT_ALLOW = bits(P.VIEW, P.SEND, P.EMBED, P.ATTACH, P.HISTORY, P.MANAGE_CH);
const EPHEMERAL = 64;
const BLUE = 0x3b82f6, GREEN = 0x22c55e, GREY = 0x6b7280;

const hex = (h: string) => new Uint8Array((h.match(/.{2}/g) ?? []).map((b) => parseInt(b, 16)));
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
// deno-lint-ignore no-explicit-any
const bg = (p: Promise<unknown>) => { try { (globalThis as any).EdgeRuntime?.waitUntil(p); } catch (_) { /* local run */ } };

async function discord(path: string, method = "GET", body?: unknown, reason?: string) {
  for (let i = 0; i < 4; i++) {
    const h: Record<string, string> = { Authorization: "Bot " + TOKEN, "Content-Type": "application/json" };
    if (reason) h["X-Audit-Log-Reason"] = encodeURIComponent(reason);
    const r = await fetch(API + path, { method, headers: h, body: body === undefined ? undefined : JSON.stringify(body) });
    if (r.status === 429) { const j = await r.json().catch(() => ({})); await sleep(((j as { retry_after?: number }).retry_after ?? 1) * 1000 + 100); continue; }
    if (r.status === 204) return null;
    const j = await r.json().catch(() => null);
    if (!r.ok) throw new Error(method + " " + path + " → " + r.status + " " + JSON.stringify(j));
    return j;
  }
  throw new Error("rate limited: " + path);
}
// edit the "thinking…" reply of an interaction
const reply = (token: string, data: unknown) => discord(`/webhooks/${APP_ID}/${token}/messages/@original`, "PATCH", data);

// ---------- texts (EN / FR / AR in one message, like the rest of the server) ----------
const PANEL = {
  embeds: [{
    color: BLUE,
    title: "🆘 TRADEVERSITY Support",
    description:
      "Need help? Click **🎫 Open a ticket** below, then wait for your turn. Our support team answers every ticket in order.\n\n" +
      "🇫🇷 Besoin d'aide ? Clique sur **🎫 Open a ticket**, puis attends ton tour. Notre équipe support répond à chaque ticket dans l'ordre.\n\n" +
      "🇩🇿 تحتاج مساعدة؟ اضغط على **🎫 Open a ticket** ثم انتظر دورك. فريق الدعم يجيب على كل تذكرة بالترتيب.",
    footer: { text: "One open ticket per member · Nobody from TRADEVERSITY will DM you first" },
  }],
  components: [{ type: 1, components: [{ type: 2, style: 1, label: "Open a ticket", emoji: { name: "🎫" }, custom_id: "tv_open" }] }],
};
const welcome = (user: string, role: string, pos: number) => ({
  content: `<@${user}> <@&${role}>`,
  allowed_mentions: { users: [user], roles: [role] },
  embeds: [{
    color: GREEN,
    title: `🎫 Ticket · you are #${pos} in line`,
    description:
      "Thanks for opening a ticket 👋 Describe your problem in **one message** (screenshots help). A member of the support team will answer as soon as it's your turn. Please don't ping the staff.\n\n" +
      `🇫🇷 Merci ! Décris ton problème en un seul message. L'équipe support te répond dès que c'est ton tour (tu es n°${pos}).\n\n` +
      `🇩🇿 شكراً! اشرح مشكلتك في رسالة واحدة. فريق الدعم سيرد عليك عندما يحين دورك (رقمك ${pos}).`,
  }],
  components: [{ type: 1, components: [{ type: 2, style: 4, label: "Close ticket", emoji: { name: "🔒" }, custom_id: "tv_close" }] }],
});

// ---------- server lookups ----------
type Ch = { id: string; name: string; type: number; parent_id?: string; topic?: string | null };
async function setup() {
  const [roles, chans] = await Promise.all([discord(`/guilds/${GUILD}/roles`), discord(`/guilds/${GUILD}/channels`)]) as [{ id: string; name: string }[], Ch[]];
  const role = roles.find((r) => ROLE_NAME.test(r.name));
  const cat = chans.find((c) => c.type === 4 && CATEGORY_NAME.test(c.name));
  if (!role || !cat) throw new Error("missing Support Team role or Tickets category");
  const tickets = chans.filter((c) => c.parent_id === cat.id && c.type === 0 && (c.topic ?? "").startsWith("tv-ticket:"));
  return { role: role.id, cat: cat.id, tickets };
}
const ownerOf = (c: Ch) => (c.topic ?? "").split(":")[1] ?? "";
const isOpen = (c: Ch) => !c.name.startsWith("closed-");
const byAge = (a: Ch, b: Ch) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1);
// deno-lint-ignore no-explicit-any
const isStaff = (member: any, role: string) => (member?.roles ?? []).includes(role) || (BigInt(member?.permissions ?? "0") & P.ADMIN) === P.ADMIN;
const slug = (s: string) => (s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "member").slice(0, 20);

// ---------- actions ----------
// deno-lint-ignore no-explicit-any
async function openTicket(i: any) {
  const user = i.member.user;
  try {
    const s = await setup();
    const mine = s.tickets.find((c) => isOpen(c) && ownerOf(c) === user.id);
    if (mine) return await reply(i.token, { content: `You already have an open ticket: <#${mine.id}>\n🇫🇷 Tu as déjà un ticket ouvert. 🇩🇿 لديك تذكرة مفتوحة بالفعل.` });
    const pos = s.tickets.filter(isOpen).length + 1;
    const ch = await discord(`/guilds/${GUILD}/channels`, "POST", {
      name: `ticket-${slug(user.username)}`, type: 0, parent_id: s.cat,
      topic: `tv-ticket:${user.id}:${new Date().toISOString().slice(0, 16)}`,
      permission_overwrites: [
        { id: GUILD, type: 0, deny: P.VIEW.toString() },
        { id: user.id, type: 1, allow: MEMBER_ALLOW },
        { id: s.role, type: 0, allow: STAFF_ALLOW },
        { id: APP_ID, type: 1, allow: BOT_ALLOW },
      ],
    }, `Ticket opened by ${user.username}`) as Ch;
    await discord(`/channels/${ch.id}/messages`, "POST", welcome(user.id, s.role, pos));
    await reply(i.token, { content: `✅ Your ticket: <#${ch.id}> · you are **#${pos}** in line.\n🇫🇷 Ton ticket est ouvert. 🇩🇿 تم فتح تذكرتك.` });
    await discord(`/channels/${LOG_CHANNEL}/messages`, "POST", { content: `🎫 New ticket #${pos} in line: <#${ch.id}> by <@${user.id}>`, allowed_mentions: { parse: [] } }).catch(() => {});
  } catch (e) {
    console.error(e);
    await reply(i.token, { content: "⚠️ Sorry, the ticket could not be opened. Please try again in a minute." }).catch(() => {});
  }
}

// deno-lint-ignore no-explicit-any
async function closeTicket(i: any) {
  const c = i.channel as Ch; const by = i.member.user;
  try {
    const s = await setup();
    const t = s.tickets.find((x) => x.id === c.id);
    if (!t) return await reply(i.token, { content: "This is not a ticket channel." });
    if (!isOpen(t)) return await reply(i.token, { content: "This ticket is already closed." });
    if (ownerOf(t) !== by.id && !isStaff(i.member, s.role)) return await reply(i.token, { content: "Only the member or the support team can close this ticket." });
    const owner = ownerOf(t);
    if (owner) await discord(`/channels/${c.id}/permissions/${owner}`, "PUT", { type: 1, allow: bits(P.VIEW, P.HISTORY), deny: P.SEND.toString() }, "Ticket closed");
    await discord(`/channels/${c.id}`, "PATCH", { name: ("closed-" + t.name.replace(/^ticket-/, "")).slice(0, 100) }, `Ticket closed by ${by.username}`);
    await reply(i.token, {
      embeds: [{ color: GREY, description: `🔒 Ticket closed by <@${by.id}>. Thanks for your patience!\n🇫🇷 Ticket fermé. 🇩🇿 تم إغلاق التذكرة.` }],
      allowed_mentions: { parse: [] },
      components: [{ type: 1, components: [{ type: 2, style: 2, label: "Delete (staff)", emoji: { name: "🗑️" }, custom_id: "tv_delete" }] }],
    });
    await discord(`/channels/${LOG_CHANNEL}/messages`, "POST", { content: `🔒 Ticket closed: <#${c.id}> by <@${by.id}>`, allowed_mentions: { parse: [] } }).catch(() => {});
  } catch (e) {
    console.error(e);
    await reply(i.token, { content: "⚠️ Could not close the ticket, please try again." }).catch(() => {});
  }
}

// deno-lint-ignore no-explicit-any
async function deleteTicket(i: any) {
  const c = i.channel as Ch;
  try {
    const s = await setup();
    const t = s.tickets.find((x) => x.id === c.id);
    if (!t || isOpen(t)) return await reply(i.token, { content: "Close the ticket first." });
    if (!isStaff(i.member, s.role)) return await reply(i.token, { content: "Only the support team can delete tickets." });
    await reply(i.token, { content: "🗑️ Deleting this ticket in 5 seconds…" });
    await sleep(5000);
    await discord(`/channels/${c.id}`, "DELETE", undefined, `Ticket deleted by ${i.member.user.username}`);
    await discord(`/channels/${LOG_CHANNEL}/messages`, "POST", { content: `🗑️ Ticket ${t.name} deleted by <@${i.member.user.id}>`, allowed_mentions: { parse: [] } }).catch(() => {});
  } catch (e) {
    console.error(e);
    await reply(i.token, { content: "⚠️ Could not delete the ticket." }).catch(() => {});
  }
}

// deno-lint-ignore no-explicit-any
async function postPanel(i: any) {
  try {
    await discord(`/channels/${i.channel_id}/messages`, "POST", PANEL);
    await reply(i.token, { content: "✅ Ticket panel posted." });
  } catch (e) {
    console.error(e);
    await reply(i.token, { content: "⚠️ Could not post the panel here: check that the bot can see and write in this channel." }).catch(() => {});
  }
}

// register the /ticket-panel command once per cold start (bulk overwrite = idempotent)
let registered = false;
function registerCommands() {
  if (registered || !TOKEN) return;
  registered = true;
  bg(discord(`/applications/${APP_ID}/guilds/${GUILD}/commands`, "PUT", [
    { name: "ticket-panel", type: 1, description: "Post the TRADEVERSITY support ticket button in this channel", default_member_permissions: P.ADMIN.toString(), dm_permission: false },
  ]).catch((e) => { registered = false; console.error(e); }));
}

Deno.serve(async (req) => {
  if (req.method === "GET") return json({ ok: true, bot: "TRADEVERSITY Support", ready: !!TOKEN });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  const sig = req.headers.get("x-signature-ed25519") ?? "";
  const ts = req.headers.get("x-signature-timestamp") ?? "";
  const body = await req.text();
  let ok = false;
  try { ok = nacl.sign.detached.verify(new TextEncoder().encode(ts + body), hex(sig), hex(PUBLIC_KEY)); } catch (_) { ok = false; }
  if (!ok) return new Response("invalid request signature", { status: 401 });

  registerCommands();
  const i = JSON.parse(body);
  if (i.type === 1) return json({ type: 1 }); // PING
  if (i.guild_id !== GUILD) return json({ type: 4, data: { content: "This bot only works on the TRADEVERSITY server.", flags: EPHEMERAL } });

  if (i.type === 2 && i.data?.name === "ticket-panel") {
    bg(postPanel(i));
    return json({ type: 5, data: { flags: EPHEMERAL } });
  }
  if (i.type === 3) {
    const id = i.data?.custom_id;
    if (id === "tv_open") { bg(openTicket(i)); return json({ type: 5, data: { flags: EPHEMERAL } }); }
    if (id === "tv_close") { bg(closeTicket(i)); return json({ type: 5 }); }
    if (id === "tv_delete") { bg(deleteTicket(i)); return json({ type: 5, data: { flags: EPHEMERAL } }); }
  }
  return json({ type: 4, data: { content: "Unknown action.", flags: EPHEMERAL } });
});
