import { useState, useEffect } from "react";

export type Language = "ta" | "en";

export const translations = {
  ta: {
    // Brand
    brandName: "Kaviyam-Reading",
    brandTagline: "தமிழ் இலக்கியத்தை வாசிப்போம், அறிவோம், அனுபவிப்போம்.",
    heroTitle: "தமிழ் இலக்கியத்தின் மொழி முத்துக்கள்",
    heroSubtitle: "சங்க காலம் முதல் நவீன காலம் வரை சிறந்த தமிழ் நாவல்கள், காவியங்கள் மற்றும் இலக்கியங்களை ஒரே இடத்தில் படியுங்கள்.",
    browseBooks: "புத்தகங்களை ஆராய்க",
    startReading: "இப்போது தொடங்குங்கள்",

    // Navigation
    navHome: "முகப்பு",
    navTamilLibrary: "தமிழ் நூலகம்",
    navCatalogLibrary: "கேட்டலாக் நூலகம்",
    navMyBooks: "எனது புத்தகங்கள்",
    navProgress: "வாசிப்பு முன்னேற்றம்",
    navAIFeatures: "AI அம்சங்கள்",
    navProfileSettings: "சுயவிவர அமைப்புகள்",
    navMailbox: "அஞ்சல் பெட்டி",
    navLocalDB: "உள்ளூர் தரவுத்தளம்",
    navHelpFAQ: "உதவி & கேள்விகள்",
    navAbout: "பற்றி",
    navBookmarks: "குறிப்புகள்",
    navFavorites: "விருப்பமானவை",
    navSettings: "அமைப்புகள்",
    navProfile: "சுயவிவரம்",
    navAdmin: "நிர்வாகக் குழு",
    signIn: "உள்நுழையுங்கள்",
    signOut: "வெளியேறு",
    createAccount: "பதிவு செய்க",
    welcomeBack: "உள்நுழையுங்கள்",

    // Header & Search
    searchPlaceholder: "தமிழ் புத்தகங்கள், நாவல்கள், ஆசிரியர்களை தேடுக...",
    notifications: "அறிவிப்புகள்",
    guestMode: "விருந்தினர்",

    // Tamil Library Sections
    tamilClassics: "தமிழ் செவ்வியல்",
    tamilNovels: "தமிழ் நாவல்கள்",
    historicalNovels: "வரலாற்று நாவல்கள்",
    romanticNovels: "காதல் நாவல்கள்",
    shortStories: "சிறுகதைகள்",
    literaryWorks: "இலக்கியப் படைப்புகள்",
    modernTamilLit: "நவீன தமிழ் இலக்கியம்",
    freeTamilBooks: "இலவச தமிழ் புத்தகங்கள்",
    rareAcademicBooks: "அரிய & ஆய்வுப் புத்தகங்கள்",

    // Archives & Resources
    onlineArchivesTitle: "முக்கிய இணைய காப்பகங்கள் & தரவுத்தளங்கள்",
    novelHubsTitle: "நவீன & காதல் நாவல் தளங்கள்",
    offlinePresetsTitle: "தனிப்பட்ட பதிவிறக்கங்கள் & உள்ளூர் புத்தகங்கள்",
    fetchNovelTitle: "நாவலைத் தேடிப் பெறுக (AI Ingest)",
    fetchPlaceholder: "தமிழ் செவ்வியல் அல்லது நவீன நாவலின் பெயரை உள்ளிடுக...",
    fetchBtn: "நாவலைப் பெறுக",
    visitArchive: "காப்பகத்தைப் பார்வையிடுக",
    openCommunity: "சமூகத்தில் இணைக",
    openLocalBook: "உள்ளூர் புத்தகத்தைத் திறக்க",

    // Feature Highlights
    feature1Title: "பெரிய இலக்கியத் தொகுப்பு",
    feature1Desc: "5000+ படைப்புகள்",
    feature2Title: "AI உதவி",
    feature2Desc: "ஸ்மார்ட் வாசிப்பு",
    feature3Title: "படிப்பு முன்னேற்றம்",
    feature3Desc: "முன்னேற்றத்தைக் கணக்கிடுக",
    feature4Title: "குரல் வாசிப்பு",
    feature4Desc: "ஒலிப் புத்தகம்",
    feature5Title: "மொழி மாற்றம்",
    feature5Desc: "தமிழ் & ஆங்கிலம்",

    // Auth Page
    welcomeSubtitle: "உங்கள் வாசிப்பு பயணத்தைத் தொடருங்கள்.",
    loginEmailTab: "மின்னஞ்சல்",
    loginMobileTab: "மொபைல்",
    emailLabel: "மின்னஞ்சல் முகவரி",
    emailPlaceholder: "உங்கள் மின்னஞ்சலை உள்ளிடுங்கள்",
    passwordLabel: "கடவுச்சொல்",
    passwordPlaceholder: "உங்கள் கடவுச்சொல்லை உள்ளிடுங்கள்",
    rememberMe: "என்னை நினைவில் கொள்",
    forgotPassword: "கடவுச்சொல் மறந்துவிட்டதா?",
    orDivider: "அல்லது",
    continueWithGoogle: "Google உடன் உள்நுழையுங்கள்",
    dontHaveAccount: "கணக்கு இல்லையா?",
    alreadyHaveAccount: "ஏற்கனவே கணக்கு உள்ளதா?",

    // Dashboard & Stats
    dashTitle: "முகப்பு",
    totalBooks: "புத்தகங்கள்",
    totalAuthors: "ஆசிரியர்கள்",
    readingTime: "படிப்பு நேரம்",
    totalSeries: "தொடர்கள்",
    thisWeek: "இந்த வாரம்",
    continueReading: "தொடர்ந்து படிக்க",
    viewAll: "அனைத்தையும் பார்க்க",
    readingActivity: "படிப்பு முன்னேற்றம்",
    genreDistribution: "வகை வாரியாக",

    // Library & Filters
    libraryTitle: "நூலகம்",
    allGenres: "அனைத்து வகைகள்",
    allAuthors: "அனைத்து ஆசிரியர்கள்",
    allEras: "அனைத்து காலங்கள்",
    sortRating: "மதிப்பீடு",
    sortPopular: "பிரபலமானவை",
    sortNewest: "புதியவை",
    readers: "வாசகர்கள்",
    chapters: "அத்தியாயங்கள்",
    rating: "மதிப்பீடு",
    addCustomBook: "புதிய புத்தகம் சேர்க்க",
    readNow: "இப்போது படிக்க",
    addToLibrary: "நூலகத்தில் சேர்",

    // Book Details
    aboutBook: "புத்தகம் பற்றி",
    chaptersList: "அத்தியாயங்கள்",
    reviews: "மதிப்பீடுகள்",
    relatedBooks: "தொடர்புடைய புத்தகங்கள்",
    addToMyBooks: "என் புத்தகங்களில் சேர்",
    inMyBooks: "என் புத்தகங்களில் உள்ளது",
    startReadingNow: "படிக்க தொடங்கு",

    // Reader Page
    chapter: "அத்தியாயம்",
    previousChapter: "முந்தைய அத்தியாயம்",
    nextChapter: "அடுத்த அத்தியாயம்",
    fontAdjust: "எழுத்து அளவு",
    themeLabel: "வண்ண தீம்",
    themeLight: "ஒளி",
    themeSepia: "இதழ்",
    themeDark: "இருள்",
    ttsAudio: "குரல் வாசிப்பு",
    ttsSpeed: "வேகம்",
    bookmark: "குறிப்பு",
    bookmarked: "குறிக்கப்பட்டது",
    readingProgress: "வாசிப்பு அளவு",

    // My Books
    currentlyReading: "தற்போது படிப்பவை",
    completed: "முடித்தவை",
    savedBooks: "சேமிக்கப்பட்டவை",
    lastRead: "கடைசியாக படித்தது",
    progress: "முன்னேற்றம்",

    // Progress Dashboard
    booksReadCount: "படித்த புத்தகங்கள்",
    chaptersCompletedCount: "முடித்த அத்தியாயங்கள்",
    totalReadingTimeHours: "மொத்த வாசிப்பு நேரம்",
    currentStreakDays: "தொடர் நாட்கள்",
    monthlyGoal: "மாதாந்திர இலக்கு",
    weeklyActivity: "வாராந்திர செயல்பாடு",

    // AI Features
    aiAssistantTitle: "AI வாசிப்பு உதவியாளர்",
    aiSubtitle: "தமிழ் இலக்கியத்தை ஆழமாகப் புரிந்து கொள்ள AI நுட்பங்களைப் பயன்படுத்துங்கள்.",
    aiSummarize: "அத்தியாயச் சுருக்கம்",
    aiExplainWords: "கடின வார்த்தை விளக்கம்",
    aiAskBook: "புத்தகம் பற்றிய கேள்விகள்",
    aiGenerateQuestions: "வினாடி வினா",
    aiTamilEnglish: "தமிழ் ↔ ஆங்கில விளக்கம்",
    aiPromptPlaceholder: "உங்களுக்குத் தேவையான விளக்கத்தைக் கேளுங்கள்...",
    aiGenerate: "விளக்கம் பெறுக",

    // Profile & Settings
    memberSince: "உறுப்பினர் சேர்ந்தது",
    readingHistory: "வாசிப்பு வரலாறு",
    achievements: "சாதனைகள்",
    languageSetting: "மொழி அமைப்புகள்",
    appearanceSetting: "தோற்றம்",
    readingPreferences: "வாசிப்பு விருப்பங்கள்",
    ttsSettings: "ஒலி வாசிப்பு அமைப்புகள்",
    securityNotifications: "பாதுகாப்பு & அறிவிப்புகள்",
    saveChanges: "மாற்றங்களைச் சேமி",
    
    // Footer
    footerDesc: "நவீன வாசகர்களுக்கான தமிழ் டிஜிட்டல் நூலகம்.",
    quickLinks: "விரைவு இணைப்புகள்",
    copyright: "© 2026 Kaviyam-Reading. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
  },
  en: {
    // Brand
    brandName: "Kaviyam-Reading",
    brandTagline: "Discover. Read. Learn. Experience Tamil Literature.",
    heroTitle: "Discover the Literary Treasures of Tamil",
    heroSubtitle: "Explore classic Tamil novels, literature, stories and timeless works through a modern reading experience.",
    browseBooks: "Browse Books",
    startReading: "Start Reading",

    // Navigation
    navHome: "Home",
    navTamilLibrary: "Tamil Library",
    navCatalogLibrary: "Catalog Library",
    navMyBooks: "My Books",
    navProgress: "Progress",
    navAIFeatures: "AI Features",
    navProfileSettings: "Profile Settings",
    navMailbox: "Mailbox",
    navLocalDB: "Local DB",
    navHelpFAQ: "Help & FAQ",
    navAbout: "About",
    navBookmarks: "Bookmarks",
    navFavorites: "Favorites",
    navSettings: "Settings",
    navProfile: "Profile",
    navAdmin: "Admin Panel",
    signIn: "Sign In",
    signOut: "Sign Out",
    createAccount: "Create Account",
    welcomeBack: "Welcome Back",

    // Header & Search
    searchPlaceholder: "Search Tamil books, novels, authors...",
    notifications: "Notifications",
    guestMode: "Guest",

    // Tamil Library Sections
    tamilClassics: "Tamil Classics",
    tamilNovels: "Tamil Novels",
    historicalNovels: "Historical Novels",
    romanticNovels: "Romantic Novels",
    shortStories: "Short Stories",
    literaryWorks: "Literary Works",
    modernTamilLit: "Modern Tamil Literature",
    freeTamilBooks: "Free Tamil Books",
    rareAcademicBooks: "Rare & Academic Books",

    // Archives & Resources
    onlineArchivesTitle: "Major Online Archives & Databases",
    novelHubsTitle: "Contemporary & Romantic Novel Hubs",
    offlinePresetsTitle: "Personal Offline Downloads & Presets",
    fetchNovelTitle: "Search & Fetch Novel (AI Ingest)",
    fetchPlaceholder: "Enter Tamil classic or modern novel title...",
    fetchBtn: "Fetch Novel",
    visitArchive: "Visit Archive",
    openCommunity: "Open Community",
    openLocalBook: "Open Local Book",

    // Feature Highlights
    feature1Title: "Digital Library",
    feature1Desc: "5000+ Literary Works",
    feature2Title: "Smart Reading",
    feature2Desc: "AI Powered Assistant",
    feature3Title: "Reading Progress",
    feature3Desc: "Track Reading Habits",
    feature4Title: "Text-to-Speech",
    feature4Desc: "Listen on the go",
    feature5Title: "Tamil & English",
    feature5Desc: "Bilingual Experience",

    // Auth Page
    welcomeSubtitle: "Continue your reading journey.",
    loginEmailTab: "Email",
    loginMobileTab: "Mobile",
    emailLabel: "Email Address",
    emailPlaceholder: "Enter your email address",
    passwordLabel: "Password",
    passwordPlaceholder: "Enter your password",
    rememberMe: "Remember me",
    forgotPassword: "Forgot password?",
    orDivider: "OR",
    continueWithGoogle: "Continue with Google",
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: "Already have an account?",

    // Dashboard & Stats
    dashTitle: "Home Dashboard",
    totalBooks: "Books",
    totalAuthors: "Authors",
    readingTime: "Reading Time",
    totalSeries: "Series",
    thisWeek: "this week",
    continueReading: "Continue Reading",
    viewAll: "View All",
    readingActivity: "Reading Activity",
    genreDistribution: "Genre Distribution",

    // Library & Filters
    libraryTitle: "Library",
    allGenres: "All Genres",
    allAuthors: "All Authors",
    allEras: "All Periods",
    sortRating: "Top Rated",
    sortPopular: "Most Popular",
    sortNewest: "Newest Releases",
    readers: "Readers",
    chapters: "Chapters",
    rating: "Rating",
    addCustomBook: "Add Custom Book",
    readNow: "Read Now",
    addToLibrary: "Add to Library",

    // Book Details
    aboutBook: "About the Book",
    chaptersList: "Chapters",
    reviews: "Reviews",
    relatedBooks: "Related Books",
    addToMyBooks: "Add to My Books",
    inMyBooks: "In My Books",
    startReadingNow: "Start Reading",

    // Reader Page
    chapter: "Chapter",
    previousChapter: "Previous Chapter",
    nextChapter: "Next Chapter",
    fontAdjust: "Font Size",
    themeLabel: "Theme",
    themeLight: "Light",
    themeSepia: "Sepia",
    themeDark: "Dark",
    ttsAudio: "Text-to-Speech",
    ttsSpeed: "Speed",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    readingProgress: "Reading Progress",

    // My Books
    currentlyReading: "Currently Reading",
    completed: "Completed",
    savedBooks: "Saved Books",
    lastRead: "Last read",
    progress: "Progress",

    // Progress Dashboard
    booksReadCount: "Books Read",
    chaptersCompletedCount: "Chapters Completed",
    totalReadingTimeHours: "Reading Hours",
    currentStreakDays: "Day Streak",
    monthlyGoal: "Monthly Goal",
    weeklyActivity: "Weekly Activity",

    // AI Features
    aiAssistantTitle: "AI Reading Assistant",
    aiSubtitle: "Leverage advanced AI to deeply analyze, translate, and comprehend Tamil literature.",
    aiSummarize: "Summarize Chapter",
    aiExplainWords: "Explain Difficult Words",
    aiAskBook: "Ask About This Book",
    aiGenerateQuestions: "Generate Questions",
    aiTamilEnglish: "Tamil ↔ English Explanation",
    aiPromptPlaceholder: "Ask anything about this chapter or word...",
    aiGenerate: "Generate Insights",

    // Profile & Settings
    memberSince: "Member since",
    readingHistory: "Reading History",
    achievements: "Achievements",
    languageSetting: "Language Preference",
    appearanceSetting: "Appearance",
    readingPreferences: "Reading Preferences",
    ttsSettings: "Text-to-Speech Settings",
    securityNotifications: "Security & Notifications",
    saveChanges: "Save Changes",

    // Footer
    footerDesc: "Tamil literature, reimagined for modern readers.",
    quickLinks: "Quick Links",
    copyright: "© 2026 Kaviyam-Reading. All rights reserved."
  }
};

export function getStoredLanguage(): Language {
  if (typeof window === "undefined") return "ta";
  const lang = localStorage.getItem("kaviyam_language");
  return (lang === "en" || lang === "ta") ? lang : "ta";
}

export function setStoredLanguage(lang: Language) {
  if (typeof window !== "undefined") {
    localStorage.setItem("kaviyam_language", lang);
  }
}

export function useI18n() {
  const [lang, setLang] = useState<Language>(getStoredLanguage);

  const changeLanguage = (newLang: Language) => {
    setLang(newLang);
    setStoredLanguage(newLang);
  };

  const t = (key: keyof typeof translations["ta"]) => {
    return translations[lang][key] || translations["en"][key] || key;
  };

  return { lang, setLang: changeLanguage, t };
}
