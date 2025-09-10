// test/withingsEnvDiag.js
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../.env");
console.log("🔎 Reading .env from:", envPath);

const raw = fs.readFileSync(envPath, "utf8");
console.log("\n--- .env (last 10 lines) ---");
console.log(raw.split(/\r?\n/).slice(-10).join("\n"));

const parsed = dotenv.parse(raw);
console.log("\n--- dotenv.parse keys ---");
console.log(Object.keys(parsed));

console.log("\nValues seen by dotenv.parse:");
console.log("FITBIT_CLIENT_ID:", parsed.FITBIT_CLIENT_ID);
console.log("WITHINGS_CLIENT_ID:", parsed.WITHINGS_CLIENT_ID);
console.log("WITHINGS_REDIRECT_URI:", parsed.WITHINGS_REDIRECT_URI);