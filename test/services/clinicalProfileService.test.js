const service = require('../../src/services/clinicalProfileService');
const model = require('../../src/models/clinicalProfileModel');

jest.mock('../../src/models/clinicalProfileModel');

describe('ClinicalProfileService', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should save clinical profile', async () => {
    const mockProfile = { user_id: 1 };

    model.upsert.mockResolvedValue(mockProfile);

    const result = await service.saveClinicalProfile(1, {});

    expect(model.upsert).toHaveBeenCalledWith(1, {});
    expect(result).toEqual(mockProfile);
  });

  test('should get clinical profile', async () => {
    const mockProfile = { user_id: 1 };

    model.findByUserId.mockResolvedValue(mockProfile);

    const result = await service.getClinicalProfile(1);

    expect(model.findByUserId).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockProfile);
  });

});