"use client";
import FormWrapper from "@/utils/hoc/FormWrapper";
import dynamic from "next/dynamic";

const TaxCreate = () => {
    const TaxForm = dynamic(() => import("@/components/tax/TaxForm").then((mod) => mod.default), {
      // loading: () => <Loader />,
      ssr: false,
    });
  return (
    <FormWrapper title="AddTax">
      <TaxForm buttonName="Save" />
    </FormWrapper>
  );
};

export default TaxCreate;
