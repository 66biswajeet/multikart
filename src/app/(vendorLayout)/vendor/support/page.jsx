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
} from "reactstrap";
import { Formik, Form, Field } from "formik";
import { useTranslation } from "react-i18next";
import { FiPlus } from "react-icons/fi";
import TableWrapper from "@/utils/hoc/TableWrapper";
import ShowTable from "@/components/table/ShowTable";
import Btn from "@/elements/buttons/Btn";
import request from "@/utils/axiosUtils";
import { toast } from "react-toastify";

const supportApi = "/vendor/support/tickets";

const SupportTable = ({ data, refetch, ...props }) => {
  const { t } = useTranslation("common");
  const headerObj = {
    checkBox: false,
    isOption: true,
    optionHead: { title: "Action", type: "view" },
    column: [
      { title: "Ticket ID", apiKey: "ticket_id" },
      { title: "Subject", apiKey: "subject" },
      { title: "Category", apiKey: "category" },
      { title: "Status", apiKey: "status", type: "badge" },
      { title: "Date", apiKey: "createdAt", type: "date" },
    ],
    data: (data?.data?.data || []).map((item) => ({
      ...item,
      status: {
        name: item.status,
        color: item.status === "Open" ? "primary" : "success",
      },
    })),
  };

  return <ShowTable {...props} headerData={headerObj} url={supportApi} />;
};

const SupportTableWrapped = TableWrapper(SupportTable);

const VendorSupport = () => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const res = await request({
        url: supportApi,
        method: "post",
        data: values,
      });
      if (res.status === 200 || res.status === 201) {
        toast.success(t("Ticket raised successfully"));
        setModal(false);
        resetForm();
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Col sm="12">
      <Card>
        <CardBody>
          <div className="title-header option-title mb-4">
            <h5>{t("Support Tickets")}</h5>
            <Btn
              className="btn-theme add-button"
              onClick={() => setModal(true)}
            >
              <FiPlus /> {t("New Ticket")}
            </Btn>
          </div>

          <SupportTableWrapped
            url={supportApi}
            moduleName="support"
            onlyTitle={true}
          />

          <Modal isOpen={modal} toggle={() => setModal(false)} centered>
            <ModalHeader toggle={() => setModal(false)}>
              {t("Raise New Ticket")}
            </ModalHeader>
            <ModalBody>
              <Formik
                initialValues={{ subject: "", category: "Payout", message: "" }}
                onSubmit={handleSubmit}
              >
                <Form className="theme-form">
                  <FormGroup>
                    <Label>{t("Subject")}</Label>
                    <Field name="subject" className="form-control" required />
                  </FormGroup>
                  <FormGroup>
                    <Label>{t("Category")}</Label>
                    <Field as="select" name="category" className="form-control">
                      <option value="Payout">{t("Payout Issue")}</option>
                      <option value="Technical">{t("Technical Error")}</option>
                      <option value="Account">{t("Account Issue")}</option>
                    </Field>
                  </FormGroup>
                  <FormGroup>
                    <Label>{t("Message")}</Label>
                    <Field
                      as="textarea"
                      name="message"
                      className="form-control"
                      rows="4"
                      required
                    />
                  </FormGroup>
                  <div className="text-end">
                    <Btn
                      type="submit"
                      title={t("Submit")}
                      className="btn-primary"
                    />
                  </div>
                </Form>
              </Formik>
            </ModalBody>
          </Modal>
        </CardBody>
      </Card>
    </Col>
  );
};

export default VendorSupport;
