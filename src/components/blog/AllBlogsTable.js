import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";

const AllBlogsTable = ({ data, ...props }) => {
  const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);
  const headerObj = {
    checkBox: true,
    isSerialNo:false,
    isOption: edit == false && destroy == false ? false : true,
    noEdit: edit ? false : true,
    optionHead: { title: "Action",show:"blog" },
    column: [
      { title: "Image", apiKey: "blog_thumbnail", sorting: true, sortBy: "desc",type:"image" },
      { title: "Title", apiKey: "title", sorting: true, sortBy: "desc" },
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

export default TableWrapper(AllBlogsTable);
