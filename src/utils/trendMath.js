exports.computeSlope = (values) => {
  const n = values.length;
  const xAvg = (n - 1) / 2;
  const yAvg = values.reduce((a, b) => a + b) / n;

  let num = 0, den = 0;

  for (let i = 0; i < n; i++) {
    num += (i - xAvg) * (values[i] - yAvg);
    den += (i - xAvg) ** 2;
  }

  return den === 0 ? 0 : num / den;
};
