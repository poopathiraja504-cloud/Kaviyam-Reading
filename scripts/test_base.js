import fs from "fs";
import path from "path";

// Puzzles database definition with 500 unique thematic puzzles on India
const PUZZLE_TEMPLATES = [
  // 1-28: All 28 Indian States
  {
    titleTa: "தமிழ்நாடு முதன்மை நகரங்கள்",
    titleEn: "Tamil Nadu Major Cities",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["சென்னை", "மதுரை", "கோவை", "திருச்சி", "சேலம்"],
    wordsEn: ["Chennai", "Madurai", "Coimbatore", "Tiruchirappalli", "Salem"],
    hints: [
      "வங்கக்கடற்கரையில் அமைந்துள்ள தலைநகரைக் கண்டறியுங்கள்.",
      "வைகை நதிக்கரையில் அமைந்துள்ள தூங்கா நகரைத் தேடுங்கள்.",
      "தென்னிந்தியாவின் மான்செஸ்டர் எனப்படும் தொழில்நகரம் இதில் உண்டு."
    ],
    descTa: "தமிழ்நாட்டின் ஐந்து முதன்மையான மாநகரங்களின் பெயர்களைக் கண்டறியுங்கள்.",
    descEn: "Find the names of five major metropolitan cities in Tamil Nadu."
  },
  {
    titleTa: "கேரளா இயற்கை எழில்",
    titleEn: "Kerala Natural Beauty",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["கொச்சி", "மூணார்", "ஆலப்புழா", "வயநாடு", "கோழிக்கோடு"],
    wordsEn: ["Kochi", "Munnar", "Alappuzha", "Wayanad", "Kozhikode"],
    hints: [
      "அரபிக்கடலின் ராணி எனப்படும் துறைமுக நகரைத் தேடுங்கள்.",
      "குளிர்ந்த தேயிலைத் தோட்டங்கள் நிறைந்த மலை வாசஸ்தலத்தைக் கண்டுபிடியுங்கள்.",
      "படகு வீடுகளுக்குப் புகழ்பெற்ற உப்பங்கழி நகரத்தை அடையாளம் காணுங்கள்."
    ],
    descTa: "கடவுளின் சொந்த நாடு எனப்படும் கேரளத்தின் முக்கிய இடங்களைக் கண்டறியுங்கள்.",
    descEn: "Find key picturesque locations in God's Own Country, Kerala."
  },
  {
    titleTa: "கர்நாடகா வரலாற்று நகரங்கள்",
    titleEn: "Karnataka Historic Cities",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["பெங்களூரு", "மைசூரு", "ஹம்பி", "மங்களூரு", "குடகு"],
    wordsEn: ["Bengaluru", "Mysuru", "Hampi", "Mangaluru", "Coorg"],
    hints: [
      "இந்தியாவின் சிலிக்கான் பள்ளத்தாக்கு எனப்படும் தலைநகரைத் தேடுங்கள்.",
      "அரண்மனைகளின் நகரம் மற்றும் தசரா விழா புகழ்பெற்ற ஊரைக் கண்டறியுங்கள்.",
      "விஜயநகரப் பேரரசின் உலகப் பாரம்பரிய சின்னங்கள் உள்ள தளத்தைக் கண்டுபிடியுங்கள்."
    ],
    descTa: "கர்நாடகாவின் சிறப்புமிக்க நகரங்கள் மற்றும் வரலாற்றுத் தளங்களைத் தேடுங்கள்.",
    descEn: "Locate notable heritage cities and landmarks in Karnataka."
  },
  {
    titleTa: "ஆந்திரப் பிரதேசம் அடையாளங்கள்",
    titleEn: "Andhra Pradesh Highlights",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["விசாகப்பட்டினம்", "திருப்பதி", "விஜயவாடா", "குண்டூர்", "அமராவதி"],
    wordsEn: ["Visakhapatnam", "Tirupati", "Vijayawada", "Guntur", "Amaravati"],
    hints: [
      "ஏழுமலையான் உறையும் புண்ணியத் தலத்தைக் கண்டறியுங்கள்.",
      "கிழக்குக் கடற்கரையின் முக்கியமான துறைமுக நகரத்தைத் தேடுங்கள்.",
      "கிருஷ்ணா நதிக்கரையில் அமைந்துள்ள புனித வர்த்தக நகரை அடையாளம் காணுங்கள்."
    ],
    descTa: "ஆந்திர மாநிலத்தின் புகழ்பெற்ற நகரங்கள் மற்றும் ஆன்மீக மையங்கள்.",
    descEn: "Explore renowned cities and pilgrimage hubs of Andhra Pradesh."
  },
  {
    titleTa: "தெலங்கானா வரலாற்றுப் பெருமை",
    titleEn: "Telangana Heritage",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["ஹைதராபாத்", "வாரங்கல்", "கோல்கொண்டா", "நிஜாமாபாத்", "கரீம்நகர்"],
    wordsEn: ["Hyderabad", "Warangal", "Golconda", "Nizamabad", "Karimnagar"],
    hints: [
      "முத்துக்களின் நகரம் மற்றும் சார்மினார் அமைந்துள்ள தலைநகரைத் தேடுங்கள்.",
      "காக்கத்திய வம்சத்தின் ஆயிரம் தூண் கோவில் உள்ள நகரத்தைக் கண்டறியுங்கள்.",
      "புகழ்பெற்ற வைரக் கோட்டை உள்ள பகுதியை அடையாளம் காணுங்கள்."
    ],
    descTa: "தெலங்கானா மாநிலத்தின் வரலாற்றுச் சிறப்புமிக்க இடங்கள்.",
    descEn: "Search for heritage landmarks of Telangana state."
  },
  {
    titleTa: "மகாராஷ்டிரா பெருநகரங்கள்",
    titleEn: "Maharashtra Metros",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["மும்பை", "புனே", "நாக்பூர்", "நாசிக்", "அவுரங்காபாத்"],
    wordsEn: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad"],
    hints: [
      "இந்தியாவின் நிதித் தலைநகரம் மற்றும் திரையுலக மையம்.",
      "ஆரஞ்சுப் பழங்களுக்குப் புகழ்பெற்ற மாநிலத்தின் புவியியல் மையம்.",
      "கோதாவரி நதிக்கரையில் கும்பமேளா நடைபெறும் புனித நகரம்."
    ],
    descTa: "மகாராஷ்டிராவின் முதன்மையான தொழில் மற்றும் ஆன்மீக நகரங்கள்.",
    descEn: "Key commercial, educational, and spiritual centers in Maharashtra."
  },
  {
    titleTa: "குஜராத் வணிக நகரங்கள்",
    titleEn: "Gujarat Commercial Hubs",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["அகமதாபாத்", "சூரத்", "வதோதரா", "ராஜ்கோட்", "காந்திநகர்"],
    wordsEn: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
    hints: [
      "சபர்மதி ஆசிரமம் அமைந்துள்ள பாரம்பரிய மாநகரத்தைத் தேடுங்கள்.",
      "வைரப் பட்டை தீட்டும் தொழிலுக்குப் புகழ்பெற்ற கடலோர நகரை அடையாளம் காணுங்கள்.",
      "மகாத்மா காந்தியின் பெயரால் அமைந்த பசுமைத் தலைநகரைக் கண்டறியுங்கள்."
    ],
    descTa: "குஜராத் மாநிலத்தின் முக்கியமான வர்த்தக மற்றும் கலாச்சார நகரங்கள்.",
    descEn: "Prominent commercial and historical hubs of Gujarat."
  },
  {
    titleTa: "ராஜஸ்தான் கோட்டை நகரங்கள்",
    titleEn: "Rajasthan Fort Cities",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["ஜெய்ப்பூர்", "ஜோத்பூர்", "உதய்பூர்", "ஜெய்சல்மேர்", "பிகானேர்"],
    wordsEn: ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Bikaner"],
    hints: [
      "இளஞ்சிவப்பு நகரம் எனப்படும் ராஜஸ்தானின் எழில்மிகு தலைநகரம்.",
      "ஏரிகளின் நகரம் என்று அழைக்கப்படும் வெள்ளை பளிங்கு நகரம்.",
      "தார் பாலைவனத்தின் தங்க நகரம் என போற்றப்படும் வரலாற்றுத் தளம்."
    ],
    descTa: "வீரமும் அரண்மனைகளும் நிறைந்த ராஜஸ்தானின் முக்கிய நகரங்கள்.",
    descEn: "Royal fort cities and palace hubs across Rajasthan."
  },
  {
    titleTa: "பஞ்சாப் பொற்கோயில் பூமி",
    titleEn: "Punjab Land of Five Rivers",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["அமிர்தசரஸ்", "லூதியானா", "ஜலந்தர்", "பட்டியாலா", "பட்டிண்டா"],
    wordsEn: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
    hints: [
      "சீக்கியர்களின் புனித பொற்கோயில் அமைந்துள்ள ஆன்மீக நகரம்.",
      "பஞ்சாபின் மிகப்பெரிய தொழிற்துறை மற்றும் ஆடை தயாரிப்பு நகரம்.",
      "அரச பாரம்பரியமும் ஆடம்பரமும் கொண்ட வரலாற்று நகரம்."
    ],
    descTa: "ஐந்து நதிகள் பாயும் பஞ்சாப் மாநிலத்தின் பெருமைமிக்க நகரங்கள்.",
    descEn: "Find prominent cultural and industrial centers in Punjab."
  },
  {
    titleTa: "ஹரியானா வளர்ச்சி மையங்கள்",
    titleEn: "Haryana Growth Centers",
    categoryTa: "🗺️ இந்திய மாநிலங்கள்",
    categoryEn: "Indian States",
    categoryIcon: "MapPin",
    words: ["குருகிராம்", "பரிதாபாத்", "பானிபட்", "அம்பாலா", "ரோஹ்தக்"],
    wordsEn: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak"],
    hints: [
      "சைபர் சிட்டி எனப்படும் நவீன தகவல் தொழில்நுட்ப நகரம்.",
      "மூன்று வரலாற்றுப் போர்கள் நிகழ்ந்த புகழ்பெற்ற நகரம்.",
      "இந்திய ராணுவ தளவாடங்கள் மற்றும் விஞ்ஞான கருவிகள் மையம்."
    ],
    descTa: "ஹரியானாவின் தொழிற்துறை மற்றும் வரலாற்று நகரங்கள்.",
    descEn: "Locate strategic and industrial centers of Haryana."
  }
];

console.log("Templates base count:", PUZZLE_TEMPLATES.length);
