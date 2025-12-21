const insightsService = require("../services/insightsService");

exports.getInsights = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const insights = await insightsService.getInsightCards(
    userId,
    startDate,
    endDate
  );

  res.json(insights);
};
