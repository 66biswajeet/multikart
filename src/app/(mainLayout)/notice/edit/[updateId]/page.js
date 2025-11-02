"use client";
import NoticeForm from "@/components/notice/NoticeForm";
import { Notice } from "@/utils/axiosUtils/API";
import FormWrapper from "@/utils/hoc/FormWrapper";
import useUpdate from "@/utils/hooks/useUpdate";
import { useParams } from "next/navigation";

const NoticeUpdate = () => {
  const params = useParams();
  const { mutate, isLoading } = useUpdate(Notice, params?.updateId, `/notice`);
  return (
    params?.updateId && (
      <FormWrapper title="UpdateNotice">
        <NoticeForm mutate={mutate} updateId={params?.updateId} loading={isLoading} buttonName="Update" />
      </FormWrapper>
    )
  );
};

export default NoticeUpdate;
