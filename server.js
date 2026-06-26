import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs/promises";

dotenv.config();

const require = createRequire(import.meta.url);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "initiatives.json");

const app = express();

// ================================
// CORS
// ================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://walckenseengineering.com",
  "https://www.walckenseengineering.com"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// ================================
// ROOT TEST
// ================================

app.get("/", (req, res) => {
  res.json({
    message: "Walckense backend is running"
  });
});

// ================================
// HEALTH
// ================================

app.get("/health", (req, res) => {
  res.json({
    ok: true,
    message: "Backend running"
  });
});

// ================================
// READ JSON FILE
// ================================

function readInitiatives() {
  try {
    delete require.cache[require.resolve("./initiatives.json")];
    return require("./initiatives.json");
  } catch (error) {
    console.error("Error reading initiatives.json:", error);
    return [];
  }
}

// ================================
// GET ALL INITIATIVES
// ================================

app.get("/initiatives/list", (req, res) => {
  try {
    const initiatives = readInitiatives();
    res.json({
      initiatives,
      total: initiatives.length
    });
  } catch (error) {
    console.error("Error in /initiatives/list:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// ================================
// GET SINGLE INITIATIVE - WITH URL DECODING
// ================================

app.get("/initiatives/:slug", (req, res) => {
  try {
    const decodedSlug = decodeURIComponent(req.params.slug);
    
    const initiatives = readInitiatives();
    const initiative = initiatives.find(
      item => item.slug === decodedSlug
    );

    if (!initiative) {
      console.log(`Initiative not found: ${decodedSlug}`);
      return res.status(404).json({
        error: "Initiative not found"
      });
    }

    res.json(initiative);
  } catch (error) {
    console.error("Error in /initiatives/:slug:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// ================================
// ✅ INCREMENT VIEW - NOW USES QUERY PARAM (FIXES 500 ERROR)
// ================================

app.post("/initiatives/views", async (req, res) => {
  try {
    // Get slug from QUERY PARAM instead of URL
    const { slug } = req.query;
    
    if (!slug) {
      return res.status(400).json({ error: 'Slug is required' });
    }

    console.log(`Incrementing view for: ${slug}`);
    
    // Read initiatives file
    let data;
    try {
      data = await fs.readFile(DATA_FILE, "utf8");
    } catch (readError) {
      console.error("Error reading file:", readError);
      return res.status(500).json({
        error: "Cannot read initiatives file: " + readError.message
      });
    }
    
    let initiatives;
    try {
      initiatives = JSON.parse(data);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return res.status(500).json({
        error: "Invalid JSON in file: " + parseError.message
      });
    }
    
    // Find initiative
    const index = initiatives.findIndex(item => item.slug === slug);
    
    if (index === -1) {
      console.log(`Initiative not found: ${slug}`);
      console.log("Available slugs:", initiatives.map(i => i.slug));
      return res.status(404).json({
        error: "Initiative not found"
      });
    }
    
    // Increment views
    initiatives[index].views = (initiatives[index].views || 0) + 1;
    const newViews = initiatives[index].views;
    
    // Write back to file
    try {
      await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));
    } catch (writeError) {
      console.error("Error writing file:", writeError);
      return res.status(500).json({
        error: "Cannot write to file: " + writeError.message
      });
    }
    
    console.log(`View incremented successfully. New count: ${newViews}`);
    
    res.status(200).json({
      success: true,
      views: newViews,
      slug: slug
    });
  } catch (error) {
    console.error("Error incrementing view:", error);
    res.status(500).json({
      error: error.message
    });
  }
});

// ================================
// CREATE INITIATIVE
// ================================

app.post("/initiatives", (req, res) => {
  try {
    const initiatives = readInitiatives();
    initiatives.push(req.body);
    
    fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));
    
    res.status(201).json(req.body);
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ================================
// UPDATE INITIATIVE
// ================================

app.put("/initiatives/:slug", async (req, res) => {
  try {
    const decodedSlug = decodeURIComponent(req.params.slug);
    
    const data = await fs.readFile(DATA_FILE, "utf8");
    const initiatives = JSON.parse(data);
    const index = initiatives.findIndex(item => item.slug === decodedSlug);
    
    if (index === -1) {
      return res.status(404).json({
        error: "Initiative not found"
      });
    }
    
    initiatives[index] = { ...initiatives[index], ...req.body };
    await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));
    
    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ================================
// DELETE INITIATIVE
// ================================

app.delete("/initiatives/:slug", async (req, res) => {
  try {
    const decodedSlug = decodeURIComponent(req.params.slug);
    
    const data = await fs.readFile(DATA_FILE, "utf8");
    const initiatives = JSON.parse(data);
    const index = initiatives.findIndex(item => item.slug === decodedSlug);
    
    if (index === -1) {
      return res.status(404).json({
        error: "Initiative not found"
      });
    }
    
    initiatives.splice(index, 1);
    await fs.writeFile(DATA_FILE, JSON.stringify(initiatives, null, 2));
    
    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ================================
// LOCAL SERVER
// ================================

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

export default app;