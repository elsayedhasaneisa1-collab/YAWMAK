(() => {
      'use strict';
      const KEY = 'yawmak.workspace.v3';
      const PREVIOUS_KEY = 'yawmak.workspace.v2';
      const OLD_KEY = 'yawmak.workspace.v1';
      const VIEWS = ['today', 'tasks', 'focus', 'habits', 'notes', 'insights', 'islam'];
      const categories = { personal: 'شخصي', work: 'شغل', learn: 'تعلّم', health: 'صحة' };
      const repeatLabels = { none: '', daily: 'كل يوم', weekly: 'كل أسبوع', monthly: 'كل شهر' };
      const PALETTES = { forest: ['غابة', '#2c6048'], ocean: ['بحر', '#24607d'], sand: ['رمال', '#8a5a2b'], plum: ['توت', '#6a3f8a'] };
      const AMBIENTS = { none: 'بدون صوت', rain: 'مطر هادي', brown: 'ضوضاء دافئة', wind: 'هوا خفيف' };
      const MOODS = [['😞', 'يوم تقيل. خُد بالك من نفسك، وبكرة أخف.'], ['😕', 'مش أحسن حاجة. خطوة صغيرة كفاية النهارده.'], ['😐', 'يوم عادي. وده كويس برضه.'], ['🙂', 'كويس! خلّي الطاقة دي في حاجة تحبها.'], ['😄', 'يوم جميل. استمتع بيه وسجّل اللي فرّحك.']];
      const EMOJIS = ['💧', '📖', '🏃', '🧘', '✍️', '🌱', '💤', '🥗', '🚶', '🎯', '🧹', '📵'];
      const MODE_LABEL = { focus: 'تركيز', break: 'استراحة', long: 'استراحة طويلة' };
      const PRAYER_NAMES = { Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء' };
      const OBLIGATORY = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const PRAYER_KEYS = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
      const CITIES = [
        ['cairo', 'القاهرة، مصر', 30.0444, 31.2357, 'Africa/Cairo', 5],
        ['giza', 'الجيزة، مصر', 30.0131, 31.2089, 'Africa/Cairo', 5],
        ['alexandria', 'الإسكندرية، مصر', 31.2001, 29.9187, 'Africa/Cairo', 5],
        ['mansoura', 'المنصورة، مصر', 31.0409, 31.3785, 'Africa/Cairo', 5],
        ['tanta', 'طنطا، مصر', 30.7865, 31.0004, 'Africa/Cairo', 5],
        ['portsaid', 'بورسعيد، مصر', 31.2653, 32.3019, 'Africa/Cairo', 5],
        ['ismailia', 'الإسماعيلية، مصر', 30.5965, 32.2715, 'Africa/Cairo', 5],
        ['luxor', 'الأقصر، مصر', 25.6872, 32.6396, 'Africa/Cairo', 5],
        ['aswan', 'أسوان، مصر', 24.0889, 32.8998, 'Africa/Cairo', 5],
        ['hurghada', 'الغردقة، مصر', 27.2579, 33.8116, 'Africa/Cairo', 5],
        ['mecca', 'مكة المكرمة، السعودية', 21.3891, 39.8579, 'Asia/Riyadh', 4],
        ['medina', 'المدينة المنورة، السعودية', 24.5247, 39.5692, 'Asia/Riyadh', 4],
        ['riyadh', 'الرياض، السعودية', 24.7136, 46.6753, 'Asia/Riyadh', 4],
        ['jeddah', 'جدة، السعودية', 21.4858, 39.1925, 'Asia/Riyadh', 4],
        ['dubai', 'دبي، الإمارات', 25.2048, 55.2708, 'Asia/Dubai', 4],
        ['doha', 'الدوحة، قطر', 25.2854, 51.5310, 'Asia/Qatar', 4],
        ['kuwait', 'مدينة الكويت، الكويت', 29.3759, 47.9774, 'Asia/Kuwait', 4],
        ['amman', 'عمّان، الأردن', 31.9454, 35.9284, 'Asia/Amman', 2],
        ['rabat', 'الرباط، المغرب', 34.0209, -6.8416, 'Africa/Casablanca', 21],
        ['tunis', 'تونس، تونس', 36.8065, 10.1815, 'Africa/Tunis', 2],
        ['algiers', 'الجزائر، الجزائر', 36.7538, 3.0588, 'Africa/Algiers', 2],
        ['istanbul', 'إسطنبول، تركيا', 41.0082, 28.9784, 'Europe/Istanbul', 13],
        ['london', 'لندن، بريطانيا', 51.5074, -0.1278, 'Europe/London', 2],
        ['paris', 'باريس، فرنسا', 48.8566, 2.3522, 'Europe/Paris', 2],
        ['newyork', 'نيويورك، أمريكا', 40.7128, -74.0060, 'America/New_York', 3]
      ];
      const ISLAM_TABS = ['home', 'quran', 'adhkar', 'prayer', 'qibla', 'tasbih'];
      const SURAH_NAMES = 'الفاتحة|البقرة|آل عمران|النساء|المائدة|الأنعام|الأعراف|الأنفال|التوبة|يونس|هود|يوسف|الرعد|إبراهيم|الحجر|النحل|الإسراء|الكهف|مريم|طه|الأنبياء|الحج|المؤمنون|النور|الفرقان|الشعراء|النمل|القصص|العنكبوت|الروم|لقمان|السجدة|الأحزاب|سبأ|فاطر|يس|الصافات|ص|الزمر|غافر|فصلت|الشورى|الزخرف|الدخان|الجاثية|الأحقاف|محمد|الفتح|الحجرات|ق|الذاريات|الطور|النجم|القمر|الرحمن|الواقعة|الحديد|المجادلة|الحشر|الممتحنة|الصف|الجمعة|المنافقون|التغابن|الطلاق|التحريم|الملك|القلم|الحاقة|المعارج|نوح|الجن|المزمل|المدثر|القيامة|الإنسان|المرسلات|النبأ|النازعات|عبس|التكوير|الانفطار|المطففين|الانشقاق|البروج|الطارق|الأعلى|الغاشية|الفجر|البلد|الشمس|الليل|الضحى|الشرح|التين|العلق|القدر|البينة|الزلزلة|العاديات|القارعة|التكاثر|العصر|الهمزة|الفيل|قريش|الماعون|الكوثر|الكافرون|النصر|المسد|الإخلاص|الفلق|الناس'.split('|');
      const OFFLINE_SURAHS = {
        1: { start: 1, page: 1, juz: 1, verses: ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ', 'ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 'مَٰلِكِ يَوْمِ ٱلدِّينِ', 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ', 'صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'] },
        103: { start: 6177, page: 601, juz: 30, verses: ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ وَٱلْعَصْرِ', 'إِنَّ ٱلْإِنسَٰنَ لَفِى خُسْرٍ', 'إِلَّا ٱلَّذِينَ ءَامَنُوا۟ وَعَمِلُوا۟ ٱلصَّٰلِحَٰتِ وَتَوَاصَوْا۟ بِٱلْحَقِّ وَتَوَاصَوْا۟ بِٱلصَّبْرِ'] },
        108: { start: 6205, page: 602, juz: 30, verses: ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ', 'فَصَلِّ لِرَبِّكَ وَٱنْحَرْ', 'إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ'] },
        112: { start: 6222, page: 604, juz: 30, verses: ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ', 'ٱللَّهُ ٱلصَّمَدُ', 'لَمْ يَلِدْ وَلَمْ يُولَدْ', 'وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ'] },
        113: { start: 6226, page: 604, juz: 30, verses: ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ', 'مِن شَرِّ مَا خَلَقَ', 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', 'وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ', 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ'] },
        114: { start: 6231, page: 604, juz: 30, verses: ['بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ', 'مَلِكِ ٱلنَّاسِ', 'إِلَٰهِ ٱلنَّاسِ', 'مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ', 'ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ', 'مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ'] }
      };
      const DAILY_VERSES = [[1, 2], [1, 3], [1, 5], [103, 1], [103, 3], [112, 1], [108, 1]];
      const ZIKR_CATS = { morning: 'الصباح', evening: 'المساء', after: 'بعد الصلاة', sleep: 'قبل النوم', general: 'أدعية وأذكار', favorite: 'المفضلة' };
      const ADHKAR = [
        { id: 'morning1', cat: 'morning', text: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', source: 'صحيح مسلم، من ذكر الصباح والمساء', target: 1 },
        { id: 'morning2', cat: 'morning', text: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ.', source: 'سنن أبي داود والترمذي', target: 1 },
        { id: 'morning3', cat: 'morning', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.', source: 'صحيح مسلم، من ذكر الصباح والمساء', target: 100 },
        { id: 'morning4', cat: 'morning', text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.', source: 'سنن أبي داود والترمذي', target: 3 },
        { id: 'morning5', cat: 'morning', text: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا.', source: 'سنن أبي داود والترمذي', target: 3 },
        { id: 'morning6', cat: 'morning', text: [112, 113, 114].map(n => OFFLINE_SURAHS[n].verses.join(' ۞ ')).join(' | '), source: 'سنن أبي داود والترمذي، قراءة الإخلاص والمعوذتين كاملة', target: 3 },
        { id: 'evening1', cat: 'evening', text: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', source: 'صحيح مسلم، من ذكر الصباح والمساء', target: 1 },
        { id: 'evening2', cat: 'evening', text: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ.', source: 'سنن أبي داود والترمذي', target: 1 },
        { id: 'evening3', cat: 'evening', text: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.', source: 'صحيح مسلم', target: 3 },
        { id: 'evening4', cat: 'evening', text: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.', source: 'سنن أبي داود والترمذي', target: 3 },
        { id: 'evening5', cat: 'evening', text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ.', source: 'صحيح مسلم', target: 100 },
        { id: 'evening6', cat: 'evening', text: [112, 113, 114].map(n => OFFLINE_SURAHS[n].verses.join(' ۞ ')).join(' | '), source: 'سنن أبي داود والترمذي، قراءة الإخلاص والمعوذتين كاملة', target: 3 },
        { id: 'after1', cat: 'after', text: 'أَسْتَغْفِرُ اللَّهَ.', source: 'صحيح مسلم، دبر الصلاة', target: 3 },
        { id: 'after2', cat: 'after', text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.', source: 'صحيح مسلم، دبر الصلاة', target: 1 },
        { id: 'after3', cat: 'after', text: 'سُبْحَانَ اللَّهِ.', source: 'صحيح مسلم، دبر الصلاة', target: 33 },
        { id: 'after4', cat: 'after', text: 'الْحَمْدُ لِلَّهِ.', source: 'صحيح مسلم، دبر الصلاة', target: 33 },
        { id: 'after5', cat: 'after', text: 'اللَّهُ أَكْبَرُ.', source: 'صحيح مسلم، دبر الصلاة', target: 33 },
        { id: 'after6', cat: 'after', text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.', source: 'صحيح مسلم، تمام المئة بعد التسبيح', target: 1 },
        { id: 'sleep1', cat: 'sleep', text: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.', source: 'صحيح البخاري، عند النوم', target: 1 },
        { id: 'sleep2', cat: 'sleep', text: 'بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.', source: 'الصحيحان، عند النوم', target: 1 },
        { id: 'sleep3', cat: 'sleep', text: 'سُبْحَانَ اللَّهِ.', source: 'الصحيحان، تسبيح فاطمة قبل النوم', target: 33 },
        { id: 'sleep4', cat: 'sleep', text: 'الْحَمْدُ لِلَّهِ.', source: 'الصحيحان، تسبيح فاطمة قبل النوم', target: 33 },
        { id: 'sleep5', cat: 'sleep', text: 'اللَّهُ أَكْبَرُ.', source: 'الصحيحان، تسبيح فاطمة قبل النوم', target: 34 },
        { id: 'general1', cat: 'general', text: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.', source: 'القرآن الكريم، البقرة: ٢٠١', target: 1 },
        { id: 'general2', cat: 'general', text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي.', source: 'القرآن الكريم، طه: ٢٥-٢٦', target: 1 },
        { id: 'general3', cat: 'general', text: 'رَبِّ زِدْنِي عِلْمًا.', source: 'القرآن الكريم، طه: ١١٤', target: 1 },
        { id: 'general4', cat: 'general', text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.', source: 'الصحيحان', target: 33 },
        { id: 'general5', cat: 'general', text: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ.', source: 'الصحيحان، من الصلاة الإبراهيمية', target: 10 }
      ];
      const $ = (s, r = document) => r.querySelector(s);
      const $$ = (s, r = document) => [...r.querySelectorAll(s)];
      const icon = n => `<svg class="icon" aria-hidden="true"><use href="#i-${n}"/></svg>`;
      const uid = () => window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const fromKey = k => new Date(`${k}T12:00:00`);
      const shiftDay = (k, n) => { const d = fromKey(k); d.setDate(d.getDate() + n); return dayKey(d); };
      const shiftMonth = k => { const d = fromKey(k); const day = d.getDate(); d.setMonth(d.getMonth() + 1); if (d.getDate() !== day) d.setDate(0); return dayKey(d); };
      const fmtDay = (k, o = { day: 'numeric', month: 'short' }) => new Intl.DateTimeFormat('ar-EG', o).format(fromKey(k));
      const clamp = (v, min, max, fb) => Number.isFinite(Number(v)) && v !== '' && v !== null ? Math.min(max, Math.max(min, Math.round(Number(v)))) : fb;
      const validDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && dayKey(fromKey(v)) === v;
      const validTime = v => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
      const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
      const prefersDark = matchMedia('(prefers-color-scheme: dark)');

      let storageAvailable = true, storageWarned = false, loadNotice = '', freshStart = false;
      let activeView = 'today', activeNoteId = '';
      let islamTab = 'home', zikrCategory = 'morning', currentSurah = 0, surahIndex = [], surahRequest = 0, prayerRequest = 0, quranDownloading = false, quranCancel = false, lastIslamTick = 0, lastPrayerDay = '', compassHeading = null, compassListening = false;
      const loadedSurahs = new Map();
      const filters = { today: 'all', tasks: 'all' };
      let noteSaveTimeout, toastTimeout, toastCallback, confirmResolver, audioContext, wakeLock = null, deferredPrompt = null;
      let lastRenderedSecond = -1, lastDay = dayKey(), lastReminderCheck = 0, paletteIndex = 0, paletteItems = [];
      const ambient = { nodes: null, playing: false };

      function defaultState(examples = true) {
        const now = Date.now(), today = dayKey();
        const t = (title, category, priority, done = false, extra = {}) => ({ id: uid(), title, category, priority, done, due: today, createdAt: now, completedAt: done ? now : null, repeat: 'none', reminder: '', details: '', remindedOn: '', spawned: false, ...extra });
        return {
          version: 3,
          tasks: examples ? [t('حدّد أهم ٣ حاجات للأسبوع', 'personal', 'high'), t('نصف ساعة للمشروع اللي بتحبه', 'work', 'normal'), t('اقرأ ١٠ صفحات من كتابك', 'learn', 'normal', false, { repeat: 'daily' }), t('اعمل مساحة صغيرة لنفسك', 'personal', 'normal', true)] : [],
          notes: examples ? [{ id: uid(), title: 'أهلا بيك في دفترك', body: 'هنا مكان لأفكارك. اكتب أي حاجة: خطة، اقتباس عجبك، أو حاجة بسيطة فرّحتك النهارده.\n\nتقدر تثبّت الملاحظات المهمة، تشاركها، أو تنزّلها كملف.', pinned: false, createdAt: now, updatedAt: now }] : [],
          habits: examples ? [{ id: uid(), name: 'اشرب مية كفاية', emoji: '💧', target: 7, log: {}, createdAt: now }, { id: uid(), name: 'قراءة ١٠ دقايق', emoji: '📖', target: 5, log: {}, createdAt: now }, { id: uid(), name: 'مشي أو حركة', emoji: '🚶', target: 4, log: {}, createdAt: now }] : [],
          moods: {},
          settings: { name: '', focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, longBreakEvery: 4, autoStart: false, sound: true, ambient: 'rain', ambientVolume: .5, theme: 'light', palette: 'forest', notifications: false, dailyGoal: 3 },
          timer: { mode: 'focus', duration: 1500, remaining: 1500, running: false, endAt: null, taskId: '', sessionId: uid(), cycle: 0 },
          sessions: [],
          islam: { city: 'cairo', cityName: 'القاهرة، مصر', lat: 30.0444, lon: 31.2357, zone: 'Africa/Cairo', method: 5, school: 0, prayerCache: {}, prayerLog: {}, prayerNotified: {}, prayerAlerts: false, position: { surah: 1, ayah: 1 }, bookmarks: [], quranSize: 29, zikrCounts: {}, zikrFavorites: [], tasbih: { phrase: 'سبحان الله', target: 33, counts: {}, total: 0 } },
          meta: { onboarded: false, lastBackupAt: null }
        };
      }

      function normalizeState(raw) {
        if (!raw || ![1, 2, 3].includes(raw.version) || !Array.isArray(raw.tasks)) throw new Error('Invalid workspace');
        const r = defaultState(false);
        const idOk = v => typeof v === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(v);
        const seen = new Set();
        const freshId = v => { let id = idOk(v) ? v : uid(); while (seen.has(id)) id = uid(); seen.add(id); return id; };
        const str = (v, n) => typeof v === 'string' ? v.slice(0, n) : '';
        r.tasks = raw.tasks.filter(t => t && typeof t.title === 'string' && t.title.trim()).slice(0, 500).map(t => ({
          id: freshId(t.id), title: t.title.trim().slice(0, 160), category: Object.hasOwn(categories, t.category) ? t.category : 'personal', priority: t.priority === 'high' ? 'high' : 'normal', done: t.done === true,
          due: validDate(t.due) ? t.due : '', createdAt: Number.isFinite(t.createdAt) ? t.createdAt : Date.now(), completedAt: Number.isFinite(t.completedAt) ? t.completedAt : null,
          repeat: Object.hasOwn(repeatLabels, t.repeat) ? t.repeat : 'none', reminder: validTime(t.reminder) ? t.reminder : '', details: str(t.details, 1000), remindedOn: validDate(t.remindedOn) ? t.remindedOn : '', spawned: t.spawned === true
        }));
        seen.clear();
        if (raw.version === 1) r.notes = typeof raw.note === 'string' && raw.note.trim() ? [{ id: 'quick', title: 'أفكار سريعة', body: raw.note.slice(0, 20000), pinned: true, createdAt: Date.now(), updatedAt: Date.now() }] : [];
        else r.notes = (Array.isArray(raw.notes) ? raw.notes : []).filter(n => n && typeof n === 'object').slice(0, 300).map(n => ({ id: freshId(n.id), title: str(n.title, 80), body: str(n.body, 20000), pinned: n.pinned === true, createdAt: Number.isFinite(n.createdAt) ? n.createdAt : Date.now(), updatedAt: Number.isFinite(n.updatedAt) ? n.updatedAt : Date.now() }));
        seen.clear();
        r.habits = (Array.isArray(raw.habits) ? raw.habits : []).filter(h => h && typeof h.name === 'string' && h.name.trim()).slice(0, 40).map(h => {
          const log = {};
          if (h.log && typeof h.log === 'object') Object.keys(h.log).filter(validDate).slice(-400).forEach(k => { if (h.log[k] === true) log[k] = true; });
          return { id: freshId(h.id), name: h.name.trim().slice(0, 60), emoji: str(h.emoji, 4) || '🌱', target: clamp(h.target, 1, 7, 7), log, createdAt: Number.isFinite(h.createdAt) ? h.createdAt : Date.now() };
        });
        r.moods = {};
        if (raw.moods && typeof raw.moods === 'object') Object.keys(raw.moods).filter(validDate).slice(-400).forEach(k => { const s = clamp(raw.moods[k]?.score, 1, 5, 0); if (s) r.moods[k] = { score: s }; });
        const s = raw.settings || {};
        r.settings = { name: str(s.name, 30).trim(), focusMinutes: clamp(s.focusMinutes, 1, 120, 25), breakMinutes: clamp(s.breakMinutes, 1, 60, 5), longBreakMinutes: clamp(s.longBreakMinutes, 1, 60, 15), longBreakEvery: clamp(s.longBreakEvery, 2, 8, 4), autoStart: s.autoStart === true, sound: s.sound !== false, ambient: Object.hasOwn(AMBIENTS, s.ambient) ? s.ambient : 'rain', ambientVolume: Number.isFinite(s.ambientVolume) ? Math.min(1, Math.max(0, s.ambientVolume)) : .5, theme: ['light', 'dark', 'system'].includes(s.theme) ? s.theme : 'light', palette: Object.hasOwn(PALETTES, s.palette) ? s.palette : 'forest', notifications: s.notifications === true, dailyGoal: clamp(s.dailyGoal, 1, 20, 3) };
        const tm = raw.timer || {};
        const mode = Object.hasOwn(MODE_LABEL, tm.mode) ? tm.mode : 'focus';
        const duration = clamp(tm.duration, 60, 7200, (mode === 'focus' ? r.settings.focusMinutes : mode === 'break' ? r.settings.breakMinutes : r.settings.longBreakMinutes) * 60);
        const endAt = Number.isFinite(tm.endAt) && tm.endAt > 0 ? tm.endAt : null;
        r.timer = { mode, duration, remaining: clamp(tm.remaining, 0, duration, duration), running: tm.running === true && endAt !== null && endAt <= Date.now() + duration * 1000 + 1000, endAt, taskId: r.tasks.some(t => t.id === tm.taskId && !t.done) ? tm.taskId : '', sessionId: str(tm.sessionId, 80) || uid(), cycle: clamp(tm.cycle, 0, 99, 0) };
        r.sessions = (Array.isArray(raw.sessions) ? raw.sessions : []).filter(x => x && validDate(x.date) && Number.isFinite(x.minutes) && x.minutes > 0 && x.minutes <= 120).slice(-2000).map(x => ({ id: str(x.id, 80) || uid(), date: x.date, minutes: x.minutes }));
        const i = raw.islam || {}, city = CITIES.find(x => x[0] === i.city), base = r.islam;
        base.city = city ? city[0] : ['gps', 'custom'].includes(i.city) ? i.city : 'cairo';
        base.cityName = city ? city[1] : str(i.cityName, 65) || 'موقعك';
        base.lat = Number.isFinite(i.lat) && i.lat >= -90 && i.lat <= 90 ? i.lat : (city?.[2] ?? 30.0444);
        base.lon = Number.isFinite(i.lon) && i.lon >= -180 && i.lon <= 180 ? i.lon : (city?.[3] ?? 31.2357);
        base.zone = /^[A-Za-z_\/+-]{1,65}$/.test(i.zone || '') ? i.zone : city?.[4] || 'Africa/Cairo';
        base.method = [2, 3, 4, 5, 13, 21].includes(Number(i.method)) ? Number(i.method) : city?.[5] || 5;
        base.school = i.school === 1 ? 1 : 0;
        base.prayerAlerts = i.prayerAlerts === true;
        const timeKeys = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Imsak'];
        if (i.prayerCache && typeof i.prayerCache === 'object') Object.keys(i.prayerCache).filter(validDate).slice(-75).forEach(key => {
          const item = i.prayerCache[key];
          if (!item?.timings || !timeKeys.every(k => validTime(item.timings[k]))) return;
          base.prayerCache[key] = { timings: Object.fromEntries(timeKeys.map(k => [k, item.timings[k]])), hijri: { day: clamp(item.hijri?.day, 1, 30, 1), month: str(item.hijri?.month, 35), year: clamp(item.hijri?.year, 1300, 1700, 1447) } };
        });
        if (i.prayerLog && typeof i.prayerLog === 'object') Object.keys(i.prayerLog).filter(validDate).slice(-370).forEach(key => { base.prayerLog[key] = Array.isArray(i.prayerLog[key]) ? [...new Set(i.prayerLog[key].filter(k => OBLIGATORY.includes(k)))] : []; });
        if (i.prayerNotified && typeof i.prayerNotified === 'object') Object.keys(i.prayerNotified).filter(k => /^\d{4}-\d{2}-\d{2}:(Fajr|Dhuhr|Asr|Maghrib|Isha)$/.test(k)).slice(-40).forEach(k => { if (i.prayerNotified[k] === true) base.prayerNotified[k] = true; });
        base.position = { surah: clamp(i.position?.surah, 1, 114, 1), ayah: clamp(i.position?.ayah, 1, 286, 1) };
        base.bookmarks = (Array.isArray(i.bookmarks) ? i.bookmarks : []).filter(x => x && Number.isInteger(x.surah) && x.surah >= 1 && x.surah <= 114 && Number.isInteger(x.ayah) && x.ayah >= 1 && x.ayah <= 286).slice(-250).map(x => ({ surah: x.surah, ayah: x.ayah }));
        base.quranSize = clamp(i.quranSize, 23, 42, 29);
        if (i.zikrCounts && typeof i.zikrCounts === 'object') Object.keys(i.zikrCounts).filter(validDate).slice(-32).forEach(key => {
          const counts = i.zikrCounts[key];
          base.zikrCounts[key] = Object.fromEntries(ADHKAR.filter(x => counts && Object.hasOwn(counts, x.id)).map(x => [x.id, clamp(counts[x.id], 0, x.target, 0)]));
        });
        base.zikrFavorites = (Array.isArray(i.zikrFavorites) ? i.zikrFavorites : []).filter(id => ADHKAR.some(x => x.id === id)).slice(0, 40);
        const t = i.tasbih || {};
        base.tasbih.phrase = $$('#tasbih-phrase option').some(o => o.value === t.phrase) ? t.phrase : 'سبحان الله';
        base.tasbih.target = [0, 33, 100].includes(Number(t.target)) ? Number(t.target) : 33;
        if (t.counts && typeof t.counts === 'object') $$('#tasbih-phrase option').forEach(o => { base.tasbih.counts[o.value] = clamp(t.counts[o.value], 0, 1000000, 0); });
        base.tasbih.total = clamp(t.total, 0, 10000000, 0);
        r.meta = { onboarded: raw.meta?.onboarded === true || raw.version === 1, lastBackupAt: Number.isFinite(raw.meta?.lastBackupAt) ? raw.meta.lastBackupAt : null };
        return r;
      }

      function loadState() {
        try {
          const saved = localStorage.getItem(KEY) || localStorage.getItem(PREVIOUS_KEY) || localStorage.getItem(OLD_KEY);
          if (saved) {
            try { return normalizeState(JSON.parse(saved)); }
            catch { loadNotice = 'تعذّر قراءة البيانات القديمة. تقدر تسترجع نسخة احتياطية من الإعدادات.'; }
          } else freshStart = true;
        } catch {
          storageAvailable = false;
          loadNotice = 'المتصفح مانع الحفظ المحلي. بياناتك هتفضل خلال الجلسة دي فقط؛ نزّل نسخة قبل ما تقفل.';
        }
        return defaultState();
      }
      let state = loadState();

      function setStorageStatus() {
        const online = navigator.onLine;
        document.body.classList.toggle('is-offline', !online);
        $$('[data-storage-label]').forEach(e => { e.textContent = !storageAvailable ? 'لهذه الجلسة فقط' : online ? 'محفوظ على جهازك' : 'بدون نت، وكله شغال'; });
        $('#online-badge span').textContent = online ? 'متصل' : 'بدون نت';
        $('#online-badge').title = online ? 'متصل بالإنترنت' : 'لا يوجد إنترنت. يومك شغال بالكامل بدون نت.';
      }
      function saveState() {
        try { localStorage.setItem(KEY, JSON.stringify(state)); storageAvailable = true; }
        catch { storageAvailable = false; if (!storageWarned) { storageWarned = true; showToast('الحفظ المحلي غير متاح. نزّل نسخة من الإعدادات علشان ما تفقدش بياناتك.'); } }
        setStorageStatus();
      }


      function showToast(message, actionLabel = '', callback = null) {
        clearTimeout(toastTimeout);
        ($$('dialog[open]').at(-1) || document.body).append($('#toast'));
        $('#toast-message').textContent = message;
        $('#toast-action').textContent = actionLabel;
        $('#toast-action').hidden = !actionLabel;
        toastCallback = callback;
        $('#toast').hidden = false;
        toastTimeout = setTimeout(() => { $('#toast').hidden = true; toastCallback = null; }, actionLabel ? 9000 : 5500);
      }
      function askConfirm(title, message, label = 'تأكيد', destructive = false) {
        if ($('#confirm-dialog').open) return Promise.resolve(false);
        $('#confirm-title').textContent = title;
        $('#confirm-description').textContent = message;
        $('#confirm-yes').textContent = label;
        $('#confirm-yes').classList.toggle('button-danger', destructive);
        $('#confirm-dialog').returnValue = '';
        $('#confirm-dialog').showModal();
        return new Promise(resolve => { confirmResolver = resolve; });
      }
      function renderDate() {
        const now = new Date();
        $('#current-date').dateTime = dayKey(now);
        $('#current-date').textContent = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long' }).format(now);
        const h = now.getHours();
        const greeting = h < 5 ? 'سهران؟ خُد بالك من نفسك' : h < 12 ? 'صباح الخير' : h < 18 ? 'نهارك جميل' : 'مساء الخير';
        $('#greeting-text').textContent = `${greeting}، ${state.settings.name ? 'يا ' + state.settings.name : 'يا صديق'}`;
      }
      function resolvedTheme() { return state.settings.theme === 'system' ? (prefersDark.matches ? 'dark' : 'light') : state.settings.theme; }
      function applyTheme() {
        const dark = resolvedTheme() === 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        document.documentElement.dataset.palette = state.settings.palette;
        $('#theme-button use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
        $('#theme-button').title = dark ? 'الوضع الفاتح' : 'الوضع الداكن';
        requestAnimationFrame(() => { $('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--sidebar').trim() || '#173e32'; });
      }
      prefersDark.addEventListener('change', () => { if (state.settings.theme === 'system') applyTheme(); });

      function navigate(view, updateHash = true) {
        if (!VIEWS.includes(view)) view = 'today';
        const enteringIslam = view === 'islam' && activeView !== 'islam';
        activeView = view;
        $$('.view').forEach(s => { s.hidden = s.id !== `view-${view}`; });
        $$('.nav-item[data-view], .mobile-nav [data-view]').forEach(b => {
          const on = b.dataset.view === view;
          b.classList.toggle('active', on);
          if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
        });
        if (updateHash && location.hash !== `#${view}`) { try { history.pushState({ view }, '', `#${view}`); } catch { location.hash = view; } }
        if (view === 'insights') renderInsights();
        if (view === 'notes') renderNotes();
        if (enteringIslam) { renderPrayer(); loadPrayerCalendar(); }
        window.scrollTo({ top: 0, behavior: 'instant' });
      }


      function todayTasks() {
        const today = dayKey();
        return state.tasks.filter(t => t.done ? (t.completedAt !== null && dayKey(new Date(t.completedAt)) === today) : (!t.due || t.due <= today));
      }
      function dueLabel(t) {
        if (!t.due || t.done) return '';
        const today = dayKey();
        if (t.due < today) return 'من يوم فات';
        if (t.due === today) return '';
        if (t.due === shiftDay(today, 1)) return 'بكرة';
        return fmtDay(t.due);
      }
      function createTaskRow(t) {
        const row = document.createElement('div');
        row.className = `task-row${t.done ? ' is-done' : ''}`;
        row.innerHTML = `<label class="task-check-label"><input type="checkbox" class="task-check"><span class="check-box">${icon('check')}</span><span class="task-copy"><span class="task-title"></span><span class="task-meta"><span class="task-category"><i class="category-dot"></i><span></span></span><span class="task-priority">${icon('flag')}مهمة للأول</span><span class="task-due"></span><span class="task-repeat">${icon('repeat')}<span></span></span><span class="task-reminder">${icon('bell')}<span></span></span><span class="task-details">${icon('note')}تفاصيل</span></span></span></label><button class="task-more">${icon('more')}</button>`;
        const cb = $('.task-check', row);
        cb.checked = t.done; cb.dataset.taskCheck = t.id;
        cb.setAttribute('aria-label', `${t.done ? 'إعادة فتح' : 'إكمال'} مهمة: ${t.title}`);
        $('.task-title', row).textContent = t.title;
        $('.task-category', row).classList.add(`cat-${t.category}`);
        $('.task-category>span', row).textContent = categories[t.category];
        $('.task-priority', row).hidden = t.priority !== 'high' || t.done;
        const due = $('.task-due', row); due.textContent = dueLabel(t); due.hidden = !due.textContent; due.classList.toggle('overdue', !!t.due && t.due < dayKey() && !t.done);
        $('.task-repeat', row).hidden = t.repeat === 'none'; $('.task-repeat>span', row).textContent = repeatLabels[t.repeat];
        $('.task-reminder', row).hidden = !t.reminder; $('.task-reminder>span', row).textContent = t.reminder;
        $('.task-details', row).hidden = !t.details;
        const more = $('.task-more', row); more.dataset.editTask = t.id; more.title = 'تعديل أو حذف'; more.setAttribute('aria-label', `تعديل أو حذف: ${t.title}`);
        return row;
      }
      function renderEmpty(list, view, searching) {
        const f = filters[view];
        const e = document.createElement('div');
        e.className = 'empty-state';
        e.innerHTML = `${icon('leaf')}<h3></h3><p></p><button class="button button-secondary"></button>`;
        $('h3', e).textContent = searching ? 'مفيش مهمة بالوصف ده.' : f === 'done' ? 'الإنجاز الجاي مستنيك.' : f === 'active' ? 'مفيش حاجة معلّقة. خُد نفس.' : 'مساحة جديدة لخطوة صغيرة.';
        $('p', e).textContent = searching ? 'جرّب كلمة تانية أو غيّر الفلاتر.' : f === 'done' ? 'علّم على مهمة خلصتها، وهتلاقيها هنا.' : f === 'active' ? 'تقدر تضيف خطوة جديدة، أو تستمتع بشوية هدوء.' : 'اختار حاجة بسيطة تحب تعملها النهارده.';
        const b = $('button', e);
        b.textContent = searching ? 'امسح الفلاتر' : f === 'done' ? 'شوف كل المهام' : 'أضف أول خطوة';
        if (searching) b.dataset.action = 'clear-filters'; else if (f === 'done') { b.dataset.filter = 'all'; b.dataset.filterView = view; } else b.dataset.action = 'new-task';
        list.append(e);
      }
      function renderTasks() {
        const focusedId = document.activeElement?.dataset.taskCheck;
        const q = $('#task-search').value.trim().toLocaleLowerCase('ar');
        const cat = $('#category-filter').value, sort = $('#task-sort').value, dateF = $('#date-filter').value;
        const today = dayKey(), tomorrow = shiftDay(today, 1), weekEnd = shiftDay(today, 6);
        const matchesDate = t => dateF === 'today' ? t.due === today : dateF === 'tomorrow' ? t.due === tomorrow : dateF === 'week' ? (t.due && t.due >= today && t.due <= weekEnd) : dateF === 'overdue' ? (t.due && t.due < today && !t.done) : dateF === 'nodate' ? !t.due : true;
        for (const view of ['today', 'tasks']) {
          const base = view === 'today' ? todayTasks() : state.tasks;
          const searched = base.filter(t => view === 'today' || ((!q || t.title.toLocaleLowerCase('ar').includes(q) || t.details.toLocaleLowerCase('ar').includes(q)) && (cat === 'all' || t.category === cat) && matchesDate(t)));
          const counts = { all: searched.length, active: searched.filter(t => !t.done).length, done: searched.filter(t => t.done).length };
          $$(`[data-count-view="${view}"]`).forEach(e => { e.textContent = counts[e.dataset.count]; });
          $$(`.filter-tab[data-filter-view="${view}"]`).forEach(b => { const on = b.dataset.filter === filters[view]; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
          const tasks = searched.filter(t => filters[view] === 'all' || (filters[view] === 'done' ? t.done : !t.done));
          tasks.sort((a, b) => {
            if (a.done !== b.done) return Number(a.done) - Number(b.done);
            if (view === 'tasks' && sort === 'priority' && a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
            if (view === 'tasks' && sort === 'date' && a.due !== b.due) return (a.due || '9999').localeCompare(b.due || '9999');
            if (view === 'today' && a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
            return b.createdAt - a.createdAt;
          });
          const list = view === 'today' ? $('#dashboard-task-list') : $('#all-task-list');
          list.replaceChildren(...tasks.map(createTaskRow));
          if (!tasks.length) renderEmpty(list, view, view === 'tasks' && !!(q || cat !== 'all' || dateF !== 'all'));
          if (view === 'tasks') $('#tasks-summary').textContent = `${tasks.length} مهمة ظاهرة من ${state.tasks.length}. المهام اللي موعدها فات بتفضل معاك لحد ما تخلصها.`;
        }
        const td = todayTasks(), completed = td.filter(t => t.done).length, goal = state.settings.dailyGoal;
        const percent = td.length ? Math.round(completed / td.length * 100) : 0;
        $('#progress-percent').textContent = `${percent}%`;
        $('#progress-fill').style.width = `${percent}%`;
        $('#daily-progress').setAttribute('aria-valuenow', String(percent));
        $('#progress-message').textContent = !td.length ? 'يوم جديد. ابدأ بحاجة بسيطة.' : completed === td.length ? 'كل خطواتك خلصت. تستاهل شوية راحة!' : completed ? `خلصت ${completed} من ${td.length}. كل خطوة صغيرة بتفرق.` : 'أول خطوة هي أهم خطوة.';
        $('#goal-text').textContent = completed >= goal ? `وصلت لهدفك اليومي (${goal}) ✨` : `هدفك اليومي: ${goal} مهام · فاضل ${goal - completed}`;
        $('#today-description').textContent = td.filter(t => !t.done).length ? `عندك ${td.filter(t => !t.done).length} خطوة النهارده. ابدأ بواحدة.` : 'شوية تركيز، خطوة صغيرة، ويوم أخف.';
        renderFocusTaskOptions();
        if (focusedId) $$('[data-task-check]', activeView === 'tasks' ? $('#all-task-list') : $('#dashboard-task-list')).find(i => i.dataset.taskCheck === focusedId)?.focus({ preventScroll: true });
      }
      function renderFocusTaskOptions() {
        const sel = $('#focus-task');
        sel.replaceChildren(new Option('جلسة من غير مهمة محددة', ''));
        state.tasks.filter(t => !t.done).forEach(t => sel.add(new Option(t.title, t.id)));
        if (!state.tasks.some(t => t.id === state.timer.taskId && !t.done)) state.timer.taskId = '';
        sel.value = state.timer.taskId;
      }
      function openTask(id = '') {
        const t = state.tasks.find(x => x.id === id);
        $('#task-form').reset();
        $('#task-id').value = t?.id || '';
        $('#task-title-input').value = t?.title || '';
        $('#task-category-input').value = t?.category || 'personal';
        $('#task-priority-input').value = t?.priority || 'normal';
        $('#task-date-input').value = t ? t.due : dayKey();
        $('#task-reminder-input').value = t?.reminder || '';
        $('#task-repeat-input').value = t?.repeat || 'none';
        $('#task-details-input').value = t?.details || '';
        $('#task-dialog-title').textContent = t ? 'خطوتك، بطريقتك.' : 'خطوة جديدة.';
        $('#task-submit-button').textContent = t ? 'احفظ التعديل' : 'أضف الخطوة';
        $('#delete-task-button').hidden = !t;
        $('#task-dialog').showModal();
        requestAnimationFrame(() => $('#task-title-input').focus());
      }
      function addTask(values) {
        if (state.tasks.length >= 500) { showToast('وصلت لحد ٥٠٠ مهمة. احذف بعض القديم علشان تضيف جديد.'); return false; }
        state.tasks.unshift({ id: uid(), title: values.title.trim().slice(0, 160), category: values.category || 'personal', priority: values.priority || 'normal', due: values.due ?? dayKey(), done: false, createdAt: Date.now(), completedAt: null, repeat: values.repeat || 'none', reminder: values.reminder || '', details: values.details || '', remindedOn: '', spawned: false });
        filters.today = 'all'; filters.tasks = 'all';
        saveState(); refresh();
        return true;
      }
      function toggleTask(id, done) {
        const t = state.tasks.find(x => x.id === id);
        if (!t) return;
        const before = todayTasks().filter(x => x.done).length;
        t.done = done; t.completedAt = done ? Date.now() : null;
        if (done && state.timer.taskId === id) state.timer.taskId = '';
        if (done && t.repeat !== 'none' && !t.spawned) {
          t.spawned = true;
          const base = t.due && t.due > dayKey() ? t.due : dayKey();
          const next = t.repeat === 'daily' ? shiftDay(base, 1) : t.repeat === 'weekly' ? shiftDay(base, 7) : shiftMonth(base);
          state.tasks.push({ ...t, id: uid(), done: false, completedAt: null, due: next, createdAt: Date.now(), remindedOn: '', spawned: false });
          showToast(`اتجدولت المرة الجاية: ${fmtDay(next, { weekday: 'long', day: 'numeric', month: 'short' })}.`);
        }
        saveState(); refresh();
        const td = todayTasks(), after = td.filter(x => x.done).length;
        if (done && td.length && after === td.length) { celebrate(); showToast('كل خطوات النهارده خلصت. إنجاز يستاهل تفرح بيه!'); }
        else if (done && before < state.settings.dailyGoal && after >= state.settings.dailyGoal) { celebrate(); showToast(`وصلت لهدفك اليومي (${state.settings.dailyGoal} مهام). أحسنت!`); }
      }
      function deleteTask() {
        const id = $('#task-id').value, index = state.tasks.findIndex(t => t.id === id);
        if (index < 0) return;
        const [t] = state.tasks.splice(index, 1);
        if (state.timer.taskId === id) state.timer.taskId = '';
        $('#task-dialog').close(); saveState(); refresh();
        showToast('المهمة اتمسحت. مفيش مشكلة تغيّر خطتك.', 'تراجع', () => { if (!state.tasks.some(x => x.id === t.id)) state.tasks.splice(Math.min(index, state.tasks.length), 0, t); saveState(); refresh(); showToast('المهمة رجعت لمكانها.'); });
      }
      function checkReminders(force = false) {
        const now = Date.now();
        if (!force && now - lastReminderCheck < 15000) return;
        lastReminderCheck = now;
        const today = dayKey(), d = new Date(), hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
        let changed = false;
        state.tasks.forEach(t => {
          if (t.done || !t.reminder || t.due !== today || t.remindedOn === today || t.reminder > hm) return;
          t.remindedOn = today; changed = true;
          notify(`تذكير: ${t.title}`, 'وقتها دلوقتي. خطوة صغيرة وتخلص.', `task-${t.id}`);
        });
        if (changed) saveState();
      }
      function notify(title, body, tag) {
        showToast(`${title} · ${body}`);
        playChime();
        if ((state.settings.notifications || (tag?.startsWith('prayer-') && state.islam.prayerAlerts)) && 'Notification' in window && Notification.permission === 'granted' && document.hidden) {
          try { new Notification(title, { body, tag, icon: 'icon.svg', lang: 'ar', dir: 'rtl' }); } catch { }
        }
      }


      function ensureQuickNote() {
        let n = state.notes.find(x => x.id === 'quick');
        if (!n) { n = { id: 'quick', title: 'أفكار سريعة', body: '', pinned: true, createdAt: Date.now(), updatedAt: Date.now() }; state.notes.unshift(n); }
        return n;
      }
      function sortedNotes() { return [...state.notes].sort((a, b) => (Number(b.pinned) - Number(a.pinned)) || b.updatedAt - a.updatedAt); }
      function renderNotes() {
        const q = $('#notes-search').value.trim().toLocaleLowerCase('ar');
        const notes = sortedNotes().filter(n => !q || n.title.toLocaleLowerCase('ar').includes(q) || n.body.toLocaleLowerCase('ar').includes(q));
        if (!state.notes.some(n => n.id === activeNoteId)) activeNoteId = notes[0]?.id || '';
        const list = $('#notes-list');
        list.replaceChildren(...notes.map(n => {
          const b = document.createElement('button');
          b.className = `note-item${n.id === activeNoteId ? ' active' : ''}`;
          b.dataset.noteId = n.id;
          b.innerHTML = `<span class="note-item-title">${n.pinned ? icon('pin') : ''}<span></span></span><span class="note-item-snippet"></span><span class="note-item-date"></span>`;
          $('.note-item-title>span', b).textContent = n.title || 'بدون عنوان';
          $('.note-item-snippet', b).textContent = n.body.trim().split('\n')[0].slice(0, 90) || 'ملاحظة فاضية';
          $('.note-item-date', b).textContent = new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date(n.updatedAt));
          return b;
        }));
        if (!notes.length) { const e = document.createElement('p'); e.className = 'section-caption'; e.style.padding = '20px 6px'; e.textContent = q ? 'مفيش ملاحظة بالكلمة دي.' : 'لسه مفيش ملاحظات. ابدأ بواحدة.'; list.append(e); }
        const n = state.notes.find(x => x.id === activeNoteId);
        const doc = $('.notes-document');
        $$('.document-toolbar .icon-button:not(.back-button), #note-title-input, #notes-editor', doc).forEach(el => { el.disabled = !n; });
        if (n) {
          if (document.activeElement !== $('#note-title-input')) $('#note-title-input').value = n.title;
          if (document.activeElement !== $('#notes-editor')) $('#notes-editor').value = n.body;
          $('#pin-note-button').classList.toggle('active', n.pinned);
          const words = n.body.trim() ? n.body.trim().split(/\s+/u).length : 0;
          $('#note-word-count').textContent = `${words} كلمة · ${n.body.length} حرف · آخر تعديل ${new Intl.DateTimeFormat('ar-EG', { hour: 'numeric', minute: '2-digit' }).format(new Date(n.updatedAt))}`;
        } else { $('#note-title-input').value = ''; $('#notes-editor').value = ''; $('#note-word-count').textContent = 'اختار ملاحظة أو أنشئ واحدة جديدة.'; }
        const quick = state.notes.find(x => x.id === 'quick');
        if (document.activeElement !== $('#quick-note')) $('#quick-note').value = quick?.body || '';
      }
      function scheduleNoteSave() {
        $$('[data-note-status]').forEach(e => { e.textContent = 'جارٍ الحفظ...'; });
        clearTimeout(noteSaveTimeout);
        noteSaveTimeout = setTimeout(() => { saveState(); renderNotes(); $$('[data-note-status]').forEach(e => { e.textContent = storageAvailable ? 'محفوظة تلقائيا' : 'الحفظ المحلي غير متاح'; }); }, 450);
      }
      function newNote() {
        if (state.notes.length >= 300) { showToast('وصلت لحد ٣٠٠ ملاحظة. احذف شوية قديم الأول.'); return; }
        const n = { id: uid(), title: '', body: '', pinned: false, createdAt: Date.now(), updatedAt: Date.now() };
        state.notes.unshift(n); activeNoteId = n.id; $('#notes-search').value = '';
        saveState(); navigate('notes'); $('#notes-layout').dataset.mode = 'editor'; renderNotes();
        requestAnimationFrame(() => $('#note-title-input').focus());
      }
      async function deleteNote() {
        const n = state.notes.find(x => x.id === activeNoteId);
        if (!n) return;
        if ((n.title || n.body.trim()) && !await askConfirm('نمسح الملاحظة؟', 'تقدر تتراجع خلال ثواني من التنبيه اللي هيظهر.', 'امسح', true)) return;
        const index = state.notes.indexOf(n);
        state.notes.splice(index, 1); activeNoteId = '';
        saveState(); renderNotes(); $('#notes-layout').dataset.mode = 'list';
        showToast('الملاحظة اتمسحت.', 'تراجع', () => { state.notes.splice(Math.min(index, state.notes.length), 0, n); activeNoteId = n.id; saveState(); renderNotes(); });
      }
      async function shareNote() {
        const n = state.notes.find(x => x.id === activeNoteId);
        if (!n || !(n.title || n.body.trim())) { showToast('اكتب حاجة الأول، وبعدها شاركها.'); return; }
        const text = `${n.title ? n.title + '\n\n' : ''}${n.body}`;
        if (navigator.share) { try { await navigator.share({ title: n.title || 'ملاحظة من يومك', text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
        try { await navigator.clipboard.writeText(text); showToast('الملاحظة اتنسخت. خدها معاك.'); }
        catch { $('#notes-editor').focus(); $('#notes-editor').select(); showToast('حدّدنا النص. استخدم أمر النسخ في جهازك.'); }
      }


      const last7 = () => [...Array(7)].map((_, i) => shiftDay(dayKey(), i - 6));
      function habitStreak(h) { let k = dayKey(); if (!h.log[k]) k = shiftDay(k, -1); let s = 0; while (h.log[k] && s < 3650) { s++; k = shiftDay(k, -1); } return s; }
      const weekCount = h => last7().filter(k => h.log[k]).length;
      function renderHabits() {
        const today = dayKey(), days = last7();
        const list = $('#habits-list');
        list.replaceChildren(...state.habits.map(h => {
          const row = document.createElement('div');
          row.className = 'habit-row';
          row.innerHTML = `<button class="habit-main"><span class="habit-emoji"></span><span><span class="habit-name"></span><span class="habit-sub"></span></span></button><span class="habit-streak"></span><div class="habit-days">${days.map(k => `<button class="habit-day${h.log[k] ? ' done' : ''}${k === today ? ' today' : ''}" data-habit-id="${h.id}" data-day="${k}" aria-pressed="${!!h.log[k]}"><span class="hd-label">${fmtDay(k, { weekday: 'narrow' })}</span><span class="hd-dot">${icon('check')}</span></button>`).join('')}</div>`;
          $('.habit-main', row).dataset.editHabit = h.id;
          $('.habit-emoji', row).textContent = h.emoji;
          $('.habit-name', row).textContent = h.name;
          const wc = weekCount(h);
          $('.habit-sub', row).textContent = `${wc} من ${h.target} الأسبوع ده${wc >= h.target ? ' · حققت هدفك ✓' : ''}`;
          const s = habitStreak(h);
          $('.habit-streak', row).textContent = s ? `🔥 ${s} ${s === 1 ? 'يوم' : s === 2 ? 'يومين' : s <= 10 ? 'أيام' : 'يوم'}` : 'ابدأ سلسلة';
          $$('.habit-day', row).forEach(b => b.setAttribute('aria-label', `${h.name}: ${fmtDay(b.dataset.day, { weekday: 'long', day: 'numeric' })}`));
          return row;
        }));
        if (!state.habits.length) { const e = document.createElement('div'); e.className = 'empty-state'; e.innerHTML = `${icon('habit')}<h3>عادة واحدة صغيرة كفاية للبداية.</h3><p>كوباية مية، صفحة كتاب، أو ١٠ دقايق مشي.</p><button class="button button-secondary" data-action="new-habit">أضف أول عادة</button>`; list.append(e); }
        const doneToday = state.habits.filter(h => h.log[today]).length;
        $('#habits-description').textContent = state.habits.length ? `خلصت ${doneToday} من ${state.habits.length} النهارده. علّم على عادة كل ما تعملها.` : 'علّم على عادة كل ما تعملها، وشوف سلسلتك بتطول.';
        const dash = $('#dashboard-habits');
        dash.replaceChildren(...state.habits.slice(0, 5).map(h => {
          const b = document.createElement('button');
          b.className = h.log[today] ? 'done' : ''; b.dataset.habitId = h.id; b.dataset.day = today;
          b.innerHTML = `<span></span><span class="hq-name"></span><span class="hq-check">${icon('check')}</span>`;
          b.firstChild.textContent = h.emoji; $('.hq-name', b).textContent = h.name;
          b.setAttribute('aria-pressed', String(!!h.log[today]));
          return b;
        }));
        if (!state.habits.length) { const b = document.createElement('button'); b.dataset.view = 'habits'; b.textContent = '+ أضف أول عادة'; dash.append(b); }
        $('#dash-habits-caption').textContent = state.habits.length ? (doneToday === state.habits.length ? 'كلها خلصت. يوم مظبوط!' : `${doneToday} من ${state.habits.length} خلصت`) : 'حاجات صغيرة بتفرق.';
      }
      function toggleHabitDay(id, key) {
        const h = state.habits.find(x => x.id === id);
        if (!h || key > dayKey()) return;
        if (h.log[key]) delete h.log[key]; else h.log[key] = true;
        saveState(); refresh();
        if (key === dayKey() && h.log[key] && state.habits.every(x => x.log[key])) { celebrate(); showToast('كل عاداتك النهارده خلصت. استمرارية جميلة!'); }
      }
      function openHabit(id = '') {
        const h = state.habits.find(x => x.id === id);
        $('#habit-form').reset();
        $('#habit-id').value = h?.id || '';
        $('#habit-name-input').value = h?.name || '';
        $('#habit-target-input').value = String(h?.target || 7);
        $('#emoji-picker').dataset.value = h?.emoji || EMOJIS[0];
        $$('#emoji-picker button').forEach(b => b.classList.toggle('active', b.textContent === $('#emoji-picker').dataset.value));
        $('#habit-dialog-title').textContent = h ? 'عدّل عادتك.' : 'عادة جديدة.';
        $('#habit-submit-button').textContent = h ? 'احفظ التعديل' : 'أضف العادة';
        $('#delete-habit-button').hidden = !h;
        $('#habit-dialog').showModal();
        requestAnimationFrame(() => $('#habit-name-input').focus());
      }
      async function deleteHabit() {
        const id = $('#habit-id').value, h = state.habits.find(x => x.id === id);
        if (!h) return;
        if (!await askConfirm('نمسح العادة؟', 'سجل الأيام اللي علّمت عليها هيتمسح معاها.', 'امسح', true)) return;
        state.habits = state.habits.filter(x => x.id !== id);
        $('#habit-dialog').close(); saveState(); refresh();
        showToast('العادة اتمسحت.', 'تراجع', () => { state.habits.push(h); saveState(); refresh(); });
      }
      function renderMood() {
        const m = state.moods[dayKey()];
        const wrap = $('#mood-buttons');
        if (!wrap.children.length) wrap.append(...MOODS.map(([e], i) => { const b = document.createElement('button'); b.dataset.mood = String(i + 1); b.textContent = e; b.setAttribute('aria-label', MOODS[i][1]); return b; }));
        $$('button', wrap).forEach(b => { b.classList.toggle('active', m?.score === Number(b.dataset.mood)); b.setAttribute('aria-pressed', String(m?.score === Number(b.dataset.mood))); });
        $('#mood-message').textContent = m ? MOODS[m.score - 1][1] : 'اختار الوش اللي أقرب لإحساسك.';
      }


      function barChart(values, labels, label) {
        const max = Math.max(1, ...values), w = 320, h = 110, pad = 10, bw = (w - pad * 2) / values.length;
        return `<svg viewBox="0 0 ${w} ${h + 24}" class="chart" role="img" aria-label="${label}">${values.map((v, i) => { const bh = Math.round(v / max * (h - 16)); const x = pad + i * bw + bw * .2; return `<rect x="${x}" y="${h - bh}" width="${bw * .6}" height="${bh}" rx="5" fill="var(--accent)" opacity="${v ? .85 : .18}"/><text x="${x + bw * .3}" y="${h + 16}" text-anchor="middle" font-size="10" fill="currentColor">${labels[i]}</text>${v ? `<text x="${x + bw * .3}" y="${h - bh - 5}" text-anchor="middle" font-size="10" font-weight="600" fill="currentColor">${v}</text>` : ''}`; }).join('')}</svg>`;
      }
      function renderInsights() {
        const days = last7(), today = dayKey();
        const labels = days.map(k => fmtDay(k, { weekday: 'short' }));
        const doneBy = k => state.tasks.filter(t => t.done && t.completedAt && dayKey(new Date(t.completedAt)) === k).length;
        const focusBy = k => state.sessions.filter(s => s.date === k).reduce((a, s) => a + s.minutes, 0);
        const completed7 = days.map(doneBy), focus7 = days.map(focusBy);
        let streak = 0, k = doneBy(today) ? today : shiftDay(today, -1);
        while (doneBy(k) && streak < 3650) { streak++; k = shiftDay(k, -1); }
        const totalDone = state.tasks.filter(t => t.done).length, totalFocus = state.sessions.reduce((a, s) => a + s.minutes, 0);
        const habitPct = state.habits.length ? Math.round(state.habits.reduce((a, h) => a + Math.min(1, weekCount(h) / h.target), 0) / state.habits.length * 100) : null;
        const best = Math.max(...completed7), bestDay = best ? fmtDay(days[completed7.indexOf(best)], { weekday: 'long' }) : null;
        const cats = Object.keys(categories).map(c => [categories[c], state.tasks.filter(t => t.category === c).length]);
        const catMax = Math.max(1, ...cats.map(c => c[1]));
        const moodDays = [...Array(14)].map((_, i) => shiftDay(today, i - 13));
        const moodVals = moodDays.map(d => state.moods[d]?.score).filter(Boolean);
        const moodAvg = moodVals.length ? MOODS[Math.round(moodVals.reduce((a, b) => a + b, 0) / moodVals.length) - 1][0] : '—';
        const stat = (label, value, unit = '') => `<div class="surface stat-card"><p class="stat-label">${label}</p><p class="stat-value number">${value}${unit ? `<small>${unit}</small>` : ''}</p></div>`;
        $('#insights-content').innerHTML = `
          <div class="stats-grid">
            ${stat('مهام خلصتها الأسبوع ده', completed7.reduce((a, b) => a + b, 0), 'مهمة')}
            ${stat('دقايق تركيز الأسبوع ده', focus7.reduce((a, b) => a + b, 0), 'دقيقة')}
            ${stat('سلسلة أيام الإنجاز', streak, streak === 1 ? 'يوم' : 'أيام')}
            ${stat('التزامك بعاداتك', habitPct === null ? '—' : habitPct, habitPct === null ? '' : '%')}
            ${stat('إجمالي المهام المكتملة', totalDone, 'مهمة')}
            ${stat('إجمالي وقت التركيز', totalFocus >= 120 ? Math.round(totalFocus / 60) : totalFocus, totalFocus >= 120 ? 'ساعة' : 'دقيقة')}
          </div>
          <div class="charts-grid">
            <div class="surface chart-card"><h3>إنجازك خلال الأسبوع</h3><p class="section-caption">${bestDay ? `أحسن يوم كان ${bestDay} بـ ${best} ${best === 1 ? 'مهمة' : 'مهام'}.` : 'أول مهمة تخلصها هتظهر هنا.'}</p>${barChart(completed7, labels, 'المهام المكتملة في آخر سبعة أيام')}</div>
            <div class="surface chart-card"><h3>دقايق التركيز</h3><p class="section-caption">${focus7.some(Boolean) ? `${state.sessions.filter(s => days.includes(s.date)).length} جلسة الأسبوع ده.` : 'ابدأ أول جلسة تركيز وشوفها هنا.'}</p>${barChart(focus7, labels, 'دقائق التركيز في آخر سبعة أيام')}</div>
            <div class="surface chart-card"><h3>مزاجك آخر أسبوعين</h3><p class="section-caption">${moodVals.length ? `المتوسط ${moodAvg} من ${moodVals.length} ${moodVals.length === 1 ? 'يوم' : 'أيام'} مسجلة.` : 'سجّل مزاجك من الصفحة الرئيسية.'}</p><div class="mood-history">${moodDays.map(d => `<span title="${fmtDay(d, { weekday: 'long', day: 'numeric', month: 'short' })}">${state.moods[d] ? MOODS[state.moods[d].score - 1][0] : '·'}</span>`).join('')}</div></div>
            <div class="surface chart-card"><h3>مهامك حسب التصنيف</h3><p class="section-caption">فين بيروح وقتك؟</p><div class="cat-bars">${cats.map(([n, v]) => `<div class="cat-bar"><div><span>${n}</span><span class="number">${v}</span></div><i><b style="width:${Math.round(v / catMax * 100)}%"></b></i></div>`).join('')}</div></div>
          </div>`;
      }

      function switchIslamTab(tab) {
        islamTab = ISLAM_TABS.includes(tab) ? tab : 'home';
        navigate('islam');
        $$('#view-islam .islam-panel').forEach(panel => { panel.hidden = panel.id !== `islam-${islamTab}`; });
        $$('[data-islam-tab]').forEach(button => {
          const active = button.dataset.islamTab === islamTab;
          button.classList.toggle('active', active);
          button.setAttribute('aria-selected', String(active));
          button.tabIndex = active ? 0 : -1;
        });
        if (islamTab === 'quran') { renderSurahList(); renderQuranBookmarks(); loadSurahIndex(); updateQuranCacheCount(); }
        if (islamTab === 'adhkar') renderAdhkar();
        if (islamTab === 'tasbih') renderTasbih();
        if (islamTab === 'qibla') renderQibla();
        if (islamTab === 'prayer') renderPrayer();
        $('#view-islam').scrollIntoView({ block: 'start', behavior: 'smooth' });
      }

      function dateInZone(date = new Date(), zone = state.islam.zone) {
        try {
          const parts = new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
          const part = name => parts.find(x => x.type === name)?.value;
          return `${part('year')}-${part('month')}-${part('day')}`;
        } catch { return dayKey(date); }
      }
      function secondsInZone(date = new Date(), zone = state.islam.zone) {
        try {
          const parts = new Intl.DateTimeFormat('en-GB', { timeZone: zone, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }).formatToParts(date);
          const part = name => Number(parts.find(x => x.type === name)?.value || 0);
          return part('hour') * 3600 + part('minute') * 60 + part('second');
        } catch { return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds(); }
      }
      const prayerSeconds = time => Number(time.slice(0, 2)) * 3600 + Number(time.slice(3, 5)) * 60;
      function readablePrayerTime(time) {
        if (!time) return '--:--';
        const hours = Number(time.slice(0, 2)), minutes = time.slice(3, 5);
        return `${String((hours + 11) % 12 + 1).padStart(2, '0')}:${minutes} ${hours < 12 ? 'ص' : 'م'}`;
      }
      function nextPrayer() {
        const day = dateInZone(), now = secondsInZone(), i = state.islam;
        const schedule = i.prayerCache[day]?.timings;
        if (!schedule) return null;
        for (const name of OBLIGATORY) {
          const at = prayerSeconds(schedule[name]);
          if (at > now) return { name, at: schedule[name], remaining: at - now, tomorrow: false };
        }
        const nextDay = i.prayerCache[shiftDay(day, 1)]?.timings;
        return nextDay ? { name: 'Fajr', at: nextDay.Fajr, remaining: 86400 - now + prayerSeconds(nextDay.Fajr), tomorrow: true } : null;
      }
      function islamHijriLabel() {
        const info = state.islam.prayerCache[dateInZone()]?.hijri;
        if (info?.month) return `${info.day.toLocaleString('ar-EG')} ${info.month} ${info.year.toLocaleString('ar-EG')} هـ`;
        try { return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric', timeZone: state.islam.zone }).format(new Date()) + ' هـ (تقريبي)'; }
        catch { return 'ركنك الروحاني'; }
      }
      function updatePrayerCountdown() {
        const prayer = nextPrayer();
        $('#islam-hijri').textContent = islamHijriLabel();
        if (!prayer) {
          $('#prayer-next-name').textContent = state.islam.prayerCache[dateInZone()] ? 'مواقيت بكرة غير متاحة' : 'بانتظار مواقيت اليوم';
          $('#prayer-next-countdown').textContent = '--:--:--';
          $('#prayer-next-at').textContent = '';
          $('#islam-cover-prayer').textContent = state.islam.prayerCache[dateInZone()] ? 'حمّل مواقيت الشهر القادم لتعرف صلاة الفجر.' : 'حدد موقعك واتصل بالإنترنت أول مرة لعرض الصلاة القادمة.';
          return;
        }
        const remaining = Math.max(0, prayer.remaining);
        const counter = `${String(Math.floor(remaining / 3600)).padStart(2, '0')}:${String(Math.floor(remaining % 3600 / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
        $('#prayer-next-name').textContent = `${PRAYER_NAMES[prayer.name]}${prayer.tomorrow ? ' بكرة' : ''}`;
        $('#prayer-next-city').textContent = state.islam.cityName;
        $('#prayer-next-countdown').textContent = counter;
        $('#prayer-next-at').textContent = `عند ${readablePrayerTime(prayer.at)} بتوقيت ${state.islam.cityName}`;
        $('#islam-cover-prayer').replaceChildren(document.createTextNode(`صلاة ${PRAYER_NAMES[prayer.name]} بعد `));
        const strong = document.createElement('strong'); strong.textContent = counter;
        $('#islam-cover-prayer').append(strong, document.createTextNode(` · ${state.islam.cityName}`));
      }
      function createPrayerLine(name, day, value, nextName) {
        const line = document.createElement('div');
        line.className = `islam-prayer-line${name === nextName ? ' next' : ''}`;
        const title = document.createElement('span'); title.textContent = PRAYER_NAMES[name];
        const right = document.createElement('span'); right.className = 'prayer-time';
        if (name === 'Sunrise') { const small = document.createElement('small'); small.textContent = 'ليس صلاة'; right.append(small); }
        else {
          const button = document.createElement('button');
          button.dataset.prayerCheck = name;
          button.classList.toggle('done', (state.islam.prayerLog[day] || []).includes(name));
          button.setAttribute('aria-pressed', String(button.classList.contains('done')));
          button.setAttribute('aria-label', `تسجيل صلاة ${PRAYER_NAMES[name]}`);
          button.title = `سجّل صلاة ${PRAYER_NAMES[name]}`;
          button.innerHTML = icon('check'); right.append(button);
        }
        const time = document.createElement('span'); time.className = 'number'; time.textContent = readablePrayerTime(value); right.append(time);
        line.append(title, right);
        return line;
      }
      function renderPrayer() {
        const i = state.islam, citySelect = $('#prayer-city');
        if (!citySelect.options.length) {
          CITIES.forEach(city => citySelect.add(new Option(city[1], city[0])));
          citySelect.add(new Option('موقعي الحالي', 'gps'));
          citySelect.add(new Option('إحداثيات مخصصة', 'custom'));
        }
        citySelect.value = i.city;
        $('#prayer-method').value = String(i.method);
        $('#prayer-school').value = String(i.school);
        $('#prayer-location-caption').textContent = `${i.cityName} · اختر طريقة الحساب المتبعة في مسجدك.`;
        $('#islam-location-home').textContent = `الموقع: ${i.cityName}`;
        $('#qibla-city').textContent = i.cityName;
        const day = dateInZone(), schedule = i.prayerCache[day], time = schedule?.timings, upcoming = nextPrayer();
        $('#prayer-date-label').textContent = schedule ? `${fmtDay(day, { weekday: 'long', day: 'numeric', month: 'long' })} · ${islamHijriLabel()}` : fmtDay(day, { weekday: 'long', day: 'numeric', month: 'long' });
        const emptyMessage = navigator.onLine ? 'بنحمّل مواقيت الشهر. لو النت بطيء، استنى لحظة أو جرّب تاني.' : 'مفيش مواقيت محفوظة لليوم ده. افتح القسم مرة وأنت متصل علشان يتحفظ الشهر للقراءة بدون نت.';
        for (const [container, compact] of [[$('#prayer-full-list'), false], [$('#islam-home-prayers'), true]]) {
          if (time) container.replaceChildren(...(compact ? OBLIGATORY : PRAYER_KEYS).map(name => createPrayerLine(name, day, time[name], upcoming?.tomorrow ? '' : upcoming?.name)));
          else { const message = document.createElement('p'); message.className = 'islam-status'; message.textContent = emptyMessage; container.replaceChildren(message); }
        }
        const logged = (i.prayerLog[day] || []).length;
        $('#prayer-log-summary').textContent = `${logged} من ٥ صلوات سجلتها النهارده.`;
        const week = $('#prayer-week'); week.replaceChildren(...[...Array(7)].map((_, n) => {
          const date = shiftDay(day, n - 6), col = document.createElement('div');
          col.className = 'prayer-week-col';
          const name = document.createElement('span'); name.textContent = fmtDay(date, { weekday: 'short' });
          const dots = document.createElement('span'); dots.className = 'week-dots';
          OBLIGATORY.forEach(p => { const dot = document.createElement('i'); dot.classList.toggle('filled', (i.prayerLog[date] || []).includes(p)); dots.append(dot); });
          col.title = `${fmtDay(date)} · ${(i.prayerLog[date] || []).length} من ٥`; col.append(name, dots); return col;
        }));
        $('#prayer-data-source').textContent = schedule ? 'المواعيد من AlAdhan ومحفوظة لشهرين على جهازك. قد تختلف عن مسجدك بدقائق حسب طريقة الحساب والتوقيت الصيفي. الشروق ليس صلاة مفروضة.' : 'المواقيت تحتاج اتصالا أول مرة. لا نعرض وقتا تقديريا غير موثوق عندما لا توجد بيانات.';
        const alerts = $('#prayer-alert-toggle');
        alerts.setAttribute('aria-pressed', String(i.prayerAlerts));
        alerts.lastChild.textContent = i.prayerAlerts ? 'تنبيهات الصلاة مفعّلة والتطبيق مفتوح' : 'فعّل تنبيهات الصلاة والتطبيق مفتوح';
        updatePrayerCountdown();
      }
      function togglePrayerCheck(name) {
        if (!OBLIGATORY.includes(name) || !state.islam.prayerCache[dateInZone()]) return;
        const day = dateInZone();
        state.islam.prayerLog[day] ||= [];
        const list = state.islam.prayerLog[day], index = list.indexOf(name);
        if (index >= 0) list.splice(index, 1); else list.push(name);
        saveState(); renderPrayer();
        if (index < 0 && list.length === 5) showToast('سجلت الخمس صلوات النهارده. تقبّل الله منك.');
      }
      async function loadPrayerCalendar() {
        const i = state.islam, token = ++prayerRequest, lat = i.lat, lon = i.lon, method = i.method, school = i.school;
        const today = dateInZone(), date = fromKey(today);
        const months = [[date.getFullYear(), date.getMonth() + 1]];
        const next = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        months.push([next.getFullYear(), next.getMonth() + 1]);
        if (!navigator.onLine) { renderPrayer(); return; }
        const needed = months.filter(([year, month]) => !i.prayerCache[`${year}-${String(month).padStart(2, '0')}-15`]);
        if (!needed.length) { renderPrayer(); return; }
        await Promise.all(needed.map(async ([year, month]) => {
          try {
            const params = new URLSearchParams({ latitude: String(lat), longitude: String(lon), method: String(method), school: String(school) });
            const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 16000);
            let response;
            try { response = await fetch(`https://api.aladhan.com/v1/calendar/${year}/${month}?${params}`, { signal: controller.signal }); }
            finally { clearTimeout(timeout); }
            if (!response.ok) throw new Error('No timetable');
            const body = await response.json();
            if (token !== prayerRequest || !Array.isArray(body.data)) return;
            const zone = body.data[0]?.meta?.timezone;
            if (zone && /^[A-Za-z0-9_\/+-]{1,65}$/.test(zone)) i.zone = zone;
            body.data.forEach(item => {
              const dateText = item.date?.gregorian?.date;
              if (!/^\d{2}-\d{2}-\d{4}$/.test(dateText || '')) return;
              const [d, m, y] = dateText.split('-'), day = `${y}-${m}-${d}`;
              const timings = Object.fromEntries(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Imsak'].map(key => [key, String(item.timings?.[key] || '').slice(0, 5)]));
              if (!Object.values(timings).every(validTime)) return;
              i.prayerCache[day] = { timings, hijri: { day: Number(item.date?.hijri?.day) || 1, month: String(item.date?.hijri?.month?.ar || '').slice(0, 35), year: Number(item.date?.hijri?.year) || 1447 } };
            });
            const old = Object.keys(i.prayerCache).sort().slice(0, -75);
            old.forEach(key => delete i.prayerCache[key]);
            saveState(); renderPrayer(); renderQibla();
          } catch { if (token === prayerRequest) renderPrayer(); }
        }));
      }
      function setPrayerLocation(cityId, lat, lon, zone, cityName, method) {
        const i = state.islam;
        prayerRequest++;
        Object.assign(i, { city: cityId, lat, lon, zone, cityName, method, prayerCache: {}, prayerNotified: {} });
        saveState(); renderPrayer(); renderQibla(); loadPrayerCalendar();
      }
      function useGeolocation() {
        if (!navigator.geolocation || location.protocol === 'file:') { showToast('الموقع محتاج HTTPS أو localhost. تقدر تختار مدينتك من القائمة.'); return; }
        showToast('بنحدد موقعك. مش هنبعته لخادم، إلا لإحضار مواقيت الصلاة من AlAdhan.');
        navigator.geolocation.getCurrentPosition(position => {
          const lat = Number(position.coords.latitude.toFixed(5)), lon = Number(position.coords.longitude.toFixed(5));
          setPrayerLocation('gps', lat, lon, Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo', 'موقعي الحالي', state.islam.method);
          showToast('اتحدد موقعك، وبنجهز مواعيد الصلاة واتجاه القبلة.');
        }, () => showToast('ما قدرناش نحدد موقعك. اختار مدينتك أو أدخل إحداثياتها.'), { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
      }
      function checkPrayerAlerts() {
        const i = state.islam;
        if (!i.prayerAlerts) return;
        const day = dateInZone(), schedule = i.prayerCache[day]?.timings;
        if (!schedule) return;
        const now = secondsInZone();
        OBLIGATORY.forEach(name => {
          const seconds = prayerSeconds(schedule[name]), key = `${day}:${name}`;
          if (i.prayerNotified[key] || now < seconds || now > seconds + 65) return;
          i.prayerNotified[key] = true;
          Object.keys(i.prayerNotified).filter(k => k.slice(0, 10) < shiftDay(day, -2)).forEach(k => delete i.prayerNotified[k]);
          saveState(); notify(`حان وقت صلاة ${PRAYER_NAMES[name]}`, `بتوقيت ${i.cityName}. تقبّل الله منك.`, `prayer-${key}`);
        });
      }
      function qiblaBearing(lat, lon) {
        const r = Math.PI / 180, a = lat * r, b = 21.4225 * r, diff = (39.8262 - lon) * r;
        const y = Math.sin(diff) * Math.cos(b), x = Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(diff);
        return (Math.atan2(y, x) / r + 360) % 360;
      }
      function renderQibla() {
        const i = state.islam, bearing = qiblaBearing(i.lat, i.lon);
        $('#qibla-city').textContent = i.cityName;
        $('#qibla-bearing').textContent = `${bearing.toFixed(1)}°`;
        $('#qibla-arrow').style.transform = `rotate(${bearing - (compassHeading ?? 0)}deg)`;
        if (compassHeading !== null) $('#qibla-sensor-status').textContent = `السهم بيتحرك مع جهازك. اتجاه القبلة ${bearing.toFixed(1)}° من الشمال الجغرافي. أبعد الجهاز عن المعادن وعاير البوصلة لو احتجت.`;
        else if (!compassListening) $('#qibla-sensor-status').textContent = `اتجاه القبلة ${bearing.toFixed(1)}° من الشمال. فعّل البوصلة عشان السهم يتابع دوران جهازك.`;
      }
      function onDeviceOrientation(event) {
        const heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : event.absolute && Number.isFinite(event.alpha) ? 360 - event.alpha : null;
        if (heading === null) return;
        compassHeading = (heading + 360) % 360;
        renderQibla();
      }
      async function enableCompass() {
        if (!('DeviceOrientationEvent' in window)) { $('#qibla-sensor-status').textContent = 'جهازك مفيهوش حساس اتجاه مدعوم. استخدم الزاوية الظاهرة مع بوصلة الجهاز.'; return; }
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
          try { if (await DeviceOrientationEvent.requestPermission() !== 'granted') { showToast('البوصلة محتاجة إذن الحساس. تقدر تستخدم الزاوية المعروضة.'); return; } }
          catch { showToast('حساس الاتجاه مش متاح. استخدم بوصلة الجهاز مع الزاوية.'); return; }
        }
        if (!compassListening) {
          compassListening = true;
          window.addEventListener('deviceorientationabsolute', onDeviceOrientation);
          window.addEventListener('deviceorientation', onDeviceOrientation);
          $('#qibla-sensor-status').textContent = 'بننتظر بيانات الحساس. لو السهم ما اتحركش، استخدم الزاوية مع بوصلة الجهاز.';
        }
      }

      function offlineSurah(number) {
        const source = OFFLINE_SURAHS[number];
        if (!source) return null;
        return { number, name: `سورة ${SURAH_NAMES[number - 1]}`, numberOfAyahs: source.verses.length, revelationType: 'Meccan', ayahs: source.verses.map((text, index) => ({ number: source.start + index, numberInSurah: index + 1, text, page: source.page, juz: source.juz })) };
      }
      const quranUrl = number => `https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`;
      const quranCacheName = 'yawmak-quran-text-v1';
      function validSurah(data, number) {
        return data && data.number === number && Array.isArray(data.ayahs) && data.ayahs.length > 0 && data.ayahs.length <= 286 && data.ayahs.every((ayah, i) => typeof ayah.text === 'string' && ayah.text.length < 3000 && ayah.numberInSurah === i + 1 && Number.isInteger(ayah.number));
      }
      async function cachedSurah(number) {
        if (!('caches' in window)) return null;
        try {
          const response = await caches.match(quranUrl(number));
          if (!response) return null;
          const body = await response.json();
          return validSurah(body.data, number) ? body.data : null;
        } catch { return null; }
      }
      async function fetchSurah(number) {
        if (loadedSurahs.has(number)) return loadedSurahs.get(number);
        let data = null;
        if (!navigator.onLine) data = await cachedSurah(number);
        if (!data) {
          try {
            const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 15000);
            let response;
            try { response = await fetch(quranUrl(number), { signal: controller.signal }); }
            finally { clearTimeout(timer); }
            if (!response.ok) throw new Error('Quran unavailable');
            const body = await response.clone().json();
            if (!validSurah(body.data, number)) throw new Error('Invalid Quran response');
            data = body.data;
            if ('caches' in window) caches.open(quranCacheName).then(cache => cache.put(quranUrl(number), response)).catch(() => {});
          } catch { data = await cachedSurah(number); }
        }
        data ||= offlineSurah(number);
        if (data) loadedSurahs.set(number, data);
        return data;
      }
      async function loadSurahIndex() {
        if (surahIndex.length === 114) return;
        try {
          const response = await fetch('https://api.alquran.cloud/v1/surah');
          if (!response.ok) return;
          const body = await response.json();
          if (Array.isArray(body.data) && body.data.length === 114 && body.data.every(x => Number.isInteger(x.number) && x.number >= 1 && x.number <= 114)) {
            surahIndex = body.data;
            renderSurahList();
          }
        } catch { }
      }
      function renderSurahList() {
        const query = $('#surah-filter').value.trim();
        const normalized = normalizeArabic(query);
        const list = $('#surah-list');
        const chapters = SURAH_NAMES.map((name, index) => ({ number: index + 1, name, meta: surahIndex[index] }));
        list.replaceChildren(...chapters.filter(x => !query || String(x.number) === query || normalizeArabic(x.name).includes(normalized) || x.meta?.englishName?.toLowerCase().includes(query.toLowerCase())).map(x => {
          const button = document.createElement('button');
          button.className = 'surah-item';
          button.dataset.openSurah = x.number;
          button.innerHTML = `<span class="surah-item-num"></span><span><span class="surah-item-name"></span><span class="surah-item-meta"></span></span>${icon('chevron-left')}`;
          $('.surah-item-num', button).textContent = x.number;
          $('.surah-item-name', button).textContent = `سورة ${x.name}`;
          $('.surah-item-meta', button).textContent = `${x.meta?.numberOfAyahs ? `${x.meta.numberOfAyahs} آية` : 'من المصحف'}${x.meta?.revelationType ? ` · ${x.meta.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}` : ''}${loadedSurahs.has(x.number) ? ' · جاهزة للقراءة' : ''}`;
          return button;
        }));
        if (!list.children.length) { const p = document.createElement('p'); p.className = 'islam-status'; p.textContent = 'مفيش سورة بالاسم ده. جرّب رقم السورة أو جزء من اسمها.'; list.append(p); }
      }
      function renderQuranBookmarks() {
        const list = $('#quran-bookmarks');
        list.replaceChildren(...state.islam.bookmarks.slice(-12).reverse().map(mark => {
          const button = document.createElement('button');
          button.dataset.openVerse = `${mark.surah}:${mark.ayah}`;
          button.textContent = `${SURAH_NAMES[mark.surah - 1]} · ${mark.ayah.toLocaleString('ar-EG')}`;
          return button;
        }));
        list.hidden = !list.children.length;
      }
      function renderReadingPosition() {
        const { surah, ayah } = state.islam.position;
        $('#islam-reading-position').textContent = `آخر موضع: سورة ${SURAH_NAMES[surah - 1]}، الآية ${ayah.toLocaleString('ar-EG')}.`;
      }
      async function openSurah(number, verse = 0) {
        number = Number(number);
        verse = Number(verse);
        if (!Number.isInteger(number) || number < 1 || number > 114) return;
        switchIslamTab('quran');
        stopQuranAudio();
        const token = ++surahRequest;
        currentSurah = number;
        $('#quran-library').hidden = true;
        $('#quran-reader').hidden = false;
        $('#reader-title').textContent = `سورة ${SURAH_NAMES[number - 1]}`;
        $('#reader-surah-name').textContent = `سورة ${SURAH_NAMES[number - 1]}`;
        $('#reader-surah-meta').textContent = 'بنحمّل الآيات...';
        $('#reader-basmala').hidden = true;
        $('#quran-ayah-list').replaceChildren();
        const data = await fetchSurah(number);
        if (token !== surahRequest || currentSurah !== number) return;
        if (!data) {
          $('#reader-surah-meta').textContent = 'السورة دي محتاجة اتصال بالإنترنت أول مرة. السور اللي حمّلتها قبل كده هتفضل متاحة بدون نت.';
          const retry = document.createElement('button'); retry.className = 'button button-primary'; retry.textContent = 'حاول تاني'; retry.dataset.action = 'quran-retry'; $('#quran-ayah-list').append(retry);
          return;
        }
        $('#reader-surah-name').textContent = data.name || `سورة ${SURAH_NAMES[number - 1]}`;
        $('#reader-surah-meta').textContent = `${data.ayahs.length.toLocaleString('ar-EG')} آية · ${data.revelationType === 'Medinan' ? 'مدنية' : 'مكية'} · الجزء ${data.ayahs[0].juz || '—'} · الصفحة ${data.ayahs[0].page || '—'}`;
        $('#quran-ayah-list').style.setProperty('--quran-size', `${state.islam.quranSize}px`);
        $('#quran-ayah-list').replaceChildren(...data.ayahs.map(ayah => {
          const row = document.createElement('div');
          row.className = 'ayah-row';
          row.id = `ayah-${number}-${ayah.numberInSurah}`;
          row.innerHTML = `<p class="ayah-text"></p><div class="ayah-tools"><button data-quran-position="${number}:${ayah.numberInSurah}">${icon('book')}احفظ موضعك</button><button data-quran-bookmark="${number}:${ayah.numberInSurah}">${icon('bookmark')}<span>أضف للمفضلة</span></button><button data-quran-play="${ayah.number}">${icon('play')}<span>استمع</span></button><button data-quran-share="${number}:${ayah.numberInSurah}">${icon('share')}مشاركة</button></div>`;
          const p = $('.ayah-text', row);
          p.textContent = ayah.text.replace(/^\uFEFF/, '');
          const marker = document.createElement('span');
          marker.className = 'ayah-num'; marker.textContent = ayah.numberInSurah.toLocaleString('ar-EG');
          p.append(' ', marker);
          return row;
        }));
        updateReaderMarkers();
        $('#quran-progress').textContent = `موضعك الحالي: الآية ${state.islam.position.surah === number ? state.islam.position.ayah.toLocaleString('ar-EG') : '١'} من ${data.ayahs.length.toLocaleString('ar-EG')}. تقدر تحفظ موضعك من تحت أي آية.`;
        if (verse > 0) requestAnimationFrame(() => { const target = $(`#ayah-${number}-${Math.min(verse, data.ayahs.length)}`); target?.scrollIntoView({ block: 'start', behavior: 'smooth' }); target?.classList.add('highlight'); setTimeout(() => target?.classList.remove('highlight'), 2500); });
        else $('#quran-reader').scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
      function updateReaderMarkers() {
        $$('#quran-ayah-list [data-quran-bookmark]').forEach(button => {
          const [surah, ayah] = button.dataset.quranBookmark.split(':').map(Number);
          const active = state.islam.bookmarks.some(x => x.surah === surah && x.ayah === ayah);
          button.classList.toggle('active', active);
          $('span', button).textContent = active ? 'محفوظة' : 'أضف للمفضلة';
        });
        $$('#quran-ayah-list [data-quran-position]').forEach(button => {
          const [surah, ayah] = button.dataset.quranPosition.split(':').map(Number);
          button.classList.toggle('active', state.islam.position.surah === surah && state.islam.position.ayah === ayah);
        });
      }
      function markQuranPosition(reference) {
        const [surah, ayah] = reference.split(':').map(Number);
        if (!loadedSurahs.get(surah)?.ayahs.some(x => x.numberInSurah === ayah)) return;
        state.islam.position = { surah, ayah };
        saveState(); renderReadingPosition(); updateReaderMarkers();
        $('#quran-progress').textContent = `حفظنا موضعك: سورة ${SURAH_NAMES[surah - 1]}، الآية ${ayah.toLocaleString('ar-EG')}.`;
        showToast('حفظنا مكانك. هتلاقيه أول ما ترجع.');
      }
      function toggleQuranBookmark(reference) {
        const [surah, ayah] = reference.split(':').map(Number);
        if (!loadedSurahs.get(surah)?.ayahs.some(x => x.numberInSurah === ayah)) return;
        const marks = state.islam.bookmarks, index = marks.findIndex(x => x.surah === surah && x.ayah === ayah);
        if (index >= 0) marks.splice(index, 1);
        else { marks.push({ surah, ayah }); if (marks.length > 250) marks.shift(); }
        saveState(); renderQuranBookmarks(); updateReaderMarkers();
        showToast(index >= 0 ? 'اتشالت من المفضلة.' : 'الآية اتحفظت في المفضلة.');
      }
      async function shareQuranVerse(reference) {
        const [surah, ayah] = reference.split(':').map(Number), data = loadedSurahs.get(surah), item = data?.ayahs.find(x => x.numberInSurah === ayah);
        if (!item) return;
        const text = `${item.text}\n\nسورة ${SURAH_NAMES[surah - 1]}: ${ayah}`;
        if (navigator.share) { try { await navigator.share({ text }); return; } catch (error) { if (error.name === 'AbortError') return; } }
        try { await navigator.clipboard.writeText(text); showToast('الآية اتنسخت للمشاركة.'); }
        catch { showToast('المشاركة مش متاحة في المتصفح ده.'); }
      }
      function stopQuranAudio() {
        const audio = $('#quran-audio-element');
        audio.pause(); audio.removeAttribute('src'); audio.load();
        $$('#quran-ayah-list [data-quran-play]').forEach(b => { b.classList.remove('active'); $('span', b).textContent = 'استمع'; });
        $('#reader-audio-button').textContent = 'استمع للتلاوة';
      }
      function updateQuranAudio() {
        const audio = $('#quran-audio-element');
        $$('#quran-ayah-list [data-quran-play]').forEach(b => {
          const on = !audio.paused && Number(b.dataset.quranPlay) === Number(audio.dataset.ayah);
          b.classList.toggle('active', on); $('span', b).textContent = on ? 'إيقاف' : 'استمع';
        });
        $('#reader-audio-button').textContent = audio.paused ? 'استمع للتلاوة' : 'إيقاف التلاوة';
      }
      async function playQuranAyah(globalNumber) {
        const data = loadedSurahs.get(currentSurah), ayah = data?.ayahs.find(x => x.number === Number(globalNumber));
        if (!ayah) return;
        const audio = $('#quran-audio-element');
        if (Number(audio.dataset.ayah) === ayah.number && audio.src) {
          if (audio.paused) await audio.play().catch(() => showToast('الصوت محتاج اتصال أو السورة دي مش متاحة حاليا.'));
          else audio.pause();
          updateQuranAudio(); return;
        }
        audio.pause();
        audio.dataset.ayah = String(ayah.number);
        audio.dataset.surah = String(currentSurah);
        audio.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
        await audio.play().catch(() => showToast('التلاوة الصوتية تحتاج اتصالا بالإنترنت أو آية مخزنة مسبقا.'));
        updateQuranAudio();
      }
      async function updateQuranCacheCount() {
        if (!('caches' in window)) { $('#quran-download-status').textContent = 'المتصفح ده مش بيدعم تنزيل السور بدون نت.'; $('#quran-download').disabled = true; return; }
        try {
          const cache = await caches.open(quranCacheName), keys = await cache.keys();
          if (!quranDownloading) $('#quran-download-status').textContent = `${keys.length} من ١١٤ سورة محفوظة على جهازك. كمان فيه ٦ سور قصيرة متاحة دائما بدون نت.`;
        } catch { $('#quran-download-status').textContent = 'حفظ السور غير متاح في المتصفح ده.'; }
      }
      async function downloadQuran() {
        if (quranDownloading || !('caches' in window)) return;
        if (!navigator.onLine) { showToast('وصّل الإنترنت أول مرة لتحميل المصحف، وبعدها هيشتغل بدون نت.'); return; }
        quranDownloading = true; quranCancel = false;
        $('#quran-download').disabled = true; $('#quran-cancel').hidden = false;
        let completed = 0, failed = 0;
        try {
          const cache = await caches.open(quranCacheName);
          for (let first = 1; first <= 114 && !quranCancel; first += 3) {
            await Promise.all([first, first + 1, first + 2].filter(n => n <= 114).map(async n => {
              if (quranCancel) return;
              const url = quranUrl(n);
              try {
                if (!await cache.match(url)) {
                  const response = await fetch(url);
                  if (!response.ok) throw new Error('Unavailable');
                  const body = await response.clone().json();
                  if (!validSurah(body.data, n)) throw new Error('Invalid text');
                  await cache.put(url, response);
                }
                completed++;
              } catch { failed++; }
              $('#quran-download-status').textContent = `جاري تجهيز المصحف: ${completed + failed} / 114 · ${completed} جاهزة${failed ? ` · ${failed} تعذّر تحميلها` : ''}`;
            }));
          }
          showToast(quranCancel ? 'وقفنا التحميل. السور اللي نزلت محفوظة؛ تقدر تكمل بعدين.' : failed ? `حفظنا ${completed} سورة. جرّب تاني لتحميل ${failed} سورة باقية.` : 'المصحف كله بقى معاك، حتى من غير إنترنت.');
        } catch { showToast('التخزين غير متاح أو المساحة مش كافية. السور اللي اتحفظت لسه موجودة.'); }
        finally { quranDownloading = false; quranCancel = false; $('#quran-download').disabled = false; $('#quran-cancel').hidden = true; updateQuranCacheCount(); }
      }
      const normalizeArabic = text => String(text).normalize('NFKD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '').replace(/[إأآٱ]/g, 'ا').replace(/ى/g, 'ي').toLocaleLowerCase('ar');
      async function searchQuran(text) {
        const q = text.trim();
        if (q.length < 2) { showToast('اكتب حرفين على الأقل للبحث في القرآن.'); return; }
        const box = $('#quran-search-results'); box.hidden = false;
        box.textContent = 'بندور في الآيات...';
        let matches = [], local = false;
        if (navigator.onLine) {
          try {
            const response = await fetch(`https://api.alquran.cloud/v1/search/${encodeURIComponent(q)}/all/quran-uthmani`);
            const body = await response.json();
            if (response.ok && Array.isArray(body.data?.matches)) matches = body.data.matches.map(x => ({ text: x.text, surah: x.surah?.number, ayah: x.numberInSurah }));
            else local = true;
          } catch { local = true; }
        } else local = true;
        if (local) {
          const chapters = [...loadedSurahs.values()];
          if ('caches' in window) {
            try {
              const cache = await caches.open(quranCacheName);
              for (const request of await cache.keys()) {
                const match = request.url.match(/\/surah\/(\d+)\/quran-uthmani$/);
                if (!match || chapters.some(x => x.number === Number(match[1]))) continue;
                const data = (await (await cache.match(request)).json()).data;
                if (validSurah(data, Number(match[1]))) chapters.push(data);
              }
            } catch { }
          }
          Object.keys(OFFLINE_SURAHS).forEach(n => { if (!chapters.some(x => x.number === Number(n))) chapters.push(offlineSurah(Number(n))); });
          const needle = normalizeArabic(q);
          matches = chapters.flatMap(surah => surah.ayahs.filter(ayah => normalizeArabic(ayah.text).includes(needle)).map(ayah => ({ text: ayah.text, surah: surah.number, ayah: ayah.numberInSurah })));
        }
        if (q !== $('#quran-text-query').value.trim() || islamTab !== 'quran') return;
        box.replaceChildren();
        const info = document.createElement('p'); info.className = 'islam-status'; info.textContent = `${matches.length.toLocaleString('ar-EG')} نتيجة${local ? ' في السور المحفوظة على جهازك فقط' : ' في المصحف'}.`; box.append(info);
        matches.slice(0, 60).forEach(item => {
          if (!Number.isInteger(item.surah) || item.surah < 1 || item.surah > 114 || !Number.isInteger(item.ayah)) return;
          const b = document.createElement('button'); b.dataset.openVerse = `${item.surah}:${item.ayah}`;
          const label = document.createElement('small'); label.textContent = `سورة ${SURAH_NAMES[item.surah - 1]} · ${item.ayah.toLocaleString('ar-EG')}`;
          b.append(label, document.createTextNode(item.text || '')); box.append(b);
        });
      }
      function renderDailyVerse() {
        const index = Math.floor(Date.now() / 86400000) % DAILY_VERSES.length;
        const [surah, ayah] = DAILY_VERSES[index], data = offlineSurah(surah);
        $('#daily-verse-text').textContent = data.ayahs[ayah - 1].text;
        $('#daily-verse-source').textContent = `سورة ${SURAH_NAMES[surah - 1]} · الآية ${ayah.toLocaleString('ar-EG')}`;
        $('#daily-verse-text').dataset.reference = `${surah}:${ayah}`;
      }
      function renderAdhkar() {
        $$('[data-zikr-cat]').forEach(b => b.classList.toggle('active', b.dataset.zikrCat === zikrCategory));
        const list = zikrCategory === 'favorite' ? ADHKAR.filter(x => state.islam.zikrFavorites.includes(x.id)) : ADHKAR.filter(x => x.cat === zikrCategory);
        const counts = state.islam.zikrCounts[dayKey()] || {}, done = list.filter(x => (counts[x.id] || 0) >= x.target).length;
        $('#adhkar-summary').textContent = list.length ? `${done} من ${list.length} اكتملت النهارده. كل ضغطة بتتحفظ على جهازك.` : 'مفيش أذكار محفوظة هنا. اضغط حفظ عند ذكر تحبه.';
        const container = $('#adhkar-list');
        container.replaceChildren(...list.map(item => {
          const count = counts[item.id] || 0;
          const article = document.createElement('article'); article.className = 'surface zikr-item';
          article.innerHTML = `<div class="zikr-top"><strong></strong><button class="text-button" data-zikr-favorite="${item.id}"></button></div><p class="zikr-text"></p><div class="zikr-bottom"><small></small><button class="zikr-count${count >= item.target ? ' complete' : ''}" data-zikr-count="${item.id}" ${count >= item.target ? 'disabled' : ''}></button></div><div class="azkar-progress"><i style="width:${Math.round(count / item.target * 100)}%"></i></div>`;
          $('.zikr-top strong', article).textContent = ZIKR_CATS[item.cat];
          $('[data-zikr-favorite]', article).textContent = state.islam.zikrFavorites.includes(item.id) ? 'أزل من المفضلة' : 'احفظ الذكر';
          $('.zikr-text', article).textContent = item.text;
          $('.zikr-bottom small', article).textContent = item.source;
          $('[data-zikr-count]', article).textContent = count >= item.target ? `${count} / ${item.target} · اكتمل` : `${count} / ${item.target} · اضغط بعد القراءة`;
          return article;
        }));
      }
      function incrementZikr(id) {
        const item = ADHKAR.find(x => x.id === id);
        if (!item) return;
        const day = dayKey();
        state.islam.zikrCounts[day] ||= {};
        state.islam.zikrCounts[day][id] = Math.min(item.target, (state.islam.zikrCounts[day][id] || 0) + 1);
        saveState(); renderAdhkar();
        if (state.islam.zikrCounts[day][id] === item.target) showToast('أتممت الذكر. تقبّل الله منك.');
      }
      function renderTasbih() {
        const t = state.islam.tasbih, count = t.counts[t.phrase] || 0;
        $('#tasbih-phrase').value = t.phrase;
        $('#tasbih-target').value = String(t.target);
        $('#tasbih-current-phrase').textContent = t.phrase;
        $('#tasbih-current-count').textContent = count.toLocaleString('ar-EG');
        $('#tasbih-progress-fill').style.width = `${t.target ? Math.min(100, count / t.target * 100) : 0}%`;
        $('#tasbih-total').textContent = `${t.target ? `الهدف ${t.target.toLocaleString('ar-EG')} · ` : ''}مجموع تسبيحاتك من البداية ${t.total.toLocaleString('ar-EG')}. اضغط المسافة من لوحة المفاتيح للعد.`;
      }
      function addTasbih() {
        const t = state.islam.tasbih, before = t.counts[t.phrase] || 0;
        t.counts[t.phrase] = Math.min(1000000, before + 1);
        t.total = Math.min(10000000, t.total + 1);
        saveState(); renderTasbih();
        if (navigator.vibrate) navigator.vibrate(10);
        if (t.target && before < t.target && t.counts[t.phrase] >= t.target) { celebrate(); showToast('وصلت لهدفك في الذكر. تقبّل الله منك.'); }
      }

      const timerDuration = (mode = state.timer.mode) => (mode === 'focus' ? state.settings.focusMinutes : mode === 'break' ? state.settings.breakMinutes : state.settings.longBreakMinutes) * 60;
      function renderTimer(force = false) {
        const t = state.timer;
        if (!force && t.remaining === lastRenderedSecond) return;
        lastRenderedSecond = t.remaining;
        const text = `${String(Math.floor(t.remaining / 60)).padStart(2, '0')}:${String(t.remaining % 60).padStart(2, '0')}`;
        $$('[data-timer-display]').forEach(e => { e.textContent = text; });
        $$('[data-timer-mode]').forEach(b => { const on = b.dataset.timerMode === t.mode; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
        const label = t.running ? 'وقفة صغيرة' : t.remaining === 0 ? 'جلسة جديدة' : t.remaining < t.duration ? 'كمّل على مهلك' : t.mode === 'focus' ? 'ابدأ التركيز' : 'ابدأ الاستراحة';
        $$('[data-timer-button-label]').forEach(e => { e.textContent = label; });
        $$('[data-action="timer-toggle"] use').forEach(e => e.setAttribute('href', t.running ? '#i-pause' : '#i-play'));
        const task = state.tasks.find(x => x.id === t.taskId);
        $$('[data-timer-caption]').forEach(e => {
          e.textContent = t.remaining === 0 ? 'أحسنت. كل خطوة بتفرق.' : t.running ? (t.mode === 'focus' ? (task ? `بتركّز على: ${task.title}` : 'أنت هنا. والباقي يستنى.') : 'خُد نفس، وجدّد طاقتك.') : t.remaining < t.duration ? 'وقفة صغيرة، ونكمّل.' : t.mode === 'focus' ? 'دقيقة ليك وللي يهمك' : 'شوية هدوء، وبداية جديدة';
          e.classList.toggle('is-running', t.running);
        });
        const every = state.settings.longBreakEvery, filled = t.cycle % every;
        $$('[data-cycle-dots]').forEach(e => { e.innerHTML = [...Array(every)].map((_, i) => `<i class="${i < filled ? 'on' : ''}"></i>`).join(''); e.title = `${filled} من ${every} جلسات قبل الاستراحة الطويلة`; });
        $('#nav-timer-dot').hidden = !t.running;
        document.title = t.running ? `${text} · ${MODE_LABEL[t.mode]} | يومك` : 'يومك | مساحة صغيرة ليوم أخف';
      }
      function ensureAudio() {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          if (!AC) return null;
          if (!audioContext) audioContext = new AC();
          if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
          return audioContext;
        } catch { return null; }
      }
      function playChime() {
        if (!state.settings.sound || !audioContext || audioContext.state !== 'running') return;
        [587.33, 783.99, 1174.66].forEach((f, i) => {
          const o = audioContext.createOscillator(), g = audioContext.createGain(), s = audioContext.currentTime + i * .22;
          o.type = 'sine'; o.frequency.value = f;
          g.gain.setValueAtTime(0, s); g.gain.linearRampToValueAtTime(.1, s + .02); g.gain.exponentialRampToValueAtTime(.001, s + .9);
          o.connect(g); g.connect(audioContext.destination); o.start(s); o.stop(s + .95);
          o.onended = () => { o.disconnect(); g.disconnect(); };
        });
      }
      function noiseBuffer(ctx, brown) {
        const len = ctx.sampleRate * 4, buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { const w = Math.random() * 2 - 1; if (brown) { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; } else d[i] = w; }
        return buf;
      }
      function startAmbient() {
        stopAmbient();
        const kind = state.settings.ambient;
        if (kind === 'none') { renderAmbient(); return; }
        const ctx = ensureAudio();
        if (!ctx) { showToast('الصوت مش متاح في المتصفح ده.'); return; }
        const src = ctx.createBufferSource(); src.buffer = noiseBuffer(ctx, kind !== 'rain'); src.loop = true;
        const f1 = ctx.createBiquadFilter(), f2 = ctx.createBiquadFilter(), gain = ctx.createGain(), lfo = ctx.createOscillator(), lfoGain = ctx.createGain();
        if (kind === 'rain') { f1.type = 'highpass'; f1.frequency.value = 500; f2.type = 'lowpass'; f2.frequency.value = 2600; lfo.frequency.value = .35; lfoGain.gain.value = 700; lfo.connect(lfoGain); lfoGain.connect(f2.frequency); }
        else if (kind === 'brown') { f1.type = 'lowpass'; f1.frequency.value = 600; f2.type = 'lowpass'; f2.frequency.value = 900; lfo.frequency.value = .05; lfoGain.gain.value = 150; lfo.connect(lfoGain); lfoGain.connect(f1.frequency); }
        else { f1.type = 'bandpass'; f1.frequency.value = 450; f1.Q.value = .7; f2.type = 'lowpass'; f2.frequency.value = 1500; lfo.frequency.value = .09; lfoGain.gain.value = 260; lfo.connect(lfoGain); lfoGain.connect(f1.frequency); }
        gain.gain.value = 0; gain.gain.linearRampToValueAtTime(state.settings.ambientVolume * (kind === 'rain' ? .5 : .9), ctx.currentTime + 1.2);
        src.connect(f1); f1.connect(f2); f2.connect(gain); gain.connect(ctx.destination); src.start(); lfo.start();
        ambient.nodes = { src, lfo, gain, f1, f2, lfoGain }; ambient.playing = true; renderAmbient();
      }
      function stopAmbient() {
        if (ambient.nodes) { try { ambient.nodes.src.stop(); ambient.nodes.lfo.stop(); } catch {  } Object.values(ambient.nodes).forEach(n => n.disconnect()); }
        ambient.nodes = null; ambient.playing = false; renderAmbient();
      }
      function renderAmbient() {
        const sel = $('#ambient-select');
        if (!sel.options.length) Object.entries(AMBIENTS).forEach(([v, l]) => sel.add(new Option(l, v)));
        sel.value = state.settings.ambient;
        $('#ambient-volume').value = state.settings.ambientVolume;
        $('#ambient-toggle span').textContent = ambient.playing ? 'وقّف الصوت' : 'شغّل الصوت';
        $('#ambient-toggle use').setAttribute('href', ambient.playing ? '#i-pause' : '#i-play');
        $('#ambient-toggle').disabled = state.settings.ambient === 'none';
      }
      async function syncWakeLock() {
        try {
          if (state.timer.running && !document.hidden && 'wakeLock' in navigator) { if (!wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } }
          else if (wakeLock) { await wakeLock.release(); wakeLock = null; }
        } catch { wakeLock = null; }
      }
      function renderSessions() {
        const s = state.sessions.filter(x => x.date === dayKey()), m = s.reduce((a, x) => a + x.minutes, 0);
        $('#session-summary').textContent = s.length ? `${s.length} ${s.length === 1 ? 'جلسة' : 'جلسات'} تركيز النهارده، و${m} دقيقة للحاجات اللي تهمك. أحسنت.` : 'كل بداية بتفرق. جاهز لأول جلسة؟';
      }
      function finishTimer() {
        if (!state.timer.running) return;
        const t = state.timer, wasFocus = t.mode === 'focus', date = dayKey(new Date(t.endAt || Date.now()));
        t.running = false; t.remaining = 0; t.endAt = null;
        if (wasFocus) {
          if (!state.sessions.some(s => s.id === t.sessionId)) { state.sessions.push({ id: t.sessionId, date, minutes: t.duration / 60 }); state.sessions = state.sessions.slice(-2000); }
          t.cycle = (t.cycle + 1) % 100;
        }
        const next = wasFocus ? (t.cycle % state.settings.longBreakEvery === 0 ? 'long' : 'break') : 'focus';
        saveState(); renderTimer(true); renderSessions(); stopAmbient(); syncWakeLock();
        if (activeView === 'insights') renderInsights();
        notify(wasFocus ? 'أحسنت! وقت التركيز خلص.' : 'الاستراحة خلصت.', wasFocus ? (next === 'long' ? 'تستاهل استراحة طويلة.' : 'تستاهل استراحة صغيرة.') : 'جاهز لخطوة جديدة؟', 'timer');
        if (state.settings.autoStart) { switchTimerMode(next, true); toggleTimer(); showToast(`بدأت ${MODE_LABEL[next]} تلقائيا.`); }
        else showToast(wasFocus ? `جلسة تركيز كاملة. ${next === 'long' ? 'وقت استراحة طويلة.' : 'استراحة صغيرة؟'}` : 'الاستراحة خلصت. نرجع نركّز؟', MODE_LABEL[next], () => { switchTimerMode(next, true); toggleTimer(); });
      }
      function tick() {
        if (state.timer.running) {
          state.timer.remaining = Math.max(0, Math.ceil((state.timer.endAt - Date.now()) / 1000));
          if (state.timer.remaining === 0) finishTimer(); else renderTimer();
        }
        checkReminders();
        const cityDay = dateInZone();
        if (lastPrayerDay && cityDay !== lastPrayerDay) { renderPrayer(); renderAdhkar(); renderDailyVerse(); if (activeView === 'islam') loadPrayerCalendar(); }
        lastPrayerDay = cityDay;
        if (Date.now() - lastIslamTick >= 1000) { lastIslamTick = Date.now(); if (activeView === 'islam') updatePrayerCountdown(); checkPrayerAlerts(); }
        if (dayKey() !== lastDay) { lastDay = dayKey(); renderDate(); refresh(); renderSessions(); renderAdhkar(); renderDailyVerse(); }
      }
      function toggleTimer() {
        ensureAudio(); tick();
        const t = state.timer;
        if (t.running) { t.remaining = Math.max(0, Math.ceil((t.endAt - Date.now()) / 1000)); t.running = false; t.endAt = null; stopAmbient(); }
        else {
          if (t.remaining === 0) { t.duration = timerDuration(); t.remaining = t.duration; t.sessionId = uid(); }
          t.running = true; t.endAt = Date.now() + t.remaining * 1000;
          if (t.mode === 'focus' && state.settings.ambient !== 'none' && activeView === 'focus') startAmbient();
        }
        saveState(); renderTimer(true); syncWakeLock();
      }
      const timerDirty = () => state.timer.running || (state.timer.remaining > 0 && state.timer.remaining < state.timer.duration);
      async function resetTimer() {
        if (timerDirty() && !await askConfirm('نبدأ العد من جديد؟', 'الوقت اللي مرّ في الجلسة الحالية مش هيتحسب كجلسة مكتملة.', 'ابدأ من جديد')) return;
        Object.assign(state.timer, { running: false, endAt: null, duration: timerDuration(), remaining: timerDuration(), sessionId: uid() });
        stopAmbient(); saveState(); renderTimer(true); syncWakeLock();
      }
      async function switchTimerMode(mode, silent = false) {
        if (mode === state.timer.mode && !silent) return;
        if (!silent && timerDirty() && !await askConfirm('نغيّر نوع الجلسة؟', 'الجلسة الحالية هتتوقف، ونبدأ المدة الجديدة من الأول.', 'غيّر الجلسة')) return;
        Object.assign(state.timer, { mode, duration: timerDuration(mode), remaining: timerDuration(mode), running: false, endAt: null, sessionId: uid() });
        stopAmbient(); saveState(); renderTimer(true); syncWakeLock();
      }


      function openSettings() {
        const s = state.settings;
        $('#settings-name').value = s.name; $('#settings-goal').value = s.dailyGoal;
        $('#settings-focus').value = s.focusMinutes; $('#settings-break').value = s.breakMinutes; $('#settings-long').value = s.longBreakMinutes; $('#settings-every').value = s.longBreakEvery;
        $('#settings-autostart').checked = s.autoStart; $('#settings-sound').checked = s.sound;
        $('#settings-notifications').checked = s.notifications && 'Notification' in window && Notification.permission === 'granted';
        $('#settings-theme').value = s.theme;
        const sw = $('#palette-swatches');
        if (!sw.children.length) Object.entries(PALETTES).forEach(([k, [l, c]]) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'swatch'; b.dataset.paletteChoice = k; b.innerHTML = `<i style="background:${c}"></i><span>${l}</span>`; sw.append(b); });
        $$('.swatch', sw).forEach(b => b.classList.toggle('active', b.dataset.paletteChoice === s.palette));
        $('#app-status-text').textContent = `${isStandalone() ? 'يومك مثبّت كتطبيق على جهازك.' : 'افتح يومك زي أي تطبيق من الشاشة الرئيسية.'} ${navigator.serviceWorker?.controller ? 'جاهز للعمل بدون إنترنت.' : location.protocol === 'file:' ? 'لتفعيل التثبيت والعمل بدون نت، لازم الموقع يتفتح من رابط http أو https.' : 'بيتجهّز للعمل بدون إنترنت...'}`;
        $('#backup-status').textContent = state.meta.lastBackupAt ? `آخر نسخة احتياطية: ${new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'long', hour: 'numeric', minute: '2-digit' }).format(new Date(state.meta.lastBackupAt))}. الحفظ على المتصفح ده فقط.` : 'الحفظ على المتصفح ده فقط. نزّل نسخة احتياطية قبل تغيير الجهاز أو مسح بيانات المتصفح.';
        if (!$('#settings-dialog').open) $('#settings-dialog').showModal();
      }
      function downloadFile(content, filename, type) {
        const url = URL.createObjectURL(new Blob([content], { type }));
        const a = document.createElement('a'); a.href = url; a.download = filename; document.body.append(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }
      async function resetData() {
        if (!await askConfirm('نبدأ من صفحة بيضا؟', 'ده هيمسح المهام والملاحظات والعادات والجلسات والركن الإسلامي والإعدادات من المتصفح ده. نزّل نسخة احتياطية الأول لو محتاجها.', 'امسح بياناتي', true)) return;
        clearTimeout(noteSaveTimeout); stopAmbient(); stopQuranAudio(); prayerRequest++; surahRequest++; quranCancel = true; loadedSurahs.clear();
        state = defaultState(false); state.meta.onboarded = true; activeNoteId = '';
        filters.today = 'all'; filters.tasks = 'all';
        $('#task-search').value = ''; $('#category-filter').value = 'all'; $('#date-filter').value = 'all';
        try { localStorage.removeItem(OLD_KEY); localStorage.removeItem(PREVIOUS_KEY); } catch { }
        if ('caches' in window) await caches.delete(quranCacheName).catch(() => {});
        saveState(); renderAll(); $('#settings-dialog').close(); navigate('today');
        showToast('مساحتك بقت فاضية. بداية جديدة على مهلك.');
      }
      async function importData(event) {
        const file = event.target.files[0]; event.target.value = '';
        if (!file) return;
        if (file.size > 4000000) { showToast('الملف أكبر من اللازم. اختار نسخة يومك بحجم أقل من ٤ ميجابايت.'); return; }
        let imported;
        try { imported = normalizeState(JSON.parse(await file.text())); } catch { showToast('الملف ده مش نسخة يومك صالحة. جرّب ملف JSON نزلته من التطبيق.'); return; }
        if (!await askConfirm('نرجّع النسخة دي؟', 'كل بياناتك الحالية هتتبدّل بمحتوى النسخة. الجلسة الحالية هتتوقف.', 'استرجع النسخة')) return;
        clearTimeout(noteSaveTimeout); stopAmbient(); stopQuranAudio(); prayerRequest++; surahRequest++; quranCancel = true; loadedSurahs.clear();
        state = imported; state.meta.onboarded = true;
        state.timer = { mode: 'focus', duration: state.settings.focusMinutes * 60, remaining: state.settings.focusMinutes * 60, running: false, endAt: null, taskId: '', sessionId: uid(), cycle: 0 };
        activeNoteId = ''; filters.today = 'all'; filters.tasks = 'all';
        saveState(); renderAll(); $('#settings-dialog').close();
        showToast('مهامك وأفكارك وعاداتك رجعوا لمساحتك.');
      }
      function exportData() {
        clearTimeout(noteSaveTimeout);
        state.meta.lastBackupAt = Date.now(); saveState();
        downloadFile(JSON.stringify(state, null, 2), `yawmak-backup-${dayKey()}.json`, 'application/json');
        showToast('نسختك جاهزة للتنزيل. احتفظ بيها في مكان آمن.');
        if ($('#settings-dialog').open) openSettings();
      }


      function renderInstallButtons() { $$('[data-install-button]').forEach(b => { b.hidden = isStandalone(); }); }
      async function installApp() {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice.catch(() => ({ outcome: 'dismissed' }));
          if (outcome === 'accepted') { deferredPrompt = null; showToast('يومك بيتثبّت على جهازك. هتلاقيه مع تطبيقاتك.'); }
          return;
        }
        const ua = navigator.userAgent, ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const steps = location.protocol === 'file:' ? ['ارفع ملفات يومك على أي استضافة مجانية (GitHub Pages أو Netlify أو Vercel).', 'افتح الرابط من المتصفح على موبايلك أو جهازك.', 'اضغط زر «ثبّت» وهيشتغل كتطبيق كامل بدون نت.']
          : isStandalone() ? ['يومك شغال دلوقتي كتطبيق مثبّت. كل حاجة بتتحفظ على جهازك.']
          : ios ? ['افتح يومك في متصفح Safari.', 'اضغط زر المشاركة (المربع والسهم لفوق).', 'اختار «إضافة إلى الشاشة الرئيسية» ثم «إضافة».']
          : /Android/.test(ua) ? ['افتح قائمة المتصفح (النقط الثلاث فوق).', 'اختار «تثبيت التطبيق» أو «إضافة إلى الشاشة الرئيسية».', 'أكّد، وهتلاقي يومك مع تطبيقاتك.']
          : ['في شريط العنوان، دوّر على أيقونة التثبيت (شاشة بسهم).', 'أو من قائمة المتصفح اختار «تثبيت يومك».', 'هيفتح في نافذة مستقلة ويشتغل بدون إنترنت.'];
        $('#install-intro').textContent = location.protocol === 'file:' ? 'الملف مفتوح مباشرة من الجهاز، والمتصفحات بتسمح بالتثبيت من رابط إنترنت بس.' : isStandalone() ? 'تمام!' : 'هيفتح زي أي تطبيق، وبدون إنترنت.';
        $('#install-steps').replaceChildren(...steps.map(s => { const li = document.createElement('li'); li.textContent = s; return li; }));
        $('#install-dialog').showModal();
      }
      function registerServiceWorker() {
        if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
        navigator.serviceWorker.register('sw.js').then(reg => {
          reg.addEventListener('updatefound', () => {
            const w = reg.installing;
            w?.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) showToast('نسخة جديدة من يومك جاهزة.', 'حدّث الآن', () => w.postMessage({ type: 'SKIP_WAITING' })); });
          });
        }).catch(() => {});
        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => { if (refreshing) return; refreshing = true; clearTimeout(noteSaveTimeout); saveState(); location.reload(); });
      }
      function makeAppleIcon() {
        try {
          const c = document.createElement('canvas'); c.width = c.height = 180; const x = c.getContext('2d');
          x.fillStyle = '#173e32'; x.beginPath(); x.roundRect(0, 0, 180, 180, 40); x.fill();
          x.strokeStyle = '#d8e8b6'; x.lineWidth = 11; x.lineCap = 'round';
          for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; x.beginPath(); x.moveTo(90 + Math.cos(a) * 42, 90 + Math.sin(a) * 42); x.lineTo(90 + Math.cos(a) * 66, 90 + Math.sin(a) * 66); x.stroke(); }
          x.fillStyle = '#d8e8b6'; x.beginPath(); x.arc(90, 90, 16, 0, Math.PI * 2); x.fill();
          $('#apple-icon').href = c.toDataURL('image/png');
        } catch { }
      }


      function celebrate() {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const c = $('#confetti'), ctx = c.getContext('2d');
        c.width = innerWidth; c.height = innerHeight; c.hidden = false;
        const colors = ['#d8e8b6', '#2c6048', '#f1d9a7', '#bfe3f3', '#e4c7f0', '#ffffff'];
        const parts = Array.from({ length: 110 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * .4, r: 5 + Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)], vx: (Math.random() - .5) * 2.5, vy: 2.5 + Math.random() * 3.5, rot: Math.random() * Math.PI, vr: (Math.random() - .5) * .25 }));
        const start = performance.now();
        (function frame(t) {
          ctx.clearRect(0, 0, c.width, c.height);
          parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.rot += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6); ctx.restore(); });
          if (t - start < 2400) requestAnimationFrame(frame); else { c.hidden = true; ctx.clearRect(0, 0, c.width, c.height); }
        })(start);
      }


      const commands = () => [
        { label: 'مهمة جديدة', hint: 'N', icon: 'plus', keys: 'new task add اضافة', run: () => openTask() },
        { label: 'ملاحظة جديدة', hint: 'M', icon: 'note', keys: 'new note', run: newNote },
        { label: 'عادة جديدة', icon: 'habit', keys: 'habit', run: () => openHabit() },
        { label: state.timer.running ? 'أوقف المؤقّت' : 'ابدأ المؤقّت', hint: 'Space', icon: 'timer', keys: 'timer start pause مؤقت', run: toggleTimer },
        { label: 'نظرة على يومك', hint: '1', icon: 'grid', keys: 'home today', run: () => navigate('today') },
        { label: 'كل مهامي', hint: '2', icon: 'checklist', keys: 'tasks', run: () => navigate('tasks') },
        { label: 'وقت التركيز', hint: '3', icon: 'timer', keys: 'focus', run: () => navigate('focus') },
        { label: 'عاداتي', hint: '4', icon: 'habit', keys: 'habits', run: () => navigate('habits') },
        { label: 'ملاحظاتي', hint: '5', icon: 'note', keys: 'notes', run: () => navigate('notes') },
        { label: 'إحصائياتي', hint: '6', icon: 'chart', keys: 'insights stats', run: () => navigate('insights') },
        { label: 'الركن الإسلامي', hint: '7', icon: 'mosque', keys: 'islam صلاة قرآن اذكار', run: () => switchIslamTab('home') },
        { label: 'اقرأ القرآن الكريم', icon: 'book', keys: 'quran surah مصحف', run: () => switchIslamTab('quran') },
        { label: 'أذكار الصباح والمساء', icon: 'leaf', keys: 'adhkar morning evening ذكر', run: () => switchIslamTab('adhkar') },
        { label: 'مواقيت الصلاة', icon: 'mosque', keys: 'prayer times صلاة', run: () => switchIslamTab('prayer') },
        { label: 'اتجاه القبلة', icon: 'compass', keys: 'qibla compass قبلة', run: () => switchIslamTab('qibla') },
        { label: 'السبحة', icon: 'beads', keys: 'tasbih تسبيح ذكر', run: () => switchIslamTab('tasbih') },
        { label: resolvedTheme() === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن', hint: 'T', icon: 'moon', keys: 'theme dark light', run: () => actions.theme() },
        { label: 'الإعدادات', icon: 'settings', keys: 'settings', run: openSettings },
        { label: 'نزّل نسخة احتياطية', icon: 'download', keys: 'backup export', run: exportData },
        { label: 'ثبّت يومك كتطبيق', icon: 'install', keys: 'install pwa', run: installApp },
        { label: 'الاختصارات', icon: 'command', keys: 'shortcuts keyboard', run: () => $('#shortcuts-dialog').showModal() }
      ];
      function openPalette() { $('#palette-input').value = ''; renderPalette(); $('#palette-dialog').showModal(); requestAnimationFrame(() => $('#palette-input').focus()); }
      function renderPalette() {
        const q = $('#palette-input').value.trim().toLocaleLowerCase('ar');
        const match = s => s.toLocaleLowerCase('ar').includes(q);
        paletteItems = [];
        const groups = [];
        const cmds = commands().filter(c => !q || match(c.label) || match(c.keys));
        if (q) {
          const tasks = state.tasks.filter(t => match(t.title)).sort((a, b) => Number(a.done) - Number(b.done)).slice(0, 6).map(t => ({ label: t.title, hint: t.done ? 'مكتملة · تعديل' : 'تعديل', icon: 'checklist', done: t.done, run: () => openTask(t.id) }));
          const notes = state.notes.filter(n => match(n.title) || match(n.body)).slice(0, 4).map(n => ({ label: n.title || 'بدون عنوان', hint: 'ملاحظة', icon: 'note', run: () => { activeNoteId = n.id; navigate('notes'); $('#notes-layout').dataset.mode = 'editor'; renderNotes(); } }));
          const surahs = SURAH_NAMES.map((name, index) => ({ name, number: index + 1 })).filter(x => normalizeArabic(x.name).includes(normalizeArabic(q))).slice(0, 6).map(x => ({ label: `سورة ${x.name}`, hint: `رقم ${x.number}`, icon: 'book', run: () => openSurah(x.number) }));
          if (tasks.length) groups.push(['مهام', tasks]);
          if (notes.length) groups.push(['ملاحظات', notes]);
          if (surahs.length) groups.push(['سور القرآن', surahs]);
          if (!tasks.length && !notes.length && !surahs.length && !cmds.length) {
            const proposed = $('#palette-input').value.trim();
            groups.push(['اقتراح', [{ label: `أضف مهمة: ${proposed}`, icon: 'plus', hint: 'Enter', run: () => { addTask({ title: proposed }); showToast('خطوة جديدة في يومك.'); } }]]);
          }
        }
        if (cmds.length) groups.push(['أوامر', cmds]);
        const box = $('#palette-results');
        box.replaceChildren();
        groups.forEach(([name, items]) => {
          const g = document.createElement('p'); g.className = 'palette-group'; g.textContent = name; box.append(g);
          items.forEach(item => {
            const b = document.createElement('button'); b.className = `palette-item${item.done ? ' is-done' : ''}`; b.setAttribute('role', 'option'); b.dataset.paletteIndex = paletteItems.length;
            b.innerHTML = `${icon(item.icon)}<span class="pi-label"></span><span class="pi-hint"></span>`;
            $('.pi-label', b).textContent = item.label; $('.pi-hint', b).textContent = item.hint || '';
            box.append(b); paletteItems.push(item);
          });
        });
        paletteIndex = 0; highlightPalette();
      }
      function highlightPalette() { $$('.palette-item').forEach((b, i) => { b.classList.toggle('selected', i === paletteIndex); b.setAttribute('aria-selected', String(i === paletteIndex)); if (i === paletteIndex) b.scrollIntoView({ block: 'nearest' }); }); }
      function runPalette(i) { const item = paletteItems[i]; if (!item) return; $('#palette-dialog').close(); setTimeout(() => item.run(), 30); }


      function refresh() { renderTasks(); renderHabits(); renderMood(); if (activeView === 'insights') renderInsights(); if (activeView === 'notes') renderNotes(); }
      function renderAll() { applyTheme(); renderDate(); refresh(); renderNotes(); renderTimer(true); renderSessions(); renderAmbient(); renderPrayer(); renderDailyVerse(); renderReadingPosition(); renderQibla(); renderTasbih(); renderAdhkar(); setStorageStatus(); renderInstallButtons(); }

      const actions = {
        'new-task': () => openTask(), 'delete-task': deleteTask, 'new-habit': () => openHabit(), 'delete-habit': deleteHabit,
        'new-note': newNote, 'delete-note': deleteNote, 'share-note': shareNote,
        'download-note': () => { const n = state.notes.find(x => x.id === activeNoteId); if (!n || !(n.title || n.body.trim())) { showToast('اكتب حاجة الأول.'); return; } downloadFile('\uFEFF' + (n.title ? n.title + '\n\n' : '') + n.body, `${(n.title || 'ملاحظة').replace(/[\\/:*?"<>|]/g, '-')}.txt`, 'text/plain;charset=utf-8'); },
        'pin-note': () => { const n = state.notes.find(x => x.id === activeNoteId); if (!n) return; n.pinned = !n.pinned; saveState(); renderNotes(); showToast(n.pinned ? 'اتثبّتت فوق.' : 'اتشال التثبيت.'); },
        'notes-back': () => { $('#notes-layout').dataset.mode = 'list'; },
        'settings': openSettings, 'help': () => $('#help-dialog').showModal(), 'shortcuts': () => $('#shortcuts-dialog').showModal(),
        'theme': () => { state.settings.theme = resolvedTheme() === 'dark' ? 'light' : 'dark'; applyTheme(); saveState(); },
        'palette': openPalette, 'install': installApp,
        'clear-filters': () => { $('#task-search').value = ''; $('#category-filter').value = 'all'; $('#date-filter').value = 'all'; filters.tasks = 'all'; renderTasks(); },
        'timer-toggle': toggleTimer, 'timer-reset': resetTimer,
        'fullscreen': () => { if (document.fullscreenElement) document.exitFullscreen?.(); else $('#focus-stage').requestFullscreen?.().catch(() => showToast('ملء الشاشة مش متاح هنا.')); },
        'ambient-toggle': () => { if (ambient.playing) stopAmbient(); else startAmbient(); },
        'quran-back': () => { stopQuranAudio(); surahRequest++; currentSurah = 0; $('#quran-reader').hidden = true; $('#quran-library').hidden = false; renderQuranBookmarks(); },
        'quran-next': () => openSurah(Math.min(114, currentSurah + 1)),
        'quran-prev': () => openSurah(Math.max(1, currentSurah - 1)),
        'quran-retry': () => openSurah(currentSurah),
        'quran-smaller': () => { state.islam.quranSize = clamp(state.islam.quranSize - 2, 23, 42, 29); $('#quran-ayah-list').style.setProperty('--quran-size', `${state.islam.quranSize}px`); saveState(); },
        'quran-larger': () => { state.islam.quranSize = clamp(state.islam.quranSize + 2, 23, 42, 29); $('#quran-ayah-list').style.setProperty('--quran-size', `${state.islam.quranSize}px`); saveState(); },
        'quran-audio': () => { const data = loadedSurahs.get(currentSurah), audio = $('#quran-audio-element'); if (!data) return; if (!audio.paused) { audio.pause(); updateQuranAudio(); } else { const target = data.ayahs.find(x => x.numberInSurah === state.islam.position.ayah && state.islam.position.surah === currentSurah) || data.ayahs[0]; playQuranAyah(target.number); } },
        'download-quran': downloadQuran,
        'cancel-quran-download': () => { quranCancel = true; $('#quran-download-status').textContent = 'بنوقف التحميل بعد المجموعة الحالية...'; },
        'resume-quran': () => openSurah(state.islam.position.surah, state.islam.position.ayah),
        'open-daily-verse': () => { const [surah, ayah] = $('#daily-verse-text').dataset.reference.split(':').map(Number); openSurah(surah, ayah); },
        'reset-adhkar': async () => {
          if (!await askConfirm('تصفير عدّادات الأذكار؟', 'هنصفّر عدّادات القسم الحالي فقط، والمفضلة هتفضل محفوظة.', 'صفّر')) return;
          const day = dayKey(), list = zikrCategory === 'favorite' ? ADHKAR.filter(x => state.islam.zikrFavorites.includes(x.id)) : ADHKAR.filter(x => x.cat === zikrCategory);
          list.forEach(x => { if (state.islam.zikrCounts[day]) delete state.islam.zikrCounts[day][x.id]; });
          saveState(); renderAdhkar();
        },
        'use-geolocation': useGeolocation,
        'custom-location': () => {
          const latValue = $('#custom-lat').value.trim(), lonValue = $('#custom-lon').value.trim();
          const lat = Number(latValue), lon = Number(lonValue);
          if (!latValue || !lonValue || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) { showToast('اكتب خط عرض من -90 إلى 90 وخط طول من -180 إلى 180.'); return; }
          setPrayerLocation('custom', lat, lon, Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Cairo', `إحداثيات ${lat.toFixed(2)}، ${lon.toFixed(2)}`, state.islam.method);
          showToast('الموقع اتحدد. بنحمّل المواقيت.');
        },
        'toggle-prayer-alerts': async () => {
          const enabling = !state.islam.prayerAlerts;
          if (enabling && 'Notification' in window && Notification.permission === 'default') await Notification.requestPermission().catch(() => 'denied');
          state.islam.prayerAlerts = enabling;
          saveState(); renderPrayer();
          showToast(enabling ? 'التنبيهات مفعّلة طالما التطبيق مفتوح. إشعارات النظام تحتاج السماح من المتصفح.' : 'تنبيهات الصلاة اتوقفت.');
        },
        'enable-compass': enableCompass,
        'tasbih-plus': addTasbih,
        'tasbih-undo': () => { const t = state.islam.tasbih; if (!(t.counts[t.phrase] > 0)) return; t.counts[t.phrase]--; t.total = Math.max(0, t.total - 1); saveState(); renderTasbih(); },
        'tasbih-reset': async () => { const t = state.islam.tasbih; if (!t.counts[t.phrase]) return; if (!await askConfirm('نبدأ التسبيح من جديد؟', 'العدّاد للذكر ده هيبدأ من صفر، والمجموع الكلي هيفضل محفوظ.', 'ابدأ من جديد')) return; t.counts[t.phrase] = 0; saveState(); renderTasbih(); },
        'export-data': exportData, 'import-data': () => $('#import-file').click(), 'reset-data': resetData,
        'close-toast': () => { clearTimeout(toastTimeout); $('#toast').hidden = true; toastCallback = null; }
      };


      document.addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        const d = b.dataset;
        if (d.view) d.view === 'islam' ? switchIslamTab('home') : navigate(d.view);
        else if (d.islamTab) switchIslamTab(d.islamTab);
        else if (d.islamGo) switchIslamTab(d.islamGo);
        else if (d.action && actions[d.action]) actions[d.action]();
        else if (d.prayerCheck) togglePrayerCheck(d.prayerCheck);
        else if (d.openSurah) openSurah(d.openSurah);
        else if (d.openVerse) { const [surah, ayah] = d.openVerse.split(':').map(Number); openSurah(surah, ayah); }
        else if (d.quranPosition) markQuranPosition(d.quranPosition);
        else if (d.quranBookmark) toggleQuranBookmark(d.quranBookmark);
        else if (d.quranPlay) playQuranAyah(d.quranPlay);
        else if (d.quranShare) shareQuranVerse(d.quranShare);
        else if (d.zikrCount) incrementZikr(d.zikrCount);
        else if (d.zikrFavorite) {
          const favorites = state.islam.zikrFavorites, index = favorites.indexOf(d.zikrFavorite);
          if (index >= 0) favorites.splice(index, 1); else favorites.push(d.zikrFavorite);
          saveState(); renderAdhkar();
        }
        else if (d.zikrCat) { zikrCategory = d.zikrCat; renderAdhkar(); }
        else if (d.editTask) openTask(d.editTask);
        else if (d.editHabit) openHabit(d.editHabit);
        else if (d.habitId && d.day) toggleHabitDay(d.habitId, d.day);
        else if (d.noteId) { activeNoteId = d.noteId; $('#notes-layout').dataset.mode = 'editor'; renderNotes(); }
        else if (d.mood) { const k = dayKey(); if (state.moods[k]?.score === Number(d.mood)) delete state.moods[k]; else state.moods[k] = { score: Number(d.mood) }; saveState(); renderMood(); if (activeView === 'insights') renderInsights(); }
        else if (d.filter) { filters[d.filterView] = d.filter; renderTasks(); }
        else if (d.timerMode) switchTimerMode(d.timerMode);
        else if (d.paletteChoice) { state.settings.palette = d.paletteChoice; applyTheme(); saveState(); $$('.swatch').forEach(s => s.classList.toggle('active', s.dataset.paletteChoice === d.paletteChoice)); }
        else if (d.paletteIndex !== undefined) runPalette(Number(d.paletteIndex));
        else if (b.closest('#emoji-picker')) { $('#emoji-picker').dataset.value = b.textContent; $$('#emoji-picker button').forEach(x => x.classList.toggle('active', x === b)); }
        else if (d.closeDialog) document.getElementById(d.closeDialog).close('cancel');
      });
      document.addEventListener('change', e => {
        if (e.target.matches('[data-task-check]')) toggleTask(e.target.dataset.taskCheck, e.target.checked);
      });
      $('#task-form').addEventListener('submit', e => {
        e.preventDefault();
        const title = $('#task-title-input').value.trim();
        if (!title) { $('#task-title-input').focus(); showToast('اكتب خطوة صغيرة الأول.'); return; }
        const id = $('#task-id').value;
        const values = { title, category: $('#task-category-input').value, priority: $('#task-priority-input').value, due: $('#task-date-input').value, reminder: $('#task-reminder-input').value, repeat: $('#task-repeat-input').value, details: $('#task-details-input').value.trim().slice(0, 1000) };
        if (id) { const t = state.tasks.find(x => x.id === id); if (!t) return; if (t.reminder !== values.reminder || t.due !== values.due) t.remindedOn = ''; Object.assign(t, values); saveState(); refresh(); }
        else if (!addTask(values)) return;
        $('#task-dialog').close();
        showToast(id ? 'خطوتك اتعدّلت.' : values.due > dayKey() ? 'اتضافت لليوم اللي اخترته. هتلاقيها في كل مهامك.' : 'خطوة جديدة في يومك. بداية حلوة.');
      });
      $('#habit-form').addEventListener('submit', e => {
        e.preventDefault();
        const name = $('#habit-name-input').value.trim();
        if (!name) { $('#habit-name-input').focus(); showToast('اكتب اسم العادة الأول.'); return; }
        const id = $('#habit-id').value, emoji = $('#emoji-picker').dataset.value || '🌱', target = clamp($('#habit-target-input').value, 1, 7, 7);
        if (id) { const h = state.habits.find(x => x.id === id); if (h) Object.assign(h, { name: name.slice(0, 60), emoji, target }); }
        else { if (state.habits.length >= 40) { showToast('٤٠ عادة كفاية جدا. ركّز على الأهم.'); return; } state.habits.push({ id: uid(), name: name.slice(0, 60), emoji, target, log: {}, createdAt: Date.now() }); }
        saveState(); refresh(); $('#habit-dialog').close();
        showToast(id ? 'عادتك اتعدّلت.' : 'عادة جديدة. أول يوم هو الأهم.');
      });
      $('#quick-add-form').addEventListener('submit', e => {
        e.preventDefault();
        const input = $('#quick-task-input');
        if (!input.value.trim()) { input.focus(); showToast('اكتب خطوة صغيرة الأول.'); return; }
        if (addTask({ title: input.value.trim() })) { input.value = ''; input.focus(); showToast('خطوة جديدة في يومك. بداية حلوة.'); }
      });
      ['task-search', 'category-filter', 'task-sort', 'date-filter'].forEach(id => $(`#${id}`).addEventListener(id === 'task-search' ? 'input' : 'change', renderTasks));
      $('#notes-search').addEventListener('input', renderNotes);
      $('#quick-note').addEventListener('input', e => { const n = ensureQuickNote(); n.body = e.target.value.slice(0, 20000); n.updatedAt = Date.now(); if (activeNoteId === 'quick') $('#notes-editor').value = n.body; scheduleNoteSave(); });
      $('#notes-editor').addEventListener('input', e => { const n = state.notes.find(x => x.id === activeNoteId); if (!n) return; n.body = e.target.value.slice(0, 20000); n.updatedAt = Date.now(); if (n.id === 'quick') $('#quick-note').value = n.body; scheduleNoteSave(); });
      $('#note-title-input').addEventListener('input', e => { const n = state.notes.find(x => x.id === activeNoteId); if (!n) return; n.title = e.target.value.slice(0, 80); n.updatedAt = Date.now(); scheduleNoteSave(); });
      $('#focus-task').addEventListener('change', e => { state.timer.taskId = e.target.value; saveState(); renderTimer(true); });
      $('#ambient-select').addEventListener('change', e => { state.settings.ambient = e.target.value; saveState(); if (ambient.playing || state.settings.ambient === 'none') startAmbient(); else renderAmbient(); });
      $('#ambient-volume').addEventListener('input', e => { state.settings.ambientVolume = Number(e.target.value); if (ambient.nodes) ambient.nodes.gain.gain.value = state.settings.ambientVolume * (state.settings.ambient === 'rain' ? .5 : .9); });
      $('#ambient-volume').addEventListener('change', saveState);
      $('#import-file').addEventListener('change', importData);
      $('#surah-filter').addEventListener('input', renderSurahList);
      $('#quran-search-form').addEventListener('submit', event => { event.preventDefault(); searchQuran($('#quran-text-query').value); });
      $('#quran-text-query').addEventListener('input', event => { if (!event.target.value.trim()) $('#quran-search-results').hidden = true; });
      $('#prayer-city').addEventListener('change', event => {
        const id = event.target.value;
        if (id === 'gps') { useGeolocation(); renderPrayer(); return; }
        if (id === 'custom') { $('#custom-lat').closest('details').open = true; $('#custom-lat').focus(); renderPrayer(); return; }
        const city = CITIES.find(x => x[0] === id);
        if (city) setPrayerLocation(city[0], city[2], city[3], city[4], city[1], city[5]);
      });
      ['prayer-method', 'prayer-school'].forEach(id => $(`#${id}`).addEventListener('change', () => {
        const i = state.islam;
        i.method = Number($('#prayer-method').value);
        i.school = Number($('#prayer-school').value);
        i.prayerCache = {}; i.prayerNotified = {}; prayerRequest++;
        saveState(); renderPrayer(); loadPrayerCalendar();
      }));
      $('#tasbih-phrase').addEventListener('change', event => { state.islam.tasbih.phrase = event.target.value; saveState(); renderTasbih(); });
      $('#tasbih-target').addEventListener('change', event => { state.islam.tasbih.target = Number(event.target.value); saveState(); renderTasbih(); });
      $('#quran-audio-element').addEventListener('ended', () => {
        const audio = $('#quran-audio-element'), data = loadedSurahs.get(Number(audio.dataset.surah));
        const index = data?.ayahs.findIndex(x => x.number === Number(audio.dataset.ayah));
        if (Number(audio.dataset.surah) === currentSurah && index >= 0 && index < data.ayahs.length - 1) playQuranAyah(data.ayahs[index + 1].number);
        else stopQuranAudio();
      });
      $('#quran-audio-element').addEventListener('pause', updateQuranAudio);
      $('#settings-form').addEventListener('submit', async e => {
        e.preventDefault();
        const s = state.settings, fresh = !state.timer.running && state.timer.remaining === state.timer.duration;
        s.name = $('#settings-name').value.trim().slice(0, 30); s.dailyGoal = clamp($('#settings-goal').value, 1, 20, 3);
        s.focusMinutes = clamp($('#settings-focus').value, 1, 120, 25); s.breakMinutes = clamp($('#settings-break').value, 1, 60, 5); s.longBreakMinutes = clamp($('#settings-long').value, 1, 60, 15); s.longBreakEvery = clamp($('#settings-every').value, 2, 8, 4);
        s.autoStart = $('#settings-autostart').checked; s.sound = $('#settings-sound').checked; s.theme = $('#settings-theme').value;
        const wantNotif = $('#settings-notifications').checked;
        if (wantNotif && 'Notification' in window && Notification.permission !== 'granted') {
          const p = await Notification.requestPermission().catch(() => 'denied');
          s.notifications = p === 'granted';
          if (!s.notifications) showToast('المتصفح ما سمحش بالإشعارات. التذكيرات هتظهر جوه التطبيق.');
        } else s.notifications = wantNotif && 'Notification' in window;
        if (fresh) { state.timer.duration = timerDuration(); state.timer.remaining = state.timer.duration; }
        saveState(); applyTheme(); renderDate(); renderTimer(true); renderTasks();
        $('#settings-dialog').close(); showToast('اختياراتك اتحفظت. يومك بطريقتك.');
      });
      $('#palette-input').addEventListener('input', renderPalette);
      $('#palette-input').addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') { e.preventDefault(); paletteIndex = Math.min(paletteItems.length - 1, paletteIndex + 1); highlightPalette(); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); paletteIndex = Math.max(0, paletteIndex - 1); highlightPalette(); }
        else if (e.key === 'Enter') { e.preventDefault(); runPalette(paletteIndex); }
      });
      $('#confirm-yes').addEventListener('click', () => $('#confirm-dialog').close('yes'));
      $('#confirm-dialog').addEventListener('close', () => { if (confirmResolver) { confirmResolver($('#confirm-dialog').returnValue === 'yes'); confirmResolver = null; } });
      $('#toast-action').addEventListener('click', () => { const cb = toastCallback; clearTimeout(toastTimeout); $('#toast').hidden = true; toastCallback = null; cb?.(); });
      $$('dialog').forEach(dialog => {
        dialog.addEventListener('click', e => { if (e.target !== dialog) return; const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close('cancel'); });
        dialog.addEventListener('close', () => { if (dialog.contains($('#toast'))) ($$('dialog[open]').at(-1) || document.body).append($('#toast')); });
      });
      document.addEventListener('keydown', e => {
        if ((e.ctrlKey || e.metaKey) && (e.code === 'KeyK' || e.key === '/')) { e.preventDefault(); if ($('#palette-dialog').open) return; $$('dialog[open]').forEach(d => d.close('cancel')); openPalette(); return; }
        if ($('dialog[open]') || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
        if (e.target.matches('input,textarea,select,[contenteditable="true"]')) return;
        const k = e.code;
        if (k === 'KeyN') { e.preventDefault(); openTask(); }
        else if (k === 'KeyM') { e.preventDefault(); newNote(); }
        else if (k === 'KeyT') { e.preventDefault(); actions.theme(); }
        else if (k === 'Space' && activeView === 'focus' && !e.target.closest('button')) { e.preventDefault(); toggleTimer(); }
        else if (k === 'Space' && activeView === 'islam' && islamTab === 'tasbih' && !e.target.closest('button')) { e.preventDefault(); addTasbih(); }
        else if (/^Digit[1-7]$/.test(k)) { e.preventDefault(); const view = VIEWS[Number(k.slice(5)) - 1]; view === 'islam' ? switchIslamTab('home') : navigate(view); }
      });
      function restoreRoute() { const v = location.hash.slice(1); if (VIEWS.includes(v) && v !== activeView) navigate(v, false); else if (!v && activeView !== 'today') navigate('today', false); }
      window.addEventListener('popstate', restoreRoute);
      window.addEventListener('hashchange', restoreRoute);
      window.addEventListener('online', () => { setStorageStatus(); if (activeView === 'islam') { loadPrayerCalendar(); if (islamTab === 'quran') loadSurahIndex(); } showToast('رجع الإنترنت. وأنت أصلا ما وقفتش.'); });
      window.addEventListener('offline', () => { setStorageStatus(); showToast('مفيش نت دلوقتي. يومك شغال بالكامل بدون إنترنت.'); });
      window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; renderInstallButtons(); });
      window.addEventListener('appinstalled', () => { deferredPrompt = null; renderInstallButtons(); showToast('يومك اتثبّت. هتلاقيه مع تطبيقاتك.'); });
      matchMedia('(display-mode: standalone)').addEventListener('change', renderInstallButtons);
      document.addEventListener('visibilitychange', () => { tick(); checkReminders(true); syncWakeLock(); if (document.hidden) { clearTimeout(noteSaveTimeout); saveState(); } else { renderDate(); if (activeView === 'islam') loadPrayerCalendar(); } });
      window.addEventListener('pagehide', () => { clearTimeout(noteSaveTimeout); saveState(); });


      $('#emoji-picker').append(...EMOJIS.map(e => { const b = document.createElement('button'); b.type = 'button'; b.textContent = e; b.setAttribute('aria-label', `رمز ${e}`); return b; }));
      $$('[data-developer]').forEach(link => { link.href = `https://wa.me/201550802408?text=${encodeURIComponent('السلام عليكم يا elsayed hasan، عندي استفسار بخصوص تطبيق يومك وأحب أتواصل معك.')}`; });
      renderAll();
      navigate(location.hash.slice(1) || 'today', false);
      if (state.timer.running) syncWakeLock();
      saveState(); tick(); checkReminders(true);
      setInterval(tick, 250);
      registerServiceWorker(); makeAppleIcon();
      if (loadNotice) setTimeout(() => showToast(loadNotice), 800);
      else if (freshStart || !state.meta.onboarded) { state.meta.onboarded = true; saveState(); setTimeout(() => { if (!$('dialog[open]')) $('#help-dialog').showModal(); }, 700); }
      else if (!isStandalone() && state.meta.lastBackupAt === null && state.tasks.length > 8) setTimeout(() => showToast('بقى عندك شغل كتير هنا. نزّل نسخة احتياطية؟', 'نزّل الآن', exportData), 4000);
    })();
