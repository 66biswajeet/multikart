import { useTranslation } from "react-i18next";
import Image from "next/image";
import { RiArrowRightSLine } from "react-icons/ri";

const CategoryOptions = ({ data, showList, setShowList, setFieldValue, setPath, name, values, getValuesKey }) => {
  const { t } = useTranslation( 'common');
  
  const handleSelect = (item) => {
    // Get the item value - handle both id and _id
    const itemValue = item[getValuesKey] || item._id || item.id;
    const itemValueStr = String(itemValue);
    
    if (Array.isArray(values[name])) {
      // For multi-select arrays
      const hasValue = values[name].some(val => String(val) === itemValueStr);
      if (hasValue) {
        // Remove item if already selected
        setFieldValue(name, values[name].filter((elem) => String(elem) !== itemValueStr));
      } else {
        // Add item if not selected
        setFieldValue(name, [...values[name], itemValue]);
      }
    } else {
      // For single select - compare as strings to handle ObjectId
      const currentValueStr = values[name] ? String(values[name]) : null;
      setFieldValue(name, itemValueStr === currentValueStr ? null : itemValue);
    }
  }
  
  const isSelected = (item) => {
    const itemValue = item[getValuesKey] || item._id || item.id;
    const itemValueStr = String(itemValue);
    
    if (Array.isArray(values[name])) {
      return values[name].some(val => String(val) === itemValueStr);
    } else {
      const currentValueStr = values[name] ? String(values[name]) : null;
      return itemValueStr === currentValueStr;
    }
  };
  
  return (
    <>
      {showList?.map((item, i) => {
        const itemValue = item[getValuesKey] || item._id || item.id;
        const selected = isSelected(item);
        
        return (
          <li key={i}>
            {item?.image && <Image src={item.image} className="img-fluid category-image" alt={item.name} height={80} width={80}
            />}
            {item?.name || item?.title}
            <a className={`select-btn ${selected ? "selected" : ""}`}
              onClick={() => handleSelect(item)}>
              {selected ? t("Selected") : t("Select")}
            </a>
            {Boolean((item?.subcategories?.length) || (item?.child?.length)) && (
              <a
                className="right-arrow"
                onClick={() => { setShowList(item?.subcategories || item?.child); setPath((prev) => [...prev, item]) }}>
                <RiArrowRightSLine />
              </a>
            )}
          </li>
        );
      })}
    </>
  );
};

export default CategoryOptions;
