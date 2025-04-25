const express = require("express");
const router = express.Router();
const formController = require("../controllers/formController");

router.post("/submit", formController.submitForm);
router.post("/validate-step", formController.validateStep);

module.exports = router;
