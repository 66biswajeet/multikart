import { ErrorMessage, FieldArray, Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Row } from "reactstrap";
import Btn from "../../elements/buttons/Btn";
import FormBtn from "../../elements/buttons/FormBtn";
import request from "../../utils/axiosUtils";
import { attributeValues, nameSchema, YupObject } from "../../utils/validation/ValidationSchemas";
import Loader from "../commonComponent/Loader";
import SimpleInputField from "../inputFields/SimpleInputField";
import CreateAttributes from "./widgets/CreateAttributes";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { ToastNotification } from "../../utils/customFunctions/ToastNotification";

const AttributeForm = ({ updateId, buttonName }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    data: oldData,
    isLoading,
    refetch,
  } = useCustomQuery(["attribute", updateId], () => request({ url: `attribute/${updateId}` }, router), {
    refetchOnMount: false,
    enabled: false,
    select: (data) => data?.data,
  });
  
  useEffect(() => {
    if (updateId) {
      refetch();
    }
  }, [updateId]);
  
  if (updateId && isLoading) return <Loader />;
  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: updateId ? oldData?.data?.name || "" : "",
        style: updateId ? oldData?.data?.style || "" : "rectangle",
        value: updateId ? oldData?.data?.attribute_values || [] : [{ value: "", hex_color: "" }],
      }}
      validationSchema={YupObject({
        name: nameSchema,
        value: attributeValues,
      })}
      onSubmit={async (values) => {
        setIsSubmitting(true);
        console.log("Form submitted with values:", values);
        
        try {
          const apiUrl = updateId ? `attribute/${updateId}` : "attribute";
          const method = updateId ? "PUT" : "POST";
          
          // Prepare data
          const submitData = {
            name: values.name,
            style: values.style,
            status: 1,
            attribute_values: values.value || []
          };
          
          console.log("Making API call:", { apiUrl, method, submitData });
          
          const response = await request({
            url: apiUrl,
            method: method,
            data: submitData
          }, router);
          
          console.log("Full response received:", response);
          
          if (response?.data?.success || response?.status === 200 || response?.status === 201) {
            console.log("Success condition met");
            ToastNotification("success", updateId ? "Attribute Updated Successfully" : "Attribute Created Successfully");
            router.push("/attribute");
          } else {
            console.log("Success condition not met, showing error");
            ToastNotification("error", response?.data?.message || "Operation failed");
          }
          
        } catch (error) {
          console.error("Error in catch block:", error);
          ToastNotification("error", error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
          console.log("Setting isSubmitting to false");
          setIsSubmitting(false);
        }
      }}
    >
      {({ values }) => (
        <Form className="theme-form theme-form-2 mega-form">
          <CreateAttributes />
          <Row className="mb-0 align-items-center">
            <Col sm="12">
              <FieldArray
                name="value"
                render={(arrayHelpers) => {
                  return (
                    <>
                      {values["value"].map((item, i) => (
                        <Fragment key={i}>
                          <Row className="g-sm-4 g-3 align-items-center attribute-row">
                            <Col className="custom-row">
                              <SimpleInputField nameList={[{ noshowerror: true, name: `value[${i}][value]`, title: "Value", require: "true", placeholder: t("EnterValue"), isremovefield: arrayHelpers, values: values, keys: i }]} />
                              <div className="invalid-feedback feedback-right ">
                                <ErrorMessage
                                  name={`value[${i}][value]`}
                                  render={(msg) => (
                                    <div className="invalid-feedback d-block">
                                      {t("Value")} {t("IsRequired")}
                                    </div>
                                  )}
                                />
                              </div>
                            </Col>
                            {values.style == "color" && <SimpleInputField nameList={[{ name: `value[${i}][hex_color]`, type: "color", title: "Value", placeholder: t("EnterValue"), isremovefield: arrayHelpers, values: values, key: i }]} />}
                          </Row>
                        </Fragment>
                      ))}
                      <Col xs="4" className="offset-2">
                        <Btn className="btn-theme" onClick={() => arrayHelpers.push({ value: "" })} title="AddValue" />
                      </Col>
                    </>
                  );
                }}
              />
            </Col>
          </Row>
          <div className="align-items-start value-form">
            <div className="d-flex">
              <FormBtn loading={isSubmitting} buttonName={isSubmitting ? "Processing..." : buttonName} />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default AttributeForm;
