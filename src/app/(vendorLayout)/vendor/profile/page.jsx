"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardBody,
  Col,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { toast } from "react-toastify";
import request from "@/utils/axiosUtils";
import classnames from "classnames";
import { useRouter } from "next/navigation";

// 1. Import the reusable form components from your registration wizard
import Step1BusinessDetails from "@/components/vendor/registration/steps/Step1BusinessDetails";
import Step2ContactInfo from "@/components/vendor/registration/steps/Step2ContactInfo";
import Step3WarehousesChannels from "@/components/vendor/registration/steps/Step3WarehousesChannels";

export default function VendorProfilePage() {
  const [activeTab, setActiveTab] = useState("1");
  const [vendorData, setVendorData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load the vendor's data
  useEffect(() => {
    loadVendorData(router);
  }, []);

  const loadVendorData = async (router) => {
    try {
      setIsLoading(true);
      const response = await request(
        { url: "/vendor/profile", method: "GET" },
        router
      );
      if (response.data?.success) {
        setVendorData(response.data.data);
      }
    } catch (error) {
      toast.error("Error loading profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Generic submit handler for all forms
  const handleProfileUpdate = async (values, formName) => {
    try {
      const response = await request(
        {
          url: "/vendor/profile",
          method: "PUT",
          data: values, // Send the form values directly
        },
        router
      );

      if (response.data?.success) {
        toast.success(`${formName} updated successfully!`);
        setVendorData(response.data.data); // Refresh data with response
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating profile");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a <Loader /> component
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Vendor Profile</h2>
      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <Nav tabs>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => setActiveTab("1")}
                  >
                    Business Details
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => setActiveTab("2")}
                  >
                    Contact Information
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => setActiveTab("3")}
                  >
                    Warehouses & Channels
                  </NavLink>
                </NavItem>
              </Nav>

              <TabContent activeTab={activeTab} className="mt-4">
                {/* --- Tab 1: Business Details --- */}
                <TabPane tabId="1">
                  {vendorData && (
                    <Step1BusinessDetails
                      // Pass the loaded data to the form
                      initialData={vendorData}
                      // Pass the update handler
                      onSubmit={(values) =>
                        handleProfileUpdate(values, "Business Details")
                      }
                    />
                  )}
                </TabPane>

                {/* --- Tab 2: Contact Info --- */}
                <TabPane tabId="2">
                  {vendorData && (
                    <Step2ContactInfo
                      initialData={vendorData}
                      onSubmit={(values) =>
                        handleProfileUpdate(values, "Contact Information")
                      }
                    />
                  )}
                </TabPane>

                {/* --- Tab 3: Warehouses & Channels --- */}
                <TabPane tabId="3">
                  {vendorData && (
                    <Step3WarehousesChannels
                      initialData={vendorData}
                      onSubmit={(values) =>
                        handleProfileUpdate(values, "Warehouses & Channels")
                      }
                    />
                  )}
                </TabPane>
              </TabContent>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
