"use client";
import React, { useState } from "react";
import {
  Col,
  Card,
  CardBody,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { useTranslation } from "react-i18next";
import { RiUploadCloud2Line } from "react-icons/ri";

import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Loader from "@/components/commonComponent/Loader";
import request from "@/utils/axiosUtils";
import { toast } from "react-toastify";
import Btn from "@/elements/buttons/Btn";

const payoutRequestApi = "/vendor/payout/request";

const PayoutRequestTable = ({
  data,
  refetch,
  isCheck,
  setIsCheck,
  ...props
}) => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [uploading, setUploading] = useState(false);

  const headerObj = {
    checkBox: true,
    isSerialNo: false,
    isOption: true,
    noEdit: true,
    optionHead: { title: "Action", type: "edit" },
    column: [
      { title: "Order ID", apiKey: "order_id", sorting: true },
      { title: "Date", apiKey: "date", type: "date" },
      { title: "Amount", apiKey: "amount", type: "price" },
      { title: "Customer", apiKey: "customer" },
      { title: "Payment", apiKey: "payment_method" },
    ],
    data: data?.data?.data || [],
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 1. Replace this with your actual file upload logic (S3, Cloudinary, etc.)
      // For now, we simulate a successful upload returning a URL
      const dummyUrl = `/invoices/${selectedOrder.id}_invoice.pdf`;

      // 2. Update the Order in DB
      const res = await request({
        url: payoutRequestApi,
        method: "put",
        data: { order_id: selectedOrder.id, invoice_url: dummyUrl },
      });

      if (res.status === 200) {
        toast.success(t("Invoice Uploaded Successfully"));
        refetch();
        setModal(false);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (!data) return <Loader />;

  return (
    <>
      <div className="title-header option-title mb-4">
        <h5>{t("Request Payout")}</h5>
        <p className="text-muted">
          {t("Upload invoices for completed orders to proceed.")}
        </p>
      </div>

      <ShowTable
        {...props}
        headerData={headerObj}
        url={payoutRequestApi}
        moduleName="payoutRequest"
        isCheck={isCheck}
        setIsCheck={setIsCheck}
        customActions={(element) => (
          <Btn
            className="btn-sm btn-outline-primary d-flex align-items-center gap-1"
            onClick={() => {
              setSelectedOrder(element);
              setModal(true);
            }}
          >
            <RiUploadCloud2Line /> {t("Invoice")}
          </Btn>
        )}
      />

      <Modal isOpen={modal} toggle={() => setModal(false)} centered>
        <ModalHeader toggle={() => setModal(false)}>
          {t("Upload Order Invoice")}
        </ModalHeader>
        <ModalBody>
          <div className="text-center p-3">
            <h6>
              {t("Order")}: #{selectedOrder?.order_id}
            </h6>
            <p className="small text-muted">
              {t("Please upload a PDF or Image of the official invoice.")}
            </p>

            <FormGroup className="mt-4">
              <div
                className="upload-container border-dashed p-4 rounded text-center"
                style={{ border: "2px dashed #ddd" }}
              >
                <Input
                  type="file"
                  id="invoiceFile"
                  hidden
                  onChange={handleFileUpload}
                  accept=".pdf,image/*"
                />
                <Label for="invoiceFile" style={{ cursor: "pointer" }}>
                  <RiUploadCloud2Line size={40} className="text-primary mb-2" />
                  <div className="fw-bold">
                    {uploading ? t("Uploading...") : t("Click to Browse File")}
                  </div>
                </Label>
              </div>
            </FormGroup>
          </div>
        </ModalBody>
      </Modal>
    </>
  );
};

const PayoutRequestWrapped = TableWrapper(PayoutRequestTable);

const RequestPayoutPage = () => {
  const [isCheck, setIsCheck] = useState([]);
  return (
    <Col sm="12">
      <Card>
        <CardBody>
          <PayoutRequestWrapped
            url={payoutRequestApi}
            moduleName="payoutRequest"
            onlyTitle={true}
            isCheck={isCheck}
            setIsCheck={setIsCheck}
          />
        </CardBody>
      </Card>
    </Col>
  );
};

export default RequestPayoutPage;
