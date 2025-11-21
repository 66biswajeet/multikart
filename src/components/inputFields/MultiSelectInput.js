import { useEffect, useState } from "react"; // Added useState
import { ErrorMessage } from "formik";
import { RiCloseLine } from "react-icons/ri";
import { handleModifier } from "../../utils/validation/ModifiedErrorMessage";
import { useTranslation } from "react-i18next";

// Helper to read nested values safely
const getIn = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj
    );
};

const MultiSelectInput = ({
  values,
  name,
  selectedItems,
  setIsComponentVisible,
  setFieldValue,
  setSelectedItems,
  errors,
  getValuesKey,
  initialTittle,
  data, // We need 'data' to look up the name if selectedItems is empty
}) => {
  const { t } = useTranslation("common");
  const [displayValue, setDisplayValue] = useState(null);

  // Get the raw value from Formik
  const rawValue = getIn(values, name);

  // Effect to sync raw Formik value with a local display state
  // This ensures that even if selectedItems (from parent) lags, we update the UI
  useEffect(() => {
    if (!data) return;

    // If we have selectedItems passed from parent, use them (Multi-select case)
    if (selectedItems && selectedItems.length > 0) {
      return;
    }

    // Single Select Logic: Find the item in 'data' that matches 'rawValue'
    if (rawValue && !Array.isArray(rawValue)) {
      const foundItem = data.find(
        (item) => String(item._id) === String(rawValue)
      );
      if (foundItem) {
        setDisplayValue(foundItem);
      }
    } else {
      setDisplayValue(null);
    }
  }, [rawValue, data, selectedItems, getValuesKey]);

  const RemoveSelectedItem = (id, item) => {
    let temp = getIn(values, name);
    if (Array.isArray(temp)) {
      const newArray = temp.filter((val) => String(val) !== String(id));
      setFieldValue(name, newArray);
    } else {
      setFieldValue(name, null);
      setDisplayValue(null); // Clear local display
    }
  };

  // Determine what to render
  // 1. Multi-select items (from selectedItems prop)
  // 2. Single-select item (from local displayValue state)
  const renderTags = () => {
    if (selectedItems?.length > 0) {
      return selectedItems.map((item, i) => (
        <span className="tag label label-info" key={i}>
          {item.name || item.title}
          <a>
            <RiCloseLine
              onClick={(e) => {
                e.stopPropagation();
                RemoveSelectedItem(item._id, item);
                setSelectedItems((p) =>
                  p.filter((elem) => elem._id !== item._id)
                );
              }}
            />
          </a>
        </span>
      ));
    }

    if (displayValue) {
      return (
        <span className="tag label label-info">
          {displayValue.name || displayValue.title}
          <a>
            <RiCloseLine
              onClick={(e) => {
                e.stopPropagation();
                RemoveSelectedItem(displayValue._id);
              }}
            />
          </a>
        </span>
      );
    }

    return <span>{t(initialTittle ? initialTittle : "Select")}</span>;
  };

  return (
    <>
      <div
        className={`bootstrap-tagsinput form-select`}
        onClick={() => setIsComponentVisible((p) => p !== name && name)}
      >
        {renderTags()}
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
