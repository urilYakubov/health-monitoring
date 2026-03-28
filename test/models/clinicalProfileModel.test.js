const db = require("../../src/config/db");
const model = require("../../src/models/clinicalProfileModel");

jest.mock('../../src/config/db');

describe('ClinicalProfileModel', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should upsert clinical profile', async () => {
    const mockRow = { user_id: 1, sex: 'male' };

    db.query.mockResolvedValue({ rows: [mockRow] });

    const result = await model.upsert(1, {
      date_of_birth: '1980-01-01',
      sex: 'male',
      height_cm: 180,
      baseline_weight: 80
    });

    expect(db.query).toHaveBeenCalled();
    expect(result).toEqual(mockRow);
  });

  test('should return profile by userId', async () => {
    const mockRow = { user_id: 1 };

    db.query.mockResolvedValue({ rows: [mockRow] });

    const result = await model.findByUserId(1);

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT'),
      [1]
    );
    expect(result).toEqual(mockRow);
  });

});