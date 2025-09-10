// services/withingsService.js
const fetch = require("node-fetch");
const withingsModel = require("../models/withingsModel"); // similar to fitbitModel
const jwtLib = require("jsonwebtoken");

exports.getAuthorizationUrl = (jwt) => {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.WITHINGS_CLIENT_ID,
    redirect_uri: process.env.WITHINGS_REDIRECT_URI,
    scope: "user.info,user.metrics",   // common scope for heart/bp/etc
    state: jwt
  });

  return `https://account.withings.com/oauth2_user/authorize2?${params.toString()}`;
};

exports.processCallback = async (code, jwt) => {
  // 1. Decode JWT → get userId
  let payload;
  try {
    payload = jwtLib.verify(jwt, process.env.JWT_SECRET);
  } catch (err) {
    throw new Error("Invalid JWT");
  }
  const userId = payload.id;
  console.log("Decoded userId (Withings):", userId);

  // 2. Exchange code for tokens
  const tokenResponse = await fetch("https://wbsapi.withings.net/v2/oauth2", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "requesttoken",
      grant_type: "authorization_code",
      client_id: process.env.WITHINGS_CLIENT_ID,
      client_secret: process.env.WITHINGS_CLIENT_SECRET,
      code,
      redirect_uri: process.env.WITHINGS_REDIRECT_URI
    })
  });

  const tokenData = await tokenResponse.json();
  console.log("Withings token response:", tokenData);

  if (tokenData.status !== 0) {
    throw new Error("Withings token error: " + JSON.stringify(tokenData));
  }

  const accessToken = tokenData.body.access_token;
  const refreshToken = tokenData.body.refresh_token;
  const expiresAt = new Date(Date.now() + tokenData.body.expires_in * 1000);

  // 3. Save tokens into DB
  await withingsModel.saveUserIntegration(
    userId,
    "withings",
    accessToken,
    refreshToken,
    expiresAt
  );

  console.log("✅ Withings tokens saved for user:", userId);

  // 4. (Optional demo) Fetch user measures (blood pressure / heart rate)
  const measureResponse = await fetch("https://wbsapi.withings.net/measure", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      action: "getmeas",
      access_token: accessToken
    })
  });

  const measureData = await measureResponse.json();  
  const testData = {
	  status: 0,
	  body: {
		measuregrps: [
		  {
			measures: [
			  { value: 120, type: 9, unit: 0 },  // systolic
			  { value: 80, type: 10, unit: 0 }, // diastolic
			  { value: 72, type: 11, unit: 0 }  // heart rate
			]
		  }
		]
	  }
	};
  
  console.log("Withings measure sample:", measureData);
  const measures = [];
  // for dedbugging will use testData instead measureData
  const groups = measureData.body.measuregrps || [];
	for (const group of groups) {
	  for (const m of group.measures) {
		const scaledValue = m.value * Math.pow(10, m.unit);

		if (m.type === 9) {
		  measures.push({ metricType: "blood_pressure_systolic", value: scaledValue });
		} else if (m.type === 10) {
		  measures.push({ metricType: "blood_pressure_diastolic", value: scaledValue });
		} else if (m.type === 11) {
		  measures.push({ metricType: "heart_rate", value: scaledValue });
		}
	  }
	}
	
	for (const measure of measures) {
		await fetch(`${process.env.BASE_URL}/api/metrics`, {
		method: "POST",
		headers: {
		  "Content-Type": "application/json",
		  "Authorization": `Bearer ${jwt}`
		},
		body: JSON.stringify(measure)
	  });
	}

  // Return summary
  return { withings: "✅ Withings connected and token saved", sample: measureData };
};
