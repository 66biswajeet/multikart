import TabTitle from "@/components/widgets/TabTitle";
import { useState } from "react";
import { TabContent, TabPane } from "reactstrap";
import { SellerDashboardTitles } from "../../data/TabTitleList";
import AboutSeller from "./sellerDashboard/AboutSeller";
import Selling from "./sellerDashboard/Selling";
import ServiceSeller from "./sellerDashboard/ServiceSeller";
import StepTab from "./sellerDashboard/StepTab";
import { useTranslation } from "react-i18next";

const SellerTab = ({ values, setFieldValue, errors, touched }) => {
  const [activeTab, setActiveTab] = useState("1");

  const { t } = useTranslation("common");
  return (
    <div className="inside-horizontal-tabs">
      <TabTitle activeTab={activeTab} setActiveTab={setActiveTab} titleList={SellerDashboardTitles} errors={errors} touched={touched} />
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <AboutSeller values={values} setFieldValue={setFieldValue} errors={errors} />
        </TabPane>
        <TabPane tabId="2">
          <ServiceSeller values={values} setFieldValue={setFieldValue} errors={errors} />
        </TabPane>
        <TabPane tabId="3">
          <StepTab values={values} setFieldValue={setFieldValue} errors={errors} />
        </TabPane>
        <TabPane tabId="4">
          <Selling values={values} setFieldValue={setFieldValue} errors={errors} />
        </TabPane>
      </TabContent>
    </div>
  );
};

export default SellerTab;
