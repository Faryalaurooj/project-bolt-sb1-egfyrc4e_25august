import express from "express";
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post("/send-text", async (req, res) => {
  const { to, message } = req.body;
  console.log("process.env.TEXTMAGIC_USERNAME",process.env.TEXTMAGIC_USERNAME)

  console.log('📱 TextMagic API: Sending text to:', to, 'Message:', message);

  try {
    const response = await fetch("https://rest.textmagic.com/api/v2/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-TM-Username": "alishahanif",
        "X-TM-Key": "h6F5FJoxqwjPCCc9p6A5pYJoS2yIGQ",
      },
      body: JSON.stringify({
        phones: to,
        text: message,
      }),
    });

    const data = await response.json();
    
    console.log('📱 TextMagic API Response:', data);
    
    if (response.ok && data.id) {
      res.json({ 
        success: true, 
        textmagic_id: data.id,
        status: 'sent',
        message: 'Text sent successfully'
      });
    } else {
      console.error('📱 TextMagic API Error:', data);
      res.status(400).json({ 
        success: false, 
        error: data.message || 'Failed to send text',
        details: data
      });
    }
  } catch (error) {
    console.error("Error sending text:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to send text",
      details: error.message 
    });
  }
});

// Get text message history for a contact (legacy - now uses TextMagic)
router.get("/history/contact/:contactId", authenticateToken, async (req, res) => {
  try {
    // This will be handled by Supabase directly from frontend
    // But we can add backend validation if needed
    res.json({ message: "Use Supabase client for message history" });
  } catch (error) {
    console.error("Error fetching message history:", error);
    res.status(500).json({ error: "Failed to fetch message history" });
  }
});

export default router;
