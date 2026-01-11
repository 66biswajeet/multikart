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
} from "reactstrap";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import { RiEdit2Line } from "react-icons/ri";
import { FiPlus } from "react-icons/fi";

import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Loader from "@/components/commonComponent/Loader";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import request from "@/utils/axiosUtils";
import { toast } from "react-toastify";
import Btn from "@/elements/buttons/Btn";

const inventoryApi = "/vendor/inventory";
const warehouseApi = "/warehouse";

const InventoryTable = ({ data, refetch, isCheck, setIsCheck, ...props }) => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch dropdown data
  const { data: productData } = useCustomQuery(["vendorProducts"], () =>
    request({ url: "/product" })
  );
  const { data: warehouseData } = useCustomQuery(["vendorWarehouses"], () =>
    request({ url: warehouseApi })
  );

  // FIX: Flatten status AND ensure every item has an 'id' property for the table logic
  const processedData = (data?.data?.data || data?.data || []).map((item) => ({
    ...item,
    id: item._id, // ShowTable often specifically looks for 'id'
    status_display:
      typeof item.stock_status === "object"
        ? item.stock_status.name
        : item.stock_status,
  }));

  const headerObj = {
    checkBox: true,
    isSerialNo: false,
    isOption: true,
    noEdit: true,
    optionHead: {
      title: "Action",
      type: "edit",
      url: "/vendor/inventory", // Dummy URL to satisfy internal component
    },
    column: [
      { title: "Image", apiKey: "image", type: "image", class: "sm-width" },
      { title: "Product", apiKey: "name", sorting: true },
      { title: "SKU", apiKey: "sku", sorting: true },
      { title: "Warehouse", apiKey: "warehouse_name" },
      { title: "Stock Level", apiKey: "stock", sorting: true },
      { title: "Status", apiKey: "status_display", type: "badge" },
    ],
    data: processedData,
  };

  const closeModal = () => {
    setModal(false);
    setSelectedItem(null);
  };

  const handleAdjustStock = async (values) => {
    setIsSubmitting(true);
    try {
      const res = await request({
        url: inventoryApi,
        method: "post",
        data: values,
      });
      if (res.status === 200 || res.status === 201) {
        refetch();
        closeModal();
        toast.success(t("Stock adjusted successfully"));
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!data) return <Loader />;

  return (
    <>
      <div className="title-header option-title mb-4">
        <h5>{t("Inventory Management")}</h5>
        <Btn
          className="align-items-center btn-theme add-button"
          onClick={() => setModal(true)}
        >
          <FiPlus /> {t("Adjust Stock")}
        </Btn>
      </div>

      <ShowTable
        {...props}
        headerData={headerObj}
        url={inventoryApi}
        moduleName="inventory"
        isCheck={isCheck} // Pass checkbox state down
        setIsCheck={setIsCheck} // Pass checkbox setter down
        customActions={(element) => (
          <RiEdit2Line
            className="text-info"
            style={{ cursor: "pointer", fontSize: "18px" }}
            onClick={() => {
              setSelectedItem(element);
              setModal(true);
            }}
          />
        )}
      />

      <Modal isOpen={modal} toggle={closeModal} centered>
        <ModalHeader toggle={closeModal}>
          {selectedItem ? t("Edit Stock") : t("Adjust New Stock")}
        </ModalHeader>
        <ModalBody>
          <Formik
            enableReinitialize
            initialValues={{
              product_id:
                selectedItem?.product?._id || selectedItem?.product_id || "",
              warehouse_id:
                selectedItem?.warehouse?._id ||
                selectedItem?.warehouse_id ||
                "",
              stock: selectedItem?.stock || 0,
              low_stock_threshold: selectedItem?.low_stock_threshold || 10,
            }}
            onSubmit={handleAdjustStock}
          >
            {({ values }) => (
              <Form className="theme-form">
                <FormGroup>
                  <Label>{t("Product")}</Label>
                  <Field
                    as="select"
                    name="product_id"
                    className="form-control"
                    disabled={!!selectedItem}
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

                <FormGroup>
                  <Label>{t("Warehouse")}</Label>
                  <Field
                    as="select"
                    name="warehouse_id"
                    className="form-control"
                    disabled={!!selectedItem}
                    required
                  >
                    <option value="">{t("Select Warehouse")}</option>
                    {Array.isArray(warehouseData?.data?.data)
                      ? warehouseData.data.data.map((wh) => (
                          <option key={wh._id} value={wh._id}>
                            {wh.name}
                          </option>
                        ))
                      : Array.isArray(warehouseData?.data)
                      ? warehouseData.data.map((wh) => (
                          <option key={wh._id} value={wh._id}>
                            {wh.name}
                          </option>
                        ))
                      : null}
                  </Field>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Current Stock Quantity")}</Label>
                  <Field
                    name="stock"
                    type="number"
                    className="form-control"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>{t("Low Stock Alert Threshold")}</Label>
                  <Field
                    name="low_stock_threshold"
                    type="number"
                    className="form-control"
                  />
                </FormGroup>

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
                    title={t("Save Changes")}
                    loading={Number(isSubmitting)}
                    className="btn-primary"
                  />
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </>
  );
};

const InventoryTableWrapped = TableWrapper(InventoryTable);

const VendorInventory = () => {
  const [isCheck, setIsCheck] = useState([]); // Manage checkbox state at the top level
  return (
    <Col sm="12">
      <Card>
        <CardBody>
          <InventoryTableWrapped
            url={inventoryApi}
            moduleName="inventory"
            onlyTitle={true}
            isCheck={isCheck}
            setIsCheck={setIsCheck}
          />
        </CardBody>
      </Card>
    </Col>
  );
};

export default VendorInventory;
