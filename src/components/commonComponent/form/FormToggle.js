import React from "react";
import { Controller } from "react-hook-form";

const FormToggle = ({ label, name, control, errors, disabled, ...props }) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value } }) => (
        <div className="mb-3">
          <div className="form-check form-switch">
            <input
              id={name}
              type="checkbox"
              className={`form-check-input ${errors[name] ? "is-invalid" : ""}`}
              disabled={disabled}
              checked={value || false}
              onChange={onChange}
              {...props}
            />
            {label && (
              <label htmlFor={name} className="form-check-label">
                {label}
              </label>
            )}
          </div>
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

export default FormToggle;
