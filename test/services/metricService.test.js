const metricService = require('../../src/services/metricService');
const healthModel = require('../../src/models/healthModel');

jest.mock('../../src/models/healthModel');

describe('metricService duplicate check', () => {

  it('should throw 409 if duplicate metric exists', async () => {

    healthModel.duplicateCheck.mockResolvedValue([{ id: 1 }]);

    await expect(
      metricService.createMetric({
        userId: 1,
        metricType: 'heart_rate',
        value: 80
      })
    ).rejects.toMatchObject({
      message: 'Duplicate metric detected',
      statusCode: 409
    });

  });

});
