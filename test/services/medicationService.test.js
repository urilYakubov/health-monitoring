const medicationService = require('../../src/services/medicationService');
const medicationModel = require('../../src/models/medicationModel');

jest.mock('../../src/models/medicationModel');

describe('medicationService duplicate check', () => {

  it('should throw 409 if duplicate active medication exists', async () => {

    medicationModel.checkDuplicateMedication.mockResolvedValue(true);

    await expect(
      medicationService.addMedication({
        userId: 1,
        name: 'Amlodipine',
        started_at: '2025-01-01'
      })
    ).rejects.toMatchObject({
      message: 'Duplicate active medication detected',
      statusCode: 409
    });

  });

});
