import React from "react";
import SimpleFileUploadField from "../inputFields/SimpleFileUploadField";
import MultipleFileUploadField from "../inputFields/MultipleFileUploadField";
import FileUploadField from "../inputFields/FileUploadField";
import { getHelperText } from "../../utils/customFunctions/getHelperText";
import CheckBoxField from "../inputFields/CheckBoxField";
import SearchableSelectInput from "../inputFields/SearchableSelectInput";
import {waterMarkPosition} from "@/data/TabTitleList"
import { mediaConfig } from "@/data/MediaConfig";

const ImagesTab = ({ values, setFieldValue, errors, updateId }) => {
  return (
    <>
      <SimpleFileUploadField 
        errors={errors} 
        name="product_thumbnail" 
        title="Product Thumbnail" 
        values={values} 
        setFieldValue={setFieldValue} 
        helpertext={getHelperText('600x600px')} 
      />
      <MultipleFileUploadField 
        errors={errors} 
        name="product_galleries" 
        title="Product Gallery Images" 
        values={values} 
        setFieldValue={setFieldValue} 
        maxFiles={10}
        helpertext={getHelperText('600x600px')} 
      />
      {values["product_type"] === "digital" ? (
        null
      ):
      <SimpleFileUploadField 
        errors={errors} 
        name="size_chart_image" 
        title="Size Chart" 
        values={values} 
        setFieldValue={setFieldValue} 
        helpertext="*Upload an image showcasing the size chart tailored for fashion products. A table format image is suggested for easy reference." 
      />
      }
      <CheckBoxField name="watermark" title="Watermark" helpertext="*Enabling this setting will apply a watermark to images" />
      {values["watermark"] &&
      <SearchableSelectInput
        nameList={[
          {
            name: "watermark_position",
            title: "Watermark Position",
            require: "true",
            inputprops: {
              name: "watermark_position",
              id: "watermark_position",
              options: waterMarkPosition,
            },
          },
        ]}
      />
    }
    {values["watermark"] &&
      <SimpleFileUploadField 
        errors={errors} 
        name="watermark_image" 
        title="Watermark Image" 
        values={values} 
        setFieldValue={setFieldValue} 
        helpertext="*Upload image size 180x50px recommended" 
      />
    }
      </>
  );
};

export default ImagesTab;