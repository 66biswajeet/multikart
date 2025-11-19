import { ErrorMessage } from "formik";
import { RiCloseLine } from "react-icons/ri";
import { handleModifier } from "../../utils/validation/ModifiedErrorMessage";
import { useTranslation } from "react-i18next";

// 1. ADD THIS HELPER FUNCTION (Keep this section)
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
}) => {
  const { t } = useTranslation("common");

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

  // 2. THIS IS THE CRUCIAL LOGIC FOR DISPLAYING THE PILLS

  // Get the safely accessed value once for performance
  const fieldValue = getIn(values, name);

  // Determine if the field has any value (either an array with items or a single string)
  const hasValue =
    (Array.isArray(fieldValue) && fieldValue.length > 0) ||
    (!Array.isArray(fieldValue) && fieldValue);

  return (
    <>
      <div
        className={`bootstrap-tagsinput form-select`}
        onClick={() => setIsComponentVisible((p) => p !== name && name)}
      >
        {/* Check if we should display selected items */}
        {hasValue && selectedItems?.length > 0 ? (
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
