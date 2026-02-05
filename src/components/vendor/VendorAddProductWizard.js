import React, { useState, useEffect, useMemo } from "react";
import {
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane,
  Row,
  Col,
  Table,
  Input,
  Label,
  Button,
  Card,
  CardBody,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import Image from "next/image";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { product as productApi } from "@/utils/axiosUtils/API";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import Loader from "@/components/commonComponent/Loader";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { FiUpload, FiX, FiEdit2 } from "react-icons/fi";
import StockManagementModal from "./widgets/StockManagementModal";

// Fallback data if Warehouse API returns 404
const DEFAULT_WAREHOUSES = [
  { _id: "000000000000000000000000", name: "Main Warehouse" },
];

const VendorAddProductWizard = ({ mpid: propMpid, editId }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("1");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mpid, setMpid] = useState(propMpid);

  const [stockModal, setStockModal] = useState({
    open: false,
    variantKey: null,
  });
  const [vendorConfig, setVendorConfig] = useState({});

  // 1. Unified Data Fetching
  const {
    data: pageData,
    isLoading: isLoadingData,
    error: loadError,
  } = useCustomQuery(
    editId ? ["vendorProductEdit", editId] : ["masterProductCreate", mpid],
    () =>
      request({
        url: editId ? `/vendor/product/${editId}` : `${productApi}/${mpid}`,
      }),
    {
      enabled: !!(editId || mpid),
      refetchOnWindowFocus: false,
      select: (res) => {
        const responseBody = res?.data || res;
        if (editId) {
          return {
            product: responseBody?.product,
            myOffer: responseBody?.myOffer,
          };
        } else {
          return {
            product: responseBody?.data || responseBody,
            myOffer: null,
          };
        }
      },
    },
  );

  const product = pageData?.product;
  const existingOffer = pageData?.myOffer;

  // 2. Fetch Warehouses
  const { data: warehouseData } = useCustomQuery(
    ["vendorWarehouses"],
    () => request({ url: "/vendor/warehouse" }),
    {
      refetchOnWindowFocus: false,
      select: (res) => {
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        return [];
      },
      onError: () => null,
    },
  );

  // --- HELPER: Deduplicate Attributes and Generate Cartesian Product ---
  const generatedVariants = useMemo(() => {
    if (!product) return [];

    const rawAttributes = product.variant_values || [];
    const uniqueAttributesMap = new Map();

    rawAttributes.forEach((attr) => {
      const id =
        typeof attr.variant_id === "object"
          ? attr.variant_id?._id
          : attr.variant_id;
      const name =
        typeof attr.variant_id === "object"
          ? attr.variant_id?.variant_name
          : "Variant";

      if (id && attr.options && attr.options.length > 0) {
        uniqueAttributesMap.set(id, {
          id: id,
          name: name,
          options: attr.options,
        });
      }
    });

    const attributes = Array.from(uniqueAttributesMap.values());

    if (attributes.length === 0) {
      return [
        {
          key: "main",
          name: "Standard",
          options: {},
          isDummy: true,
        },
      ];
    }

    const cartesian = (args) => {
      const r = [];
      const max = args.length - 1;
      function helper(arr, i) {
        for (let j = 0, l = args[i].length; j < l; j++) {
          const a = arr.slice(0);
          a.push(args[i][j]);
          if (i === max) r.push(a);
          else helper(a, i + 1);
        }
      }
      helper([], 0);
      return r;
    };

    const attributeOptions = attributes.map((attr) =>
      attr.options.map((opt) => ({
        attrId: attr.id,
        attrName: attr.name,
        value: typeof opt === "object" ? opt.label || opt.value : opt,
      })),
    );

    const combinations = cartesian(attributeOptions);

    return combinations.map((combo) => {
      const key = combo.map((c) => `${c.attrId}:${c.value}`).join("|");
      const displayName = combo.map((c) => c.value).join(" / ");
      const optionsMap = {};
      combo.forEach((c) => {
        optionsMap[c.attrId] = [c.value];
      });

      return {
        key: key,
        name: displayName,
        options: optionsMap,
        isDummy: false,
      };
    });
  }, [product]);

  // 3. Initialize State (Pre-fill logic with IMPROVED MATCHING)
  useEffect(() => {
    if (generatedVariants.length > 0) {
      const initialConfig = {};

      generatedVariants.forEach((variant) => {
        const variantKey = variant.key;
        let matchedOffer = null; // Store specific matched offer

        // Logic to find which existing offer matches this variant row
        if (existingOffer) {
          // Check if existingOffer is a single object (from GET details) or array (if we expanded API)
          // Currently GET details returns single 'myOffer' which might be just one combination or the product wrapper.
          // *CRITICAL*: The GET API currently returns 'myOffer' as a SINGLE object.
          // If the vendor has multiple variants saved (like your POST payload suggests),
          // the GET API needs to return an ARRAY of offerings in 'myOffer'.
          // Assuming 'myOffer' might be the relevant one for this specific variant if it matches.

          // Let's assume 'existingOffer' is the specific offering returned by API.
          // If the API returns multiple offerings, we need to search through them.
          // For now, let's try to match 'existingOffer' against the current variant line.

          const offerToTest = existingOffer; // In future, this might be loop: product.linked_vendor_offerings.find(...)

          if (variant.isDummy) {
            matchedOffer = offerToTest;
          } else if (offerToTest && offerToTest.selected_variants) {
            const keysA = Object.keys(variant.options).sort();
            const keysB = Object.keys(offerToTest.selected_variants).sort();

            // Compare Keys
            if (JSON.stringify(keysA) === JSON.stringify(keysB)) {
              // Compare Values (Handle Array vs String mismatch)
              const valuesMatch = keysA.every((k) => {
                const valA = variant.options[k][0]; // "White"
                const valB = offerToTest.selected_variants[k][0]; // "White" (or ["White"] if backend didn't flatten)
                return valA === valB;
              });

              if (valuesMatch) {
                matchedOffer = offerToTest;
              }
            }
          }

          // BACKUP: If your GET API only returns one 'myOffer' object but it matches this row, use it.
          // If you have multiple variants saved, you likely need to update GET API to return 'myOffers' (plural).
          // But based on your screenshots, we are editing one specific combination?
          // If the user selected "Edit" on the list page, did they click a specific variant or the whole product?
          // The list page usually shows "Product" level.

          // Temporary Fix for the specific screenshot case:
          // If the API returns exactly ONE offer and it matches this row, fill it.
        }

        if (matchedOffer) {
          // --- EDIT MODE: Populate Data ---
          const stockMap = {};
          let totalStock = 0;

          if (Array.isArray(matchedOffer.warehouse_stock)) {
            matchedOffer.warehouse_stock.forEach((inv) => {
              const whId =
                typeof inv.warehouse_id === "object"
                  ? inv.warehouse_id._id
                  : inv.warehouse_id;
              if (whId) {
                stockMap[whId] = {
                  stock: inv.stock,
                  low_stock: inv.low_stock_threshold || 0,
                };
                totalStock += inv.stock;
              }
            });
          } else {
            totalStock = matchedOffer.stock_quantity || 0;
          }

          initialConfig[variantKey] = {
            isSelected: true,
            sku: matchedOffer.vendor_sku,
            base_price: matchedOffer.base_price,
            floor_price: matchedOffer.floor_price,
            stockData: stockMap,
            totalVendorStock: totalStock,
            // Map dimensions/weight if available in response
            weight: matchedOffer.shipping_weight || 0,
            length: matchedOffer.dimensions?.length || 0,
            width: matchedOffer.dimensions?.width || 0,
            height: matchedOffer.dimensions?.height || 0,
            media: matchedOffer.media || [],
          };
        } else {
          // --- CREATE MODE / NO MATCH ---
          initialConfig[variantKey] = {
            isSelected: false,
            sku: "",
            base_price: product?.standard_price || "",
            floor_price: "",
            stockData: {},
            totalVendorStock: 0,
            weight: "",
            length: "",
            width: "",
            height: "",
            media: [],
          };
        }
      });
      setVendorConfig(initialConfig);
    }
  }, [generatedVariants, existingOffer, product]);

  // --- Handlers ---
  const handleConfigChange = (key, field, value) => {
    setVendorConfig((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const toggleSelection = (key) => {
    handleConfigChange(key, "isSelected", !vendorConfig[key]?.isSelected);
  };

  const openStockModal = (key) => {
    setStockModal({ open: true, variantKey: key });
  };

  const handleStockSave = (data) => {
    const key = stockModal.variantKey;
    let total = 0;
    Object.values(data).forEach((val) => (total += Number(val.stock || 0)));

    setVendorConfig((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        stockData: data,
        totalVendorStock: total,
      },
    }));
  };

  const handleImageUpload = (e, key) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newImages = files.map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
        isMain: false,
      }));
      setVendorConfig((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          media: [...prev[key].media, ...newImages],
        },
      }));
    }
  };

  const removeImage = (key, index) => {
    setVendorConfig((prev) => {
      const newMedia = [...prev[key].media];
      newMedia.splice(index, 1);
      return { ...prev, [key]: { ...prev[key], media: newMedia } };
    });
  };

  const setMainImage = (key, index) => {
    setVendorConfig((prev) => {
      const newMedia = prev[key].media.map((img, i) => ({
        ...img,
        isMain: i === index,
      }));
      return { ...prev, [key]: { ...prev[key], media: newMedia } };
    });
  };

  const getSelectedVariants = () => {
    return generatedVariants.filter((v) => vendorConfig[v.key]?.isSelected);
  };

  const handleSubmit = async () => {
    const selected = getSelectedVariants();
    if (selected.length === 0) {
      toast.error(t("Please select at least one variant."));
      return;
    }

    // Validation
    for (const v of selected) {
      const conf = vendorConfig[v.key];
      if (!conf.sku || !conf.base_price) {
        toast.error(t(`Please fill SKU and Price for ${v.name}`));
        return;
      }
    }

    // Payload Preparation
    const payload = {
      master_product_id: product._id,
      offerings: selected.map((v) => {
        const conf = vendorConfig[v.key];

        const inventory = Object.entries(conf.stockData)
          .map(([whId, data]) => ({
            warehouse_id: whId,
            stock_quantity: Number(data.stock),
            low_stock_threshold: Number(data.low_stock),
          }))
          .filter((i) => i.stock_quantity > 0);

        return {
          selected_variants: v.isDummy ? {} : v.options,
          vendor_sku: conf.sku,
          base_price: Number(conf.base_price),
          floor_price: Number(conf.floor_price),
          inventory_data: inventory,
          stock_quantity: conf.totalVendorStock,
          shipping_weight: Number(conf.weight),
          dimensions: {
            length: Number(conf.length),
            width: Number(conf.width),
            height: Number(conf.height),
          },
          is_active: true,
          media: conf.media.map((m) => ({
            is_main: m.isMain,
            id: m.id,
            url: m.url, // Pass existing URL so backend knows to keep it
          })),
        };
      }),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    selected.forEach((v, vIndex) => {
      const conf = vendorConfig[v.key];
      if (conf.media) {
        conf.media.forEach((m, mIndex) => {
          if (m.file) {
            formData.append(`files_variant_${vIndex}_${mIndex}`, m.file);
          }
        });
      }
    });

    setIsSubmitting(true);
    try {
      let res;
      if (editId) {
        res = await request({
          url: `/vendor/product/${editId}`,
          method: "put",
          data: formData,
        });
      } else {
        res = await request({
          url: "/vendor/product",
          method: "post",
          data: formData,
        });
      }

      if (res.status === 200 || res.status === 201) {
        toast.success(
          t(
            editId
              ? "Product updated successfully!"
              : "Products added successfully!",
          ),
        );
        router.push("/vendor/products");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          t("Something went wrong"),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingData) return <Loader />;
  if (loadError || !product) {
    return (
      <div className="alert alert-danger m-4">
        {t("Failed to load product data.")} <br />
        {loadError?.message}
      </div>
    );
  }

  const productName = product.product_name || product.name;
  const productDesc =
    product.product_policies?.about_this_item || product.description;
  const productCategory =
    product.category_id?.name ||
    product.categories?.map((c) => c.name).join(" > ");
  const productBrand = product.brand_id?.name || product.brand?.name || "N/A";

  return (
    <Card className="border-0">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h4 className="mb-1 text-dark">
              {editId ? t("Edit Product") : t("Add Product")}
            </h4>
            <p className="text-muted small mb-0">
              {editId
                ? t("Update product details")
                : t("Add product to my store")}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button color="light" onClick={() => router.back()}>
              {t("Cancel")}
            </Button>
            <Button color="light">{t("Save Draft")}</Button>
            <Btn
              className="btn-primary"
              title={editId ? t("Update Product") : t("Save & Finish")}
              onClick={handleSubmit}
              loading={Number(isSubmitting)}
              disabled={getSelectedVariants().length === 0}
            />
          </div>
        </div>

        <Nav tabs className="wizard-tabs mb-4 justify-content-center">
          {[
            "Product Identity",
            "Product Media",
            "Price & Stock",
            "Packing & Shipping",
          ].map((tabName, index) => (
            <NavItem key={index}>
              <NavLink
                className={`fw-bold ${activeTab === String(index + 1) ? "active" : ""}`}
                onClick={() => setActiveTab(String(index + 1))}
                style={{
                  cursor: "pointer",
                  color:
                    activeTab === String(index + 1)
                      ? "var(--theme-color)"
                      : "#666",
                }}
              >
                {t(tabName)}
              </NavLink>
            </NavItem>
          ))}
        </Nav>

        <TabContent activeTab={activeTab}>
          {/* TAB 1: PRODUCT IDENTITY */}
          <TabPane tabId="1">
            <div className="bg-light p-3 mb-3 rounded">
              <h6 className="fw-bold text-dark">{t("General")}</h6>
              <Row className="small">
                <Col md="6">
                  <p className="mb-1 text-dark">
                    <span className="text-muted">{t("Product Name")}:</span>{" "}
                    <strong>{productName}</strong>
                  </p>
                  <p className="mb-1 text-dark">
                    <span className="text-muted">{t("Category")}:</span>{" "}
                    <span className="text-dark">{productCategory}</span>
                  </p>
                  <p className="mb-1 text-dark">
                    <span className="text-muted">{t("Description")}:</span>
                    <span
                      className="d-block text-truncate text-dark"
                      style={{ maxWidth: "100%" }}
                    >
                      {productDesc}
                    </span>
                  </p>
                </Col>
                <Col md="6">
                  <p className="mb-1 text-dark">
                    <span className="text-muted">{t("MPID")}:</span>{" "}
                    <span className="text-dark">
                      {product.master_product_code}
                    </span>
                  </p>
                  <p className="mb-1 text-dark">
                    <span className="text-muted">{t("Brand")}:</span>{" "}
                    <span className="text-dark">{productBrand}</span>
                  </p>
                </Col>
              </Row>
            </div>

            <h6 className="fw-bold mt-4 mb-2 text-dark">{t("Variants")}</h6>
            <Table responsive bordered className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-dark" style={{ width: "100px" }}>
                    {t("UPID")}
                  </th>
                  <th style={{ width: "250px" }} className="text-dark">
                    {t("My SKU")} <span className="text-danger">*</span>
                  </th>
                  <th className="text-dark">{t("Name / Options")}</th>
                  <th className="text-center text-dark">{t("Add to Store")}</th>
                </tr>
              </thead>
              <tbody>
                {generatedVariants.map((variant) => {
                  const key = variant.key;
                  return (
                    <tr
                      key={key}
                      className={
                        vendorConfig[key]?.isSelected ? "table-active" : ""
                      }
                    >
                      <td className="text-dark small">
                        {product.master_product_code}
                      </td>
                      <td>
                        <Input
                          bsSize="sm"
                          placeholder={t("Enter your SKU")}
                          value={vendorConfig[key]?.sku || ""}
                          onChange={(e) =>
                            handleConfigChange(key, "sku", e.target.value)
                          }
                          disabled={!vendorConfig[key]?.isSelected}
                        />
                      </td>
                      <td>
                        <span className="fw-bold text-dark">
                          {variant.name}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="form-switch d-flex justify-content-center">
                          <Input
                            type="switch"
                            checked={vendorConfig[key]?.isSelected || false}
                            onChange={() => toggleSelection(key)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TabPane>

          {/* TAB 2, 3, 4 - Same structure as previous */}

          <TabPane tabId="2">
            <h6 className="fw-bold mb-3 text-dark">{t("Generic Media")}</h6>
            <Row className="g-3 mb-4">
              {(product.product_galleries || product.media || []).map(
                (img, i) => (
                  <Col key={i} xs="6" md="2">
                    <div
                      className="border rounded p-2 text-center"
                      style={{ height: "120px", position: "relative" }}
                    >
                      <Image
                        src={img.original_url || img.url}
                        alt="media"
                        fill
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                  </Col>
                ),
              )}
            </Row>
            <hr className="my-4" />
            {getSelectedVariants().map((variant) => {
              const key = variant.key;
              return (
                <div key={key} className="mb-4">
                  <h6 className="fw-bold mb-2 text-dark">
                    {vendorConfig[key]?.sku || t("SKU Pending")} -{" "}
                    <span className="text-muted fw-normal ms-2">
                      {variant.name}
                    </span>
                  </h6>
                  <Row className="g-3">
                    {vendorConfig[key]?.media?.map((img, idx) => (
                      <Col key={idx} xs="6" md="2">
                        <div
                          className={`border rounded p-1 position-relative ${img.isMain ? "border-primary border-2" : ""}`}
                          style={{ height: "120px" }}
                        >
                          <div style={{ height: "80px", position: "relative" }}>
                            <Image
                              src={img.url}
                              alt="variant media"
                              fill
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-1 px-1">
                            <small
                              className="cursor-pointer text-muted"
                              style={{ fontSize: "10px" }}
                              onClick={() => setMainImage(key, idx)}
                            >
                              {img.isMain ? t("Main") : t("Set Main")}
                            </small>
                            <FiX
                              className="text-danger cursor-pointer"
                              size={14}
                              onClick={() => removeImage(key, idx)}
                            />
                          </div>
                        </div>
                      </Col>
                    ))}
                    <Col xs="6" md="2">
                      <Label
                        className="border rounded d-flex flex-column align-items-center justify-content-center h-100 w-100 cursor-pointer bg-light"
                        style={{
                          minHeight: "120px",
                          borderStyle: "dashed !important",
                        }}
                      >
                        <FiUpload size={24} className="text-muted mb-2" />
                        <span className="small text-muted">{t("Upload")}</span>
                        <Input
                          type="file"
                          accept="image/*"
                          multiple
                          hidden
                          onChange={(e) => handleImageUpload(e, key)}
                        />
                      </Label>
                    </Col>
                  </Row>
                </div>
              );
            })}
          </TabPane>

          <TabPane tabId="3">
            <h6 className="fw-bold mb-3 text-dark">{t("Price & Stock")}</h6>
            <Table responsive bordered className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-dark">{t("UPID")}</th>
                  <th className="text-dark">{t("My SKU")}</th>
                  <th className="text-dark">{t("Name")}</th>
                  <th style={{ width: "150px" }} className="text-dark">
                    {t("Base Price")}
                  </th>
                  <th style={{ width: "150px" }} className="text-dark">
                    {t("Floor Price")}
                  </th>
                  <th className="text-dark">{t("FC Stock")}</th>
                  <th className="text-dark">{t("Vendor Stock")}</th>
                </tr>
              </thead>
              <tbody>
                {getSelectedVariants().map((variant) => {
                  const key = variant.key;
                  return (
                    <tr key={key}>
                      <td className="text-muted small">
                        {product.master_product_code}
                      </td>
                      <td className="fw-bold text-dark">
                        {vendorConfig[key].sku}
                      </td>
                      <td className="text-dark">{variant.name}</td>
                      <td>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={vendorConfig[key].base_price}
                          onChange={(e) =>
                            handleConfigChange(
                              key,
                              "base_price",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          bsSize="sm"
                          value={vendorConfig[key].floor_price}
                          onChange={(e) =>
                            handleConfigChange(
                              key,
                              "floor_price",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td className="text-center text-muted">-</td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <span className="fw-bold text-dark">
                            {vendorConfig[key].totalVendorStock}
                          </span>
                          <FiEdit2
                            className="text-primary cursor-pointer"
                            onClick={() => openStockModal(key)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TabPane>

          <TabPane tabId="4">
            <h6 className="fw-bold mb-3 text-dark">
              {t("Packing & Shipping")}
            </h6>
            <Table responsive bordered className="align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="text-dark">{t("My SKU")}</th>
                  <th className="text-dark">{t("Weight (g)")}</th>
                  <th className="text-dark">{t("Length (cm)")}</th>
                  <th className="text-dark">{t("Width (cm)")}</th>
                  <th className="text-dark">{t("Height (cm)")}</th>
                </tr>
              </thead>
              <tbody>
                {getSelectedVariants().map((variant) => {
                  const key = variant.key;
                  return (
                    <tr key={key}>
                      <td className="fw-bold text-dark">
                        {vendorConfig[key].sku}
                      </td>
                      <td>
                        <Input
                          type="number"
                          bsSize="sm"
                          placeholder="0"
                          value={vendorConfig[key].weight}
                          onChange={(e) =>
                            handleConfigChange(key, "weight", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          bsSize="sm"
                          placeholder="L"
                          value={vendorConfig[key].length}
                          onChange={(e) =>
                            handleConfigChange(key, "length", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          bsSize="sm"
                          placeholder="W"
                          value={vendorConfig[key].width}
                          onChange={(e) =>
                            handleConfigChange(key, "width", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <Input
                          type="number"
                          bsSize="sm"
                          placeholder="H"
                          value={vendorConfig[key].height}
                          onChange={(e) =>
                            handleConfigChange(key, "height", e.target.value)
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TabPane>
        </TabContent>

        <StockManagementModal
          isOpen={stockModal.open}
          toggle={() => setStockModal({ ...stockModal, open: false })}
          productTitle={`${productName} - ${getSelectedVariants().find((v) => v.key === stockModal.variantKey)?.name}`}
          sku={vendorConfig[stockModal.variantKey]?.sku}
          warehouses={
            warehouseData && warehouseData.length > 0
              ? warehouseData
              : DEFAULT_WAREHOUSES
          }
          currentStockData={vendorConfig[stockModal.variantKey]?.stockData}
          onSave={handleStockSave}
        />
      </CardBody>
    </Card>
  );
};

export default VendorAddProductWizard;
