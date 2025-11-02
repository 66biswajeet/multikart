"use client";
import AllCurrency from "@/components/currency/AllCurrency";
import { currency } from "@/utils/axiosUtils/API";
import { useState } from "react";
import { Col } from "reactstrap";

const Currency = () => {
  const [isCheck, setIsCheck] = useState([]);
  return (
    <Col sm="12">
      <AllCurrency url={currency} moduleName="Currency" isCheck={isCheck} setIsCheck={setIsCheck} />
    </Col>
  );
};

export default Currency;
