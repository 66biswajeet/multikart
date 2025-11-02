"use client";
import Loader from "@/components/commonComponent/Loader";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import { Card, CardBody, Col, Row } from "reactstrap";

const TaxUpdate = () => {
  const TaxForm = dynamic(() => import("@/components/tax/TaxForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  const params = useParams();
  const { t } = useTranslation("common");
  return (
    params?.updateId && (
      <Row>
        <Col sm="8" className="m-auto">
          <Card>
            <CardBody>
              <div className="card-header-2">
                <h5>{t("EditTax")}</h5>
              </div>
              <TaxForm updateId={params?.updateId} buttonName="Update" />
            </CardBody>
          </Card>
        </Col>
      </Row>
    )
  );
};

export default TaxUpdate;
