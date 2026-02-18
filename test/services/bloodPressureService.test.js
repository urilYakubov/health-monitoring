const bloodPressureService = require('../../src/services/bloodPressureService');
const bpModel = require('../../src/models/bloodPressureModel');

// We must mock metricService because recordBloodPressure calls it
jest.mock('../../src/services/metricService', () => ({
  createMetricInternal: jest.fn()
}));

jest.mock('../../src/models/bloodPressureModel');

describe('bloodPressureService duplicate check', () => {

  it('should throw 409 if duplicate BP exists', async () => {

    // Simulate duplicate found
    bpModel.duplicateCheck.mockResolvedValue([{ id: 1 }]);

    await expect(
      bloodPressureService.recordBloodPressure({
        userId: 1,
        systolic: 120,
        diastolic: 80,
        measuredAt: new Date(),
        timeOfDay: 'morning',
        posture: 'sitting',
        device: 'home monitor'
      })
    ).rejects.toMatchObject({
      message: 'Duplicate blood pressure reading detected',
      statusCode: 409
    });

  });

});

