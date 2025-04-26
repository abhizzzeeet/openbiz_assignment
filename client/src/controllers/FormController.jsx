import constants from "../config/constants";

// form_controller.js
const { API_BASE_URL_PROD, API_BASE_URL_LOCAL, ROUTES} = constants

export const validateStep = async (step, formValues, formSchema, steps) => {
    const currentFields = formSchema[step].fields;
    const inputs = currentFields.filter(f => f.tag === "input" || f.tag === "select");
    const allFilled = inputs.every((input) => {
      const name = input.attributes?.name || input.attributes?.id;
      const type = input.attributes?.type;
      const required = type !== "submit";
      return !required || (formValues[name] && formValues[name].toString().trim() !== "");
    });
  
    if (!allFilled) {
      alert("Please fill in all required fields.");
      return false;
    }
  
    const currentStepData = {};
    inputs.forEach((input) => {
      const name = input.attributes?.name || input.attributes?.id;
      currentStepData[name] = formValues[name];
    });
  
    try {
        const response = await fetch(`${API_BASE_URL_PROD}${ROUTES.VALIDATE_STEP}`, {
        
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step,
          data: currentStepData,
        }),
      });
  
      const result = await response.json();
  
      if (result.success) {
        return result;
      } else {
        return result;
      }
    } catch (err) {
      console.error("Error validating step:", err);
      alert("Failed to validate step.");  
      return null;
    }
  };
  
  export const handleFormSubmission = async (formValues) => {
    try {
        const response = await fetch(`${API_BASE_URL_PROD}${ROUTES.SUBMIT_FORM}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaarNumber: formValues["ctl00$ContentPlaceHolder1$txtadharno"],
          aadhaarName: formValues["ctl00$ContentPlaceHolder1$txtownername"],
          organisationType: formValues["ctl00$ContentPlaceHolder1$ddlTypeofOrg"],
          panNumber: formValues["ctl00$ContentPlaceHolder1$txtPan"],
          panName: formValues["ctl00$ContentPlaceHolder1$txtPanName"],
          dob: formValues["ctl00$ContentPlaceHolder1$txtdob"],
        }),
      });
  
      const data = await response.json();
      alert(data.message);
    } catch (err) {
      console.error("Submission error:", err);
      alert("Failed to submit form.");
    }
  };
  
  export const moveToNextStep = (currentStep, steps, setStep, formValues) => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      handleFormSubmission(formValues);
    }
  };
  