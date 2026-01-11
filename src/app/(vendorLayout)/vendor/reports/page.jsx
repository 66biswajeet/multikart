"use client";
import React from "react";
import { Col, Row, Card, CardBody, CardHeader } from "reactstrap";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import Loader from "@/components/commonComponent/Loader";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import request from "@/utils/axiosUtils";

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const VendorReports = () => {
  const { t } = useTranslation("common");

  const { data: reportData, isLoading } = useCustomQuery(
    ["vendorReports"],
    () => request({ url: "/vendor/reports" })
  );

  if (isLoading) return <Loader />;

  const chartOptions = {
    chart: { id: "sales-report-chart", toolbar: { show: false } },
    xaxis: {
      categories: reportData?.data?.months || [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
      ],
    },
    colors: ["#0da487"],
    stroke: { curve: "smooth" },
  };

  const chartSeries = [
    { name: t("Revenue"), data: reportData?.data?.revenue || [0, 0, 0, 0, 0] },
  ];

  return (
    <div className="container-fluid">
      <Row>
        {/* Sales Summary Cards */}
        <Col xl="4" md="6">
          <Card className="report-card">
            <CardBody>
              <h6>{t("Total Revenue")}</h6>
              <h3>${reportData?.data?.totalRevenue || "0.00"}</h3>
              <p className="text-success">+12% {t("from last month")}</p>
            </CardBody>
          </Card>
        </Col>
        <Col xl="4" md="6">
          <Card className="report-card">
            <CardBody>
              <h6>{t("Total Orders")}</h6>
              <h3>{reportData?.data?.totalOrders || 0}</h3>
              <p className="text-primary">{t("Completed Orders")}</p>
            </CardBody>
          </Card>
        </Col>
        <Col xl="4" md="6">
          <Card className="report-card">
            <CardBody>
              <h6>{t("Average Order Value")}</h6>
              <h3>${reportData?.data?.avgValue || "0.00"}</h3>
            </CardBody>
          </Card>
        </Col>

        {/* Sales Chart */}
        <Col xl="12">
          <Card>
            <CardHeader>
              <h5>{t("Revenue Trend")}</h5>
            </CardHeader>
            <CardBody>
              <Chart
                options={chartOptions}
                series={chartSeries}
                type="area"
                height={350}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default VendorReports;
