const consentController = require("../../src/controllers/consentController");
const consentService = require("../../src/services/consentService");
const logger = require("../../src/utils/logger");

jest.mock("../../src/services/consentService");
jest.mock("../../src/utils/logger");

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("consentController", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  /* =========================
     getMyDoctors
  ========================= */

  describe("getMyDoctors", () => {

    test("should return doctors list", async () => {

      const req = { user: { id: 1 } };
      const res = mockResponse();

      const doctors = [
        { id: 2, email: "doc@test.com" }
      ];

      consentService.fetchDoctorsForPatient.mockResolvedValue(doctors);

      await consentController.getMyDoctors(req, res);

      expect(consentService.fetchDoctorsForPatient)
        .toHaveBeenCalledWith(1);

      expect(res.json).toHaveBeenCalledWith(doctors);

    });

    test("should return 401 if patientId missing", async () => {

      const req = { user: {} };
      const res = mockResponse();

      await consentController.getMyDoctors(req, res);

      expect(res.status).toHaveBeenCalledWith(401);

      expect(res.json).toHaveBeenCalledWith({
        message: "Unauthorized"
      });

    });

    test("should return 500 on service error", async () => {

      const req = { user: { id: 1 } };
      const res = mockResponse();

      consentService.fetchDoctorsForPatient
        .mockRejectedValue(new Error("DB failure"));

      await consentController.getMyDoctors(req, res);

      expect(logger.error).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to fetch doctors"
      });

    });

  });


  /* =========================
     shareWithDoctor
  ========================= */

  describe("shareWithDoctor", () => {

    test("should grant doctor access", async () => {

      const req = {
        user: { id: 1 },
        body: { doctorId: 2, accessLevel: "read_only" }
      };

      const res = mockResponse();

      const consent = {
        patient_id: 1,
        doctor_id: 2,
        access_level: "read_only"
      };

      consentService.shareWithDoctor.mockResolvedValue(consent);

      await consentController.shareWithDoctor(req, res);

      expect(consentService.shareWithDoctor)
        .toHaveBeenCalledWith(1, 2, "read_only");

      expect(res.status).toHaveBeenCalledWith(201);

      expect(res.json).toHaveBeenCalledWith({
        message: "Doctor access granted",
        consent
      });

    });

    test("should return 500 on error", async () => {

      const req = {
        user: { id: 1 },
        body: { doctorId: 2 }
      };

      const res = mockResponse();

      consentService.shareWithDoctor
        .mockRejectedValue(new Error("DB error"));

      await consentController.shareWithDoctor(req, res);

      expect(logger.error).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to share with doctor"
      });

    });

  });


  /* =========================
     revokeDoctor
  ========================= */

  describe("revokeDoctor", () => {

    test("should revoke doctor access", async () => {

      const req = {
        user: { id: 1 },
        params: { doctorId: 2 }
      };

      const res = mockResponse();

      const revoked = {
        patient_id: 1,
        doctor_id: 2
      };

      consentService.revokeDoctor.mockResolvedValue(revoked);

      await consentController.revokeDoctor(req, res);

      expect(consentService.revokeDoctor)
        .toHaveBeenCalledWith(1, 2);

      expect(res.json).toHaveBeenCalledWith({
        message: "Doctor access revoked",
        consent: revoked
      });

    });

    test("should return 500 on error", async () => {

      const req = {
        user: { id: 1 },
        params: { doctorId: 2 }
      };

      const res = mockResponse();

      consentService.revokeDoctor
        .mockRejectedValue(new Error("DB failure"));

      await consentController.revokeDoctor(req, res);

      expect(logger.error).toHaveBeenCalled();

      expect(res.status).toHaveBeenCalledWith(500);

      expect(res.json).toHaveBeenCalledWith({
        message: "Failed to revoke doctor access"
      });

    });

  });

});