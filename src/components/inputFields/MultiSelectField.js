import { useEffect, useState } from "react";
import InputWrapper from "../../utils/hoc/InputWrapper";
import useOutsideDropdown from "../../utils/hooks/customHooks/useOutsideDropdown";
import MultiDropdownBox from "./MultiDropdownBox";
import MultiSelectInput from "./MultiSelectInput";

// 1. ADD THIS HELPER 
// This function allows us to read nested values from an object
const getIn = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj
    );
};

const MultiSelectField = ({
  setFieldValue,
  values,
  name,
  getValuesKey = "id",
  data,
  errors,
  helpertext,
  initialTittle,
  isMulti, // Check if the field is explicitly marked as multi-select
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const { ref, isComponentVisible, setIsComponentVisible } =
    useOutsideDropdown();

  const SelectedItemFunction = (data) => {
    if (!data || !Array.isArray(data)) return;

    // 2. FIX: Read the nested value safely
    const currentValue = getIn(values, name);

    // Determine if it's an array for multi-select, or a single value wrapped in an array
    const currentValues =
      Array.isArray(currentValue) && isMulti
        ? currentValue
        : currentValue !== undefined &&
          currentValue !== null &&
          currentValue !== ""
        ? [currentValue] // Wrap single value in array for internal processing
        : [];

    const selectedItems = [];

    const searchInData = (items) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];

        const itemValue = item[getValuesKey] || item._id || item.id;

        const isSelected = currentValues.some((val) => {
          const valStr = String(val);
          const itemValStr = String(itemValue);
          return valStr === itemValStr;
        });

        if (isSelected) {
          selectedItems.push(item);
        }

        if (item.subcategories?.length > 0) {
          searchInData(item.subcategories);
        }
        if (item.child?.length > 0) {
          searchInData(item.child);
        }
      }
    };

    searchInData(data);
    setSelectedItems(selectedItems);
  };

  // 3. Dependency array uses getIn to trigger re-calculation when Formik state changes
  useEffect(() => {
    setSelectedItems([]);
    SelectedItemFunction(data);
  }, [getIn(values, name), data, isMulti]);

  return (
    <div className="category-select-box" ref={ref}>
      <MultiSelectInput
        initialTittle={initialTittle}
        values={values}
        name={name}
        data={data}
        selectedItems={selectedItems}
        setIsComponentVisible={setIsComponentVisible}
        setFieldValue={setFieldValue}
        setSelectedItems={setSelectedItems}
        errors={errors}
        getValuesKey={getValuesKey}
      />
      {helpertext && <p className="help-text">{helpertext}</p>}
      <MultiDropdownBox
        data={data}
        values={values}
        setIsComponentVisible={setIsComponentVisible}
        setFieldValue={setFieldValue}
        name={name}
        getValuesKey={getValuesKey}
        isComponentVisible={isComponentVisible}
        isMulti={isMulti} // Pass down the multi-select flag
      />
    </div>
  );
};

export default InputWrapper(MultiSelectField);
