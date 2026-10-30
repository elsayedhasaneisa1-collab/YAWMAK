
    (() => {
      'use strict';
      const STORAGE_KEY = 'yawmak.workspace.v1';
      const categories = { personal: 'شخصي', work: 'شغل', learn: 'تعلّم', health: 'صحة' };
      const $ = (selector, root = document) => root.querySelector(selector);
      const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
      const icon = name => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
      const uid = () => window.crypto?.randomUUID?.() || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      const dayKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const clamp = (value, min, max, fallback) => Number.isFinite(Number(value)) ? Math.min(max, Math.max(min, Math.round(Number(value)))) : fallback;
      const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && dayKey(new Date(`${value}T12:00:00`)) === value;
      let storageAvailable = true;
      let storageWarningShown = false;
      let loadNotice = '';
      let activeView = 'today';
      const filters = { today: 'all', tasks: 'all' };
      let noteSaveTimeout;
      let toastTimeout;
      let toastCallback;
      let confirmResolver;
      let audioContext;
      let lastRenderedSecond = -1;
      let lastDay = dayKey();

      const surahData = `الفاتحة|7|مكية
البقرة|286|مدنية
آل عمران|200|مدنية
النساء|176|مدنية
المائدة|120|مدنية
الأنعام|165|مكية
الأعراف|206|مكية
الأنفال|75|مدنية
التوبة|129|مدنية
يونس|109|مكية
هود|123|مكية
يوسف|111|مكية
الرعد|43|مدنية
إبراهيم|52|مكية
الحجر|99|مكية
النحل|128|مكية
الإسراء|111|مكية
الكهف|110|مكية
مريم|98|مكية
طه|135|مكية
الأنبياء|112|مكية
الحج|78|مدنية
المؤمنون|118|مكية
النور|64|مدنية
الفرقان|77|مكية
الشعراء|227|مكية
النمل|93|مكية
القصص|88|مكية
العنكبوت|69|مكية
الروم|60|مكية
لقمان|34|مكية
السجدة|30|مكية
الأحزاب|73|مدنية
سبأ|54|مكية
فاطر|45|مكية
يس|83|مكية
الصافات|182|مكية
ص|88|مكية
الزمر|75|مكية
غافر|85|مكية
فصلت|54|مكية
الشورى|53|مكية
الزخرف|89|مكية
الدخان|59|مكية
الجاثية|37|مكية
الأحقاف|35|مكية
محمد|38|مدنية
الفتح|29|مدنية
الحجرات|18|مدنية
ق|45|مكية
الذاريات|60|مكية
الطور|49|مكية
النجم|62|مكية
القمر|55|مكية
الرحمن|78|مدنية
الواقعة|96|مكية
الحديد|29|مدنية
المجادلة|22|مدنية
الحشر|24|مدنية
الممتحنة|13|مدنية
الصف|14|مدنية
الجمعة|11|مدنية
الالمنافقون|11|مدنية
التغابن|18|مدنية
الطلاق|12|مدنية
التحريم|12|مدنية
الملك|30|مكية
القلم|52|مكية
الحاقة|52|مكية
المعارج|44|مكية
نوح|28|مكية
الجن|28|مكية
المزمل|20|مكية
المدثر|56|مكية
القيامة|40|مكية
الإنسان|31|مدنية
المرسلات|50|مكية
النبأ|40|مكية
النازعات|46|مكية
عبس|42|مكية
التكوير|29|مكية
الانفطار|19|مكية
المطففين|36|مكية
الانشقاق|25|مكية
البروج|22|مكية
الطارق|17|مكية
الأعلى|19|مكية
الغاشية|26|مكية
الفجر|30|مكية
البلد|20|مكية
الشمس|15|مكية
الليل|21|مكية
الضحى|11|مكية
الشرح|8|مكية
التين|8|مكية
العلق|19|مكية
القدر|5|مكية
البينة|8|مدنية
الزلزلة|8|مدنية
العاديات|11|مكية
القارعة|11|مكية
التكاثر|8|مكية
العصر|3|مكية
الهمزة|9|مكية
الفيل|5|مكية
قريش|4|مكية
الماعون|7|مكية
الكوثر|3|مكية
الكافرون|6|مكية
النصر|3|مدنية
المسد|5|مكية
الإخلاص|4|مكية
الفلق|5|مكية
الناس|6|مكية`.split('\n').map((line, index) => { const [name,count,type] = line.split('|'); return { number:index+1,name,count:Number(count),type }; });
      surahData[62].name = 'المنافقون';
      const bismillah = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
      const builtinAyat = {
        1:[bismillah,'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ','ٱلرَّحْمَٰنِ ٱلرَّحِيمِ','مَٰلِكِ يَوْمِ ٱلدِّينِ','إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ','ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ','صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ'],
        112:['قُلْ هُوَ ٱللَّهُ أَحَدٌ','ٱللَّهُ ٱلصَّمَدُ','لَمْ يَلِدْ وَلَمْ يُولَدْ','وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ'],
        113:['قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ','مِن شَرِّ مَا خَلَقَ','وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ','وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ','وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ'],
        114:['قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ','مَلِكِ ٱلنَّاسِ','إِلَٰهِ ٱلنَّاسِ','مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ','ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ','مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ'],
        '2:255':'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍ مِّنْ عِلْمِهِۦ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ'
      };
      const zikr = (id,category,text,repeat,source) => ({id,category,text,repeat,source});
      const adhkar = [
        zikr('m-kursi','morning',builtinAyat['2:255'],1,'آية الكرسي · البقرة 255. ورد في فضلها عند النوم صحيح البخاري 2311.'),
        zikr('m-ikhlas','morning',builtinAyat[112].join(' '),3,'سورة الإخلاص. قراءة الإخلاص والمعوذتين ثلاثا صباحا ومساءا: أبو داود 5082 والترمذي 3575.'),
        zikr('m-falaq','morning',builtinAyat[113].join(' '),3,'سورة الفلق · أبو داود 5082 والترمذي 3575.'),
        zikr('m-nas','morning',builtinAyat[114].join(' '),3,'سورة الناس · أبو داود 5082 والترمذي 3575.'),
        zikr('m-sayyid','morning','اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',1,'سيد الاستغفار · صحيح البخاري 6306.'),
        zikr('m-became','morning','أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',1,'صحيح مسلم 2723.'),
        zikr('m-radi','morning','رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.',3,'أبو داود 5072 والترمذي 3389.'),
        zikr('m-protect','morning','بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',3,'أبو داود 5088 والترمذي 3388.'),
        zikr('m-afiya','morning','اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنْتَ.',3,'أبو داود 5090.'),
        zikr('m-hayy','morning','يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ.',1,'ورد في أذكار الصباح · النسائي في عمل اليوم والليلة 575.'),
        zikr('m-kalimat','morning','أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',3,'صحيح مسلم 2708.'),
        zikr('m-ilm','morning','اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا.',1,'ابن ماجه 925، يقال بعد السلام من صلاة الفجر.'),
        zikr('e-kursi','evening',builtinAyat['2:255'],1,'آية الكرسي · البقرة 255.'),
        zikr('e-ikhlas','evening',builtinAyat[112].join(' '),3,'سورة الإخلاص · أبو داود 5082 والترمذي 3575.'),
        zikr('e-falaq','evening',builtinAyat[113].join(' '),3,'سورة الفلق · أبو داود 5082 والترمذي 3575.'),
        zikr('e-nas','evening',builtinAyat[114].join(' '),3,'سورة الناس · أبو داود 5082 والترمذي 3575.'),
        zikr('e-sayyid','evening','اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ.',1,'سيد الاستغفار · صحيح البخاري 6306.'),
        zikr('e-became','evening','أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ.',1,'صحيح مسلم 2723.'),
        zikr('e-radi','evening','رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا.',3,'أبو داود 5072 والترمذي 3389.'),
        zikr('e-protect','evening','بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ.',3,'أبو داود 5088 والترمذي 3388.'),
        zikr('e-kalimat','evening','أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ.',3,'صحيح مسلم 2708.'),
        zikr('p-istighfar','prayer','أَسْتَغْفِرُ اللَّهَ.',3,'يقال بعد السلام من الصلاة · صحيح مسلم 591.'),
        zikr('p-salam','prayer','اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ.',1,'صحيح مسلم 591.'),
        zikr('p-tahlil','prayer','لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ.',1,'صحيح البخاري 844 وصحيح مسلم 593.'),
        zikr('p-subhan','prayer','سُبْحَانَ اللَّهِ.',33,'صحيح مسلم 597.'),
        zikr('p-hamd','prayer','الْحَمْدُ لِلَّهِ.',33,'صحيح مسلم 597.'),
        zikr('p-akbar','prayer','اللَّهُ أَكْبَرُ.',33,'صحيح مسلم 597.'),
        zikr('p-complete','prayer','لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ.',1,'تمام المائة بعد التسبيح والتحميد والتكبير · صحيح مسلم 597.'),
        zikr('s-quls','sleep',builtinAyat[112].concat(builtinAyat[113],builtinAyat[114]).join(' '),3,'الإخلاص والمعوذتان. اجمع كفيك وانفث فيهما واقرأ، ثم امسح ما استطعت من جسدك، ثلاث مرات · صحيح البخاري 5017.'),
        zikr('s-name','sleep','بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا.',1,'صحيح البخاري 6324.'),
        zikr('s-side','sleep','بِاسْمِكَ رَبِّي وَضَعْتُ جَنْبِي وَبِكَ أَرْفَعُهُ، فَإِنْ أَمْسَكْتَ نَفْسِي فَارْحَمْهَا، وَإِنْ أَرْسَلْتَهَا فَاحْفَظْهَا بِمَا تَحْفَظُ بِهِ عِبَادَكَ الصَّالِحِينَ.',1,'صحيح البخاري 6320 ومسلم 2714.'),
        zikr('s-protect','sleep','اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ.',3,'أبو داود 5045 والترمذي 3398.'),
        zikr('d-dunya','daily','رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ.',1,'القرآن الكريم · البقرة 201.'),
        zikr('d-heart','daily','يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ.',1,'جامع الترمذي 2140.'),
        zikr('d-help','daily','اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ.',1,'أبو داود 1522 والنسائي 1303.'),
        zikr('d-hawl','daily','لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ.',1,'صحيح البخاري 6184.'),
        zikr('d-sharh','daily','رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي.',1,'القرآن الكريم · طه 25–28.')
      ];
      const cities = [
        {id:'cairo',name:'القاهرة',lat:30.0444,lng:31.2357,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'alex',name:'الإسكندرية',lat:31.2001,lng:29.9187,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'giza',name:'الجيزة',lat:30.0131,lng:31.2089,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'mansoura',name:'المنصورة',lat:31.0409,lng:31.3785,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'tanta',name:'طنطا',lat:30.7865,lng:31.0004,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'aswan',name:'أسوان',lat:24.0889,lng:32.8998,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'luxor',name:'الأقصر',lat:25.6872,lng:32.6396,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'portsaid',name:'بورسعيد',lat:31.2653,lng:32.3019,tz:'Africa/Cairo',method:'Egyptian'},
        {id:'mecca',name:'مكة المكرمة',lat:21.4225,lng:39.8262,tz:'Asia/Riyadh',method:'UmmAlQura'},
        {id:'medina',name:'المدينة المنورة',lat:24.4672,lng:39.6111,tz:'Asia/Riyadh',method:'UmmAlQura'},
        {id:'riyadh',name:'الرياض',lat:24.7136,lng:46.6753,tz:'Asia/Riyadh',method:'UmmAlQura'},
        {id:'jerusalem',name:'القدس',lat:31.7683,lng:35.2137,tz:'Asia/Hebron',method:'MuslimWorldLeague'},
        {id:'dubai',name:'دبي',lat:25.2048,lng:55.2708,tz:'Asia/Dubai',method:'Dubai'},
        {id:'amman',name:'عمّان',lat:31.9539,lng:35.9106,tz:'Asia/Amman',method:'MuslimWorldLeague'},
        {id:'casablanca',name:'الدار البيضاء',lat:33.5731,lng:-7.5898,tz:'Africa/Casablanca',method:'MuslimWorldLeague'},
        {id:'london',name:'لندن',lat:51.5074,lng:-0.1278,tz:'Europe/London',method:'MuslimWorldLeague'},
        {id:'custom',name:'موقعي الحالي',lat:30.0444,lng:31.2357,tz:Intl.DateTimeFormat().resolvedOptions().timeZone,method:'MuslimWorldLeague'}
      ];
      const prayerNames = {fajr:'الفجر',sunrise:'الشروق',dhuhr:'الظهر',asr:'العصر',maghrib:'المغرب',isha:'العشاء'};
      const prayerKeys = ['fajr','dhuhr','asr','maghrib','isha'];
      const azkarNames = {morning:'أذكار الصباح',evening:'أذكار المساء',prayer:'أذكار بعد الصلاة',sleep:'أذكار النوم',daily:'أدعية يومية'};
      let quranCorpus = null;
      let quranLoading = false;
      let quranRequest = 0;
      let quranDBPromise;
      let selectedAyah = null;
      let azkarCategory = 'morning';
      let faithTab = 'overview';
      let chartInstance = null;
      let chartMode = 'focus';
      let deferredInstall = null;
      let swRegistration = null;
      let offlineReady = false;
      let compassActive = false;
      let compassHeading = null;
      let prayerOffset = 0;
      let monthlyRows = [];
      let audioObject = null;
      let audioBusy = false;
      let ambientSource = null;
      let ambientGain = null;
      let ambientKind = 'off';
      let commandItems = [];
      let commandIndex = 0;
      let lastPrayerTick = 0;
      const tafsirRequests = new Map();
      const arabicNormalize = text => String(text).normalize('NFD').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').toLowerCase();
      function defaultState(withExamples = true) {
        const now = Date.now();
        const examples = [
          { title: 'حدّد أهم ٣ حاجات للأسبوع', category: 'personal', priority: 'high', done: false },
          { title: 'نصف ساعة للمشروع اللي بتحبه', category: 'work', priority: 'normal', done: false },
          { title: 'اقرأ ١٠ صفحات من كتابك', category: 'learn', priority: 'normal', done: false },
          { title: 'اعمل مساحة صغيرة لنفسك', category: 'personal', priority: 'normal', done: true }
        ];
        return {
          version: 1,
          tasks: withExamples ? examples.map((task, index) => ({ ...task, id: uid(), due: dayKey(), createdAt: now - index * 1000, completedAt: task.done ? now : null, description: '', repeat: 'none', subtasks: [] })) : [],
          note: '',
          settings: { name: '', focusMinutes: 25, breakMinutes: 5, longBreakMinutes: 15, autoNext: false, taskNotifications: false, sound: true, theme: 'light' },
          timer: { mode: 'focus', duration: 1500, remaining: 1500, running: false, endAt: null, taskId: '', sessionId: uid() },
          sessions: [], recentCommands: [], notifySent: [], ambientVolume: 25,
          faith: {
            location: { ...cities[0], id: 'cairo' }, method: 'Egyptian', madhab: 'Shafi', adjustment: 0, notifications: false, prayers: {},
            azkarDay: dayKey(), azkarCounts: {}, azkarFavorites: [], tasbih: { phrase: 'سبحان الله', target: 33, count: 0, total: 0, day: dayKey() },
            quran: { surah: 1, ayah: 1, page: 1, fontSize: 29, layout: 'mushaf', reciter: 'ar.alafasy', bookmarks: [] },
            readLog: {}, readPages: [], khatma: { days: 60, started: dayKey(), page: 0 }, wirdGoal: 10
          }
        };
      }
      function normalizeState(raw) {
        if (!raw || raw.version !== 1 || !Array.isArray(raw.tasks) || typeof raw.note !== 'string') throw new Error('Invalid workspace');
        const result = defaultState(false);
        const seenIds = new Set();
        result.tasks = raw.tasks.filter(task => task && typeof task.title === 'string' && task.title.trim()).slice(0, 500).map(task => {
          let id = typeof task.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(task.id) ? task.id : uid();
          if (seenIds.has(id)) id = uid();
          seenIds.add(id);
          return { id, title: task.title.trim().slice(0, 160), category: Object.hasOwn(categories, task.category) ? task.category : 'personal', priority: task.priority === 'high' ? 'high' : 'normal', done: task.done === true, due: validDate(task.due) ? task.due : '', createdAt: Number.isFinite(task.createdAt) ? task.createdAt : Date.now(), completedAt: Number.isFinite(task.completedAt) ? task.completedAt : null, description: typeof task.description === 'string' ? task.description.slice(0,1500) : '', repeat: ['daily','weekly'].includes(task.repeat) ? task.repeat : 'none', subtasks: Array.isArray(task.subtasks) ? task.subtasks.filter(step => step && typeof step.text === 'string').slice(0,20).map(step => ({ id: typeof step.id === 'string' ? step.id.slice(0,80) : uid(), text: step.text.slice(0,160), done: step.done === true })) : [] };
        });
        result.note = raw.note.slice(0, 20000);
        const settings = raw.settings || {};
        result.settings = { name: typeof settings.name === 'string' ? settings.name.trim().slice(0, 30) : '', focusMinutes: clamp(settings.focusMinutes, 1, 120, 25), breakMinutes: clamp(settings.breakMinutes, 1, 60, 5), longBreakMinutes: clamp(settings.longBreakMinutes,5,90,15), autoNext: settings.autoNext === true, taskNotifications: settings.taskNotifications === true, sound: settings.sound !== false, theme: settings.theme === 'dark' ? 'dark' : 'light' };
        const timer = raw.timer || {};
        const mode = ['break','long'].includes(timer.mode) ? timer.mode : 'focus';
        const defaultDuration = (mode === 'focus' ? result.settings.focusMinutes : mode === 'long' ? result.settings.longBreakMinutes : result.settings.breakMinutes) * 60;
        const duration = clamp(timer.duration, 60, mode === 'focus' ? 7200 : 5400, defaultDuration);
        const endAt = Number.isFinite(timer.endAt) && timer.endAt > 0 ? timer.endAt : null;
        result.timer = { mode, duration, remaining: clamp(timer.remaining, 0, duration, duration), running: timer.running === true && endAt !== null && endAt <= Date.now() + duration * 1000 + 1000, endAt, taskId: result.tasks.some(task => task.id === timer.taskId && !task.done) ? timer.taskId : '', sessionId: typeof timer.sessionId === 'string' ? timer.sessionId.slice(0, 80) : uid() };
        result.sessions = Array.isArray(raw.sessions) ? raw.sessions.filter(session => session && validDate(session.date) && Number.isFinite(session.minutes) && session.minutes > 0 && session.minutes <= 120).slice(-1000).map(session => ({ id: typeof session.id === 'string' ? session.id.slice(0, 80) : uid(), date: session.date, minutes: session.minutes, title: typeof session.title === 'string' ? session.title.slice(0,160) : 'جلسة تركيز' })) : [];
        result.recentCommands = Array.isArray(raw.recentCommands) ? raw.recentCommands.filter(value => typeof value === 'string').slice(0,6).map(value => value.slice(0,100)) : [];
        result.notifySent = Array.isArray(raw.notifySent) ? raw.notifySent.filter(value => typeof value === 'string').slice(-200) : [];
        result.ambientVolume = clamp(raw.ambientVolume,0,100,25);
        const faith = raw.faith;
        if (faith && typeof faith === 'object') {
          const f = result.faith;
          const loc = faith.location;
          if (loc && Number.isFinite(loc.lat) && Math.abs(loc.lat) <= 90 && Number.isFinite(loc.lng) && Math.abs(loc.lng) <= 180) {
            let tz = typeof loc.tz === 'string' ? loc.tz : 'Africa/Cairo';
            try { new Intl.DateTimeFormat('en',{timeZone:tz}).format(); } catch { tz = 'Africa/Cairo'; }
            f.location = { id: typeof loc.id === 'string' ? loc.id.slice(0,40) : 'custom', name: typeof loc.name === 'string' ? loc.name.slice(0,60) : 'موقعي', lat: loc.lat, lng: loc.lng, tz };
          }
          f.method = ['Egyptian','UmmAlQura','MuslimWorldLeague','Karachi','Dubai','Kuwait','Qatar','Singapore','Turkey','NorthAmerica'].includes(faith.method) ? faith.method : 'Egyptian';
          f.madhab = faith.madhab === 'Hanafi' ? 'Hanafi' : 'Shafi';
          f.adjustment = clamp(faith.adjustment,-30,30,0);
          f.notifications = faith.notifications === true;
          if (faith.prayers && typeof faith.prayers === 'object') f.prayers = Object.fromEntries(Object.entries(faith.prayers).filter(([date,keys]) => validDate(date) && Array.isArray(keys)).slice(-730).map(([date,keys]) => [date,keys.filter(key => prayerKeys.includes(key))]));
          if (faith.azkarCounts && typeof faith.azkarCounts === 'object') f.azkarCounts = Object.fromEntries(Object.entries(faith.azkarCounts).filter(([id]) => adhkar.some(item => item.id === id)).map(([id,count]) => [id,clamp(count,0,1000,0)]));
          f.azkarDay = validDate(faith.azkarDay) ? faith.azkarDay : dayKey();
          f.azkarFavorites = Array.isArray(faith.azkarFavorites) ? faith.azkarFavorites.filter(id => adhkar.some(item => item.id === id)) : [];
          const tasbih = faith.tasbih || {};
          const phrase = $('#tasbih-phrase') ? [...$('#tasbih-phrase').options].map(option => option.value) : ['سبحان الله'];
          f.tasbih = { phrase: phrase.includes(tasbih.phrase) ? tasbih.phrase : 'سبحان الله', target: [33,100,1000].includes(tasbih.target) ? tasbih.target : 33, count: clamp(tasbih.count,0,999,0), total: clamp(tasbih.total,0,1000000,0), day: validDate(tasbih.day) ? tasbih.day : dayKey() };
          const quran = faith.quran || {};
          const surah = clamp(quran.surah,1,114,1);
          f.quran = { surah, ayah: clamp(quran.ayah,1,surahData[surah-1].count,1), page: clamp(quran.page,1,604,1), fontSize: clamp(quran.fontSize,22,44,29), layout: quran.layout === 'verses' ? 'verses' : 'mushaf', reciter: ['ar.alafasy','ar.husary','ar.minshawi'].includes(quran.reciter) ? quran.reciter : 'ar.alafasy', bookmarks: Array.isArray(quran.bookmarks) ? [...new Set(quran.bookmarks)].filter(ref => typeof ref === 'string' && /^\d{1,3}:\d{1,3}$/.test(ref) && surahData[Number(ref.split(':')[0])-1] && Number(ref.split(':')[1]) <= surahData[Number(ref.split(':')[0])-1].count && Number(ref.split(':')[1]) > 0).slice(0,300) : [] };
          if (faith.readLog && typeof faith.readLog === 'object') f.readLog = Object.fromEntries(Object.entries(faith.readLog).filter(([date]) => validDate(date)).slice(-730).map(([date,pages]) => [date,Array.isArray(pages) ? [...new Set(pages.filter(page => Number.isInteger(page) && page >= 1 && page <= 604))] : []]));
          f.readPages = Array.isArray(faith.readPages) ? [...new Set(faith.readPages.filter(page => Number.isInteger(page) && page >= 1 && page <= 604))] : [];
          f.wirdGoal = [2,5,10,20].includes(faith.wirdGoal) ? faith.wirdGoal : 10;
          f.khatma = { days: [30,60,90,180,365].includes(faith.khatma?.days) ? faith.khatma.days : 60, started: validDate(faith.khatma?.started) ? faith.khatma.started : dayKey(), page: clamp(faith.khatma?.page,0,604,0) };
        }
        return result;
      }

      function loadState() {
        try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
            try { return normalizeState(JSON.parse(saved)); }
            catch { loadNotice = 'تعذّر قراءة البيانات القديمة. تقدر تسترجع نسخة احتياطية من الإعدادات.'; }
          }
        } catch {
          storageAvailable = false;
          loadNotice = 'المتصفح مانع الحفظ المحلي. بياناتك هتفضل خلال الجلسة دي فقط؛ نزّل نسخة قبل ما تقفل.';
        }
        return defaultState();
      }

      let state = loadState();

      function setStorageStatus() {
        $$('[data-storage-label]').forEach(element => { element.textContent = storageAvailable ? 'محفوظ على جهازك' : 'لهذه الجلسة فقط'; });
        $$('[data-note-status]').forEach(element => { element.textContent = storageAvailable ? 'محفوظة تلقائيا' : 'الحفظ المحلي غير متاح'; });
      }

      function saveState() {
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          storageAvailable = true;
        } catch {
          storageAvailable = false;
          if (!storageWarningShown) {
            storageWarningShown = true;
            showToast('الحفظ المحلي غير متاح. نزّل نسخة من الإعدادات علشان ما تفقدش بياناتك.');
          }
        }
        setStorageStatus();
        return storageAvailable;
      }

      function showToast(message, actionLabel = '', callback = null) {
        clearTimeout(toastTimeout);
        const openDialogs = $$('dialog[open]');
        (openDialogs.at(-1) || document.body).append($('#toast'));
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
        $('#current-date').textContent = new Intl.DateTimeFormat('ar-EG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now);
        const greeting = now.getHours() < 12 ? 'صباح الخير' : now.getHours() < 18 ? 'نهارك جميل' : 'مساء الخير';
        $('#greeting-text').textContent = `${greeting}، ${state.settings.name ? 'يا ' + state.settings.name : 'يا صديق'}`;
      }

      function applyTheme() {
        const dark = state.settings.theme === 'dark';
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        $('#theme-button use').setAttribute('href', dark ? '#i-sun' : '#i-moon');
        $('#theme-button').title = dark ? 'الوضع الفاتح' : 'الوضع الداكن';
        $('#theme-button').setAttribute('aria-label', dark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن');
      }

      function navigate(view, updateHash = true) {
        if (!['today','tasks','focus','notes','faith','insights'].includes(view)) view = 'today';
        if (activeView === 'insights' && view !== 'insights' && chartInstance) { chartInstance.destroy(); chartInstance = null; }
        if (activeView === 'faith' && view !== 'faith' && compassActive) stopCompass();
        activeView = view;
        $$('.view').forEach(section => { section.hidden = section.id !== `view-${view}`; });
        $$('.nav-item[data-view], .mobile-nav [data-view]').forEach(button => {
          const active = button.dataset.view === view;
          button.classList.toggle('active', active);
          if (active) button.setAttribute('aria-current','page'); else button.removeAttribute('aria-current');
        });
        if (updateHash && location.hash !== `#${view}`) {
          try { history.pushState({view},'',`#${view}`); } catch { location.hash = view; }
        }
        if (view === 'insights') renderInsights();
        if (view === 'faith' && faithTab === 'prayer') renderPrayers();
        window.scrollTo({top:0,behavior:'instant'});
      }

      function todayTasks() {
        const today = dayKey();
        return state.tasks.filter(task => task.done
          ? task.completedAt !== null && dayKey(new Date(task.completedAt)) === today
          : !task.due || task.due <= today);
      }

      function dueLabel(task) {
        if (!task.due || task.done) return '';
        const today = dayKey();
        if (task.due < today) return 'من يوم فات';
        if (task.due === today) return '';
        return new Intl.DateTimeFormat('ar-EG', { day: 'numeric', month: 'short' }).format(new Date(`${task.due}T12:00:00`));
      }

      function createTaskRow(task) {
        const row=document.createElement('div');row.className=`task-row${task.done?' is-done':''}`;
        if(task.subtasks.length)row.style.alignItems='flex-start';
        row.innerHTML=`<label class="task-check-label"><input type="checkbox" class="task-check"><span class="check-box">${icon('check')}</span><span class="task-copy"><span class="task-title"></span><span class="task-meta"><span class="task-category"><i class="category-dot"></i><span></span></span><span class="task-priority">${icon('flag')}مهمة للأول</span><span class="task-due"></span><span class="task-repeat"></span><span class="subtask-progress"></span></span></span></label><button class="task-more">${icon('more')}</button>`;
        const checkbox=$('.task-check',row);checkbox.checked=task.done;checkbox.dataset.taskCheck=task.id;
        checkbox.setAttribute('aria-label',`${task.done?'إعادة فتح':'إكمال'} مهمة: ${task.title}`);
        $('.task-title',row).textContent=task.title;$('.task-category',row).classList.add(`cat-${task.category}`);$('.task-category>span',row).textContent=categories[task.category];
        $('.task-priority',row).hidden=task.priority!=='high'||task.done;$('.task-repeat',row).textContent=task.repeat==='daily'?'كل يوم':task.repeat==='weekly'?'كل أسبوع':'';
        $('.subtask-progress',row).textContent=task.subtasks.length?`${task.subtasks.filter(step=>step.done).length} / ${task.subtasks.length} خطوات`:'';
        const due=$('.task-due',row);due.textContent=dueLabel(task);due.hidden=!due.textContent;due.classList.toggle('overdue',!!task.due&&task.due<dayKey()&&!task.done);
        if(task.description){const description=document.createElement('p');description.textContent=task.description;description.style.cssText='font-size:10px;color:var(--muted);white-space:pre-wrap;overflow-wrap:anywhere;margin-top:5px';$('.task-copy',row).append(description);}
        if(task.subtasks.length){const steps=document.createElement('div');steps.style.cssText='display:flex;flex-direction:column;gap:5px;margin-top:9px';task.subtasks.forEach(step=>{const label=document.createElement('label');label.style.cssText='display:flex;align-items:flex-start;gap:7px;font-size:10px;cursor:pointer';const input=document.createElement('input');input.type='checkbox';input.checked=step.done;input.disabled=task.done;input.dataset.subtaskId=step.id;input.dataset.taskId=task.id;input.style.cssText='accent-color:var(--accent);margin-top:4px';const text=document.createElement('span');text.textContent=step.text;if(step.done)text.style.textDecoration='line-through';label.append(input,text);steps.append(label);});$('.task-copy',row).append(steps);}
        const more=$('.task-more',row);more.dataset.editTask=task.id;more.title='تعديل أو حذف المهمة';more.setAttribute('aria-label',`تعديل أو حذف: ${task.title}`);return row;
      }

      function renderEmpty(list, view, searching = false) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `${icon('leaf')}<h3></h3><p></p><button class="button button-secondary"></button>`;
        const filter = filters[view];
        $('h3', empty).textContent = searching ? 'مفيش مهمة بالوصف ده.' : filter === 'done' ? 'الإنجاز الجاي مستنيك.' : filter === 'active' ? 'مفيش حاجة معلّقة. خُد نفس.' : 'مساحة جديدة لخطوة صغيرة.';
        $('p', empty).textContent = searching ? 'جرّب كلمة تانية أو غيّر التصنيف.' : filter === 'done' ? 'علّم على مهمة خلصتها، وهتلاقيها هنا.' : filter === 'active' ? 'تقدر تضيف خطوة جديدة، أو تستمتع بشوية هدوء.' : 'اختار حاجة بسيطة تحب تعملها النهارده.';
        const button = $('button', empty);
        button.textContent = searching ? 'امسح الفلاتر' : filter === 'done' ? 'شوف كل المهام' : 'أضف أول خطوة';
        if (searching) button.dataset.action = 'clear-filters';
        else if (filter === 'done') { button.dataset.filter = 'all'; button.dataset.filterView = view; }
        else button.dataset.action = 'new-task';
        list.append(empty);
      }

      function renderTasks() {
        const focusedTaskId = document.activeElement?.dataset.taskCheck;
        const query = $('#task-search').value.trim().toLocaleLowerCase('ar');
        const category = $('#category-filter').value;
        const sort = $('#task-sort').value;
        for (const view of ['today', 'tasks']) {
          const base = view === 'today' ? todayTasks() : state.tasks;
          const searched = base.filter(task => view === 'today' || ((!query || task.title.toLocaleLowerCase('ar').includes(query)) && (category === 'all' || task.category === category)));
          const counts = { all: searched.length, active: searched.filter(task => !task.done).length, done: searched.filter(task => task.done).length };
          $$(`[data-count-view="${view}"]`).forEach(element => { element.textContent = counts[element.dataset.count]; });
          $$(`.filter-tab[data-filter-view="${view}"]`).forEach(button => {
            const active = button.dataset.filter === filters[view];
            button.classList.toggle('active', active);
            button.setAttribute('aria-pressed', String(active));
          });
          const tasks = searched.filter(task => filters[view] === 'all' || (filters[view] === 'done' ? task.done : !task.done));
          tasks.sort((a, b) => {
            if (a.done !== b.done) return Number(a.done) - Number(b.done);
            if (view === 'tasks' && sort === 'priority' && a.priority !== b.priority) return a.priority === 'high' ? -1 : 1;
            if (view === 'tasks' && sort === 'date' && a.due !== b.due) return (a.due || '9999').localeCompare(b.due || '9999');
            return b.createdAt - a.createdAt;
          });
          const list = view === 'today' ? $('#dashboard-task-list') : $('#all-task-list');
          list.replaceChildren();
          const fragment = document.createDocumentFragment();
          tasks.forEach(task => fragment.append(createTaskRow(task)));
          list.append(fragment);
          if (!tasks.length) renderEmpty(list, view, view === 'tasks' && !!(query || category !== 'all'));
          if (view === 'tasks') $('#tasks-summary').textContent = `${tasks.length} مهمة ظاهرة من ${state.tasks.length} مهمة في مساحتك. المهام اللي موعدها فات بتفضل معاك لحد ما تخلصها.`;
        }
        const today = todayTasks();
        const completed = today.filter(task => task.done).length;
        const percent = today.length ? Math.round(completed / today.length * 100) : 0;
        $('#progress-percent').textContent = `${percent}%`;
        $('#progress-fill').style.width = `${percent}%`;
        $('#daily-progress').setAttribute('aria-valuenow', String(percent));
        $('#progress-message').textContent = !today.length ? 'يوم جديد. ابدأ بحاجة بسيطة.' : completed === today.length ? 'كل خطواتك خلصت. تستاهل شوية راحة!' : completed ? `خلصت ${completed} من ${today.length}. كل خطوة صغيرة بتفرق.` : 'أول خطوة هي أهم خطوة.';
        renderFocusTaskOptions();
        if (focusedTaskId) {
          const scope = activeView === 'tasks' ? $('#all-task-list') : $('#dashboard-task-list');
          const target = $$('[data-task-check]', scope).find(input => input.dataset.taskCheck === focusedTaskId);
          const fallback = $(`.filter-tab.active[data-filter-view="${activeView === 'tasks' ? 'tasks' : 'today'}"]`);
          (target || fallback)?.focus({ preventScroll: true });
        }
      }

      function renderFocusTaskOptions() {
        const select = $('#focus-task');
        select.replaceChildren(new Option('جلسة من غير مهمة محددة', ''));
        state.tasks.filter(task => !task.done).forEach(task => select.add(new Option(task.title, task.id)));
        if (!state.tasks.some(task => task.id === state.timer.taskId && !task.done)) state.timer.taskId = '';
        select.value = state.timer.taskId;
      }

      function openTask(id = '') {
        const task = state.tasks.find(item => item.id === id);
        $('#task-form').reset(); $('#task-title-input').setCustomValidity('');
        $('#task-id').value = task?.id || ''; $('#task-title-input').value = task?.title || '';
        $('#task-category-input').value = task?.category || 'personal'; $('#task-priority-input').value = task?.priority || 'normal';
        $('#task-date-input').value = task ? task.due : dayKey();
        $('#task-repeat').value = task?.repeat || 'none'; $('#task-description').value = task?.description || '';
        $('#task-subtasks').value = task?.subtasks.map(step => step.text).join('\n') || '';
        $('#task-dialog-title').textContent = task ? 'خطوتك، بطريقتك.' : 'خطوة جديدة.';
        $('#task-submit-button').textContent = task ? 'احفظ التعديل' : 'أضف الخطوة'; $('#delete-task-button').hidden = !task;
        $('#task-dialog').showModal(); requestAnimationFrame(() => $('#task-title-input').focus());
      }
      function addTask(title, category = 'personal', priority = 'normal', due = dayKey(), extra = {}) {
        if (state.tasks.length >= 500) { showToast('وصلت لحد ٥٠٠ مهمة. احذف بعض المهام القديمة علشان تضيف جديد.'); return false; }
        state.tasks.unshift({ id:uid(),title:title.trim().slice(0,160),category,priority,due,done:false,createdAt:Date.now(),completedAt:null,description:'',repeat:'none',subtasks:[],...extra });
        filters.today='all'; filters.tasks='all';
        if (activeView === 'tasks') { $('#task-search').value=''; $('#category-filter').value='all'; }
        saveState(); renderTasks(); return true;
      }
      function toggleTask(id,done) {
        const task=state.tasks.find(item=>item.id===id); if(!task)return;
        task.done=done; task.completedAt=done?Date.now():null;
        let nextTask=null;
        if(done&&task.repeat!=='none'&&task.due&&state.tasks.length<500){
          const nextDate=new Date(`${task.due}T12:00:00`);nextDate.setDate(nextDate.getDate()+(task.repeat==='weekly'?7:1));
          nextTask={...task,id:uid(),due:dayKey(nextDate),done:false,createdAt:Date.now(),completedAt:null,subtasks:task.subtasks.map(step=>({...step,id:uid(),done:false}))};state.tasks.unshift(nextTask);
        }
        if(done&&state.timer.taskId===id)state.timer.taskId='';
        saveState();renderTasks();
        if(done&&nextTask)showToast('خطوة اتخلّصت، والنسخة الجاية جاهزة في موعدها.','تراجع',()=>{state.tasks=state.tasks.filter(item=>item.id!==nextTask.id);task.done=false;task.completedAt=null;saveState();renderTasks();});
        else if(done&&todayTasks().length&&todayTasks().every(item=>item.done))showToast('كل خطوات النهارده خلصت. إنجاز يستاهل تفرح بيه!');
      }

      function deleteTask() {
        const id = $('#task-id').value;
        const index = state.tasks.findIndex(task => task.id === id);
        if (index < 0) return;
        const [task] = state.tasks.splice(index, 1);
        if (state.timer.taskId === id) state.timer.taskId = '';
        $('#task-dialog').close();
        saveState();
        renderTasks();
        showToast('المهمة اتمسحت. مفيش مشكلة تغيّر خطتك.', 'تراجع', () => {
          if (!state.tasks.some(item => item.id === task.id)) state.tasks.splice(index, 0, task);
          saveState(); renderTasks(); showToast('المهمة رجعت لمكانها.');
        });
      }

      function renderNotes(syncEditors = true) {
        if (syncEditors) { $('#quick-note').value = state.note; $('#notes-editor').value = state.note; }
        const words = state.note.trim() ? state.note.trim().split(/\s+/u).length : 0;
        $('#note-word-count').textContent = `${words} كلمة · ${state.note.length.toLocaleString('ar-EG')} حرف من ٢٠٬٠٠٠`;
      }

      function onNoteInput(event) {
        state.note = event.target.value.slice(0, 20000);
        const other = event.target.id === 'quick-note' ? $('#notes-editor') : $('#quick-note');
        other.value = state.note;
        renderNotes(false);
        $$('[data-note-status]').forEach(element => { element.textContent = 'جارٍ الحفظ...'; });
        clearTimeout(noteSaveTimeout);
        noteSaveTimeout = setTimeout(saveState, 350);
      }

      function timerDuration(mode=state.timer.mode){return(mode==='focus'?state.settings.focusMinutes:mode==='long'?state.settings.longBreakMinutes:state.settings.breakMinutes)*60;}
      function renderTimer(force=false){
        const timer=state.timer;if(!force&&timer.remaining===lastRenderedSecond)return;lastRenderedSecond=timer.remaining;
        const text=`${String(Math.floor(timer.remaining/60)).padStart(2,'0')}:${String(timer.remaining%60).padStart(2,'0')}`;
        $$('[data-timer-display]').forEach(element=>{element.textContent=text;});
        $$('[data-timer-mode]').forEach(button=>{const active=button.dataset.timerMode===timer.mode||(button.dataset.timerMode==='break'&&timer.mode==='long');button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
        const label=timer.running?'وقفة صغيرة':timer.remaining===0?'جلسة جديدة':timer.remaining<timer.duration?'كمّل على مهلك':timer.mode==='focus'?'ابدأ التركيز':timer.mode==='long'?'استراحة طويلة':'ابدأ الاستراحة';
        $$('[data-timer-button-label]').forEach(element=>{element.textContent=label;});
        $$('[data-action="timer-toggle"] use').forEach(element=>element.setAttribute('href',timer.running?'#i-pause':'#i-play'));
        $$('[data-timer-caption]').forEach(element=>{element.textContent=timer.remaining===0?'أحسنت. كل خطوة بتفرق.':timer.running?(timer.mode==='focus'?'أنت هنا. والباقي يستنى.':'خُد نفس، وجدّد طاقتك.'):timer.remaining<timer.duration?'وقفة صغيرة، ونكمّل.':timer.mode==='focus'?'دقيقة ليك وللي يهمك':timer.mode==='long'?'٤ جلسات من التركيز. تستاهل راحة أطول.':'شوية هدوء، وبداية جديدة';element.classList.toggle('is-running',timer.running);});
        $('#nav-timer-dot').hidden=!timer.running;document.title=timer.running?`${text} | يومك`:'يومك | مساحة صغيرة ليوم أخف';
      }
      function unlockAudio(){try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;if(!audioContext)audioContext=new Audio();if(audioContext.state==='suspended')audioContext.resume().catch(()=>{});}catch{}}
      function playChime(){
        if(!state.settings.sound||!audioContext||audioContext.state!=='running')return;
        [587.33,783.99].forEach((frequency,index)=>{const oscillator=audioContext.createOscillator();const gain=audioContext.createGain();const start=audioContext.currentTime+index*.25;oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.12,start+.025);gain.gain.exponentialRampToValueAtTime(.001,start+.8);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(start);oscillator.stop(start+.85);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};});
      }
      function renderSessions(){const sessions=state.sessions.filter(session=>session.date===dayKey());const minutes=sessions.reduce((sum,session)=>sum+session.minutes,0);$('#session-summary').textContent=sessions.length?`${sessions.length} جلسة تركيز النهارده، و${minutes} دقيقة للحاجات اللي تهمك. أحسنت.`:'كل بداية بتفرق. جاهز لأول جلسة؟';}
      function finishTimer(){
        if(!state.timer.running)return;const timer=state.timer;const wasFocus=timer.mode==='focus';const completionDate=dayKey(new Date(timer.endAt||Date.now()));
        timer.running=false;timer.remaining=0;timer.endAt=null;
        if(wasFocus&&!state.sessions.some(session=>session.id===timer.sessionId)){const task=state.tasks.find(task=>task.id===timer.taskId);state.sessions.push({id:timer.sessionId,date:completionDate,minutes:timer.duration/60,title:task?.title||'جلسة تركيز'});state.sessions=state.sessions.slice(-1000);}
        if(state.settings.autoNext){timer.mode=wasFocus?(state.sessions.filter(session=>session.date===completionDate).length%4===0?'long':'break'):'focus';timer.duration=timerDuration();timer.remaining=timer.duration;timer.running=true;timer.endAt=Date.now()+timer.duration*1000;timer.sessionId=uid();}
        saveState();renderTimer(true);renderSessions();playChime();if(activeView==='insights')renderInsights();
        if(state.settings.autoNext)showToast(wasFocus?'التركيز خلص. الاستراحة التالية بدأت تلقائيا.':'الاستراحة خلصت. بدأت جلسة تركيز جديدة.');
        else showToast(wasFocus?'أحسنت! وقت التركيز خلص. تستاهل استراحة.':'الاستراحة خلصت. جاهز لخطوة جديدة؟',wasFocus?'استراحة':'جلسة جديدة',()=>switchTimerMode(wasFocus?'break':'focus'));
      }
      function tick(){if(state.timer.running){state.timer.remaining=Math.max(0,Math.ceil((state.timer.endAt-Date.now())/1000));if(state.timer.remaining===0)finishTimer();else renderTimer();}if(dayKey()!==lastDay){lastDay=dayKey();resetDailyFaith();renderDate();renderTasks();renderSessions();renderFaithOverview();renderPrayers();}}
      function toggleTimer(){unlockAudio();tick();const timer=state.timer;if(timer.running){timer.remaining=Math.max(0,Math.ceil((timer.endAt-Date.now())/1000));timer.running=false;timer.endAt=null;}else{if(timer.remaining===0){timer.duration=timerDuration();timer.remaining=timer.duration;timer.sessionId=uid();}timer.running=true;timer.endAt=Date.now()+timer.remaining*1000;}saveState();renderTimer(true);}
      async function resetTimer(){if((state.timer.running||(state.timer.remaining>0&&state.timer.remaining<state.timer.duration))&&!await askConfirm('نبدأ العد من جديد؟','الوقت اللي مرّ في الجلسة الحالية مش هيتحسب كجلسة مكتملة.','ابدأ من جديد'))return;state.timer.running=false;state.timer.endAt=null;state.timer.duration=timerDuration();state.timer.remaining=state.timer.duration;state.timer.sessionId=uid();saveState();renderTimer(true);}
      async function switchTimerMode(mode){if(mode===state.timer.mode)return;if((state.timer.running||(state.timer.remaining>0&&state.timer.remaining<state.timer.duration))&&!await askConfirm('نغيّر نوع الجلسة؟','الجلسة الحالية هتتوقف، ونبدأ المدة الجديدة من الأول.','غيّر الجلسة'))return;state.timer.mode=mode;state.timer.duration=timerDuration(mode);state.timer.remaining=state.timer.duration;state.timer.running=false;state.timer.endAt=null;state.timer.sessionId=uid();saveState();renderTimer(true);}
      function openSettings(){ $('#settings-name').value=state.settings.name;$('#settings-focus').value=state.settings.focusMinutes;$('#settings-break').value=state.settings.breakMinutes;$('#settings-long-break').value=state.settings.longBreakMinutes;$('#settings-auto').checked=state.settings.autoNext;$('#settings-sound').checked=state.settings.sound;refreshStorage();updateOfflineStatus();$('#settings-dialog').showModal();}

      function downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url; link.download = filename;
        document.body.append(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      }

      async function copyNotes(){if(!state.note.trim()){showToast('اكتب أول فكرة، وبعدها ننسخها.');return;}if(await copyText(state.note))showToast('أفكارك اتنسخت. خدها معاك.');else{$('#notes-editor').focus();$('#notes-editor').select();showToast('حدّدنا الملاحظات. استخدم أمر النسخ في جهازك.');}}

      async function clearNotes() {
        if (!state.note) { showToast('الصفحة لسه فاضية، ومستنية أفكارك.'); return; }
        if (!await askConfirm('صفحة جديدة؟', 'الملاحظات الحالية هتتمسح. تقدر تنزّلها الأول لو حابب تحتفظ بيها.', 'امسح الصفحة', true)) return;
        const oldNote = state.note;
        clearTimeout(noteSaveTimeout);
        state.note = ''; saveState(); renderNotes();
        showToast('صفحة جديدة، لأفكار جديدة.', 'تراجع', () => {
          const restored = state.note ? `${oldNote}\n\n${state.note}` : oldNote;
          if (restored.length > 20000) {
            downloadFile('\uFEFF' + oldNote, `yawmak-recovered-notes-${dayKey()}.txt`, 'text/plain;charset=utf-8');
            showToast('جهّزنا الملاحظات القديمة كملف، علشان ما نغيّرش كلامك الجديد.');
            return;
          }
          state.note = restored;
          saveState(); renderNotes(); showToast('ملاحظاتك رجعت.');
        });
      }

      async function resetData() {
        if (!await askConfirm('نبدأ من صفحة بيضا؟', 'ده هيمسح المهام والملاحظات والجلسات والإعدادات من المتصفح ده. نزّل نسخة احتياطية الأول لو محتاجها.', 'امسح بياناتي', true)) return;
        clearTimeout(noteSaveTimeout);
        state = defaultState(false);
        filters.today = 'all'; filters.tasks = 'all';
        $('#task-search').value = ''; $('#category-filter').value = 'all';
        saveState(); renderAll();
        $('#settings-dialog').close();
        navigate('today');
        showToast('مساحتك بقت فاضية. بداية جديدة على مهلك.');
      }

      async function importData(event) {
        const file = event.target.files[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > 2000000) { showToast('الملف أكبر من اللازم. اختار نسخة يومك بحجم أقل من ٢ ميجابايت.'); return; }
        let imported;
        try { imported = normalizeState(JSON.parse(await file.text())); }
        catch { showToast('الملف ده مش نسخة يومك صالحة. جرّب ملف JSON نزلته من التطبيق.'); return; }
        if (!await askConfirm('نرجّع النسخة دي؟', 'المهام والملاحظات والإعدادات الحالية هتتبدّل بمحتوى النسخة. الجلسة الحالية هتتوقف.', 'استرجع النسخة')) return;
        clearTimeout(noteSaveTimeout);
        state = imported;
        state.timer = { mode: 'focus', duration: state.settings.focusMinutes * 60, remaining: state.settings.focusMinutes * 60, running: false, endAt: null, taskId: '', sessionId: uid() };
        filters.today = 'all'; filters.tasks = 'all';
        $('#task-search').value = ''; $('#category-filter').value = 'all';
        saveState(); renderAll();
        $('#settings-dialog').close();
        showToast('مهامك وأفكارك رجعوا لمساحتك.');
      }

      const partialSurahs = new Map();
      function openQuranDB() {
        if (!quranDBPromise) quranDBPromise = new Promise((resolve,reject) => {
          if (!window.indexedDB) { reject(new Error('IndexedDB unavailable')); return; }
          const request = indexedDB.open('yawmak-quran',1);
          request.onupgradeneeded = () => request.result.createObjectStore('content');
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
          request.onblocked = () => reject(new Error('Database blocked'));
        });
        return quranDBPromise;
      }
      async function quranStore(key,value) {
        const db = await openQuranDB();
        return new Promise((resolve,reject) => {
          const transaction = db.transaction('content',value === undefined ? 'readonly' : 'readwrite');
          const store = transaction.objectStore('content');
          const request = value === undefined ? store.get(key) : store.put(value,key);
          let result;
          request.onsuccess = () => { result = request.result; };
          transaction.oncomplete = () => resolve(result);
          transaction.onerror = () => reject(transaction.error);
          transaction.onabort = () => reject(transaction.error || new Error('Storage aborted'));
        });
      }
      async function fetchJSON(url,timeout = 25000) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(),timeout);
        try {
          const response = await fetch(url,{signal:controller.signal});
          if (!response.ok) throw new Error('Network response failed');
          const data = await response.json();
          if (data.code !== 200 || !data.data) throw new Error('Invalid Quran data');
          return data.data;
        } finally { clearTimeout(timer); }
      }
      function compactSurahs(data) {
        if (!Array.isArray(data) || data.length !== 114 || data.reduce((sum,surah) => sum + (surah.ayahs?.length || 0),0) !== 6236) throw new Error('Incomplete Quran');
        return data.map((surah,index) => {
          if (surah.number !== index+1 || surah.ayahs.length !== surahData[index].count || surah.ayahs.some(ayah => typeof ayah.text !== 'string' || !ayah.text.trim())) throw new Error('Invalid surah');
          return { number:surah.number, verses:surah.ayahs.map(ayah => ({ text:ayah.text,page:clamp(ayah.page,1,604,1),number:ayah.number })) };
        });
      }
      function updateQuranPack() {
        const ready = !!quranCorpus?.surahs;
        const tafsirReady = !!quranCorpus?.tafsir;
        $('#quran-pack-card').classList.toggle('downloaded',ready && tafsirReady);
        $('#quran-pack-title').textContent = ready && tafsirReady ? 'المصحف والتفسير جاهزين بدون نت.' : ready ? 'المصحف جاهز. كمّل تنزيل التفسير.' : 'المصحف كامل، حتى بدون نت.';
        $('#quran-pack-status').textContent = ready && tafsirReady ? '١١ سورة · ٦٢٣٦ آية · التفسير الميسر محفوظ على جهازك.' : '١١ سورة · ٦٢٣٦ آية · تفسير الميسر. نزّله مرة واحدة.';
        $('#quran-download').textContent = ready && tafsirReady ? 'تحقق من المحتوى' : ready ? 'أكمل تنزيل التفسير' : 'نزّل المصحف والتفسير';
        $('#quran-download').disabled = quranLoading;
      }
      async function restoreQuran() {
        try {
          const saved = await quranStore('corpus-v1');
          if (saved?.surahs?.length === 114) { quranCorpus = saved; updateQuranPack(); if (faithTab === 'quran') renderQuran(); }
        } catch { $('#quran-pack-status').textContent = 'المتصفح لا يتيح حفظ المصحف. جرّب متصفحا عاديا ومساحة تخزين كافية.'; }
      }
      async function downloadQuran() {
        if (quranLoading) return;
        if (quranCorpus?.surahs && quranCorpus?.tafsir) { showToast('المصحف والتفسير محفوظان بالفعل على جهازك.'); return; }
        if (!navigator.onLine) { showToast('تنزيل المصحف الكامل يحتاج اتصالا بالنت أول مرة.'); return; }
        quranLoading = true; updateQuranPack();
        try {
          if (!quranCorpus?.surahs) {
            $('#quran-pack-status').textContent = '١ / ٢ · بننزّل القرآن الكريم كاملا. سيب الصفحة مفتوحة...';
            const data = await fetchJSON('https://api.alquran.cloud/v1/quran/quran-uthmani',90000);
            const surahs = compactSurahs(data);
            await quranStore('corpus-v1',{surahs,tafsir:null});
            quranCorpus = {surahs,tafsir:null};
          }
          $('#quran-pack-status').textContent = '٢ / ٢ · القرآن اتحفظ. بنجهّز التفسير الميسر...';
          const data = await fetchJSON('https://api.alquran.cloud/v1/quran/ar.muyassar',90000);
          const tafsirSurahs = compactSurahs(data);
          const tafsir = Object.fromEntries(tafsirSurahs.flatMap(surah => surah.verses.map((verse,index) => [`${surah.number}:${index+1}`,verse.text])));
          quranCorpus.tafsir = tafsir;
          await quranStore('corpus-v1',quranCorpus);
          renderQuran(); renderSurahList();
          showToast('المصحف والتفسير بقوا معاك، حتى بدون نت.');
        } catch { showToast('التنزيل ما اكتملش. راجع الاتصال ومساحة الجهاز، وجرّب تاني.'); }
        finally { quranLoading = false; updateQuranPack(); }
      }
      function getVerses(number) {
        if (quranCorpus?.surahs) return quranCorpus.surahs[number-1].verses;
        if (partialSurahs.has(number)) return partialSurahs.get(number);
        return builtinAyat[number]?.map((text,index) => ({text,page:number === 1 ? 1 : 604,number:index+1})) || null;
      }
      function verseText(surah,ayah) {
        const verse = getVerses(surah)?.[ayah-1];
        if (!verse) return surah === 2 && ayah === 255 ? builtinAyat['2:255'] : '';
        let text = verse.text;
        if (ayah === 1 && surah !== 1 && surah !== 9 && text.startsWith(bismillah)) text = text.slice(bismillah.length).trimStart();
        return text;
      }
      function renderSurahList() {
        const query = arabicNormalize($('#surah-search').value.trim());
        const selected = state.faith.quran.surah;
        const fragment = document.createDocumentFragment();
        surahData.filter(surah => !query || arabicNormalize(surah.name).includes(query) || String(surah.number) === query).forEach(surah => {
          const button = document.createElement('button');
          button.className = `surah-option${surah.number === selected ? ' active' : ''}`;
          button.dataset.surah = surah.number;
          button.setAttribute('aria-pressed',String(surah.number === selected));
          button.innerHTML = `<span class="surah-index"><span>${surah.number}</span></span><span><strong></strong><small>${surah.type} · ${surah.count} آية</small></span>${icon('book')}`;
          $('strong',button).textContent = surah.name;
          fragment.append(button);
        });
        $('#surah-list').replaceChildren(fragment);
        if (!$('#surah-list').children.length) $('#surah-list').textContent = 'مفيش سورة بالاسم ده.';
        if (document.activeElement !== $('#surah-jump')) $('#surah-jump').value = String(selected);
      }
      async function selectSurah(number,ayah = 1) {
        number = clamp(number,1,114,1);
        state.faith.quran.surah = number;
        state.faith.quran.ayah = clamp(ayah,1,surahData[number-1].count,1);
        const verse = getVerses(number)?.[state.faith.quran.ayah-1];
        if (verse?.page) state.faith.quran.page = verse.page;
        renderSurahList(); renderQuran(); saveState();
        const request = ++quranRequest;
        if (!getVerses(number)) {
          try {
            const cached = await quranStore(`surah-${number}`);
            if (cached?.length) partialSurahs.set(number,cached);
            else {
              if (!navigator.onLine) { renderQuran(); return; }
              const data = await fetchJSON(`https://api.alquran.cloud/v1/surah/${number}/quran-uthmani`);
              if (data.ayahs?.length !== surahData[number-1].count) throw new Error('Incomplete surah');
              const verses = data.ayahs.map(verse => ({text:verse.text,page:verse.page,number:verse.numberInSurah}));
              await quranStore(`surah-${number}`,verses);
              partialSurahs.set(number,verses);
            }
            if (request === quranRequest) { state.faith.quran.page = getVerses(number)[state.faith.quran.ayah-1]?.page || 1; renderQuran(); }
          } catch { if (request === quranRequest) renderQuran(true); }
        }
      }
      function renderQuran(error = false) {
        const q = state.faith.quran;
        const surah = surahData[q.surah-1];
        const verses = getVerses(q.surah);
        $('#reader-surah-name').textContent = `سورة ${surah.name}`;
        $('#reader-meta').textContent = `${surah.type} · ${surah.count} آية${verses?.[q.ayah-1]?.page ? ` · صفحة ${verses[q.ayah-1].page}` : ''}`;
        $('#quran-verses').style.setProperty('--quran-size',`${q.fontSize}px`);
        $('#quran-verses').classList.toggle('verse-mode',q.layout === 'verses');
        $('#previous-surah').disabled = q.surah === 1;
        $('#next-surah').disabled = q.surah === 114;
        $('#reciter-select').value = q.reciter;
        const container = $('#quran-verses');
        container.replaceChildren();
        if (!verses) {
          const empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.innerHTML = `${icon('book')}<h3>${error ? 'تعذّر تحميل السورة.' : quranCorpus ? 'نجهّز السورة...' : navigator.onLine ? 'نجهّز السورة...' : 'السورة دي لسه مش منزلة.'}</h3><p>نزّل المصحف مرة واحدة علشان تقرأ كل السور بدون نت.</p><button class="button button-primary" data-action="download-quran">نزّل المصحف الكامل</button>`;
          container.append(empty); return;
        }
        const fragment = document.createDocumentFragment();
        if (q.surah !== 1 && q.surah !== 9) { const header = document.createElement('p'); header.className = 'bismillah'; header.textContent = bismillah; fragment.append(header); }
        verses.forEach((verse,index) => {
          const span = document.createElement('span');
          span.className = `ayah${q.ayah === index+1 ? ' selected' : ''}`;
          span.dataset.verse = `${q.surah}:${index+1}`;
          span.append(document.createTextNode(verseText(q.surah,index+1)+' '));
          const button = document.createElement('button');
          button.className = 'ayah-number'; button.dataset.ayah = `${q.surah}:${index+1}`;
          button.textContent = (index+1).toLocaleString('ar-EG');
          button.setAttribute('aria-label',`تفسير وحفظ الآية ${index+1} من سورة ${surah.name}`);
          span.append(button); fragment.append(document.createTextNode(' '));
        });
        container.append(fragment);
      }
      function ayahReferenceText(ref) {
        const [surah,ayah] = ref.split(':').map(Number);
        return `${verseText(surah,ayah)}\n[سورة ${surahData[surah-1].name}: ${ayah}]`;
      }
      async function openAyah(ref) {
        const [surah,ayah] = ref.split(':').map(Number);
        if (!surahData[surah-1] || ayah < 1 || ayah > surahData[surah-1].count) return;
        selectedAyah = ref;
        state.faith.quran.surah = surah; state.faith.quran.ayah = ayah;
        state.faith.quran.page = getVerses(surah)?.[ayah-1]?.page || state.faith.quran.page;
        $('#ayah-dialog-title').textContent = `${surahData[surah-1].name} · الآية ${ayah}`;
        $('#ayah-dialog-text').textContent = verseText(surah,ayah);
        $('#bookmark-ayah-label').textContent = state.faith.quran.bookmarks.includes(ref) ? 'إزالة من المحفوظات' : 'احفظ الآية';
        $('#tafsir-text').textContent = 'نجهّز التفسير الميسر...';
        if (!$('#ayah-dialog').open) $('#ayah-dialog').showModal();
        try {
          let text = quranCorpus?.tafsir?.[ref];
          if (!text) text = await quranStore(`tafsir-${ref}`);
          if (!text) {
            if (!navigator.onLine) throw new Error('offline');
            if (!tafsirRequests.has(ref)) tafsirRequests.set(ref,fetchJSON(`https://api.alquran.cloud/v1/ayah/${ref}/ar.muyassar`).finally(() => tafsirRequests.delete(ref)));
            const data = await tafsirRequests.get(ref);
            text = data.text;
            quranStore(`tafsir-${ref}`,text).catch(() => {});
          }
          if (selectedAyah === ref) $('#tafsir-text').textContent = text;
        } catch { if (selectedAyah === ref) $('#tafsir-text').textContent = navigator.onLine ? 'التفسير مش متاح دلوقتي. جرّب تاني، أو نزّل المصحف مع التفسير للقراءة بدون نت.' : 'تفسير الآية ده مش منزّل. نزّل المصحف والتفسير مرة واحدة أثناء الاتصال بالنت.'; }
      }
      function renderBookmarks() {
        const container = $('#bookmark-list');
        container.replaceChildren();
        state.faith.quran.bookmarks.forEach(ref => {
          const [surah,ayah] = ref.split(':');
          const button = document.createElement('button'); button.className = 'bookmark-chip'; button.dataset.ayah = ref;
          button.textContent = `${surahData[Number(surah)-1].name} · ${ayah}`; container.append(button);
        });
        if (!container.children.length) container.textContent = 'لسه مفيش آيات محفوظة. اضغط رقم أي آية واحفظها هنا.';
      }
      function searchQuran() {
        const query = arabicNormalize($('#quran-search').value.trim());
        const container = $('#quran-search-results');
        container.hidden = !query;
        if (!query) return;
        const surahs = quranCorpus?.surahs || surahData.filter(surah => getVerses(surah.number)).map(surah => ({number:surah.number,verses:getVerses(surah.number)}));
        const results = [];
        let total = 0;
        for (const surah of surahs) for (let index = 0; index < surah.verses.length; index++) {
          if (arabicNormalize(verseText(surah.number,index+1)).includes(query)) { total++; if (results.length < 40) results.push({surah:surah.number,ayah:index+1}); }
        }
        container.replaceChildren();
        const title = document.createElement('h3');
        title.textContent = `${total} نتيجة${total > 40 ? ' · نعرض أول ٤٠ نتيجة' : ''}${quranCorpus ? '' : ' في السور المتاحة فقط · نزّل المصحف للبحث الكامل'}`;
        container.append(title);
        results.forEach(result => {
          const button = document.createElement('button'); button.className = 'quran-result'; button.dataset.searchSurah = result.surah; button.dataset.searchAyah = result.ayah;
          const label = document.createElement('strong'); label.textContent = `${surahData[result.surah-1].name} · الآية ${result.ayah}`;
          const text = document.createElement('p'); text.textContent = verseText(result.surah,result.ayah);
          button.append(label,text); container.append(button);
        });
      }
      async function playAudio(surah,ayah=null){
        const audio=$('#quran-audio');audio.pause();if(audio.dataset.blobUrl){URL.revokeObjectURL(audio.dataset.blobUrl);delete audio.dataset.blobUrl;}
        const reciter=state.faith.quran.reciter;
        const url=ayah?`https://cdn.islamic.network/quran/audio/128/${reciter}/${surahData.slice(0,surah-1).reduce((sum,item)=>sum+item.count,0)+ayah}.mp3`:`https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${surah}.mp3`;
        audioObject=url;audio.dataset.remote=url;$('#quran-audio-panel').hidden=false;
        $('#audio-title').textContent=`${ayah?`الآية ${ayah}`:'سورة'} ${surahData[surah-1].name} · ${$('#reciter-select').selectedOptions[0].textContent}`;
        $('#audio-status').textContent='نجهّز التلاوة...';$('#audio-download').disabled=true;
        try{
          const cache='caches'in window?await caches.open('yawmak-recitations-v1'):null;const cached=await cache?.match(url);let source=url;
          if(audioObject!==url)return;
          if(cached){source=URL.createObjectURL(await cached.blob());audio.dataset.blobUrl=source;}
          else if(!navigator.onLine){$('#audio-status').textContent='التلاوة دي مش منزلة. اتصل بالنت ونزّلها علشان تسمعها بدون نت.';audio.removeAttribute('src');$('#audio-download').disabled=false;return;}
          if(audioObject!==url){if(source!==url)URL.revokeObjectURL(source);return;}
          audio.src=source;$('#audio-download span').textContent=cached?'محفوظة · إعادة التنزيل':'نزّل التلاوة';
          $('#audio-status').textContent=cached?'التلاوة محفوظة على جهازك وتعمل بدون نت.':'التلاوة تحتاج اتصالا بالنت، إلا لو نزلتها على جهازك.';
          $('#audio-download').disabled=false;await audio.play();
        }catch{$('#audio-status').textContent='المتصفح مقدرش يشغّل التلاوة. جرّب الضغط على تشغيل، أو راجع الاتصال.';$('#audio-download').disabled=false;}
      }
      async function downloadAudio() {
        if (audioBusy || !audioObject) return;
        if (!navigator.onLine) { showToast('اتصل بالنت الأول علشان تنزّل التلاوة.'); return; }
        const url = audioObject.startsWith('blob:') ? $('#quran-audio').dataset.remote : audioObject;
        if (!url) return;
        audioBusy = true; $('#audio-download').disabled = true; $('#audio-status').textContent = 'بننزّل التلاوة كاملة. سيب الصفحة مفتوحة...';
        const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(),120000);
        try {
          if (!('caches' in window)) throw new Error('Cache unavailable');
          const response = await fetch(url,{signal:controller.signal});
          if (!response.ok) throw new Error('Audio download failed');
          const cache = await caches.open('yawmak-recitations-v1'); await cache.put(url,response);
          $('#audio-status').textContent = 'التلاوة اتحفظت، وتقدر تسمعها بدون نت.';
          $('#audio-download span').textContent = 'محفوظة · إعادة التنزيل';
          showToast('التلاوة بقت معاك بدون نت.');
        } catch { $('#audio-status').textContent = 'التنزيل ما اكتملش. راجع الاتصال أو مساحة التخزين وجرّب تاني.'; }
        finally { clearTimeout(timeout); audioBusy = false; $('#audio-download').disabled = false; }
      }
      function recordReading(page) {
        const today = dayKey();
        const log = state.faith.readLog;
        log[today] ||= [];
        const isNew = !log[today].includes(page);
        if (isNew) log[today].push(page);
        if (!state.faith.readPages.includes(page)) state.faith.readPages.push(page);
        if (page === state.faith.khatma.page+1) state.faith.khatma.page = page;
        else if (page > state.faith.khatma.page+1) showToast('سجلنا قراءتك. حدّث ترتيب الختمة يدويا من «خطتي للختم».');
        saveState(); renderFaithOverview();
        if (isNew) showToast(`صفحة ${page} اتسجلت في ورد اليوم. تقبّل الله.`);
        else showToast('الصفحة دي مسجلة بالفعل في ورد اليوم.');
      }
      function renderFaithOverview() {
        const f = state.faith;
        const count = (f.readLog[dayKey()] || []).length;
        $('#wird-count').textContent = count;
        $('#wird-goal-label').textContent = ` / ${f.wirdGoal} صفحات اليوم`;
        $('#wird-goal').value = f.wirdGoal;
        $('#wird-progress').style.width = `${Math.min(100,count/f.wirdGoal*100)}%`;
        $('#khatma-summary').textContent = `الختمة: ${f.khatma.page} / 604 صفحة · ${f.khatma.days} يوم`;
        $('#resume-label').textContent = f.quran.surah === 1 && f.quran.ayah === 1 ? 'ابدأ وردك بالقرآن' : `كمّل من ${surahData[f.quran.surah-1].name} · ${f.quran.ayah}`;
        const category = new Date().getHours() >= 4 && new Date().getHours() < 18 ? 'morning' : 'evening';
        $('#daily-azkar-title').textContent = azkarNames[category];
        $('[data-action="daily-azkar"]').dataset.category = category;
        const checked = f.prayers[dayKey()] || [];
        $('#prayer-checkin-count').textContent = `${checked.length} / 5 صلوات`;
        const fragment = document.createDocumentFragment();
        prayerKeys.forEach(key => {
          const button = document.createElement('button'); button.className = `prayer-check-button${checked.includes(key) ? ' checked' : ''}`;
          button.dataset.prayerCheck = key; button.setAttribute('aria-pressed',String(checked.includes(key)));
          button.innerHTML = `${icon(checked.includes(key) ? 'check' : 'circle')}<span>${prayerNames[key]}</span>`; fragment.append(button);
        });
        $('#prayer-checks').replaceChildren(fragment);
      }
      function resetDailyFaith() {
        const f = state.faith;
        if (f.azkarDay !== dayKey()) { f.azkarDay = dayKey(); f.azkarCounts = {}; }
        if (f.tasbih.day !== dayKey()) { f.tasbih.day = dayKey(); f.tasbih.total = 0; f.tasbih.count = 0; }
      }
      function renderAzkar() {
        resetDailyFaith();
        const f = state.faith;
        const items = adhkar.filter(item => item.category === azkarCategory);
        $$('[data-azkar-category]').forEach(button => { const active = button.dataset.azkarCategory === azkarCategory; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
        $('#azkar-progress').textContent = `${items.filter(item => (f.azkarCounts[item.id] || 0) >= item.repeat).length} / ${items.length} مكتملة`;
        const fragment = document.createDocumentFragment();
        items.forEach(item => {
          const count = f.azkarCounts[item.id] || 0;
          const done = count >= item.repeat;
          const card = document.createElement('article'); card.className = `dhikr-card surface${done ? ' completed' : ''}`;
          card.innerHTML = `<p class="dhikr-text"></p><details class="dhikr-source"><summary>المصدر والتفاصيل</summary><p></p></details><div class="dhikr-bottom"><button class="dhikr-counter${done ? ' done' : ''}"><span>${done ? 'اكتمل الذكر' : 'اضغط للعدّ'}</span><strong>${count} / ${item.repeat}</strong></button><button class="icon-button" title="حفظ في المفضلة">${icon('heart')}</button><button class="icon-button" title="نسخ الذكر" aria-label="نسخ الذكر">${icon('copy')}</button><button class="icon-button" title="تصفير هذا الذكر" aria-label="تصفير هذا الذكر">${icon('reset')}</button></div>`;
          $('.dhikr-text',card).textContent = item.text;
          $('.dhikr-source p',card).textContent = item.source;
          $('.dhikr-counter',card).dataset.zikr = item.id;
          $('.dhikr-counter',card).setAttribute('aria-label',`${item.text}، العدد ${count} من ${item.repeat}`);
          const favorite = $('[title="حفظ في المفضلة"]',card); favorite.dataset.favoriteZikr = item.id; favorite.setAttribute('aria-pressed',String(f.azkarFavorites.includes(item.id))); favorite.style.color = f.azkarFavorites.includes(item.id) ? 'var(--accent)' : '';
          $('[title="نسخ الذكر"]',card).dataset.copyZikr = item.id;
          $('[title="تصفير هذا الذكر"]',card).dataset.resetZikr = item.id;
          fragment.append(card);
        });
        $('#azkar-list').replaceChildren(fragment);
      }
      function renderTasbih() {
        resetDailyFaith(); const t = state.faith.tasbih;
        $('#tasbih-phrase').value = t.phrase; $('#tasbih-phrase-display').textContent = t.phrase;
        $('#tasbih-target').value = t.target; $('#tasbih-count').textContent = t.count;
        $('#tasbih-target-label').textContent = `الهدف ${t.target} · اضغط للذكر`;
        $('#tasbih-button').setAttribute('aria-label',`${t.phrase}، العدد ${t.count} من ${t.target}`);
        $('#tasbih-total').textContent = t.total;
      }
      function incrementTasbih() {
        resetDailyFaith(); const t = state.faith.tasbih;
        t.total++; t.count++;
        if (t.count >= t.target) { t.count = 0; showToast(`اكتملت جولة ${t.target}. تقبّل الله ذكرك.`); navigator.vibrate?.([35,35,35]); }
        else navigator.vibrate?.(12);
        saveState(); renderTasbih();
      }
      function prayerParameters() {
        const f = state.faith;
        const params = adhan.CalculationMethod[f.method]();
        params.madhab = adhan.Madhab[f.madhab];
        params.highLatitudeRule = adhan.HighLatitudeRule.MiddleOfTheNight;
        params.polarCircleResolution = adhan.PolarCircleResolution.AqrabBalad;
        prayerKeys.forEach(key => { params.adjustments[key] = f.adjustment; });
        return params;
      }
      function prayersFor(date) {
        if (!window.adhan) return null;
        const loc = state.faith.location;
        const times = new adhan.PrayerTimes(new adhan.Coordinates(loc.lat,loc.lng),date,prayerParameters());
        return prayerKeys.every(key => times[key] instanceof Date && Number.isFinite(times[key].getTime())) ? times : null;
      }
      function formatPrayer(date) { return new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:state.faith.location.tz}).format(date); }
      function nextPrayer() {
        const now = new Date(); const times = prayersFor(now);
        if (!times) return null;
        const key = prayerKeys.find(key => times[key] > now);
        if (key) return {key,date:times[key],times};
        const tomorrow = prayersFor(new Date(now.getTime()+86400000));
        return tomorrow ? {key:'fajr',date:tomorrow.fajr,times} : null;
      }
      function renderPrayers() {
        const f = state.faith;
        if (document.activeElement !== $('#prayer-city')) $('#prayer-city').value = cities.some(city => city.id === f.location.id) ? f.location.id : 'custom';
        $('#prayer-method').value = f.method; $('#prayer-madhab').value = f.madhab;
        if (document.activeElement !== $('#prayer-adjustment')) $('#prayer-adjustment').value = f.adjustment;
        const date = new Date(); date.setDate(date.getDate()+prayerOffset);
        $('#prayer-date-label').textContent = new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'long',year:'numeric'}).format(date);
        try { $('#hijri-date').textContent = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',{day:'numeric',month:'long',year:'numeric'}).format(date); } catch { $('#hijri-date').textContent = 'التقويم الميلادي'; }
        const times = prayersFor(date);
        const next = nextPrayer();
        $('#ribbon-city').textContent = `${f.location.name} · بتوقيت المدينة`;
        $('#next-prayer-location').textContent = `${f.location.name} · ${f.location.tz}`;
        $('#prayer-location-note').textContent = `الموقع: ${f.location.lat.toFixed(4)}، ${f.location.lng.toFixed(4)} · التوقيت: ${f.location.tz}. التاريخ الهجري تقويمي وقد يختلف برؤية الهلال. راجع هيئة بلدك أو مسجدك لضبط الدقائق المحلية.`;
        $('#prayer-notification-label').textContent = f.notifications ? 'إيقاف تذكير الصلاة' : 'فعّل تذكير الصلاة';
        const fragment = document.createDocumentFragment();
        $('#prayer-table').replaceChildren();
        if (!times) {
          $('#ribbon-times').textContent = window.adhan ? 'تعذّر حساب المواقيت لهذا الموقع. راجع طريقة الحساب.' : 'مكتبة المواقيت مش محمّلة. اتصل بالنت وافتح يومك مرة واحدة.';
          $('#prayer-table').textContent = 'المواقيت غير متاحة. غيّر الموقع أو طريقة الحساب.';
          $('#next-prayer-name').textContent = 'غير متاح'; $('#next-prayer-countdown').textContent = '--:--:--'; return;
        }
        prayerKeys.forEach(key => {
          const button = document.createElement('button'); button.className = `ribbon-prayer${next?.key === key && prayerOffset === 0 ? ' next' : ''}`; button.dataset.faithTab = 'prayer';
          button.innerHTML = `<span>${prayerNames[key]}</span><strong>${formatPrayer(times[key])}</strong>`; fragment.append(button);
        });
        $('#ribbon-times').replaceChildren(fragment);
        ['fajr','sunrise','dhuhr','asr','maghrib','isha'].forEach(key => {
          const row = document.createElement('div'); row.className = `prayer-table-row${key === 'sunrise' ? ' sunrise' : ''}${times.currentPrayer() === key ? ' active' : ''}`;
          row.innerHTML = `<span>${icon(key === 'sunrise' || key === 'fajr' ? 'sun' : 'moon')}${prayerNames[key]}${key === 'sunrise' ? ' · ليس صلاة' : ''}</span><time datetime="${times[key].toISOString()}">${formatPrayer(times[key])}</time>`; $('#prayer-table').append(row);
        });
        updatePrayerCountdown();
      }
      function updatePrayerCountdown() {
        const next = nextPrayer();
        if (!next) { $('#ribbon-countdown').textContent = 'راجع الموقع'; $('#next-prayer-name').textContent = 'غير متاح'; $('#next-prayer-countdown').textContent = '--:--:--'; return; }
        const seconds = Math.max(0,Math.ceil((next.date-Date.now())/1000));
        const text = [Math.floor(seconds/3600),Math.floor(seconds/60)%60,seconds%60].map(value => String(value).padStart(2,'0')).join(':');
        $('#ribbon-countdown').textContent = `${prayerNames[next.key]} · ${formatPrayer(next.date)}`;
        $('#ribbon-next-label').textContent = 'الصلاة الجاية · متبقّي ' + text;
        $('#next-prayer-name').textContent = prayerNames[next.key]; $('#next-prayer-countdown').textContent = text;
      }
      async function locateUser() {
        if (!navigator.geolocation) { showToast('المتصفح مش بيدعم تحديد الموقع. اختار مدينتك يدويا.'); return; }
        showToast('بنطلب إذن الموقع. الإحداثيات بتتحسب على جهازك فقط.');
        navigator.geolocation.getCurrentPosition(position => {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          state.faith.location = {id:'custom',name:'موقعي الحالي',lat:position.coords.latitude,lng:position.coords.longitude,tz:timezone};
          state.faith.method = 'MuslimWorldLeague';
          const custom = cities.find(city => city.id === 'custom'); Object.assign(custom,state.faith.location);
          saveState(); renderPrayers(); renderQibla(); showToast('موقعك اتحدد، والمواقيت اتحدّثت. راجع توقيت المدينة وطريقة الحساب.');
        },error => showToast(error.code === 1 ? 'إذن الموقع مرفوض. تقدر تختار المدينة يدويا من القائمة.' : 'تعذّر تحديد الموقع. اختار المدينة يدويا أو جرّب في مكان أوضح.'),{enableHighAccuracy:false,timeout:15000,maximumAge:300000});
      }
      function renderQibla() {
        const loc = state.faith.location;
        const bearing = window.adhan ? adhan.Qibla(new adhan.Coordinates(loc.lat,loc.lng)) : 0;
        $('#qibla-city').textContent = `اتجاه القبلة من ${loc.name}`;
        $('#qibla-bearing').textContent = `${bearing.toFixed(1)}°`;
        $('#compass').setAttribute('aria-label',`اتجاه القبلة ${bearing.toFixed(1)} درجة من الشمال`);
        $('#compass-needle').style.transform = `rotate(${bearing-(compassHeading || 0)}deg)`;
        $('#qibla-mode').textContent = compassActive && compassHeading !== null ? 'بوصلة الجهاز مباشرة · راجع المعايرة' : 'من الشمال الجغرافي · بوصلة يدوية';
      }
      function compassEvent(event) {
        const heading = Number.isFinite(event.webkitCompassHeading) ? event.webkitCompassHeading : Number.isFinite(event.alpha) ? 360-event.alpha : null;
        if (heading === null) return;
        compassHeading = heading; compassActive = true;
        $('#compass-button').textContent = 'إيقاف بوصلة الجهاز'; renderQibla();
      }
      function stopCompass() {
        window.removeEventListener('deviceorientationabsolute',compassEvent);
        window.removeEventListener('deviceorientation',compassEvent);
        compassActive = false; compassHeading = null;
        $('#compass-button').textContent = 'فعّل بوصلة الجهاز'; renderQibla();
      }
      async function enableCompass() {
        if (compassActive) { stopCompass(); return; }
        if (!window.DeviceOrientationEvent) { showToast('الجهاز مش موفّر بوصلة. استخدم الزاوية مع بوصلة خارجية.'); return; }
        try {
          if (typeof DeviceOrientationEvent.requestPermission === 'function' && await DeviceOrientationEvent.requestPermission() !== 'granted') throw new Error('Permission denied');
          window.addEventListener('deviceorientationabsolute',compassEvent);
          window.addEventListener('deviceorientation',compassEvent);
          compassActive = true; $('#compass-button').textContent = 'إيقاف بوصلة الجهاز';
          showToast('لو السهم اتحرك، البوصلة شغالة. امسك الجهاز أفقيا وعايره.');
          setTimeout(() => { if (compassActive && compassHeading === null) { stopCompass(); showToast('مفيش قراءة بوصلة متاحة. استخدم الزاوية مع بوصلة خارجية موثوقة.'); } },6000);
        } catch { showToast('إذن البوصلة مش متاح. الزاوية المحسوبة تفضل ظاهرة.'); }
      }
      function showMonthlyPrayers() {
        if (!window.adhan) { showToast('مكتبة الحسابات مش جاهزة. اتصل بالنت أول مرة.'); return; }
        const now = new Date(); const date = new Date(now.getFullYear(),now.getMonth()+prayerOffset,1,12);
        monthlyRows = [];
        const days = new Date(date.getFullYear(),date.getMonth()+1,0).getDate();
        const table = document.createElement('table'); table.className = 'monthly-table';
        table.innerHTML = '<thead><tr><th>اليوم</th><th>الفجر</th><th>الشروق</th><th>الظهر</th><th>العصر</th><th>المغرب</th><th>العشاء</th></tr></thead><tbody></tbody>';
        for (let day=1;day<=days;day++) {
          const current = new Date(date.getFullYear(),date.getMonth(),day,12); const times = prayersFor(current);
          if (!times) continue;
          const values = ['fajr','sunrise','dhuhr','asr','maghrib','isha'].map(key => formatPrayer(times[key]));
          monthlyRows.push([dayKey(current),...values]);
          const row = document.createElement('tr'); [String(day),...values].forEach(value => { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); }); $('tbody',table).append(row);
        }
        $('#monthly-title').textContent = `مواقيت ${new Intl.DateTimeFormat('ar-EG',{month:'long',year:'numeric'}).format(date)}`;
        $('#monthly-description').textContent = `${state.faith.location.name} · ${state.faith.location.tz} · الحسابات محلية، والتعديل ${state.faith.adjustment} دقيقة.`;
        $('#monthly-table').replaceChildren(table); $('#monthly-dialog').showModal();
      }
      function switchFaithTab(tab) {
        if (!['overview','quran','azkar','tasbih','prayer','qibla'].includes(tab)) tab = 'overview';
        if (activeView !== 'faith') navigate('faith');
        faithTab = tab;
        $$('[data-tab]').forEach(button => { const active = button.dataset.tab === tab; button.classList.toggle('active',active); button.setAttribute('aria-selected',String(active)); button.tabIndex = active ? 0 : -1; });
        ['overview','quran','azkar','tasbih','prayer','qibla'].forEach(name => { $(`#faith-${name}`).hidden = name !== tab; });
        if (tab === 'quran') { renderSurahList(); renderQuran(); }
        if (tab === 'azkar') renderAzkar();
        if (tab === 'tasbih') renderTasbih();
        if (tab === 'prayer') renderPrayers();
        if (tab === 'qibla') renderQibla();
        if (tab === 'overview') renderFaithOverview();
      }
      function renderFaith() { renderFaithOverview(); renderSurahList(); renderQuran(); renderAzkar(); renderTasbih(); renderPrayers(); renderQibla(); updateQuranPack(); }
      function renderAll() {
        applyTheme(); renderDate(); renderTasks(); renderNotes(); renderTimer(true); renderSessions(); setStorageStatus(); renderFaith();
        if (activeView === 'insights') renderInsights();
      }

      function weeklyData(mode) {
        return Array.from({length:7},(_,index) => {
          const date = new Date(); date.setDate(date.getDate()-(6-index)); const key = dayKey(date);
          return { date:key,label:new Intl.DateTimeFormat('ar-EG',{weekday:'short'}).format(date),value:mode === 'focus' ? state.sessions.filter(session => session.date === key).reduce((sum,session) => sum+session.minutes,0) : state.tasks.filter(task => task.done && task.completedAt && dayKey(new Date(task.completedAt)) === key).length };
        });
      }
      function activityByDay() {
        const map = {};
        const add = (date,count=1) => { if (validDate(date)) map[date] = (map[date] || 0)+count; };
        state.tasks.filter(task => task.done && task.completedAt).forEach(task => add(dayKey(new Date(task.completedAt))));
        state.sessions.forEach(session => add(session.date));
        Object.entries(state.faith.readLog).forEach(([date,pages]) => add(date,pages.length));
        Object.entries(state.faith.prayers).forEach(([date,keys]) => add(date,keys.length));
        add(dayKey(),Object.values(state.faith.azkarCounts).filter(count => count > 0).length + (state.faith.tasbih.day === dayKey() && state.faith.tasbih.total > 0 ? 1 : 0));
        return map;
      }
      function renderInsights() {
        const data = weeklyData(chartMode);
        const today = dayKey();
        $('#insight-minutes').textContent = state.sessions.filter(session => session.date === today).reduce((sum,session) => sum+session.minutes,0);
        $('#insight-tasks').textContent = state.tasks.filter(task => task.done && task.completedAt && dayKey(new Date(task.completedAt)) === today).length;
        const activity = activityByDay();
        let streak = 0; const cursor = new Date();
        if (!activity[today]) cursor.setDate(cursor.getDate()-1);
        while (activity[dayKey(cursor)] && streak < 1000) { streak++; cursor.setDate(cursor.getDate()-1); }
        $('#insight-streak').textContent = streak;
        $$('[data-chart]').forEach(button => { const active = button.dataset.chart === chartMode; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
        $('#chart-description').textContent = chartMode === 'focus' ? 'دقائق التركيز خلال آخر ٧ أيام' : 'المهام المكتملة خلال آخر ٧ أيام';
        $('#insights-chart').setAttribute('aria-label',data.map(day => `${day.label}: ${day.value}`).join('، '));
        if (chartInstance) { chartInstance.destroy(); chartInstance = null; }
        if (window.Chart) {
          $('#insights-chart').hidden = false; $('#chart-fallback').hidden = true;
          const color = state.settings.theme === 'dark' ? '#bbd197' : '#729453';
          chartInstance = new Chart($('#insights-chart'),{type:'bar',data:{labels:data.map(day => day.label),datasets:[{data:data.map(day => day.value),backgroundColor:data.map((_,index) => index === 6 ? color : color+'85'),borderRadius:5,maxBarThickness:30}]},options:{responsive:true,maintainAspectRatio:false,animation:{duration:matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 500},plugins:{legend:{display:false},tooltip:{rtl:true,titleFont:{family:'IBM Plex Sans Arabic'},bodyFont:{family:'IBM Plex Sans Arabic'},callbacks:{label:context => `${context.raw} ${chartMode === 'focus' ? 'دقيقة' : 'مهمة'}`}}},scales:{x:{grid:{display:false},border:{display:false},ticks:{color:'#8b9880',font:{family:'IBM Plex Sans Arabic',size:10}}},y:{beginAtZero:true,suggestedMax:chartMode === 'focus' ? 30 : 5,border:{display:false},grid:{color:state.settings.theme === 'dark' ? '#35442d' : '#edf0e7'},ticks:{precision:0,color:'#8b9880',font:{family:'DM Sans',size:10}}}}}});
        } else {
          $('#insights-chart').hidden = true; $('#chart-fallback').hidden = false;
          $('#chart-fallback').textContent = data.map(day => `${day.label}: ${day.value}`).join(' · ') + ' · الرسم يحتاج تجهيز المكتبة أول مرة.';
        }
        const heat = document.createDocumentFragment();
        for (let index=83;index>=0;index--) {
          const date = new Date(); date.setDate(date.getDate()-index); const key = dayKey(date); const count = activity[key] || 0;
          const cell = document.createElement('span'); cell.className = 'activity-cell';
          cell.style.background = count ? ['#e8efdf','#cbdab7','#9cb881','#658a4c','#315d38'][Math.min(4,Math.ceil(count/3))] : '';
          cell.title = `${key}: ${count} نشاط`; cell.setAttribute('role','img'); cell.setAttribute('aria-label',cell.title); heat.append(cell);
        }
        $('#activity-heatmap').replaceChildren(heat);
        const achievements = [
          {label:'أول خطوة',icon:'check',earned:state.tasks.some(task => task.done)},
          {label:'جلسة تركيز',icon:'timer',earned:state.sessions.length > 0},
          {label:'ورد من القرآن',icon:'book',earned:state.faith.readPages.length > 0},
          {label:'أسبوع من الاستمرار',icon:'leaf',earned:streak >= 7}
        ];
        $('#achievements').replaceChildren();
        achievements.forEach(item => { const badge = document.createElement('span'); badge.className = `achievement${item.earned ? ' earned' : ''}`; badge.innerHTML = `${icon(item.icon)}<span>${item.label} ${item.earned ? '· تحقق' : '· مستنيك'}</span>`; $('#achievements').append(badge); });
        const history = state.tasks.filter(task => task.done && task.completedAt).map(task => ({title:task.title,date:task.completedAt,icon:'check'})).concat(state.sessions.map(session => ({title:session.title || `جلسة تركيز · ${session.minutes} دقيقة`,date:new Date(`${session.date}T12:00:00`).getTime(),icon:'timer'}))).sort((a,b) => b.date-a.date).slice(0,7);
        $('#history-list').replaceChildren();
        history.forEach(item => { const row = document.createElement('div'); row.className = 'history-row'; row.innerHTML = `${icon(item.icon)}<span></span><time></time>`; $('span:last-of-type',row).textContent = item.title; $('time',row).textContent = new Intl.DateTimeFormat('ar-EG',{day:'numeric',month:'short'}).format(new Date(item.date)); $('#history-list').append(row); });
        if (!history.length) $('#history-list').textContent = 'أول مهمة أو جلسة هتظهر هنا. ابدأ بخطوة صغيرة.';
      }
      function setAmbient(kind) {
        if (ambientSource) { try { ambientSource.stop(); } catch {} ambientSource.disconnect(); ambientGain?.disconnect(); ambientSource = null; }
        ambientKind = kind;
        if (kind !== 'off') {
          unlockAudio();
          if (!audioContext) { showToast('الصوت غير متاح في المتصفح ده.'); return; }
          audioContext.resume().catch(() => {});
          const buffer = audioContext.createBuffer(1,audioContext.sampleRate*3,audioContext.sampleRate);
          const samples = buffer.getChannelData(0); let previous = 0;
          for (let index=0;index<samples.length;index++) { const white = Math.random()*2-1; previous = (previous+.02*white)/1.02; samples[index] = kind === 'brown' ? previous*3.5 : white*.5; }
          ambientSource = audioContext.createBufferSource(); ambientSource.buffer = buffer; ambientSource.loop = true;
          const filter = audioContext.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = kind === 'rain' ? 1800 : 700;
          ambientGain = audioContext.createGain(); ambientGain.gain.value = state.ambientVolume/100*.35;
          ambientSource.connect(filter); filter.connect(ambientGain); ambientGain.connect(audioContext.destination);
          ambientSource.onended = () => filter.disconnect(); ambientSource.start();
        }
        $$('[data-ambient]').forEach(button => { const active = button.dataset.ambient === kind; button.classList.toggle('active',active); button.setAttribute('aria-pressed',String(active)); });
        $('#sound-bars').classList.toggle('playing',kind !== 'off');
      }
      function commandChoices(query = '') {
        const base = [
          {id:'new',label:'أضف خطوة جديدة',group:'أوامر سريعة',icon:'plus',run:() => openTask()},
          {id:'quran',label:'القرآن الكريم',group:'مساحاتك',icon:'book',run:() => switchFaithTab('quran')},
          {id:'azkar',label:'أذكار الصباح والمساء',group:'مساحاتك',icon:'heart',run:() => switchFaithTab('azkar')},
          {id:'prayer',label:'مواقيت الصلاة',group:'مساحاتك',icon:'moon',run:() => switchFaithTab('prayer')},
          {id:'qibla',label:'اتجاه القبلة',group:'مساحاتك',icon:'compass',run:() => switchFaithTab('qibla')},
          {id:'focus',label:'ابدأ مساحة التركيز',group:'مساحاتك',icon:'timer',run:() => navigate('focus')},
          {id:'notes',label:'افتح ملاحظاتي',group:'مساحاتك',icon:'note',run:() => navigate('notes')},
          {id:'insights',label:'راجع إنجازاتي',group:'مساحاتك',icon:'chart',run:() => navigate('insights')},
          {id:'install',label:'ثبّت يومك على جهازك',group:'أوامر سريعة',icon:'download',run:() => openInstall()},
          {id:'settings',label:'الإعدادات والنسخ الاحتياطي',group:'أوامر سريعة',icon:'settings',run:openSettings}
        ];
        const normalized = arabicNormalize(query.trim());
        if (!normalized) {
          const recent = state.recentCommands.map(id => base.find(item => item.id === id)).filter(Boolean);
          return [...recent.map(item => ({...item,group:'آخر اختياراتك'})),...base.filter(item => !recent.includes(item))].slice(0,9);
        }
        const choices = base.filter(item => arabicNormalize(item.label).includes(normalized));
        state.tasks.filter(task => arabicNormalize(task.title+' '+task.description).includes(normalized)).slice(0,5).forEach(task => choices.push({id:`task-${task.id}`,label:task.title,group:'مهامك',icon:'checklist',run:() => { navigate('tasks'); $('#task-search').value = task.title; renderTasks(); }}));
        surahData.filter(surah => arabicNormalize(surah.name).includes(normalized)).slice(0,5).forEach(surah => choices.push({id:`surah-${surah.number}`,label:`سورة ${surah.name}`,group:'القرآن الكريم',icon:'book',run:() => { switchFaithTab('quran'); selectSurah(surah.number); }}));
        adhkar.filter(item => arabicNormalize(item.text).includes(normalized)).slice(0,3).forEach(item => choices.push({id:`zikr-${item.id}`,label:item.text.slice(0,75),group:azkarNames[item.category],icon:'heart',run:() => { azkarCategory = item.category; switchFaithTab('azkar'); }}));
        if (state.note && arabicNormalize(state.note).includes(normalized)) choices.push({id:'note-search',label:'فكرة موجودة في ملاحظاتك',group:'ملاحظاتك',icon:'note',run:() => { navigate('notes'); $('#notes-editor').focus(); }});
        return choices.slice(0,18);
      }
      function renderCommands() {
        commandItems = commandChoices($('#command-input').value); commandIndex = Math.min(commandIndex,Math.max(0,commandItems.length-1));
        const container = $('#command-results'); container.replaceChildren();
        let group = '';
        commandItems.forEach((item,index) => {
          if (item.group !== group) { group = item.group; const label = document.createElement('p'); label.className = 'command-group-label'; label.textContent = group; container.append(label); }
          const button = document.createElement('button'); button.className = `command-result${index === commandIndex ? ' active' : ''}`; button.id = `command-option-${index}`; button.dataset.command = index; button.setAttribute('role','option'); button.setAttribute('aria-selected',String(index === commandIndex));
          button.innerHTML = `${icon(item.icon)}<span></span><small></small>`; $('span',button).textContent = item.label; $('small',button).textContent = item.group; container.append(button);
        });
        if (!commandItems.length) container.textContent = 'مفيش نتيجة. جرّب اسم سورة، مهمة، أو كلمة تانية.';
        if (commandItems.length) $('#command-input').setAttribute('aria-activedescendant',`command-option-${commandIndex}`); else $('#command-input').removeAttribute('aria-activedescendant');
      }
      function openCommand() { $('#command-input').value = ''; commandIndex = 0; renderCommands(); if (!$('#command-dialog').open) $('#command-dialog').showModal(); $('#command-input').focus(); }
      function executeCommand(index) {
        const item = commandItems[index]; if (!item) return;
        state.recentCommands = [item.id,...state.recentCommands.filter(id => id !== item.id)].slice(0,6); saveState(); $('#command-dialog').close(); item.run();
      }
      async function copyText(text) {
        try { if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable'); await navigator.clipboard.writeText(text); return true; }
        catch {
          const field = document.createElement('textarea'); field.value = text; field.style.cssText = 'position:fixed;left:-9999px;top:0';
          ($$('dialog[open]').at(-1) || document.body).append(field); field.select();
          let copied = false; try { copied = document.execCommand('copy'); } catch {} field.remove(); return copied;
        }
      }
      function installedApp() { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; }
      function updateOfflineStatus() {
        $('#offline-status').textContent = !navigator.onLine ? 'أنت بدون نت · المحفوظ على جهازك متاح.' : offlineReady ? 'جاهز بدون نت · بياناتك على جهازك.' : 'بياناتك على جهازك · جارٍ تجهيز العمل بدون نت.';
        $('#offline-settings-status').textContent = installedApp() ? 'يومك مثبّت على جهازك. ' + (offlineReady ? 'النسخة الأساسية جاهزة بدون نت.' : 'جارٍ تجهيز الملفات الأساسية.') : offlineReady ? 'النسخة الأساسية جاهزة بدون نت. اضغط «ثبّت يومك» لتجربة مستقلة.' : location.protocol === 'file:' ? 'أنت فاتح الملف مباشرة. التثبيت والعمل بدون نت يحتاجان رفع الملفات على HTTPS أو localhost.' : 'أول فتح يحتاج اتصالا لتجهيز الملفات. بعد الجاهزية تقدر تستخدم يومك بدون نت.';
        $('#install-label').textContent = installedApp() ? 'يومك مثبّت' : 'ثبّت يومك';
      }
      async function refreshStorage() {
        try {
          const estimate = await navigator.storage?.estimate?.();
          const persistent = await navigator.storage?.persisted?.();
          $('#storage-meter').textContent = estimate ? `المساحة المستخدمة: ${(estimate.usage/1048576).toFixed(1)} ميجابايت${estimate.quota ? ` من ${(estimate.quota/1048576).toFixed(0)} متاحة` : ''} · ${persistent ? 'الحفظ الدائم مفعّل' : 'الحفظ حسب سياسة المتصفح'}` : 'إحصاءات التخزين مش متاحة في المتصفح ده.';
        } catch { $('#storage-meter').textContent = 'الحفظ محلي على الجهاز. اعمل نسخة احتياطية بانتظام.'; }
      }
      function openInstall() {
        updateOfflineStatus();
        $('#install-status').textContent = installedApp() ? 'يومك مثبّت بالفعل. تقدر تفتحه من أيقونته على جهازك.' : deferredInstall ? 'متصفحك يدعم التثبيت المباشر. اضغط الزر بالأسفل.' : $('#offline-settings-status').textContent;
        $('#native-install-button').disabled = !deferredInstall || installedApp();
        $('#native-install-button').textContent = installedApp() ? 'مثبّت بالفعل' : deferredInstall ? 'ثبّت يومك الآن' : 'استخدم خطوات التثبيت بالأعلى';
        if (!$('#install-dialog').open) $('#install-dialog').showModal();
      }
      async function promptInstall() {
        if (!deferredInstall) { openInstall(); return; }
        try { await deferredInstall.prompt(); const choice = await deferredInstall.userChoice; deferredInstall = null; if (choice.outcome === 'accepted') { $('#install-dialog').close(); showToast('يومك بقى على جهازك. أهلا بيك في أي وقت.'); } updateOfflineStatus(); }
        catch { showToast('التثبيت المباشر مش متاح دلوقتي. استخدم قائمة المتصفح.'); }
      }
      async function initPWA() {
        updateOfflineStatus();
        if (!('serviceWorker' in navigator) || !['https:','http:'].includes(location.protocol)) return;
        try {
          swRegistration = await navigator.serviceWorker.register('./sw.js');
          await navigator.serviceWorker.ready;
          const notifyReady = () => { offlineReady = true; updateOfflineStatus(); refreshStorage(); };
          if (swRegistration.active) swRegistration.active.postMessage({type:'CHECK_READY'});
          navigator.serviceWorker.addEventListener('message',event => {
            if (event.data?.type === 'OFFLINE_READY') notifyReady();
            if (event.data?.type === 'UPDATE_READY') showToast('نسخة أحدث من يومك جاهزة.', 'حدّث الآن', () => swRegistration.waiting?.postMessage({type:'SKIP_WAITING'}));
          });
          swRegistration.addEventListener('updatefound',() => {
            const worker = swRegistration.installing;
            worker?.addEventListener('statechange',() => { if (worker.state === 'installed' && navigator.serviceWorker.controller) showToast('فيه تحديث جديد ليومك.', 'حدّث الآن',() => worker.postMessage({type:'SKIP_WAITING'})); });
          });
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange',() => { if (!refreshing) { refreshing = true; location.reload(); } });
          setTimeout(() => swRegistration.active?.postMessage({type:'CHECK_READY'}),2000);
        } catch { $('#offline-status').textContent = 'التعذّر تفعيل العمل بدون نت. راجع ملفات الموقع والاستضافة.'; }
      }
      async function sendNotification(title,body,tag) {
        if (!('Notification' in window) || Notification.permission !== 'granted') return;
        try {
          const registration = swRegistration || await navigator.serviceWorker?.getRegistration();
          if (registration) await registration.showNotification(title,{body,tag,icon:'./icon.svg',badge:'./icon.svg',data:{url:location.href}});
          else new Notification(title,{body,tag});
        } catch {}
      }
      async function requestNotifications(kind) {
        if (!('Notification' in window)) { showToast('المتصفح ده مش بيدعم التنبيهات.'); return; }
        const enabled = kind === 'prayer' ? state.faith.notifications : state.settings.taskNotifications;
        if (enabled) { if (kind === 'prayer') state.faith.notifications = false; else state.settings.taskNotifications = false; saveState(); renderPrayers(); showToast('التذكير اتوقف.'); return; }
        try {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') { showToast('إذن التنبيهات مرفوض. فعّله من إعدادات الموقع في المتصفح.'); return; }
          if (kind === 'prayer') state.faith.notifications = true; else state.settings.taskNotifications = true;
          saveState(); renderPrayers(); showToast('التذكير اتفعّل أثناء فتح يومك. إغلاق التطبيق قد يوقف التنبيه.');
        } catch { showToast('التنبيهات تحتاج متصفحا داعما واتصال HTTPS.'); }
      }
      function checkReminders() {
        const now = new Date(); const today = dayKey();
        if (state.faith.notifications) {
          const times = prayersFor(now);
          if (times) prayerKeys.forEach(prayer => {
            const delta = now.getTime()-times[prayer].getTime(); const key = `prayer-${today}-${prayer}`;
            if (delta >= 0 && delta < 60000 && !state.notifySent.includes(key)) { state.notifySent.push(key); sendNotification(`حان الآن وقت صلاة ${prayerNames[prayer]}`,`بحسب مواقيت ${state.faith.location.name}. راجع ضبط المسجد المحلي.`,key); saveState(); }
          });
        }
        if (state.settings.taskNotifications && now.getHours() >= 9) state.tasks.filter(task => !task.done && task.due === today).slice(0,5).forEach(task => {
          const key = `task-${today}-${task.id}`;
          if (!state.notifySent.includes(key)) { state.notifySent.push(key); sendNotification('خطوة صغيرة مستنياك',task.title,key); saveState(); }
        });
        state.notifySent = state.notifySent.slice(-200);
      }
      const actions = {
        'new-task': () => openTask(), 'delete-task': deleteTask, 'settings': openSettings,
        'help': () => $('#help-dialog').showModal(),
        'theme': () => { state.settings.theme = state.settings.theme === 'light' ? 'dark' : 'light'; applyTheme(); saveState(); if (activeView === 'insights') renderInsights(); },
        'search': openCommand, 'command': openCommand,
        'clear-filters': () => { $('#task-search').value = ''; $('#category-filter').value = 'all'; filters.tasks = 'all'; renderTasks(); $('#task-search').focus(); },
        'timer-toggle': toggleTimer, 'timer-reset': resetTimer, 'copy-notes': copyNotes,
        'download-notes': () => { if (!state.note.trim()) { showToast('اكتب أول فكرة، وبعدها نزّلها معاك.'); return; } downloadFile('\uFEFF' + state.note, `yawmak-notes-${dayKey()}.txt`, 'text/plain;charset=utf-8'); showToast('جهّزنا ملاحظاتك للتنزيل.'); },
        'download-markdown': () => { if (!state.note.trim()) { showToast('اكتب أول فكرة علشان تنزّلها.'); return; } downloadFile(state.note,`yawmak-notes-${dayKey()}.md`,'text/markdown;charset=utf-8'); showToast('دفترك جاهز كملف Markdown.'); },
        'clear-notes': clearNotes,
        'export-data': () => { clearTimeout(noteSaveTimeout); saveState(); downloadFile(JSON.stringify(state,null,2),`yawmak-backup-${dayKey()}.json`,'application/json'); showToast('نسختك جاهزة للتنزيل. احتفظ بيها في مكان آمن.'); },
        'import-data': () => $('#import-file').click(), 'reset-data': resetData,
        'close-toast': () => { clearTimeout(toastTimeout); $('#toast').hidden = true; toastCallback = null; },
        'download-quran': downloadQuran,
        'resume-quran': () => { switchFaithTab('quran'); selectSurah(state.faith.quran.surah,state.faith.quran.ayah); },
        'show-bookmarks': () => { $('#bookmark-list').hidden = !$('#bookmark-list').hidden; renderBookmarks(); },
        'quran-font-less': () => { state.faith.quran.fontSize = clamp(state.faith.quran.fontSize-2,22,44,29); renderQuran(); saveState(); },
        'quran-font-more': () => { state.faith.quran.fontSize = clamp(state.faith.quran.fontSize+2,22,44,29); renderQuran(); saveState(); },
        'quran-layout': () => { state.faith.quran.layout = state.faith.quran.layout === 'mushaf' ? 'verses' : 'mushaf'; renderQuran(); saveState(); showToast(state.faith.quran.layout === 'mushaf' ? 'عرض المصحف المتصل.' : 'عرض آية في كل سطر.'); },
        'next-surah': () => selectSurah(state.faith.quran.surah+1),
        'previous-surah': () => selectSurah(state.faith.quran.surah-1),
        'save-reading': () => { saveState(); showToast('موضع قراءتك محفوظ. كمّل في أي وقت.'); },
        'finish-quran-page': () => { const verse = getVerses(state.faith.quran.surah)?.[state.faith.quran.ayah-1]; if (!verse?.page) { showToast('نزّل السورة الأول علشان نعرف رقم الصفحة بدقة.'); return; } state.faith.quran.page = verse.page; recordReading(verse.page); },
        'bookmark-ayah': () => { if (!selectedAyah) return; const list = state.faith.quran.bookmarks; state.faith.quran.bookmarks = list.includes(selectedAyah) ? list.filter(ref => ref !== selectedAyah) : [...list,selectedAyah]; $('#bookmark-ayah-label').textContent = state.faith.quran.bookmarks.includes(selectedAyah) ? 'إزالة من المحفوظات' : 'احفظ الآية'; saveState(); renderBookmarks(); },
        'copy-ayah': async () => { if (!selectedAyah) return; showToast(await copyText(ayahReferenceText(selectedAyah)) ? 'الآية اتنسخت مع اسم السورة ورقم الآية.' : 'النسخ التلقائي مش متاح. حدّد نص الآية وانسخه يدويا.'); },
        'play-ayah': () => { if (!selectedAyah) return; const [surah,ayah] = selectedAyah.split(':').map(Number); $('#ayah-dialog').close(); switchFaithTab('quran'); playAudio(surah,ayah); },
        'play-surah': () => playAudio(state.faith.quran.surah), 'download-audio': downloadAudio,
        'close-audio': () => { $('#quran-audio').pause(); $('#quran-audio-panel').hidden = true; },
        'daily-azkar': () => { azkarCategory = new Date().getHours() >= 4 && new Date().getHours() < 18 ? 'morning' : 'evening'; switchFaithTab('azkar'); },
        'tasbih-increment': incrementTasbih,
        'tasbih-reset': async () => { if (state.faith.tasbih.count && !await askConfirm('نصفّر الجولة؟','إجمالي ذكر اليوم هيفضل محفوظ. الجولة الحالية فقط هترجع لصفر.','صفّر الجولة')) return; state.faith.tasbih.count=0; saveState(); renderTasbih(); },
        'locate': locateUser, 'monthly-prayers': showMonthlyPrayers,
        'download-prayers': () => { if (!monthlyRows.length) return; downloadFile('\uFEFFالتاريخ,الفجر,الشروق,الظهر,العصر,المغرب,العشاء\n'+monthlyRows.map(row => row.join(',')).join('\n'),`yawmak-prayers-${state.faith.location.id}-${dayKey().slice(0,7)}.csv`,'text/csv;charset=utf-8'); showToast('جدول المواقيت جاهز للتنزيل.'); },
        'prayer-next-day': () => { prayerOffset++; renderPrayers(); }, 'prayer-previous-day': () => { prayerOffset--; renderPrayers(); },
        'prayer-notifications': () => requestNotifications('prayer'), 'task-notifications': () => requestNotifications('tasks'), 'compass': enableCompass,
        'khatma-settings': () => { $('#khatma-days').value=state.faith.khatma.days; $('#khatma-page').value=state.faith.khatma.page; $('#khatma-dialog').showModal(); },
        'restart-khatma': async () => { if (!await askConfirm('نبدأ ختمة جديدة؟','هتبدأ من الصفحة الأولى. إنجاز القراءة اليومي السابق هيفضل محفوظ.','ابدأ ختمة')) return; state.faith.khatma={days:Number($('#khatma-days').value),started:dayKey(),page:0}; saveState(); renderFaithOverview(); $('#khatma-page').value=0; showToast('ختمة جديدة. كل صفحة بتقرّبك.'); },
        'install': openInstall, 'prompt-install': promptInstall,
        'check-update': async () => { if (!swRegistration) { showToast('التحديث يحتاج نسخة مثبتة أو موقع HTTPS.'); return; } try { await swRegistration.update(); showToast(swRegistration.waiting ? 'فيه تحديث جاهز.' : 'تم الفحص. لو فيه تحديث هتظهر رسالة عند جاهزيته.'); } catch { showToast('تعذّر فحص التحديث. راجع اتصالك بالنت.'); } },
        'persist-storage': async () => { try { const granted=await navigator.storage?.persist?.(); showToast(granted ? 'المتصفح وافق على الحفظ الدائم. اعمل نسخ احتياطية برضه.' : 'المتصفح بيدير المساحة تلقائيا. احتفظ بنسخة احتياطية.'); refreshStorage(); } catch { showToast('الحفظ الدائم مش متاح في المتصفح ده.'); } },
        'clear-audio': async () => { if (!await askConfirm('نمسح التلاوات المنزلة؟','المصحف والملاحظات والمهام مش هتتمسح. التلاوات هتحتاج نت أو تنزيل جديد.','امسح التلاوات',true)) return; try { await caches.delete('yawmak-recitations-v1'); $('#quran-audio').pause(); showToast('التلاوات المنزلة اتمسحت. بياناتك التانية زي ما هي.'); refreshStorage(); } catch { showToast('تعذّر الوصول لمساحة التلاوات.'); } }
      };
      document.addEventListener('click',async event => {
        const button=event.target.closest('button'); if (!button || button.disabled) return;
        const data=button.dataset;
        if (data.view) navigate(data.view);
        else if (data.faithTab) switchFaithTab(data.faithTab);
        else if (data.tab) switchFaithTab(data.tab);
        else if (data.surah) { selectSurah(Number(data.surah)); if (innerWidth<521) $('.quran-reader').scrollIntoView({behavior:'smooth',block:'start'}); }
        else if (data.searchSurah) { $('#quran-search').value=''; $('#quran-search-results').hidden=true; await selectSurah(Number(data.searchSurah),Number(data.searchAyah)); $(`[data-verse="${data.searchSurah}:${data.searchAyah}"]`)?.scrollIntoView({behavior:'smooth',block:'center'}); }
        else if (data.ayah) openAyah(data.ayah);
        else if (data.zikr) { resetDailyFaith(); const item=adhkar.find(item => item.id===data.zikr); if (!item) return; const count=state.faith.azkarCounts[item.id]||0; if (count<item.repeat) { state.faith.azkarCounts[item.id]=count+1; navigator.vibrate?.(10); saveState(); renderAzkar(); if (count+1===item.repeat) showToast('اكتمل الذكر. تقبّل الله.'); } else showToast('الذكر ده مكتمل. تقدر تصفّره وتبدأ من جديد.'); }
        else if (data.favoriteZikr) { const list=state.faith.azkarFavorites; state.faith.azkarFavorites=list.includes(data.favoriteZikr)?list.filter(id=>id!==data.favoriteZikr):[...list,data.favoriteZikr]; saveState(); renderAzkar(); }
        else if (data.copyZikr) { const item=adhkar.find(item=>item.id===data.copyZikr); if(item) showToast(await copyText(item.text+'\n'+item.source)?'الذكر اتنسخ بمصدره.':'النسخ مش متاح. حدّد النص وانسخه يدويا.'); }
        else if (data.resetZikr) { state.faith.azkarCounts[data.resetZikr]=0; saveState(); renderAzkar(); }
        else if (data.prayerCheck) { const today=dayKey(); const list=state.faith.prayers[today]||[]; state.faith.prayers[today]=list.includes(data.prayerCheck)?list.filter(key=>key!==data.prayerCheck):[...list,data.prayerCheck]; saveState(); renderFaithOverview(); }
        else if (data.ambient) setAmbient(data.ambient);
        else if (data.chart) { chartMode=data.chart; renderInsights(); }
        else if (data.template) {
          const templates={plan:'خطة اليوم\n\nأهم ٣ خطوات:\n- \n- \n- \n\nحاجة أعملها لنفسي:\n',meeting:'اجتماع · '+dayKey()+'\n\nالموضوع:\nالحضور:\nالقرارات:\nالخطوات التالية:\n',gratitude:'امتنان اليوم\n\n٣ حاجات ممتن ليها:\n- \n- \n- \n\nشخص أحب أشكره:\n'};
          const addition=(state.note?'\n\n':'')+templates[data.template]; if(state.note.length+addition.length>20000){showToast('الدفتر قرب من الحد الأقصى. نزّل نسخة أو امسح مساحة الأول.');return;} state.note+=addition; saveState(); renderNotes(); $('#notes-editor').focus();
        }
        else if (data.command!==undefined) executeCommand(Number(data.command));
        else if (data.action && actions[data.action]) actions[data.action]();
        else if (data.editTask) openTask(data.editTask);
        else if (data.filter) { filters[data.filterView]=data.filter; renderTasks(); }
        else if (data.timerMode) switchTimerMode(data.timerMode);
        else if (data.closeDialog) document.getElementById(data.closeDialog).close('cancel');
      });
      document.addEventListener('change',event => {
        const target=event.target;
        if(target.matches('[data-task-check]')) toggleTask(target.dataset.taskCheck,target.checked);
        if(target.matches('[data-subtask-id]')) { const task=state.tasks.find(task=>task.id===target.dataset.taskId); const step=task?.subtasks.find(step=>step.id===target.dataset.subtaskId); if(step){step.done=target.checked;saveState();renderTasks();} }
        if(target.id==='surah-jump') selectSurah(Number(target.value));
        if(target.id==='reciter-select') { state.faith.quran.reciter=target.value;saveState(); }
        if(target.id==='wird-goal') {state.faith.wirdGoal=Number(target.value);saveState();renderFaithOverview();}
        if(target.id==='prayer-city') {const city=cities.find(city=>city.id===target.value);if(city){state.faith.location={...city};state.faith.method=city.method;prayerOffset=0;stopCompass();saveState();renderPrayers();renderQibla();}}
        if(target.id==='prayer-method') {state.faith.method=target.value;saveState();renderPrayers();}
        if(target.id==='prayer-madhab') {state.faith.madhab=target.value;saveState();renderPrayers();}
        if(target.id==='prayer-adjustment') {state.faith.adjustment=clamp(target.value,-30,30,0);target.value=state.faith.adjustment;saveState();renderPrayers();}
        if(target.id==='tasbih-phrase'||target.id==='tasbih-target') {
          const value=target.id==='tasbih-phrase'?target.value:Number(target.value);target.value=target.id==='tasbih-phrase'?state.faith.tasbih.phrase:state.faith.tasbih.target;
          (async()=>{if(state.faith.tasbih.count&&!await askConfirm('نغيّر الذكر؟','الجولة الحالية هتبدأ من جديد، وإجمالي اليوم محفوظ.','غيّر'))return;if(target.id==='tasbih-phrase')state.faith.tasbih.phrase=value;else state.faith.tasbih.target=value;state.faith.tasbih.count=0;saveState();renderTasbih();})();
        }
      });
      let quranSearchTimeout;
      $('#surah-search').addEventListener('input',renderSurahList);
      $('#quran-search').addEventListener('input',()=>{clearTimeout(quranSearchTimeout);quranSearchTimeout=setTimeout(searchQuran,220);});
      $('#command-input').addEventListener('input',()=>{commandIndex=0;renderCommands();});
      $('#ambient-volume').addEventListener('input',event=>{state.ambientVolume=Number(event.target.value);if(ambientGain)ambientGain.gain.value=state.ambientVolume/100*.35;saveState();});
      $('#quran-audio').addEventListener('error',()=>{$('#audio-status').textContent='التلاوة مش متاحة دلوقتي. راجع الاتصال أو جرّب قارئا آخر.';});
      $('#khatma-form').addEventListener('submit',event=>{event.preventDefault();const days=Number($('#khatma-days').value);const page=clamp($('#khatma-page').value,0,604,0);const old=state.faith.khatma.page;if(days!==state.faith.khatma.days)state.faith.khatma.started=dayKey();state.faith.khatma.days=days;state.faith.khatma.page=page;for(let current=old+1;current<=page;current++){if(!state.faith.readPages.includes(current))state.faith.readPages.push(current);}saveState();renderFaithOverview();$('#khatma-dialog').close();showToast('خطتك اتحفظت. خدها صفحة صفحة.');});
      $('#command-dialog').addEventListener('keydown',event=>{
        if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();commandIndex=clamp(commandIndex+(event.key==='ArrowDown'?1:-1),0,Math.max(0,commandItems.length-1),0);renderCommands();$(`#command-option-${commandIndex}`)?.scrollIntoView({block:'nearest'});}
        if(event.key==='Enter'&&event.target.id==='command-input'){event.preventDefault();executeCommand(commandIndex);}
      });
      $('.faith-tabs').addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const tabs=$$('[data-tab]');const current=tabs.findIndex(tab=>tab.dataset.tab===faithTab);const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(current+(event.key==='ArrowLeft'?1:-1)+tabs.length)%tabs.length;switchFaithTab(tabs[next].dataset.tab);tabs[next].focus();});
      window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();deferredInstall=event;updateOfflineStatus();});
      window.addEventListener('appinstalled',()=>{deferredInstall=null;updateOfflineStatus();showToast('يومك اتثبّت. مساحتك بقت أقرب ليك.');});
      window.addEventListener('online',()=>{updateOfflineStatus();renderPrayers();showToast('الاتصال رجع. تقدر تنزّل محتوى جديد.');});
      window.addEventListener('offline',()=>{updateOfflineStatus();showToast('أنت بدون نت. المهام والملاحظات والمحتوى المحفوظ متاحين.');});

      $('#task-form').addEventListener('submit',event=>{
        event.preventDefault();const title=$('#task-title-input').value.trim();
        if(!title){$('#task-title-input').setCustomValidity('اكتب خطوة صغيرة الأول.');$('#task-title-input').reportValidity();return;}
        const id=$('#task-id').value;const existing=state.tasks.find(task=>task.id===id);
        const lines=$('#task-subtasks').value.split('\n').map(line=>line.trim()).filter(Boolean).slice(0,20);
        const repeat=$('#task-repeat').value;
        const values={title,category:$('#task-category-input').value,priority:$('#task-priority-input').value,due:$('#task-date-input').value||(repeat!=='none'?dayKey():''),repeat,description:$('#task-description').value.trim(),subtasks:lines.map((text,index)=>({id:existing?.subtasks[index]?.id||uid(),text:text.slice(0,160),done:existing?.subtasks[index]?.done||false}))};
        if(id){if(!existing)return;Object.assign(existing,values);saveState();renderTasks();}
        else if(!addTask(title,values.category,values.priority,values.due,{repeat,description:values.description,subtasks:values.subtasks}))return;
        $('#task-dialog').close();showToast(id?'خطوتك اتعدّلت. خلي الخطة تناسبك.':values.due>dayKey()?'اتضافت لموعدها. هتلاقيها في كل مهامك.':'خطوة جديدة في يومك. بداية حلوة.');
      });
      $('#task-title-input').addEventListener('input',event=>event.target.setCustomValidity(''));
      $('#quick-add-form').addEventListener('submit',event=>{event.preventDefault();const input=$('#quick-task-input');if(!input.value.trim()){input.setCustomValidity('اكتب خطوة صغيرة الأول.');input.reportValidity();return;}if(addTask(input.value.trim())){input.value='';input.focus();showToast('خطوة جديدة في يومك. بداية حلوة.');}});
      $('#quick-task-input').addEventListener('input',event=>event.target.setCustomValidity(''));
      $('#task-search').addEventListener('input',renderTasks);
      $('#category-filter').addEventListener('change',renderTasks);
      $('#task-sort').addEventListener('change',renderTasks);
      $('#quick-note').addEventListener('input',onNoteInput);
      $('#notes-editor').addEventListener('input',onNoteInput);
      $('#focus-task').addEventListener('change',event=>{state.timer.taskId=event.target.value;saveState();});
      $('#import-file').addEventListener('change',importData);
      $('#settings-form').addEventListener('submit',event=>{
        event.preventDefault();const freshTimer=!state.timer.running&&state.timer.remaining===state.timer.duration;
        state.settings.name=$('#settings-name').value.trim().slice(0,30);
        state.settings.focusMinutes=clamp($('#settings-focus').value,1,120,25);state.settings.breakMinutes=clamp($('#settings-break').value,1,60,5);state.settings.longBreakMinutes=clamp($('#settings-long-break').value,5,90,15);
        state.settings.autoNext=$('#settings-auto').checked;state.settings.sound=$('#settings-sound').checked;
        if(freshTimer){state.timer.duration=timerDuration();state.timer.remaining=state.timer.duration;}
        saveState();renderDate();renderTimer(true);$('#settings-dialog').close();showToast('اختياراتك اتحفظت. يومك بطريقتك.');
      });
      $('#confirm-yes').addEventListener('click',()=>$('#confirm-dialog').close('yes'));
      $('#confirm-dialog').addEventListener('close',()=>{if(confirmResolver){confirmResolver($('#confirm-dialog').returnValue==='yes');confirmResolver=null;}});
      $('#toast-action').addEventListener('click',()=>{const callback=toastCallback;clearTimeout(toastTimeout);$('#toast').hidden=true;toastCallback=null;callback?.();});
      $$('dialog').forEach(dialog=>{
        dialog.addEventListener('click',event=>{if(event.target!==dialog)return;const rect=dialog.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)dialog.close('cancel');});
        dialog.addEventListener('close',()=>{if(dialog.contains($('#toast')))($$('dialog[open]').at(-1)||document.body).append($('#toast'));});
      });
      document.addEventListener('keydown',event=>{
        if($('dialog[open]')||event.repeat)return;
        const typing=event.target.matches('input,textarea,select,[contenteditable="true"]');
        if((event.ctrlKey||event.metaKey)&&(event.code==='KeyK'||event.key.toLowerCase()==='k')){event.preventDefault();openCommand();}
        else if(!typing&&!event.ctrlKey&&!event.metaKey&&!event.altKey&&(event.code==='KeyN'||event.key.toLowerCase()==='n')){event.preventDefault();openTask();}
        else if(!typing&&event.code==='Space'&&!event.target.closest('button')){if(activeView==='focus'){event.preventDefault();toggleTimer();}else if(activeView==='faith'&&faithTab==='tasbih'){event.preventDefault();incrementTasbih();}}
      });
      function restoreRoute(){const view=location.hash.slice(1);if(['today','tasks','focus','notes','faith','insights'].includes(view)&&view!==activeView)navigate(view,false);else if(!view&&activeView!=='today')navigate('today',false);}
      window.addEventListener('popstate',restoreRoute);window.addEventListener('hashchange',restoreRoute);
      document.addEventListener('visibilitychange',()=>{tick();if(document.hidden){clearTimeout(noteSaveTimeout);saveState();}else{renderDate();renderPrayers();}});
      window.addEventListener('pagehide',()=>{clearTimeout(noteSaveTimeout);saveState();setAmbient('off');$('#quran-audio').pause();stopCompass();});
      surahData.forEach(surah=>$('#surah-jump').add(new Option(`${surah.number} · ${surah.name}`,String(surah.number))));
      cities.filter(city=>city.id!=='custom').forEach(city=>$('#prayer-city').add(new Option(city.name,city.id)));
      $('#prayer-city').add(new Option('موقعي الحالي','custom'));
      $('#ambient-volume').value=state.ambientVolume;
      renderAll();navigate(location.hash.slice(1)||'today',false);saveState();tick();
      setInterval(tick,250);
      setInterval(()=>{updatePrayerCountdown();checkReminders();resetDailyFaith();if(activeView==='faith'&&faithTab==='overview')renderFaithOverview();},1000);
      setInterval(()=>{renderPrayers();if(activeView==='insights')renderInsights();},60000);
      const finishStartup=()=>{renderPrayers();renderQibla();updateQuranPack();restoreQuran();initPWA();refreshStorage();if(activeView==='insights')renderInsights();};
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',finishStartup,{once:true});else finishStartup();
      if(loadNotice)setTimeout(()=>showToast(loadNotice),800);
    })();
  