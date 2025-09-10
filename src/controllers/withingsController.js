// controllers/withingsController.js
const withingsService = require("../services/withingsService");

exports.connectWithings = (req, res) => {
  const token = req.query.jwt;
  if (!token) return res.status(401).json({ message: "JWT missing" });

  const authUrl = withingsService.getAuthorizationUrl(token);
  res.redirect(authUrl);
};

exports.handleCallback = async (req, res) => {
  const code = req.query.code;
  const state = req.query.state; // JWT
  if (!code || !state) return res.status(400).json({ message: "Missing code or JWT" });

  try {
    const result = await withingsService.processCallback(code, state);
	
	// ✅ Send a page back to the popup that notifies the parent window
    res.send(`
      <html>
        <body>
          <script>
            window.opener.postMessage('withings-connected', '*');
            window.close();
          </script>
        </body>
      </html>
    `);
	
  } catch (err) {
    console.error("❌ Withings callback error:", err);
    res.status(500).json({ message: "Failed to connect Withings" });
  }
};