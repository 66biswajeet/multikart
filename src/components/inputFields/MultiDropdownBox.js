import { useEffect, useState } from "react";
import { RiCloseLine } from "react-icons/ri";
import CategoryOptions from "./CategoryOptions";
import { useTranslation } from "react-i18next";
import { Input } from "reactstrap";

// ADDED HELPER FUNCTION (Keep this)
const getIn = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(".")
    .reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined),
      obj
    );
};

const MultiDropdownBox = ({
  setIsComponentVisible,
  data,
  setFieldValue,
  values,
  name,
  getValuesKey,
  isComponentVisible,
}) => {
  const { t } = useTranslation("common");
  const [path, setPath] = useState([]);
  const [showList, setShowList] = useState([]);

  useEffect(() => {
    if (data) {
      setShowList(data);
    }
    if (isComponentVisible == false) {
      setPath([]);
    }
  }, [data, isComponentVisible]);

  // NEW CLOSURE LOGIC: If it's single select, the component must close
  const handleOptionSelect = (item) => {
    const isMultiSelect = Array.isArray(getIn(values, name));

    if (!isMultiSelect) {
      setIsComponentVisible(false);
    }
  };

  // (The hasValue and handleChange functions remain the same)
  const hasValue = (item, term) => {
    let valueToReturn = false;
    if (
      item &&
      item["name"] &&
      item["name"].toLowerCase().includes(term?.toLowerCase())
    ) {
      valueToReturn = true;
    }
    if (
      item &&
      item["title"] &&
      item["title"].toLowerCase().includes(term?.toLowerCase())
    ) {
      valueToReturn = true;
    }
    item["subcategories"]?.length &&
      item["subcategories"].forEach((child) => {
        if (hasValue(child, term)) {
          valueToReturn = true;
        }
      });
    item["child"]?.length &&
      item["child"].forEach((child) => {
        if (hasValue(child, term)) {
          valueToReturn = true;
        }
      });
    return valueToReturn;
  };

  const handleChange = (event) => {
    const keyword = event.target.value;
    if (keyword !== "") {
      const updatedData = [];
      data?.forEach((item) => {
        hasValue(item, keyword) && updatedData.push(item);
      });
      setShowList(updatedData);
    } else {
      setShowList(data);
    }
  };

  return (
    <div
      className={`select-category-box ${
        isComponentVisible == name && data ? "show" : ""
      }`}
    >
      {data?.length > 5 && (
        <Input
          placeholder="Search Here ..."
          className="search-input"
          onChange={handleChange}
        />
      )}
      {showList.length > 0 ? (
        <>
          <div className="category-content">
            <nav className="category-breadcrumb" aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li
                  className="breadcrumb-item"
                  onClick={() => {
                    setPath([]);
                    setShowList(data);
                  }}
                >
                  <a>{t("All")}</a>
                </li>
                {path.map((item, key) => (
                  <li
                    className={`breadcrumb-item ${
                      key + 1 === path.length ? "active" : ""
                    }`}
                    key={key}
                  >
                    <a
                      onClick={() => {
                        setShowList(item.subcategories ?? item.child);
                        setPath((p) => p.slice(0, key + 1));
                      }}
                    >
                      {item.name || item.title}
                    </a>
                  </li>
                ))}
              </ol>
              <a
                className="close-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setPath([]);
                  setIsComponentVisible(false);
                }}
              >
                <RiCloseLine />
              </a>
            </nav>
            <div className="category-listing">
              <ul>
                {showList && (
                  <CategoryOptions
                    data={data}
                    level={0}
                    showList={showList}
                    setShowList={setShowList}
                    // FIX 1: Pass the setter explicitly under a new prop name to prevent loss
                    formikSetter={setFieldValue}
                    path={path}
                    setPath={setPath}
                    setIsComponentVisible={setIsComponentVisible}
                    name={name}
                    values={values}
                    getValuesKey={getValuesKey}
                    // FIX 2: Pass down the new closing handler
                    onSelectAndClose={handleOptionSelect}
                  />
                )}
              </ul>
            </div>
          </div>
        </>
      ) : (
        "No Data Found"
      )}
    </div>
  );
};

export default MultiDropdownBox;
