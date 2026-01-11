"use client";
import React, { useState } from "react";
import { Col, Card, CardBody, Row, Container } from "reactstrap";
import { VendorOrderAPI } from "@/utils/axiosUtils/API";
import OrderTable from "@/components/vendor/orders/OrderTable";
import { useTranslation } from "react-i18next";

const VendorOrders = () => {
  const [isCheck, setIsCheck] = useState([]);
  const { t } = useTranslation("common");

  return (
    <Container fluid>
      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <div className="title-header option-title mb-3">
                <h5>{t("Orders")}</h5>
              </div>
              <OrderTable
                url={VendorOrderAPI}
                moduleName="orders"
                type="orders"
                isCheck={isCheck}
                setIsCheck={setIsCheck}
                onlyTitle={true}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default VendorOrders;
