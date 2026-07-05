const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// ── Routes ─────────────────────────────────────────────────────────────────
app.use("/api/auth",         require("./routes/auth"));
app.use("/api/accounts",     require("./routes/accounts"));
app.use("/api/transactions", require("./routes/transactions"));

// ── Currencies ─────────────────────────────────────────────────────────────
app.get("/api/currencies", (req, res) => {
  res.json({
    base: "INR",
    currencies: [
      { code:"INR", symbol:"Rs",  name:"Indian Rupee",      rate:1      },
      { code:"USD", symbol:"$",   name:"US Dollar",         rate:0.012  },
      { code:"EUR", symbol:"EU",  name:"Euro",              rate:0.011  },
      { code:"GBP", symbol:"GBP", name:"British Pound",     rate:0.0095 },
      { code:"CAD", symbol:"C$",  name:"Canadian Dollar",   rate:0.016  },
      { code:"AUD", symbol:"A$",  name:"Australian Dollar", rate:0.018  },
      { code:"JPY", symbol:"JPY", name:"Japanese Yen",      rate:1.89   },
      { code:"CHF", symbol:"Fr",  name:"Swiss Franc",       rate:0.011  },
      { code:"SGD", symbol:"S$",  name:"Singapore Dollar",  rate:0.016  },
      { code:"AED", symbol:"AED", name:"UAE Dirham",        rate:0.044  }
    ]
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status:"ok", db: mongoose.connection.readyState === 1 ? "connected" : "disconnected", time: new Date() });
});

// ── Start server immediately, connect MongoDB in background ─────────────────
app.listen(PORT, () => {
  console.log("\nExpenseAI API running on http://localhost:" + PORT);
  console.log("Endpoints: /api/auth  /api/accounts  /api/transactions  /api/currencies\n");
});

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI || MONGO_URI.includes("<username>") || MONGO_URI.includes("YOUR_USER")) {
  console.warn("WARNING: MONGO_URI not configured in server/.env");
  console.warn("Set your MongoDB Atlas URI to enable data persistence.");
  console.warn("Get free cluster at: https://cloud.mongodb.com\n");
} else {
  mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 10000 })
    .then(() => console.log("MongoDB Atlas connected successfully"))
    .catch(err => {
      console.error("MongoDB connection failed:", err.message);
      console.error("App is running but data will not persist. Fix your MONGO_URI in server/.env\n");
    });
}
