const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(express.json());

// =========================
// Supabase
// =========================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Supabase environment variables are missing!");
  process.exit(1);
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY
);

// =========================
// Deposit
// =========================

app.post("/deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    if (!userId || !amount) {
      return res.status(400).json({
        success: false,
        message: "userId और amount जरूरी है"
      });
    }

    const depositAmount = Number(amount);

    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "सही amount डालें"
      });
    }

    const { data, error } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: String(userId),
        type: "deposit",
        amount: depositAmount,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Deposit error:", error);

      return res.status(500).json({
        success: false,
        message: "Deposit save नहीं हो पाया",
        error: error.message
      });
    }

    return res.json({
      success: true,
      status: "pending",
      message: "Deposit request received",
      transaction: data
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Deposit में error आया"
    });
  }
});

// =========================
// Withdraw
// =========================

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

    const { data, error } = await supabase
      .from("wallet_transactions")
      .insert({
        user_id: String(userId),
        type: "withdraw",
        amount: withdrawAmount,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      console.error("Withdraw error:", error);

      return res.status(500).json({
        success: false,
        message: "Withdraw save नहीं हो पाया",
        error: error.message
      });
    }

    return res.json({
      success: true,
      status: "pending",
      message: "Withdraw request received",
      withdrawId: data.id
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Withdraw में error आया"
    });
  }
});

// =========================
// Test
// =========================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Boss Tournament API is running"
  });
});

// =========================
// Start Server
// =========================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server started on port " + PORT);
});
