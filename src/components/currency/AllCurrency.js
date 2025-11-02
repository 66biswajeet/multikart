import TableWrapper from '../../utils/hoc/TableWrapper';
import ShowTable from '../table/ShowTable';
import usePermissionCheck from '../../utils/hooks/usePermissionCheck';

const AllCurrency = ({ data, ...props }) => {
    const [edit, destroy] = usePermissionCheck(["edit", "destroy"]);
    const headerObj = {
        checkBox: true,
        isOption: edit == false && destroy == false ? false : true,
        noEdit: edit ? false : true,
        isSerialNo:false,
        optionHead: { title: "Action" },
        column: [
            { title: "Code", apiKey: "code", sorting: true, sortBy: "desc" },
            { title: "Symbol", apiKey: "symbol", sorting: true, sortBy: "desc" },
            { title: "ExchangeRate", apiKey: "exchange_rate", sorting: true, sortBy: "desc" },
            { title: "CreateAt", apiKey: "created_at", sorting: true, sortBy: "desc", type: "date" },
            { title: "Status", apiKey: "status", type: "switch" }
        ],
        data: data || []
    };
    if (!data) return null;
    return <>
        <ShowTable {...props} headerData={headerObj} />
    </>
}

export default TableWrapper(AllCurrency)