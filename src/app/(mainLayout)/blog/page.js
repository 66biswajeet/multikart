'use client'
import AllBlogsTable from "@/components/blog/AllBlogsTable";
import { blog } from "@/utils/axiosUtils/API";
import { useState } from "react";
import { Col } from "reactstrap";

const AllBlogs = () => {
  const [isCheck, setIsCheck] = useState([]);
  return (
    <Col sm="12">
      <AllBlogsTable url={blog} moduleName="Blog" isCheck={isCheck} setIsCheck={setIsCheck} />
    </Col>
  );
};

export default AllBlogs;
