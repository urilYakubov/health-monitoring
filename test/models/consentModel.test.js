const db = require("../../src/config/db");
const consentModel = require("../../src/models/consentModel");

jest.mock("../../src/config/db");

describe("consentModel", () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("getDoctorsForPatient should return doctors list", async () => {

    const mockDoctors = [
      { id: 2, email: "doctor@test.com", granted_at: "2025-01-01" }
    ];

    db.query.mockResolvedValue({ rows: mockDoctors });

    const result = await consentModel.getDoctorsForPatient(1);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("FROM patient_consents"), [1]);
    expect(result).toEqual(mockDoctors);
  });

  test("addDoctorPatient should insert relation", async () => {

    const mockRow = { doctor_id: 2, patient_id: 1 };

    db.query.mockResolvedValue({ rows: [mockRow] });

    const result = await consentModel.addDoctorPatient(1, 2);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO doctor_patients"), [2, 1]);
    expect(result).toEqual(mockRow);
  });

  test("removeDoctorPatient should delete relation", async () => {

    const mockRow = { doctor_id: 2, patient_id: 1 };

    db.query.mockResolvedValue({ rows: [mockRow] });

    const result = await consentModel.removeDoctorPatient(1, 2);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("DELETE FROM doctor_patients"), [2, 1]);
    expect(result).toEqual(mockRow);
  });

  test("grantConsent should insert consent", async () => {

    const mockConsent = {
      patient_id: 1,
      doctor_id: 2,
      access_level: "read_only"
    };

    db.query.mockResolvedValue({ rows: [mockConsent] });

    const result = await consentModel.grantConsent(1, 2, "read_only");

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("INSERT INTO patient_consents"), [1, 2, "read_only"]);
    expect(result).toEqual(mockConsent);
  });

  test("revokeConsent should update revoked_at", async () => {

    const mockRow = { patient_id: 1, doctor_id: 2 };

    db.query.mockResolvedValue({ rows: [mockRow] });

    const result = await consentModel.revokeConsent(1, 2);

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("UPDATE patient_consents"), [1, 2]);
    expect(result).toEqual(mockRow);
  });
  
  test("revokeConsent should return undefined if nothing updated", async () => {

	  db.query.mockResolvedValue({ rows: [] });

	  const result = await consentModel.revokeConsent(1, 2);

	  expect(result).toBeUndefined();

	});

});