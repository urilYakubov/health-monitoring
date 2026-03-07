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

  // ✅ Clinical summary MUST use correlations only
  const clinicalSummary = clinicalSummaryCard.buildClinicalSummaryCard(
    correlationInsights,
    startDate,
    endDate,
	result.summaryStats
  );

  res.json({
	insights: result.insights,
    clinicalSummary
  });
};

exports.getPatientInsights = async (req, res) => {

  const patientId = req.params.patientId;
  const { startDate = null, endDate = null } = req.query;

  const result = await insightsService.getInsightCards(patientId, startDate, endDate);
  
  const correlationInsights = result.insights.filter(
    i => i.type === "correlation"
  );

  const clinicalSummary = clinicalSummaryCard.buildClinicalSummaryCard(
    correlationInsights,
    startDate,
    endDate,
	result.summaryStats
  );

  res.json({
	insights: result.insights,
    clinicalSummary
  });

};
