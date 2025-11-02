import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";

const AllTagsTable = ({ data, ...props }) => {
  const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);

  console.log("Permissions - Edit:", edit, "Destroy:", destroy);
  console.log("Tags Data:", data);

  const headerObj = {
    checkBox: false,
    isOption: edit == false && destroy == false ? false : true,
    noEdit: edit ? false : true,
    isSerialNo:true,
    optionHead: { title: "Action" },
    column: [
      { title: "Name", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "CreateAt", apiKey: "created_at", sorting: true, sortBy: "desc", type: "date" },
      { title: "Status", apiKey: "status", type: "switch" }
    ],
    data: data?.data?.map(item => ({
      ...item,
      id: item.id || item._id
    })) || []
  };
  if (!data) return <Loader />;
  return <>
    <ShowTable {...props} headerData={headerObj} editPermission={edit} destroyPermission={destroy} />
  </>
};

export default TableWrapper(AllTagsTable);
