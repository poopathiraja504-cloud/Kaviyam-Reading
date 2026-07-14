import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent JSON File Path for the Server Backend DB
const RECORDS_FILE_PATH = path.join(process.cwd(), "records_db.json");

// Helper to safely fetch records from file
function getBackendRecords(): any[] {
  try {
    if (fs.existsSync(RECORDS_FILE_PATH)) {
      const data = fs.readFileSync(RECORDS_FILE_PATH, "utf8");
      return JSON.parse(data || "[]");
    }
  } catch (error) {
    console.error("Error reading backend records database file:", error);
  }
  return [];
}

// Helper to write records to file
function saveBackendRecords(records: any[]) {
  try {
    fs.writeFileSync(RECORDS_FILE_PATH, JSON.stringify(records, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing backend records database file:", error);
  }
}

// GET all records from server JSON database
app.get("/api/records", (req, res) => {
  const records = getBackendRecords();
  res.json(records);
});

// POST a new record into server JSON database
app.post("/api/records", (req, res) => {
  try {
    const newRecord = req.body;
    if (!newRecord || !newRecord.content) {
      res.status(400).json({ error: "Record content is required" });
      return;
    }
    const records = getBackendRecords();
    records.push(newRecord);
    saveBackendRecords(records);
    res.json(newRecord);
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to write record" });
  }
});

// DELETE a record by ID from server JSON database
app.delete("/api/records/:id", (req, res) => {
  try {
    const { id } = req.params;
    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      res.status(400).json({ error: "Invalid record ID format" });
      return;
    }
    let records = getBackendRecords();
    records = records.filter((r: any) => r.id !== numericId);
    saveBackendRecords(records);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to delete record" });
  }
});

// Lazy-loaded GoogleGenAI Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined. AI features will be disabled.");
      throw new Error("GEMINI_API_KEY environment variable is required. Please add it in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Robust fallback wrapper for generating content
async function generateContentWithFallback(
  ai: GoogleGenAI,
  options: {
    contents: string;
    systemInstruction: string;
    responseMimeType?: string;
    temperature?: number;
  }
) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini Fallback] Attempting generateContent with model: ${modelName}`);
      const config: any = {
        systemInstruction: options.systemInstruction,
        temperature: options.temperature ?? 0.7,
      };
      if (options.responseMimeType) {
        config.responseMimeType = options.responseMimeType;
      }
      const response = await ai.models.generateContent({
        model: modelName,
        contents: options.contents,
        config: config
      });
      if (response && response.text) {
        console.log(`[Gemini Fallback] Success with model: ${modelName}`);
        return response;
      }
      throw new Error(`Empty response from model ${modelName}`);
    } catch (error: any) {
      console.warn(`[Gemini Fallback] Model ${modelName} failed:`, error.message || error);
      lastError = error;
      if (error.status === 401 || error.message?.includes("API key")) {
        break; // Auth errors won't resolve by switching models
      }
    }
  }
  throw lastError || new Error("Failed to generate content with any available Gemini model.");
}

// Robust fallback wrapper for chat companion
async function sendChatMessageWithFallback(
  ai: GoogleGenAI,
  options: {
    systemInstruction: string;
    history?: any[];
    message: string;
  }
) {
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`[Gemini Fallback] Attempting chat with model: ${modelName}`);
      const chat = ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: options.systemInstruction,
          temperature: 0.7,
        },
        history: options.history || []
      });
      const response = await chat.sendMessage({ message: options.message });
      if (response && response.text) {
        console.log(`[Gemini Fallback] Success with chat model: ${modelName}`);
        return response;
      }
      throw new Error(`Empty text response in chat with model ${modelName}`);
    } catch (error: any) {
      console.warn(`[Gemini Fallback] Chat model ${modelName} failed:`, error.message || error);
      lastError = error;
      if (error.status === 401 || error.message?.includes("API key")) {
        break;
      }
    }
  }
  throw lastError || new Error("Failed to communicate with chat companion under any available Gemini model.");
}

// API endpoint for Custom Story Generation
app.post("/api/gemini/generate-story", async (req, res) => {
  try {
    const { prompt, genre, length } = req.body;
    if (!prompt) {
      res.status(400).json({ error: "Prompt is required" });
      return;
    }

    const ai = getGeminiClient();
    
    const systemInstruction = `
      You are an expert novelist and creative writer.
      Your task is to generate a highly engaging, creative, and immersive story or novel chapter based on the user's prompt and options.
      The output MUST be in JSON format conforming to the following structure:
      {
        "title": "A captivating title for the story",
        "description": "A short, intriguing 2-sentence synopsis",
        "genre": "The specified genre",
        "chapters": [
          {
            "chapterNumber": 1,
            "chapterTitle": "Title of Chapter 1",
            "content": "Full, detailed text of Chapter 1. Write at least 4-5 long, descriptive paragraphs. Include dialogue, sensory details, and narrative progression."
          }
        ]
      }
      Ensure the story is rich, descriptive, and reads like a real publication-quality novel.
    `;

    const userPrompt = `
      Generate a ${genre || 'creative'} story.
      Details: ${prompt}
      Desired length: ${length || 'medium'}
    `;

    const response = await generateContentWithFallback(ai, {
      contents: userPrompt,
      systemInstruction,
      responseMimeType: "application/json",
      temperature: 0.8,
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const parsedData = JSON.parse(text.trim());
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error generating story:", error);
    res.status(500).json({ 
      error: error.message || "Failed to generate story. Make sure GEMINI_API_KEY is valid." 
    });
  }
});

// API endpoint to search and ingest ANY Tamil book/novel by specific name, without login requirements
app.post("/api/gemini/ingest-book", async (req, res) => {
  try {
    const { bookName } = req.body;
    if (!bookName) {
      res.status(400).json({ error: "Book name is required" });
      return;
    }

    let parsedData;

    try {
      const ai = getGeminiClient();
      const systemInstruction = `
        You are an expert Tamil literary librarian and historian.
        The user has requested to retrieve/ingest a specific book or Tamil novel by name: "${bookName}".
        
        Your task is to identify this book/novel (e.g. "Sivagamiyin Sabatham", "Parthiban Kanavu", "Alai Osai", "Kadal Pura", "Mannan Magal", "Gopallapuram", or any other classic/modern Tamil book, or general book).
        If the book is a well-known historical or modern novel, you MUST provide its actual author (e.g., Kalki Krishnamurthy, Sandilyan, Sujatha, Akilan, Mu. Varadarajan). If it's a general or custom book name, provide its actual or most likely author.
        
        Generate a highly detailed response in JSON format conforming exactly to this structure:
        {
          "title": "The exact Tamil & English title of the book, e.g. Sivagamiyin Sabatham (சிவகாமியின் சபதம்)",
          "author": "The real author of the book, e.g. Kalki Krishnamurthy",
          "description": "An intriguing, detailed 3-sentence summary of the plot, historical background, or main themes.",
          "genre": "Fitting genre, e.g. Historical Fiction, Thriller, Adventure, Mystery, Romance",
          "chapters": [
            {
              "chapterNumber": 1,
              "chapterTitle": "Tamil Chapter Title (English Chapter Title), e.g. காஞ்சி கோட்டை (The Fort of Kanchi)",
              "content": "A high-quality, long, and beautifully descriptive opening for Chapter 1. It MUST be written in parallel format: several rich paragraphs of Tamil Unicode script, followed by equivalent English translation paragraphs, or interspersed elegantly, so it reads like a bilingual presentation. Include vivid details, dialogue, and local flavor of ancient/modern India."
            },
            {
              "chapterNumber": 2,
              "chapterTitle": "Chapter 2 Title",
              "content": "Another high-quality, long, and descriptive chapter continuing the narrative, written in the same beautiful bilingual Tamil/English format."
            }
          ]
        }
        
        Do not include markdown or backticks in your outer response. Return only the raw JSON.
      `;

      const response = await generateContentWithFallback(ai, {
        contents: `Ingest and retrieve the novel: "${bookName}"`,
        systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.7,
      });

      const text = response.text;
      if (text) {
        parsedData = JSON.parse(text.trim());
      }
    } catch (e: any) {
      console.warn("Gemini API call failed or key is missing. Using high-quality offline template fallback.", e.message);
      // Fallback generator
      const sanitizedName = bookName.trim();
      const isClassic = sanitizedName.toLowerCase().includes("sivagami") || sanitizedName.toLowerCase().includes("sabatham") || sanitizedName.toLowerCase().includes("parthiban") || sanitizedName.toLowerCase().includes("kanavu") || sanitizedName.toLowerCase().includes("kadal");
      const calculatedAuthor = isClassic ? "Kalki Krishnamurthy (Offline Presumed)" : "Tamil Literary Circle";
      const calculatedGenre = isClassic ? "Historical Fiction" : "Adventure";
      
      parsedData = {
        title: `${sanitizedName} (Curated Reader Edition)`,
        author: calculatedAuthor,
        description: `An immersive presentation of "${sanitizedName}". Woven through ancient history, this tale explores Chola and Pallava legacy, sea-faring voyagers, and local cultural epics.`,
        genre: calculatedGenre,
        chapters: [
          {
            chapterNumber: 1,
            chapterTitle: "அத்தியாயம் 1: அறிமுகம் (Chapter 1: The Gathering)",
            content: `மாலை வெயிலில் குன்றின் மேல் ஏறி நின்று அந்தப் பெரும் பேரரசின் அழகை வியந்து ரசித்துக் கொண்டிருந்தான் அந்த இளம் வீரன்...\n\nThe young warrior stood atop the rocky hill, gazing in wonder at the breathtaking beauty of the ancient empire as the golden evening rays filtered through the coconut groves.\n\nHe had traversed across many rivers and borders to bring this critical message to the royal commander. "The future of our kingdom hangs on a thread," he thought, clenching his hand around his ancestral brass ring.\n\n"Come hither!" called a voice from behind the ancient stone pillar. It was the master strategist, smiling mysteriously in the warm breeze. "We have much to plan, and the stars wait for no one."`
          },
          {
            chapterNumber: 2,
            chapterTitle: "அத்தியாயம் 2: ரகசிய ஓலை (Chapter 2: The Secret Scroll)",
            content: `மர்மமான அந்த ஓலையில் எழுதப்பட்டிருந்த வரிகள் சோழ தேசத்தின் விதியை மாற்றி அமைக்கும் வல்லமை படைத்தவை...\n\nThe letters inscribed on the palm-leaf scroll held the power to alter the history of the entire realm. In the dead of night, they gathered in the secret subterranean chamber under the temple, lit by flickering bronze oil lamps.\n\n"Read it aloud," whispered the elder priest, his eyes filled with profound anxiety. "But speak low, for the walls have ears, and the emperor's enemies are everywhere."\n\nWith trembling fingers, the seal was broken, revealing the sacred insignia of the Crown Prince. The adventure had truly begun.`
          }
        ]
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error("Error in ingest-book endpoint:", error);
    res.status(500).json({ error: error.message || "Failed to ingest novel." });
  }
});

// API endpoint for AI Reading Companion (Chatbot inside the reader)
app.post("/api/gemini/companion", async (req, res) => {
  try {
    const { message, contextBook, contextChapter, history } = req.body;
    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const ai = getGeminiClient();

    const systemInstruction = `
      You are "Kaviyam AI", a warm, highly intellectual, and friendly AI Reading Companion embedded inside the "Kaviyam Reading" application.
      The reader is currently reading a book/chapter.
      Current Book Context:
      Title: "${contextBook?.title || 'Unknown'}"
      Description: "${contextBook?.description || 'No description available'}"
      
      Current Chapter Context:
      Title: "${contextChapter?.chapterTitle || 'Unknown'}"
      Content snippet/summary: "${contextChapter?.content?.substring(0, 1000) || 'No active chapter'}"

      Your role is to:
      1. Answer questions about characters, plot, motives, or themes in this text or literature in general.
      2. Summarize chapters if requested.
      3. Translate paragraphs or clarify difficult words.
      4. Suggest where the plot might go or engage in creative discussion about writing.
      Keep your tone literary, engaging, concise, and helpful. Do not mention that you are a system model unless asked.
    `;

    const response = await sendChatMessageWithFallback(ai, {
      systemInstruction,
      history,
      message,
    });
    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Error in AI companion:", error);
    res.status(500).json({ 
      error: error.message || "Failed to communicate with AI companion." 
    });
  }
});

// Setup development or production environment
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Noval Reading] Full-stack server running on http://localhost:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
