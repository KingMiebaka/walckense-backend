// api/subscribe.js

const badDomains = [
  "tempmail.com",
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "yopmail.com"
];

function validateEmail(email) {
  const cleaned = email.toLowerCase().trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    return { valid: false, reason: "invalid" };
  }

  const domain = cleaned.split("@")[1];
  if (badDomains.includes(domain)) {
    return { valid: false, reason: "tempmail" };
  }

  return { valid: true, email: cleaned };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  const API_TOKEN = process.env.MAILERLITE_API_TOKEN;
  const GROUP_ID = "188983707142457338";

  const { email } = req.body;

  const validation = validateEmail(email);

  if (!validation.valid) {
    return res.status(400).json({
      status: "error",
      message:
        validation.reason === "tempmail"
          ? "Temporary email addresses are not allowed."
          : "Invalid email address."
    });
  }

  const cleanEmail = validation.email;

  try {
    const response = await fetch(
      "https://connect.mailerlite.com/api/subscribers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_TOKEN}`
        },
        body: JSON.stringify({
          email: cleanEmail,
          groups: [GROUP_ID],
          status: "active"
        })
      }
    );

    const data = await response.json();

    // Already subscribed
    if (response.status === 409) {
      return res.status(200).json({
        status: "exists",
        message: "You are already a subscriber."
      });
    }

    // Any other API error
    if (!response.ok) {
      return res.status(response.status).json({
        status: "error",
        message: "Subscription failed. Please try again.",
        details: data
      });
    }

    // Success
    return res.status(200).json({
      status: "success",
      message: "Welcome! You’ve been successfully added to our newsletter."
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error"
    });
  }
}