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
/* ADMIN WITHDRAWAL PANEL */

app.get("/admin/withdrawals", async (req, res) => {
  try {
    const key = req.query.key;

    if (!process.env.ADMIN_KEY || key !== process.env.ADMIN_KEY) {
      return res.status(401).send("Unauthorized");
    }

    const withdrawals = await db
      .collection("withdrawals")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Admin Withdrawals</title>
        <style>
          body {
            font-family: Arial;
            background: #111827;
            color: white;
            padding: 20px;
          }
          .card {
            background: #1f2937;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 12px;
          }
          h1 { color: #ffd21c; }
          .pending { color: #ffd21c; }
          .paid { color: #4ade80; }
        </style>
      </head>
      <body>
        <h1>💸 Withdrawal Requests</h1>
    `;

    if (withdrawals.length === 0) {
      html += "<p>No withdrawal requests found.</p>";
    }

    withdrawals.forEach(w => {
      html += `
        <div class="card">
          <p><b>User ID:</b> ${w.userId || ""}</p>
          <p><b>Amount:</b> ₹${w.amount || 0}</p>
          <p><b>UPI ID:</b> ${w.upiId || ""}</p>
          <p><b>Status:</b>
            <span class="${w.status === "paid" ? "paid" : "pending"}">
              ${w.status || "pending"}
            </span>
          </p>
          <p><b>Date:</b> ${w.createdAt || ""}</p>
        </div>
      `;
    });

    html += `
      </body>
      </html>
    `;

    res.send(html);

  } catch (error) {
    console.error(error);
    res.status(500).send("Unable to load withdrawals");
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
