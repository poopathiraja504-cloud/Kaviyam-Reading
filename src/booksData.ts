import { Book } from "./types";

export const PRESET_BOOKS: Book[] = [
  {
    id: "ponniyin-selvan",
    title: "Ponniyin Selvan (பொன்னியின் செல்வன்)",
    author: "Kalki Krishnamurthy (கல்கி)",
    description: "The legendary historical fiction masterpiece about the early life of Prince Arulmozhivarman (Rajaraja Chola I). Ride with Vandiyathevan along the banks of the vast Veeranarayana lake on a golden Aadi Perukku evening as he embarks on a dangerous imperial mission.",
    coverUrl: "https://images.unsplash.com/photo-1608659597669-b45511779f93?auto=format&fit=crop&q=80&w=400",
    genre: "Adventure",
    rating: 5.0,
    ratingCount: 1250,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "ஆடிப் பெருக்கு (The Golden Floods of Aadi)",
        content: `ஆதித்த கரிகாலரின் ஓலை தாங்கி வந்தியத்தேவன் வீரநாராயண ஏரிக்கரையில் குதிரை ஏறிச் செல்லும் அழகிய மாலைப் பொழுது...\n\nIt was late in the afternoon on the day of Aadi Perukku. The golden sun was beginning to dip in the western sky as Vallavarayan Vandiyathevan rode his weary horse along the high banks of the vast Veeranarayana Lake. Built by the valorous Chola kings, the lake stretched like an inland sea, its waters rippling with the golden rays of the setting sun.\n\nVandiyathevan was on an urgent, top-secret mission for the Crown Prince Aditya Karikalan. In his silk pouch lay two scrolls of critical palm-leaf letters that could decide the fate of the entire Chola empire. As he gazed upon the beautiful blue waters of the lake, his heart swelled with pride and excitement.\n\nHundreds of sailboats hovered in the distance, and women from nearby villages were singing festive songs, pouring flowers and lamps into the swirling currents of the lake. Vandiyathevan patted his horse's mane and smiled. "Ride on, my friend," he whispered. "The throne of Tanjore is waiting, and we have many rivers to cross."`
      },
      {
        chapterNumber: 2,
        chapterTitle: "குடந்தை சோதிடர் (The Kudanthai Astrologer)",
        content: `வந்தியத்தேவன் குடந்தை நகரின் சோதிடரைச் சந்தித்து இளவரசர் அருண்மொழியின் ஜாதக ரகசியங்களைக் கேட்டறிதல்...\n\nHaving ridden through the night, Vandiyathevan arrived in the historic town of Kudanthai (Kumbakonam). Guided by whispers of imperial intrigue, he sought out the famous astrologer of the town, whose predictions were whispered to be incredibly accurate, almost prophetic.\n\n"Ah, young warrior from the Bana clan," the astrologer said, eyes glittering under the dim light of a sesame oil lamp. "Your path is strewn with both heavy laurels and sharp swords. Tell me, whose shadow do you cast? The rising sun of Kanchi, or the mysterious waves of Lanka?"\n\nVandiyathevan leaned forward, keeping his voice extremely low. "I cast no shadow but my own, master. But I seek to know if the great Prince of the Cholas, Arulmozhivarman, will return safely from the island of Ceylon."`
      }
    ],
    reviews: [
      {
        id: "r-ps-1",
        userId: "user-reader",
        username: "Evelyn Reed",
        userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
        rating: 5,
        comment: "This bilingual presentation is incredible! Reading the opening of Ponniyin Selvan with parallel translation is an absolute treat.",
        createdAt: "2026-07-08T06:22:00Z"
      }
    ]
  },
  {
    id: "sivagamiyin-sabatham",
    title: "Sivagamiyin Sabatham (சிவகாமி சபதம்)",
    author: "Kalki Krishnamurthy (கல்கி)",
    description: "An epic historical novel detailing the Seventh-Century Pallava Empire under Mahendravarman I and Narasimhavarman I, the great sculptor Aayanar, and his dancer daughter Sivagami.",
    coverUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400",
    genre: "Epic",
    rating: 4.9,
    ratingCount: 980,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "காஞ்சிபுரம் பரதநாட்டியம் (The Court of Kanchi)",
        content: `பல்லவ மன்னன் மகேந்திரவர்மனின் ஆட்சிக்காலத்தில் காஞ்சி நகரின் கலைப் பொலிவும் சிவகாமியின் பரதநாட்டிய நடன அரங்கமும்...\n\nThe grand court of Kanchipuram glistened with polished granite pillars and lotus carvings. Emperor Mahendravarman, a master of poetry, music, and painting, sat upon the golden lion throne. Beside him stood the young Prince Narasimhavarman, his eyes locked on the dancing stage.\n\nSivagami, daughter of the royal sculptor Aayanar, stepped onto the silk stage. As the mridangam resonated, her graceful movements transformed the royal court into a realm of divine beauty.`
      }
    ],
    reviews: []
  },
  {
    id: "parthiban-kanavu",
    title: "Parthiban Kanavu (பார்த்திபன் கனவு)",
    author: "Kalki Krishnamurthy (கல்கி)",
    description: "The inspiring story of Chola King Parthiban's dream for Chola independence from Pallava rule, carried forward by his brave son Vikraman and the mysterious sword-wielding monk.",
    coverUrl: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&q=80&w=400",
    genre: "Historical Fiction",
    rating: 4.8,
    ratingCount: 890,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "மன்னரின் கனவு (The King's Dream)",
        content: `சோழ மன்னன் பார்த்திபன் தன் தலைநகர் உறையூரில் வைத்து சோழ சாம்ராஜ்யத்தின் சுதந்தரக் கனவைக் காணுதல்...\n\nKing Parthiban stood upon the ramparts of Uraiyur, gazing out over the Kaveri river. Though paying tribute to the mighty Pallavas of Kanchi, his heart burned with the dream of a restored, independent Chola flag flying high across Tamilakam.`
      }
    ],
    reviews: []
  },
  {
    id: "kadal-pura",
    title: "Kadal Pura (கடல் புறா)",
    author: "Sandilyan (சாண்டில்யன்)",
    description: "An incredible three-part historical naval adventure featuring Prince Karunakara Tondaiman, the Chola navy, secret maps, ocean battles, and the legendary ship Kadal Pura.",
    coverUrl: "https://images.unsplash.com/photo-1509281373149-e957c6296406?auto=format&fit=crop&q=80&w=400",
    genre: "Naval Adventure",
    rating: 4.95,
    ratingCount: 1120,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "கடல் போர்க்கப்பல் (The Ocean Warship)",
        content: `வங்கக் கடலில் பாயும் சோழர்களின் கடல் புறா போர்க்கப்பலின் வீரப் பயணம்...\n\nThe majestic Chola warship Kadal Pura sliced through the blue waves of the Bay of Bengal with its immense sails hoisted against the trade winds. Commander Karunakara Tondaiman gripped the helm tightly.`
      }
    ],
    reviews: []
  },
  {
    id: "silappatikaram",
    title: "Silappatikaram (சிலப்பதிகாரம்)",
    author: "Ilango Adigal (இளங்கோ அடிகள்)",
    description: "One of the Five Great Epics of Tamil Literature. The tragedy of Kovalan and Kannagi in ancient Puhar and Madurai, illustrating the inescapable power of virtue and justice.",
    coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400",
    genre: "Classic",
    rating: 5.0,
    ratingCount: 1420,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "மங்கல வாழ்த்துப் பாடல் (Praise of Nature)",
        content: `திங்களைப் போற்றுதும் திங்களைப் போற்றுதும்\nஞாயிறு போற்றுதும் ஞாயிறு போற்றுதும்\nமாமழை போற்றுதும் மாமழை போற்றுதும்...\n\nPraise be to the Moon that showers cool moonlight over the earth! Praise be to the Sun that turns its golden chariot over the Meru mountains! Praise be to the Great Rain that nourishes all living beings on Tamil soil!`
      }
    ],
    reviews: []
  },
  {
    id: "thirukkural",
    title: "Thirukkural (திருக்குறள்)",
    author: "Thiruvalluvar (திருவள்ளுவர்)",
    description: "The universal Tamil code of ethics, life philosophy, wisdom, and love written in 1330 couplets divided into Aram (Virtue), Porul (Wealth), and Inbam (Love).",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
    genre: "Philosophy",
    rating: 5.0,
    ratingCount: 2100,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "அகர முதல (The Praise of God & Knowledge)",
        content: `அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.\n\nAs the letter 'A' is the first of all letters in speech, so is the Eternal Divine Lord the primary origin of the universe.\n\nகற்றதனால் ஆய பயனென்கொல் வாலறிவன்\nநற்றாள் தொழாஅர் எனின்.\n\nWhat is the true value of all learning, if one does not bow before the feet of Pure Supreme Wisdom?`
      }
    ],
    reviews: []
  },
  {
    id: "manimekalai",
    title: "Manimekalai (மணிமேகலை)",
    author: "Chithalai Chathanar (சீத்தலைச் சாத்தனார்)",
    description: "The profound Buddhist epic continuation of Silappatikaram. Follow Manimekalai, daughter of Kovalan and Madhavi, on her quest for truth, compassion, and the divine bowl Amudhasurabi.",
    coverUrl: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    genre: "Epic",
    rating: 4.85,
    ratingCount: 760,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "விழாவறை காதை (The Announcement of Festival)",
        content: `பூம்புகார் நகரில் இந்திர விழா அறிவிப்பும் மணிமேகலையின் துறவுப் பாதையும்...\n\nThe grand festival of Indra was proclaimed across ancient Puhar with beatings of bronze drums. Manimekalai, blossoming with ethereal youth and wisdom, renounced worldly pleasures to seek spiritual truth.`
      }
    ],
    reviews: []
  },
  {
    id: "yavana-rani",
    title: "Yavana Rani (யவன ராணி)",
    author: "Sandilyan (சாண்டில்யன்)",
    description: "A thrilling maritime historical fiction novel set in ancient Puhar. Follow commander Karunagara Pallavan as he encounters Roman invaders and Queen Yavana Rani.",
    coverUrl: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=400",
    genre: "Adventure",
    rating: 4.9,
    ratingCount: 840,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "பூம்புகார் கடற்கரை (The Beach of Puhar)",
        content: `காவேரிபூம்புகாரின் மாலைப் பொழுதில் சோழர்களின் கப்பல் படையும் யவனர்களின் வருகையும்...\n\nThe sun was setting over Kaveripoompattinam, the grand harbor capital of the Cholas. Commander Karunagara Pallavan stood on the high stone pier, watching the massive Roman galley ships drop their iron anchors.`
      }
    ],
    reviews: []
  },
  {
    id: "naaladiyar",
    title: "Naaladiyar (நாலடியார்)",
    author: "Jain Monks (சமண முனிவர்கள்)",
    description: "An ancient Tamil ethical poetic work of 400 four-line verses compiled by Jain monks. Renowned alongside Thirukkural as a pillar of practical morality and wisdom.",
    coverUrl: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=400",
    genre: "Ethics & Poetry",
    rating: 4.8,
    ratingCount: 620,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "செல்வ நிலையாமை (Impermanence of Wealth)",
        content: `அறுசுவை உண்டி அமைந்தாரும் மற்று\nமறுசிகை தின்பதும் ஆகும் - நெறிஅறிந்தும்\nதானம் தவறாதார்...\n\nEven those who feast on rich delicacies today may eat humble coarse grain tomorrow. Understanding the transience of wealth, one must practice righteous charity unconditionally.`
      }
    ],
    reviews: []
  },
  {
    id: "periya-puranam",
    title: "Periya Puranam (பெரிய புராணம்)",
    author: "Sekkizhar (சேக்கிழார்)",
    description: "The grand hagiography of the 63 Nayanmars (Saivite Saints) of South India. Celebrates devotion, sacrifice, poetry, and temple culture in medieval Tamilakam.",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    genre: "Devotional Classic",
    rating: 4.95,
    ratingCount: 1040,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "திருமலைச் சருக்கம் (The Glory of Mount Kailash)",
        content: `உலகெலாம் உணர்ந்து ஓதற்கரியவன்\nநிலவு உலாவிய நீர்மலி வேணியன்...\n\nHe who is beyond the comprehension of the whole universe, whose matted locks hold the crescent moon and the holy river... Sekkizhar begins the sacred puranam in praise of divine grace.`
      }
    ],
    reviews: []
  },
  {
    id: "kalingathu-parani",
    title: "Kalingathu Parani (கலிங்கத்துப் பரணி)",
    author: "Jayamkondar (ஜெயங்கொண்டார்)",
    description: "The masterwork of Tamil martial poetry celebrating the victory of Kulottunga Chola I and his commander Karunakara Tondaiman in the Kalinga war.",
    coverUrl: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=400",
    genre: "War Epic & Poetry",
    rating: 4.88,
    ratingCount: 710,
    pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    isPdf: true,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "கடைதிறப்பு (Opening of the Doors)",
        content: `சோழர்களின் வீரப் போர்ப் பயணமும் ஜெயங்கொண்டாரின் அழகிய கவிதை வரிகளும்...\n\nJayamkondar calls upon the maidens of the Chola realm to open their doors and listen to the song of victory of Karunakara Tondaiman over the Kalinga forces.`
      }
    ],
    reviews: []
  }
];

