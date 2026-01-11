import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { Formik, Form, Field } from "formik";
import { RiDeleteBinLine, RiEdit2Line } from "react-icons/ri";
import useCreate from "@/utils/hooks/useCreate";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import request from "@/utils/axiosUtils";
import Btn from "@/elements/buttons/Btn";

const DiscountTab = () => {
  const { t } = useTranslation("common");
  const [modal, setModal] = useState(false);
  const apiRoute = "/api/vendor/discount";

  // 1. Fetch existing rules
  const { data, refetch, isLoading } = useCustomQuery(["vendorDiscounts"], () =>
    request({ url: apiRoute })
  );

  // 2. Create Mutation
  const { mutate: createRule, isLoading: isSaving } = useCreate(
    apiRoute,
    false,
    false,
    false,
    () => {
      refetch();
      setModal(false);
    }
  );

  const toggle = () => setModal(!modal);

  return (
    <div className="discount-tab">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5>{t("Discounts")}</h5>
        <Button color="theme" onClick={toggle}>
          + {t("Add Rule")}
        </Button>
      </div>

      <Table responsive className="theme-table">
        <thead>
          <tr>
            <th>{t("Rule Name")}</th>
            <th>{t("Application Type")}</th>
            <th>{t("Start Date")}</th>
            <th>{t("End Date")}</th>
            <th>{t("Value")}</th>
            <th>{t("Active")}</th>
            <th>{t("Actions")}</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((rule) => (
            <tr key={rule._id}>
              <td>{rule.rule_name}</td>
              <td>{rule.application_type}</td>
              <td>{new Date(rule.start_date).toLocaleDateString()}</td>
              <td>{new Date(rule.end_date).toLocaleDateString()}</td>
              <td>
                {rule.value}
                {rule.discount_type === "Percentage" ? "%" : " Amt"}
              </td>
              <td>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={rule.status}
                    readOnly
                  />
                </div>
              </td>
              <td>
                <RiEdit2Line
                  className="me-2 text-info"
                  style={{ cursor: "pointer" }}
                />
                <RiDeleteBinLine
                  className="text-danger"
                  style={{ cursor: "pointer" }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Step 2: The Add Rule Modal per Wireframe Page 18 */}
      <Modal isOpen={modal} toggle={toggle} centered>
        <ModalHeader toggle={toggle}>{t("Add Discount Rule")}</ModalHeader>
        <ModalBody>
          <Formik
            initialValues={{
              rule_name: "",
              application_type: "All",
              discount_type: "Percentage",
              value: "",
              start_date: "",
              end_date: "",
              status: true,
            }}
            onSubmit={(values) => createRule(values)}
          >
            {({ values, setFieldValue }) => (
              <Form className="theme-form">
                <FormGroup>
                  <Label>{t("Rule Name")}</Label>
                  <Field
                    name="rule_name"
                    className="form-control"
                    placeholder="e.g. New Year Sale"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>{t("Application Type")}</Label>
                  <div className="d-flex gap-3">
                    {["All", "Category", "Product"].map((type) => (
                      <Label key={type} check>
                        <Field
                          type="radio"
                          name="application_type"
                          value={type}
                          className="me-1"
                        />{" "}
                        {type}
                      </Label>
                    ))}
                  </div>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Discount Type")}</Label>
                  <Field
                    as="select"
                    name="discount_type"
                    className="form-control"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Amount">Fixed Amount</option>
                  </Field>
                </FormGroup>

                <FormGroup>
                  <Label>{t("Value")}</Label>
                  <Field
                    name="value"
                    type="number"
                    className="form-control"
                    placeholder="10"
                    required
                  />
                </FormGroup>

                <div className="row">
                  <div className="col-6">
                    <FormGroup>
                      <Label>{t("Start Date")}</Label>
                      <Field
                        name="start_date"
                        type="datetime-local"
                        className="form-control"
                        required
                      />
                    </FormGroup>
                  </div>
                  <div className="col-6">
                    <FormGroup>
                      <Label>{t("End Date")}</Label>
                      <Field
                        name="end_date"
                        type="datetime-local"
                        className="form-control"
                        required
                      />
                    </FormGroup>
                  </div>
                </div>

                <div className="text-end mt-4">
                  <Button color="secondary" onClick={toggle} className="me-2">
                    {t("Cancel")}
                  </Button>
                  <Btn
                    type="submit"
                    title="Save"
                    loading={Number(isSaving)}
                    className="btn-theme"
                  />
                </div>
              </Form>
            )}
          </Formik>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default DiscountTab;
