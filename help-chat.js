/* TRADEVERSITY assistant inside the app: a round chat button (bottom corner) that opens the help-center AI
   (server function "help-ai", Google Gemini) in a panel, with a link to the support team.
   - The button appears only when the assistant is switched on (checked once per visit, no AI call).
   - The chat lives in this tab only; the last 6 messages go with each question so it keeps the thread.
   - Answers are shown as plain text (no HTML can run). Nothing is stored by us.
   Self-contained: own styles and EN/FR/AR strings; follows the app language (I18N.lang / <html lang>). */
(function () {
  if (window.__tvHelpChat) return; window.__tvHelpChat = true;
  var SB = "https://szovzzkukzuytkzieuae.supabase.co";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6b3Z6emt1a3p1eXRremlldWFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQ3ODIyMTgsImV4cCI6MjExMDM1ODIxOH0.hEcb4PhOIrKOZiwvMG6YQQHdR2zr1AhHOHmWeCSKJG0"; /* public anon key (same as the app) */
  var FN = SB + "/functions/v1/help-ai", H = { apikey: KEY, Authorization: "Bearer " + KEY };
  var S = {
    en: { btn: "Ask the assistant", title: "TRADEVERSITY assistant", sub: "Answers any time from the help center", ph: "Type your question…", send: "Ask", close: "Close",
      hi: "Hi! Ask me about your account, Telegram verification, the Mentorship course, the Cerebra app or the journal.",
      note: "AI answers can be wrong. Don't type passwords, codes or personal details: your question is sent to Google Gemini to write the answer.",
      team: "Contact the support team", wait: "The assistant is writing…", limit: "You asked many questions today. Please contact the support team.",
      busy: "The assistant is busy. Try again in a minute.", off: "The assistant isn't available right now. Please contact the support team.", short: "Write your question (at least 2 characters)." },
    fr: { btn: "Demander à l'assistant", title: "Assistant TRADEVERSITY", sub: "Réponses à toute heure, depuis le centre d'aide", ph: "Tapez votre question…", send: "Demander", close: "Fermer",
      hi: "Bonjour ! Posez-moi vos questions sur votre compte, la vérification Telegram, la formation Mentorship, l'application Cerebra ou le journal.",
      note: "Les réponses de l'IA peuvent être fausses. N'écrivez ni mot de passe, ni code, ni informations personnelles : votre question est envoyée à Google Gemini pour écrire la réponse.",
      team: "Contacter l'équipe support", wait: "L'assistant écrit…", limit: "Vous avez posé beaucoup de questions aujourd'hui. Contactez l'équipe support.",
      busy: "L'assistant est occupé. Réessayez dans une minute.", off: "L'assistant n'est pas disponible pour le moment. Contactez l'équipe support.", short: "Écrivez votre question (au moins 2 caractères)." },
    ar: { btn: "اسأل المساعد", title: "مساعد TRADEVERSITY", sub: "إجابات في أي وقت من مركز المساعدة", ph: "اكتب سؤالك…", send: "اسأل", close: "إغلاق",
      hi: "مرحباً! اسألني عن حسابك، أو التحقق عبر تيليغرام، أو دورة الإرشاد، أو تطبيق Cerebra، أو دفتر التداول.",
      note: "قد تخطئ إجابات الذكاء الاصطناعي. لا تكتب كلمة مرور أو رمزاً أو معلومات شخصية: يُرسل سؤالك إلى Google Gemini لكتابة الإجابة.",
      team: "تواصل مع فريق الدعم", wait: "المساعد يكتب…", limit: "طرحت أسئلة كثيرة اليوم. تواصل مع فريق الدعم.",
      busy: "المساعد مشغول. أعد المحاولة بعد دقيقة.", off: "المساعد غير متاح حالياً. تواصل مع فريق الدعم.", short: "اكتب سؤالك (حرفان على الأقل)." }
  };
  function lang() { var l = (window.I18N && I18N.lang) || document.documentElement.lang || ""; try { l = l || localStorage.getItem("tvj_lang") || ""; } catch (e) {} l = String(l).slice(0, 2); return S[l] ? l : "en"; }
  function t(k) { return S[lang()][k] || S.en[k]; }

  var css = "#tvAiBtn{position:fixed;right:20px;bottom:20px;z-index:46;width:56px;height:56px;border-radius:50%;border:1px solid rgba(255,255,255,.18);cursor:pointer;display:grid;place-items:center;" +
    "background:linear-gradient(160deg,#3b82f6,#1d4ed8);color:#fff;box-shadow:0 12px 30px -8px rgba(37,99,235,.8);transition:transform .2s}" +
    "#tvAiBtn:hover{transform:translateY(-2px)}#tvAiBtn svg{width:26px;height:26px}#tvAiBtn[hidden]{display:none}" +
    "html[dir=rtl] #tvAiBtn{right:auto;left:20px}" +
    "@media(max-width:820px){#tvAiBtn{right:auto;left:16px;bottom:calc(78px + env(safe-area-inset-bottom));width:52px;height:52px}html[dir=rtl] #tvAiBtn{left:auto;right:16px}}" +
    "html.player #tvAiBtn,body:has(.modal:not(.hidden)) #tvAiBtn,body:has(#bnSheet.open) #tvAiBtn,body.tvai-open #tvAiBtn{display:none!important}" +
    "#tvAi{position:fixed;right:20px;bottom:20px;z-index:1000;width:min(400px,calc(100vw - 24px));height:min(600px,calc(100vh - 40px));display:flex;flex-direction:column;" +
    "background:rgba(14,16,24,.97);border:1px solid rgba(255,255,255,.14);border-radius:20px;box-shadow:0 30px 80px -20px rgba(0,0,0,.9);color:#f5f7fa;font:14.5px/1.5 Geist,Inter,system-ui,sans-serif;overflow:hidden}" +
    "html[dir=rtl] #tvAi{right:auto;left:20px}#tvAi[hidden]{display:none}" +
    "@media(max-width:600px){#tvAi{right:0!important;left:0!important;bottom:0;width:100%;height:min(86vh,calc(100vh - 20px));border-radius:20px 20px 0 0;padding-bottom:env(safe-area-inset-bottom)}}" +
    "#tvAi .ai-hd{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;border-bottom:1px solid rgba(255,255,255,.08)}" +
    "#tvAi .ai-av{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(160deg,#3b82f6,#1d4ed8);flex:none}#tvAi .ai-av svg{width:20px;height:20px}" +
    "#tvAi .ai-tt{flex:1;min-width:0}#tvAi .ai-tt b{display:block;font-size:15px}#tvAi .ai-tt small{color:#a7adbf;font-size:12px}" +
    "#tvAi .ai-x{border:0;background:rgba(255,255,255,.08);color:#f5f7fa;width:34px;height:34px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1}" +
    "#tvAi .ai-log{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:8px}" +
    "#tvAi .bub{padding:10px 13px;border-radius:14px;white-space:pre-wrap;word-break:break-word;max-width:88%}" +
    "#tvAi .bub.me{align-self:flex-end;background:rgba(59,130,246,.22);border:1px solid rgba(59,130,246,.45)}" +
    "#tvAi .bub.ai{align-self:flex-start;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}" +
    "#tvAi .bub.err{border-color:rgba(255,107,107,.5);color:#ffd2d2}#tvAi .bub.wait{color:#a7adbf}" +
    "#tvAi .ai-ft{padding:10px 12px 12px;border-top:1px solid rgba(255,255,255,.08)}" +
    "#tvAi form{display:flex;gap:8px;align-items:flex-end}" +
    "#tvAi textarea{flex:1;min-width:0;resize:none;min-height:44px;max-height:120px;padding:10px 12px;border-radius:12px;border:1px solid rgba(255,255,255,.14);background:rgba(0,0,0,.35);color:#f5f7fa;font:inherit;font-size:16px}" +
    "#tvAi textarea:focus{outline:2px solid #3b82f6;outline-offset:1px}" +
    "#tvAi .ai-go{border:0;border-radius:12px;padding:11px 16px;font:inherit;font-weight:700;cursor:pointer;background:#f5f6f8;color:#0d1020}#tvAi .ai-go:disabled{opacity:.55;cursor:wait}" +
    "#tvAi .ai-note{margin:8px 2px 0;font-size:11.5px;color:#8b90a0;line-height:1.4}" +
    "#tvAi .ai-team{display:block;margin-top:8px;text-align:center;font-size:13px;color:#9ec3ff}";
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/></svg>';

  var btn, panel, log, ta, go, hist = [], greeted = false;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function bub(cls, text) { var d = el("div", "bub " + cls, text); d.dir = "auto"; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function labels() {
    if (btn) { btn.setAttribute("aria-label", t("btn")); btn.title = t("btn"); }
    if (!panel) return;
    panel.setAttribute("aria-label", t("title"));
    panel.querySelector(".ai-tt b").textContent = t("title"); panel.querySelector(".ai-tt small").textContent = t("sub");
    panel.querySelector(".ai-x").setAttribute("aria-label", t("close")); ta.placeholder = t("ph"); ta.setAttribute("aria-label", t("ph"));
    go.textContent = t("send"); panel.querySelector(".ai-note").textContent = t("note"); panel.querySelector(".ai-team").textContent = t("team");
  }
  function build() {
    panel = el("section"); panel.id = "tvAi"; panel.hidden = true; panel.setAttribute("role", "dialog"); panel.setAttribute("data-notr", "");
    panel.innerHTML = '<div class="ai-hd"><span class="ai-av">' + ICON + '</span><span class="ai-tt"><b></b><small></small></span><button type="button" class="ai-x">✕</button></div>' +
      '<div class="ai-log" aria-live="polite"></div><div class="ai-ft"><form novalidate><textarea rows="1" maxlength="600" dir="auto"></textarea><button class="ai-go" type="submit"></button></form>' +
      '<p class="ai-note"></p><a class="ai-team" href="support.html#contact" target="_blank" rel="noopener"></a></div>';
    document.body.appendChild(panel);
    log = panel.querySelector(".ai-log"); ta = panel.querySelector("textarea"); go = panel.querySelector(".ai-go");
    panel.querySelector(".ai-x").onclick = close;
    panel.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    ta.addEventListener("input", function () { ta.style.height = "auto"; ta.style.height = Math.min(120, ta.scrollHeight) + "px"; });
    ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); panel.querySelector("form").requestSubmit(); } });
    panel.querySelector("form").addEventListener("submit", function (e) {
      e.preventDefault(); var q = ta.value.replace(/\s+/g, " ").trim();
      if (q.length < 2) { bub("ai err", t("short")); return; }
      bub("me", q); ta.value = ""; ta.style.height = "auto"; go.disabled = true; var w = bub("ai wait", t("wait"));
      fetch(FN, { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, H), body: JSON.stringify({ q: q.slice(0, 600), lang: lang(), history: hist.slice(-6) }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (j) { w.remove();
          if (j && j.answer) { bub("ai", j.answer); hist.push({ role: "user", text: q }, { role: "ai", text: j.answer }); hist = hist.slice(-6); }
          else bub("ai err", t(j && j.error === "limit" ? "limit" : j && j.error === "busy" ? "busy" : j && j.error === "len" ? "short" : "off")); })
        .catch(function () { w.remove(); bub("ai err", t("busy")); })
        .then(function () { go.disabled = false; ta.focus(); });
    });
    labels();
  }
  function open() {
    if (!panel) build(); labels();
    if (!greeted) { bub("ai", t("hi")); greeted = true; }
    panel.hidden = false; document.body.classList.add("tvai-open"); setTimeout(function () { ta.focus(); }, 50);
  }
  function close() { if (panel) panel.hidden = true; document.body.classList.remove("tvai-open"); if (btn) btn.focus(); }
  window.TVHelpChat = { open: open, close: close };

  function start() {
    var st = el("style"); st.textContent = css; document.head.appendChild(st);
    btn = el("button"); btn.id = "tvAiBtn"; btn.type = "button"; btn.setAttribute("data-notr", ""); btn.hidden = true; btn.innerHTML = ICON; btn.onclick = open; document.body.appendChild(btn); labels();
    /* follow language changes of the app */
    new MutationObserver(labels).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    var cached = null; try { cached = sessionStorage.getItem("tv_ai_on"); } catch (e) {}
    if (cached === "1") { btn.hidden = false; return; }
    if (cached === "0") return;
    fetch(FN, { headers: H }).then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { var on = !!(j && j.ok); try { sessionStorage.setItem("tv_ai_on", on ? "1" : "0"); } catch (e) {} if (on) btn.hidden = false; })
      .catch(function () {});
  }
  var go2 = function () { ("requestIdleCallback" in window) ? requestIdleCallback(start, { timeout: 4000 }) : setTimeout(start, 1500); };
  document.readyState === "complete" ? go2() : addEventListener("load", go2, { once: true });
})();
