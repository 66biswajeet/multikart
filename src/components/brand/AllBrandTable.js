import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";

const AllBrand = ({ data, ...props }) => {
  // For admin users, we allow all actions
  const [edit, destroy] = [true, true]; // usePermissionCheck(["edit", "destroy"]);
  const headerObj = {
    checkBox: false,
    isSerialNo: true,
    isOption: true, // Always show action buttons for admin
    noEdit: false, // Allow edit
    noDelete: false, // Allow delete
    optionHead: { title: "Action" },
    column: [
      { title: "Name", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "Created At", apiKey: "created_at", sorting: true, sortBy: "desc", type: "date" },
      { title: "Status", apiKey: "status", type: "switch" }
    ],
    data: data?.map(item => ({
      ...item,
      id: item.id || item._id
    })) || []
  };
  if (!data) return null;
  return <>
    <ShowTable {...props} headerData={headerObj} editPermission={edit} destroyPermission={destroy} />
  </>
};

export default TableWrapper(AllBrand);
