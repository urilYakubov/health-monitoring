const controller = require('../../src/controllers/clinicalProfileController');
const service = require('../../src/services/clinicalProfileService');

jest.mock('../../src/services/clinicalProfileService');

describe('ClinicalProfileController', () => {

  let req, res;

  beforeEach(() => {
    req = {
      user: { userId: 1 },
      body: {}
    };

    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('saveProfile should return saved profile', async () => {
    const mockProfile = { user_id: 1 };

    service.saveClinicalProfile.mockResolvedValue(mockProfile);

    await controller.saveProfile(req, res);

    expect(service.saveClinicalProfile).toHaveBeenCalledWith(1, req.body);
    expect(res.json).toHaveBeenCalledWith(mockProfile);
  });

  test('getProfile should return profile', async () => {
    const mockProfile = { user_id: 1 };

    service.getClinicalProfile.mockResolvedValue(mockProfile);

    await controller.getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith(mockProfile);
  });

  test('getProfile should return empty object if not found', async () => {
    service.getClinicalProfile.mockResolvedValue(null);

    await controller.getProfile(req, res);

    expect(res.json).toHaveBeenCalledWith({});
  });

});