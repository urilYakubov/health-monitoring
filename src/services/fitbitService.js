// services/fitbitService.js
const fetch = require("node-fetch");
const fitbitModel = require("../models/fitbitModel");
const jwtLib = require("jsonwebtoken");

exports.getAuthorizationUrl = (jwt) => {
  return `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${process.env.FITBIT_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.FITBIT_REDIRECT_URI)}&scope=activity%20heartrate%20sleep%20profile&state=${jwt}`;
};

// Step 1: Callback after first connection
exports.processFitbitCallback = async (code, jwt) => {
  let payload;
  try {
    payload = jwtLib.verify(jwt, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid JWT");
  }
  const userId = payload.id;

  // Exchange code for tokens
  const tokenResponse = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `client_id=${process.env.FITBIT_CLIENT_ID}&grant_type=authorization_code&redirect_uri=${encodeURIComponent(process.env.FITBIT_REDIRECT_URI)}&code=${code}`
  });

  const tokenData = await tokenResponse.json();
  if (tokenData.errors) throw new Error(JSON.stringify(tokenData));

  const accessToken = tokenData.access_token;
  const refreshToken = tokenData.refresh_token;
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

  // Save tokens in DB
  await fitbitModel.saveUserIntegration(userId, "fitbit", accessToken, refreshToken, expiresAt);

  // ✅ Immediately fetch & save heart rate once
  await exports.getHeartRateForUser(userId, jwt);

  return { fitbit: "✅ Fitbit connected and heart rate saved successfully" };
};

// Step 2: Refresh token if needed
exports.refreshAccessToken = async (userId, refreshToken) => {
  const response = await fetch("https://api.fitbit.com/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${process.env.FITBIT_CLIENT_ID}:${process.env.FITBIT_CLIENT_SECRET}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  });

  const data = await response.json();
  if (data.errors) throw new Error("Failed to refresh Fitbit token: " + JSON.stringify(data));

  const newAccessToken = data.access_token;
  const newRefreshToken = data.refresh_token;
  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await fitbitModel.saveUserIntegration(userId, "fitbit", newAccessToken, newRefreshToken, expiresAt);

  console.log(`🔄 Refreshed Fitbit token for user ${userId}`);
  return newAccessToken;
};

// Step 3: Central function to fetch HR
exports.getHeartRateForUser = async (userId, jwt) => {
  // Get integration from DB
  const integration = await fitbitModel.getUserIntegration(userId, "fitbit");
  if (!integration) throw new Error("No Fitbit integration found");

  let { access_token, refresh_token, expires_at } = integration;

  // Refresh if expired
  if (!expires_at || new Date() > new Date(expires_at)) {
    access_token = await exports.refreshAccessToken(userId, refresh_token);
  }

  // Fetch HR from Fitbit
  const today = new Date().toISOString().split("T")[0];
  const hrResponse = await fetch(`https://api.fitbit.com/1/user/-/activities/heart/date/${today}/1d.json`, {
    headers: { "Authorization": `Bearer ${access_token}` }
  });
  const hrData = await hrResponse.json();

  let numericValue = 0;
  const hrActivities = hrData["activities-heart"] || [];
  if (hrActivities.length && hrActivities[0].value) {
    numericValue = hrActivities[0].value.restingHeartRate
                || hrActivities[0].value.heartRateZones[0]?.max
                || 0;
  }

  if (numericValue > 0) {
    const result = await fetch(`${process.env.BASE_URL}/api/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${jwt}`
      },
      body: JSON.stringify({
        metricType: "heart_rate",
        value: numericValue
      })
    });

    console.log("💾 Saved HR metric:", await result.json());
  }

  return { message: "✅ Heart rate fetched and saved" };
};
