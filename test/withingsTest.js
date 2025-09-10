// test/withingsTest.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

function buildWithingsAuthUrl(jwt = "test-jwt") {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.WITHINGS_CLIENT_ID,
    redirect_uri: process.env.WITHINGS_REDIRECT_URI,
    scope: "user.metrics",
    state: jwt,
  });

  return `https://account.withings.com/oauth2_user/authorize?${params.toString()}`;
}

console.log("FITBIT_CLIENT_ID:", process.env.FITBIT_CLIENT_ID);
console.log("WITHINGS_CLIENT_ID:", process.env.WITHINGS_CLIENT_ID);
console.log("WITHINGS_REDIRECT_URI:", process.env.WITHINGS_REDIRECT_URI);

const url = buildWithingsAuthUrl();
console.log("\n👉 Test Withings Auth URL:");
console.log(url);
