"use client";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Col } from "reactstrap";
import { role } from "@/utils/axiosUtils/API";
import AdminProtectedRoute from "@/components/common/AdminProtectedRoute";

const AllRolesTable = dynamic(() => import("@/components/role/AllRolesTable"),{  suspense: true,});

const AllRoles = () => {
  const [isCheck, setIsCheck] = useState([]);
  return (
    <AdminProtectedRoute>
      <Col sm="12">
        <AllRolesTable
          url={role}
          moduleName="Role"
          isCheck={isCheck}
          setIsCheck={setIsCheck}
        />
      </Col>
    </AdminProtectedRoute>
  );
};

export default AllRoles;
