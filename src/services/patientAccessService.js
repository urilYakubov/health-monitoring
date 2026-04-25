const patientAccessModel = require("../models/patientAccessModel");
const riskScoreService = require("./riskScoreService");

async function getPatientsWithRisk(doctorId) {
  const patients = await patientAccessModel.getPatientsForDoctor(doctorId);

  const enriched = patients.map((p) => {
    const risk = riskScoreService.calculateRiskV2(p); // no await needed if sync

    return {
      ...p,
      risk_score: risk.score,
      risk_level: risk.level,
      risk_reasons: risk.reasons,
	  risk_action: risk.action
    };
  });

  return enriched.sort((a, b) => b.risk_score - a.risk_score);
}

module.exports = {
  getPatientsWithRisk
};
