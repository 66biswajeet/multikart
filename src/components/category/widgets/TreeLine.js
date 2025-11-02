import React from "react";
import { useRouter } from "next/navigation";
import Options from "../../table/Options";
import { RiArrowDownSLine } from "react-icons/ri";

const TreeLine = ({ data, level, active, setActive, type, mutate, loading }) => {
  const router = useRouter();

  if (!data) return null;

  return (
    <ul>
      {data.map((item, i) => {
        const hasSubcategories = item.subcategories && item.subcategories.length > 0;
        const itemId = item._id || item.id; // Handle both _id and id
        
        return (
          <li key={itemId || i} className={hasSubcategories ? "inside-ul" : ""} style={{ color: router?.query?.updateId == itemId ? "#0da487" : "" }}>
            <div
              className={`${item.status == 0 ? "disabled" : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                if (hasSubcategories) {
                  let temp = [...active]; // Create new array to avoid mutation
                  if (active.includes(itemId)) {
                    temp = temp.filter(id => id !== itemId);
                  } else {
                    temp.push(itemId);
                  }
                  setActive(temp);
                }
              }}
            >
              {hasSubcategories && (
                <RiArrowDownSLine 
                  className={`tree-arrow ${active.includes(itemId) ? 'rotate' : ''}`}
                  style={{ 
                    transform: active.includes(itemId) ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
              )}
              <span className="category-name">{item.name}</span>
              <div className="tree-options">
                <Options fullObj={item} mutate={mutate} type={type} loading={loading} keyInPermission={"category"} />
              </div>
            </div>
            {hasSubcategories && (
              <div className={active.includes(itemId) ? "d-block tree-subcategories" : "d-none"}>
                <TreeLine 
                  data={item.subcategories} 
                  level={level + 1} 
                  active={active} 
                  setActive={setActive} 
                  mutate={mutate} 
                  type={type} 
                  loading={loading}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default TreeLine;
