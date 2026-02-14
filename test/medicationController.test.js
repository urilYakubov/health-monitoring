jest.mock('../src/services/medicationService');
jest.mock('../src/utils/auditLogger');

const request = require('supertest');
const express = require('express');

const medicationService = require('../src/services/medicationService');
const { logAudit } = require('../src/utils/auditLogger');
const medicationController = require('../src/controllers/medicationController');

beforeEach(() => {
  jest.clearAllMocks();
});

const app = express();
app.use(express.json());

app.post(
  '/medication',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  medicationController.addMedication
);

test('should create medication and log audit', async () => {
  medicationService.addMedication.mockResolvedValue({ id: 10 });

  const response = await request(app)
    .post('/medication')
    .send({
      name: "Metformin",
      started_at: "2025-01-01"
    });

  expect(response.statusCode).toBe(201);
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({
      userId: 1,
      action: 'ADD_MEDICATION',
      entity: 'user_medications'
    })
  );
});

test('should log audit on medication failure', async () => {
  medicationService.addMedication.mockRejectedValue(new Error('DB error'));

  const response = await request(app)
    .post('/medication')
    .send({
      name: "Metformin",
      started_at: "2025-01-01"
    });

  expect(response.statusCode).toBe(500);
  expect(logAudit).toHaveBeenCalledWith(
    expect.objectContaining({
      action: 'ADD_MEDICATION_FAILED'
    })
  );
});
