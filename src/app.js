const express = require('express');
const path = require('path');
require('dotenv').config();

const { authenticateToken, authenticatePage } = require('./middleware/authMiddleware');

const app = express();
app.use(express.json());

// ---- DATABASE ----
require('./config/db');
const initDb = require('./config/dbInit');
initDb()
  .then(() => console.log("✅ Database initialized"))
  .catch(err => console.error("❌ DB init failed:", err));

// ---- STATIC FILES ----
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

// ✅ Serve environment variable to frontend
app.get('/env.js', (req, res) => {
  res.type('application/javascript');
  res.send(`window.env = { BASE_URL: "${process.env.BASE_URL || ''}" };`);
});

// ---- PAGE ROUTES ----
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard.html", authenticatePage, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

// ---- API ROUTES ----
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', authenticateToken, protectedRoutes);

const alertRoutes = require('./routes/alertRoutes');
app.use('/api', authenticateToken, alertRoutes);

try {
  const healthRoutes = require('./routes/healthRoutes');
  app.use('/api', authenticateToken, healthRoutes);
  console.log('✅ healthRoutes loaded from app.js');
} catch (err) {
  console.error('❌ Failed to load healthRoutes:', err);
}

// ---- OTHER ROUTES ----
const fitbitRoutes = require('./routes/fitbitRoutes');
app.use('/', fitbitRoutes);

const withingsRoutes = require("./routes/withingsRoutes");
app.use("/", withingsRoutes);

const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api", feedbackRoutes);

const symptomRoutes = require('./routes/symptomRoutes');
app.use('/api/symptoms', symptomRoutes);
console.log("symptomRoutes loaded from app.js");

// ---- START SERVER ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

console.log('App started');