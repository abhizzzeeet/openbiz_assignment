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
