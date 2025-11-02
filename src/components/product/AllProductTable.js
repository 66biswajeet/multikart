import { useContext,useEffect } from "react";
import { Approved, product } from "../../utils/axiosUtils/API";
import TableWrapper from "../../utils/hoc/TableWrapper";
import ShowTable from "../table/ShowTable";
import Loader from "../commonComponent/Loader";
import usePermissionCheck from "../../utils/hooks/usePermissionCheck";
import AccountContext from "../../helper/accountContext";
import { useTranslation } from "react-i18next";
import { placeHolderImage } from "@/data/CommonPath";

const AllProductTable = ({ data, ...props }) => {
  
  const { t } = useTranslation( 'common');
  const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);
  console.log('Permission Check - Edit:', edit, 'Destroy:', destroy);
  const { role, setRole } = useContext(AccountContext) 
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) {
      const parsedRole = JSON.parse(storedRole);
      setRole(parsedRole.name);
    }
  }, [])
  const headerObj = {
    checkBox: false,
    isOption: edit == false && destroy == false ? false : true,
    noEdit: edit ? false : true,
    isSerialNo:true,
    optionHead: { title: "Action",show:"product",  type: 'download',modalTitle: t("Download") },
    column: [
      { title: "Image", apiKey: "product_thumbnail", type: 'image', placeHolderImage: placeHolderImage },
      { title: "Name", apiKey: "name", sorting: true, sortBy: "desc" },
      { title: "SKU", apiKey: "sku", sorting: true, sortBy: "desc" },
      { title: "Price", apiKey: "sale_price", sorting: true, sortBy: "desc", type: 'price' },
      { title: "Stock", apiKey: "stock_status", type: 'stock_status' },
      { title: "Store", apiKey: "store", subKey: ["store_name"] },
      { title: "Approve", apiKey: "is_approved", type: 'switch', url: `${product}${Approved}` },
      { title: "Status", apiKey: "status", type: 'switch' }
    ],
    data: data?.map(item => ({
      ...item,
      id: item.id || item._id
    })) || []
  };
  headerObj.data.map((element) => element.sale_price = element?.sale_price)

  let pro = headerObj?.column?.filter((elem) => {
    return role == 'vendor' ? elem.title !== 'Approved' : elem;
  });
  headerObj.column = headerObj ? pro : [];
  if (!data) return <Loader />;
  return <>
    <ShowTable {...props} headerData={headerObj} editPermission={edit} destroyPermission={destroy} />
  </>
};

export default TableWrapper(AllProductTable);
