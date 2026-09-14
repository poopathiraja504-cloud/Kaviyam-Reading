import fs from "fs";
import path from "path";

// Helper to check valid Tamil grapheme count
function splitTamilGraphemes(text) {
  if (!text) return [];
  const tamilRegex = /([\u0B85-\u0B94\u0B95-\u0BB9\u0BD0][\u0BBE-\u0BCD\u0BD7]*|.)/gu;
  const matches = text.trim().match(tamilRegex);
  return matches ? matches.filter(Boolean) : text.trim().split("");
}

// 500 curated, verified puzzle seed themes
const PUZZLE_DATA = [];

// Helper to push a puzzle cleanly
function addPuzzle(titleTa, titleEn, catTa, catEn, icon, words, wordsEn, hints, descTa, descEn) {
  const num = PUZZLE_DATA.length + 1;
  const id = `wf_${String(num).padStart(3, "0")}`;

  let difficulty = "Medium";
  if (num <= 100) difficulty = "Easy";
  else if (num <= 275) difficulty = "Medium";
  else if (num <= 425) difficulty = "Hard";
  else difficulty = "Expert";

  // Validate exactly 5 words
  if (words.length !== 5 || wordsEn.length !== 5) {
    throw new Error(`Puzzle ${num} must have exactly 5 words! Got ${words.length}`);
  }

  // Validate at least 3 hints
  if (hints.length < 3) {
    throw new Error(`Puzzle ${num} must have at least 3 hints! Got ${hints.length}`);
  }

  PUZZLE_DATA.push({
    id,
    number: num,
    titleTa,
    titleEn,
    categoryTa: catTa,
    categoryEn: catEn,
    categoryIcon: icon,
    difficulty,
    words,
    wordsEn,
    hints: hints.slice(0, 3),
    descriptionTa: descTa || `${titleTa} தொடர்பான 5 சொற்களைக் கட்டத்தில் கண்டறியுங்கள்.`,
    descriptionEn: descEn || `Find 5 hidden words related to ${titleEn} in the letter grid.`
  });
}

// Build 500 curated entries
// Part 1: All 28 Indian States & 8 Union Territories (1-36)
const statesAndUTs = [
  ["தமிழ்நாடு முதன்மை மாநகரங்கள்", "Tamil Nadu Major Cities", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["சென்னை", "மதுரை", "கோவை", "திருச்சி", "சேலம்"],
   ["Chennai", "Madurai", "Coimbatore", "Tiruchirappalli", "Salem"],
   ["வங்கக்கடலின் தலைநகரம்", "மீனாட்சி அம்மன் ஆலயம் உள்ள தூங்கா நகரம்", "தென்னிந்தியாவின் மான்செஸ்டர் தொழில்நகரம்"]],
  
  ["கேரளா சுற்றுலா மையங்கள்", "Kerala Tourist Hubs", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["கொச்சி", "மூணார்", "ஆலப்புழா", "வயநாடு", "கோவளம்"],
   ["Kochi", "Munnar", "Alappuzha", "Wayanad", "Kovalam"],
   ["அரபிக்கடலின் ராணி துறைமுகம்", "தேயிலைத் தோட்டங்கள் நிறைந்த மலை வாசஸ்தலம்", "படகு வீடுகளுக்குப் புகழ்பெற்ற உப்பங்கழி"]],

  ["கர்நாடகா வரலாற்று நகரங்கள்", "Karnataka Heritage Centers", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["பெங்களூரு", "மைசூரு", "ஹம்பி", "மங்களூரு", "குடகு"],
   ["Bengaluru", "Mysuru", "Hampi", "Mangaluru", "Coorg"],
   ["இந்தியாவின் சிலிக்கான் பள்ளத்தாக்கு", "அரண்மனைகள் மற்றும் தசரா திருவிழா நகரம்", "விஜயநகரப் பேரரசின் உலகப் பாரம்பரிய சின்னம்"]],

  ["ஆந்திரப் பிரதேசம் அடையாளங்கள்", "Andhra Pradesh Highlights", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["திருப்பதி", "விசாகப்பட்டினம்", "விஜயவாடா", "குண்டூர்", "அமராவதி"],
   ["Tirupati", "Visakhapatnam", "Vijayawada", "Guntur", "Amaravati"],
   ["ஏழுமலையான் திருத்தலம்", "கிழக்குக் கடற்கரை இயற்கை துறைமுகம்", "கிருஷ்ணா நதிக்கரை வர்த்தக மையம்"]],

  ["தெலங்கானா வரலாற்றுத் தளங்கள்", "Telangana Historic Sites", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["ஹைதராபாத்", "வாரங்கல்", "கோல்கொண்டா", "நிஜாமாபாத்", "கரீம்நகர்"],
   ["Hyderabad", "Warangal", "Golconda", "Nizamabad", "Karimnagar"],
   ["சார்மினார் மற்றும் பிரியாணி புகழ்பெற்ற தலைநகரம்", "ஆயிரம் தூண் கோவில் தளம்", "வைரங்கள் தோண்டியெடுக்கப்பட்ட கோட்டை"]],

  ["மகாராஷ்டிரா பெருநகரங்கள்", "Maharashtra Metros", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["மும்பை", "புனே", "நாக்பூர்", "நாசிக்", "சோலாப்பூர்"],
   ["Mumbai", "Pune", "Nagpur", "Nashik", "Solapur"],
   ["இந்தியாவின் நிதித் தலைநகரம்", "கல்வி மற்றும் வாகனத் தொழில் நகரம்", "ஆரஞ்சுப் பழ நகரம்"]],

  ["குஜராத் வர்த்தக மையங்கள்", "Gujarat Trade Hubs", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["அகமதாபாத்", "சூரத்", "வதோதரா", "ராஜ்கோட்", "காந்திநகர்"],
   ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
   ["சபர்மதி ஆசிரமம் உள்ள யுனெஸ்கோ பாரம்பரிய நகரம்", "வைரம் மற்றும் ஜவுளி நகரம்", "மகாத்மா காந்தியின் பெயரிலான தலைநகரம்"]],

  ["ராஜஸ்தான் அரச நகரங்கள்", "Rajasthan Royal Cities", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["ஜெய்ப்பூர்", "ஜோத்பூர்", "உதய்பூர்", "ஜெய்சல்மேர்", "பிகானேர்"],
   ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Bikaner"],
   ["இளஞ்சிவப்பு நகரம்", "நீல நகரம் மற்றும் மெஹ்ரன்கர் கோட்டை", "வெள்ளை ஏரி அரண்மனை நகரம்"]],

  ["பஞ்சாப் பொற்கோயில் பூமி", "Punjab Golden Land", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["அமிர்தசரஸ்", "லூதியானா", "ஜலந்தர்", "பட்டியாலா", "பட்டிண்டா"],
   ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
   ["சீக்கியர்களின் புனித பொற்கோயில் நகரம்", "பஞ்சாபின் தொழிற்துறை மையம்", "விளையாட்டுப் பொருட்கள் தயாரிப்பு மையம்"]],

  ["ஹரியானா வளர்ச்சி மையங்கள்", "Haryana Growth Centers", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["குருகிராம்", "பரிதாபாத்", "பானிபட்", "அம்பாலா", "ரோஹ்தக்"],
   ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak"],
   ["சைபர் சிட்டி தொழில் பூங்கா", "வரலாற்றுப் போர்க்கள நகரம்", "விஞ்ஞானக் கருவிகள் சந்தை நகரம்"]],

  ["உத்தரப் பிரதேசம் புனித தலங்கள்", "Uttar Pradesh Sacred Sites", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["வாரணாசி", "அயோத்தி", "மதுரா", "பிரயாக்ராஜ்", "ஆக்ரா"],
   ["Varanasi", "Ayodhya", "Mathura", "Prayagraj", "Agra"],
   ["காசி விஸ்வநாதர் திருத்தலம்", "ஸ்ரீராமர் அவதரித்த பூமி", "தாஜ்மஹால் அமைந்த நகரம்"]],

  ["பீகார் பண்டைய பெருமை", "Bihar Ancient Heritage", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["பாட்னா", "கயா", "நாளந்தா", "பாகல்பூர்", "வைசாலி"],
   ["Patna", "Gaya", "Nalanda", "Bhagalpur", "Vaishali"],
   ["பண்டைய பாடலிபுத்திரம் தலைநகரம்", "புத்தர் ஞானம் பெற்ற தலம்", "உலகப் புகழ்பெற்ற பண்டைய பல்கலைக்கழகம்"]],

  ["மேற்கு வங்கம் கலாச்சாரம்", "West Bengal Culture", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["கொல்கத்தா", "டார்ஜிலிங்", "சிலிகுரி", "ஹவுரா", "துர்காபூர்"],
   ["Kolkata", "Darjeeling", "Siliguri", "Howrah", "Durgapur"],
   ["மகிழ்ச்சியின் நகரம் எனப்படும் கலாச்சார தலைநகர்", "டார்ஜிலிங் தேயிலை மற்றும் பனிமலை நகரம்", "பிரமாண்ட தொங்கு பாலம் தளம்"]],

  ["ஒடிசா கலை நகரங்கள்", "Odisha Temple Cities", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["புவனேஸ்வர்", "புரி", "கட்டாக்", "ரூர்கேலா", "கோனார்க்"],
   ["Bhubaneswar", "Puri", "Cuttack", "Rourkela", "Konark"],
   ["ஆயிரம் கோவில்களின் நகரம்", "ஜெகந்நாதர் ரத யாத்திரை தளம்", "சூரியனார் தேர் கோவில் அமைவிடம்"]],

  ["மத்தியப் பிரதேசம் இதயம்", "Madhya Pradesh Heart of India", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["போபால்", "இந்தூர்", "குவாலியர்", "ஜபல்பூர்", "உஜ்ஜைன்"],
   ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
   ["ஏரிகளின் தலைநகரம்", "இந்தியாவின் தூய்மையான நகரம்", "மகா காளேஸ்வரர் ஜோதிர்லிங்கம்"]],

  ["அசாம் தேயிலைப் பள்ளத்தாக்கு", "Assam Tea Valleys", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["குவஹாத்தி", "திப்ருகர்", "சில்சார்", "ஜோர்ஹட்", "தேஜ்பூர்"],
   ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
   ["காமாக்யா கோவில் அமைந்த நுழைவு நகரம்", "இந்தியாவின் தேயிலைத் தலைநகரம்", "பிரம்மபுத்திரா பாயும் அழகு நகரம்"]],

  ["இமாச்சலப் பிரதேசம் பனிமலைகள்", "Himachal Pradesh Snow Peaks", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["சிம்லா", "மணாலி", "தர்மசாலா", "குலு", "மண்டி"],
   ["Shimla", "Manali", "Dharamshala", "Kullu", "Mandi"],
   ["பிரிட்டிஷ் கால கோடைகால தலைநகர்", "சாகச விளையாட்டுகளின் பனிப்பள்ளத்தாக்கு", "தலாய் லாமா வசிக்கும் தலம்"]],

  ["உத்தராகண்ட் தேவ பூமி", "Uttarakhand Land of Gods", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["டேராடூன்", "ஹரித்வார்", "ரிஷிகேஷ்", "நைனிடால்", "முசோரி"],
   ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie"],
   ["கங்கை சமவெளிக்கு வரும் புனிதத்தலம்", "உலக யோகா தலைநகரம்", "மலைகளின் ராணி என்று அழைக்கப்படும் இடம்"]],

  ["ஜார்க்கண்ட் கனிம வளம்", "Jharkhand Mineral Lands", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["ராஞ்சி", "ஜெம்ஷெட்பூர்", "தன்பாத்", "பொகாரோ", "தியோகர்"],
   ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
   ["நீர்வீழ்ச்சிகளின் நகரம்", "டாடா எஃகு ஆலை அமைந்த நகரம்", "இந்தியாவின் நிலக்கரி தலைநகரம்"]],

  ["சத்தீஸ்கர் இயற்கை வளம்", "Chhattisgarh Natural Splendor", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["ராய்ப்பூர்", "பிலாய்", "பிலாஸ்பூர்", "கோர்பா", "ஜக்தல்பூர்"],
   ["Raipur", "Bhilai", "Bilaspur", "Korba", "Jagdalpur"],
   ["சத்தீஸ்கர் மாநிலத் தலைநகரம்", "எஃகு உற்பத்தி நகரம்", "சித்திரகோட் நீர்வீழ்ச்சி உள்ள பஸ்தார் பகுதி"]],

  ["கோவா கடற்கரைகள்", "Goa Coastal Treasures", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["பனாஜி", "மட்காவ்", "வாஸ்கோ", "மபுசா", "போண்டா"],
   ["Panaji", "Madgaon", "Vasco", "Mapusa", "Ponda"],
   ["மாண்டோவி நதிக்கரை தலைநகரம்", "தெற்கு கோவாவின் வர்த்தக மையம்", "கோவாவின் துறைமுக நகரம்"]],

  ["சிக்கிம் பனிச்சிகரங்கள்", "Sikkim Snowy Heights", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["கேங்டாக்", "நாம்சி", "பெல்லிங்", "மங்கன்", "ராவங்லா"],
   ["Gangtok", "Namchi", "Pelling", "Mangan", "Ravangla"],
   ["கஞ்சன்ஜங்கா தெரியும் எழில் தலைநகரம்", "பிரமாண்ட சிவன் சிலை உள்ள ஊர்", "பௌத்த மடாலயங்கள் நிறைந்த பகுதி"]],

  ["அருணாசலப் பிரதேசம் உதயம்", "Arunachal Pradesh Sunrise", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["இட்டாநகர்", "தவாங்", "பாசிகாட்", "ஜிரோ", "பாம்திலா"],
   ["Itanagar", "Tawang", "Pasighat", "Ziro", "Bomdila"],
   ["சூரியன் முதலில் உதிக்கும் மாநிலத் தலைநகரம்", "பெரிய பௌத்த மடாலயம் உள்ள பனிப்பகுதி", "மியூசிக் திருவிழா நடக்கும் அழகிய பள்ளத்தாக்கு"]],

  ["மேகாலயா மேகவீடு", "Meghalaya Cloud Haven", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["ஷில்லாங்", "சிரபுஞ்சி", "துரா", "ஜோவாய்", "மௌலின்னாங்"],
   ["Shillong", "Cherrapunji", "Tura", "Jowai", "Mawlynnong"],
   ["கிழக்கின் ஸ்காட்லாந்து எனப்படும் தலைநகரம்", "அதிக மழை பெய்யும் பிரசித்தி பெற்ற இடம்", "ஆசியாவின் தூய்மையான கிராமம்"]],

  ["மணிப்பூர் ரத்தின பூமி", "Manipur Jewel Realm", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["இம்பால்", "சூராசந்த்பூர்", "தவுபல்", "மொய்ராங்", "உக்ருல்"],
   ["Imphal", "Churachandpur", "Thoubal", "Moirang", "Ukhrul"],
   ["லோக்டாக் ஏரி அமைந்த சமவெளித் தலைநகரம்", "நேதாஜி கொடி ஏற்றிய தலம்", "சிரோய் லில்லி மலரும் மலைப்பகுதி"]],

  ["மிசோரம் மலைத் தொடர்கள்", "Mizoram Green Hills", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["ஐஸ்வால்", "லுங்லேய்", "சம்பாய்", "செர்ஷிப்", "கோலாசிப்"],
   ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
   ["செங்குத்தான மலை முகட்டில் அமைந்த தலைநகரம்", "மியான்மர் எல்லை வர்த்தக நகரம்", "செராவ் மூங்கில் நடனம் புகழ்பெற்ற பண்பாட்டு பூமி"]],

  ["நாகாலாந்து திருவிழாக்கள்", "Nagaland Hornbill Land", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["கோஹிமா", "திமாப்பூர்", "மோகோக்சுங்", "வோகா", "மோன்"],
   ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Mon"],
   ["இரண்டாம் உலகப்போர் நினைவுச்சின்னம் உள்ள தலைநகரம்", "நாகாலாந்தின் நுழைவு வாயில்", "ஹார்ன்பில் திருவிழா நடைபெறும் பூமி"]],

  ["திரிபுரா பாரம்பரியம்", "Tripura Heritage Land", "🗺️ இந்திய மாநிலங்கள்", "Indian States", "MapPin",
   ["அகர்தலா", "உதய்பூர்", "தர்மநகர்", "கைலாஷகர்", "பெலோனியா"],
   ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
   ["உஜ்ஜயந்தா அரண்மனை உள்ள தலைநகரம்", "திரிபுர சுந்தரி கோவில் உள்ள நகரம்", "உனகோடி பாறைச் சிற்பங்கள் உள்ள பகுதி"]],

  // 29-36: 8 Union Territories
  ["டெல்லி தேசியத் தலைநகர்", "Delhi National Capital", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["புதுடெல்லி", "செங்கோட்டை", "குதுப்மினார்", "இந்தியாகேட்", "ராஜ்வீதி"],
   ["New Delhi", "Red Fort", "Qutub Minar", "India Gate", "Kartavya Path"],
   ["நாட்டின் அதிகார மையமான தலைநகரம்", "சுதந்திர தின கொடியேற்றத் தளம்", "உலகப் புகழ்பெற்ற வரலாற்று கோபுரம்"]],

  ["புதுச்சேரி கடற்கரை பூமி", "Puducherry Coastal Haven", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["புதுச்சேரி", "காரைக்கால்", "மாகே", "ஏனாம்", "ஆரோவில்"],
   ["Puducherry", "Karaikal", "Mahe", "Yanam", "Auroville"],
   ["அரவிந்தர் ஆசிரமம் அமைந்த பிரெஞ்சு நகரம்", "அம்மா திரைகடல் துறைமுகம்", "உலகளாவிய அமைதி நகரம்"]],

  ["அந்தமான் நிக்கோபார் தீவுகள்", "Andaman Nicobar Islands", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["போர்ட்பிளேர்", "ஹேவ்லாக்", "நீலத்தீவு", "செல்லுலார்சிறை", "ரோஸ்தீவு"],
   ["Port Blair", "Havelock", "Neil Island", "Cellular Jail", "Ross Island"],
   ["அந்தமான் தலைநகரம் மற்றும் துறைமுகம்", "ராதாநகர் கடற்கரை உள்ள பவளத் தீவு", "சுதந்திர போராட்ட வீரர்கள் அடைக்கப்பட்ட சிறை"]],

  ["சண்டிகர் பசுமை நகரம்", "Chandigarh Green Capital", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["சண்டிகர்", "ரோஜாத்தோட்டம்", "பாறைத்தோட்டம்", "சுக்னாஏரி", "கவர்னர்இல்லம்"],
   ["Chandigarh", "Rose Garden", "Rock Garden", "Sukhna Lake", "Raj Bhavan"],
   ["திட்டமிட்டு கட்டப்பட்ட மாதிரி நகரம்", "நெக்சந்த் உருவாக்கிய கழிவுப்பொருட்கள் சிற்பத் தோட்டம்", "மாலையில் படகு சவாரி செய்யும் ஏரி"]],

  ["ஜம்மு காஷ்மீர் பள்ளத்தாக்கு", "Jammu Kashmir Valley", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["ஸ்ரீநகர்", "குல்மார்க்", "பஹல்காம்", "ஜம்மு", "தால்ஏரி"],
   ["Srinagar", "Gulmarg", "Pahalgam", "Jammu", "Dal Lake"],
   ["ஷிகாரா படகுகள் மிதக்கும் கோடைகால தலைநகரம்", "பனிச்சறுக்கு விளையாட்டு மையம்", "கோவில்களின் நகரம் என அழைக்கப்படும் குளிர் கால தலைநகரம்"]],

  ["லடாக் இமயமலை பனிபூமி", "Ladakh High Plateau", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["லே", "கார்கில்", "பாங்காங்", "நுப்ரா", "ஜான்ஸ்கர்"],
   ["Leh", "Kargil", "Pangong", "Nubra", "Zanskar"],
   ["உயரமான பாலைவனத் தலைநகரம்", "நீல நிறத்தில் ஒளிரும் பிரமாண்ட ஏரி", "இரட்டைத்திமில் ஒட்டகங்கள் உலவும் பள்ளத்தாக்கு"]],

  ["லட்சத்தீவுகள் பவளத் தீவுகள்", "Lakshadweep Coral Reefs", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["கவரத்தி", "அகத்தி", "மினிகாய்", "அமினி", "ஆந்திரோத்"],
   ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott"],
   ["யூனியன் பிரதேச தலைநகரம்", "விமான நிலையம் அமைந்துள்ள அழகிய தீவு", "தெற்கில் அமைந்துள்ள தனித்துவ பண்பாட்டுத் தீவு"]],

  ["தாத்ரா தாமன் தியூ", "Dadra Daman Diu Enclaves", "🏛️ யூனியன் பிரதேசங்கள்", "Union Territories", "Building",
   ["சில்வாசா", "தாமன்", "தியூ", "நாகோவா", "மோத்திதாமன்"],
   ["Silvassa", "Daman", "Diu", "Nagoa", "Moti Daman"],
   ["சில்வாசா இயற்கை சூழல் தலைநகரம்", "போர்ச்சுகீசிய கோட்டை உள்ள கடலோர நகரம்", "குதிரைக் குளம்பு வடிவ கடற்கரை உள்ள தீவு"]]
];

for (const item of statesAndUTs) {
  addPuzzle(item[0], item[1], item[2], item[3], item[4], item[5], item[6], item[7]);
}

console.log("Built Initial states/UTs:", PUZZLE_DATA.length);
