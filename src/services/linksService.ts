import { 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";
import { ProjectLink } from "../types";

// Curated and analyzed reference links (E-books, Novels, Education, and News)
export const INITIAL_OLD_LINKS: ProjectLink[] = [
  // 1. Novels & Literature
  {
    id: "link-freetamilebooks",
    title: "Free Tamil Ebooks (Creative Commons)",
    titleTa: "கட்டற்ற தமிழ் மின்புத்தகங்கள் (Free Tamil Ebooks)",
    url: "https://freetamilebooks.com/",
    category: "novel",
    description: "Thousands of copyright-free open access Tamil classic and contemporary novels formatted for e-readers and mobile devices.",
    descriptionTa: "கிரியேட்டிவ் காமன்ஸ் உரிமத்தில் திறந்தநிலை தமிழ் நாவல்கள், சிறுகதைகள் மற்றும் இலக்கிய மின்புத்தகங்கள்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-tamilbookspdf",
    title: "Tamil Books PDF (2000+ Novels)",
    titleTa: "தமிழ் புக்ஸ் PDF (2000+ நாவல்கள்)",
    url: "https://tamilbookspdf.com/",
    category: "novel",
    description: "Curated collection of 2000+ Tamil novels, historical thrillers, romance, and detective literature in downloadable PDF format.",
    descriptionTa: "2000-க்கும் மேற்பட்ட வரலாற்று நாவல்கள், துப்பறியும் கதைகள் மற்றும் தமிழ் இலக்கியப் பொக்கிஷங்களின் PDF தொகுப்பு.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-smtamilnovels",
    title: "SM Tamil Novels Forum",
    titleTa: "எஸ்.எம் தமிழ் நாவல்கள் அரங்கம் (SM Tamil Novels)",
    url: "https://forum.smtamilnovels.com/",
    category: "novel",
    description: "Leading interactive forum for independent Tamil romantic novelists, daily web-novel series, and active reader discussions.",
    descriptionTa: "சுயாதீன தமிழ் எழுத்தாளர்களின் சமகால தொடர் நாவல்கள், காதல் கதைகள் மற்றும் வாசகர்களின் நேரடி கலந்துரையாடல் தளம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-alltamilnovels",
    title: "All Tamil Novels Download",
    titleTa: "அனைத்து தமிழ் நாவல்கள் பதிவிறக்கம் (All Tamil Novels)",
    url: "https://alltamilnovelsdownload.blogspot.com/",
    category: "novel",
    description: "Comprehensive web archive containing historical novels, popular romantic series, and classic Tamil author collections.",
    descriptionTa: "வரலாற்றுப் புதினங்கள், குடும்பக் கதைகள் மற்றும் புகழ்பெற்ற தமிழ் நாவலாசிரியர்களின் முழுமையான மின்நூல் காப்பகம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-chillzee",
    title: "Chillzee Tamil Novels & Audio Stories",
    titleTa: "சில்சீ தமிழ் நாவல்கள் & கதைகள் (Chillzee)",
    url: "https://www.chillzee.in/",
    category: "novel",
    description: "Vibrant online literature platform featuring modern Tamil serialized novels, short stories, poem collections, and audiobooks.",
    descriptionTa: "நவீன தமிழ் தொடர்கதைகள், சிறுகதைகள், காதல் நாவல்கள் மற்றும் ஆடியோ கதைகளுக்கான பிரத்யேக இணையதளம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-pratilipi-tamil",
    title: "Pratilipi Tamil Story & Novel Community",
    titleTa: "பிரதிலிபி தமிழ் - கதை & நாவல் தளம் (Pratilipi)",
    url: "https://tamil.pratilipi.com/",
    category: "novel",
    description: "India's largest digital storytelling network with millions of Tamil readers, web series, romance, and fantasy novels.",
    descriptionTa: "லட்சக்கணக்கான வாசகர்களைக் கொண்ட இந்தியாவின் முதன்மையான தமிழ் கதை, தொடர் நாவல் மற்றும் ஆடியோ கதை அரங்கம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },

  // 2. Digital Archives & Free Books
  {
    id: "link-freetamilbooks-portal",
    title: "Free Tamil Books Portal",
    titleTa: "இலவச தமிழ் புத்தகங்கள் தளம் (Free Tamil Books)",
    url: "https://freetamilbooks.com/",
    category: "archive",
    description: "Open-source digital library dedicated to archiving Tamil literature, historical essays, poems, and open-license knowledge.",
    descriptionTa: "தமிழ் இலக்கியங்கள், கட்டுரைகள், கவிதைகள் மற்றும் பொது அறிவு நூல்களை கட்டற்ற உரிமத்தில் வழங்கும் மின் ஆவணம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-tamilbookshelf",
    title: "Tamil Bookshelf Digital Library",
    titleTa: "தமிழ் புக்ஷெல்ப் மின்னூலகம் (Tamil Bookshelf)",
    url: "https://tamilbookshelf.in/library.html#",
    category: "archive",
    description: "Well-organized digital bookshelf cataloging ancient classics, Sangam literature, epics, and timeless Tamil research volumes.",
    descriptionTa: "சங்க இலக்கியங்கள், காப்பியங்கள் மற்றும் அரிய வரலாற்று நூல்களைப் பட்டியலிடும் நேர்த்தியான தமிழ் மின்னூலகம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },

  // 3. Education & Textbooks
  {
    id: "link-tntextbooks",
    title: "TN Samacheer Kalvi School Textbooks",
    titleTa: "தமிழ்நாடு அரசு சமச்சீர் கல்வி பாடநூல்கள்",
    url: "https://www.tntextbooks.in/p/school-books.html",
    category: "education",
    description: "Official repository of Tamil Nadu State Board Samacheer Kalvi school textbooks from Standard 1 to 12 in Tamil and English.",
    descriptionTa: "தமிழ்நாடு அரசு சமச்சீர் கல்வி 1 முதல் 12-ஆம் வகுப்பு வரையிலான அனைத்துப் பாடங்களுக்கான இலவசப் பாடநூல்கள்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-tamilcube-books",
    title: "Tamilcube Free Tamil Books & Educational Library",
    titleTa: "தமிழ் கியூப் இலவச புத்தகங்கள் & அகராதி (Tamilcube)",
    url: "https://shop.tamilcube.com/tamil-books-free/",
    category: "education",
    description: "Renowned Singapore & global Tamil education portal offering free children's books, cultural stories, and online dictionaries.",
    descriptionTa: "சிங்கப்பூர் மற்றும் உலகத் தமிழர்களுக்கான சிறுவர் கதைகள், இலக்கண நூல்கள் மற்றும் தமிழ் அகராதி கொண்ட கல்வி தளம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },

  // 4. Tamil & Regional News
  {
    id: "link-dinamani",
    title: "Dinamani (தினமணி) - Daily Tamil Newspaper",
    titleTa: "தினமணி - முதன்மை தமிழ் நாளிதழ் (Dinamani)",
    url: "https://www.dinamani.com/",
    category: "news",
    description: "Prestigious Tamil daily newspaper renowned for quality journalism, literary Sunday supplements, and national coverage.",
    descriptionTa: "தூய தமிழ் இதழியல், இலக்கிய சிறப்பிதழ்கள் மற்றும் நடுநிலையான செய்திகளை வழங்கும் புகழ்பெற்ற நாளிதழ்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-asianet-politics",
    title: "Asianet News Tamil - Political & State Desk",
    titleTa: "ஏசியாநெட் தமிழ் - அரசியல் & தமிழ்நாடு செய்திகள்",
    url: "https://tamil.asianetnews.com/politics",
    category: "news",
    description: "Fast-breaking political updates, state assembly insights, and regional analysis from Asianet News Tamil desk.",
    descriptionTa: "தமிழ்நாடு அரசியல் கள நிலவரங்கள், தேர்தல் செய்திகள் மற்றும் உடனடி அரசியல் தலைப்புச் செய்திகள்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-polimernews",
    title: "Polimer News 24x7 Channel",
    titleTa: "பாலிமர் நியூஸ் 24x7 தொலைக்காட்சி",
    url: "https://www.polimernews.com/",
    category: "news",
    description: "One of Tamil Nadu's highest-viewed 24-hour satellite news networks featuring live broadcasts, local headlines, and special reports.",
    descriptionTa: "24 மணி நேரமும் நேரலை செய்திகள், மாவட்ட நடப்புகள் மற்றும் சிறப்பு புலனாய்வுச் செய்திகளை வழங்கும் முன்னணி ஊடகம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-newindianexpress",
    title: "The New Indian Express",
    titleTa: "தி நியூ இந்தியன் எக்ஸ்பிரஸ் (The New Indian Express)",
    url: "https://www.newindianexpress.com/",
    category: "news",
    description: "Major Indian English newspaper providing comprehensive daily reporting, Southern state news, and investigative pieces.",
    descriptionTa: "தமிழ்நாடு மற்றும் தென்னிந்திய நடப்புகள், தேசிய செய்திகளைத் துல்லியமாக வழங்கும் முன்னணி ஆங்கில நாளிதழ்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-dtnext",
    title: "DT Next - Chennai & Tamil Nadu News Portal",
    titleTa: "டிடி நெக்ஸ்ட் - சென்னை & தமிழ்நாடு ஆங்கில நாளிதழ்",
    url: "https://www.dtnext.in/",
    category: "news",
    description: "Leading Chennai-based daily with rich city journalism, cultural features, entertainment, and Tamil Nadu governance coverage.",
    descriptionTa: "சென்னை மற்றும் தமிழகத்தின் கலாச்சார, வணிக மற்றும் சமூக நிகழ்வுகளை உடனுக்குடன் வழங்கும் செய்தித் தளம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-thehindu-tamilnadu",
    title: "The Hindu - Tamil Nadu News Edition",
    titleTa: "தி இந்து - தமிழ்நாடு செய்திகள் (The Hindu)",
    url: "https://www.thehindu.com/news/national/tamil-nadu/",
    category: "news",
    description: "Authoritative and acclaimed statewide reportage on Tamil Nadu policies, society, heritage, and state developments.",
    descriptionTa: "தமிழ்நாட்டின் சட்டம், சமூகம், அரசியல் மற்றும் பண்பாட்டு நிகழ்வுகளை ஆழமாக ஆராயும் சர்வதேச தரம் வாய்ந்த செய்தியகம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },

  // 5. Social & Developer Profiles
  {
    id: "link-linkedin-boopathi",
    title: "LinkedIn - Dharmenthira Boopathi S",
    titleTa: "லிங்க்ட்இன் - தர்மேந்திரா பூபதி எஸ் (LinkedIn)",
    url: "https://www.linkedin.com/in/dharmenthira-boopathi-s-7087563a8",
    category: "social",
    description: "Official professional network profile and career updates for Dharmenthira Boopathi S.",
    descriptionTa: "தர்மேந்திரா பூபதி எஸ் அவர்களின் அதிகாரப்பூர்வ தொழில்முறை லிங்க்ட்இன் சுயவிவரப் பக்கம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-x-dharmenthi",
    title: "X (Twitter) - @dharmenthi7gec",
    titleTa: "எக்ஸ் (ட்விட்டர்) - @dharmenthi7gec",
    url: "https://x.com/dharmenthi7gec",
    category: "social",
    description: "Official thoughts, technology posts, and literary announcements on X.com (formerly Twitter).",
    descriptionTa: "எக்ஸ் (ட்விட்டர்) தளத்தில் அதிகாரப்பூர்வ தொழில்நுட்ப மற்றும் இலக்கியப் பதிவுகள்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-instagram-boopathi",
    title: "Instagram - @boopathi.__.08",
    titleTa: "இன்ஸ்டாகிராம் - @boopathi.__.08",
    url: "https://www.instagram.com/boopathi.__.08?igsh=MTA5ZTQ2a2k1dmZvZg==",
    category: "social",
    description: "Official Instagram profile for creative stories, updates, and community engagement.",
    descriptionTa: "இன்ஸ்டாகிராம் தளத்தில் அதிகாரப்பூர்வ புகைப்படங்கள், கதைகள் மற்றும் சமூகத் தொடர்புகள்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-github-poopathiraja",
    title: "GitHub - poopathiraja504-cloud",
    titleTa: "கிட்ஹப் - பூபதிராஜா கிளவுட் களஞ்சியம் (GitHub)",
    url: "https://github.com/poopathiraja504-cloud",
    category: "social",
    description: "Open-source software projects, development repositories, and cloud services by Poopathiraja.",
    descriptionTa: "திறந்த மூல மென்பொருள் களஞ்சியங்கள் மற்றும் கிளவுட் திட்டப்பணிகள் அடங்கிய கிட்ஹப் பக்கம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-whatsapp-community",
    title: "WhatsApp Community - Kaviyam Literature Group",
    titleTa: "வாட்ஸ்அப் குழு - காவியம் தமிழ் வாசகர் சமூகம்",
    url: "https://chat.whatsapp.com/DqdVUsDADvCGtGtT65kSLC?s=cl&p=a&mlu=0&ilr=4",
    category: "social",
    description: "Join our official interactive WhatsApp discussion group for daily book recommendations and novel updates.",
    descriptionTa: "காவியம் நாவல் வாசகர்கள், தமிழ் ஆர்வலர்களுக்கான அதிகாரப்பூர்வ வாட்ஸ்அப் கலந்துரையாடல் குழுவில் இணையுங்கள்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },

  // 6. Legal Terms & Privacy Policies
  {
    id: "link-termsfeed-terms",
    title: "Terms & Conditions (TermsFeed Live Agreement)",
    titleTa: "விதிமுறைகள் மற்றும் நிபந்தனைகள் (Terms & Conditions)",
    url: "https://www.termsfeed.com/live/40b50cfb-9cf5-4d66-89d3-87c937901dff",
    category: "legal",
    description: "Official user terms of service, platform usage guidelines, and intellectual property terms hosted on TermsFeed.",
    descriptionTa: "காவியம் வாசிப்பு தளத்தைப் பயன்படுத்துவதற்கான அதிகாரப்பூர்வ விதிமுறைகள் மற்றும் நிபந்தனைகள் ஆவணம்.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
  {
    id: "link-freeprivacypolicy-privacy",
    title: "Privacy Policy (FreePrivacyPolicy Live)",
    titleTa: "தனியுரிமைக் கொள்கை (Privacy Policy)",
    url: "https://www.freeprivacypolicy.com/live/020ee704-6e52-4ae5-8fe5-ff246bd18d9d",
    category: "legal",
    description: "Official data privacy compliance policy protecting user confidentiality, session safety, and profile security.",
    descriptionTa: "பயனர் தரவுப் பாதுகாப்பு, தகவல் தனியுரிமை மற்றும் நற்சான்றிதழ்களைப் பாதுகாக்கும் அதிகாரப்பூர்வ தனியுரிமைக் கொள்கை.",
    uploadedAt: "2026-09-13T00:00:00.000Z",
    isSystem: false,
  },
];

const LOCAL_LINKS_KEY = "kaviyam_project_links_v6";
const DELETED_LINKS_KEY = "kaviyam_deleted_link_ids_v6";

function getDeletedLinkIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_LINKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function markLinkIdAsDeleted(id: string) {
  try {
    const ids = getDeletedLinkIds();
    if (!ids.includes(id)) {
      ids.push(id);
      localStorage.setItem(DELETED_LINKS_KEY, JSON.stringify(ids));
    }
  } catch {}
}

export async function fetchAllProjectLinks(): Promise<ProjectLink[]> {
  const deletedIds = getDeletedLinkIds();
  const localUploaded: ProjectLink[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_LINKS_KEY);
    if (raw) {
      localUploaded.push(...JSON.parse(raw));
    }
  } catch (e) {
    console.warn("Could not read local links:", e);
  }

  try {
    const snapshot = await getDocs(collection(db, "links"));
    const firestoreLinks: ProjectLink[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      firestoreLinks.push({
        id: docSnap.id,
        title: data.title,
        titleTa: data.titleTa,
        url: data.url,
        category: data.category || "custom",
        description: data.description,
        descriptionTa: data.descriptionTa,
        uploadedAt: data.uploadedAt || new Date().toISOString(),
        isSystem: false,
      });
    });

    const combined = [...INITIAL_OLD_LINKS];
    
    // Merge Firestore links
    firestoreLinks.forEach((fLink) => {
      if (!combined.some((c) => c.id === fLink.id || c.url === fLink.url)) {
        combined.push(fLink);
      }
    });

    // Merge local links
    localUploaded.forEach((lLink) => {
      if (!combined.some((c) => c.id === lLink.id || c.url === lLink.url)) {
        combined.push(lLink);
      }
    });

    // Filter out any explicitly deleted IDs
    return combined.filter((item) => !deletedIds.includes(item.id));
  } catch (e) {
    console.warn("Firestore links query fallback to local:", e);
    const combined = [...INITIAL_OLD_LINKS];
    localUploaded.forEach((lLink) => {
      if (!combined.some((c) => c.id === lLink.id || c.url === lLink.url)) {
        combined.push(lLink);
      }
    });
    return combined.filter((item) => !deletedIds.includes(item.id));
  }
}

export async function uploadProjectLink(linkData: {
  title: string;
  titleTa?: string;
  url: string;
  category: ProjectLink["category"];
  description?: string;
  descriptionTa?: string;
}): Promise<ProjectLink> {
  const newLink: ProjectLink = {
    id: `link-${Date.now()}`,
    title: linkData.title,
    titleTa: linkData.titleTa || linkData.title,
    url: linkData.url,
    category: linkData.category,
    description: linkData.description || "",
    descriptionTa: linkData.descriptionTa || linkData.description || "",
    uploadedAt: new Date().toISOString(),
    isSystem: false,
  };

  // 1. Save to local storage
  try {
    const current = localStorage.getItem(LOCAL_LINKS_KEY);
    const list: ProjectLink[] = current ? JSON.parse(current) : [];
    list.unshift(newLink);
    localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(list));
  } catch {}

  // 2. Save to Firestore
  try {
    const ref = await addDoc(collection(db, "links"), {
      ...newLink,
      createdAt: serverTimestamp(),
    });
    newLink.id = ref.id;
  } catch (err) {
    console.warn("Could not save link to Firestore:", err);
  }

  // 3. Save to backend records
  try {
    await fetch("/api/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "project_link_upload",
        content: newLink,
        createdAt: new Date().toISOString(),
      }),
    });
  } catch {}

  return newLink;
}

export async function deleteProjectLink(linkId: string): Promise<boolean> {
  markLinkIdAsDeleted(linkId);

  try {
    const current = localStorage.getItem(LOCAL_LINKS_KEY);
    if (current) {
      const list: ProjectLink[] = JSON.parse(current);
      const updated = list.filter((l) => l.id !== linkId);
      localStorage.setItem(LOCAL_LINKS_KEY, JSON.stringify(updated));
    }
  } catch {}

  try {
    await deleteDoc(doc(db, "links", linkId));
  } catch (err) {
    console.warn("Could not delete from Firestore:", err);
  }

  return true;
}

export async function clearAllProjectLinks(): Promise<boolean> {
  try {
    const current = await fetchAllProjectLinks();
    current.forEach((l) => markLinkIdAsDeleted(l.id));
    localStorage.removeItem(LOCAL_LINKS_KEY);
  } catch {}
  return true;
}
