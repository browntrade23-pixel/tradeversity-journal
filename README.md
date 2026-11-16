# The Effective Journal — by Tradeversity
Founders: **BROWN ALGO** & **ZNTRADING**

A trading journal for your students: trades with screenshots and remarks, emotions, stats, tomorrow's plan, a risk calculator (NQ/MNQ, ES/MES, YM/MYM, GC/MGC), a consistency rule calculator, CSV import, free student accounts, and an admin dashboard for you.

Files:
- `index.html`: the whole website
- `schema.sql`: the database (logins, trades, plans, security)
- `notifications.sql`: Telegram messages to you on new sign-ups and new trades
- `approval.sql`: new students must be approved by the admin before they can use the journal
- `i18n.js`: English / Français / العربية translations (edit a translation there)
- `brand/`: the gold portrait logo (`logo-4k.png` for social media/print, smaller sizes for the site and browser tab)
- `scene/`: the night scene on the login page (moon and tree)

### Photo credits (public domain, free to use)
- Moon: NASA / GSFC / Arizona State University, Lunar Reconnaissance Orbiter — Wikimedia Commons "Moon nearside LRO.jpg"
- Tree: User:ShadowShift — Wikimedia Commons "Dead Tree Silhouette with Sunset.JPG"

## Links, social media and the Earn2Trade offer
Edit them in `index.html`, near the end of the script:
- `SOCIAL` — Students' results channel, Brown Algo Telegram channel, YouTube, Instagram, TikTok, Kick (shown top and bottom of the login screen and of the journal).
- `PROMO` — Earn2Trade partner link and coupon code (`BROWN23`, 60% off).

## Discipline rules (students)
- **2 trades max per day** (a 3rd trade breaks the discipline streak). New plans start with "Max number of trades = 2".
- **Goal: 5 disciplined trades in a row.** Counts: plan followed, win or respected loss (loss within about -1R). Resets: plan broken, stop ignored, or more than 2 trades in a day.
- The journal shows a coach card with the streak, today's trade count, reminders and a new Brown Algo quote on every visit. Change the rules in `DISC` and the quotes in `QUOTES` (index.html).
- The admin dashboard shows "Today's discipline": who journaled today, who planned today/tomorrow, 7-day consistency, streak, overtrading, with buttons to open each student's journal, plan and stats.

## USD news (Forex Factory)
`news.sql` makes the database download the Forex Factory weekly calendar every 3 hours and keep USD red-folder (High) and orange-folder (Medium) events. The plan page lists them for the planned day with New York and Algeria (DZ) times and a button to add them to the plan; the coach card reminds students of today's remaining news and the next session's news. Next week's events appear once Forex Factory publishes them (usually over the weekend).

### News tab and holidays
The **📰 News** tab (next to Journal and Statistics) shows a live countdown to the next red/orange USD event, tabs for Yesterday / Today / Tomorrow / This week, and the upcoming US bank holidays (markets closed, early close, or banks closed with low liquidity). Holidays come from the built-in list `US_HOL` in index.html (2026-2027, add later years there) plus Forex Factory "Holiday" events.

## About us and results
The login page and the **About us** tab show the numbers in `ABOUT` (index.html: years in the markets, number of students) and a link to the results channel. To show result screenshots, put the images in the `results/` folder and list the file names in `RESULTS`. They appear as a moving strip on the login page and a gallery in About us (click to enlarge).

## Telegram username is required
Sign-up refuses accounts without a valid Telegram username (@name, 5-32 letters/numbers/_), and the database enforces the same rule.

## Approving students
New sign-ups appear in **Admin dashboard → 🔔 Pending requests** (and you get a Telegram message). Click **✔ Approve** to let them in, or **✖ Reject**. Until then they only see a "Waiting for approval" screen, and the database refuses to show or save their data. Rejected requests can still be approved later from the "Rejected requests" list.

The site is connected to Supabase (see Current setup below). There is no demo mode: every account and trade is real.

## Current setup (already done)
- **Supabase project:** `tradeversity-journal` (organization *Tradeversity*, region West EU / Ireland). `schema.sql` and `notifications.sql` have been run.
- **index.html** is connected to `https://szovzzkukzuytkzieuae.supabase.co` with the public anon key.
- **Live site:** https://browntrade23-pixel.github.io/tradeversity-journal/ (GitHub Pages, from this repository's `main` branch). Send this link to students.
- **Supabase Site URL** is the live site. Allowed redirect URLs: the live site and `http://localhost:8080`.
- **Email confirmation** is on.
- **Telegram alerts** go to @tradeversity_alerts_bot (bot token and chat id are in Supabase Vault).
- **Run it on your PC (optional):** double-click `Start Journal.bat`. It opens http://localhost:8080. Keep its window open while you use it.
- **Update the live site:** change the files, commit and push to `main`. GitHub Pages republishes in about a minute.

## Telegram notifications
1. In Telegram, message **@BotFather** → `/newbot` → pick a name. Copy the token it gives you.
2. Send any message to your new bot (so it's allowed to message you).
3. Message **@userinfobot** to get your numeric chat id.
4. In Supabase → **Project Settings → Vault** (or Integrations → Vault) → **Add new secret**:
   - name `telegram_bot_token`, value = the BotFather token
   - name `telegram_chat_id`, value = your chat id
5. Test in SQL Editor:
   ```sql
   select public.notify_telegram('Tradeversity notifications are working');
   ```
Keep the bot token private. If it leaks, use `/revoke` in @BotFather and update the Vault secret.

## Go live in about 15 minutes (free)

### 1. Create the backend (Supabase)
1. Go to https://supabase.com and create a free account, then a **New project** (choose the EU region, which is closest to Algeria).
2. Open **SQL Editor** → **New query**, paste all of `schema.sql`, and click **Run**.
3. Open **Project Settings → API** and copy the **Project URL** and the **anon public** key.

### 2. Connect the website
Open `index.html` in any text editor and fill in the top of the script:
```js
const CONFIG = {
  SUPABASE_URL: "https://xxxx.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOi..."
};
```
The anon key is meant to be public. The security comes from the rules in `schema.sql`.

### 3. Put it online
- The easiest way is https://app.netlify.com/drop: drag the folder with `index.html` onto the page and you get a link right away. You can connect your own domain later (for example journal.tradeversity.com).
- Back in Supabase → **Authentication → URL Configuration**, set **Site URL** to your new link. This makes confirmation and password-reset emails point to your site.

### 4. Make yourself the admin
1. Open your site and **create an account** with your own email.
2. In Supabase → SQL Editor, run (with your email):
   ```sql
   update public.profiles set role = 'admin' where email = 'YOUR_EMAIL_HERE';
   ```
3. Log out and back in. You'll see the **👑 Admin dashboard** tab.

### 5. Share with students
Send them the link. They sign up for free with name, email, Telegram username and password. Each student sees only their own data, and you see everyone's (read-only).

## Good to know
- **Confirmation emails:** Supabase's free built-in email sender is limited to a few emails per hour. If many students sign up at once, either turn off **Confirm email** (Authentication → Providers → Email) or add a free SMTP sender such as Brevo or Resend under Authentication → SMTP.
- **Free plan:** Supabase pauses free projects that get no activity for about a week. Any visit wakes it up, or you can upgrade later.
- **Screenshots** are compressed (about 150 KB each, up to 3 per trade) and stored with the trade.
- **CSV import** detects columns automatically for Tradovate, NinjaTrader, Rithmic and TradingView exports. You can fix the column matching before importing.
