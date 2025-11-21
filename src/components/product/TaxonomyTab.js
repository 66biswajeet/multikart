import React from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Col } from "reactstrap";
import { FieldArray } from "formik";
import request from "@/utils/axiosUtils";
import { Category } from "@/utils/axiosUtils/API";
import Loader from "../commonComponent/Loader";
import SimpleInputField from "../inputFields/SimpleInputField";
import MultiSelectField from "../inputFields/MultiSelectField";

// A helper component to render the correct input field based on attribute type
const AttributeInput = ({ attribute, name, setFieldValue, values }) => {
  const { t } = useTranslation("common");

  const attributeData = attribute.attribute;

  if (!attributeData) return null;

  const attrName = attributeData.name;
  const inputType = attributeData.style;

  if (inputType === "dropdown") {
    const options = attributeData.attribute_values.map((val) => ({
      id: val.value,
      name: val.value,
      subcategories: [],
      child: [],
    }));

    return (
      <MultiSelectField
        name={name}
        title={t(attrName)}
        data={options}
        getValuesKey="id"
        setFieldValue={setFieldValue}
        values={values}
      />
    );
  }

  // Default to a simple text input
  return (
    <SimpleInputField
      nameList={[
        {
          name: name,
          title: t(attrName),
          placeholder: `${t("Enter")} ${attrName}`,
        },
      ]}
    />
  );
};

// A helper component to render variant inputs
const VariantInput = ({ variant, name, setFieldValue, values }) => {
  const { t } = useTranslation("common");

  const variantData = variant.variant;

  if (!variantData) return null;

  const varName = variantData.variant_name;

  const options = variantData.options.map((opt) => ({
    id: opt.label,
    name: opt.label,
    subcategories: [],
    child: [],
  }));

  return (
    <MultiSelectField
      name={name}
      title={t(varName)}
      data={options}
      getValuesKey="id"
      isMulti={true} // Allow selecting multiple options (e.g., Red, Blue)
      setFieldValue={setFieldValue}
      values={values}
    />
  );
};

const TaxonomyTab = ({ values, setFieldValue, errors }) => {
  const { t } = useTranslation("common");
  const selectedCategoryId = values.category_id;

  // 1. Fetch the selected category's details
  const { data: categoryData, isLoading } = useQuery({
    queryKey: ["category", selectedCategoryId],
    queryFn: () => request({ url: `${Category}/${selectedCategoryId}` }),
    enabled: !!selectedCategoryId, // Only run if a category is selected
    select: (data) => data?.data?.data,
  });

  if (!selectedCategoryId) {
    return (
      <Col>
        <div className="title-header option-title">
          <h5>{t("Taxonomy")}</h5>
        </div>
        <p className="text-muted">
          {t('Please select a category on the "General" tab first.')}
        </p>
      </Col>
    );
  }

  if (isLoading) {
    return <Loader />;
  }

  const { attribute_mapping, variant_mapping } = categoryData || {};

  return (
    <Col>
      <div className="title-header option-title">
        <h5>{t("Taxonomy")}</h5>
        <h6 className="text-muted">
          {t("Category")}: {categoryData?.name || ""}
        </h6>
      </div>

      {/* Render Attribute Inputs */}
      {attribute_mapping && attribute_mapping.length > 0 ? (
        <FieldArray
          name="attribute_values"
          render={() => (
            <div className="mb-4">
              <h5>{t("Attributes")}</h5>
              {attribute_mapping.map((attr, index) => {
                if (!attr.attribute) return null;

                // Find the index of this attribute in the Formik 'values' array
                let valueIndex = values.attribute_values.findIndex(
                  (val) => val.attribute_id === attr.attribute_id
                );

                // If it's not in the array, add it (with default value)
                if (valueIndex === -1) {
                  const newIndex = values.attribute_values.length;
                  // set the new element at next index
                  setFieldValue(`attribute_values.${newIndex}`, {
                    // USE DOT NOTATION
                    attribute_id: attr.attribute_id,
                    value: "",
                  });
                  // use the new index for the input name
                  valueIndex = newIndex;
                }

                return (
                  <div key={attr.attribute_id} className="mb-3">
                    <AttributeInput
                      attribute={attr}
                      name={`attribute_values.${valueIndex}.value`} // USE DOT NOTATION
                      setFieldValue={setFieldValue}
                      values={values}
                    />
                    {attr.is_mandatory && (
                      <small className="text-danger">{t("Mandatory")}</small>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        />
      ) : (
        <p>{t("No attributes linked to this category.")}</p>
      )}

      {/* Render Variant Inputs */}
      {variant_mapping && variant_mapping.length > 0 ? (
        <FieldArray
          name="variant_values"
          render={() => (
            <div className="border-top pt-4 mt-4">
              <h5>{t("Variants")}</h5>
              {variant_mapping.map((vari, index) => {
                if (!vari.variant) return null;

                let valueIndex = values.variant_values.findIndex(
                  (val) => val.variant_id === vari.variant_id
                );

                if (valueIndex === -1) {
                  const newIndex = values.variant_values.length;
                  setFieldValue(`variant_values.${newIndex}`, {
                    // USE DOT NOTATION
                    variant_id: vari.variant_id,
                    options: [], // Default to an empty array
                  });
                  valueIndex = newIndex;
                }

                return (
                  <div key={vari.variant_id} className="mb-3">
                    <VariantInput
                      variant={vari}
                      name={`variant_values.${valueIndex}.options`} // USE DOT NOTATION
                      setFieldValue={setFieldValue}
                      values={values}
                    />
                    {vari.is_mandatory && (
                      <small className="text-danger">{t("Mandatory")}</small>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        />
      ) : (
        <p>{t("No variants linked to this category.")}</p>
      )}
    </Col>
  );
};

export default TaxonomyTab;
