const { validateStep } = require('../../controllers/formController');

describe('validateStep', () => {

  // Mocking the response and request objects
  const mockRes = () => {
    const res = {};
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnThis();
    return res;
  };

  // Tests for Aadhaar validation step
  describe('Aadhaar Step Validation (aadhaar_step)', () => {
    it('should return error for invalid Aadhaar number (not 12 digits)', async () => {
      const req = {
        body: {
          step: 'aadhaar_step',
          data: {
            'ctl00$ContentPlaceHolder1$txtadharno': '12345', // Invalid Aadhaar number (not 12 digits)
            'ctl00$ContentPlaceHolder1$txtownername': 'John Doe'
          }
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: { 'ctl00$ContentPlaceHolder1$txtadharno': 'Aadhaar number must be exactly 12 digits.' }
      });
    });

    it('should return error for empty Owner name', async () => {
      const req = {
        body: {
          step: 'aadhaar_step',
          data: {
            'ctl00$ContentPlaceHolder1$txtadharno': '123456789012', // Valid Aadhaar number
            'ctl00$ContentPlaceHolder1$txtownername': '' // Empty owner name
          }
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: { 'ctl00$ContentPlaceHolder1$txtownername': 'Owner name is required.' }
      });
    });

    it('should return success for valid Aadhaar and Owner name', async () => {
      const req = {
        body: {
          step: 'aadhaar_step',
          data: {
            'ctl00$ContentPlaceHolder1$txtadharno': '123456789012', // Valid Aadhaar number
            'ctl00$ContentPlaceHolder1$txtownername': 'John Doe' // Valid owner name
          }
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  // Tests for OTP step (no validation here, just success)
  describe('OTP Step Validation (otp_step)', () => {
    it('should return success for OTP step', async () => {
      const req = {
        body: {
          step: 'otp_step',
          data: {}
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  // Tests for PAN verification step
  describe('PAN Verification Validation (pan_verification)', () => {
    it('should return error for invalid PAN number format', async () => {
      const req = {
        body: {
          step: 'pan_verification',
          data: {
            'ctl00$ContentPlaceHolder1$txtPan': 'ABCDE1234', // Invalid PAN number format
            'ctl00$ContentPlaceHolder1$txtdob': '01/01/1990' // Valid DOB
          }
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: { 'ctl00$ContentPlaceHolder1$txtPan': 'Invalid PAN number format. It should be of the form ABCDE1234F.' }
      });
    });

    it('should return error for invalid DOB format', async () => {
      const req = {
        body: {
          step: 'pan_verification',
          data: {
            'ctl00$ContentPlaceHolder1$txtPan': 'ABCDE1234F', // Valid PAN number
            'ctl00$ContentPlaceHolder1$txtdob': '1990/01/01' // Invalid DOB format
          }
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        errors: { 'ctl00$ContentPlaceHolder1$txtdob': 'Invalid Date of Birth format. It should be dd/mm/yyyy.' }
      });
    });

    it('should return success for valid PAN and DOB', async () => {
      const req = {
        body: {
          step: 'pan_verification',
          data: {
            'ctl00$ContentPlaceHolder1$txtPan': 'ABCDE1234F', // Valid PAN number
            'ctl00$ContentPlaceHolder1$txtdob': '01/01/1990' // Valid DOB
          }
        }
      };
      const res = mockRes();
      await validateStep(req, res);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });
  });

  // Edge case: Invalid step
  it('should return error for invalid step', async () => {
    const req = {
      body: {
        step: 'invalid_step',
        data: {}
      }
    };
    const res = mockRes();
    await validateStep(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid step.' });
  });
});
