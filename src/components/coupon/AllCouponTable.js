import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";

const AllCouponTable = ({ data, ...props }) => {
  const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);
  const headerObj = {
    checkBox: true,
    isOption: edit == false && destroy == false ? false : true,
    noEdit: edit ? false : true,
    isSerialNo:false,
    optionHead: { title: "Action" },
    column: [
      { title: "Title", apiKey: "title", sorting: true, sortBy: "desc" },
      { title: "Code", apiKey: "code", sorting: true, sortBy: "desc" },
      { title: "CreateAt", apiKey: "created_at", sorting: true, sortBy: "desc", type: "date" },
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

export default TableWrapper(AllCouponTable);