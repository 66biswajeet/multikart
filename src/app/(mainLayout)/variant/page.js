"use client";
import React, { useState } from "react";
import { Col } from "reactstrap";
import { VariantAPI } from "@/utils/axiosUtils/API";
import AllVariantsTable from "@/components/variant/AllVariantsTable"; // Correct import

const VariantList = () => {
  const [isCheck, setIsCheck] = useState([]);

  return (
    <Col sm="12">
      <AllVariantsTable
        url={VariantAPI} // Pass the API URL
        moduleName="Variant"
        isCheck={isCheck}
        setIsCheck={setIsCheck}
        type={"product"}
        // Add any other props your TableWrapper expects, like import/export
        // exportButton={true}
        // importExport={{ ... }}
      />
    </Col>
  );
};

export default VariantList;
