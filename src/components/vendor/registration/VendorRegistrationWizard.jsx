"use client";
// REMOVED all imports for: useState, useEffect, useRouter, toast, request
import Step1BusinessDetails from "./steps/Step1BusinessDetails";
import Step2ContactInfo from "./steps/Step2ContactInfo";
import Step3WarehousesChannels from "./steps/Step3WarehousesChannels";
import Step4Payout from "./steps/Step4Payout";
import Step5Review from "./steps/Step5Review";

// Accept new props from the parent (page.jsx)
const VendorRegistrationWizard = ({
  sidebarOnly = false,
  formOnly = false,
  currentStep, // <-- NEW PROP
  registrationData, // <-- NEW PROP
  onStepSubmit, // <-- NEW PROP
  onStepBack, // <-- NEW PROP
}) => {
  // ALL LOGIC IS REMOVED (useState, useEffect, loadRegistrationData, handleStepSubmit)

  const StepList = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map((step) => (
        <div
          key={step}
          // Now reads currentStep from props
          className={`step ${currentStep >= step ? "active" : ""}`}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && "Business Details"}
            {step === 2 && "Contact Info"}
            {step === 3 && "Warehouses & Channels"}
            {step === 4 && "Payout"}
            {step === 5 && "Review"}
          </div>
        </div>
      ))}
    </div>
  );

  const FormArea = () => (
    <>
      <div className="registration-form">
        {/* All forms now use props for data and submit handling */}
        {currentStep === 1 && (
          <Step1BusinessDetails
            onSubmit={(values) => onStepSubmit(1, values)}
            initialData={
              registrationData?.registration_data?.step1 || registrationData
            }
          />
        )}
        {currentStep === 2 && (
          <Step2ContactInfo
            onSubmit={(values) => onStepSubmit(2, values)}
            initialData={
              registrationData?.registration_data?.step2 || registrationData
            }
          />
        )}
        {currentStep === 3 && (
          <Step3WarehousesChannels
            onSubmit={(values) => onStepSubmit(3, values)}
            initialData={
              registrationData?.registration_data?.step3 || registrationData
            }
          />
        )}
        {currentStep === 4 && (
          <Step4Payout
            onSubmit={(values) => onStepSubmit(4, values)}
            initialData={
              registrationData?.registration_data?.step4 || registrationData
            }
          />
        )}
        {currentStep === 5 && (
          <Step5Review
            onSubmit={(values) => onStepSubmit(5, values)}
            registrationData={registrationData}
          />
        )}
      </div>
      <div className="actions">
        {currentStep > 1 && (
          <button
            className="btn btn-outline-secondary"
            onClick={onStepBack} // <-- Use new prop
            type="button"
          >
            Previous
          </button>
        )}
      </div>
    </>
  );

  if (sidebarOnly) return <StepList />;
  if (formOnly) return <FormArea />;

  return null;
};

export default VendorRegistrationWizard;
