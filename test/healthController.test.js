// 🔥 Mock everything first
jest.mock('../src/models/healthModel');
jest.mock('../src/models/userModel');
jest.mock('../src/models/alertModel');
jest.mock('../src/services/alertService');
jest.mock('../src/services/trendDetectionService');
jest.mock('../src/services/forecastService');
jest.mock('../src/services/metricService');
jest.mock('../src/utils/auditLogger');

const request = require('supertest');
const express = require('express');

const { createMetricInternal } = require('../src/services/metricService');
const { getMetricsByUser } = require('../src/models/healthModel');
const { forecastMetric } = require('../src/services/forecastService');
const { logAudit } = require('../src/utils/auditLogger');

const healthController = require('../src/controllers/healthController');

beforeEach(() => {
  jest.clearAllMocks();
});

const app = express();
app.use(express.json());

app.post(
  '/metrics',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  healthController.createMetric
);

app.get(
  '/metrics',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  healthController.listMetrics
);

app.get(
  '/forecast',
  (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
  healthController.forecastMetricRoute
);

describe('Health Controller', () => {

  // -------------------------
  // CREATE METRIC
  // -------------------------

  test('should return 400 if invalid input', async () => {
    const response = await request(app)
      .post('/metrics')
      .send({ metricType: 'heart_rate' });

    expect(response.statusCode).toBe(400);
    expect(createMetricInternal).not.toHaveBeenCalled();
  });

  test('should create metric and log audit', async () => {
    createMetricInternal.mockResolvedValue({ id: 101 });

    const response = await request(app)
      .post('/metrics')
      .send({
        metricType: 'heart_rate',
        value: 75
      });

    expect(response.statusCode).toBe(201);

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_METRIC',
        entity: 'health_data',
        entityId: 101
      })
    );
  });

  test('should log audit on create failure', async () => {
    createMetricInternal.mockRejectedValue(new Error('DB error'));

    const response = await request(app)
      .post('/metrics')
      .send({
        metricType: 'heart_rate',
        value: 75
      });

    expect(response.statusCode).toBe(500);

    expect(logAudit).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'CREATE_METRIC_FAILED'
      })
    );
  });

  // -------------------------
  // LIST METRICS
  // -------------------------

  test('should list user metrics', async () => {
    getMetricsByUser.mockResolvedValue([{ id: 1, value: 100 }]);

    const response = await request(app).get('/metrics');

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(1);
  });

  // -------------------------
  // FORECAST
  // -------------------------

  test('should return 400 if metricType missing', async () => {
    const response = await request(app).get('/forecast');

    expect(response.statusCode).toBe(400);
  });

  test('should return forecast', async () => {
    forecastMetric.mockResolvedValue([80, 85, 90]);

    const response = await request(app)
      .get('/forecast')
      .query({ metricType: 'heart_rate' });

    expect(response.statusCode).toBe(200);
    expect(response.body.forecast).toBeDefined();
  });

});
