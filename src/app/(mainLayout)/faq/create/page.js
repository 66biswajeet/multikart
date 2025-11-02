"use client";
import Loader from "@/components/commonComponent/Loader";
import FormWrapper from "@/utils/hoc/FormWrapper";
import dynamic from "next/dynamic";

const CreateFaq = () => {
  const FaqForm = dynamic(() => import("@/components/faq/FaqForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });

  return (
    <FormWrapper title="AddFaq">
      <FaqForm buttonName="Save" />
    </FormWrapper>
  );
};

export default CreateFaq;
