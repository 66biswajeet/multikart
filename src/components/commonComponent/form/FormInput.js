import React from "react";
import { Controller } from "react-hook-form";

const FormInput = ({
  label,
  name,
  control,
  errors,
  type = "text",
  placeholder,
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
          <input
            id={name}
            type={type}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`form-control ${errors[name] ? "is-invalid" : ""}`}
            {...props}
          />
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

export default FormInput;
