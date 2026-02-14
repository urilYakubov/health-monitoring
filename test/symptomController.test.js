// 🔥 MUST mock before imports
jest.mock('../src/models/symptomModel');
jest.mock('../src/utils/auditLogger');

const request = require('supertest');
const express = require('express');

const symptomModel = require('../src/models/symptomModel');
const { logAudit } = require('../src/utils/auditLogger');
const symptomController = require('../src/controllers/symptomController');

beforeEach(() => {
  jest.clearAllMocks();
});

const app = express();
app.use(express.json());

app.post(
  '/symptoms',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  symptomController.createSymptom
);

app.get(
  '/symptoms',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  symptomController.getSymptoms
);

describe('Symptom Controller', () => {

  test('should create symptom and log audit', async () => {
    symptomModel.saveSymptom.mockResolvedValue({ id: 55 });

    const response = await request(app)
      .post('/symptoms')
      .send({
        symptom: 'Headache',
        severity: 6,
        notes: 'Mild throbbing'
      });

    expect(response.statusCode).toBe(200);

    expect(symptomModel.saveSymptom).toHaveBeenCalledWith({
      user_id: 1,
      symptom: 'Headache',
      severity: 6,
      notes: 'Mild throbbing'
    });

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 1,
        action: 'CREATE_SYMPTOM',
        entity: 'user_symptoms',
        entityId: 55
      })
    );
  });

  test('should log audit on create failure', async () => {
    symptomModel.saveSymptom.mockRejectedValue(new Error('DB error'));

    const response = await request(app)
      .post('/symptoms')
      .send({
        symptom: 'Headache',
        severity: 6
      });

    expect(response.statusCode).toBe(500);

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_SYMPTOM_FAILED'
      })
    );
  });

  test('should get user symptoms', async () => {
    symptomModel.getUserSymptoms.mockResolvedValue([
      { id: 1, symptom: 'Fatigue' }
    ]);

    const response = await request(app)
      .get('/symptoms');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);

    expect(symptomModel.getUserSymptoms).toHaveBeenCalledWith(1);
  });

});
