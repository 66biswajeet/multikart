import React, { useEffect, useState } from "react";
import { Modal, ModalBody, ModalHeader } from "reactstrap";
import { Formik, Form } from "formik";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { VendorProductAPI } from "@/utils/axiosUtils/API";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import SimpleInputField from "@/components/inputFields/SimpleInputField";
import SearchableSelectInput from "@/components/inputFields/SearchableSelectInput";
import InputField from "@/components/inputFields/InputField";

import { warehouse as WarehouseAPI } from "@/utils/axiosUtils/API";

const VendorOfferingForm = ({ product, isOpen, toggle }) => {
  const { t } = useTranslation("common");
  const router = useRouter();

  // 1. Validation Schema (Defined here or outside component)
  const OfferingSchema = Yup.object().shape({
    vendor_sku: Yup.string().required("Vendor SKU is required"),
    base_price: Yup.number().required("Base Price is required").min(0),
    floor_price: Yup.number().required("Floor Price is required").min(0),
    price: Yup.number().required("Price is required").min(1),
    condition: Yup.string().required("Condition is required"),
    shipping_info: Yup.string().required("Shipping info is required"),
    warehouse_stock: Yup.array().of(
      Yup.object().shape({
        warehouse_id: Yup.string().required(),
        stock: Yup.number().min(0).required(),
      })
    ),
    // Optionally add variant validation here
  });

  // 2. Fetch vendor warehouses
  const [warehouses, setWarehouses] = useState([]);
  useEffect(() => {
    async function fetchWarehouses() {
      try {
        const res = await request({ url: "/warehouse", method: "get" });
        setWarehouses(res.data?.data || []);
      } catch (e) {
        setWarehouses([]);
      }
    }
    fetchWarehouses();
  }, []);

  // 2. Submit Mutation (HOOK - Must be called unconditionally)
  const submitMutation = useMutation({
    mutationFn: (data) =>
      request({ url: VendorProductAPI, method: "POST", data }),
    onSuccess: () => {
      ToastNotification("success", "Product listed successfully!");
      toggle(); // Close modal
      router.push("/vendor/products"); // Redirect to My Products
    },
    onError: (error) => {
      ToastNotification(
        "error",
        error.response?.data?.message || "Failed to list product"
      );
    },
  });

  // 3. NOW we can safely return null if no product is selected
  if (!product) return null;

  // 4. Prepare variant info if available
  const hasVariants =
    Array.isArray(product.variant_values) && product.variant_values.length > 0;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {t("Sell Product")}: {product.product_name}
      </ModalHeader>
      <ModalBody>
        <div className="mb-4 d-flex gap-3 align-items-center p-3 bg-light rounded">
          <div className="flex-grow-1">
            <h6 className="mb-1">{product.product_name}</h6>
            <small className="text-muted">
              UPID: {product.master_product_code}
            </small>
          </div>
        </div>

        <Formik
          initialValues={{
            master_product_id: product._id,
            vendor_sku: "",
            base_price: "",
            floor_price: "",
            price: "",
            currency: "MVR",
            warehouse_stock: [],
            condition: "new",
            shipping_info: "",
            status: "active",
            // Optionally: variants: []
          }}
          validationSchema={OfferingSchema}
          onSubmit={(values) => {
            const formData = new FormData();
            const payload = {
              master_product_id: values.master_product_id,
              vendor_sku: values.vendor_sku,
              base_price: values.base_price,
              floor_price: values.floor_price,
              price: values.price,
              warehouse_stock: values.warehouse_stock,
              condition: values.condition,
              shipping_info: values.shipping_info,
              // Optionally: variants: values.variants
            };
            formData.append("data", JSON.stringify(payload));
            submitMutation.mutate(formData);
          }}
        >
          {({ isSubmitting, values, setFieldValue }) => (
            <Form className="theme-form">
              <SimpleInputField
                nameList={[
                  {
                    name: "vendor_sku",
                    title: "Vendor SKU",
                    type: "text",
                    placeholder: "e.g. VEND-12345",
                    require: "true",
                  },
                  {
                    name: "base_price",
                    title: "Base Price (MVR)",
                    type: "number",
                    placeholder: "e.g. 1000",
                    require: "true",
                  },
                  {
                    name: "floor_price",
                    title: "Floor Price (MVR)",
                    type: "number",
                    placeholder: "e.g. 900",
                    require: "true",
                  },
                  {
                    name: "price",
                    title: "Your Price (MVR)",
                    type: "number",
                    placeholder: "e.g. 1200",
                    require: "true",
                  },
                  {
                    name: "shipping_info",
                    title: "Shipping Information",
                    type: "text",
                    placeholder: "e.g. Ships in 2 days",
                    require: "true",
                  },
                ]}
              />

              {/* Warehouse selection and stock per warehouse */}
              {warehouses.length > 0 && (
                <div className="mb-3">
                  <label className="form-label">Warehouses & Stock</label>
                  {warehouses.map((wh, idx) => (
                    <div
                      key={wh._id}
                      className="d-flex align-items-center mb-2"
                    >
                      <input
                        type="checkbox"
                        checked={values.warehouse_stock.some(
                          (w) => w.warehouse_id === wh._id
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFieldValue("warehouse_stock", [
                              ...values.warehouse_stock,
                              { warehouse_id: wh._id, stock: 0 },
                            ]);
                          } else {
                            setFieldValue(
                              "warehouse_stock",
                              values.warehouse_stock.filter(
                                (w) => w.warehouse_id !== wh._id
                              )
                            );
                          }
                        }}
                        className="me-2"
                      />
                      <span className="me-2">{wh.name}</span>
                      {values.warehouse_stock.some(
                        (w) => w.warehouse_id === wh._id
                      ) && (
                        <input
                          type="number"
                          min="0"
                          value={
                            values.warehouse_stock.find(
                              (w) => w.warehouse_id === wh._id
                            )?.stock || 0
                          }
                          onChange={(e) => {
                            setFieldValue(
                              "warehouse_stock",
                              values.warehouse_stock.map((w) =>
                                w.warehouse_id === wh._id
                                  ? { ...w, stock: Number(e.target.value) }
                                  : w
                              )
                            );
                          }}
                          placeholder="Stock"
                          style={{ width: 80 }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <SearchableSelectInput
                nameList={[
                  {
                    name: "condition",
                    title: "Condition",
                    require: "true",
                    inputprops: {
                      name: "condition",
                      id: "condition",
                      options: [
                        { id: "new", name: "New" },
                        { id: "refurbished", name: "Refurbished" },
                      ],
                    },
                  },
                ]}
              />

              {/* Variants section */}
              {hasVariants && (
                <div className="mb-3">
                  <label className="form-label">Variants</label>
                  <div className="border rounded p-2">
                    {product.variant_values.map((variant, idx) => (
                      <div key={variant.variant_id} className="mb-2">
                        <strong>{variant.options.join(", ")}</strong>
                        {/* You can add price/stock fields for each variant here */}
                        {/* Example: */}
                        {/* <input type="number" placeholder="Price" /> <input type="number" placeholder="Stock" /> */}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Btn className="btn-secondary" onClick={toggle} type="button">
                  {t("Cancel")}
                </Btn>
                <Btn
                  className="btn-primary"
                  type="submit"
                  loading={isSubmitting || submitMutation.isLoading}
                >
                  {t("List Product")}
                </Btn>
              </div>
            </Form>
          )}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default VendorOfferingForm;
