import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Row, Label, Input } from "reactstrap";
import { RiAddLine, RiDeleteBinLine } from "react-icons/ri";
import Btn from "@/elements/buttons/Btn";
import MultiSelectField from "../inputFields/MultiSelectField";

/**
 * Reusable component for managing either Attribute or Variant mappings.
 */
const MappingSection = ({
  title,
  mappingType,
  availableItems,
  values, // This is the real Formik 'values' object
  setFieldValue, // This is the real Formik 'setFieldValue'
}) => {
  const { t } = useTranslation("common");
  const idKey = `${mappingType.split("_")[0]}_id`; // "attribute_id" or "variant_id"

  const onAddItem = () => {
    setFieldValue(mappingType, [
      ...values[mappingType],
      { [idKey]: "", is_mandatory: false },
    ]);
  };

  const onRemoveItem = (index) => {
    const newItems = [...values[mappingType]];
    newItems.splice(index, 1);
    setFieldValue(mappingType, newItems);
  };

  // Helper to update the Formik state
  const onFieldChange = (index, field, value) => {
    // We use the direct setFieldValue to update the nested path
    setFieldValue(`${mappingType}.${index}.${field}`, value);
  };

  // Filter out items that are already selected
  const availableOptions = availableItems
    ? availableItems.filter(
        (item) =>
          !values[mappingType]?.some((mapped) => mapped[idKey] === item.id)
      )
    : [];

  return (
    <div className="border-top pt-4 mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>{title}</h5>
        <Btn
          type="button"
          className="btn-primary"
          onClick={onAddItem}
          disabled={availableOptions.length === 0}
        >
          <RiAddLine className="me-1" /> {t("Add")}
        </Btn>
      </div>

      {values[mappingType]?.map((item, index) => {
        const currentItemId = item[idKey];

        // Add the currently selected item back to the dropdown's list
        let finalOptions = availableOptions;
        if (currentItemId) {
          const selectedItem = availableItems.find(
            (attr) => attr.id === currentItemId
          );
          if (selectedItem && !availableOptions.includes(selectedItem)) {
            finalOptions = [selectedItem, ...availableOptions];
          }
        }

        return (
          <Row
            key={index}
            className="align-items-center mb-3 p-3 border rounded"
          >
            {/* Select Dropdown */}
            <Col md={6}>
              {/* --- THIS IS THE FIX --- */}
              {/* We now pass the REAL, NESTED name, which MultiSelectField can handle */}
              <MultiSelectField
                name={`${mappingType}.${index}.${idKey}`}
                title={t(idKey === "attribute_id" ? "Attribute" : "Variant")}
                values={values}
                setFieldValue={setFieldValue}
                data={finalOptions}
                getValuesKey="id"
              />
            </Col>

            {/* Mandatory Checkbox */}
            <Col md={4}>
              <Label className="d-flex align-items-center gap-2" check>
                <Input
                  type="checkbox"
                  checked={item.is_mandatory}
                  onChange={(e) =>
                    onFieldChange(index, "is_mandatory", e.target.checked)
                  }
                />
                {t("IsMandatory")}
              </Label>
            </Col>

            {/* Delete Button */}
            <Col md={2} className="text-end">
              <Btn
                type="button"
                className="btn-danger btn-sm"
                onClick={() => onRemoveItem(index)}
              >
                <RiDeleteBinLine />
              </Btn>
            </Col>
          </Row>
        );
      })}
      {values[mappingType]?.length === 0 && (
        <p className="text-muted">{t("No mappings added.")}</p>
      )}
    </div>
  );
};

/**
 * Main component wrapper for both Attribute and Variant sections
 */
const AttributeVariantMappingField = ({
  values,
  setFieldValue,
  allAttributes,
  allVariants,
}) => {
  const { t } = useTranslation("common");

  return (
    <Col sm={12}>
      <MappingSection
        title={t("AttributeMapping")}
        mappingType="attribute_mapping"
        availableItems={allAttributes}
        values={values}
        setFieldValue={setFieldValue}
      />
      <MappingSection
        title={t("VariantMapping")}
        mappingType="variant_mapping"
        availableItems={allVariants}
        values={values}
        setFieldValue={setFieldValue}
      />
    </Col>
  );
};

export default AttributeVariantMappingField;
