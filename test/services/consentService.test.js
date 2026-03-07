const consentService = require("../../src/services/consentService");
const consentModel = require("../../src/models/consentModel");

jest.mock("../../src/models/consentModel");

describe("consentService", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchDoctorsForPatient", () => {

    test("should return doctors for valid patient", async () => {

      const mockDoctors = [
        { id: 2, email: "doctor@test.com" }
      ];

      consentModel.getDoctorsForPatient.mockResolvedValue(mockDoctors);

      const result = await consentService.fetchDoctorsForPatient(1);

      expect(consentModel.getDoctorsForPatient).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockDoctors);

    });

    test("should throw error if patientId missing", async () => {

      await expect(
        consentService.fetchDoctorsForPatient(null)
      ).rejects.toThrow("Invalid patient ID");

    });

  });

  describe("shareWithDoctor", () => {

    test("should create doctor-patient relation and grant consent", async () => {

      const mockConsent = {
        patient_id: 1,
        doctor_id: 2,
        access_level: "read_only"
      };

      consentModel.addDoctorPatient.mockResolvedValue({});
      consentModel.grantConsent.mockResolvedValue(mockConsent);

      const result = await consentService.shareWithDoctor(1, 2);

      expect(consentModel.addDoctorPatient).toHaveBeenCalledWith(1, 2);

      expect(consentModel.grantConsent).toHaveBeenCalledWith(
        1,
        2,
        "read_only"
      );

      expect(result).toEqual(mockConsent);

    });

    test("should allow custom access level", async () => {

      const mockConsent = {
        patient_id: 1,
        doctor_id: 2,
        access_level: "full"
      };

      consentModel.addDoctorPatient.mockResolvedValue({});
      consentModel.grantConsent.mockResolvedValue(mockConsent);

      const result = await consentService.shareWithDoctor(1, 2, "full");

      expect(consentModel.grantConsent).toHaveBeenCalledWith(
        1,
        2,
        "full"
      );

      expect(result).toEqual(mockConsent);

    });

  });

  describe("revokeDoctor", () => {

    test("should remove doctor relation and revoke consent", async () => {

      const mockRevoked = {
        patient_id: 1,
        doctor_id: 2
      };

      consentModel.removeDoctorPatient.mockResolvedValue({});
      consentModel.revokeConsent.mockResolvedValue(mockRevoked);

      const result = await consentService.revokeDoctor(1, 2);

      expect(consentModel.removeDoctorPatient).toHaveBeenCalledWith(1, 2);

      expect(consentModel.revokeConsent).toHaveBeenCalledWith(1, 2);

      expect(result).toEqual(mockRevoked);

    });

  });

});