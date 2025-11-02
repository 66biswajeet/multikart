import Loader from "@/components/commonComponent/Loader";
import FormBtn from "@/elements/buttons/FormBtn";
import request from "@/utils/axiosUtils";
import { YupObject, nameSchema, permissionsSchema } from "@/utils/validation/ValidationSchemas";
import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SimpleInputField from "../inputFields/SimpleInputField";
import PermissionsCheckBoxForm from "./widgets/PermissionsCheckBoxForm";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const PermissionForm = ({ updateId, buttonName }) => {
  const router = useRouter();
  const { t } = useTranslation("common");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getPermissionsIdsArray = (data) => {
    if (!data) return null;
    const { permissions, name, display_name, description } = data;
    return {
      name,
      display_name: display_name || name,
      description: description || "",
      permissions: permissions ? permissions.map((permissionsData) => permissionsData.id) : []
    };
  };

  const { data: oldData, isLoading, refetch } = useCustomQuery(
    ["role", updateId], 
    () => request({ url: `role/${updateId}` }, router), 
    { 
      refetchOnMount: false, 
      enabled: false, 
      
    }
  );

  useEffect(() => {
    
    if(updateId) {
      console.log("Fetching old data for updateId:", updateId);
      console.log("Old data before refetch:", oldData);
      refetch();
    }
  }, [updateId]);

  if (updateId && isLoading) return <Loader />;

  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          name: updateId ? oldData?.data?.data?.name || "" : "",
          display_name: updateId ? oldData?.data?.data?.display_name || "" : "",
          description: updateId ? oldData?.data?.data?.description || "" : "",
          permissions: updateId ? oldData?.data?.data?.permissions.map((permissionsData) => permissionsData.id) || [] : [],
        }}
        validationSchema={YupObject({
          name: nameSchema,
          display_name: nameSchema,
          permissions: permissionsSchema,
        })}
        onSubmit={async (values) => {
          setIsSubmitting(true);
          try {
            const apiUrl = updateId ? `role/${updateId}` : "role";
            const method = updateId ? "PUT" : "POST";

            const response = await request({
              url: apiUrl,
              method: method,
              data: values
            });

            if (response?.data?.success) {
              ToastNotification("success", response.data.message);
              router.push("/role");
            } else {
              ToastNotification("error", response?.data?.message || "Operation failed");
            }
          } catch (error) {
            console.error("Error submitting role:", error);
            ToastNotification("error", error?.response?.data?.message || "Something went wrong");
          } finally {
            setIsSubmitting(false);
          }
        }}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <Form>
            <div className="theme-form theme-form-2 mega-form">
              <SimpleInputField 
                nameList={[
                  { name: "name", placeholder: t("RoleName"), require: "true" },
                  { name: "display_name", placeholder: "Display Name", require: "true" },
                  { name: "description", placeholder: "Role Description", type: "textarea" }
                ]} 
              />
            </div>
            <PermissionsCheckBoxForm values={values} errors={errors} touched={touched} setFieldValue={setFieldValue} />
            <FormBtn loading={isSubmitting} buttonName={isSubmitting ? "Processing..." : buttonName} />
          </Form>
        )}
      </Formik>
    </>
  );
};

export default PermissionForm;
