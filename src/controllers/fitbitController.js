// controllers/fitbitController.js
const fitbitService = require("../services/fitbitService");

exports.connectFitbit = (req, res) => {
  const token = req.query.jwt;
  if (!token) return res.status(401).json({ message: "JWT missing" });

  const authUrl = fitbitService.getAuthorizationUrl(token);
  res.redirect(authUrl);
};

exports.handleCallback = async (req, res) => {
  const code = req.query.code;
  const token = req.query.state; // JWT passed in state

  if (!code) return res.status(400).json({ message: "Missing authorization code" });
  if (!token) return res.status(401).json({ message: "JWT missing" });

  try {
    const result = await fitbitService.processFitbitCallback(code, token);
    	
	res.send(`
	  <html>
		<body>
		  <script>
			// ✅ Tell the dashboard (the opener window)
			window.opener.postMessage('fitbit-connected', '*');
			window.close(); // auto close the popup
		  </script>
		  <p>✅ Fitbit connected. You can close this window.</p>
		</body>
	  </html>
`);
	
  } catch (err) {
    console.error("❌ Error in Fitbit callback:", err);
    res.status(500).json({ message: "Something went wrong with Fitbit connection." });
  }
};