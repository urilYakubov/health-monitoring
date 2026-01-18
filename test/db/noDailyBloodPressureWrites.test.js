test("blood pressure service does not write to daily_blood_pressure", async () => {
  const spy = jest.spyOn(pool, "query");

  await bloodPressureService.recordBloodPressure({
    userId: 1,
    systolic: 130,
    diastolic: 85
  });

  const queries = spy.mock.calls.map(c => c[0]);
  const illegal = queries.find(q => q.includes("daily_blood_pressure"));

  expect(illegal).toBeUndefined();
});
