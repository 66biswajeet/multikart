import { Form, Formik } from "formik";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FormBtn from "../../elements/buttons/FormBtn";
import request from "../../utils/axiosUtils";
import { YupObject, nameSchema } from "../../utils/validation/ValidationSchemas";
import Loader from "../commonComponent/Loader";
import CheckBoxField from "../inputFields/CheckBoxField";
import SimpleFileUploadField from "../inputFields/SimpleFileUploadField";
import SimpleInputField from "../inputFields/SimpleInputField";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const BrandForm = ({ updateId, buttonName, mutate, loading }) => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: oldData, isLoading, refetch } = useCustomQuery([updateId], () => request({ url: `brand/${updateId}` }, router), { refetchOnMount: false, enabled: false });
  useEffect(() => {
    updateId && refetch();
  }, [updateId]);
  if (updateId && isLoading) return <Loader />;
  return (
    <>
      <Formik
        enableReinitialize
        initialValues={{
          name: updateId ? oldData?.data?.data?.name || "" : "",
          brand_image: updateId ? oldData?.data?.data?.brand_image || null : null,
          brand_banner: updateId ? oldData?.data?.data?.brand_banner || null : null,
          meta_title: updateId ? oldData?.data?.data?.meta_title || "" : "",
          meta_description: updateId ? oldData?.data?.data?.meta_description || "" : "",
          brand_meta_image: updateId ? oldData?.data?.data?.brand_meta_image || null : null,
          status: updateId ? Boolean(Number(oldData?.data?.data?.status)) : true,
        }}
        validationSchema={YupObject({
          name: nameSchema,
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setIsSubmitting(true);
          console.log("📤 Brand form submitted:", values);

          try {
            // Create FormData
            const formData = new FormData();
            
            // Append text fields
            formData.append('name', values.name);
            formData.append('meta_title', values.meta_title || '');
            formData.append('meta_description', values.meta_description || '');
            formData.append('status', values.status ? '1' : '0');
            
            // Append file fields (only if they are File objects)
            if (values.brand_image instanceof File) {
              formData.append('brand_image', values.brand_image);
              console.log("📎 Appending brand_image file:", values.brand_image.name);
            } else if (values.delete_brand_image) {
              formData.append('delete_brand_image', 'true');
            }
            
            if (values.brand_banner instanceof File) {
              formData.append('brand_banner', values.brand_banner);
              console.log("📎 Appending brand_banner file:", values.brand_banner.name);
            } else if (values.delete_brand_banner) {
              formData.append('delete_brand_banner', 'true');
            }
            
            if (values.brand_meta_image instanceof File) {
              formData.append('brand_meta_image', values.brand_meta_image);
              console.log("📎 Appending brand_meta_image file:", values.brand_meta_image.name);
            } else if (values.delete_brand_meta_image) {
              formData.append('delete_brand_meta_image', 'true');
            }
            
            // Log FormData contents
            console.log("📦 FormData entries:");
            for (let pair of formData.entries()) {
              console.log("  ", pair[0], ":", pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]);
            }

            const apiUrl = updateId ? `brand/${updateId}` : "brand";
            const method = updateId ? "PUT" : "POST";
            
            const response = await request({
              url: apiUrl,
              method: method,
              data: formData
            }, router);
            
            console.log("✅ Response received:", response?.data);

            if (response?.data?.success || response?.status === 200 || response?.status === 201) {
              ToastNotification("success", updateId ? "Brand Updated Successfully" : "Brand Created Successfully");
              router.push("/brand");
            } else {
              console.error("Unexpected response:", response);
              ToastNotification("error", response?.data?.message || "Unexpected response from server.");
            }
          }
          catch(error){
            console.error("❌ Error in form submission:", error);
            ToastNotification("error", error?.response?.data?.message || "Error in form submission: " + error.message);
          }
          finally{
            setIsSubmitting(false);
            setSubmitting(false);
          }
          
        }}
      >
        {({ values, setFieldValue, errors, touched }) => (
          <>
            <Form id="blog" className="theme-form theme-form-2 mega-form">
              <SimpleInputField nameList={[{ name: "name", placeholder: t("EnterName"), require: "true" }]} />
              
              <SimpleFileUploadField 
                name="brand_image" 
                title="Image" 
                values={values} 
                setFieldValue={setFieldValue} 
                errors={errors} 
              />
              
              <SimpleFileUploadField 
                name="brand_banner" 
                title="BannerImage" 
                values={values} 
                setFieldValue={setFieldValue} 
                errors={errors} 
              />
              
              <SimpleInputField
                nameList={[
                  { name: "meta_title", title: "meta_title", placeholder: t("enter_meta_title") },
                  { name: "meta_description", title: "meta_description", type: "textarea", rows: "3", placeholder: t("enter_meta_description") },
                ]}
              />
              
              <SimpleFileUploadField 
                name="brand_meta_image" 
                title="meta_image" 
                values={values} 
                setFieldValue={setFieldValue} 
                errors={errors} 
              />
              
              <CheckBoxField name="status" />
              <FormBtn loading={isSubmitting} buttonName={isSubmitting ? (updateId ? "Updating..." : "Creating...") : (updateId ? "Update" : "Create")} />
            </Form>
          </>
        )}
      </Formik>
    </>
  );
};

export default BrandForm;
