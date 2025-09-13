const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

require('./config/db'); // DB connection// ✅ Auto-create tables when server starts

const initDb = require('./config/dbInit');
initDb()
  .then(() => console.log("✅ Database initialized"))
  .catch(err => console.error("❌ DB init failed:", err));



const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes);

const alertRoutes = require('./routes/alertRoutes');
app.use('/api', alertRoutes);

try {
  const healthRoutes = require('./routes/healthRoutes');
  app.use('/api', healthRoutes);
  console.log('✅ healthRoutes loaded from app.js');
} catch (err) {
  console.error('❌ Failed to load healthRoutes:', err);
}

const fitbitRoutes = require('./routes/fitbitRoutes');
app.use('/', fitbitRoutes);   // now /connect-fitbit works

const withingsRoutes = require("./routes/withingsRoutes");
app.use("/", withingsRoutes);

const feedbackRoutes = require("./routes/feedbackRoutes");
app.use("/api", feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));

console.log('App started');

