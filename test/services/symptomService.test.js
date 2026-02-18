const symptomService = require('../../src/services/symptomService');
const symptomModel = require('../../src/models/symptomModel');

jest.mock('../../src/models/symptomModel');

describe('symptomService duplicate check', () => {

  it('should throw 409 if duplicate symptom exists', async () => {

    symptomModel.checkDuplicateSymptom.mockResolvedValue(true);

    await expect(
      symptomService.createSymptom({
        userId: 1,
        symptom: 'Headache',
        severity: 3
      })
    ).rejects.toMatchObject({
      message: 'Duplicate symptom detected',
      statusCode: 409
    });

  });

});
