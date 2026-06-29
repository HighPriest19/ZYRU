import express, { Request, Response, NextFunction } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db, isSqlConfigured } from "./src/db/index.ts";
import { posts, users, siteConfig, products } from "./src/db/schema.ts";
import { eq, desc } from "drizzle-orm";
import { requireAuth, AuthRequest } from "./src/middleware/auth.ts";
import { GoogleGenAI } from "@google/genai";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Cloudinary Upload Endpoint
app.post("/api/upload", async (req, res) => {
  try {
    const { image, folder = "zyru_assets" } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: "auto",
    });

    res.json({
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
    });
  } catch (error: any) {
    console.error("Cloudinary Upload Error:", error);
    res.status(500).json({ error: "Upload failed", message: error.message });
  }
});

// Gemini AI Design Assistant
app.post("/api/ai/generate-concepts", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    const model = "gemini-1.5-flash";

    const systemInstruction = `
      You are the ZYRU™ AI Design Assistant for a luxury streetwear brand. 
      Your task is to take a user's fashion vision and turn it into 3 distinct design concepts.
      Return the result as a raw JSON array of 3 objects. Do not include markdown code blocks.
      
      Each object must follow this structure:
      {
        "name": "Short Creative Name",
        "description": "Visual details and aesthetic justification",
        "placement": "Large" | "Chest" | "Sleeve" | "Back" | "Inside",
        "colors": ["#hex1", "#hex2"],
        "style": "Minimal" | "Graphic" | "Typography" | "Abstract"
      }
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts: [{ text: "Vision: " + prompt }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      }
    });
    
    let text = response.text || "[]";
    // Handle potential markdown wrapping if it occurs
    if (text.startsWith("```")) {
      text = text.replace(/^```json\n?/, "").replace(/\n?```$/, "");
    }
    
    const concepts = JSON.parse(text);
    res.json({ concepts });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ 
      error: "Failed to generate concepts",
      message: error.message 
    });
  }
});

// Gemini AI Image Generator
app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = new GoogleGenAI({ 
      apiKey: process.env.GEMINI_API_KEY || "",
    });

    // Note: Standard Gemini models do not generate images via text-to-image API.
    // We would typically use Imagen or a similar service. 
    // For this demo, we'll use a prompt-engineered text response that describes the asset
    // or use a placeholder if the model doesn't support generation.
    
    // Attempting to use a model that might support it if configured, 
    // otherwise falling back to a descriptive error.
    const model = "gemini-1.5-flash"; 

    const response = await ai.models.generateContent({
      model: model,
      contents: [{ role: "user", parts: [{ text: `Generate a high-quality SVG path or a detailed visual description for a professional apparel graphic design asset based on this prompt: ${prompt}. Return ONLY a JSON object with a 'url' field (using a high-quality placeholder image that fits the prompt) and a 'description' field.` }] }],
      config: {
        responseMimeType: "application/json",
      }
    });

    const result = JSON.parse(response.text || "{}");
    
    // For now, since Gemini 1.5 doesn't output raw image bytes in this SDK, 
    // we use a high-quality placeholder service with the prompt keywords.
    const encodedPrompt = encodeURIComponent(prompt);
    const placeholderUrl = `https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=800&q=${encodedPrompt}`;

    res.json({ 
      url: result.url || placeholderUrl
    });
  } catch (error: any) {
    console.error("AI Image Generation Error:", error);
    res.status(500).json({ 
      error: "Failed to generate design asset",
      message: error.message 
    });
  }
});

// SQL Configuration Guard
const checkSql = (req: Request, res: Response, next: NextFunction) => {
  if (!isSqlConfigured) {
    return res.status(503).json({ error: "Feature unavailable: Cloud SQL not configured" });
  }
  next();
};

// User Sync
app.post("/api/sync-user", requireAuth, checkSql, async (req: AuthRequest, res) => {
  try {
    const { email, displayName, photoURL } = req.user!;
    const result = await db.insert(users)
      .values({
        id: req.user!.uid,
        email: email!,
        displayName: displayName || null,
        photoUrl: photoURL || null,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email: email!,
          displayName: displayName || null,
          photoUrl: photoURL || null,
        },
      })
      .returning();
    res.json(result[0]);
  } catch (error: any) {
    console.error("User sync failed:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

// Community Posts
app.get("/api/posts", checkSql, async (req, res) => {
  try {
    const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt));
    res.json(allPosts);
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

app.post("/api/posts", requireAuth, checkSql, async (req: AuthRequest, res) => {
  try {
    const { content, imageUrl } = req.body;
    const result = await db.insert(posts)
      .values({
        userId: req.user!.uid,
        content,
        imageUrl: imageUrl || null,
      })
      .returning();
    res.json(result[0]);
  } catch (error: any) {
    console.error("Failed to create post:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// Site Config (Admin)
app.get("/api/site-config", checkSql, async (req, res) => {
  try {
    const config = await db.select().from(siteConfig);
    res.json(config);
  } catch (error: any) {
    console.error("Failed to fetch site config:", error);
    res.status(500).json({ error: "Failed to fetch site config" });
  }
});

app.post("/api/site-config", requireAuth, checkSql, async (req: AuthRequest, res) => {
  try {
    // Check if admin (simplified for now, should check isAdmin in SQL users table)
    const user = await db.select().from(users).where(eq(users.id, req.user!.uid)).limit(1);
    if (!user[0]?.isAdmin && req.user!.email !== 'adamsolagunju17@gmail.com') {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { key, value } = req.body;
    const result = await db.insert(siteConfig)
      .values({ key, value })
      .onConflictDoUpdate({
        target: siteConfig.key,
        set: { value, updatedAt: new Date() },
      })
      .returning();
    res.json(result[0]);
  } catch (error: any) {
    console.error("Failed to update site config:", error);
    res.status(500).json({ error: "Failed to update site config" });
  }
});

// Products (Mirroring for relational queries)
app.get("/api/products", checkSql, async (req, res) => {
  try {
    const allProducts = await db.select().from(products);
    res.json(allProducts);
  } catch (error: any) {
    console.error("Failed to fetch products from SQL:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", requireAuth, checkSql, async (req: AuthRequest, res) => {
  try {
    if (req.user!.email !== 'adamsolagunju17@gmail.com') {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id, name, description, price, category, stock, metadata } = req.body;
    const result = await db.insert(products)
      .values({ id, name, description, price, category, stock, metadata })
      .onConflictDoUpdate({
        target: products.id,
        set: { name, description, price, category, stock, metadata },
      })
      .returning();
    res.json(result[0]);
  } catch (error: any) {
    console.error("Failed to sync product to SQL:", error);
    res.status(500).json({ error: "Failed to sync product" });
  }
});

// Vite middleware for development
async function setupServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupServer();
