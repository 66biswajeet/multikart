import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row } from "reactstrap";
import FormBtn from "../../elements/buttons/FormBtn";
import request from "../../utils/axiosUtils";
import { YupObject, nameSchema } from "../../utils/validation/ValidationSchemas";
import Loader from "../commonComponent/Loader";
import CheckBoxField from "../inputFields/CheckBoxField";
import SimpleInputField from "../inputFields/SimpleInputField";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { ToastNotification } from "../../utils/customFunctions/ToastNotification";

const TagForm = ({  updateId, type, buttonName }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: oldData, isLoading, refetch } = useCustomQuery(["role/id"], () => request({ url: `tag/${updateId}` }, router), { refetchOnMount: false, enabled: false });
  useEffect(() => {
    updateId && refetch();
  }, [updateId]);
  if (updateId && isLoading) return <Loader />;

  return (
    <Formik 
      enableReinitialize
      initialValues={{
        name: updateId ? oldData?.data?.data?.name || "" : "",
        type: type,
        description: updateId ? oldData?.data?.data?.description : "",
        status: updateId ? Boolean(Number(oldData?.data?.data?.status)) : true,
      }}
      validationSchema={YupObject({ name: nameSchema })}
      onSubmit={async (values) => {
        setIsSubmitting(true);
        
        try {
          const apiUrl = updateId ? `tag/${updateId}` : "tag";
          const method = updateId ? "PUT" : "POST";
          
          const response = await request({
            url: apiUrl,
            method: method,
            data: values
          }, router);
          
        ;
          
          // Check for success in multiple ways
          if (response?.data?.success || response?.status === 200 || response?.status === 201) {
            ToastNotification("success", updateId ? "Tag Updated Successfully" : "Tag Created Successfully");
            router.push("/tag");
          } else {
            ToastNotification("error", response?.data?.message || "Operation failed");
          }
          
        } catch (error) {
          console.error("Error in catch block:", error);
          console.error("Error response:", error?.response);
          console.error("Error message:", error?.message);
          ToastNotification("error", error?.response?.data?.message || error?.message || "Something went wrong");
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      {() => (
        <Form className="theme-form theme-form-2 mega-form">
          <Row>
            <SimpleInputField
              nameList={[
                { name: "name", placeholder: t("EnterTagName"), require: "true" },
                { name: "description", type: "textarea", title: "Description", placeholder: t("EnterDescription") },
              ]}
            />
            <CheckBoxField name="status" />
            <FormBtn loading={isSubmitting} buttonName={isSubmitting ? "Submitting..." : buttonName} />
          </Row>
        </Form>
      )}
    </Formik>
  );
};

export default TagForm;
