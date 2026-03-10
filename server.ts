import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Database initialization
  let db: any;
  const isPostgres = !!process.env.DATABASE_URL;

  if (isPostgres) {
    console.log("Using Postgres database");
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Initialize Postgres table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        fullName TEXT,
        email TEXT,
        phone TEXT,
        birthYear TEXT,
        organization TEXT,
        location TEXT,
        videoLink TEXT,
        topicTitle TEXT,
        description TEXT,
        canAttendOffline TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db = pool;
  } else {
    console.log("Using SQLite database (local)");
    const sqliteDb = new Database("registrations.db");
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT,
        email TEXT,
        phone TEXT,
        birthYear TEXT,
        organization TEXT,
        location TEXT,
        videoLink TEXT,
        topicTitle TEXT,
        description TEXT,
        canAttendOffline TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    db = sqliteDb;
  }

  app.use(express.json());

  // API routes
  app.post("/api/register", async (req, res) => {
    try {
      const { 
        fullName, email, phone, birthYear, organization, 
        location, videoLink, topicTitle, description, canAttendOffline 
      } = req.body;

      if (isPostgres) {
        await db.query(`
          INSERT INTO registrations (
            fullName, email, phone, birthYear, organization, 
            location, videoLink, topicTitle, description, canAttendOffline
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [fullName, email, phone, birthYear, organization, location, videoLink, topicTitle, description, canAttendOffline]);
      } else {
        const stmt = db.prepare(`
          INSERT INTO registrations (
            fullName, email, phone, birthYear, organization, 
            location, videoLink, topicTitle, description, canAttendOffline
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run(fullName, email, phone, birthYear, organization, location, videoLink, topicTitle, description, canAttendOffline);
      }

      res.status(201).json({ success: true, message: "Registration successful" });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/registrations", async (req, res) => {
    try {
      let rows;
      if (isPostgres) {
        const result = await db.query("SELECT * FROM registrations ORDER BY created_at DESC");
        rows = result.rows;
      } else {
        rows = db.prepare("SELECT * FROM registrations ORDER BY created_at DESC").all();
      }
      res.json(rows);
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch registrations" });
    }
  });

  app.delete("/api/registrations/:id", async (req, res) => {
    try {
      const { id } = req.params;
      if (isPostgres) {
        await db.query("DELETE FROM registrations WHERE id = $1", [id]);
      } else {
        db.prepare("DELETE FROM registrations WHERE id = ?").run(id);
      }
      res.json({ success: true, message: "Registration deleted successfully" });
    } catch (error) {
      console.error("Delete error:", error);
      res.status(500).json({ success: false, message: "Failed to delete registration" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
