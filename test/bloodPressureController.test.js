// 🔥 MUST mock first
jest.mock('../src/services/bloodPressureService');
jest.mock('../src/utils/auditLogger');

const request = require('supertest');
const express = require('express');

const bpService = require('../src/services/bloodPressureService');
const { logAudit } = require('../src/utils/auditLogger');
const bpController = require('../src/controllers/bloodPressureController');

beforeEach(() => {
  jest.clearAllMocks();
});

const app = express();
app.use(express.json());

app.post(
  '/bp',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  bpController.createBloodPressure
);

describe('BloodPressure Controller', () => {

  test('should return 400 if values are not numbers', async () => {
    const response = await request(app)
      .post('/bp')
      .send({
        systolic: "120",
        diastolic: 80
      });

    expect(response.statusCode).toBe(400);
    expect(bpService.recordBloodPressure).not.toHaveBeenCalled();
    expect(logAudit).not.toHaveBeenCalled();
  });

  test('should record BP and log audit', async () => {
    bpService.recordBloodPressure.mockResolvedValue({ id: 99 });

    const response = await request(app)
      .post('/bp')
      .send({
        systolic: 120,
        diastolic: 80,
        timeOfDay: 'morning',
        posture: 'sitting',
        device: 'Omron'
      });

    expect(response.statusCode).toBe(201);

    expect(bpService.recordBloodPressure).toHaveBeenCalled();

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        action: 'CREATE_BLOOD_PRESSURE',
        entity: 'blood_pressure_readings',
        entityId: 99
      })
    );
  });

  test('should log audit on failure', async () => {
    bpService.recordBloodPressure.mockRejectedValue(new Error('DB error'));

    const response = await request(app)
      .post('/bp')
      .send({
        systolic: 120,
        diastolic: 80
      });

    expect(response.statusCode).toBe(500);

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_BLOOD_PRESSURE_FAILED'
      })
    );
  });

});
