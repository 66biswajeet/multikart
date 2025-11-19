import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";
import Loader from "../commonComponent/Loader"; // Import Loader
import { useTranslation } from "react-i18next"; // Import useTranslation

const AllVariantsTable = ({ data, ...props }) => {
  const { t } = useTranslation("common"); // Initialize t
  const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);
  console.log("Permissions in variants - Edit:", edit, "Destroy:", destroy);
  console.log("Variants Data:", data);

  const headerObj = {
    checkBox: false,
    isSerialNo: true,
    isOption: edit == false && destroy == false ? false : true,
    noEdit: edit ? false : true,
    optionHead: { title: "Action" },
    column: [
      {
        title: "Name",
        apiKey: "variant_name",
        sorting: true,
        sortBy: "desc",
      },
      { title: "Input Type", apiKey: "input_type", sorting: false },
      {
        title: "Options",
        apiKey: "options", // This will now point to a number
        type: "custom",
        render: (record) => (
          // This will render "1 options" or "3 options"
          <span>
            {record.options} {t("options")}
          </span>
        ),
      },
      {
        title: "CreateAt",
        apiKey: "created_at",
        sorting: true,
        sortBy: "desc",
        type: "date",
      },
      { title: "Status", apiKey: "status", type: "switch" }, // Changed apiKey to 'active'
    ],
    // --- THIS IS THE FIX ---
    // We now overwrite the 'options' array with its length
    data:
      data?.data?.map((item) => ({
        ...item,
        id: item.id || item._id, // Ensure 'id' is present
        options: item.options ? item.options.length : 0, // Overwrite 'options' with count
      })) || [],
  };

  if (!data) return <Loader />;

  return (
    <>
      <ShowTable
        {...props}
        headerData={headerObj}
        editPermission={edit}
        destroyPermission={destroy}
      />
    </>
  );
};

export default TableWrapper(AllVariantsTable);
