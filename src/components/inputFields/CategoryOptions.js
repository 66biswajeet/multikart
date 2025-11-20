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

// 1. RECEIVE THE NEW formikSetter PROP
const CategoryOptions = ({
  data,
  showList,
  setShowList,
  formikSetter,
  // accept optional setFieldValue as a fallback if the caller passes it
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

    // prefer explicit formikSetter, fallback to setFieldValue if available
    const setter =
      typeof formikSetter === "function"
        ? formikSetter
        : typeof setFieldValue === "function"
        ? setFieldValue
        : null;

    if (!setter) {
      // don't throw — warn so you can trace where setter is missing
      // still trigger onSelectAndClose so UI can respond
      console.warn(
        "CategoryOptions: no formikSetter or setFieldValue provided. Selection won't update form state.",
        { name, item }
      );
    }

    if (Array.isArray(currentValue)) {
      const hasValue = currentValue.some((val) => String(val) === itemValueStr);
      if (hasValue) {
        if (setter) {
          setter(
            name,
            currentValue.filter((elem) => String(elem) !== itemValueStr)
          );
        }
      } else {
        if (setter) {
          setter(name, [...currentValue, itemValue]);
        }
      }
      // for multi-select we typically don't auto-close; still notify
      if (typeof onSelectAndClose === "function") onSelectAndClose(item);
    } else {
      // For single select - use setter when available
      const currentValueStr = currentValue ? String(currentValue) : null;
      if (setter) {
        setter(name, itemValueStr === currentValueStr ? null : itemValue);
      }
      // Trigger the closure logic immediately (if provided)
      if (typeof onSelectAndClose === "function") onSelectAndClose(item);
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
