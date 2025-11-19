import React, { useContext, useState } from "react";
import { TabContent, TabPane } from "reactstrap";
import { AccountTab } from "../../data/TabTitleList";
import ProfileSettingTab from "./ProfileSettingTab";
import ProfilePasswordTab from "./ProfilePasswordTab";
import AccountContext from "../../helper/accountContext";
import { RiAccountBoxLine } from "react-icons/ri";
import VendorProfile from "./VendorProfile";
import TabTitle from "../widgets/TabTitle";
// 1. Import the new AddressTab component
import AddressTab from "./AddressTab";

const AccountForm = () => {
  const [activeTab, setActiveTab] = useState("1");
  const { role } = useContext(AccountContext);
  const filterValue = () => {
    let cloneTabs = [...AccountTab];
    if (role === "vendor") {
      cloneTabs.splice(1, 0, {
        title: "VendorSetting",
        icon: <RiAccountBoxLine />,
      });
      return cloneTabs;
    } else {
      return cloneTabs;
    }
  };
  return (
    <div className="inside-horizontal-tabs mt-0">
      <TabTitle
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        titleList={filterValue() || []}
      />
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <ProfileSettingTab />
        </TabPane>
        {role === "vendor" && (
          <TabPane tabId="2">
            <VendorProfile />
          </TabPane>
        )}

        {/* 2. Added the new AddressTab pane here */}
        <TabPane tabId={role === "vendor" ? "3" : "2"}>
          <AddressTab />
        </TabPane>

        {/* 3. Updated the tabId for ProfilePasswordTab (was "3" : "2") */}
        <TabPane tabId={role === "vendor" ? "4" : "3"}>
          <ProfilePasswordTab />
        </TabPane>
      </TabContent>
    </div>
  );
};

export default AccountForm;
