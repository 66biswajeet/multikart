"use client";
import VendorRegistrationWizard from "@/components/vendor/registration/VendorRegistrationWizard";
// --- ADD ALL LOGIC/STATE IMPORTS ---
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import request from "@/utils/axiosUtils";
// ---------------------------------

export default function VendorRegisterPage() {
  // --- STATE AND LOGIC IS LIFTED UP HERE ---
  const [currentStep, setCurrentStep] = useState(1);
  const [registrationData, setRegistrationData] = useState(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRegistrationData();
  }, []);

  const loadRegistrationData = async () => {
    try {
      const response = await request({
        url: "/vendor/register",
        method: "GET",
      });
      if (response?.data?.success && response?.data?.data) {
        // --- THIS IS THE FIX ---
        // 1. Define vendorData first
        const vendorData = response.data.data;

        // 2. Now set your state
        setRegistrationData(vendorData);

        // 3. Now this check will work
        if (vendorData.vendor_status === "Approved") {
          router.push("/vendor/dashboard");
          return; // Stop running the rest of the function
        }
        // --- END OF FIX ---
        const savedStep = response.data.data.registration_step || 0;
        if (savedStep === 6) {
          setCurrentStep(5);
        } else if (savedStep < 5) {
          setCurrentStep(savedStep + 1);
        } else {
          setCurrentStep(savedStep);
        }
      } else {
        setCurrentStep(1);
      }
    } catch (error) {
      console.error("Error loading registration:", error);
      toast.error("Could not load registration data");
    } finally {
      setIsLoading(false); // <-- Stop loading
    }
  };

  const handleStepSubmit = async (step, values) => {
    try {
      const response = await request({
        url: "/vendor/register",
        method: "POST",
        data: { step, data: values },
      });

      if (response?.data?.success) {
        setRegistrationData(response.data.data);
        if (step === 5) {
          toast.success("Registration submitted successfully!");
          router.push("/vendor/dashboard");
        } else {
          setCurrentStep(step + 1);
          toast.success(`Step ${step} saved successfully`);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving step");
    }
  };

  const handleStepBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  // --- END OF LIFTED LOGIC ---

  return (
    <div className="container-fluid">
      <h2 className="mb-4">Become a Vendor</h2>

      <div className="vendor-registration">
        {/* Pass the currentStep DOWN to the sidebar.
          It will now re-render and show the correct active step.
        */}
        <VendorRegistrationWizard
          sidebarOnly={true}
          currentStep={currentStep}
        />

        <div className="vendor-card">
          {/* Pass all state and handlers DOWN to the form.
           */}
          <VendorRegistrationWizard
            formOnly={true}
            currentStep={currentStep}
            registrationData={registrationData}
            onStepSubmit={handleStepSubmit}
            onStepBack={handleStepBack}
          />
        </div>
      </div>
    </div>
  );
}
