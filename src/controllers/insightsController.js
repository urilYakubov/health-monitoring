const insightsService = require("../services/insightsService");
const clinicalSummaryCard = require("../utils/clinicalSummaryCard");

exports.getInsights = async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  const result = await insightsService.getInsightCards(
    userId,
    startDate,
    endDate
  );

  const correlationInsights = result.insights.filter(
    i => i.type === "correlation"
  );

  const trendInsights = result.insights.filter(
    i => i.type === "bp_trend"
  );

  // ✅ Clinical summary MUST use correlations only
  const clinicalSummary = clinicalSummaryCard.buildClinicalSummaryCard(
    correlationInsights,
    startDate,
    endDate
  );

  res.json({
    correlationInsights,
    trendInsights,
    clinicalSummary
  });
};
