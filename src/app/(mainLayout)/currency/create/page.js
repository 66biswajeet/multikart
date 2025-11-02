"use client";
import CurrencyForm from "@/components/currency/CurrencyForm";
import FormWrapper from "@/utils/hoc/FormWrapper";

const CreateCurrency = () => {
  return (
    <FormWrapper title="AddCurrency">
      <CurrencyForm />
    </FormWrapper>
  );
};

export default CreateCurrency;
