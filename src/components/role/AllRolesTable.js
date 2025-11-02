import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "@/utils/hooks/usePermissionCheck";

const AllRoles = ({ data, ...props }) => {
  // For admin users, we allow all actions
  const [edit, destroy] = [true, true]; // usePermissionCheck(["edit", "destroy"]);
  
  // Process data to add permission count and id mapping
  const processedData = data?.map(role => ({
    ...role,
    id: role.id || role._id,
    permissions_count: Array.isArray(role.permissions) ? role.permissions.length : 0
  })) || [];
  
  const headerObj = {
    checkBox: false,
    isSerialNo: true,
    isOption: true, // Always show action buttons for admin
    noEdit: false, // Allow edit
    noDelete: false, // Allow delete (but will be protected by system_reserve check)
    optionHead: { title: "Action" },
    column: [
      { title: "Name", apiKey: "display_name", sorting: true, sortBy: "desc" },
      { title: "Role Key", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "Description", apiKey: "description" },
      { title: "Permissions", apiKey: "permissions_count" },
      { title: "Status", apiKey: "status", type: "switch" },
      { title: "Created At", apiKey: "createdAt", sorting: true, sortBy: "desc", type: "date" }
    ],
    data: processedData
  };
  if (!data) return null;
  return <>
    <ShowTable {...props} headerData={headerObj} editPermission={edit} destroyPermission={destroy} />
  </>
};

export default TableWrapper(AllRoles);
