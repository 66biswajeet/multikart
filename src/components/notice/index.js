import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import Loader from "../commonComponent/Loader";
import usePermissionCheck from "@/utils/hooks/usePermissionCheck";

const AllNoticeTable = ({ data, ...props }) => {
  const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);
  const headerObj = {
    isOption: edit == false && destroy == false ? false : true,
    isSerialNo: false,
    noEdit: edit ? false : true,
    optionHead: { title: "Action" },
    column: [
      { title: "Tittle", apiKey: "title", sorting: true, sortBy: "desc" },
      { title: "Priority", apiKey: "priority" },
      {title: "CreateAt",apiKey: "created_at",sorting: true,sortBy: "desc",type: "date",},
    ],
    data: data || [],
  };

  let refunds = headerObj?.data?.filter((element) => {
    element.priority = element.priority ? (<div className={"status-" + element.priority}><span>{element.priority}</span></div>) : ("-");
    return element;
  });
  headerObj.data = headerObj ? refunds : [];
  if (!data) return <Loader />;
  return (
    <>
      <ShowTable {...props} headerData={headerObj} />
    </>
  );
};

export default TableWrapper(AllNoticeTable);
