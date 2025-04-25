import { useState } from "react";
import { validateStep, handleFormSubmission, moveToNextStep } from "../controllers/FormController";
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

const RenderField = ({ field, allFields, formValues, setFormValues, errors, onSubmit }) => {
  const Tag = field.tag;
  const props = convertToReactAttributes(field.attributes);
  const name = field.attributes?.name || field.attributes?.id;
  const [selectedValue, setSelectedValue] = useState(null);


  const handleChange = (e) => {
    const value = e.target.value;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };
  const handleSelectChange = (e) => {
    const selectedValue = e.target.value;
    setSelectedValue(selectedValue);
    const selectedOption = allFields.find(
      (f) => f.tag === "option" && f.attributes.value === selectedValue
    );
    console.log("selected option value: ", selectedOption)
    const selectedOptionText = selectedOption ? selectedOption.text : "";
    console.log("selected option text: ", selectedOptionText)
    setFormValues((prev) => ({ ...prev, [name]: selectedOptionText }));
    console.log("form Values: ", formValues)
  };

  if (Tag === "option") return null;

  const renderInputField = () => {
    if (Tag === "select") {
      const options = allFields.filter((f) => f.tag === "option");
      return (
        <select
          {...props}
          onChange={handleSelectChange}
          value={selectedValue || ""}
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
      {field.label && <label className="font-medium text-sm !important">{field.label}</label>}
      {renderInputField()}
      {errors && errors[name] && (
        <span className="text-sm" style={{ color: "red" }}>
          {errors[name]}
        </span>
      )}
    </div>
  );
};

export default function FormRenderer() {
  const [step, setStep] = useState("aadhaar_step");
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});

  const steps = ["aadhaar_step", "otp_step", "pan_verification"];
  const currentFields = formSchema[step].fields;

  const handleNextStep = async () => {
    const result = await validateStep(step, formValues, formSchema, steps);

    if (result) {
      if (result.success) {
        moveToNextStep(step, steps, setStep, formValues);
      } else {
        setErrors(result.errors || {});
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 capitalize text-center">
        {step.replace("_", " ")}
      </h2>
      <form className="space-y-6 bg-white shadow-md rounded px-6 py-8 sm:p-10">
        {currentFields.map((field, index) => (
          <RenderField
            key={index}
            field={field}
            allFields={currentFields}
            formValues={formValues}
            setFormValues={setFormValues}
            errors={errors}
            onSubmit={handleNextStep}
          />
        ))}
      </form>
    </div>
  );
}
