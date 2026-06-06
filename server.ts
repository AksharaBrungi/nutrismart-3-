import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { analyzeFoodImage, getRecommendationsForMacros, reverseNutritionSearch } from "./geminiService";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "nutrismart-secret-key";

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json());

  // Database initialization
  const db = await open({
    filename: "./database.sqlite",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT,
      daily_targets TEXT,
      water_total INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS history (
      id TEXT PRIMARY KEY,
      user_id INTEGER,
      timestamp INTEGER,
      image TEXT,
      items TEXT,
      total_macros TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    );
  `);

  // Auth Routes
  app.post("/api/register", async (req, res) => {
    const { email, password, name, dailyTargets } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await db.run(
        "INSERT INTO users (email, password, name, daily_targets, water_total) VALUES (?, ?, ?, ?, 0)",
        [email, hashedPassword, name, JSON.stringify(dailyTargets)]
      );
      const token = jwt.sign({ userId: result.lastID }, JWT_SECRET);
      res.json({ token, user: { id: result.lastID, email, name, dailyTargets, waterTotal: 0 } });
    } catch (error) {
      res.status(400).json({ error: "Email already exists" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          dailyTargets: JSON.parse(user.daily_targets),
          waterTotal: user.water_total || 0,
        },
      });
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // User Routes
  app.get("/api/me", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const user = await db.get("SELECT * FROM users WHERE id = ?", [decoded.userId]);
      if (user) {
        res.json({
          id: user.id,
          email: user.email,
          name: user.name,
          dailyTargets: JSON.parse(user.daily_targets),
          waterTotal: user.water_total || 0,
        });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.put("/api/user/targets", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const { dailyTargets } = req.body;
      await db.run(
        "UPDATE users SET daily_targets = ? WHERE id = ?",
        [JSON.stringify(dailyTargets), decoded.userId]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // History Routes
  app.get("/api/history", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const history = await db.all(
        "SELECT * FROM history WHERE user_id = ? ORDER BY timestamp DESC",
        [decoded.userId]
      );
      res.json(
        history.map((h) => ({
          ...h,
          items: JSON.parse(h.items),
          totalMacros: JSON.parse(h.total_macros),
        }))
      );
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.post("/api/history", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const { id, timestamp, image, items, totalMacros } = req.body;
      await db.run(
        "INSERT INTO history (id, user_id, timestamp, image, items, total_macros) VALUES (?, ?, ?, ?, ?, ?)",
        [id, decoded.userId, timestamp, image, JSON.stringify(items), JSON.stringify(totalMacros)]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.delete("/api/history/:id", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const { id } = req.params;
      await db.run("DELETE FROM history WHERE id = ? AND user_id = ?", [id, decoded.userId]);
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.delete("/api/history", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      await db.run("DELETE FROM history WHERE user_id = ?", [decoded.userId]);
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  app.put("/api/user/water", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
      const { waterTotal } = req.body;
      await db.run(
        "UPDATE users SET water_total = ? WHERE id = ?",
        [waterTotal, decoded.userId]
      );
      res.json({ success: true });
    } catch (error) {
      res.status(401).json({ error: "Invalid token" });
    }
  });

  // Proxy Gemini AI Requests Securely Server-side
  app.post("/api/analyze-image", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      jwt.verify(token, JWT_SECRET);
      const { base64Image, targets } = req.body;
      const result = await analyzeFoodImage(base64Image, targets);
      res.json(result);
    } catch (error: any) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze image" });
    }
  });

  app.post("/api/recommendations", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      jwt.verify(token, JWT_SECRET);
      const { macros, targets } = req.body;
      const result = await getRecommendationsForMacros(macros, targets);
      res.json(result);
    } catch (error: any) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: error.message || "Failed to get recommendations" });
    }
  });

  app.post("/api/reverse-search", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    try {
      jwt.verify(token, JWT_SECRET);
      const { inputMacros } = req.body;
      const result = await reverseNutritionSearch(inputMacros);
      res.json(result);
    } catch (error: any) {
      console.error("AI Server Error:", error);
      res.status(500).json({ error: error.message || "Failed to do reverse search" });
    }
  });

    // Vite middleware for development or static serving for production
  const isProd = process.env.NODE_ENV === "production";
  const distPath = path.join(__dirname, "dist");

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }else {
  app.use(express.static(distPath));

  app.use((req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 NutriSmart server running on port ${PORT}`);
  });
}

startServer();
