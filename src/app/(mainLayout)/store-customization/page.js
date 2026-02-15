"use client";
import dynamic from "next/dynamic";

const StoreCustomization = () => {
  const StoreCustomizationForm = dynamic(
    () =>
      import("@/components/storeCustomization/StoreCustomizationForm").then(
        (mod) => mod.default,
      ),
    {
      ssr: false,
    },
  );

  return <StoreCustomizationForm title={"Store Customization"} />;
};

export default StoreCustomization;
