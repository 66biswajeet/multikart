"use client";
import Loader from "@/components/commonComponent/Loader";
import FormWrapper from "@/utils/hoc/FormWrapper";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const UpdatePage = () => {
  const params = useParams();
  const PageForm = dynamic(()=> import('@/components/pages/PageForm') .then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  return (
    params?.updateId && (
      <FormWrapper title="UpdatePage">
        <PageForm updateId={params?.updateId} buttonName="Update" />
      </FormWrapper>
    )
  );
};

export default UpdatePage;
