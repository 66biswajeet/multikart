"use client";
import React, { useState } from "react";
import { Col } from "reactstrap";
import { Notice } from "@/utils/axiosUtils/API";
import AllNoticeTable from "@/components/notice";

const NoticeRead = () => {
  const [isCheck, setIsCheck] = useState([]);

  return (
    <>
      <Col sm='12'>
        <AllNoticeTable url={Notice} moduleName='Notice' isCheck={isCheck} setIsCheck={setIsCheck} />
      </Col>
    </>
  );
};

export default NoticeRead;
