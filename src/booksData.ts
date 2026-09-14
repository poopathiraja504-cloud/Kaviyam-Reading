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
    id: "silappatikaram",
    title: "Silappatikaram (சிலப்பதிகாரம்)",
    author: "Ilango Adigal (இளங்கோ அடிகள்)",
    description: "One of the Five Great Epics of Tamil Literature. The tragedy of Kovalan and Kannagi in ancient Puhar and Madurai, illustrating the inescapable power of virtue and justice.",
    coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400",
    genre: "Classic",
    rating: 5.0,
    ratingCount: 1420,
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
    id: "yavana-rani",
    title: "Yavana Rani (யவன ராணி)",
    author: "Sandilyan (சாண்டில்யன்)",
    description: "A thrilling maritime historical fiction novel set in ancient Puhar. Follow commander Karunagara Pallavan as he encounters Roman invaders and Queen Yavana Rani.",
    coverUrl: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=400",
    genre: "Adventure",
    rating: 4.9,
    ratingCount: 840,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "பூம்புகார் கடற்கரை (The Beach of Puhar)",
        content: `காவேரிபூம்புகாரின் மாலைப் பொழுதில் சோழர்களின் கப்பல் படையும் யவனர்களின் வருகையும்...\n\nThe sun was setting over Kaveripoompattinam, the grand harbor capital of the Cholas. Commander Karunagara Pallavan stood on the high stone pier, watching the massive Roman galley ships drop their iron anchors.`
      }
    ],
    reviews: []
  }
];
