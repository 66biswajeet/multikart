"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const person = Yup.object({
  name: Yup.string().min(2).max(120).required("Required"),
  email: Yup.string().email("Invalid").required("Required"),
  phone: Yup.string().min(5).max(20).required("Required"),
  designation: Yup.string().max(80),
});

const schema = Yup.object({
  contacts: Yup.object({
    primary: person.required(),
    orders: person.shape({ reuse_primary: Yup.boolean() }),
    payout: person.shape({ reuse_primary: Yup.boolean() }),
  }),
});

export default function Step2ContactInfo({ onSubmit, initialData }) {
  const initialValues = {
    contacts: {
      primary: {
        name: initialData?.contacts?.primary?.name || "",
        email: initialData?.contacts?.primary?.email || "",
        phone: initialData?.contacts?.primary?.phone || "",
        designation: initialData?.contacts?.primary?.designation || "",
      },
      orders: {
        name: initialData?.contacts?.orders?.name || "",
        email: initialData?.contacts?.orders?.email || "",
        phone: initialData?.contacts?.orders?.phone || "",
        reuse_primary:
          Boolean(initialData?.contacts?.orders?.reuse_primary) || false,
      },
      payout: {
        name: initialData?.contacts?.payout?.name || "",
        email: initialData?.contacts?.payout?.email || "",
        phone: initialData?.contacts?.payout?.phone || "",
        reuse_primary:
          Boolean(initialData?.contacts?.payout?.reuse_primary) || false,
      },
    },
  };

  const handleReuse = (values, setFieldValue, key) => {
    // Check the actual current state of the checkbox
    const reuse = values.contacts[key].reuse_primary;
    if (reuse) {
      setFieldValue(`contacts.${key}.name`, values.contacts.primary.name);
      setFieldValue(`contacts.${key}.email`, values.contacts.primary.email);
      setFieldValue(`contacts.${key}.phone`, values.contacts.primary.phone);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={onSubmit}
      enableReinitialize
    >
      {({ values, setFieldValue }) => (
        <Form className="row g-4">
          {/* --- SECTION 1: PRIMARY CONTACT --- */}
          <div className="col-12">
            <h5 className="text-primary fw-bold">Primary Contact</h5>
          </div>
          <div className="col-md-3">
            <label className="form-label">Name</label>
            <Field name="contacts.primary.name" className="form-control" />
            <div className="text-danger small">
              <ErrorMessage name="contacts.primary.name" />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Email</label>
            <Field name="contacts.primary.email" className="form-control" />
            <div className="text-danger small">
              <ErrorMessage name="contacts.primary.email" />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Phone</label>
            <Field name="contacts.primary.phone" className="form-control" />
            <div className="text-danger small">
              <ErrorMessage name="contacts.primary.phone" />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Designation</label>
            <Field
              name="contacts.primary.designation"
              className="form-control"
            />
          </div>

          {/* VISUAL SEPARATOR */}
          <div className="col-12 py-0">
            <hr />
          </div>

          {/* --- SECTION 2: ORDERS CONTACT --- */}
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h5 className="text-primary fw-bold mb-0">
              Orders & Fulfillment Contact
            </h5>
            <label className="form-check d-flex align-items-center mb-0">
              <Field
                type="checkbox"
                name="contacts.orders.reuse_primary"
                className="form-check-input me-2"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setFieldValue("contacts.orders.reuse_primary", isChecked);
                  if (isChecked) {
                    setFieldValue(
                      "contacts.orders.name",
                      values.contacts.primary.name
                    );
                    setFieldValue(
                      "contacts.orders.email",
                      values.contacts.primary.email
                    );
                    setFieldValue(
                      "contacts.orders.phone",
                      values.contacts.primary.phone
                    );
                  }
                }}
              />
              <span className="small text-muted">Reuse Primary Contact</span>
            </label>
          </div>
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <Field
              name="contacts.orders.name"
              className="form-control"
              disabled={values.contacts.orders.reuse_primary}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <Field
              name="contacts.orders.email"
              className="form-control"
              disabled={values.contacts.orders.reuse_primary}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Phone</label>
            <Field
              name="contacts.orders.phone"
              className="form-control"
              disabled={values.contacts.orders.reuse_primary}
            />
          </div>

          {/* VISUAL SEPARATOR */}
          <div className="col-12 py-0">
            <hr />
          </div>

          {/* --- SECTION 3: PAYOUT CONTACT --- */}
          <div className="col-12 d-flex justify-content-between align-items-center">
            <h5 className="text-primary fw-bold mb-0">Payout Contact</h5>
            <label className="form-check d-flex align-items-center mb-0">
              <Field
                type="checkbox"
                name="contacts.payout.reuse_primary"
                className="form-check-input me-2"
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  setFieldValue("contacts.payout.reuse_primary", isChecked);
                  if (isChecked) {
                    setFieldValue(
                      "contacts.payout.name",
                      values.contacts.primary.name
                    );
                    setFieldValue(
                      "contacts.payout.email",
                      values.contacts.primary.email
                    );
                    setFieldValue(
                      "contacts.payout.phone",
                      values.contacts.primary.phone
                    );
                  }
                }}
              />
              <span className="small text-muted">Reuse Primary Contact</span>
            </label>
          </div>
          <div className="col-md-4">
            <label className="form-label">Name</label>
            <Field
              name="contacts.payout.name"
              className="form-control"
              disabled={values.contacts.payout.reuse_primary}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Email</label>
            <Field
              name="contacts.payout.email"
              className="form-control"
              disabled={values.contacts.payout.reuse_primary}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label">Phone</label>
            <Field
              name="contacts.payout.phone"
              className="form-control"
              disabled={values.contacts.payout.reuse_primary}
            />
          </div>

          <div className="col-12 mt-5 border-top pt-4">
            <button type="submit" className="btn btn-primary btn-lg px-5">
              Save & Continue
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
