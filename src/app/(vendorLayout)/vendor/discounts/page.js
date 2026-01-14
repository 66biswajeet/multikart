"use client";
import React, { useState } from "react";
import {
  Col,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Button,
  Table,
  Input,
} from "reactstrap";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import { RiPencilLine, RiDeleteBinLine } from "react-icons/ri";

import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Loader from "@/components/commonComponent/Loader";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import Status from "@/components/table/Status";
import { toast } from "react-toastify";
import { dateFormat } from "@/utils/customFunctions/DateFormat";

const apiRoute = "/vendor/discount";

const DiscountTable = ({
  data,
  refetch,
  isCheck,
  setIsCheck,
  setEditingRule,
  setModal,
  ...props
}) => {
  const { t } = useTranslation("common");
  const [selectedRows, setSelectedRows] = useState([]);

  // Fetch Categories & Products for the modal dropdowns
  const { data: categoryData } = useCustomQuery(["categories"], () =>
    request({ url: "/category" })
  );
  const { data: productData } = useCustomQuery(["vendorProducts"], () =>
    request({ url: "/product" })
  );

  if (data === null || data === undefined) return <Loader />;

  const tableData = Array.isArray(data) ? data : [];

  console.log("DiscountTable - data prop:", data);
  console.log("DiscountTable - tableData:", tableData);

  // Handle row checkbox
  const handleRowCheck = (itemId) => {
    if (selectedRows.includes(itemId)) {
      setSelectedRows(selectedRows.filter((id) => id !== itemId));
      setIsCheck(isCheck.filter((id) => id !== itemId));
    } else {
      setSelectedRows([...selectedRows, itemId]);
      setIsCheck([...isCheck, itemId]);
    }
  };

  // Handle select all
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = tableData.map((item) => item._id);
      setSelectedRows(allIds);
      setIsCheck(allIds);
    } else {
      setSelectedRows([]);
      setIsCheck([]);
    }
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (confirm(t("Are you sure you want to delete this rule?"))) {
      try {
        const res = await request({
          url: `${apiRoute}/${id}`,
          method: "delete",
        });
        if (res?.status === 200) {
          toast.success(t("Deleted successfully"));
          refetch();
        }
      } catch (error) {
        toast.error(error?.message || t("Failed to delete"));
        console.error("Delete error:", error);
      }
    }
  };

  return (
    <>
      <div className="table-responsive border-table">
        <Table className="role-table refund-table all-package theme-table datatable-wrapper">
          <thead>
            <tr>
              <th className="sm-width">
                <Input
                  type="checkbox"
                  className="custom-control-input checkbox_animated"
                  checked={
                    tableData.length > 0 &&
                    selectedRows.length === tableData.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th className="sm-width">{t("No")}</th>
              <th>{t("Rule Name")}</th>
              <th>{t("Application Type")}</th>
              <th>{t("Start Date")}</th>
              <th>{t("End Date")}</th>
              <th>{t("Value")}</th>
              <th>{t("Status")}</th>
              <th>{t("Action")}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length > 0 ? (
              tableData.map((item, index) => (
                <tr key={item._id}>
                  <td className="sm-width">
                    <Input
                      type="checkbox"
                      className="custom-control-input checkbox_animated"
                      checked={selectedRows.includes(item._id)}
                      onChange={() => handleRowCheck(item._id)}
                    />
                  </td>
                  <td className="sm-width">{index + 1}</td>
                  <td>{item.rule_name}</td>
                  <td>{item.application_type}</td>
                  <td>{dateFormat(item.start_date)}</td>
                  <td>{dateFormat(item.end_date)}</td>
                  <td>
                    {item.value}
                    {item.discount_type === "Percentage" ? "%" : " Amt"}
                  </td>
                  <td>
                    <Status data={item} url={apiRoute} />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <RiPencilLine
                        className="text-info"
                        style={{ cursor: "pointer", fontSize: "18px" }}
                        onClick={() => {
                          setEditingRule(item);
                          setModal(true);
                        }}
                      />
                      <RiDeleteBinLine
                        className="text-danger"
                        style={{ cursor: "pointer", fontSize: "18px" }}
                        onClick={() => handleDelete(item._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="text-center">
                  {t("No discount rules found")}
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>
    </>
  );
};

const VendorDiscounts = () => {
  const { t } = useTranslation("common");
  const [isCheck, setIsCheck] = useState([]);
  const [modal, setModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [discountData, setDiscountData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Categories & Products for the modal dropdowns
  const { data: categoryData } = useCustomQuery(["categories"], () =>
    request({ url: "/category" })
  );
  const { data: productData } = useCustomQuery(["vendorProducts"], () =>
    request({ url: "/product" })
  );

  // Fetch discount data
  React.useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    setLoading(true);
    try {
      const response = await request({
        url: apiRoute,
        method: "get",
        params: {
          paginate: 15,
          page: 1,
          search: "",
          sort: "asc",
          field: "",
        },
      });

      // The API returns { success: true, data: [...] }
      // So we need response.data.data to get the array
      if (Array.isArray(response?.data?.data)) {
        setDiscountData(response.data.data);
      } else {
        setDiscountData([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      toast.error(t("Failed to fetch discounts"));
      setDiscountData([]);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModal(false);
    setEditingRule(null);
  };

  const handleSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const method = editingRule ? "put" : "post";
      const url = editingRule ? `${apiRoute}/${editingRule._id}` : apiRoute;

      const res = await request({
        url,
        method,
        data: values,
      });

      if (res?.status === 200 || res?.status === 201) {
        closeModal();
        toast.success(
          editingRule ? t("Updated successfully") : t("Created successfully")
        );
        // Refresh discounts
        fetchDiscounts();
      }
    } catch (error) {
      toast.error(error?.message || t("Something went wrong"));
      console.error("API Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Col sm="12">
      <Card>
        <CardBody>
          <div className="title-header option-title mb-3">
            <h5>{t("Discounts")}</h5>
            <Btn
              className="align-items-center btn-theme add-button"
              title={t("Add Rule")}
              onClick={() => {
                setEditingRule(null);
                setModal(true);
              }}
            >
              <FiPlus />
            </Btn>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <DiscountTable
              data={discountData}
              refetch={fetchDiscounts}
              isCheck={isCheck}
              setIsCheck={setIsCheck}
              setEditingRule={setEditingRule}
              setModal={setModal}
            />
          )}

          {/* Add / Edit Modal */}
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
                    ? new Date(editingRule.start_date)
                        .toISOString()
                        .slice(0, 16)
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
                      <Field
                        name="rule_name"
                        className="form-control"
                        required
                      />
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
                                setFieldValue(
                                  "application_type",
                                  e.target.value
                                );
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
        </CardBody>
      </Card>
    </Col>
  );
};

export default VendorDiscounts;
