import Image from "next/image";
import { dateFormat } from "../../utils/customFunctions/DateFormat";
import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";

const AllCategoriesTable = ({ data, ...props }) => {
  // For admin users, we allow all actions
  const [edit, destroy] = [true, true]; // usePermissionCheck(["edit", "destroy"]);
  
  const headerObj = {
    checkBox: true,
    isSerialNo: false,
    isOption: true, // Always show action buttons for admin
    noEdit: false, // Allow edit
    noDelete: false, // Allow delete
    optionHead: { title: "Action" },
    column: [
      { title: "Image", apiKey: "category_image", type: 'image' },
      { title: "Icon", apiKey: "category_icon", type: 'image' },
      { title: "Name", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "Parent", apiKey: "parent", subKey: ["name"] },
      { title: "Subcategories", apiKey: "subcategories_count" },
      { title: "Created At", apiKey: "created_at", sorting: true, sortBy: "desc", type: "date" },
      { title: "Status", apiKey: "status", type: "switch" }
    ],
    data: data?.map(item => ({
      ...item,
      id: item._id || item.id,
      subcategories_count: item.subcategories?.length || 0,
      parent: item.parent || { name: "None" }
    })) || []
  };
  
  if (!data) return null;
  return <ShowTable {...props} headerData={headerObj} editPermission={edit} destroyPermission={destroy} />;
};

export default TableWrapper(AllCategoriesTable);
