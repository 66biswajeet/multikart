"use client";
import Loader from "@/components/commonComponent/Loader";
import AdminProtectedRoute from "@/components/common/AdminProtectedRoute";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Col, Row } from "reactstrap";

const RoleEdit = () => {
  const params = useParams();
  const { t } = useTranslation("common");
  const PermissionForm = dynamic(() => import("@/components/role/PermissionForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  
  return (
    <AdminProtectedRoute>
      {params?.updateId && (
        <Row>
          <Col xxl="8" lg="10" className="m-auto">
            <Card>
              <CardBody>
                <div className="title-header option-title">
                  <h5>{t("EditRole")}</h5>
                </div>
                <PermissionForm updateId={params?.updateId} buttonName="Update Role" />
              </CardBody>
            </Card>
          </Col>
        </Row>
      )}
    </AdminProtectedRoute>
  );
};

export default RoleEdit;
