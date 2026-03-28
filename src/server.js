const app = require('./app');
const initDb = require('./config/dbInit');

const PORT = process.env.PORT || 3000;

initDb()
  .then(() => {
    console.log("✅ Database initialized");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ DB init failed:", err);
    process.exit(1);
  });