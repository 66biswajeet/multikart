"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
} from "reactstrap";
import { Formik, Form, Field } from "formik";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import request from "@/utils/axiosUtils";
import Btn from "@/elements/buttons/Btn";
import { toast } from "react-toastify";

const VendorDiscounts = () => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const apiRoute = "/vendor/discount";

  // 1. Fetch Discount Rules
  const {
    data: discountData,
    refetch,
    isLoading: discountsLoading,
  } = useCustomQuery(["vendorDiscounts"], () => request({ url: apiRoute }));

  // 2. Fetch Categories & Products for dropdowns
  const { data: categoryData } = useCustomQuery(["categories"], () =>
    request({ url: "/category" })
  );

  const { data: productData } = useCustomQuery(["vendorProducts"], () =>
    request({ url: "/product" })
  );

  // 3. Handle Create or Update Submission
  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const method = editingRule ? "put" : "post";
      const url = editingRule ? `${apiRoute}/${editingRule._id}` : apiRoute;

      const res = await request({
        url: url,
        method: method,
        data: values,
      });

      if (res.status === 200 || res.status === 201) {
        refetch();
        closeModal();
        toast.success(
          editingRule ? t("Updated successfully") : t("Created successfully")
        );
      }
    } catch (error) {
      toast.error(error.message || t("Something went wrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Handle Delete Action
  const handleDelete = async (id) => {
    if (confirm(t("Are you sure you want to delete this rule?"))) {
      try {
        const res = await request({
          url: `${apiRoute}/${id}`,
          method: "delete",
        });
        if (res.status === 200) {
          refetch();
          toast.success(t("Deleted successfully"));
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  // 5. Handle Status Toggle Action (Active Switch)
  const handleStatusToggle = async (rule) => {
    try {
      const res = await request({
        url: `${apiRoute}/${rule._id}`,
        method: "put",
        data: { status: !rule.status },
      });
      if (res.status === 200 || res.status === 201) {
        refetch();
        toast.success(t("Status updated"));
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openEditModal = (rule) => {
    setEditingRule(rule);
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setEditingRule(null);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5>{t("Discounts")}</h5>
              <Button color="primary" onClick={() => setModal(true)}>
                + {t("Add Rule")}
              </Button>
            </div>
            <div className="card-body">
              <Table responsive className="table-bordered theme-table">
                <thead>
                  <tr>
                    <th>{t("Rule Name")}</th>
                    <th>{t("Application Type")}</th>
                    <th>{t("Start Date")}</th>
                    <th>{t("End Date")}</th>
                    <th>{t("Value")}</th>
                    <th>{t("Active")}</th>
                    <th>{t("Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(discountData?.data?.data) ? (
                    discountData.data.data.map((rule) => (
                      <tr key={rule._id}>
                        <td>{rule.rule_name}</td>
                        <td>{rule.application_type}</td>
                        <td>{new Date(rule.start_date).toLocaleString()}</td>
                        <td>{new Date(rule.end_date).toLocaleString()}</td>
                        <td>
                          {rule.value}
                          {rule.discount_type === "Percentage" ? "%" : " Amt"}
                        </td>
                        <td>
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={rule.status}
                              onChange={() => handleStatusToggle(rule)}
                              style={{ cursor: "pointer" }}
                            />
                          </div>
                        </td>
                        <td>
                          <RiEdit2Line
                            className="me-2 text-info"
                            style={{ cursor: "pointer" }}
                            onClick={() => openEditModal(rule)}
                          />
                          <RiDeleteBinLine
                            className="text-danger"
                            style={{ cursor: "pointer" }}
                            onClick={() => handleDelete(rule._id)}
                          />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        {discountsLoading
                          ? t("Loading...")
                          : t("No discount rules found.")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={modal} toggle={closeModal} centered size="lg">
        <ModalHeader toggle={closeModal}>
          {editingRule ? t("Edit Discount Rule") : t("Add Discount Rule")}
        </ModalHeader>
        <ModalBody>
          <Formik
            enableReinitialize
            initialValues={{
              rule_name: editingRule?.rule_name || "",
              application_type: editingRule?.application_type || "All",
              apply_on: editingRule?.apply_on || "",
              discount_type: editingRule?.discount_type || "Percentage",
              value: editingRule?.value || "",
              start_date: editingRule?.start_date
                ? new Date(editingRule.start_date).toISOString().slice(0, 16)
                : "",
              end_date: editingRule?.end_date
                ? new Date(editingRule.end_date).toISOString().slice(0, 16)
                : "",
              status: editingRule ? editingRule.status : true,
            }}
            onSubmit={handleSubmit}
          >
            {({ values, setFieldValue }) => (
              <Form className="theme-form">
                <FormGroup>
                  <Label>{t("Rule Name")}</Label>
                  <Field name="rule_name" className="form-control" required />
                </FormGroup>

                <FormGroup>
                  <Label>{t("Application Type")}</Label>
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
                        />{" "}
                        {t(type)}
                      </Label>
                    ))}
                  </div>
                </FormGroup>

                {values.application_type === "Category" && (
                  <FormGroup>
                    <Label>{t("Apply on Category")}</Label>
                    <Field
                      as="select"
                      name="apply_on"
                      className="form-control"
                      required
                    >
                      <option value="">{t("Select Category")}</option>
                      {Array.isArray(categoryData?.data?.data) &&
                        categoryData.data.data.map((cat) => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                    </Field>
                  </FormGroup>
                )}

                {values.application_type === "Product" && (
                  <FormGroup>
                    <Label>{t("Apply on Product")}</Label>
                    <Field
                      as="select"
                      name="apply_on"
                      className="form-control"
                      required
                    >
                      <option value="">{t("Select Product")}</option>
                      {Array.isArray(productData?.data?.data) &&
                        productData.data.data.map((prod) => (
                          <option key={prod._id} value={prod._id}>
                            {prod.product_name}
                          </option>
                        ))}
                    </Field>
                  </FormGroup>
                )}

                <div className="row">
                  <div className="col-md-6">
                    <FormGroup>
                      <Label>{t("Discount Type")}</Label>
                      <Field
                        as="select"
                        name="discount_type"
                        className="form-control"
                      >
                        <option value="Percentage">
                          {t("Percentage (%)")}
                        </option>
                        <option value="Amount">{t("Fixed Amount")}</option>
                      </Field>
                    </FormGroup>
                  </div>
                  <div className="col-md-6">
                    <FormGroup>
                      <Label>{t("Value")}</Label>
                      <Field
                        name="value"
                        type="number"
                        className="form-control"
                        required
                      />
                    </FormGroup>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <FormGroup>
                      <Label>{t("Start Date")}</Label>
                      <Field
                        name="start_date"
                        type="datetime-local"
                        className="form-control"
                        required
                      />
                    </FormGroup>
                  </div>
                  <div className="col-md-6">
                    <FormGroup>
                      <Label>{t("End Date")}</Label>
                      <Field
                        name="end_date"
                        type="datetime-local"
                        className="form-control"
                        required
                      />
                    </FormGroup>
                  </div>
                </div>

                <div className="text-end mt-4">
                  <Button
                    color="secondary"
                    onClick={closeModal}
                    className="me-2"
                  >
                    {t("Cancel")}
                  </Button>
                  <Btn
                    type="submit"
                    title={editingRule ? t("Update") : t("Save")}
                    loading={Number(isSubmitting)}
                    className="btn-primary"
                  />
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default VendorDiscounts;
