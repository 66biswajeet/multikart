import TabForProduct from "@/components/product/widgets/TabForProduct";
import Btn from "@/elements/buttons/Btn";
import AccountContext from "@/helper/accountContext";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, Col, Row } from "reactstrap";
import SettingContext from "../../helper/settingContext";
import request from "../../utils/axiosUtils";
import { product } from "../../utils/axiosUtils/API";
import {
  YupObject,
  nameSchema,
} from "../../utils/validation/ValidationSchemas";
import Loader from "../commonComponent/Loader";
import AllProductTabs from "./widgets/AllProductTabs";
import {
  ProductInitValues,
  ProductValidationSchema,
} from "./widgets/ProductObjects";
import ProductSubmitFunction from "./widgets/ProductSubmitFunction";
import useCustomQuery from "@/utils/hooks/useCustomQuery";

const ProductForm = ({
  updateId,
  title,
  buttonName,
  saveButton,
  setSaveButton,
}) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState("1");
  const { state } = useContext(SettingContext);
  // We use .data at the end here because the API returns { data: { ...productData } }
  const {
    data: oldData,
    isLoading: oldDataLoading,
    refetch,
    status,
  } = useCustomQuery(
    [updateId],
    () => request({ url: `${product}/${updateId}` }, router),
    {
      refetchOnWindowFocus: false,
      enabled: !!updateId,
      select: (data) => data?.data?.data,
    }
  );
  useEffect(() => {
    if (updateId && !saveButton) {
      console.log("Fetching product data for ID:", updateId);
      refetch();
    }
  }, [updateId, saveButton, refetch]);

  // Debug log for oldData changes
  useEffect(() => {
    console.log("Old data changed:", oldData);
  }, [oldData]);

  const watchEvent = useCallback(
    (oldData, updateId) => {
      console.log("Processing initial values with:", { oldData, updateId });
      // Pass the actual product data object to the init function
      const values = ProductInitValues(oldData, updateId);
      console.log("Generated initial values:", values);
      return values;
    },
    [oldData, updateId]
  );
  const { role, accountData } = useContext(AccountContext);

  if (updateId && oldDataLoading) return <Loader />;
  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ ...watchEvent(oldData, updateId) }}
      // --- THIS IS THE FIX ---
      // We are removing the old, invalid 'store_id' validation rule.
      validationSchema={YupObject({
        ...ProductValidationSchema,
        // REMOVED: store_id: state?.isMultiVendor && role === "admin" && nameSchema,
      })}
      onSubmit={async (values, { setSubmitting, errors, touched }) => {
        console.log("🚀 Formik onSubmit called!");
        console.log("📝 Values:", values);
        console.log("❌ Errors:", errors);
        console.log("👆 Touched:", touched);

        try {
          setSubmitting(true);

          if (updateId) {
            values["_method"] = "put";
          }

          console.log("📤 Calling ProductSubmitFunction...");
          const response = await ProductSubmitFunction(null, values, updateId);
          console.log("✅ ProductSubmitFunction response:", response);

          // Show success message or handle response
          console.log("✅ Product saved successfully");

          // Navigate back to product list
          router.push(`/product`);
        } catch (error) {
          console.error("❌ Failed to save product:", error);
          // You could add toast notification here
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({
        values,
        setFieldValue,
        errors,
        touched,
        isSubmitting,
        setErrors,
        setTouched,
        isValid,
        dirty,
      }) => {
        console.log("🔄 Formik render - values:", values);
        console.log("❌ Formik render - errors:", errors);
        console.log("👆 Formik render - touched:", touched);
        console.log("✅ Formik render - isValid:", isValid);
        console.log("📝 Formik render - dirty:", dirty);
        console.log("⏳ Formik render - isSubmitting:", isSubmitting);

        return (
          <Form className="theme-form theme-form-2 mega-form vertical-tabs">
            <Row>
              <Col>
                <Card>
                  <div className="title-header option-title">
                    <h5>{t(title)}</h5>
                  </div>
                  <Row>
                    <Col xl="3" lg="4">
                      <TabForProduct
                        values={values}
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        errors={errors}
                        touched={touched}
                      />
                    </Col>
                    <AllProductTabs
                      setErrors={setErrors}
                      setTouched={setTouched}
                      touched={touched}
                      values={values}
                      activeTab={activeTab}
                      isSubmitting={isSubmitting}
                      setFieldValue={setFieldValue}
                      errors={errors}
                      updateId={updateId}
                      setActiveTab={setActiveTab}
                    />
                    <div className="ms-auto justify-content-end dflex-wgap mt-sm-4 mt-2 save-back-button">
                      <Btn
                        className="btn-outline"
                        title="Back"
                        onClick={() => router.back()}
                      />
                      {updateId && (
                        <Btn
                          className="btn-outline"
                          type="submit"
                          title={`save&Continue`}
                          onClick={() => setSaveButton(true)}
                        />
                      )}
                      <Btn
                        className="btn-primary"
                        type="submit"
                        title={buttonName}
                        disabled={isSubmitting} // Use Formik's isSubmitting
                        onClick={(e) => {
                          console.log("🖱️ Save button clicked!");
                          console.log("📊 Current errors:", errors);
                          console.log("✅ Is form valid:", isValid);
                          console.log("⏳ Is submitting:", isSubmitting);
                        }}
                      />
                    </div>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Form>
        );
      }}
    </Formik>
  );
};

export default ProductForm;
