const express = require("express");
const { MongoClient } = require("mongodb");

const app = express();
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "boss_tournament";

let db;

async function connectDB() {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set");
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();

  db = client.db(DB_NAME);
  console.log("MongoDB connected");
}

/* HOME */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Boss Tournament API is running"
  });
});

/* DEPOSIT REQUEST */
app.post("/deposit", async (req, res) => {
  try {
    const { userId, amount, upiId } = req.body;

    if (!userId || !amount || !upiId) {
      return res.status(400).json({
        success: false,
        message: "userId, amount और upiId जरूरी हैं"
      });
    }

    const depositAmount = Number(amount);

    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "सही amount डालें"
      });
    }

    const request = {
      userId: String(userId),
      amount: depositAmount,
      upiId: String(upiId).trim(),
      status: "pending",
      createdAt: new Date()
    };

    const result = await db
      .collection("deposits")
      .insertOne(request);

    res.json({
      success: true,
      status: "pending",
      message: "Deposit request received",
      depositId: result.insertedId.toString()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Deposit request save नहीं हो पाई"
    });
  }
});

/* WITHDRAW REQUEST */
app.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount, upiId } = req.body;

    if (!userId || !amount || !upiId) {
      return res.status(400).json({
        success: false,
        message: "userId, amount और upiId जरूरी हैं"
      });
    }

    const withdrawAmount = Number(amount);

    if (!Number.isFinite(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "सही amount डालें"
      });
    }

    const request = {
      userId: String(userId),
      amount: withdrawAmount,
      upiId: String(upiId).trim(),
      status: "pending",
      createdAt: new Date()
    };

    const result = await db
      .collection("withdrawals")
      .insertOne(request);

    res.json({
      success: true,
      status: "pending",
      message: "Withdrawal request received",
      withdrawalId: result.insertedId.toString()
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Withdrawal request save नहीं हो पाई"
    });
  }
});

/* START SERVER */
const PORT = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit(1);
  });
