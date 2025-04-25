import { useState } from "react";

const formSchema = require("../form_schema.json");

const convertToReactAttributes = (attributes = {}) => {
  const reactAttributes = {};
  for (const [key, value] of Object.entries(attributes)) {
    switch (key) {
      case "class":
        reactAttributes["className"] = Array.isArray(value) ? value.join(" ") : value;
        break;
      case "maxlength":
        reactAttributes["maxLength"] = value;
        break;
      case "tabindex":
        reactAttributes["tabIndex"] = parseInt(value);
        break;
      case "autocomplete":
        reactAttributes["autoComplete"] = value;
        break;
      case "onclick":
      case "onchange":
        break;
      case "style":
        const styleObj = {};
        value.split(";").forEach((styleRule) => {
          if (styleRule.trim()) {
            const [prop, val] = styleRule.split(":");
            const jsProp = prop.trim().replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
            styleObj[jsProp] = val.trim();
          }
        });
        reactAttributes["style"] = styleObj;
        break;
      default:
        reactAttributes[key] = value;
    }
  }
  return reactAttributes;
};


const RenderField = ({ field, allFields, formValues, setFormValues, onSubmit }) => {
  const Tag = field.tag;
  const props = convertToReactAttributes(field.attributes);
  const name = field.attributes?.name || field.attributes?.id;

  const handleChange = (e) => {
    const value = e.target.value;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e) => {
    // Get the value of the selected option
    const selectedValue = e.target.value;
    
    // Find the option corresponding to the selected value
    const selectedOption = allFields.find(
      (f) => f.tag === "option" && f.attributes.value === selectedValue
    );
    
    // Get the text of the selected option
    const selectedOptionText = selectedOption ? selectedOption.text : "";
  
    // Update the form values with the selected option text
    setFormValues((prev) => ({ ...prev, [name]: selectedOptionText }));
  };

  if (Tag === "option") return null;

  const renderInputField = () => {
    if (Tag === "select") {
      const options = allFields.filter((f) => f.tag === "option");
      console.log("options: ", options)
      return (
        <select
          {...props}
          onChange={handleSelectChange}
          value={formValues[name] || ""}
          className="w-full border border-gray-300 rounded p-2"
        >
          {options.map((option, index) => (
            <option key={index} {...convertToReactAttributes(option.attributes)}>
              {option.text}
            </option>
          ))}
        </select>
      );
    }

    if (Tag === "input") {
      if (props.type === "submit") {
        return (
          <input
            {...props}
            onClick={(e) => {
              e.preventDefault();
              onSubmit();
            }}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700"
          />
        );
      }

      return (
        <input
          {...props}
          value={formValues[name] || ""}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded p-2"
        />
      );
    }

    return <Tag {...props}>{field.text}</Tag>;
  };

  return (
    <div className="flex flex-col gap-1">
      {field.label && <label className="font-medium text-sm">{field.label}</label>}
      {renderInputField()}
    </div>
  );
};


export default function FormRenderer() {
  const [step, setStep] = useState("aadhaar_step");
  const [formValues, setFormValues] = useState({});

  const steps = ["aadhaar_step", "otp_step", "pan_verification"];
  const currentFields = formSchema[step].fields;

  const handleNextStep = async () => {
    const inputs = currentFields.filter(f => f.tag === "input" || f.tag === "select");
    const allFilled = inputs.every((input) => {
      const name = input.attributes?.name || input.attributes?.id;
      const type = input.attributes?.type;
      const required = type !== "submit";
      console.log("name: ", name," ,value: ", formValues[name] )
      return !required || (formValues[name] && formValues[name].toString().trim() !== "");
    });

    if (!allFilled) {
      alert("Please fill in all required fields.");
      return;
    }

    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      // Submit to backend on last step
      try {
        // const response = await fetch("http://localhost:5000/api/submit", {
          const response = await fetch("https://openbizassignment-production.up.railway.app", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            aadhaarNumber: formValues["ctl00$ContentPlaceHolder1$txtadharno"],  // update with actual name/id
            aadhaarName: formValues["ctl00$ContentPlaceHolder1$txtownername"],                // same here
            organisationType: formValues["ctl00$ContentPlaceHolder1$ddlTypeofOrg"],                  // etc.
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
    }
  };

  return (
    
    <div className="p-4 sm:p-6 md:p-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 capitalize text-center">{step.replace("_", " ")}</h2>
      <form className="space-y-6 bg-white shadow-md rounded px-6 py-8 sm:p-10">
        {currentFields.map((field, index) => (
          <RenderField
            key={index}
            field={field}
            allFields={currentFields}
            formValues={formValues}
            setFormValues={setFormValues}
            onSubmit={handleNextStep}
          />
        ))}
      </form>
    </div>

  );
}
