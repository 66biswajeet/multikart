"use client";
import React from "react";
import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Loader from "@/components/commonComponent/Loader";
import { VendorOrderAPI } from "@/utils/axiosUtils/API";

const OrderTable = ({ data, ...props }) => {
  const headerObj = {
    checkBox: false,
    isSerialNo: true,
    isOption: true,
    noEdit: false,
    // Setting manual URL here to ensure the edit icon goes to /vendor/orders/details/[id]
    optionHead: {
      title: "Action",
      type: "view",
      url: "/vendor/orders",
    },
    column: [
      { title: "Order ID", apiKey: "order_number" },
      { title: "Date", apiKey: "created_at", type: "date" },
      { title: "Customer", apiKey: "consumer", subKey: "name" },
      { title: "Amount", apiKey: "total", type: "price" },
      { title: "Payment", apiKey: "payment_status", type: "badge" },
      { title: "Order Status", apiKey: "order_status", type: "badge" },
    ],
    data: data?.data || [],
  };

  if (!data) return <Loader />;

  return (
    <ShowTable
      {...props}
      headerData={headerObj}
      // Orders usually use 'View' instead of 'Edit'
      editPermission={true}
      url={VendorOrderAPI}
      moduleName="orders"
      type="orders"
    />
  );
};

export default TableWrapper(OrderTable);
