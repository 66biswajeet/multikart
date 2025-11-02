import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import Loader from "../commonComponent/Loader";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";

const AllUsersTable = ({ data, ...props }) => {
  // For admin users, we allow all actions
  const [edit, destroy] = [true, true]; // usePermissionCheck(["edit", "destroy"]);
  
  // Process data to handle admin status display and id mapping
  const processedData = data?.map(user => ({
    ...user,
    id: user.id || user._id,
    admin_status: user.isAdmin ? "Yes" : "No"
  })) || [];
  
  const headerObj = {
    checkBox: false,
    isOption: true, // Always show action buttons for admin
    noEdit: false, // Allow edit
    noDelete: false, // Allow delete
    isSerialNo: true,
    optionHead: { title: "Action" },
    column: [
      // { title: "Avatar", apiKey: "profile_image", type: 'image', class: "sm-width", NameWithRound:true},
      { title: "Name", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "Email", apiKey: "email", sorting: true, sortBy: "desc" },
      { title: "Phone", apiKey: "phone", sorting: false },
      { title: "Role", apiKey: "role", subKey: ["name"] },
      { title: "Admin", apiKey: "admin_status" },
      { title: "Created At", apiKey: "createdAt", sorting: true, sortBy: "desc", type: "date" },
      { title: "Status", apiKey: "status", type: 'switch' }
    ],
    data: processedData
  };
  if (!data) return <Loader />;
  return <>
    <ShowTable {...props} headerData={headerObj} editPermission={edit} destroyPermission={destroy} />
  </>
};

export default TableWrapper(AllUsersTable);
