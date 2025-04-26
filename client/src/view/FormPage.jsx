import { useState } from "react";
import { validateStep, handleFormSubmission, moveToNextStep } from "../controllers/FormController";
import "../assets/styles.css"
const formSchema = require("../config/form_schema.json");

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
    const selectedOptionText = selectedOption ? selectedOption.text : "";
    setFormValues((prev) => ({ ...prev, [name]: selectedOptionText }));
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
          className="input-field"
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
            className="submit-btn"
          />
        );
      }

      return (
        <input
          {...props}
          value={formValues[name] || ""}
          onChange={handleChange}
          className="input-field"
        />
      );
    }

    return <Tag {...props}>{field.text}</Tag>;
  };

  return (
    <div className="form-group">
      {field.label && <label>{field.label}</label>}
      {renderInputField()}
      {errors && errors[name] && (
        <span className="error">
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
    <div className="form-container">
      <h2>{step.replace("_", " ")}</h2>
      <form className="form">
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

