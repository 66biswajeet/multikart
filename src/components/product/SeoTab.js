import { useTranslation } from "react-i18next";
import SimpleFileUploadField from "../inputFields/SimpleFileUploadField";
import SimpleInputField from "../inputFields/SimpleInputField";

const SeoTab = ({ setFieldValue, values, updateId, errors }) => {
  
  const { t } = useTranslation( 'common');
  return (
    <>
      <SimpleInputField nameList={[{ name: "meta_title", placeholder: t("EnterMetaTitle") }, { name: "meta_description", placeholder: t("EnterMetaDescription"), type: "textarea" }]} />
      <SimpleFileUploadField 
        name="product_meta_image" 
        title="Product Meta Image" 
        values={values} 
        setFieldValue={setFieldValue} 
        errors={errors}
        helpertext="*Upload meta image for SEO (recommended size: 1200x630px)"
      />
    </>
  );
};

export default SeoTab;
