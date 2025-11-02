import { useEffect, useState } from "react";
import InputWrapper from "../../utils/hoc/InputWrapper";
import useOutsideDropdown from "../../utils/hooks/customHooks/useOutsideDropdown";
import MultiDropdownBox from "./MultiDropdownBox";
import MultiSelectInput from "./MultiSelectInput";

const MultiSelectField = ({ setFieldValue, values, name, getValuesKey = "id", data, errors, helpertext, initialTittle }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const { ref, isComponentVisible, setIsComponentVisible } = useOutsideDropdown();

  const SelectedItemFunction = (data) => {
    if (!data || !Array.isArray(data)) return;
    
    // Handle both single value and array
    const currentValue = values[name];
    const currentValues = Array.isArray(currentValue) 
      ? currentValue 
      : (currentValue !== undefined && currentValue !== null && currentValue !== '') 
        ? [currentValue] 
        : [];
    
    const selectedItems = [];
    
    const searchInData = (items) => {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        
        // Get the item value - handle both id and _id
        const itemValue = item[getValuesKey] || item._id || item.id;
        
        // Check if this item is selected - compare as strings to handle ObjectId
        const isSelected = currentValues.some(val => {
          const valStr = String(val);
          const itemValStr = String(itemValue);
          return valStr === itemValStr;
        });
        
        if (isSelected) {
          selectedItems.push(item);
        }
        
        // Check subcategories/children recursively
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
  
  useEffect(() => {
    setSelectedItems([]);
    SelectedItemFunction(data);
  }, [values?.[name], data]);
  return (
    <div className="category-select-box" ref={ref}>
      <MultiSelectInput initialTittle={initialTittle} values={values} name={name} data={data} selectedItems={selectedItems} setIsComponentVisible={setIsComponentVisible} setFieldValue={setFieldValue} setSelectedItems={setSelectedItems} errors={errors} getValuesKey={getValuesKey} />
      {helpertext && <p className="help-text">{helpertext}</p>}
      <MultiDropdownBox  data={data} values={values} setIsComponentVisible={setIsComponentVisible} setFieldValue={setFieldValue} name={name} getValuesKey={getValuesKey} isComponentVisible={isComponentVisible} />
    </div>
  );
};


export default InputWrapper(MultiSelectField);
