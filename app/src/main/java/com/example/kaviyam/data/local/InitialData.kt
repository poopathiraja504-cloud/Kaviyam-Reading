package com.example.kaviyam.data.local

import com.example.kaviyam.data.models.Book
import com.example.kaviyam.data.models.Chapter
import com.example.kaviyam.data.models.Review
import com.example.kaviyam.data.models.SecurityLog
import com.example.kaviyam.data.models.SimulatedEmail
import com.example.kaviyam.data.models.TamilAuthor
import com.example.kaviyam.data.models.TamilQuote
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

object InitialData {
    private val json = Json { encodeDefaults = true; ignoreUnknownKeys = true }

    fun getInitialBooks(): List<Book> {
        val ponniyinChapters = listOf(
            Chapter(
                id = "ps-ch-1",
                number = 1,
                title = "The Golden Flood of Veera Narayana Lake",
                tamilTitle = "ஆடிப் பெருக்கு",
                content = """
ஆடித் திங்கள் பதினெட்டாம் நாள் முன்மாலை நேரத்தில், இளவல் வல்லவரையன் வந்தியத்தேவன், வீரநாராயண ஏரிக்கரையின் மீது தன் வெள்ளைப் புரவியைத் தட்டிவிட்டுக் கொண்டு போய்க் கொண்டிருந்தான்.

The sun was dipping gently towards the western horizon, casting molten amber waves across the expansive waters of the Veera Narayana Lake. Constructed by the valorous Rajaditya Chola in honor of his father, this magnificent reservoir spanned vast leagues. On this sacred 18th day of the Tamil month of Aadi, crowds flocked with colorful garlands, singing devotional verses to the rising fresh tides.

Vanthiyathevan, a fearless scion of the noble Vana clan, smiled as he felt the crisp evening breeze brushing his forehead. He carried with him two confidential palm-leaf scrolls of supreme state importance: one from Crown Prince Aditya Karikalan destined for the venerable Emperor Sundara Chola in Thanjavur, and another for Princess Kundavai Pirattiyar in Pazhaiyarai.

As his spirited steed pranced along the scenic embankment, whispers of looming palace intrigue and conspiratorial meetings of the Pazhuvettarayars reached his keen ears. The grand destiny of the Chola Empire hung delicately in the balance.
                """.trimIndent()
            ),
            Chapter(
                id = "ps-ch-2",
                number = 2,
                title = "Alwarkkadiyan Nambi",
                tamilTitle = "ஆழ்வார்க்கடியான் நம்பி",
                content = """
As Vanthiyathevan paused near the Kuravai Koothu performers, his attention was drawn to a stout, tufted Vaishnavite devotee holding an iron-tipped cane, vigorously chanting hymns praising Lord Narayana.

"Narayana! Sriman Narayana!" bellowed Alwarkkadiyan Nambi, stepping forward to debate a group of fervent Shaivite scholars. His sharp wit and probing eyes revealed that beneath the pious exterior of a temple mendicant lay the master spy of Prime Minister Aniruddha Brahmarrayar.

Vanthiyathevan approached cautiously. "Greetings, friend. Are you heading towards Kadambur palace tonight?"

Alwarkkadiyan gave a knowing chuckle. "Where the great gathering of feudatories happens, there too is the shadow of Lord Vishnu's humble servant. But beware, young warrior—tonight in Kadambur, secrets deadlier than poisoned daggers will be shared behind closed fortress gates."
                """.trimIndent()
            ),
            Chapter(
                id = "ps-ch-3",
                number = 3,
                title = "The Secret Gathering at Kadambur",
                tamilTitle = "கடம்பூர் மாளிகை ரகசியம்",
                content = """
Night fell like a dark velvet cloak over the fertile Kaveri delta. Inside the fortified mansion of Sambuvarayar at Kadambur, torchlights flickered with ominous secrecy.

High-ranking chieftains, headed by the eighty-year-old titan of sixty-four battle scars, Periya Pazhuvettarayar, sat in a circle. Beside him was his young, enigmatic bride, Nandhini Devi, whose ethereal beauty masked an ocean of vengeance.

Hiding high in the courtyard rafters, Vanthiyathevan held his breath as the treasonous plan was whispered: to crown Madhurantakan, brother of the late King Gandaraditya, as Emperor instead of the valiant warrior prince Aditya Karikalan. The storm clouds of civil war were gathering with ferocious speed.
                """.trimIndent()
            )
        )

        val sivagamiChapters = listOf(
            Chapter(
                id = "ss-ch-1",
                number = 1,
                title = "The Sculptor's Dream in Mamallapuram",
                tamilTitle = "சிற்பியின் கனவு",
                content = """
On the sun-drenched shores of Mamallapuram, master sculptor Ayanar stood before a monolithic rock, chisel in hand, envisioning celestial forms emerging from coarse granite.

Behind him, dancing gracefully to the rhythm of ocean surf, was his daughter Sivagami. Her bharatanatyam postures breathed life into the silent coastal stones. Young Pallava prince Narasimhavarman (Mamallan) watched from horseback in silent adoration, mesmerized by her artistry.

Yet in the northern horizon, King Pulakeshin II of the Chalukyas had mobilized a colossal army, preparing to march southward toward the grand gates of Kanchipuram. The tragic tale of beauty, duty, and relentless siege had begun.
                """.trimIndent()
            ),
            Chapter(
                id = "ss-ch-2",
                number = 2,
                title = "The Flames over Kanchi",
                tamilTitle = "காஞ்சியின் போர்க்களம்",
                content = """
Years of war tested the resilience of the Pallava dynasty. When Chalukya forces invaded the imperial capital, Sivagami was captured and taken to Vatapi.

Narasimhavarman vowed: "I shall not rest until the lion banner of Kanchi flies triumphant atop the ramparts of Vatapi, and my beloved Sivagami is rescued."
                """.trimIndent()
            )
        )

        val parthibanChapters = listOf(
            Chapter(
                id = "pk-ch-1",
                number = 1,
                title = "The Vow of the Chola King",
                tamilTitle = "சோழ மன்னனின் சபதம்",
                content = """
King Parthiba Chola looked across his small, subjugated territory along the banks of the Kollidam river. Though paying tribute to the mighty Pallava emperor Narasimhavarman, his heart burned with the dream of a sovereign, independent Chola realm.

Turning to his loyal queen and young son Vikraman, Parthiban declared: "Even if I fall in battle tomorrow, the tiger banner of the Cholas will one day wave across all three worlds."
                """.trimIndent()
            )
        )

        val thirukkuralChapters = listOf(
            Chapter(
                id = "tk-ch-1",
                number = 1,
                title = "Praise of God (கடவுள் வாழ்த்து)",
                tamilTitle = "அதிகாரம் 1 - கடவுள் வாழ்த்து",
                content = """
குறள் 1:
அகர முதல எழுத்தெல்லாம் ஆதி
பகவன் முதற்றே உலகு.

As the letter 'A' is the first and foundational start of all written alphabets, so the Eternal Prime God is the primal origin of all the universe.

குறள் 2:
கற்றதனால் ஆய பயன்கொல் வாலறிவன்
நற்றாள் தொழாஅர் எனின்.

What fruit has learning attained, if those who study do not bow with reverence before the luminous feet of the Supreme Possessor of Pure Wisdom?
                """.trimIndent()
            ),
            Chapter(
                id = "tk-ch-2",
                number = 2,
                title = "The Blessing of Rain (வான்சிறப்பு)",
                tamilTitle = "அதிகாரம் 2 - வான்சிறப்பு",
                content = """
குறள் 11:
வானின் றுலகம் வழங்கி வருதலால்
தானமிழ்தம் என்றுணரற் பாற்று.

Since the timely rains shower nourishment and sustain the living realm, rain itself is rightly revered as the celestial nectar of immortality (Amirtham).
                """.trimIndent()
            )
        )

        val aethelgardChapters = listOf(
            Chapter(
                id = "ae-ch-1",
                number = 1,
                title = "The Obsidian Spire",
                content = """
The wind howled through the basalt arches of the Spire of Aethelgard. Eldrin gripped the glowing hilt of his runic blade, feeling the ancient vibrations of starlight resonating within the metal.

High above the clouds, the celestial rift pulsed with deep violet luminescence. The guardians of the astral seal had fallen one by one, leaving only him between the realm of mortals and the encroaching Void Swarm.
                """.trimIndent()
            )
        )

        val neonSolitudeChapters = listOf(
            Chapter(
                id = "ns-ch-1",
                number = 1,
                title = "Sector 7 Rain",
                content = """
Cybernetic rain trickled down the neon-lit glass of Maya's high-rise apartment in New Neo-Tokyo. The synthetic androids below patrolled the chrome streets in rhythmic precision.

A soft ping illuminated her neural link: "Encrypted memory fragment detected from year 2048. Origin: Unknown." She leaned forward, initiating the quantum decryption protocol.
                """.trimIndent()
            )
        )

        val defaultReviews = listOf(
            Review(
                id = "rev-1",
                username = "Sundar Ramanathan",
                rating = 5,
                comment = "One of the greatest masterpieces of world literature. Kalki's prose brings the Chola era vividly to life with astonishing grandeur.",
                date = "2 days ago"
            ),
            Review(
                id = "rev-2",
                username = "Meenakshi V",
                rating = 5,
                comment = "Vanthiyathevan's wit, Kundavai's intellect, and Nandhini's depth make this an unforgettable read. A treasure in Kaviyam!",
                date = "1 week ago"
            )
        )

        return listOf(
            Book(
                id = "book-ponniyin-selvan",
                title = "Ponniyin Selvan",
                tamilTitle = "பொன்னியின் செல்வன்",
                author = "Kalki Krishnamurthy",
                genre = "Tamil Classics",
                year = 1954,
                rating = 4.9,
                reads = 124500,
                description = "The immortal epic saga of the Chola Dynasty, unraveling palace intrigues, high-seas maritime adventures, valorous warriors, and the rise of Arulmozhi Varman (Raja Raja Chola I).",
                language = "Tamil / Bilingual English",
                coverImage = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
                isCustomAI = false,
                isTamilClassic = true,
                chaptersJson = json.encodeToString(ponniyinChapters),
                reviewsJson = json.encodeToString(defaultReviews),
                tagsJson = json.encodeToString(listOf("Chola Empire", "Epic History", "Adventure", "Kalki", "Masterpiece")),
                isBookmarked = true,
                progressPercentage = 35,
                lastReadChapterIndex = 0
            ),
            Book(
                id = "book-sivagamiyin-sabatham",
                title = "Sivagamiyin Sabatham",
                tamilTitle = "சிவகாமியின் சபதம்",
                author = "Kalki Krishnamurthy",
                genre = "Tamil Classics",
                year = 1948,
                rating = 4.8,
                reads = 89200,
                description = "Set in 7th century South India during the titanic struggle between Pallava Emperor Mahendravarman and Chalukya King Pulakeshin II. A tragic tale of art, sculptors, and fierce royal vows.",
                language = "Tamil / English",
                coverImage = "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600",
                isCustomAI = false,
                isTamilClassic = true,
                chaptersJson = json.encodeToString(sivagamiChapters),
                reviewsJson = json.encodeToString(defaultReviews),
                tagsJson = json.encodeToString(listOf("Pallava Dynasty", "Sculptures", "War", "Drama", "Kalki")),
                isBookmarked = false,
                progressPercentage = 15,
                lastReadChapterIndex = 0
            ),
            Book(
                id = "book-parthiban-kanavu",
                title = "Parthiban Kanavu",
                tamilTitle = "பார்த்திபன் கனவு",
                author = "Kalki Krishnamurthy",
                genre = "Tamil Classics",
                year = 1941,
                rating = 4.7,
                reads = 64100,
                description = "The visionary dream of King Parthiba Chola to restore his dynasty's glory, carried forward through daring deeds, disguised monks, and legendary bravery.",
                language = "Tamil / English",
                coverImage = "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=600",
                isCustomAI = false,
                isTamilClassic = true,
                chaptersJson = json.encodeToString(parthibanChapters),
                reviewsJson = json.encodeToString(defaultReviews),
                tagsJson = json.encodeToString(listOf("Chola Revival", "Disguise", "Mystery", "Kalki")),
                isBookmarked = true,
                progressPercentage = 60,
                lastReadChapterIndex = 0
            ),
            Book(
                id = "book-thirukkural",
                title = "Thirukkural Wisdom",
                tamilTitle = "திருக்குறள்",
                author = "Thiruvalluvar",
                genre = "Philosophy",
                year = 300,
                rating = 5.0,
                reads = 310000,
                description = "The universal Tamil treatise on ethics, virtue (Aram), wealth (Porul), and love (Inbam). Timeless couplets guiding human life and leadership.",
                language = "Tamil / English",
                coverImage = "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=600",
                isCustomAI = false,
                isTamilClassic = true,
                chaptersJson = json.encodeToString(thirukkuralChapters),
                reviewsJson = json.encodeToString(defaultReviews),
                tagsJson = json.encodeToString(listOf("Philosophy", "Ethics", "Wisdom", "Sangam")),
                isBookmarked = true,
                progressPercentage = 10,
                lastReadChapterIndex = 0
            ),
            Book(
                id = "book-chronicles-aethelgard",
                title = "Chronicles of Aethelgard",
                author = "Lyra Valen",
                genre = "Fantasy",
                year = 2024,
                rating = 4.8,
                reads = 45200,
                description = "A grand fantasy epic set in the fractured realms of Aethelgard, where rune-forged knights defend ancient celestial towers from the Void Swarm.",
                language = "English",
                coverImage = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600",
                isCustomAI = false,
                isTamilClassic = false,
                chaptersJson = json.encodeToString(aethelgardChapters),
                reviewsJson = json.encodeToString(defaultReviews),
                tagsJson = json.encodeToString(listOf("High Fantasy", "Magic", "Dragons", "Runes")),
                isBookmarked = false,
                progressPercentage = 0,
                lastReadChapterIndex = 0
            ),
            Book(
                id = "book-neon-solitude",
                title = "Neon Solitude: 2088",
                author = "Kaelen Voss",
                genre = "Sci-Fi",
                year = 2025,
                rating = 4.7,
                reads = 38900,
                description = "In the rain-drenched cybernetic sprawl of Neo-Tokyo, a rogue cyber-detective unearths an encrypted soul protocol that threatens the AI megacorporations.",
                language = "English",
                coverImage = "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600",
                isCustomAI = false,
                isTamilClassic = false,
                chaptersJson = json.encodeToString(neonSolitudeChapters),
                reviewsJson = json.encodeToString(defaultReviews),
                tagsJson = json.encodeToString(listOf("Cyberpunk", "AI", "Noir", "Futuristic")),
                isBookmarked = false,
                progressPercentage = 0,
                lastReadChapterIndex = 0
            )
        )
    }

    val TAMIL_QUOTES = listOf(
        TamilQuote(
            id = "tq-1",
            kuralNumber = 391,
            tamil = "கற்க கசடறக் கற்பவை கற்றபின்\nநிற்க அதற்குத் தக.",
            transliteration = "Karka Kasadarak Karpavai Katrapin\nNirka Adharkuth Thaga.",
            english = "Learn flawlessly whatever is worth learning; and having learned, let your conduct strictly reflect that wisdom.",
            explanation = "Education is not merely acquiring knowledge, but molding one's righteous character according to true principles."
        ),
        TamilQuote(
            id = "tq-2",
            kuralNumber = 1,
            tamil = "அகர முதல எழுத்தெல்லாம் ஆதி\nபகவன் முதற்றே உலகு.",
            transliteration = "Agara Mudhala Ezhuthellam Aadhi\nBagavan Mudhatre Ulagu.",
            english = "As the letter 'A' stands first among all alphabets, so the Primordial God is the origin of the whole universe.",
            explanation = "All knowledge and linguistic wonder begins with humility before the eternal source."
        ),
        TamilQuote(
            id = "tq-3",
            kuralNumber = 66,
            tamil = "குழலினிது யாழினிது என்பதம் மக்கள்\nமழலைச்சொல் கேளாதவர்.",
            transliteration = "Kuzhalinidhu Yaazhinidhu Enbadham Makkal\nMazhalaichchol Kelaadhavar.",
            english = "Sweet is the flute, sweet is the lute—say those who have not heard the tender, lisping chatter of their own children.",
            explanation = "The innocence and love of family transcends the most refined musical instruments of the world."
        ),
        TamilQuote(
            id = "tq-4",
            kuralNumber = 102,
            tamil = "காலத்தினாற் செய்த நன்றி சிறிதுஎனினும்\nஞாலத்தின் மாணப் பெரிது.",
            transliteration = "Kaalathinaar Seidha Nandri Siridheninum\nNyaalathil Maanap Peridhu.",
            english = "A timely kindness rendered in an hour of desperate need, though small in size, is vaster than the entire cosmos.",
            explanation = "The true value of benevolence is measured not by magnitude, but by its timely rescue in moments of vulnerability."
        )
    )

    val TAMIL_AUTHORS = listOf(
        TamilAuthor(
            id = "ta-kalki",
            name = "Kalki Krishnamurthy",
            tamilName = "கல்கி கிருஷ்ணமூர்த்தி",
            era = "Modern Era (1899–1954)",
            bio = "Pioneering Indian independence activist, journalist, and historical novelist who redefined modern Tamil literature with immortal epics like Ponniyin Selvan and Sivagamiyin Sabatham.",
            notableWorks = listOf("Ponniyin Selvan", "Sivagamiyin Sabatham", "Parthiban Kanavu", "Alai Osai"),
            image = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300"
        ),
        TamilAuthor(
            id = "ta-bharati",
            name = "Mahakavi Subramania Bharati",
            tamilName = "மகாகவி சுப்பிரமணிய பாரதியார்",
            era = "Modern Era (1882–1921)",
            bio = "Visionary poet, social reformer, and polyglot whose fiery nationalistic verses and emancipatory poems ignited the Indian freedom movement and modernized Tamil poetry.",
            notableWorks = listOf("Panchali Sabatham", "Kuyil Pattu", "Kannan Pattu", "Bharathiyar Kavithaigal"),
            image = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300"
        ),
        TamilAuthor(
            id = "ta-sujatha",
            name = "Sujatha Rangarajan",
            tamilName = "சுஜாதா",
            era = "Contemporary Era (1935–2008)",
            bio = "Prolific electronic engineer and author who introduced modern science fiction, fast-paced thrillers, and accessible tech terminology to millions of Tamil readers.",
            notableWorks = listOf("En Iniya Iyanthira", "Meendum Jeano", "Nylon Kayiru", "Katradhum Petradhum"),
            image = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
        ),
        TamilAuthor(
            id = "ta-pudhumai",
            name = "Pudhumaipithan",
            tamilName = "புதுமைப்பித்தன்",
            era = "Modern Era (1906–1948)",
            bio = "Master of the Tamil short story, renowned for his razor-sharp realism, social satire, psychological insight, and experimental literary modernism.",
            notableWorks = listOf("Kadavulum Kandasamy Pillaiyum", "Sapavimosanam", "Sirpiyin Naragam"),
            image = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
        )
    )

    val INITIAL_SECURITY_LOGS = listOf(
        SecurityLog(
            id = "log-1",
            action = "Secure Session Initialized (Device Registered)",
            timestamp = System.currentTimeMillis() - 3600000,
            device = "Android Studio Emulator (Pixel 8)",
            ip = "127.0.0.1 (Local Verified)",
            status = "Success"
        ),
        SecurityLog(
            id = "log-2",
            action = "Kaviyam Reading Engine Cache Synchronized",
            timestamp = System.currentTimeMillis() - 7200000,
            device = "Android Core Client",
            ip = "192.168.1.42 (Encrypted)",
            status = "Success"
        )
    )

    val INITIAL_EMAILS = listOf(
        SimulatedEmail(
            id = "em-1",
            recipient = "rajaboopathi1021@gmail.com",
            subject = "Welcome to Kaviyam Reading! 📖",
            body = """
Dear Boopathi Raja,

Welcome to Kaviyam Reading, your premier destination for classic Tamil literature, contemporary masterpieces, and AI-powered storytelling!

Your profile has been synthesized with verified status. You now have full access to our curated Tamil classics including Ponniyin Selvan, audio narration via Text-to-Speech, and our interactive Kaviyam AI Companion.

[Action: VerifyEmail; email=rajaboopathi1021@gmail.com]

Happy Reading,
The Kaviyam Literary Team
            """.trimIndent(),
            sentAt = System.currentTimeMillis() - 86400000,
            read = false,
            category = "Auth"
        ),
        SimulatedEmail(
            id = "em-2",
            recipient = "rajaboopathi1021@gmail.com",
            subject = "Security Notice: 2FA & Password Reset Protocols",
            body = """
Security Protocol Update:

Your Kaviyam security sandbox actively protects all sessions. If you ever need to reset your account password, use the encrypted one-time recovery token below:

[Action: ResetPassword; token=kvm-sec-849204]

If you did not request this action, your credentials remain safe inside the encrypted local store.
            """.trimIndent(),
            sentAt = System.currentTimeMillis() - 43200000,
            read = false,
            category = "Security"
        )
    )
}
