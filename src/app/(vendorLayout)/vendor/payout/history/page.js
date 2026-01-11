"use client";
import React, { useState } from "react";
import { Col, Card, CardBody, Input } from "reactstrap";
import { useTranslation } from "react-i18next";
import { RiFileDownloadLine, RiExternalLinkLine } from "react-icons/ri";

import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Loader from "@/components/commonComponent/Loader";
import Btn from "@/elements/buttons/Btn";

const payoutHistoryApi = "/vendor/payout/history";

const PayoutHistoryTable = ({ data, isCheck, setIsCheck, ...props }) => {
  const { t } = useTranslation("common");

  const headerObj = {
    checkBox: true,
    isSerialNo: false,
    isOption: true,
    noEdit: true,
    optionHead: { title: "Invoice", type: "view" },
    column: [
      { title: "Order ID", apiKey: "order_id", sorting: true },
      { title: "Date", apiKey: "date", type: "date" },
      { title: "Amount", apiKey: "amount", type: "price" },
      { title: "Payout Status", apiKey: "payout_status", type: "badge" },
    ],
    data: (data?.data?.data || []).map((item) => ({
      ...item,
      // Map status to badge colors
      payout_status: {
        name: item.payout_status,
        color: item.payout_status === "Completed" ? "success" : "warning",
      },
    })),
  };

  if (!data) return <Loader />;

  return (
    <ShowTable
      {...props}
      headerData={headerObj}
      url={payoutHistoryApi}
      moduleName="payoutHistory"
      isCheck={isCheck}
      setIsCheck={setIsCheck}
      customActions={(element) => (
        <a
          href={element.invoice_url}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-sm btn-light"
        >
          <RiFileDownloadLine className="me-1" /> {t("View")}
        </a>
      )}
    />
  );
};

const PayoutHistoryWrapped = TableWrapper(PayoutHistoryTable);

const PayoutHistoryPage = () => {
  const { t } = useTranslation("common");
  const [isCheck, setIsCheck] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");

  return (
    <Col sm="12">
      <Card>
        <CardBody>
          <div className="title-header option-title mb-4">
            <h5>{t("Payout History")}</h5>
            <div className="d-flex gap-2">
              <Input
                type="select"
                className="form-control w-auto"
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t("All Payouts")}</option>
                <option value="Pending">{t("Pending")}</option>
                <option value="Completed">{t("Completed")}</option>
              </Input>
            </div>
          </div>

          <PayoutHistoryWrapped
            url={payoutHistoryApi}
            params={{ payout_status: filterStatus }}
            moduleName="payoutHistory"
            onlyTitle={true}
            isCheck={isCheck}
            setIsCheck={setIsCheck}
          />
        </CardBody>
      </Card>
    </Col>
  );
};

export default PayoutHistoryPage;
