"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Card,
  CardBody,
  FormGroup,
  Label,
  Button,
  Col,
  Row,
} from "reactstrap";
import request from "@/utils/axiosUtils";
import Btn from "@/elements/buttons/Btn";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const DiscountEditPage = () => {
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation("common");
  const discountId = params.id;
  
  const [discount, setDiscount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        // Fetch discount details
        const discountRes = await request({
          url: `/vendor/discount/${discountId}`,
          method: "GET",
        });

        if (!discountRes.data?.success) {
          throw new Error(discountRes.data?.message || "Failed to fetch discount");
        }

        setDiscount(discountRes.data?.data);

        // Fetch categories and products for dropdowns
        const [categoryRes, productRes] = await Promise.all([
          request({ url: "/category", method: "GET" }),
          request({ url: "/product", method: "GET" }),
        ]);

        setCategoryData(categoryRes.data?.data || []);
        setProductData(productRes.data?.data || []);
      } catch (err) {
        setError(err.message || "Failed to load discount details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [discountId]);

  const DiscountSchema = Yup.object().shape({
    rule_name: Yup.string().required("Rule name is required"),
    application_type: Yup.string().required("Application type is required"),
    discount_type: Yup.string().required("Discount type is required"),
    value: Yup.number().required("Value is required").min(0),
    start_date: Yup.string().required("Start date is required"),
    end_date: Yup.string().required("End date is required"),
  });

  if (loading) {
    return (
      <div className="container py-4">
        <div className="alert alert-info">{t("Loading discount details")}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">
          {t("Error")}: {error}
        </div>
        <Button color="secondary" onClick={() => router.push("/vendor/discounts")}>
          {t("Back to Discounts")}
        </Button>
      </div>
    );
  }

  if (!discount) {
    return (
      <div className="container py-4">
        <div className="alert alert-warning">{t("Discount not found")}</div>
        <Button color="secondary" onClick={() => router.push("/vendor/discounts")}>
          {t("Back to Discounts")}
        </Button>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <div className="title-header mb-4">
                <h5>{t("Edit Discount Rule")}</h5>
              </div>

              <Formik
                initialValues={{
                  rule_name: discount.rule_name || "",
                  application_type: discount.application_type || "All",
                  apply_on: discount.apply_on || "",
                  discount_type: discount.discount_type || "Percentage",
                  value: discount.value || "",
                  start_date: discount.start_date
                    ? new Date(discount.start_date).toISOString().slice(0, 16)
                    : "",
                  end_date: discount.end_date
                    ? new Date(discount.end_date).toISOString().slice(0, 16)
                    : "",
                  status: discount.status !== undefined ? discount.status : true,
                }}
                validationSchema={DiscountSchema}
                onSubmit={async (values) => {
                  setIsSubmitting(true);
                  try {
                    const res = await request({
                      url: `/vendor/discount/${discountId}`,
                      method: "PUT",
                      data: values,
                    });

                    if (res?.status === 200) {
                      toast.success(t("Discount updated successfully"));
                      router.push("/vendor/discounts");
                    }
                  } catch (error) {
                    toast.error(error?.message || t("Failed to update discount"));
                    console.error("Update error:", error);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                {({ values, setFieldValue, errors, touched }) => (
                  <Form className="theme-form">
                    <FormGroup>
                      <Label>{t("Rule Name")} *</Label>
                      <Field
                        name="rule_name"
                        className={`form-control ${
                          errors.rule_name && touched.rule_name ? "is-invalid" : ""
                        }`}
                      />
                      {errors.rule_name && touched.rule_name && (
                        <div className="invalid-feedback d-block">{errors.rule_name}</div>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <Label>{t("Application Type")} *</Label>
                      <div className="d-flex gap-4">
                        {["All", "Category", "Product"].map((type) => (
                          <Label key={type} check>
                            <Field
                              type="radio"
                              name="application_type"
                              value={type}
                              className="me-2"
                              onChange={(e) => {
                                setFieldValue("application_type", e.target.value);
                                setFieldValue("apply_on", "");
                              }}
                            />
                            {t(type)}
                          </Label>
                        ))}
                      </div>
                    </FormGroup>

                    {values.application_type === "Category" && (
                      <FormGroup>
                        <Label>{t("Apply on Category")} *</Label>
                        <Field
                          as="select"
                          name="apply_on"
                          className="form-control"
                        >
                          <option value="">{t("Select Category")}</option>
                          {Array.isArray(categoryData) &&
                            categoryData.map((cat) => (
                              <option key={cat._id} value={cat._id}>
                                {cat.name}
                              </option>
                            ))}
                        </Field>
                      </FormGroup>
                    )}

                    {values.application_type === "Product" && (
                      <FormGroup>
                        <Label>{t("Apply on Product")} *</Label>
                        <Field
                          as="select"
                          name="apply_on"
                          className="form-control"
                        >
                          <option value="">{t("Select Product")}</option>
                          {Array.isArray(productData) &&
                            productData.map((prod) => (
                              <option key={prod._id} value={prod._id}>
                                {prod.product_name}
                              </option>
                            ))}
                        </Field>
                      </FormGroup>
                    )}

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label>{t("Discount Type")} *</Label>
                          <Field
                            as="select"
                            name="discount_type"
                            className="form-control"
                          >
                            <option value="Percentage">{t("Percentage (%)")}</option>
                            <option value="Amount">{t("Fixed Amount")}</option>
                          </Field>
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label>{t("Value")} *</Label>
                          <Field
                            name="value"
                            type="number"
                            className={`form-control ${
                              errors.value && touched.value ? "is-invalid" : ""
                            }`}
                          />
                          {errors.value && touched.value && (
                            <div className="invalid-feedback d-block">{errors.value}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label>{t("Start Date")} *</Label>
                          <Field
                            name="start_date"
                            type="datetime-local"
                            className={`form-control ${
                              errors.start_date && touched.start_date ? "is-invalid" : ""
                            }`}
                          />
                          {errors.start_date && touched.start_date && (
                            <div className="invalid-feedback d-block">{errors.start_date}</div>
                          )}
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label>{t("End Date")} *</Label>
                          <Field
                            name="end_date"
                            type="datetime-local"
                            className={`form-control ${
                              errors.end_date && touched.end_date ? "is-invalid" : ""
                            }`}
                          />
                          {errors.end_date && touched.end_date && (
                            <div className="invalid-feedback d-block">{errors.end_date}</div>
                          )}
                        </FormGroup>
                      </Col>
                    </Row>

                    <FormGroup check>
                      <Label check>
                        <Field type="checkbox" name="status" className="me-2" />
                        {t("Active Status")}
                      </Label>
                    </FormGroup>

                    <div className="d-flex gap-2 mt-4">
                      <Button
                        color="secondary"
                        onClick={() => router.push("/vendor/discounts")}
                      >
                        {t("Cancel")}
                      </Button>
                      <Btn
                        type="submit"
                        title={t("Update Discount")}
                        loading={Number(isSubmitting)}
                        className="btn-primary"
                      />
                    </div>
                  </Form>
                )}
              </Formik>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DiscountEditPage;
