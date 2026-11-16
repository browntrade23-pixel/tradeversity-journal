/* =====================================================================
   Tradeversity Journal — languages (English / Français / العربية)
   The app is written in English. This file translates what is on screen,
   so saved data (sides, emotions, plans…) always stays in English.
   To fix a translation: find the English text below and edit the
   French ["fr"] or Arabic ["ar"] value.
   ===================================================================== */
(function(){
const LANGS={en:{label:"English",locale:"en-US",dir:"ltr"},fr:{label:"Français",locale:"fr-FR",dir:"ltr"},ar:{label:"العربية",locale:"ar-u-nu-latn",dir:"rtl"}};

/* exact text  →  [French, Arabic] */
const T={
// auth
"Log in":["Se connecter","تسجيل الدخول"],
"Create free account":["Créer un compte gratuit","إنشاء حساب مجاني"],
"Email":["E-mail","البريد الإلكتروني"],
"Password":["Mot de passe","كلمة المرور"],
"Forgot password?":["Mot de passe oublié ?","نسيت كلمة المرور؟"],
"Full name":["Nom complet","الاسم الكامل"],
"Telegram username":["Nom d'utilisateur Telegram","اسم المستخدم في تيليغرام"],
"Confirm password":["Confirmer le mot de passe","تأكيد كلمة المرور"],
"Create my free account":["Créer mon compte gratuit","إنشاء حسابي المجاني"],
"Demo mode.":["Mode démo.","وضع تجريبي."],
"No backend connected yet, so data stays in this browser and passwords aren't checked. Try it:":["Aucun serveur connecté : les données restent dans ce navigateur et les mots de passe ne sont pas vérifiés. Essayez :","لا يوجد خادم متصل بعد، لذلك تبقى البيانات في هذا المتصفح ولا يتم التحقق من كلمات المرور. جرّب:"],
"Enter as a student":["Entrer comme élève","الدخول كطالب"],
"Enter as admin (Brown Algo)":["Entrer comme admin (Brown Algo)","الدخول كمشرف (Brown Algo)"],
"Made by Brown Algo · Tradeversity — for my students":["Créé par Brown Algo · Tradeversity — pour mes élèves","من إعداد Brown Algo · Tradeversity — لطلابي"],
"Log out":["Se déconnecter","تسجيل الخروج"],
"Logging in…":["Connexion…","جارٍ تسجيل الدخول…"],
"Creating your account…":["Création de votre compte…","جارٍ إنشاء حسابك…"],
"Passwords don't match.":["Les mots de passe ne correspondent pas.","كلمتا المرور غير متطابقتين."],
"Account created. Check your email to confirm it, then log in.":["Compte créé. Vérifiez votre e-mail pour le confirmer, puis connectez-vous.","تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيده، ثم سجّل الدخول."],
"Type your email above first.":["Saisissez d'abord votre e-mail ci-dessus.","اكتب بريدك الإلكتروني في الأعلى أولاً."],
"Reset link sent — check your email.":["Lien de réinitialisation envoyé — vérifiez votre e-mail.","تم إرسال رابط إعادة التعيين — تحقق من بريدك الإلكتروني."],
"Set a new password":["Définir un nouveau mot de passe","تعيين كلمة مرور جديدة"],
"New password":["Nouveau mot de passe","كلمة المرور الجديدة"],
"Save password":["Enregistrer le mot de passe","حفظ كلمة المرور"],
"Password updated":["Mot de passe mis à jour","تم تحديث كلمة المرور"],
"Invalid login credentials":["E-mail ou mot de passe incorrect","البريد الإلكتروني أو كلمة المرور غير صحيحة"],
"Email not confirmed":["E-mail non confirmé — cliquez sur le lien reçu par e-mail","البريد الإلكتروني غير مؤكد — اضغط على الرابط في رسالتك"],
"User already registered":["Un compte existe déjà avec cet e-mail","يوجد حساب بهذا البريد الإلكتروني مسبقاً"],
"Password should be at least 6 characters.":["Le mot de passe doit contenir au moins 6 caractères.","يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."],
"Password reset works once Supabase is connected.":["La réinitialisation fonctionne une fois Supabase connecté.","تعمل إعادة التعيين بعد ربط Supabase."],
// nav
"📓 Journal":["📓 Journal","📓 اليومية"],
"📊 Statistics":["📊 Statistiques","📊 الإحصائيات"],
"🧭 Tomorrow's plan":["🧭 Plan de demain","🧭 خطة الغد"],
"🎯 Risk calculator":["🎯 Calculateur de risque","🎯 حاسبة المخاطرة"],
"⚖️ Consistency rule":["⚖️ Règle de consistance","⚖️ قاعدة الثبات"],
"⬆️ Import CSV":["⬆️ Importer CSV","⬆️ استيراد CSV"],
"👑 Admin dashboard":["👑 Tableau de bord admin","👑 لوحة المشرف"],
"👀 Viewing":["👀 Consultation de","👀 عرض"],
"← Back to admin":["← Retour à l'admin","→ العودة إلى لوحة المشرف"],
// filters
"All accounts":["Tous les comptes","كل الحسابات"],
"All":["Tout","الكل"],
// journal
"Trading journal":["Journal de trading","يومية التداول"],
"Your trades, screenshots, feelings and lessons.":["Vos trades, captures, ressentis et leçons.","صفقاتك ولقطات الشاشة ومشاعرك ودروسك."],
"Student's trades, screenshots, feelings and lessons.":["Trades, captures, ressentis et leçons de l'élève.","صفقات الطالب ولقطات الشاشة ومشاعره ودروسه."],
"+ New trade":["+ Nouveau trade","+ صفقة جديدة"],
"Export CSV":["Exporter CSV","تصدير CSV"],
"Net P&L":["P&L net","صافي الربح/الخسارة"],
"Win rate":["Taux de réussite","نسبة الربح"],
"Profit factor":["Profit factor","معامل الربح"],
"Avg R":["R moyen","متوسط R"],
"gross win ÷ gross loss":["gains bruts ÷ pertes brutes","إجمالي الأرباح ÷ إجمالي الخسائر"],
"from trades with a stop":["sur les trades avec un stop","من الصفقات التي لها وقف خسارة"],
"No trades yet.":["Aucun trade pour l'instant.","لا توجد صفقات بعد."],
"No trades yet. Add your first trade or import a CSV from your broker.":["Aucun trade pour l'instant. Ajoutez votre premier trade ou importez un CSV de votre broker.","لا توجد صفقات بعد. أضف صفقتك الأولى أو استورد ملف CSV من وسيطك."],
"no image":["pas d'image","لا صورة"],
"▲ Long":["▲ Achat","▲ شراء"],
"▼ Short":["▼ Vente","▼ بيع"],
"Long":["Achat","شراء"],
"Short":["Vente","بيع"],
"Win":["Gain","ربح"],
"Loss":["Perte","خسارة"],
"BE":["BE","تعادل"],
"← Journal":["← Journal","→ اليومية"],
"Edit":["Modifier","تعديل"],
"Delete":["Supprimer","حذف"],
"No screenshot":["Pas de capture","لا توجد لقطة شاشة"],
"Result":["Résultat","النتيجة"],
"Contracts":["Contrats","العقود"],
"Entry / Exit":["Entrée / Sortie","الدخول / الخروج"],
"Stop / Target":["Stop / Objectif","الوقف / الهدف"],
"Risk":["Risque","المخاطرة"],
"Gross / Fees / Net":["Brut / Frais / Net","الإجمالي / الرسوم / الصافي"],
"Setup":["Setup","النموذج"],
"Session":["Session","الجلسة"],
"Followed plan":["Plan respecté","التزم بالخطة"],
"Broke plan":["Plan non respecté","خالف الخطة"],
"Execution rating":["Note d'exécution","تقييم التنفيذ"],
"Emotions":["Émotions","المشاعر"],
"How I felt":["Mon ressenti","كيف شعرت"],
"Journal & lessons":["Journal & leçons","اليومية والدروس"],
"✔ Yes":["✔ Oui","✔ نعم"],
"✖ No":["✖ Non","✖ لا"],
"Delete this trade? This can't be undone.":["Supprimer ce trade ? Action irréversible.","حذف هذه الصفقة؟ لا يمكن التراجع عن ذلك."],
"Trade deleted":["Trade supprimé","تم حذف الصفقة"],
"Cancel":["Annuler","إلغاء"],
"Yes":["Oui","نعم"],
"No":["Non","لا"],
"Partly":["En partie","جزئياً"],
// trade form
"New trade":["Nouveau trade","صفقة جديدة"],
"Edit trade":["Modifier le trade","تعديل الصفقة"],
"Date":["Date","التاريخ"],
"Time":["Heure","الوقت"],
"Account":["Compte","الحساب"],
"Instrument":["Instrument","الأداة"],
"Direction":["Direction","الاتجاه"],
"Entry price":["Prix d'entrée","سعر الدخول"],
"Exit price":["Prix de sortie","سعر الخروج"],
"Stop loss":["Stop loss","وقف الخسارة"],
"Target":["Objectif","الهدف"],
"P&L $ (optional)":["P&L $ (optionnel)","الربح/الخسارة $ (اختياري)"],
"Fees $":["Frais $","الرسوم $"],
"auto from prices":["calculé depuis les prix","تلقائي من الأسعار"],
"Setup / model":["Setup / modèle","النموذج / الإعداد"],
"Followed my plan?":["Plan respecté ?","هل التزمت بخطتي؟"],
"Emotions while trading":["Émotions pendant le trade","المشاعر أثناء التداول"],
"How did you feel? (before, during, after)":["Comment vous sentiez-vous ? (avant, pendant, après)","كيف شعرت؟ (قبل، أثناء، بعد)"],
"Screenshots (up to 3) — tap to upload, or paste with Ctrl+V":["Captures (jusqu'à 3) — touchez pour envoyer, ou collez avec Ctrl+V","لقطات الشاشة (حتى 3) — اضغط للرفع أو الصق بـ Ctrl+V"],
"📷 Add screenshot":["📷 Ajouter une capture","📷 إضافة لقطة شاشة"],
"Remark below the screenshot":["Remarque sous la capture","ملاحظة تحت اللقطة"],
"e.g. Entry at the 15m FVG after the sweep of PDL":["ex. Entrée sur le FVG 15m après le sweep du PDL","مثال: دخول عند FVG على 15د بعد سحب PDL"],
"What did I see? What did I do well? What will I do differently?":["Qu'ai-je vu ? Qu'ai-je bien fait ? Que ferai-je différemment ?","ماذا رأيت؟ ماذا فعلت جيداً؟ ماذا سأفعل بشكل مختلف؟"],
"Save trade":["Enregistrer le trade","حفظ الصفقة"],
"Trade saved":["Trade enregistré","تم حفظ الصفقة"],
"R multiple":["Multiple R","مضاعف R"],
"Couldn't read that image":["Impossible de lire cette image","تعذّرت قراءة هذه الصورة"],
"Browser storage is full — remove some screenshots.":["Stockage du navigateur plein — supprimez des captures.","مساحة المتصفح ممتلئة — احذف بعض اللقطات."],
// emotions
"Calm":["Calme","هادئ"],"Confident":["Confiant","واثق"],"Disciplined":["Discipliné","منضبط"],"Patient":["Patient","صبور"],"Focused":["Concentré","مركّز"],
"FOMO":["FOMO","الخوف من الفوات"],"Fear":["Peur","خوف"],"Greed":["Avidité","طمع"],"Revenge":["Revanche","انتقام"],"Impatient":["Impatient","متسرّع"],
"Hesitant":["Hésitant","متردد"],"Overconfident":["Trop confiant","ثقة زائدة"],"Bored":["Ennui","ملل"],"Frustrated":["Frustré","محبط"],
// stats
"Statistics":["Statistiques","الإحصائيات"],
"Expectancy":["Espérance","التوقع"],
"average per trade":["moyenne par trade","المتوسط لكل صفقة"],
"above 1.5 is solid":["au-dessus de 1,5 c'est solide","أكثر من 1.5 جيد"],
"Avg win / loss":["Gain / perte moyen","متوسط الربح / الخسارة"],
"Max drawdown":["Drawdown max","أقصى تراجع"],
"peak to trough":["du sommet au creux","من القمة إلى القاع"],
"Best / worst day":["Meilleur / pire jour","أفضل / أسوأ يوم"],
"Streaks":["Séries","السلاسل"],
"longest win / loss streak":["plus longue série gagnante / perdante","أطول سلسلة ربح / خسارة"],
"What your journal says":["Ce que dit votre journal","ماذا تقول يوميتك"],
"Equity curve":["Courbe d'équité","منحنى رأس المال"],
"Daily P&L":["P&L journalier","الربح/الخسارة اليومي"],
"Calendar":["Calendrier","التقويم"],
"By emotion":["Par émotion","حسب الشعور"],
"By setup":["Par setup","حسب النموذج"],
"By instrument":["Par instrument","حسب الأداة"],
"By session":["Par session","حسب الجلسة"],
"By weekday":["Par jour de la semaine","حسب يوم الأسبوع"],
"Plan discipline":["Discipline du plan","الالتزام بالخطة"],
"By account":["Par compte","حسب الحساب"],
"Long vs short":["Achat vs vente","شراء مقابل بيع"],
"Trades":["Trades","الصفقات"],
"Win %":["% gagnant","% الربح"],
"No data":["Aucune donnée","لا توجد بيانات"],
"Trades with":["Les trades avec","الصفقات مع"],
"cost you":["vous ont coûté","كلّفتك"],
"Following your plan:":["En suivant votre plan :","عند الالتزام بخطتك:"],
"Best setup:":["Meilleur setup :","أفضل نموذج:"],
"Sun":["Dim","الأحد"],"Mon":["Lun","الاثنين"],"Tue":["Mar","الثلاثاء"],"Wed":["Mer","الأربعاء"],"Thu":["Jeu","الخميس"],"Fri":["Ven","الجمعة"],"Sat":["Sam","السبت"],
// plan
"Trading plan":["Plan de trading","خطة التداول"],
"Plan tomorrow tonight. Execute it tomorrow, then review it.":["Planifiez demain dès ce soir. Exécutez demain, puis faites le bilan.","خطط للغد الليلة. نفّذ غداً، ثم راجع."],
"Past plans…":["Plans précédents…","الخطط السابقة…"],
"Max daily loss $":["Perte max journalière $","أقصى خسارة يومية $"],
"Daily profit target $":["Objectif de gain journalier $","هدف الربح اليومي $"],
"Max number of trades":["Nombre max de trades","أقصى عدد للصفقات"],
"Risk per trade $":["Risque par trade $","المخاطرة لكل صفقة $"],
"e.g. 300":["ex. 300","مثال: 300"],"e.g. 600":["ex. 600","مثال: 600"],"e.g. 3":["ex. 3","مثال: 3"],"e.g. 150":["ex. 150","مثال: 150"],
"→ You can take":["→ Vous pouvez encaisser","← يمكنك تحمّل"],
"full losses before you stop for the day.":["pertes complètes avant d'arrêter pour la journée.","خسائر كاملة قبل أن تتوقف لهذا اليوم."],
"Directional bias":["Biais directionnel","الاتجاه المتوقع"],
"▲ Bullish":["▲ Haussier","▲ صاعد"],"Neutral":["Neutre","محايد"],"▼ Bearish":["▼ Baissier","▼ هابط"],
"Gold":["Or","الذهب"],
"HTF narrative (Daily / 1H) & draw on liquidity":["Narratif HTF (Daily / 1H) & cible de liquidité","سرد الإطار الأعلى (يومي / ساعة) وهدف السيولة"],
"Key levels (PDH, PDL, FVGs, opens…)":["Niveaux clés (PDH, PDL, FVG, ouvertures…)","المستويات الرئيسية (PDH، PDL، FVG، الافتتاحات…)"],
"News & events":["News & événements","الأخبار والأحداث"],
"Time · event · impact":["Heure · événement · impact","الوقت · الحدث · التأثير"],
"Entry model / A+ setup I'm waiting for":["Modèle d'entrée / setup A+ que j'attends","نموذج الدخول / إعداد A+ الذي أنتظره"],
"I will NOT trade if…":["Je ne traderai PAS si…","لن أتداول إذا…"],
"Mindset / goal for the day":["État d'esprit / objectif du jour","العقلية / هدف اليوم"],
"Pre-trade checklist":["Checklist avant trade","قائمة التحقق قبل التداول"],
"Daily bias defined":["Biais journalier défini","تم تحديد الاتجاه اليومي"],
"1H imbalance marked":["Déséquilibre 1H marqué","تم تحديد عدم التوازن على الساعة"],
"15m entry confirmation only":["Entrée uniquement sur confirmation 15m","الدخول فقط بعد تأكيد 15 دقيقة"],
"Stop loss before entry":["Stop loss avant l'entrée","وقف الخسارة قبل الدخول"],
"Max loss respected":["Perte max respectée","تم احترام أقصى خسارة"],
"No trading during red news":["Pas de trading pendant les news rouges","لا تداول أثناء الأخبار الحمراء"],
"End-of-day review":["Bilan de fin de journée","مراجعة نهاية اليوم"],
"Day P&L (journal)":["P&L du jour (journal)","ربح/خسارة اليوم (اليومية)"],
"Max loss":["Perte max","أقصى خسارة"],
"Trade count":["Nombre de trades","عدد الصفقات"],
"⏳ No trades yet":["⏳ Aucun trade","⏳ لا صفقات بعد"],
"✖ Max loss hit":["✖ Perte max atteinte","✖ تم بلوغ أقصى خسارة"],
"✔ Respected":["✔ Respecté","✔ تم الالتزام"],
"Did I follow my plan?":["Ai-je suivi mon plan ?","هل التزمت بخطتي؟"],
"Review note":["Note de bilan","ملاحظة المراجعة"],
"What went right / wrong?":["Qu'est-ce qui a marché / pas marché ?","ما الذي نجح / فشل؟"],
"Save plan":["Enregistrer le plan","حفظ الخطة"],
"Plan saved":["Plan enregistré","تم حفظ الخطة"],
// risk
"Risk calculator":["Calculateur de risque","حاسبة المخاطرة"],
"How many contracts can I take for this stop? Every market is different, so the calculator uses each one's dollar value per point.":["Combien de contrats puis-je prendre pour ce stop ? Chaque marché est différent, le calculateur utilise la valeur en dollars par point de chacun.","كم عقداً يمكنني أخذه لهذا الوقف؟ كل سوق مختلف، لذلك تستخدم الحاسبة قيمة النقطة بالدولار لكل سوق."],
"Market":["Marché","السوق"],
"Account balance $":["Solde du compte $","رصيد الحساب $"],
"Risk per trade":["Risque par trade","المخاطرة لكل صفقة"],
"Points":["Points","نقاط"],
"Ticks":["Ticks","تيكات"],
"Entry & stop price":["Prix d'entrée & de stop","سعر الدخول والوقف"],
"Stop price":["Prix du stop","سعر الوقف"],
"Stop size in points":["Taille du stop en points","حجم الوقف بالنقاط"],
"Stop size in ticks":["Taille du stop en ticks","حجم الوقف بالتيكات"],
"Reward : risk (target)":["Ratio gain : risque (objectif)","العائد : المخاطرة (الهدف)"],
"Fees per contract (round trip) $":["Frais par contrat (aller-retour) $","الرسوم لكل عقد (ذهاباً وإياباً) $"],
"optional":["optionnel","اختياري"],
"Contract specs":["Spécifications des contrats","مواصفات العقود"],
"Symbol":["Symbole","الرمز"],
"Contract":["Contrat","العقد"],
"$ / point":["$ / point","$ / نقطة"],
"Tick":["Tick","التيك"],
"$ / tick":["$ / tick","$ / تيك"],
"10 micros =":["10 micros =","10 مايكرو ="],
"Specs are the CME standard contracts. Check your prop firm's contract limits and fees.":["Spécifications des contrats standard CME. Vérifiez les limites et frais de votre prop firm.","المواصفات لعقود CME القياسية. تحقق من حدود العقود والرسوم لدى شركة التمويل."],
"Enter your risk and stop size.":["Saisissez votre risque et la taille du stop.","أدخل المخاطرة وحجم الوقف."],
"Max risk":["Risque max","أقصى مخاطرة"],
"Stop:":["Stop :","الوقف:"],
"Best mix (closest to your risk)":["Meilleur mix (le plus proche de votre risque)","أفضل مزيج (الأقرب لمخاطرتك)"],
// consistency
"Consistency rule calculator":["Calculateur de règle de consistance","حاسبة قاعدة الثبات"],
"Most prop firms say your best day can't be more than":["La plupart des prop firms imposent que votre meilleur jour ne dépasse pas","معظم شركات التمويل تشترط ألا يتجاوز أفضل يوم لديك"],
"of your total profit. This shows how much you can make per day and how much more you need.":["de votre profit total. Voici combien vous pouvez gagner par jour et combien il vous manque.","من إجمالي ربحك. هذا يوضح كم يمكنك أن تربح يومياً وكم تحتاج بعد."],
"Account size $":["Taille du compte $","حجم الحساب $"],
"Profit target $":["Objectif de profit $","هدف الربح $"],
"Consistency rule %":["Règle de consistance %","قاعدة الثبات %"],
"Total profit so far $":["Profit total à ce jour $","إجمالي الربح حتى الآن $"],
"Best day so far $":["Meilleur jour à ce jour $","أفضل يوم حتى الآن $"],
"Fill from my journal":["Remplir depuis mon journal","املأ من يوميتي"],
"Filled from journal":["Rempli depuis le journal","تم الملء من اليومية"],
"Enter the target and rule %.":["Saisissez l'objectif et le % de la règle.","أدخل الهدف ونسبة القاعدة."],
"Max profit in one day (if you finish right at target)":["Profit max en une journée (si vous finissez pile à l'objectif)","أقصى ربح في يوم واحد (إذا أنهيت عند الهدف تماماً)"],
"Minimum trading days":["Jours de trading minimum","الحد الأدنى لأيام التداول"],
"if every day is at the cap":["si chaque jour est au plafond","إذا كان كل يوم عند الحد الأقصى"],
"Total profit you need":["Profit total nécessaire","إجمالي الربح المطلوب"],
"= profit target":["= objectif de profit","= هدف الربح"],
"Where you are now":["Où vous en êtes","أين أنت الآن"],
"to go · best day =":["restants · meilleur jour =","متبقية · أفضل يوم ="],
"of total":["du total","من الإجمالي"],
"✔ Target reached and consistent — you can request payout / pass":["✔ Objectif atteint et consistant — vous pouvez demander un payout / valider","✔ تم بلوغ الهدف مع الثبات — يمكنك طلب السحب / النجاح"],
"Tomorrow — don't make more than":["Demain — ne gagnez pas plus de","غداً — لا تربح أكثر من"],
"Above this, tomorrow becomes your new best day and pushes your required profit higher.":["Au-delà, demain devient votre nouveau meilleur jour et augmente le profit requis.","فوق هذا المبلغ يصبح الغد أفضل يوم جديد لك ويرفع الربح المطلوب."],
// import
"Import trades from CSV":["Importer des trades depuis un CSV","استيراد الصفقات من ملف CSV"],
"Works with Tradovate, NinjaTrader, Rithmic/R|Trader, TradingView and most broker exports. Columns are matched automatically — fix anything below before importing.":["Compatible Tradovate, NinjaTrader, Rithmic/R|Trader, TradingView et la plupart des exports de brokers. Les colonnes sont associées automatiquement — corrigez ci-dessous avant d'importer.","يعمل مع Tradovate وNinjaTrader وRithmic/R|Trader وTradingView ومعظم ملفات الوسطاء. تتم مطابقة الأعمدة تلقائياً — صحّح أي شيء أدناه قبل الاستيراد."],
"📄 Choose a CSV file (or drop it here)":["📄 Choisir un fichier CSV (ou déposez-le ici)","📄 اختر ملف CSV (أو أفلته هنا)"],
"Account name for these trades":["Nom du compte pour ces trades","اسم الحساب لهذه الصفقات"],
"e.g. Eval 50K":["ex. Eval 50K","مثال: Eval 50K"],
"Match columns":["Associer les colonnes","مطابقة الأعمدة"],
"— none —":["— aucune —","— لا شيء —"],
"Date / time":["Date / heure","التاريخ / الوقت"],
"Side / direction":["Sens / direction","الاتجاه"],
"Quantity":["Quantité","الكمية"],
"P&L":["P&L","الربح/الخسارة"],
"Fees / commission":["Frais / commission","الرسوم / العمولة"],
"Bought timestamp":["Horodatage achat","وقت الشراء"],
"Sold timestamp":["Horodatage vente","وقت البيع"],
"Buy price":["Prix d'achat","سعر الشراء"],
"Sell price":["Prix de vente","سعر البيع"],
"Side":["Sens","الاتجاه"],
"Qty":["Qté","الكمية"],
"Entry":["Entrée","الدخول"],
"Exit":["Sortie","الخروج"],
"Total:":["Total :","الإجمالي:"],
"After importing, open any trade to add the screenshot, emotions and notes.":["Après l'import, ouvrez un trade pour ajouter la capture, les émotions et les notes.","بعد الاستيراد، افتح أي صفقة لإضافة اللقطة والمشاعر والملاحظات."],
"No rows found":["Aucune ligne trouvée","لم يتم العثور على صفوف"],
// admin
"Loading students…":["Chargement des élèves…","جارٍ تحميل الطلاب…"],
"All your Tradeversity students in one place. Click a student to open their journal, stats and plans (read-only).":["Tous vos élèves Tradeversity au même endroit. Cliquez sur un élève pour ouvrir son journal, ses stats et ses plans (lecture seule).","كل طلاب Tradeversity في مكان واحد. اضغط على طالب لفتح يوميته وإحصائياته وخططه (للقراءة فقط)."],
"Students":["Élèves","الطلاب"],
"Trades logged":["Trades enregistrés","الصفقات المسجلة"],
"all students":["tous les élèves","كل الطلاب"],
"Combined net":["Net cumulé","الصافي الإجمالي"],
"Plans for next session":["Plans pour la prochaine session","خطط الجلسة القادمة"],
"Group weak spots":["Points faibles du groupe","نقاط ضعف المجموعة"],
"trades across students:":["trades chez les élèves :","صفقات لدى الطلاب:"],
"Search name, email, Telegram":["Rechercher nom, e-mail, Telegram","ابحث بالاسم أو البريد أو تيليغرام"],
"Student":["Élève","الطالب"],
"Telegram":["Telegram","تيليغرام"],
"PF":["PF","PF"],
"Max-loss days":["Jours perte max","أيام أقصى خسارة"],
"Weak spot":["Point faible","نقطة الضعف"],
"Last trade":["Dernier trade","آخر صفقة"],
"Plan":["Plan","الخطة"],
"idle":["inactif","غير نشط"],
"No students yet. Share the website link — they sign up for free.":["Aucun élève pour l'instant. Partagez le lien du site — l'inscription est gratuite.","لا يوجد طلاب بعد. شارك رابط الموقع — التسجيل مجاني."],
// approval
"Waiting for approval":["En attente de validation","في انتظار الموافقة"],
"Your account was created. Brown Algo needs to accept you before you can use the journal. You'll be able to log in as soon as you're approved.":["Votre compte a été créé. Brown Algo doit vous accepter avant que vous puissiez utiliser le journal. Vous pourrez vous connecter dès votre validation.","تم إنشاء حسابك. يجب أن يقبلك Brown Algo قبل أن تتمكن من استخدام اليومية. ستتمكن من الدخول فور الموافقة عليك."],
"Request not accepted":["Demande non acceptée","لم يتم قبول الطلب"],
"Your request to join was not accepted. Contact Brown Algo on Telegram if you think this is a mistake.":["Votre demande n'a pas été acceptée. Contactez Brown Algo sur Telegram si vous pensez que c'est une erreur.","لم يتم قبول طلب انضمامك. تواصل مع Brown Algo على تيليغرام إذا كنت تعتقد أن هذا خطأ."],
"Check again":["Vérifier à nouveau","تحقق مرة أخرى"],
"🔔 Pending requests":["🔔 Demandes en attente","🔔 طلبات معلّقة"],
"These people signed up and are waiting for you. They can't use the journal until you approve them.":["Ces personnes se sont inscrites et attendent votre validation. Elles ne peuvent pas utiliser le journal avant votre accord.","هؤلاء الأشخاص سجّلوا وينتظرونك. لا يمكنهم استخدام اليومية حتى توافق عليهم."],
"Requested":["Demandé le","تاريخ الطلب"],
"✔ Approve":["✔ Accepter","✔ قبول"],
"✖ Reject":["✖ Refuser","✖ رفض"],
"Student approved":["Élève accepté","تم قبول الطالب"],
"Request rejected":["Demande refusée","تم رفض الطلب"],
"Only the admin can do this":["Seul l'admin peut faire cela","المشرف فقط يمكنه فعل ذلك"],
// brand
"Founder":["Fondateur","المؤسس"],
// language picker
"Language":["Langue","اللغة"]
};

/* text with numbers / names inside  →  [regex, French, Arabic] */
const P=[
[/^(\d+) trades$/,"$1 trades","$1 صفقة"],
[/^(\d+) trading days$/,"$1 jours de trading","$1 يوم تداول"],
[/^(\d+) wins · (\d+) losses$/,"$1 gains · $2 pertes","$1 رابحة · $2 خاسرة"],
[/^ratio (.+)$/,"ratio $1","النسبة $1"],
[/^(\d+) green · (\d+) red days$/,"$1 jours verts · $2 jours rouges","$1 أيام خضراء · $2 أيام حمراء"],
[/^(\d+) trades? logged$/,"$1 trade(s) enregistré(s)","$1 صفقة مسجلة"],
[/^(\d+) active this week$/,"$1 actif(s) cette semaine","$1 نشط هذا الأسبوع"],
[/^win rate (.+)$/,"taux de réussite $1","نسبة الربح $1"],
[/^Risk limits for (.+)$/,"Limites de risque — $1","حدود المخاطرة — $1"],
[/^Preview — (\d+) trades$/,"Aperçu — $1 trades","معاينة — $1 صفقة"],
[/^Import (\d+) trades$/,"Importer $1 trades","استيراد $1 صفقة"],
[/^Imported (\d+) trades$/,"$1 trades importés","تم استيراد $1 صفقة"],
[/^(\d+)% rule$/,"Règle $1%","قاعدة $1%"],
[/^All accounts · (\d+) trades$/,"Tous les comptes · $1 trades","كل الحسابات · $1 صفقة"],
[/^(.+) · (\d+) trades$/,"$1 · $2 trades","$1 · $2 صفقة"],
[/^over (\d+) trades \(win rate (.+)\)\.$/,"sur $1 trades (taux de réussite $2).","على مدى $1 صفقة (نسبة الربح $2)."],
[/^\((.+) win\)\. Breaking it:$/,"($1 gagnants). En ne le suivant pas :","(ربح $1). عند مخالفتها:"],
[/^\((.+) win\)\.$/,"($1 gagnants).","(ربح $1)."],
[/^— (.+) over (\d+) trades\.$/,"— $1 sur $2 trades.","— $1 على مدى $2 صفقة."],
[/^is your weakest day: (.+)\.$/,"est votre jour le plus faible : $1.","هو أضعف أيامك: $1."],
[/^over (\d+) trades \((.+) win\)\. Good topic for the next live\.$/,"sur $1 trades ($2 gagnants). Bon sujet pour le prochain live.","على مدى $1 صفقة (ربح $2). موضوع جيد للبث المباشر القادم."],
[/^(.+) risk each$/,"$1 de risque chacun","$1 مخاطرة لكل عقد"],
[/^Total risk (.+)$/,"Risque total $1","إجمالي المخاطرة $1"],
[/^Target \((.+)R\) (.+)$/,"Objectif ($1R) $2","الهدف ($1R) $2"],
[/^Risk (.+) · (.+) of your max · Take profit at$/,"Risque $1 · $2 de votre max · Take profit à","المخاطرة $1 · $2 من حدك الأقصى · جني الربح عند"],
[/^Risk (.+) · (.+) of your max$/,"Risque $1 · $2 de votre max","المخاطرة $1 · $2 من حدك الأقصى"],
[/^· (.+) of account$/,"· $1 du compte","· $1 من الحساب"],
[/^· (.+)% of (.+)$/,"· $1% de $2","· $1% من $2"],
[/^✖ Stop is too wide: even 1 (\S+) risks (.+)\. Tighten the stop or skip the trade\.$/,"✖ Stop trop large : même 1 $1 risque $2. Resserrez le stop ou passez le trade.","✖ الوقف واسع جداً: حتى عقد $1 واحد يخاطر بـ $2. ضيّق الوقف أو تجاوز الصفقة."],
[/^your best day (.+) ÷ (.+)%$/,"votre meilleur jour $1 ÷ $2%","أفضل يوم لديك $1 ÷ $2%"],
[/^Profit (.+) of (.+) ·$/,"Profit $1 sur $2 ·","الربح $1 من $2 ·"],
[/^✔ Consistent so far\. Keep going: (.+) left$/,"✔ Consistant pour l'instant. Continuez : il reste $1","✔ ثابت حتى الآن. واصل: متبقٍ $1"],
[/^✖ Not consistent yet: best day is (.+) of total \(max (.+)%\)\. Make (.+) more without beating your best day\.$/,"✖ Pas encore consistant : le meilleur jour représente $1 du total (max $2%). Gagnez encore $3 sans dépasser votre meilleur jour.","✖ غير ثابت بعد: أفضل يوم يمثل $1 من الإجمالي (الحد $2%). اربح $3 إضافية دون تجاوز أفضل يوم لديك."],
[/^Formula: best day ≤ (.+)% × total profit\. Some firms count it differently \(e\.g\. % of the profit target\)\. Always check your firm's rules\.$/,"Formule : meilleur jour ≤ $1% × profit total. Certaines firms calculent autrement (ex. % de l'objectif). Vérifiez toujours les règles de votre firm.","المعادلة: أفضل يوم ≤ $1% × إجمالي الربح. بعض الشركات تحسبها بشكل مختلف (مثل % من هدف الربح). تحقق دائماً من قواعد شركتك."],
[/^(.*)— read-only$/,"$1— lecture seule","$1— للقراءة فقط"],
[/^Couldn't save: (.+)$/,"Échec de l'enregistrement : $1","تعذّر الحفظ: $1"],
[/^Couldn't load data: (.+)$/,"Impossible de charger les données : $1","تعذّر تحميل البيانات: $1"],
[/^Couldn't load: (.+)$/,"Chargement impossible : $1","تعذّر التحميل: $1"],
[/^Import failed: (.+)$/,"Échec de l'import : $1","فشل الاستيراد: $1"],
[/^Rejected requests \((\d+)\)$/,"Demandes refusées ($1)","الطلبات المرفوضة ($1)"],
[/^Reject (.+)\? They won't be able to use the journal\.$/,"Refuser $1 ? Cette personne ne pourra pas utiliser le journal.","رفض $1؟ لن يتمكن من استخدام اليومية."],
[/^For security purposes, you can only request this after (\d+) seconds\.$/,"Par sécurité, réessayez dans $1 secondes.","لأسباب أمنية، أعد المحاولة بعد $1 ثانية."]
];

const SKIP=new Set(["SCRIPT","STYLE","TEXTAREA","NOSCRIPT"]);
const ATTRS=["placeholder","title","aria-label"];
const lsKey="tvj_lang";
function guess(){const n=(navigator.language||"en").slice(0,2).toLowerCase();return LANGS[n]?n:"en"}
let lang=(()=>{try{const v=localStorage.getItem(lsKey);return LANGS[v]?v:guess()}catch(e){return guess()}})();
const idx=()=>lang==="fr"?0:1;

function tr(s){
  if(lang==="en"||!s)return s;
  const k=s.trim();if(!k)return s;
  let v=T[k]?T[k][idx()]:null;
  if(v==null)for(const p of P){if(p[0].test(k)){v=k.replace(p[0],p[1+idx()]);break}}
  if(v==null)return s;
  return s.slice(0,s.indexOf(k))+v+s.slice(s.indexOf(k)+k.length);
}
function skipEl(el){return !el||SKIP.has(el.tagName)||(el.closest&&el.closest("[data-notr],#tip"))}
function doText(n){
  if(n._tr!==undefined&&n.data===n._tr)return;          // our own write
  n._en=n.data;const v=tr(n._en);n._tr=v;if(v!==n.data)n.data=v;
}
function doEl(el){
  if(el.tagName==="OPTION"&&!el.hasAttribute("value")&&lang!=="en")el.setAttribute("value",el._enText!=null?el._enText:el.textContent);
  el._enA=el._enA||{};
  ATTRS.forEach(a=>{if(!el.hasAttribute(a))return;const cur=el.getAttribute(a);
    if(el._trA&&el._trA[a]===cur)return;el._enA[a]=cur;const v=tr(cur);(el._trA=el._trA||{})[a]=v;if(v!==cur)el.setAttribute(a,v)});
}
function walk(root){
  if(root.nodeType===3){if(!skipEl(root.parentElement))doText(root);return}
  if(root.nodeType!==1||skipEl(root))return;
  if(root.tagName==="OPTION"&&root._enText==null)root._enText=root.textContent;
  doEl(root);
  const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:n=>{const el=n.nodeType===1?n:n.parentElement;return skipEl(el)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
  let n;while((n=w.nextNode())){if(n.nodeType===3)doText(n);else{if(n.tagName==="OPTION"&&n._enText==null)n._enText=n.textContent;doEl(n)}}
}
/* re-translate everything from the original English (used when switching language) */
function rewalk(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let n;
  while((n=w.nextNode())){
    if(n.nodeType===3){if(n._en!==undefined&&n.data===n._tr){n.data=n._en;n._tr=undefined}}
    else if(n._enA&&n._trA){for(const a in n._enA){if(n.getAttribute(a)===n._trA[a])n.setAttribute(a,n._enA[a])}n._trA={}}
  }
  walk(root);
}
function applyDoc(){
  const L=LANGS[lang];document.documentElement.lang=lang;document.documentElement.dir=L.dir;
  document.querySelectorAll(".langSel").forEach(s=>s.value=lang);
}
const mo=new MutationObserver(ms=>{if(lang==="en"&&!ms.length)return;
  for(const m of ms){
    if(m.type==="characterData"){const p=m.target.parentElement;if(!skipEl(p))doText(m.target)}
    else if(m.type==="attributes"){if(!skipEl(m.target))doEl(m.target)}
    else m.addedNodes.forEach(walk);
  }});

window.I18N={
  get lang(){return lang},
  locale(){return LANGS[lang].locale},
  t:tr,
  set(l){if(!LANGS[l]||l===lang)return;lang=l;try{localStorage.setItem(lsKey,l)}catch(e){}applyDoc();rewalk(document.body);
    if(typeof window.onLangChange==="function")window.onLangChange()},
  picker(){return `<select class="i langSel" data-notr aria-label="Language" title="Language">${Object.entries(LANGS).map(([k,v])=>`<option value="${k}" ${k===lang?"selected":""}>${k==="en"?"🌐 ":k==="fr"?"🌐 ":"🌐 "}${v.label}</option>`).join("")}</select>`},
  start(){applyDoc();walk(document.body);mo.observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:ATTRS});
    document.addEventListener("change",e=>{if(e.target.classList&&e.target.classList.contains("langSel"))I18N.set(e.target.value)})}
};
})();
