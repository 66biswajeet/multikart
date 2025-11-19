import { useTranslation } from "react-i18next";
import Image from "next/image";
import { RiArrowRightSLine } from "react-icons/ri";

// ADDED HELPER FUNCTION
const getIn = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj
    );
};

const CategoryOptions = ({
  data,
  showList,
  setShowList,
  setFieldValue,
  setPath,
  name,
  values,
  getValuesKey,
  onSelectAndClose,
}) => {
  const { t } = useTranslation("common");

  const handleSelect = (item) => {
    const itemValue = item[getValuesKey] || item._id || item.id;
    const itemValueStr = String(itemValue);

    const currentValue = getIn(values, name);

    if (Array.isArray(currentValue)) {
      // For multi-select arrays (Logic unchanged)
      const hasValue = currentValue.some((val) => String(val) === itemValueStr);
      if (hasValue) {
        setFieldValue(
          name,
          currentValue.filter((elem) => String(elem) !== itemValueStr)
        );
      } else {
        setFieldValue(name, [...currentValue, itemValue]);
      }
    } else {
      // For single select - CRITICAL FIX
      const currentValueStr = currentValue ? String(currentValue) : null;

      // 1. Perform setFieldValue
      setFieldValue(name, itemValueStr === currentValueStr ? null : itemValue);

      // 2. Add a tiny delay before closing the dropdown to ensure Formik recognizes the value.
      setTimeout(() => {
        onSelectAndClose(item);
      }, 50);
    }
  };

  const isSelected = (item) => {
    const itemValue = item[getValuesKey] || item._id || item.id;
    const itemValueStr = String(itemValue);

    const currentValue = getIn(values, name);

    if (Array.isArray(currentValue)) {
      return currentValue.some((val) => String(val) === itemValueStr);
    } else {
      const currentValueStr = currentValue ? String(currentValue) : null;
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
            {item?.image && (
              <Image
                src={item.image}
                className="img-fluid category-image"
                alt={item.name}
                height={80}
                width={80}
              />
            )}
            {item?.name || item?.title}
            <a
              className={`select-btn ${selected ? "selected" : ""}`}
              onClick={() => handleSelect(item)}
            >
              {selected ? t("Selected") : t("Select")}
            </a>
            {Boolean(item?.subcategories?.length || item?.child?.length) && (
              <a
                className="right-arrow"
                onClick={() => {
                  setShowList(item?.subcategories || item?.child);
                  setPath((prev) => [...prev, item]);
                }}
              >
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
