"use client";
import SelectUser from "@/components/wallet/SelectUser";
import SelectWalletPrice from "@/components/wallet/SelectWalletPrice";
import UserTransactionsTable from "@/components/wallet/UserTransactionsTable";
import { UserTransactions, WalletCredit, WalletDebit } from "@/utils/axiosUtils/API";
import useCreate from "@/utils/hooks/useCreate";
import usePermissionCheck from "@/utils/hooks/usePermissionCheck";
import { YupObject, nameSchema } from "@/utils/validation/ValidationSchemas";
import { Form, Formik } from "formik";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RiWallet2Line } from "react-icons/ri";
import { Col, Row } from "reactstrap";

const Wallet = () => {
  const [isValue, setIsValue] = useState("");
  const [credit, debit] = usePermissionCheck(["credit", "debit"]);

  const { t } = useTranslation("common");
  const refRefetch = useRef();
  const { mutate: CreateWalletCredit, isLoading: creditLoader } = useCreate(WalletCredit, false, "/wallet", false, () => {
    refRefetch.current.call();
  });
  const { mutate: CreateWalletDebit, isLoading: debitLoader } = useCreate(WalletDebit, false, "/wallet", false, () => {
    refRefetch.current.call();
  });
  return (
    <div className="save-back-button">
      <Formik
        initialValues={{
          consumer_id: "",
          showBalance: "",
          balance: "",
        }}
        validationSchema={YupObject({ consumer_id: nameSchema })}
        onSubmit={(values) => {
          if (isValue == "credit") {
            // Put your logic here
          } else {
            // Put your logic here
          }
        }}
      >
        {({ values, handleSubmit, setFieldValue }) => (
          <>
            <Form>
              <div className="card-spacing">
                <Row>
                  <SelectUser title={t("SelectCustomer")} values={values} setFieldValue={setFieldValue} role="consumer" name={"consumer_id"} userRole={""} />
                  <SelectWalletPrice values={values} setFieldValue={setFieldValue} handleSubmit={handleSubmit} setIsValue={setIsValue} creditLoader={creditLoader} debitLoader={debitLoader} title={t("Wallet")} description={t("WalletBalance")} selectUser={"consumer_id"} icon={<RiWallet2Line />} isCredit={credit} isDebit={debit} />
                </Row>
              </div>
            </Form>
            <Col sm="12">
              <UserTransactionsTable filterHeader={{ customTitle: "Transactions" }} url={UserTransactions} moduleName="UserTransactions" setFieldValue={setFieldValue} userIdParams={true} ref={refRefetch} dateRange={true} paramsProps={{ consumer_id: values["consumer_id"] ? values["consumer_id"] : null }} />
            </Col>
          </>
        )}
      </Formik>
    </div>
  );
};

export default Wallet;
