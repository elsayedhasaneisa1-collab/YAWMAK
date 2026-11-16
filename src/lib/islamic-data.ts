export interface DhikrItem {
  id: string;
  category: "morning" | "evening" | "sleep" | "wakeup" | "prayer" | "after_prayer" | "general";
  text: string;
  repeat: number;
  source: string;
  reference: string;
  note?: string;
}

export interface DuaItem {
  id: string;
  category: "quran" | "sunnah" | "general";
  title: string;
  text: string;
  source: string;
  reference: string;
}

export interface SurahSummary {
  number: number;
  name: string;
  englishName: string;
  ayahCount: number;
  revelationType: "مكية" | "مدنية";
}

export const ADHKAR_CATEGORIES = [
  { id: "morning", label: "أذكار الصباح" },
  { id: "evening", label: "أذكار المساء" },
  { id: "sleep", label: "أذكار النوم" },
  { id: "wakeup", label: "أذكار الاستيقاظ" },
  { id: "prayer", label: "أذكار الصلاة" },
  { id: "after_prayer", label: "أذكار بعد الصلاة" },
  { id: "general", label: "أذكار عامة" },
] as const;

export const VERIFIED_ADHKAR: readonly DhikrItem[] = [
  {
    id: "m-kursi",
    category: "morning",
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    repeat: 1,
    source: "القرآن الكريم",
    reference: "سورة البقرة — آية ٢٥٥",
    note: "من قالها حين يصبح أُجير من الجن حتى يمسي (صححه الألباني في صحيح الترغيب).",
  },
  {
    id: "m-asbahna",
    category: "morning",
    text: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    repeat: 1,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٢٧٢٣",
    note: "ذكر جامع للاستعاذة وطلب الخير في مطلع اليوم.",
  },
  {
    id: "m-sayyid",
    category: "morning",
    text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    repeat: 1,
    source: "صحيح البخاري",
    reference: "صحيح البخاري — رقم ٦٣٠٦ (سيد الاستغفار)",
    note: "سيد الاستغفار؛ يقال موقنًا به في الصباح والمساء.",
  },
  {
    id: "m-bismillah",
    category: "morning",
    text: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    repeat: 3,
    source: "سنن أبي داود والترمذي",
    reference: "أبو داود (٥٠٨٨)، الترمذي (٣٣٨٨) — حديث صحيح",
    note: "تحصين نبوي كريم يُقال ثلاث مرات صباحًا ومساءً.",
  },
  {
    id: "m-raditu",
    category: "morning",
    text: "رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا",
    repeat: 3,
    source: "سنن أبي داود",
    reference: "أبو داود (٥٠٧٢) ومسند أحمد — إسناده حسن",
  },
  {
    id: "e-amsayna",
    category: "evening",
    text: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا",
    repeat: 1,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٢٧٢٣",
  },
  {
    id: "e-kalimat",
    category: "evening",
    text: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    repeat: 3,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٢٧٠٩",
  },
  {
    id: "e-subhan",
    category: "evening",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    repeat: 100,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٢٦٩٢",
    note: "من قالها حين يصبح وحين يمسي مائة مرة لم يأتِ أحد يوم القيامة بأفضل مما جاء به إلا أحد قال مثل ما قال أو زاد عليه.",
  },
  {
    id: "s-bismika",
    category: "sleep",
    text: "بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي، وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ",
    repeat: 1,
    source: "صحيح البخاري ومسلم",
    reference: "البخاري (٦٣٢٠)، مسلم (٢٧١٤)",
  },
  {
    id: "s-allahumma",
    category: "sleep",
    text: "اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا",
    repeat: 1,
    source: "صحيح البخاري",
    reference: "صحيح البخاري — رقم ٦٣١٢",
  },
  {
    id: "s-tasbih",
    category: "sleep",
    text: "سُبْحَانَ اللَّهِ (٣٣) — الْحَمْدُ لِلَّهِ (٣٣) — اللَّهُ أَكْبَرُ (٣٤)",
    repeat: 1,
    source: "صحيح البخاري ومسلم",
    reference: "البخاري (٣٧٠٥)، مسلم (٢٧٢٧)",
    note: "وصية النبي ﷺ لفاطمة وعلي رضي الله عنهما عند أخذ المضجع.",
  },
  {
    id: "w-alhamdulillah",
    category: "wakeup",
    text: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    repeat: 1,
    source: "صحيح البخاري",
    reference: "صحيح البخاري — رقم ٦٣١٢",
  },
  {
    id: "w-afani",
    category: "wakeup",
    text: "الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ",
    repeat: 1,
    source: "سنن الترمذي",
    reference: "سنن الترمذي — رقم ٣٤٠١ (حديث حسن)",
  },
  {
    id: "p-istiftah",
    category: "prayer",
    text: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
    repeat: 1,
    source: "سنن أبي داود والترمذي",
    reference: "أبو داود (٧٧٥)، الترمذي (٢٤٢) — دعاء الاستفتاح",
  },
  {
    id: "p-ruku",
    category: "prayer",
    text: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    repeat: 3,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٧٧٢ (ذكر الركوع)",
  },
  {
    id: "p-sujud",
    category: "prayer",
    text: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    repeat: 3,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٧٧٢ (ذكر السجود)",
  },
  {
    id: "ap-istighfar",
    category: "after_prayer",
    text: "أَسْتَغْفِرُ اللَّهَ (ثلاثًا) — اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ",
    repeat: 1,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٥٩١",
  },
  {
    id: "ap-tasbih",
    category: "after_prayer",
    text: "سُبْحَانَ اللَّهِ (٣٣) — الْحَمْدُ لِلَّهِ (٣٣) — اللَّهُ أَكْبَرُ (٣٣)، وتمام المائة: لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    repeat: 1,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٥٩٧",
  },
  {
    id: "ap-muadh",
    category: "after_prayer",
    text: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    repeat: 1,
    source: "سنن أبي داود والنسائي",
    reference: "أبو داود (١٥٢٢) — صححه الألباني",
  },
  {
    id: "g-hawqala",
    category: "general",
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    repeat: 10,
    source: "صحيح البخاري ومسلم",
    reference: "البخاري (٤٢٠٥)، مسلم (٢٧٠٤) — كنز من كنوز الجنة",
  },
  {
    id: "g-tahlil",
    category: "general",
    text: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    repeat: 10,
    source: "صحيح البخاري ومسلم",
    reference: "البخاري (٣٢٩٣)، مسلم (٢٦٩١)",
  },
  {
    id: "g-salawat",
    category: "general",
    text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
    repeat: 10,
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٤٠٨ (من صلى علي واحدة صلى الله عليه بها عشرًا)",
  },
] as const;

export const VERIFIED_DUAS: readonly DuaItem[] = [
  {
    id: "q-hasanah",
    category: "quran",
    title: "دعاء خيري الدنيا والآخرة",
    text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    source: "القرآن الكريم",
    reference: "سورة البقرة — آية ٢٠١",
  },
  {
    id: "q-hidayah",
    category: "quran",
    title: "دعاء الثبات على الهداية",
    text: "رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ",
    source: "القرآن الكريم",
    reference: "سورة آل عمران — آية ٨",
  },
  {
    id: "q-parents",
    category: "quran",
    title: "دعاء للوالدين وللمؤمنين",
    text: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ",
    source: "القرآن الكريم",
    reference: "سورة إبراهيم — آية ٤١",
  },
  {
    id: "q-ilm",
    category: "quran",
    title: "دعاء زيادة العلم",
    text: "رَّبِّ زِدْنِي عِلْمًا",
    source: "القرآن الكريم",
    reference: "سورة طه — آية ١١٤",
  },
  {
    id: "q-family",
    category: "quran",
    title: "دعاء صلاح الأسرة والذرية",
    text: "رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا",
    source: "القرآن الكريم",
    reference: "سورة الفرقان — آية ٧٤",
  },
  {
    id: "q-yunus",
    category: "quran",
    title: "دعاء الكرب (دعوة ذي النون)",
    text: "لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    source: "القرآن الكريم",
    reference: "سورة الأنبياء — آية ٨٧",
  },
  {
    id: "s-taqwa",
    category: "sunnah",
    title: "دعاء الهدى والتقى والعفاف والغنى",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى",
    source: "صحيح مسلم",
    reference: "صحيح مسلم — رقم ٢٧٢١",
  },
  {
    id: "s-afiyah",
    category: "sunnah",
    title: "دعاء العفو والعافية",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي",
    source: "سنن أبي داود وابن ماجه",
    reference: "أبو داود (٥٠٧٤) — حديث صحيح",
  },
  {
    id: "s-qulub",
    category: "sunnah",
    title: "دعاء تثبيت القلب",
    text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    source: "سنن الترمذي",
    reference: "سنن الترمذي — رقم ٢١٤٠ (حديث صحيح)",
  },
  {
    id: "s-hamm",
    category: "sunnah",
    title: "دعاء الاستعاذة من الهم والحزن",
    text: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْجُبْنِ وَالْبُخْلِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ",
    source: "صحيح البخاري",
    reference: "صحيح البخاري — رقم ٦٣٦٩",
  },
  {
    id: "s-rizq",
    category: "sunnah",
    title: "دعاء العلم النافع والرزق الطيب",
    text: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا",
    source: "سنن ابن ماجه",
    reference: "ابن ماجه (٩٢٥) — صححه الألباني",
  },
  {
    id: "gen-yawmak",
    category: "general",
    title: "دعاء عام للبركة والعمل الصالح",
    text: "اللَّهُمَّ استعملنا في طاعتك، وبارك لنا في أوقاتنا وأعمالنا، واجعل لنا أثرًا طيبًا نافعًا يبقى بعدنا خالصًا لوجهك الكريم.",
    source: "دعاء عام مباح (غير منسوب للسنة)",
    reference: "دعاء عام مأثور المعنى",
  },
  {
    id: "gen-sakinah",
    category: "general",
    title: "دعاء عام للسكينة والطمأنينة",
    text: "اللَّهُمَّ أنزل على قلوبنا السكينة والرضا، واصرف عنا شتات الأمر، ووفّقنا لما تحب وترضى في القول والعمل.",
    source: "دعاء عام مباح (غير منسوب للسنة)",
    reference: "دعاء عام",
  },
] as const;

export const COMMUNITY_DHIKR_COUNTERS = [
  { key: "subhanallah", text: "سُبْحَانَ اللَّهِ", label: "سبحان الله", target: 33 },
  { key: "alhamdulillah", text: "الْحَمْدُ لِلَّهِ", label: "الحمد لله", target: 33 },
  { key: "la_ilaha_illa_allah", text: "لَا إِلَهَ إِلَّا اللَّهُ", label: "لا إله إلا الله", target: 100 },
  { key: "allahu_akbar", text: "اللَّهُ أَكْبَرُ", label: "الله أكبر", target: 34 },
  { key: "astaghfirullah", text: "أَسْتَغْفِرُ اللَّهَ", label: "أستغفر الله", target: 100 },
  {
    key: "subhanallah_wabihamdihi",
    text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    label: "سبحان الله وبحمده",
    target: 100,
  },
  {
    key: "la_hawla_wa_quwwata_illa_billah",
    text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    label: "لا حول ولا قوة إلا بالله",
    target: 100,
  },
] as const;

export interface MourningDuaItem {
  id: string;
  text: string;
  source: string;
  reference: string;
  verified: boolean;
}

export const MOURNING_DUAS: readonly MourningDuaItem[] = [
  {
    id: "q-rabbighfir",
    text: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِينَ سَبَقُونَا بِالْإِيمَانِ وَلَا تَجْعَلْ فِي قُلُوبِنَا غِلًّا لِّلَّذِينَ آمَنُوا رَبَّنَا إِنَّكَ رَءُوفٌ رَّحِيمٌ",
    source: "القرآن الكريم",
    reference: "سورة الحشر — الآية ١٠",
    verified: true,
  },
  {
    id: "m-funeral",
    text: "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ",
    source: "الدعاء للميت عند الصلاة عليه",
    reference: "صحيح مسلم — رقم ٩٦٣",
    verified: true,
  },
  {
    id: "m-all-believers",
    text: "اللَّهُمَّ اغْفِرْ لِلْمُسْلِمِينَ وَالْمُسْلِمَاتِ، الْأَحْيَاءِ مِنْهُمْ وَالْأَمْوَاتِ",
    source: "دعاء زيارة القبور",
    reference: "صحيح مسلم — رقم ٩٧٤",
    verified: true,
  },
  {
    id: "m-garden",
    text: "اللَّهُمَّ اجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ، وَلَا تَجْعَلْهُ حُفْرَةً مِنْ حُفَرِ النَّارِ",
    source: "دعاء عام مباح",
    reference: "دعاء مأثور يُقال للمتوفى دون نسبته إلى حديث محدد",
    verified: false,
  },
  {
    id: "m-loneliness",
    text: "اللَّهُمَّ آنِسْ وَحْشَتَهُ، وَنَوِّرْ لَهُ قَبْرَهُ، وَاجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبِهِ",
    source: "دعاء عام مباح",
    reference: "دعاء مأثور للمتوفى دون نسبة إلى نص قرآني أو حديث محدد",
    verified: false,
  },
  {
    id: "m-join",
    text: "اللَّهُمَّ اجْمَعْهُ بِالصَّالِحِينَ فِي جَنَّاتِ النَّعِيمِ، وَارْحَمْهُ بِرَحْمَتِكَ الَّتِي وَسِعَتْ كُلَّ شَيْءٍ",
    source: "دعاء عام مباح",
    reference: "دعاء عام للمتوفى",
    verified: false,
  },
] as const;

export const DEFAULT_TASBIH_PRESETS = [
  { key: "subhanallah", text: "سُبْحَانَ اللَّهِ", target: 33 },
  { key: "alhamdulillah", text: "الْحَمْدُ لِلَّهِ", target: 33 },
  { key: "allahuakbar", text: "اللَّهُ أَكْبَرُ", target: 34 },
  { key: "astaghfirullah", text: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ", target: 100 },
  { key: "subhanallah_wabihamdihi", text: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100 },
  { key: "salawat", text: "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ", target: 100 },
  { key: "hawqala", text: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 33 },
] as const;

export const HIJRI_MONTHS_AR = [
  "محرم",
  "صفر",
  "ربيع الأول",
  "ربيع الآخر",
  "جمادى الأولى",
  "جمادى الآخرة",
  "رجب",
  "شعبان",
  "رمضان",
  "شوال",
  "ذو القعدة",
  "ذو الحجة",
] as const;

export const ISLAMIC_OCCASIONS = [
  { month: 1, day: 1, title: "رأس السنة الهجرية", note: "بداية العام الهجري الجديد" },
  { month: 1, day: 10, title: "يوم عاشوراء", note: "يُستحب صيامه وتاسوعاء قبله" },
  { month: 7, day: 27, title: "ذكرى الإسراء والمعراج", note: "مناسبة تاريخية إسلامية" },
  { month: 8, day: 15, title: "ليلة النصف من شعبان", note: "الاستعداد الروحي لشهر رمضان" },
  { month: 9, day: 1, title: "بداية شهر رمضان المبارك", note: "شهر القرآن والرحمة والمغفرة" },
  { month: 9, day: 21, title: "بداية العشر الأواخر من رمضان", note: "تحري ليلة القدر" },
  { month: 10, day: 1, title: "عيد الفطر المبارك", note: "أول أيام شهر شوال" },
  { month: 12, day: 9, title: "يوم عرفة", note: "أفضل أيام العام ويُستحب صيامه لغير الحاج" },
  { month: 12, day: 10, title: "عيد الأضحى المبارك", note: "أيام النحر والتكبير" },
] as const;

export function calculateQiblaBearing(latDeg: number, lngDeg: number): number {
  const kaabaLat = (21.422487 * Math.PI) / 180;
  const kaabaLng = (39.826206 * Math.PI) / 180;
  const lat = (latDeg * Math.PI) / 180;
  const lng = (lngDeg * Math.PI) / 180;
  const dLng = kaabaLng - lng;

  const y = Math.sin(dLng);
  const x = Math.cos(lat) * Math.tan(kaabaLat) - Math.sin(lat) * Math.cos(dLng);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Math.round(bearing * 10) / 10;
}

export function getDayIndex(date = new Date()): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getDailyHighlights(date = new Date()) {
  const idx = getDayIndex(date);
  const dhikr = VERIFIED_ADHKAR[idx % VERIFIED_ADHKAR.length];
  const dua = VERIFIED_DUAS[idx % VERIFIED_DUAS.length];
  const juzNumber = (idx % 30) + 1;
  return {
    dhikr,
    dua,
    dailyWird: {
      juzNumber,
      title: `ورد اليوم المقترح — الجزء ${juzNumber}`,
      description: "اقرأ صفحة أو أكثر بتدبر وهدوء، واحفظ موضع قراءتك في قسم القرآن الكريم.",
    },
  };
}

export function getHijriDateFormatted(date = new Date(), adjustmentDays = 0) {
  const adjusted = new Date(date.getTime() + adjustmentDays * 86400000);
  try {
    const formatter = new Intl.DateTimeFormat("ar-SA-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
    const parts = formatter.formatToParts(adjusted);
    const weekday = parts.find((p) => p.type === "weekday")?.value || "";
    const day = parts.find((p) => p.type === "day")?.value || "";
    const month = parts.find((p) => p.type === "month")?.value || "";
    const year = parts.find((p) => p.type === "year")?.value || "";

    const gregFormatted = new Intl.DateTimeFormat("ar-EG", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);

    return {
      hijriFull: `${weekday} ${day} ${month} ${year} هـ`,
      hijriDay: day,
      hijriMonth: month,
      hijriYear: year,
      gregorianFull: gregFormatted,
    };
  } catch {
    return {
      hijriFull: "التقويم الهجري — أم القرى",
      hijriDay: "",
      hijriMonth: "",
      hijriYear: "",
      gregorianFull: date.toLocaleDateString("ar-EG"),
    };
  }
}

export const QURAN_RECITERS = [
  { id: "ar.alafasy", name: "مشاري راشد العفاسي", style: "مرتل", server: "https://server8.mp3quran.net/afs/" },
  { id: "ar.husary", name: "محمود خليل الحصري", style: "مرتل", server: "https://server13.mp3quran.net/husr/" },
  { id: "ar.minshawi", name: "محمد صديق المنشاوي", style: "مرتل", server: "https://server10.mp3quran.net/minsh/" },
  { id: "ar.abdulbasitmurattal", name: "عبد الباسط عبد الصمد", style: "مرتل", server: "https://server7.mp3quran.net/basit/" },
  { id: "ar.mahermuaiqly", name: "ماهر المعيقلي", style: "مرتل", server: "https://server12.mp3quran.net/maher/" },
] as const;

export const FALLBACK_SURAHS: readonly SurahSummary[] = [
  { number: 1, name: "سُورَةُ ٱلْفَاتِحَةِ", englishName: "Al-Fatiha", ayahCount: 7, revelationType: "مكية" },
  { number: 2, name: "سُورَةُ البَقَرَةِ", englishName: "Al-Baqara", ayahCount: 286, revelationType: "مدنية" },
  { number: 3, name: "سُورَةُ آلِ عِمۡرَانَ", englishName: "Aal-i-Imran", ayahCount: 200, revelationType: "مدنية" },
  { number: 18, name: "سُورَةُ الكَهۡفِ", englishName: "Al-Kahf", ayahCount: 110, revelationType: "مكية" },
  { number: 36, name: "سُورَةُ يسٓ", englishName: "Ya-Sin", ayahCount: 83, revelationType: "مكية" },
  { number: 55, name: "سُورَةُ الرَّحۡمَٰن", englishName: "Ar-Rahman", ayahCount: 78, revelationType: "مدنية" },
  { number: 56, name: "سُورَةُ الوَاقِعَةِ", englishName: "Al-Waqi'a", ayahCount: 96, revelationType: "مكية" },
  { number: 67, name: "سُورَةُ المُلۡكِ", englishName: "Al-Mulk", ayahCount: 30, revelationType: "مكية" },
  { number: 112, name: "سُورَةُ الإِخۡلَاصِ", englishName: "Al-Ikhlas", ayahCount: 4, revelationType: "مكية" },
  { number: 113, name: "سُورَةُ الفَلَقِ", englishName: "Al-Falaq", ayahCount: 5, revelationType: "مكية" },
  { number: 114, name: "سُورَةُ النَّاسِ", englishName: "An-Nas", ayahCount: 6, revelationType: "مكية" },
];
