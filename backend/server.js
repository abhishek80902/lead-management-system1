require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.json());

// =======================
// MongoDB Connection
// =======================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Error:", err));

// =======================
// Schema
// =======================

const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    phone: String,

    company: String,

    requirement: {
      type: String,
      required: true,
    },

    emailSent: {
      type: Boolean,
      default: false,
    },

    opened: {
      type: Boolean,
      default: false,
    },

    clicked: {
      type: Boolean,
      default: false,
    },

    openCount: {
      type: Number,
      default: 0,
    },

    clickCount: {
      type: Number,
      default: 0,
    },

    openedAt: Date,

    clickedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Lead = mongoose.model("Lead", LeadSchema);

// =======================
// Create Lead
// =======================

app.post("/api/leads", async (req, res) => {
  try {
    const { name, email, phone, company, requirement } = req.body;

    if (!name || !email || !requirement) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Requirement are required",
      });
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      company,
      requirement,
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const openUrl = `${process.env.BASE_URL}/open/${lead._id}`;

    const clickUrl = `${process.env.BASE_URL}/click/${lead._id}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: lead.email,
      subject: "Thank You For Contacting Us",
      html: `
        <h2>Hi ${lead.name} 👋</h2>

        <p>Thank you for reaching out.</p>

        <p>
          We received your requirement:
        </p>

        <blockquote>
          ${lead.requirement}
        </blockquote>

        <p>
          Click below to learn more:
        </p>

        <a href="${clickUrl}">
          Learn More
        </a>

        <img
          src="${openUrl}"
          width="1"
          height="1"
          style="display:none;"
        />
      `,
    });

    lead.emailSent = true;

    await lead.save();

    res.status(201).json({
      success: true,
      message: "Lead Created Successfully",
      lead,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

// =======================
// Open Tracking
// =======================

app.get("/open/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      lead.opened = true;
      lead.openCount += 1;
      lead.openedAt = new Date();

      await lead.save();
    }

    const pixel = Buffer.from(
      "R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
      "base64"
    );

    res.set("Content-Type", "image/gif");

    res.send(pixel);
  } catch (error) {
    console.log(error);

    res.status(500).send("Tracking Error");
  }
});

// =======================
// Click Tracking
// =======================

app.get("/click/:id", async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (lead) {
      lead.clicked = true;
      lead.clickCount += 1;
      lead.clickedAt = new Date();

      await lead.save();
    }

    res.redirect("https://admexo.com");
  } catch (error) {
    console.log(error);

    res.redirect("https://admexo.com");
  }
});

// =======================
// Dashboard Stats
// =======================

app.get("/api/stats", async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();

    const emailsOpened = await Lead.countDocuments({
      opened: true,
    });

    const linksClicked = await Lead.countDocuments({
      clicked: true,
    });

    const openRate =
      totalLeads > 0
        ? ((emailsOpened / totalLeads) * 100).toFixed(1)
        : 0;

    const clickRate =
      totalLeads > 0
        ? ((linksClicked / totalLeads) * 100).toFixed(1)
        : 0;

    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    res.json({
      totalLeads,
      emailsSent: totalLeads,
      emailsOpened,
      openRate,
      linksClicked,
      clickRate,
      leads,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
    });
  }
});

// =======================
// Health Check
// =======================

app.get("/", (req, res) => {
  res.send("Lead Management API Running 🚀");
});

// =======================
// Start Server
// =======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server Running on Port ${PORT}`);
});