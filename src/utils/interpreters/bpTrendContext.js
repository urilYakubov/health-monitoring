exports.applyBpContext = ({ interpretation, symptoms = [] }) => {
  if (!interpretation) return null;

  if (
    symptoms.includes("cold_weather") &&
    interpretation.direction === "increasing"
  ) {
    return {
      ...interpretation,
      context: {
        factor: "cold_weather",
        message:
          "Cold weather can raise blood pressure by causing blood vessels to constrict."
      }
    };
  }

  return interpretation;
};
