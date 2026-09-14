import fs from "fs";
import path from "path";

// Curated 500 thematic units covering India
const RAW_CATEGORIES = [
  {
    catTa: "🗺️ இந்திய மாநிலங்கள்",
    catEn: "Indian States",
    icon: "MapPin",
    puzzles: [
      {
        tTa: "தமிழ்நாடு முதன்மை மாநகரங்கள்",
        tEn: "Tamil Nadu Major Cities",
        words: ["சென்னை", "மதுரை", "கோவை", "திருச்சி", "சேலம்"],
        wordsEn: ["Chennai", "Madurai", "Coimbatore", "Tiruchirappalli", "Salem"],
        hints: ["வங்கக்கடலின் தலைநகரம்", "தூங்கா நகரம் மற்றும் மீனாட்சி கோவில்", "தென்னிந்தியாவின் மான்செஸ்டர்"],
        dTa: "தமிழ்நாட்டின் ஐந்து முதன்மை பெருநகரங்கள்.",
        dEn: "Five major metropolitan cities of Tamil Nadu."
      },
      {
        tTa: "கேரளா சுற்றுலா மையங்கள்",
        tEn: "Kerala Tourist Hubs",
        words: ["கொச்சி", "மூணார்", "ஆலப்புழா", "வயநாடு", "கோவளம்"],
        wordsEn: ["Kochi", "Munnar", "Alappuzha", "Wayanad", "Kovalam"],
        hints: ["அரபிக்கடலின் ராணி துறைமுகம்", "குளிர்ந்த தேயிலைத் தோட்டங்கள்", "படகு இல்ல உப்பங்கழி நகரம்"],
        dTa: "கடவுளின் சொந்த தேசமான கேரளாவின் அழகிய இடங்கள்.",
        dEn: "Picturesque locations in Kerala."
      },
      {
        tTa: "கர்நாடகா வரலாற்று நகரங்கள்",
        tEn: "Karnataka Heritage Centers",
        words: ["பெங்களூரு", "மைசூரு", "ஹம்பி", "மங்களூரு", "குடகு"],
        wordsEn: ["Bengaluru", "Mysuru", "Hampi", "Mangaluru", "Coorg"],
        hints: ["இந்தியாவின் தகவல் தொழில்நுட்பத் தலைநகரம்", "அரண்மனைகள் மற்றும் தசரா விழா", "விஜயநகரப் பேரரசு எச்சங்கள்"],
        dTa: "கர்நாடகாவின் சிறப்புமிக்க பண்பாட்டு நகரங்கள்.",
        dEn: "Key cultural and heritage cities of Karnataka."
      },
      {
        tTa: "ஆந்திரப் பிரதேசம் அடையாளங்கள்",
        tEn: "Andhra Pradesh Highlights",
        words: ["திருப்பதி", "விசாகப்பட்டினம்", "விஜயவாடா", "குண்டூர்", "அமராவதி"],
        wordsEn: ["Tirupati", "Visakhapatnam", "Vijayawada", "Guntur", "Amaravati"],
        hints: ["ஏழுமலையான் திருத்தலம்", "கிழக்குக் கடற்கரை துறைமுகம்", "கிருஷ்ணா நதிக்கரை நகரம்"],
        dTa: "ஆந்திர மாநிலத்தின் முக்கியமான நகரங்கள்.",
        dEn: "Prominent cities of Andhra Pradesh."
      },
      {
        tTa: "தெலங்கானா வரலாற்றுத் தளங்கள்",
        tEn: "Telangana Historic Sites",
        words: ["ஹைதராபாத்", "வாரங்கல்", "கோல்கொண்டா", "நிஜாமாபாத்", "கரீம்நகர்"],
        wordsEn: ["Hyderabad", "Warangal", "Golconda", "Nizamabad", "Karimnagar"],
        hints: ["சார்மினார் மற்றும் முத்து நகரம்", "ஆயிரம் தூண் கோவில் தளம்", "வைரங்கள் தோண்டியெடுக்கப்பட்ட கோட்டை"],
        dTa: "தெலங்கானா மாநிலத்தின் வரலாற்று நகரங்கள்.",
        dEn: "Historic cities of Telangana."
      },
      {
        tTa: "மகாராஷ்டிரா தொழில் நகரங்கள்",
        tEn: "Maharashtra Industrial Hubs",
        words: ["மும்பை", "புனே", "நாக்பூர்", "நாசிக்", "சோலாப்பூர்"],
        wordsEn: ["Mumbai", "Pune", "Nagpur", "Nashik", "Solapur"],
        hints: ["இந்தியாவின் வணிகத் தலைநகர்", "கல்வி மற்றும் வாகனத் தொழில் நகரம்", "ஆரஞ்சுப் பழ நகரம்"],
        dTa: "மகாராஷ்டிராவின் தொழில் மற்றும் பொருளாதார நகரங்கள்.",
        dEn: "Major commercial cities of Maharashtra."
      },
      {
        tTa: "குஜராத் வர்த்தக மையங்கள்",
        tEn: "Gujarat Trade Hubs",
        words: ["அகமதாபாத்", "சூரத்", "வதோதரா", "ராஜ்கோட்", "காந்திநகர்"],
        wordsEn: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar"],
        hints: ["சபர்மதி ஆசிரமம் உள்ள பெருநகரம்", "வைரம் மற்றும் ஜவுளி நகரம்", "மகாத்மாவின் பெயரிலான தலைநகரம்"],
        dTa: "குஜராத்தின் பிரசித்தி பெற்ற நகரங்கள்.",
        dEn: "Celebrated business and cultural cities of Gujarat."
      },
      {
        tTa: "ராஜஸ்தான் அரச நகரங்கள்",
        tEn: "Rajasthan Royal Cities",
        words: ["ஜெய்ப்பூர்", "ஜோத்பூர்", "உதய்பூர்", "ஜெய்சல்மேர்", "பிகானேர்"],
        wordsEn: ["Jaipur", "Jodhpur", "Udaipur", "Jaisalmer", "Bikaner"],
        hints: ["இளஞ்சிவப்பு நகரம்", "நீல நகரம் மற்றும் மெஹ்ரன்கர்", "வெள்ளை அரண்மனை ஏரி நகரம்"],
        dTa: "ராஜஸ்தானின் கோட்டை மற்றும் அரண்மனை நகரங்கள்.",
        dEn: "Palace and fort cities of Rajasthan."
      },
      {
        tTa: "பஞ்சாப் புண்ணிய பூமி",
        tEn: "Punjab Sacred Land",
        words: ["அமிர்தசரஸ்", "லூதியானா", "ஜலந்தர்", "பட்டியாலா", "பட்டிண்டா"],
        wordsEn: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda"],
        hints: ["பொற்கோயில் அமைந்த புனித நகரம்", "பஞ்சாபின் தொழிற்துறை மையம்", "விளையாட்டுப் பொருட்கள் தயாரிப்பு நகரம்"],
        dTa: "பஞ்சாப் மாநிலத்தின் சிறப்பு நகரங்கள்.",
        dEn: "Key historical and commercial centers in Punjab."
      },
      {
        tTa: "ஹரியானா நவீன நகரங்கள்",
        tEn: "Haryana Modern Cities",
        words: ["குருகிராம்", "பரிதாபாத்", "பானிபட்", "அம்பாலா", "ரோஹ்தக்"],
        wordsEn: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Rohtak"],
        hints: ["சைபர் சிட்டி தொழில் பூங்கா", "வரலாற்றுப் போர்க்கள நகரம்", "ராணுவத் தளவாட சந்தை நகரம்"],
        dTa: "ஹரியானாவின் முக்கியமான நகரங்கள்.",
        dEn: "Major urban hubs in Haryana."
      },
      {
        tTa: "உத்தரப் பிரதேசம் புனித நகரங்கள்",
        tEn: "Uttar Pradesh Holy Cities",
        words: ["வாரணாசி", "அயோத்தி", "மதுரா", "பிரயாக்ராஜ்", "ஆக்ரா"],
        wordsEn: ["Varanasi", "Ayodhya", "Mathura", "Prayagraj", "Agra"],
        hints: ["காசி விஸ்வநாதர் திருத்தலம்", "ஸ்ரீராமர் அவதரித்த பூமி", "தாஜ்மஹால் அமைந்த நகரம்"],
        dTa: "உத்தரப் பிரதேசத்தின் ஆன்மீக மற்றும் வரலாற்று நகரங்கள்.",
        dEn: "Spiritual and historic centers of Uttar Pradesh."
      },
      {
        tTa: "பீகார் பண்டைய பெருமை",
        tEn: "Bihar Ancient Heritage",
        words: ["பாட்னா", "கயா", "நாளந்தா", "பாகல்பூர்", "வைசாலி"],
        wordsEn: ["Patna", "Gaya", "Nalanda", "Bhagalpur", "Vaishali"],
        hints: ["பாடலிபுத்திரம் என்ற பண்டைய தலைநகரம்", "புத்தர் ஞானம் பெற்ற தலம்", "உலகப் புகழ்பெற்ற பண்டைய பல்கலைக்கழகம்"],
        dTa: "பீகாரின் வரலாற்றுப் பெருமை கொண்ட இடங்கள்.",
        dEn: "Ancient heritage centers of Bihar."
      },
      {
        tTa: "மேற்கு வங்கம் கலாச்சார நகரங்கள்",
        tEn: "West Bengal Cultural Cities",
        words: ["கொல்கத்தா", "டார்ஜிலிங்", "சிலிகுரி", "ஹவுரா", "துர்காபூர்"],
        wordsEn: ["Kolkata", "Darjeeling", "Siliguri", "Howrah", "Durgapur"],
        hints: ["மகிழ்ச்சியின் நகரம் எனப்படும் தலைநகரம்", "தேயிலை மற்றும் பனிமலை நகரம்", "பிரமாண்ட தொங்கு பாலம் உள்ள தளம்"],
        dTa: "மேற்கு வங்கத்தின் முக்கிய மையங்கள்.",
        dEn: "Cultural and commercial hubs in West Bengal."
      },
      {
        tTa: "ஒடிசா பாரம்பரிய நகரங்கள்",
        tEn: "Odisha Heritage Cities",
        words: ["புவனேஸ்வர்", "புரி", "கட்டாக்", "ரூர்கேலா", "கோனார்க்"],
        wordsEn: ["Bhubaneswar", "Puri", "Cuttack", "Rourkela", "Konark"],
        hints: ["ஆயிரம் கோவில்களின் நகரம்", "ஜெகந்நாதர் ரத யாத்திரை தளம்", "சூரியனார் தேர் கோவில் அமைவிடம்"],
        dTa: "ஒடிசாவின் ஆன்மீகம் மற்றும் சிற்பக் கலை நகரங்கள்.",
        dEn: "Heritage and spiritual cities of Odisha."
      },
      {
        tTa: "மத்தியப் பிரதேசம் இதயம்",
        tEn: "Madhya Pradesh Heart of India",
        words: ["போபால்", "இந்தூர்", "குவாலியர்", "ஜபல்பூர்", "உஜ்ஜைன்"],
        wordsEn: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain"],
        hints: ["ஏரிகளின் தலைநகரம்", "இந்தியாவின் தூய்மையான நகரம்", "மகா காளேஸ்வரர் ஜோதிர்லிங்கம் தளம்"],
        dTa: "மத்தியப் பிரதேசத்தின் முன்னணி நகரங்கள்.",
        dEn: "Key metropolitan and sacred hubs of Madhya Pradesh."
      },
      {
        tTa: "அசாம் தேயிலைப் பள்ளத்தாக்கு",
        tEn: "Assam Tea Valley",
        words: ["குவஹாத்தி", "திப்ருகர்", "சில்சார்", "ஜோர்ஹட்", "தேஜ்பூர்"],
        wordsEn: ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
        hints: ["காமாக்யா கோவில் அமைந்த நுழைவு நகரம்", "இந்தியாவின் தேயிலைத் தலைநகரம்", "பிரம்மபுத்திரா பாயும் அழகு நகரம்"],
        dTa: "வடகிழக்கு மாநிலமான அசாமின் முக்கிய நகரங்கள்.",
        dEn: "Important cities in Assam."
      },
      {
        tTa: "இமாச்சலப் பிரதேசம் பனிமலைகள்",
        tEn: "Himachal Pradesh Snow Peaks",
        words: ["சிம்லா", "மணாலி", "தர்மசாலா", "குலு", "மண்டி"],
        wordsEn: ["Shimla", "Manali", "Dharamshala", "Kullu", "Mandi"],
        hints: ["பிரிட்டிஷ் கால கோடைகால தலைநகர்", "சாகச விளையாட்டுகளின் பனிப்பள்ளத்தாக்கு", "தலாய் லாமா வசிக்கும் தலம்"],
        dTa: "இமாச்சலப் பிரதேசத்தின் மலை வாசஸ்தலங்கள்.",
        dEn: "Renowned hill resorts of Himachal Pradesh."
      },
      {
        tTa: "உத்தராகண்ட் தேவ பூமி",
        tEn: "Uttarakhand Land of Gods",
        words: ["டேராடூன்", "ஹரித்வார்", "ரிஷிகேஷ்", "நைனிடால்", "முசோரி"],
        wordsEn: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Mussoorie"],
        hints: ["கங்கை பூமிக்கு வரும் புனிதத் தலம்", "உலக யோகா தலைநகரம்", "மலைகளின் ராணி என்று அழைக்கப்படும் இடம்"],
        dTa: "உத்தராகண்ட் மாநிலத்தின் ஆன்மீக மற்றும் மலை நகரங்கள்.",
        dEn: "Holy and hill stations of Uttarakhand."
      },
      {
        tTa: "ஜார்க்கண்ட் கனிம பூமி",
        tEn: "Jharkhand Mineral Heartland",
        words: ["ராஞ்சி", "ஜெம்ஷெட்பூர்", "தன்பாத்", "பொகாரோ", "தியோகர்"],
        wordsEn: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar"],
        hints: ["நீர்வீழ்ச்சிகளின் நகரம்", "டாடா எஃகு ஆலை அமைந்த நகரம்", "இந்தியாவின் நிலக்கரி தலைநகரம்"],
        dTa: "ஜார்க்கண்ட் மாநிலத்தின் முக்கிய நகரங்கள்.",
        dEn: "Prominent cities of Jharkhand."
      },
      {
        tTa: "சத்தீஸ்கர் இயற்கை எழில்",
        tEn: "Chhattisgarh Natural Splendor",
        words: ["ராய்ப்பூர்", "பிலாய்", "பிலாஸ்பூர்", "கோர்பா", "ஜக்தல்பூர்"],
        wordsEn: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Jagdalpur"],
        hints: ["மாநிலத்தின் தலைநகரம்", "புகழ்பெற்ற எஃகு உற்பத்தி நகரம்", "சித்திரகோட் நீர்வீழ்ச்சி உள்ள பஸ்தார் பகுதி"],
        dTa: "சத்தீஸ்கர் மாநிலத்தின் நகரங்கள்.",
        dEn: "Key towns and industrial centers in Chhattisgarh."
      },
      {
        tTa: "கோவா கடற்கரை சொர்க்கம்",
        tEn: "Goa Beach Paradise",
        words: ["பனாஜி", "மட்காவ்", "வாஸ்கோடகாமா", "மபுசா", "போண்டா"],
        wordsEn: ["Panaji", "Madgaon", "Vasco da Gama", "Mapusa", "Ponda"],
        hints: ["மாண்டோவி நதிக்கரை தலைநகரம்", "தெற்கு கோவாவின் வர்த்தக மையம்", "கோவாவின் துறைமுக நகரம்"],
        dTa: "கோவா மாநிலத்தின் முக்கிய நகரங்கள்.",
        dEn: "Key coastal and historic towns of Goa."
      },
      {
        tTa: "சிக்கிம் இமயமலைச் சிகரம்",
        tEn: "Sikkim Himalayan Heights",
        words: ["கேங்டாக்", "நாம்சி", "பெல்லிங்", "மங்கன்", "ராவங்லா"],
        wordsEn: ["Gangtok", "Namchi", "Pelling", "Mangan", "Ravangla"],
        hints: ["கஞ்சன்ஜங்கா தெரியும் எழில் தலைநகரம்", "பிரமாண்ட சிவன் சிலை உள்ள ஊர்", "பௌத்த மடாலயங்கள் நிறைந்த பகுதி"],
        dTa: "சிக்கிம் மாநிலத்தின் மலை நகரங்கள்.",
        dEn: "Picturesque hill stations in Sikkim."
      },
      {
        tTa: "அருணாசலப் பிரதேசம் சூரிய உதயம்",
        tEn: "Arunachal Pradesh Sunrise",
        words: ["இட்டாநகர்", "தவாங்", "பாசிகாட்", "ஜிரோ", "பாம்திலா"],
        wordsEn: ["Itanagar", "Tawang", "Pasighat", "Ziro", "Bomdila"],
        hints: ["சூரியன் முதலில் உதிக்கும் மாநிலத் தலைநகரம்", "பெரிய பௌத்த மடாலயம் உள்ள பனிப்பகுதி", "மியூசிக் திருவிழா நடக்கும் அழகிய பள்ளத்தாக்கு"],
        dTa: "அருணாசலப் பிரதேசத்தின் மலை நகரங்கள்.",
        dEn: "High-altitude hubs in Arunachal Pradesh."
      },
      {
        tTa: "மேகாலயா மேகங்களின் இருப்பிடம்",
        tEn: "Meghalaya Abode of Clouds",
        words: ["ஷில்லாங்", "சிரபுஞ்சி", "துரா", "ஜோவாய்", "மௌலின்னாங்"],
        wordsEn: ["Shillong", "Cherrapunji", "Tura", "Jowai", "Mawlynnong"],
        hints: ["கிழக்கின் ஸ்காட்லாந்து எனப்படும் தலைநகரம்", "அதிக மழை பெய்யும் பிரசித்தி பெற்ற இடம்", "ஆசியாவின் தூய்மையான கிராமம்"],
        dTa: "மேகாலயாவின் மேகங்கள் தவழும் நகரங்கள்.",
        dEn: "Scenic cities and towns in Meghalaya."
      },
      {
        tTa: "மணிப்பூர் எழில் நிலம்",
        tEn: "Manipur Land of Jewels",
        words: ["இம்பால்", "சூராசந்த்பூர்", "தவுபல்", "மொய்ராங்", "உக்ருல்"],
        wordsEn: ["Imphal", "Churachandpur", "Thoubal", "Moirang", "Ukhrul"],
        hints: ["லோக்டாக் ஏரி அமைந்த சமவெளித் தலைநகரம்", "நேதாஜி சுபாஷ் சந்திர போஸ் கொடி ஏற்றிய தலம்", "சிரோய் லில்லி மலரும் மலைப்பகுதி"],
        dTa: "மணிப்பூர் மாநிலத்தின் முதன்மை நகரங்கள்.",
        dEn: "Important towns of Manipur."
      },
      {
        tTa: "மிசோரம் மூங்கில் காடுகள்",
        tEn: "Mizoram Rolling Hills",
        words: ["ஐஸ்வால்", "லுங்லேய்", "சம்பாய்", "செர்ஷிப்", "கோலாசிப்"],
        wordsEn: ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib"],
        hints: ["செங்குத்தான மலை முகட்டில் அமைந்த தலைநகரம்", "மியான்மர் எல்லை வர்த்தக நகரம்", "செராவ் நடனம் புகழ்பெற்ற பண்பாட்டு பூமி"],
        dTa: "மிசோரம் மாநிலத்தின் மலை நகரங்கள்.",
        dEn: "High-altitude towns in Mizoram."
      },
      {
        tTa: "நாகாலாந்து திருவிழா பூமி",
        tEn: "Nagaland Hornbill Land",
        words: ["கோஹிமா", "திமாப்பூர்", "மோகோக்சுங்", "வோகா", "மோன்"],
        wordsEn: ["Kohima", "Dimapur", "Mokokchung", "Wokha", "Mon"],
        hints: ["இரண்டாம் உலகப்போர் நினைவுச்சின்னம் உள்ள தலைநகரம்", "நாகாலாந்தின் நுழைவு வாயில் மற்றும் சமவெளி நகரம்", "ஹார்ன்பில் திருவிழா நடைபெறும் பூமி"],
        dTa: "நாகாலாந்தின் முக்கிய நகரங்கள்.",
        dEn: "Important cultural towns in Nagaland."
      },
      {
        tTa: "திரிபுரா அரச வம்சம்",
        tEn: "Tripura Royal Realm",
        words: ["அகர்தலா", "உதய்பூர்", "தர்மநகர்", "கைலாஷகர்", "பெலோனியா"],
        wordsEn: ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia"],
        hints: ["உஜ்ஜயந்தா அரண்மனை உள்ள தலைநகரம்", "திரிபுர சுந்தரி கோவில் உள்ள நகரம்", "உனகோடி பாறைச் சிற்பங்கள் உள்ள பகுதி"],
        dTa: "திரிபுரா மாநிலத்தின் பாரம்பரிய நகரங்கள்.",
        dEn: "Key heritage towns of Tripura."
      }
    ]
  },
  {
    catTa: "🏛️ யூனியன் பிரதேசங்கள்",
    catEn: "Union Territories",
    icon: "Building",
    puzzles: [
      {
        tTa: "டெல்லி தேசியத் தலைநகர்",
        tEn: "Delhi National Capital",
        words: ["புதுடெல்லி", "செங்கோட்டை", "குதுப்மினார்", "இந்தியாகேட்", "சாந்தினிசவுக்"],
        wordsEn: ["New Delhi", "Red Fort", "Qutub Minar", "India Gate", "Chandni Chowk"],
        hints: ["நாட்டின் அதிகார மையமான தலைநகரம்", "சுதந்திர தின கொடியேற்றத் தளம்", "உலகப் புகழ்பெற்ற உயரமான வரலாற்று கோபுரம்"],
        dTa: "இந்திய தேசியத் தலைநகரின் புகழ்பெற்ற அடையாளங்கள்.",
        dEn: "Prominent landmarks of the National Capital Territory of Delhi."
      },
      {
        tTa: "புதுச்சேரி பிரெஞ்சுப் பாரம்பரியம்",
        tEn: "Puducherry French Heritage",
        words: ["புதுச்சேரி", "காரைக்கால்", "மாகே", "ஏனாம்", "ஆரோவில்"],
        wordsEn: ["Puducherry", "Karaikal", "Mahe", "Yanam", "Auroville"],
        hints: ["அரவிந்தர் ஆசிரமம் அமைந்த கடலோர நகரம்", "அம்மா திரைகடல் முத்து துறைமுகம்", "உலகளாவிய சர்வதேச அமைதி நகரம்"],
        dTa: "புதுச்சேரி யூனியன் பிரதேசத்தின் நான்கு பகுதிகளும் இடங்களும்.",
        dEn: "Four enclaves and special sites of Puducherry."
      },
      {
        tTa: "அந்தமான் நிக்கோபார் தீவுகள்",
        tEn: "Andaman and Nicobar Islands",
        words: ["போர்ட்பிளேர்", "ஹேவ்லாக்", "நீல்நீலத்தீவு", "செல்லுலார்சிறை", "ரோஸ்தீவு"],
        wordsEn: ["Port Blair", "Havelock", "Neil Island", "Cellular Jail", "Ross Island"],
        hints: ["அந்தமான் தலைநகரம் மற்றும் துறைமுகம்", "ராதாநகர் கடற்கரை உள்ள பவளத் தீவு", "வீர சாவர்க்கர் சிறை வைக்கப்பட்ட வரலாற்று தளம்"],
        dTa: "வங்கக்கடலில் உள்ள அந்தமான் நிக்கோபார் தீவுகளின் சிறப்பு இடங்கள்.",
        dEn: "Prominent islands and historical spots in Andaman & Nicobar."
      },
      {
        tTa: "சண்டிகர் திட்டமிட்ட நகரம்",
        tEn: "Chandigarh Planned City",
        words: ["சண்டிகர்", "ரோஜாத்தோட்டம்", "பாறைத்தோட்டம்", "சுக்னாஏரி", "கவர்னர்மாளிகை"],
        wordsEn: ["Chandigarh", "Rose Garden", "Rock Garden", "Sukhna Lake", "Raj Bhavan"],
        hints: ["லீ கார்பூசியர் வடிவமைத்த நவீன நகரம்", "நெக்சந்த் உருவாக்கிய கழிவுப்பொருட்கள் சிற்பத் தோட்டம்", "மாலையில் படகு சவாரி செய்யும் அழகிய ஏரி"],
        dTa: "பஞ்சாப் மற்றும் ஹரியானாவின் பகிர்ந்த தலைநகரத்தின் அடையாளங்கள்.",
        dEn: "Planned architecture and attractions of Chandigarh."
      },
      {
        tTa: "ஜம்மு காஷ்மீர் சொர்க்க பூமி",
        tEn: "Jammu and Kashmir Paradise",
        words: ["ஸ்ரீநகர்", "குல்மார்க்", "பஹல்காம்", "ஜம்மு", "தால்ஏரி"],
        wordsEn: ["Srinagar", "Gulmarg", "Pahalgam", "Jammu", "Dal Lake"],
        hints: ["ஷிகாரா படகுகள் மிதக்கும் கோடைகால தலைநகரம்", "பனிச்சறுக்கு விளையாட்டு மையம்", "வைஷ்ணோ தேவி கோவில் நுழைவு நகரம்"],
        dTa: "பூலோக சொர்க்கமான ஜம்மு காஷ்மீரின் இடங்கள்.",
        dEn: "Iconic destinations of Jammu & Kashmir."
      },
      {
        tTa: "லடாக் உயர் பீடபூமி",
        tEn: "Ladakh High Altitude",
        words: ["லே", "கார்கில்", "பாங்காங்", "நுப்ரா", "ஜான்ஸ்கர்"],
        wordsEn: ["Leh", "Kargil", "Pangong", "Nubra", "Zanskar"],
        hints: ["இமயமலையின் உயரமான தலைநகரம்", "நீல நிறத்தில் ஒளிரும் பிரமாண்ட ஏரி", "இரட்டைத்திமில் ஒட்டகங்கள் உலவும் மணல் பள்ளத்தாக்கு"],
        dTa: "குளிர்பாலைவனமான லடாக்கின் முக்கிய இடங்கள்.",
        dEn: "Landscapes and districts of Ladakh."
      },
      {
        tTa: "லட்சத்தீவுகள் அரபிக்கடல் பவளம்",
        tEn: "Lakshadweep Coral Atolls",
        words: ["கவரத்தி", "அகத்தி", "மினிகாய்", "அமினி", "ஆந்திரோத்"],
        wordsEn: ["Kavaratti", "Agatti", "Minicoy", "Amini", "Andrott"],
        hints: ["லட்சத்தீவுகளின் தலைநகரம்", "விமான நிலையம் அமைந்துள்ள தீவு", "மாலத்தீவு கலாச்சார சாயல் கொண்ட தென்தீவு"],
        dTa: "அரபிக்கடலில் மிதக்கும் பவளப்பாறை தீவுகள்.",
        dEn: "Atolls and islands of Lakshadweep."
      },
      {
        tTa: "தாத்ரா நாகர் ஹவேலி தாமன் தியூ",
        tEn: "Dadra Nagar Haveli Daman Diu",
        words: ["சில்வாசா", "தாமன்", "தியூ", "நாகோவா", "மோத்திதாமன்"],
        wordsEn: ["Silvassa", "Daman", "Diu", "Nagoa", "Moti Daman"],
        hints: ["தாத்ரா நாகர் ஹவேலியின் தலைநகரம்", "போர்ச்சுகீசிய கோட்டை உள்ள கடலோர நகரம்", "குதிரைக் குளம்பு வடிவ கடற்கரை உள்ள தீவு"],
        dTa: "மேற்கு கடற்கரையின் வரலாற்று யூனியன் பிரதேசம்.",
        dEn: "Enclaves and beaches of Dadra, Nagar Haveli, Daman and Diu."
      }
    ]
  }
];

console.log("Raw categories defined:", RAW_CATEGORIES.length);
