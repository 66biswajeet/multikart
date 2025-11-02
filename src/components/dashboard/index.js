import request from "@/utils/axiosUtils";
import { NoticeRecent } from "@/utils/axiosUtils/API";
import NoticeDashBoard from "./NoticeDashBoard";
import ProductStockReportTable from "./productStockReport/ProductStockReportTable";
import RecentOrderTable from "./recentOrders/RecentOrderTable";
import RevenueAndTopVendor from "./Revenue&TopVendor";
import TopDashSection from "./TopDashSection";
import { useRouter } from "next/navigation";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { isAdmin, getAuthUser } from "@/utils/auth";
import { useEffect, useState } from "react";

const MainDashboard = () => {
  const router = useRouter();
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setUserIsAdmin(isAdmin());
    setCurrentUser(getAuthUser());
  }, []);

  const { data, refetch } = useCustomQuery([NoticeRecent],() =>  !userIsAdmin ?  request({ url: NoticeRecent },router) :Promise.resolve() ,{
      refetchOnWindowFocus: false,
      enabled: true,
      select: (data) => data?.data,
    }
  );
  return (
    <>
      {/* Welcome message for admin */}
      {/* {userIsAdmin && (
        <div className="alert alert-success mb-4">
          <h5 className="alert-heading">Welcome, Administrator!</h5>
          <p>You have admin privileges to manage the entire system including users, products, and settings.</p>
          <hr />
          <p className="mb-0">
            <strong>Admin Features:</strong> User Management, System Settings, Advanced Reports
          </p>
        </div>
      )} */}
      
      {data?.is_read === 0 && <NoticeDashBoard data={data} refetch={refetch} />}
      <TopDashSection   />
      <section>
        <RevenueAndTopVendor  />
        <RecentOrderTable />
        <ProductStockReportTable  />
      </section>
    </>
  );
};

export default MainDashboard;
