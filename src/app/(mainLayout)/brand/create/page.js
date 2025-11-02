"use client";
import Loader from "@/components/commonComponent/Loader";
import { BrandAPI } from "@/utils/axiosUtils/API";
import FormWrapper from "@/utils/hoc/FormWrapper";
import useCreate from "@/utils/hooks/useCreate";
import dynamic from "next/dynamic";

const CreateBrand = () => {
  const BrandForm = dynamic(() => import("@/components/brand/BrandForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  const { mutate, isLoading } = useCreate(BrandAPI, false, `/brand`);
  return (
    <FormWrapper title="CreateBrand">
      <BrandForm mutate={mutate} loading={isLoading} buttonName="Save Brand" />
    </FormWrapper>
  );
};

export default CreateBrand;
