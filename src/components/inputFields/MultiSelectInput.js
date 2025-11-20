import { ErrorMessage } from "formik";
import { RiCloseLine } from "react-icons/ri";
import { handleModifier } from "../../utils/validation/ModifiedErrorMessage";
import { useTranslation } from "react-i18next";
import React from "react";

// helper to read nested values (safe)
const getIn = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj
    );
};

// helper to find an item (search nested children)
const findItemByValue = (items = [], value, key = "id") => {
  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const itemVal = it[key] ?? it._id ?? it.id;
    if (String(itemVal) === String(value)) return it;
    if (it.subcategories?.length) {
      const f = findItemByValue(it.subcategories, value, key);
      if (f) return f;
    }
    if (it.child?.length) {
      const f2 = findItemByValue(it.child, value, key);
      if (f2) return f2;
    }
  }
  return null;
};

// Build visible label(s) for the selected value(s)
const buildDisplayText = ({
  selectedItems = [],
  values,
  name,
  data = [],
  getValuesKey = "id",
}) => {
  // prefer objects passed as selectedItems
  if (Array.isArray(selectedItems) && selectedItems.length > 0) {
    return selectedItems
      .map((it) => it?.name || it?.title || "")
      .filter(Boolean)
      .join(", ");
  }

  // fallback to reading Formik value
  const current = getIn(values, name);

  if (Array.isArray(current) && current.length > 0) {
    const labels = current.map((val) => {
      const found = findItemByValue(data, val, getValuesKey);
      return found ? found.name || found.title || String(val) : String(val);
    });
    return labels.join(", ");
  }

  if (current !== undefined && current !== null && current !== "") {
    const found = findItemByValue(data, current, getValuesKey);
    return found
      ? found.name || found.title || String(current)
      : String(current);
  }

  return "";
};

const MultiSelectInput = ({
  initialTittle,
  values,
  name,
  data,
  selectedItems = [],
  setIsComponentVisible,
  setFieldValue,
  setSelectedItems,
  errors,
  getValuesKey = "id",
}) => {
  const { t } = useTranslation("common");

  const displayText = buildDisplayText({
    selectedItems,
    values,
    name,
    data,
    getValuesKey,
  });

  // This is the function that removes the pill when the 'X' is clicked
  const RemoveSelectedItem = (id, item) => {
    let temp = getIn(values, name);

    if (temp.length > 0) {
      if (Array.isArray(temp)) {
        temp?.splice(temp.indexOf(id), 1);
        setFieldValue(name, temp);
      } else {
        // This is the single-select logic. We set the field to null to clear it.
        setFieldValue(name, null); // Change undefined to null for cleaner Formik state
      }
    } else if (temp == id) {
      setFieldValue(name, null); // Change undefined to null
    }
  };

  return (
    <>
      <div
        className={`bootstrap-tagsinput form-select`}
        onClick={() => setIsComponentVisible((p) => p !== name && name)}
      >
        {/* Check if we should display selected items */}
        {displayText && selectedItems?.length > 0 ? (
          selectedItems?.map((item, i) => (
            <span className="tag label label-info" key={i}>
              {/* Ensure we display name/title for pills */}
              {item.name || item.title}
              <a>
                <RiCloseLine
                  onClick={(e) => {
                    e.stopPropagation();
                    RemoveSelectedItem(item[getValuesKey], item);
                    // Update the local selectedItems state (which reflects the visual pills)
                    setSelectedItems((p) =>
                      p.filter(
                        (elem) => elem[getValuesKey] !== item[getValuesKey]
                      )
                    );

                    // If it's multi-select, update the Formik array state (Final Save Logic)
                    if (Array.isArray(fieldValue)) {
                      setFieldValue(
                        name,
                        fieldValue?.filter(
                          (elem) => elem[getValuesKey] !== item[getValuesKey]
                        )
                      );
                    } else {
                      // If it's single select, clear the field
                      setFieldValue(name, null);
                    }
                  }}
                />
              </a>
            </span>
          ))
        ) : (
          // Display placeholder if no value is present
          <span>{t(initialTittle ? initialTittle : "Select")}</span>
        )}
      </div>
      <ErrorMessage
        name={name}
        render={(msg) => (
          <div className="invalid-feedback d-block">
            {t(handleModifier(name))} {t("IsRequired")}
          </div>
        )}
      />
    </>
  );
};

export default MultiSelectInput;
