//

///----------------------------------------------

import { useTranslation } from "react-i18next";
// import SimpleFileUploadField from "../inputFields/SimpleFileUploadField"; // Removed
import SimpleInputField from "../inputFields/SimpleInputField";

const SeoTab = ({ setFieldValue, values, updateId, errors }) => {
  const { t } = useTranslation("common");
  return (
    <>
      <SimpleInputField
        nameList={[
          {
            name: "seo_meta_title",
            title: "MetaTitle",
            placeholder: t("EnterMetaTitle"),
          },
          {
            name: "seo_meta_description",
            title: "MetaDescription",
            placeholder: t("EnterMetaDescription"),
            type: "textarea",
          },
        ]}
      />

      {/* The 'product_meta_image' field has been removed 
        as all images are now handled in the "Media" tab.
      */}
      {/* <SimpleFileUploadField 
        name="product_meta_image" 
        title="Product Meta Image" 
        values={values} 
        setFieldValue={setFieldValue} 
        errors={errors}
        helpertext="*Upload meta image for SEO (recommended size: 1200x630px)"
      /> 
      */}
    </>
  );
};

export default SeoTab;
