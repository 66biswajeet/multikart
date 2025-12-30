"use client";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { Row, Col } from "reactstrap";
import { useTranslation } from "react-i18next";

export default function Step3WarehousesChannels({
  onSubmit,
  initialData,
  onStepBack,
}) {
  const { t } = useTranslation("common");

  // Requirement: Remove warehouses from initial values
  const initialValues = {
    channels: initialData?.channels?.length
      ? initialData.channels
      : [{ type: "Storefront", handle: "", url: "", is_active: true }],
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values }) => (
        <Form className="theme-form">
          {/* --- SECTION: SALES CHANNELS ONLY --- */}
          <div className="col-12 mb-4">
            <h5 className="text-primary fw-bold">{t("Sales Channels")}</h5>
            <p className="text-muted small">
              {t(
                "Add your online presence such as storefronts, social media links, or external websites."
              )}
            </p>
          </div>

          <FieldArray name="channels">
            {({ push, remove }) => (
              <>
                {values.channels.map((c, idx) => (
                  <div
                    key={idx}
                    className="channel-row pb-3 mb-4 border-bottom"
                  >
                    <Row className="g-3 align-items-center">
                      <Col md="3">
                        <label className="form-label">
                          {t("Channel Type")}
                        </label>
                        <Field
                          as="select"
                          name={`channels.${idx}.type`}
                          className="form-select"
                        >
                          <option value="Storefront">Storefront</option>
                          <option value="Facebook">Facebook</option>
                          <option value="Instagram">Instagram</option>
                          <option value="WhatsApp">WhatsApp</option>
                          <option value="Website">Website</option>
                          <option value="Other">Other</option>
                        </Field>
                      </Col>

                      <Col md="3">
                        <label className="form-label">
                          {t("Handle / User Name")}
                        </label>
                        <Field
                          name={`channels.${idx}.handle`}
                          placeholder="@username"
                          className="form-control"
                        />
                      </Col>

                      <Col md="4">
                        <label className="form-label">{t("URL")}</label>
                        <Field
                          name={`channels.${idx}.url`}
                          placeholder="https://..."
                          className="form-control"
                        />
                      </Col>

                      <Col md="2" className="d-flex align-items-center pt-4">
                        <label className="form-check d-flex align-items-center mb-0 cursor-pointer">
                          <Field
                            type="checkbox"
                            name={`channels.${idx}.is_active`}
                            className="form-check-input me-2"
                          />
                          <span className="small">{t("Active")}</span>
                        </label>

                        {values.channels.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-link text-danger p-0 ms-auto"
                            onClick={() => remove(idx)}
                          >
                            <i className="ri-delete-bin-line"></i>
                          </button>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}

                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm"
                    onClick={() =>
                      push({
                        type: "Storefront",
                        handle: "",
                        url: "",
                        is_active: true,
                      })
                    }
                  >
                    <i className="ri-add-line me-1"></i>{" "}
                    {t("Add Another Channel")}
                  </button>
                </div>
              </>
            )}
          </FieldArray>

          {/* Navigation Actions */}
          <div className="mt-5 d-flex justify-content-between border-top pt-4">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onStepBack}
            >
              {t("Back")}
            </button>
            <button type="submit" className="btn btn-primary">
              {t("Save & Continue")}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
