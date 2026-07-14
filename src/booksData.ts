import { Book } from "./types";

export const PRESET_BOOKS: Book[] = [
  {
    id: "alchemists-shadow",
    title: "The Alchemist's Shadow",
    author: "Elena Vance",
    description: "In a medieval city of copper roofs, a rogue alchemist discovers an elixir that doesn't prolong life, but duplicates shadows—each with its own independent consciousness.",
    coverUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400",
    genre: "Fantasy",
    rating: 4.8,
    ratingCount: 342,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "The Copper Furnace",
        content: `Master Alchemist Kenneth did not look for gold; he looked for depth. Beneath the copper dome of his rooftop laboratory, surrounded by vials of lead oxide and spirits of ammonia, he watched his own shadow stretch across the white limestone wall. It was not a normal shadow. As the wind whistled through the narrow stone chimneys of Oakhaven, the shadow raised its hand—even though Kenneth’s hands remained firmly clasped behind his back.\n\n"You are learning quickly," Kenneth whispered, his voice dry as parchment. The shadow gave a slow, deliberate nod. This was the fifth day since he had swallowed the silver-tinted tincture, a solution he had boiled from crushed obsidian and the sap of the weeping elder. The shadow was no longer a mere reflection of light blocked. It had density. When Kenneth blew out the candles, the shadow did not vanish; it slid down the wall and stood quietly in the dark corner of the room, waiting.\n\nKenneth walked to the window. Below him, the street lanterns of the city flickered. Oakhaven was a city of secrets, but his was the darkest. If the Guild of Iron and Salt discovered what he had synthesized, they would brand his forehead with the symbol of the Heretic and cast him into the Salt Mines. He pulled his heavy wool coat tighter around his shoulders. "Tomorrow, we walk into the market," he told the shadow. "Let us see if they notice."`
      },
      {
        chapterNumber: 2,
        chapterTitle: "The Market of Mirrors",
        content: `The Morning Market was a sea of crimson canopies and loud merchant cries. Cloaked in gray linen, Kenneth walked slowly, keeping close to the brick facades of the bakeries. Beside him, his shadow behaved perfectly, mimicking his stride. But as he passed the stall of Master Varos, the mirror merchant, Kenneth felt a sudden cold tug at his heels.\n\nVaros’s stall was lined with hundreds of polished silver plates and heavy glass mirrors imported from the Western Isles. As Kenneth walked past, his shadow did not appear in the reflections. Instead, in the glass, Kenneth’s silhouette was completely empty—a brilliant, light-filled vacancy in the shape of a man. The shadow itself had stepped outside the frame of the mirrors entirely, remaining a dark, solid shape on the physical street behind him.\n\nVaros looked up, his eyes widening. "Master Kenneth?" he called out, squinting through his brass spectacles. "What is wrong with your glass? Your reflection... it has no darkness." Kenneth did not answer. He quickened his pace, his heart hammering against his ribs. Behind him, he could hear the rustle of his shadow sliding swiftly across the stone tiles, eager to keep up, but no longer willing to be contained.`
      }
    ],
    reviews: [
      {
        id: "r1",
        userId: "user-alex",
        username: "Alex Mercer",
        userPhoto: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100",
        rating: 5,
        comment: "This is a masterpiece of dark fantasy! The concept of independent shadows is beautifully written and eerie.",
        createdAt: "2026-06-28T14:30:00Z"
      },
      {
        id: "r2",
        userId: "user-sarah",
        username: "Sarah Jenkins",
        userPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100",
        rating: 4,
        comment: "Very atmospheric. I love Kenneth's mysterious nature, and the description of the copper roofs is so vivid.",
        createdAt: "2026-07-02T10:15:00Z"
      }
    ]
  },
  {
    id: "echoes-cosmos",
    title: "Echoes of the Cosmos",
    author: "Arthur Vance",
    description: "A deep-space surveyor intercepts a radio transmission from a planet that collapsed into a black hole eighty years ago, only to realize the voice speaking is his own.",
    coverUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=400",
    genre: "Sci-Fi",
    rating: 4.9,
    ratingCount: 512,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "The Empty Receiver",
        content: `The signal was a low, rhythmic hum, like a distant engine breathing through water. Inside the observation pod of the spacecraft *Aegis*, Dr. Julian Finch sat in near-total darkness, illuminated only by the pale blue glow of his frequency monitors. He was three million light-years from Earth, suspended in the silent void of the Kepler-186 quadrant.\n\n"Repeat," Julian spoke into his recorder, his voice raspy from eighteen months of solitude. "Intermittent signal detected at 1420 Megahertz. Source appears to be the remnants of the sector designated Theta-9." He stared at the display. Theta-9 was gone. It had collapsed into the Event Horizon of a hypermassive black hole in the summer of 2078. There should be nothing there but gravitational waves and dead radiation.\n\nBut as he ran the signal through the decrypter, the audio resolved. The noise cleared, and a voice emerged from the static. It was clear, slow, and carried a familiar cadence. Julian froze. The voice on the speaker was saying: "If anyone is listening, my coordinates are 12-A. The hull has breached, but the engines are still holding." Julian’s fingers trembled as he touched his neck. It was his own voice. The exact pitch, the subtle lisp, the hitch in breath between sentences. A voice recording he had never made, broadcasting from a dead planet inside a gravity well.`
      }
    ],
    reviews: [
      {
        id: "r3",
        userId: "user-kai",
        username: "Kai Chen",
        userPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100",
        rating: 5,
        comment: "Absolutely mind-bending sci-fi! The suspense from chapter 1 is incredible. I need more immediately!",
        createdAt: "2026-07-05T09:45:00Z"
      }
    ]
  },
  {
    id: "whispering-library",
    title: "The Whispering Library",
    author: "Clara Morrow",
    description: "An archivist in a coastal town discovers a hidden chamber of books that don't have titles, but instead whisper their contents aloud when touched by the blind.",
    coverUrl: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=400",
    genre: "Mystery",
    rating: 4.7,
    ratingCount: 198,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "The Blind Archivist",
        content: `The sea mist always found its way inside the stone arches of the St. Jude Archives. Beatrice adjusted her wool shawl and let her fingertips slide along the cold, leather-bound spines of the history section. She had lost her sight at age seven, but her hands knew every corner of this building better than the scholars who visited from the capital.\n\nToday, she was looking for a leak. She had heard a faint dripping sound near the north wall of the basement during last night's gale. But as she reached the damp corner, her hand brushed against a wooden panel that felt unusually warm. She pressed it. With a low, grinding groan, a section of the stone wall receded, revealing a narrow spiral staircase that smelled of dried lavender and ancient beeswax.\n\nTaking her cane, Beatrice descended slowly, counting twenty-four steps. At the bottom, the air was perfectly dry and silent. She reached out. Instead of the standard rough leather of the archives, her hand met shelves of books bound in a material that felt as soft and thin as human skin. When her index finger touched the cover of the first book, a soft, dry whisper brushed against her ear, like a dry leaf scraping across gravel. *'Her name was Madeline,'* the book whispered, its voice filled with a quiet, sorrowful warmth. *'And she died twice before she was ever born.'*`
      }
    ],
    reviews: []
  },
  {
    id: "ponniyin-selvan",
    title: "Ponniyin Selvan (பொன்னியின் செல்வன்)",
    author: "Kalki Krishnamurthy",
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
        content: `வந்தியத்தேவன் குடந்தை நகரின் சோதிடரைச் சந்தித்து இளவரசர் அருண்மொழியின் ஜாதக ரகசியங்களைக் கேட்டறிதல்...\n\nHaving ridden through the night, Vandiyathevan arrived in the historic town of Kudanthai (Kumbakonam). Guided by whispers of imperial intrigue, he sought out the famous astrologer of the town, whose predictions were whispered to be incredibly accurate, almost prophetic.\n\n"Ah, young warrior from the Bana clan," the astrologer said, eyes glittering under the dim light of a sesame oil lamp. "Your path is strewn with both heavy laurels and sharp swords. Tell me, whose shadow do you cast? The rising sun of Kanchi, or the mysterious waves of Lanka?"\n\nVandiyathevan leaned forward, keeping his voice extremely low. "I cast no shadow but my own, master. But I seek to know if the great Prince of the Cholas, Arulmozhivarman, will return safely from the island of Ceylon."\n\nThe astrologer cast his cowrie shells upon the wooden board. He closed his eyes, muttering ancient chants, then gasped. "The stars are in alignment! A crown awaits, yet dark clouds gather over the palace of Thanjavur..."`
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
    id: "yavana-rani",
    title: "Yavana Rani (யவன ராணி)",
    author: "Sandilyan",
    description: "A thrilling maritime historical fiction novel set in ancient Puhar. Follow the brilliant commander Karunagara Pallavan as he encounters Roman invaders, naval battles, and the mysterious Roman Queen Yavana Rani.",
    coverUrl: "https://images.unsplash.com/photo-1510519138101-570d1dca3d66?auto=format&fit=crop&q=80&w=400",
    genre: "Adventure",
    rating: 4.9,
    ratingCount: 840,
    chapters: [
      {
        chapterNumber: 1,
        chapterTitle: "பூம்புகார் கடற்கரை (The Beach of Puhar)",
        content: `காவேரிபூம்புகாரின் மாலைப் பொழுதில் சோழர்களின் கப்பல் படையும் யவனர்களின் வருகையும்...\n\nThe sun was setting over Kaveripoompattinam, the grand harbor capital of the Cholas. Commander Karunagara Pallavan stood on the high stone pier, watching the massive Roman galley ships drop their iron anchors. The white sails of the Yavana ships fluttered in the salty evening breeze.\n\nSuddenly, a cry went up from the harbor guards. A highly-decorated golden imperial carriage stepped down from the Roman ship's gangplank. Seated inside, shielded by silk curtains, was the legendary Roman Queen—Yavana Rani. Her eyes, blue as the distant Mediterranean sea, locked with Karunagara's as the carriage rolled onto Tamil shores, marking the beginning of an era of deep alliance and dangerous wars.\n\n"Who is she?" Karunagara asked his deputy, hand resting firmly on the hilt of his iron sword. "She comes not as a merchant, but as a ruler. Let us prepare our legions."`
      }
    ],
    reviews: []
  }
];
