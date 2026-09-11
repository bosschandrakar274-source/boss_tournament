const express = require("express");

const app = express();
app.use(express.json());

app.post("/withdraw", (req, res) => {
  const { userId, amount, upiId } = req.body;

  if (!userId || !amount || !upiId) {
    return res.status(400).json({
      success: false,
      message: "userId, amount और upiId जरूरी हैं"
    });
  }

  if (Number(amount) <= 0) {
    return res.status(400).json({
      success: false,
      message: "सही amount डालें"
    });
  }

  // अभी withdrawal request बनाई जा रही है।
  // असली UPI payout के लिए बाद में verified payment/payout provider जोड़ना होगा।

  return res.json({
    success: true,
    status: "pending",
    message: "Withdrawal request received",
    userId,
    amount: Number(amount),
    upiId
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
