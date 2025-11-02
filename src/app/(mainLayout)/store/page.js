'use client'
import { useState } from "react";
import { Col } from "reactstrap";
import AllStoresTable from "@/components/store/AllStoresTable";
import { store } from "@/utils/axiosUtils/API";

const AllStores = () => {
  const [isCheck, setIsCheck] = useState([]);
  return (
    <Col sm="12">
      <AllStoresTable url={store} moduleName="Store" isCheck={isCheck} setIsCheck={setIsCheck} />
    </Col>
  );
};

export default AllStores;
