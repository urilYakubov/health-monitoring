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
  
  const clinicalSummary = clinicalSummaryCard.buildClinicalSummaryCard(
    result.insights,
    startDate,
    endDate
  );
  
  res.json({
    insights: result.insights,
    clinicalSummary
  });
};
