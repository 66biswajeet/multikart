"use client";
import React, { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import request from "@/utils/axiosUtils";
import { useTranslation } from "react-i18next";

export default function Step1BusinessDetails({ onSubmit, initialData }) {
  const { t } = useTranslation("common");
  const [nameStatus, setNameStatus] = useState({
    message: "",
    available: null,
  });
  const [isChecking, setIsChecking] = useState(false);

  // Requirement 2: Debounced Store Name availability check
  const checkAvailability = async (name) => {
    if (!name || name.length < 3) {
      setNameStatus({ message: "", available: null });
      return;
    }
    setIsChecking(true);
    try {
      const response = await request({
        url: `/vendor/register?check_name=${name}`,
        method: "GET",
      });
      if (response?.data?.success) {
        setNameStatus({
          message: response.data.message,
          available: response.data.available,
        });
      }
    } catch (error) {
      console.error("Availability check failed:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Requirement 3: Updated options
  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Private Limited Company",
    "Public Limited Company",
    "Individual Seller",
    "Other",
  ];

  // Requirement 4: Conditional Validation Schema
  const schema = Yup.object({
    store_name: Yup.string().min(2).max(120).required(t("Required")),
    business: Yup.object({
      type: Yup.string().oneOf(businessTypes).required(t("Required")),
      country_of_incorporation: Yup.string().required(t("Required")),
      // Fields mandatory ONLY if NOT Individual Seller [cite: 602]
      name: Yup.string().when("type", {
        is: (val) => val !== "Individual Seller",
        then: (s) => s.required(t("Legal Business Name is required")).min(2),
      }),
      registration_number: Yup.string().when("type", {
        is: (val) => val !== "Individual Seller",
        then: (s) => s.required(t("Required")),
      }),
      registration_date: Yup.date()
        .nullable()
        .when("type", {
          is: (val) => val !== "Individual Seller",
          then: (s) => s.required(t("Required")),
        }),
      tax_id: Yup.string().when("type", {
        is: (val) => val !== "Individual Seller",
        then: (s) => s.required(t("Required")),
      }),
    }),
  });

  const initialValues = {
    store_name: initialData?.store_name || "",
    business: {
      type: initialData?.business?.type || "Individual Seller",
      country_of_incorporation:
        initialData?.business?.country_of_incorporation || "Maldives",
      name: initialData?.business?.name || "",
      registration_number: initialData?.business?.registration_number || "",
      registration_date: initialData?.business?.registration_date
        ? initialData.business.registration_date.substring(0, 10)
        : "",
      tax_id: initialData?.business?.tax_id || "",
    },
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue, handleChange }) => (
        <Form className="row g-3">
          {/* Store Name & Availability Check [cite: 540, 547, 548] */}
          <div className="col-md-12">
            <label className="form-label">Preferred Store Name *</label>
            <Field
              name="store_name"
              className="form-control"
              onChange={(e) => {
                handleChange(e);
                checkAvailability(e.target.value);
              }}
            />
            {isChecking && (
              <small className="text-muted">Checking availability...</small>
            )}
            {nameStatus.message && (
              <div
                className={`small mt-1 ${
                  nameStatus.available ? "text-success" : "text-danger"
                }`}
              >
                {nameStatus.message}
              </div>
            )}
            <div className="text-danger small">
              <ErrorMessage name="store_name" />
            </div>
          </div>

          {/* Requirement 1: Country of Incorporation  */}
          <div className="col-md-6">
            <label className="form-label">Country of Incorporation *</label>
            <Field
              name="business.country_of_incorporation"
              className="form-control"
            />
            <div className="text-danger small">
              <ErrorMessage name="business.country_of_incorporation" />
            </div>
          </div>

          {/* Requirement 3: Business Type Selection  */}
          <div className="col-md-6">
            <label className="form-label">Business Type *</label>
            <Field as="select" name="business.type" className="form-select">
              <option value="">Select</option>
              {businessTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Field>
            <div className="text-danger small">
              <ErrorMessage name="business.type" />
            </div>
          </div>

          {/* Requirement 4: Conditional Fields (Hidden for Individual Seller)  */}
          {values.business.type !== "Individual Seller" && (
            <>
              <div className="col-md-12">
                <label className="form-label">Legal Business Name *</label>
                <Field name="business.name" className="form-control" />
                <div className="text-danger small">
                  <ErrorMessage name="business.name" />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Registration Number *</label>
                <Field
                  name="business.registration_number"
                  className="form-control"
                />
                <div className="text-danger small">
                  <ErrorMessage name="business.registration_number" />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Registration Date *</label>
                <Field
                  type="date"
                  name="business.registration_date"
                  className="form-control"
                />
                <div className="text-danger small">
                  <ErrorMessage name="business.registration_date" />
                </div>
              </div>

              <div className="col-md-12">
                <label className="form-label">
                  Tax Identification No (TIN) *
                </label>
                <Field name="business.tax_id" className="form-control" />
                <div className="text-danger small">
                  <ErrorMessage name="business.tax_id" />
                </div>
              </div>
            </>
          )}

          <div className="col-12 mt-4 d-flex justify-content-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isChecking || nameStatus.available === false}
            >
              Save & Continue
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
