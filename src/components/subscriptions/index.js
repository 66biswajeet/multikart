import TableWrapper from '../../utils/hoc/TableWrapper'
import ShowTable from '../table/ShowTable';

const AllSubscriptionTable = ({ data, ...props }) => {
    const headerObj = {
        isSerialNo:false,
        column: [
            { title: "Email", apiKey: "email", sorting: true, sortBy: "desc", },
            { title: "CreateAt", apiKey: "created_at", sorting: true, sortBy: "desc", type: "date" },
        ],
        data: data || []
    };
    return <>
        <ShowTable {...props} headerData={headerObj} />
    </>
}

export default TableWrapper(AllSubscriptionTable)