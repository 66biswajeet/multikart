import React from "react";
import { Controller } from "react-hook-form";

const FormSelect = ({
  label,
  name,
  control,
  errors,
  options = [],
  placeholder = "Select an option",
  required,
  disabled,
  ...props
}) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <div className="mb-3">
          {label && (
            <label htmlFor={name} className="form-label">
              {label}
              {required && <span className="text-danger ms-1">*</span>}
            </label>
          )}
          <select
            id={name}
            value={value || ""}
            onChange={onChange}
            disabled={disabled}
            className={`form-select ${errors[name] ? "is-invalid" : ""}`}
            {...props}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option
                key={option.id || option.value}
                value={option.id || option.value}
              >
                {option.name || option.label}
              </option>
            ))}
          </select>
          {errors[name] && (
            <div className="invalid-feedback d-block">
              {errors[name]?.message}
            </div>
          )}
        </div>
      )}
    />
  );
};

export default FormSelect;
