// "use client";
// import React, { useState } from "react";
// import { Col, Card, CardBody } from "reactstrap";
// import { useRouter } from "next/navigation";
// import { VendorProductAPI } from "@/utils/axiosUtils/API";
// import TableWrapper from "@/utils/hoc/TableWrapper";
// import ShowTable from "@/components/table/ShowTable";
// import Loader from "@/components/commonComponent/Loader";
// import Btn from "@/elements/buttons/Btn";
// import { FiPlus } from "react-icons/fi";
// import { useTranslation } from "react-i18next";

// const VendorProductTable = ({ data, ...props }) => {
//   // Process data to add discount indicators
//   const processedData = (data?.data || []).map((product) => ({
//     ...product,
//     // Format promo price with strike-through on base price if discount applies
//     promo_price:
//       product.promo_price && product.promo_price > 0
//         ? product.promo_price
//         : null,
//     // Add visual indicator for discounted products
//     has_discount:
//       product.has_discount || (product.promo_price && product.promo_price > 0),
//   }));

//   const headerObj = {
//     checkBox: true,
//     isSerialNo: false,
//     isOption: true,
//     noEdit: false,
//     // FIX: Manually defining the base path for the 'Edit' action
//     optionHead: {
//       title: "Action",
//       type: "edit",
//       url: "/vendor/products",
//     },
//     column: [
//       { title: "Image", apiKey: "image", type: "image", class: "sm-width" },
//       { title: "Product", apiKey: "name", sorting: true, sortBy: "desc" },
//       { title: "SKU", apiKey: "sku", sorting: true },
//       { title: "Base Price", apiKey: "base_price", type: "price" },
//       { title: "Floor Price", apiKey: "floor_price", type: "price" },
//       { title: "Promo Price", apiKey: "promo_price", type: "price" },
//       { title: "My Price", apiKey: "price", type: "price" },
//       { title: "Status", apiKey: "status", type: "switch" },
//     ],
//     data: processedData,
//   };

//   if (!data) return <Loader />;

//   return (
//     <ShowTable
//       {...props}
//       headerData={headerObj}
//       editPermission={true}
//       destroyPermission={true}
//       // This tells the component to look inside 'vendor/products/edit'
//       moduleName="products"
//       type="products"
//       url={VendorProductAPI}
//     />
//   );
// };

// const VendorProductTableWrapped = TableWrapper(VendorProductTable);

// const VendorProducts = () => {
//   const [isCheck, setIsCheck] = useState([]);
//   const router = useRouter();
//   const { t } = useTranslation("common");

//   return (
//     <Col sm="12">
//       <Card>
//         <CardBody>
//           <div className="title-header option-title mb-3">
//             <h5>{t("My Products")}</h5>
//             <Btn
//               className="align-items-center btn-theme add-button"
//               title={t("Add") + " " + t("My Products")}
//               onClick={() => router.push("/vendor/products/create")}
//             >
//               <FiPlus />
//             </Btn>
//           </div>
//           <VendorProductTableWrapped
//             url={VendorProductAPI}
//             moduleName="products"
//             isCheck={isCheck}
//             setIsCheck={setIsCheck}
//             onlyTitle={true}
//           />
//         </CardBody>
//       </Card>
//     </Col>
//   );
// };

// export default VendorProducts;

"use client";
import React, { useState, useEffect } from "react";
import {
  Col,
  Card,
  CardBody,
  Nav,
  NavItem,
  NavLink,
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Button,
  Input,
  InputGroup,
  InputGroupText,
} from "reactstrap";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  VendorProductAPI,
  product as masterProductApi,
} from "@/utils/axiosUtils/API";
import request from "@/utils/axiosUtils";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Loader from "@/components/commonComponent/Loader";
import Btn from "@/elements/buttons/Btn";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { placeHolderImage } from "@/data/CommonPath";

const VendorProductTable = ({ data, ...props }) => {
  const { t } = useTranslation("common");

  const processedData = (data?.data || []).map((product) => ({
    ...product,
    base_price: product.base_price,
    floor_price: product.floor_price,
    promo_price: product.promo_price > 0 ? product.promo_price : null,
    stock: product.stock_quantity || 0,
    active: product.status === "active",
  }));

  const headerObj = {
    checkBox: true,
    isSerialNo: false,
    isOption: true,
    noEdit: false,
    optionHead: {
      title: "Action",
      type: "edit",
      url: "/vendor/products",
    },
    column: [
      { title: "Image", apiKey: "image", type: "image", class: "sm-width" },
      { title: "Product", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "SKU", apiKey: "sku", sorting: true },
      { title: "Base Price", apiKey: "base_price", type: "price" },
      { title: "Floor Price", apiKey: "floor_price", type: "price" },
      { title: "Promotion Price", apiKey: "promo_price", type: "price" },
      { title: "Stock", apiKey: "stock", sorting: true },
      { title: "Active", apiKey: "status", type: "switch" },
    ],
    data: processedData,
  };

  if (!data) return <Loader />;

  return (
    <ShowTable
      {...props}
      headerData={headerObj}
      editPermission={true}
      destroyPermission={true}
      moduleName="products"
      type="products"
      url={VendorProductAPI}
    />
  );
};

const VendorProductTableWrapped = TableWrapper(VendorProductTable);

const VendorProducts = () => {
  const [isCheck, setIsCheck] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [modal, setModal] = useState(false);

  // Search & Selection State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const router = useRouter();
  const { t } = useTranslation("common");

  // Debounce Logic
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Master Products for the Modal Search
  const { data: masterProductData, isLoading: isSearchLoading } =
    useCustomQuery(
      ["masterProductSearch", debouncedSearch],
      () =>
        request({
          url: masterProductApi,
          params: {
            search: debouncedSearch,
            status: "active",
            paginate: 10,
          },
        }),
      {
        enabled: modal, // Only fetch when modal is open
        refetchOnWindowFocus: false,
        select: (data) => data?.data?.data,
      },
    );

  const tabs = [
    { id: "all", label: "All", count: 2 },
    { id: "active", label: "Live", count: 0 },
    { id: "inactive", label: "Inactive", count: 0 },
    { id: "sold_out", label: "Sold Out", count: 0 },
    { id: "pending", label: "Pending Review", count: 2 },
    { id: "action_required", label: "Action Required", count: 0 },
    { id: "draft", label: "Drafts", count: 0 },
    { id: "archived", label: "Archived", count: 0 },
  ];

  const toggleModal = () => {
    setModal(!modal);
    setSearchTerm("");
    setSelectedProduct(null);
  };

  const handleAddExisting = () => {
    if (selectedProduct) {
      // Navigate to create page with the selected product's ID
      router.push(`/vendor/products/create?mpid=${selectedProduct._id}`);
    }
  };

  return (
    <Col sm="12">
      <Card>
        <CardBody>
          <div className="title-header option-title mb-3">
            <h5>{t("Products")}</h5>
            <Btn
              className="align-items-center btn-theme add-button"
              title={t("Add Product")}
              onClick={toggleModal}
            >
              <FiPlus />
            </Btn>
          </div>

          <Nav tabs className="mb-3 custom-tabs">
            {tabs.map((tab) => (
              <NavItem key={tab.id}>
                <NavLink
                  className={activeTab === tab.id ? "active" : ""}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ cursor: "pointer" }}
                >
                  {t(tab.label)} ({tab.count})
                </NavLink>
              </NavItem>
            ))}
          </Nav>

          <VendorProductTableWrapped
            url={VendorProductAPI}
            params={{ status: activeTab !== "all" ? activeTab : null }}
            moduleName="products"
            isCheck={isCheck}
            setIsCheck={setIsCheck}
            onlyTitle={true}
          />
        </CardBody>
      </Card>

      {/* Add Product Modal */}
      <Modal isOpen={modal} toggle={toggleModal} size="xl" centered>
        <ModalHeader toggle={toggleModal} className="border-bottom-0 pb-0">
          <div className="w-100 text-center">
            <h4>{t("Add Product")}</h4>
            <p className="text-muted mb-0 small">
              {t(
                "Before adding a new product, please search our existing catalog. This helps you to list your products to your store faster.",
              )}
            </p>
          </div>
        </ModalHeader>
        <ModalBody className="p-4">
          <InputGroup className="mb-4 search-bar-modal">
            <InputGroupText className="bg-white border-end-0">
              <FiSearch className="text-muted" />
            </InputGroupText>
            <Input
              placeholder={t("Select from Zoom...")}
              className="border-start-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>

          <Row className="g-3 mb-4 justify-content-center">
            <Col md="5">
              <Button
                color="light"
                className="w-100 p-4 border d-flex flex-column align-items-center justify-content-center h-100"
                onClick={() => router.push("/vendor/products/request")}
                style={{ minHeight: "100px" }}
              >
                <span className="fw-bold">{t("Create a New Product")}</span>
                <small className="text-muted">
                  ({t("My product does not exist")})
                </small>
              </Button>
            </Col>
            <Col md="5">
              <Button
                color={selectedProduct ? "primary" : "light"}
                className={`w-100 p-4 border d-flex flex-column align-items-center justify-content-center h-100 ${
                  !selectedProduct ? "opacity-75" : ""
                }`}
                onClick={handleAddExisting}
                disabled={!selectedProduct}
                style={{ minHeight: "100px", transition: "all 0.3s" }}
              >
                <span className="fw-bold">
                  {t("Add Selected Product to My Store")}
                </span>
              </Button>
            </Col>
          </Row>

          <div
            className="table-responsive border rounded"
            style={{ maxHeight: "400px", overflowY: "auto" }}
          >
            <table className="table mb-0 align-middle table-hover">
              <thead className="bg-light sticky-top">
                <tr>
                  <th style={{ width: "80px" }}>{t("Image")}</th>
                  <th>{t("MPID")}</th>
                  <th>{t("Name")}</th>
                  <th>{t("Category")}</th>
                  <th>{t("Actions")}</th>
                </tr>
              </thead>
              <tbody>
                {isSearchLoading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      <Loader />
                    </td>
                  </tr>
                ) : masterProductData?.length > 0 ? (
                  masterProductData.map((prod) => {
                    // Corrected Image Logic based on your API response
                    const image =
                      prod.media?.find((m) => m.is_primary)?.url ||
                      prod.media?.[0]?.url ||
                      placeHolderImage;

                    return (
                      <tr
                        key={prod._id}
                        className={
                          selectedProduct?._id === prod._id
                            ? "table-primary"
                            : ""
                        }
                        style={{ cursor: "pointer" }}
                        onClick={() => setSelectedProduct(prod)}
                      >
                        <td>
                          <div
                            className="bg-light border d-flex align-items-center justify-content-center"
                            style={{
                              width: 40,
                              height: 40,
                              overflow: "hidden",
                            }}
                          >
                            <Image
                              src={image}
                              alt={prod.product_name}
                              width={40}
                              height={40}
                              style={{ objectFit: "contain" }}
                            />
                          </div>
                        </td>
                        <td>{prod.master_product_code || "N/A"}</td>
                        <td>
                          <div
                            className="text-truncate"
                            style={{ maxWidth: "250px" }}
                          >
                            {/* Corrected: Uses product_name */}
                            {prod.product_name}
                          </div>
                        </td>
                        <td>
                          {/* Corrected: Uses category_id object */}
                          {prod.category_id?.name || "N/A"}
                        </td>
                        <td>
                          <a
                            href="#"
                            className="text-primary text-decoration-underline"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            {t("View Product Page")}
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      {searchTerm
                        ? t("No products found matching your search.")
                        : t("Start typing to search products.")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* {showCreateAlert && (
            <div
              className="position-absolute top-50 start-50 translate-middle w-75 p-4 bg-white shadow-lg rounded border text-center"
              style={{ zIndex: 1050 }}
            >
              <div className="mb-3">
                <h5>{t("Add Product")}</h5>
              </div>
              <p className="text-muted mb-4">
                {t(
                  "We are working on to let vendors add new listing on their own. Meantime, please contact us to create new products.",
                )}
              </p>
              <Button
                color="dark"
                className="px-4"
                onClick={() => setShowCreateAlert(false)}
              >
                {t("OK")}
              </Button>
            </div>
          )} */}
        </ModalBody>
      </Modal>
    </Col>
  );
};

export default VendorProducts;
