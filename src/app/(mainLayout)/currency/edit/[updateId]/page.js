"use client";
import Loader from "@/components/commonComponent/Loader";
import FormWrapper from "@/utils/hoc/FormWrapper";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const UpdateCurrency = () => {
  const params = useParams();
  const CurrencyForm = dynamic(() => import("@/components/currency/CurrencyForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  return (
    params?.updateId && (
      <FormWrapper title="EditCurrency">
        <CurrencyForm updateId={params?.updateId} buttonName="Update" />
      </FormWrapper>
    )
  );
};

export default UpdateCurrency;
