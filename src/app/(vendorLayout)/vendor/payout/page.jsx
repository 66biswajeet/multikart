"use client";
import { useEffect, useState } from "react";
import { Card, CardBody, Col, Row } from "reactstrap";
import { toast } from "react-toastify";
import request from "@/utils/axiosUtils";
import { useRouter } from "next/navigation";

// 1. Import the reusable form component
import Step4Payout from "@/components/vendor/registration/steps/Step4Payout";

export default function VendorPayoutPage() {
  const [payoutData, setPayoutData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load the vendor's data
  useEffect(() => {
    loadPayoutData();
  }, []);

  const loadPayoutData = async () => {
    try {
      setIsLoading(true);
      const response = await request(
        { url: "/vendor/payout", method: "GET" },
        router
      );
      if (response.data?.success) {
        setPayoutData(response.data.data);
      }
    } catch (error) {
      toast.error("Error loading payout data");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit handler for the form
  const handlePayoutUpdate = async (values) => {
    try {
      // The API route is designed to add/update
      const response = await request(
        {
          url: "/vendor/payout",
          method: "POST",
          data: values, // Send the form values (e.g., { payout: { ... } })
        },
        router
      );

      if (response.data?.success) {
        toast.success("Payout account updated successfully!");
        setPayoutData(response.data.data); // Refresh data with response
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating account");
    }
  };

  if (isLoading) {
    return <div>Loading...</div>; // Or a <Loader /> component
  }

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Payout Account</h2>
      <Row>
        <Col sm="12">
          <Card>
            <CardBody>
              <h5 className="mb-3">Manage Your Bank Details</h5>
              <p className="text-muted">
                This is the bank account where your sales payments will be sent.
              </p>

              {/* We reuse the Step4Payout component.
                It needs 'initialData' to be an object with a 'payout' key,
                so we pass { payout: payoutData }.
              */}
              <Step4Payout
                initialData={{ payout: payoutData }}
                onSubmit={handlePayoutUpdate}
              />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
