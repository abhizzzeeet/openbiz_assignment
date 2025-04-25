const prisma = require("../models/prismaClient");

exports.submitForm = async (req, res) => {
  const { aadhaarNumber, aadhaarName, organisationType, panNumber, panName, dob } = req.body;

  try {
    const form = await prisma.udyamForm.upsert({
      where: { aadhaarnumber: aadhaarNumber },
      update: {
        aadhaarname: aadhaarName,
        organisationtype: organisationType,
        pannumber: panNumber,
        panname: panName,
        dob: dob,
      },
      create: {
        aadhaarnumber: aadhaarNumber,
        aadhaarname: aadhaarName,
        organisationtype: organisationType,
        pannumber: panNumber,
        panname: panName,
        dob: dob,
      },
    });

    res.status(200).json({ message: "Form saved successfully!", form });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save form." });
  }
};


exports.validateStep = async(req,res) => {
  const { step, data } = req.body;

  // Only validate for step 1
  if (step === 'aadhaar_step') {
    const errors = {};

    // Validate Aadhaar number (must be exactly 12 digits)
    const aadhaarNumber = data['ctl00$ContentPlaceHolder1$txtadharno'];
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      errors['ctl00$ContentPlaceHolder1$txtadharno'] = 'Aadhaar number must be exactly 12 digits.';
    }

    // Validate Owner name (must not be empty)
    const ownerName = data['ctl00$ContentPlaceHolder1$txtownername'];
    if (!ownerName || ownerName.trim() === '') {
      errors['ctl00$ContentPlaceHolder1$txtownername'] = 'Owner name is required.';
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.json({ success: false, errors });
    }

    // If no errors, return success
    return res.json({ success: true });
  }else if(step === 'otp_step') {
    return res.json({ success: true });
  } else if (step === 'pan_verification') {
    const errors = {};

    // Validate PAN Number (should follow the format: [A-Za-z]{5}[0-9]{4}[A-Za-z]{1})
    const panNumber = data['ctl00$ContentPlaceHolder1$txtPan'];
    const panRegex = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/; // PAN number format
    if (!panNumber || !panRegex.test(panNumber)) {
      errors['ctl00$ContentPlaceHolder1$txtPan'] = 'Invalid PAN number format. It should be of the form ABCDE1234F.';
    }

    // Validate Date of Birth (should follow the format: dd/mm/yyyy)
    const dob = data['ctl00$ContentPlaceHolder1$txtdob'];
    const dobRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/; // dd/mm/yyyy format
    if (!dob || !dobRegex.test(dob)) {
      errors['ctl00$ContentPlaceHolder1$txtdob'] = 'Invalid Date of Birth format. It should be dd/mm/yyyy.';
    }

    // If there are validation errors, return them
    if (Object.keys(errors).length > 0) {
      return res.json({ success: false, errors });
    }

    // If no errors, return success
    return res.json({ success: true });
  }


  // Return error if invalid step
  return res.status(400).json({ success: false, error: 'Invalid step.' });
};