"use client";
import NoticeForm from "@/components/notice/NoticeForm";
import { Notice } from "@/utils/axiosUtils/API";
import FormWrapper from "@/utils/hoc/FormWrapper";
import useCreate from "@/utils/hooks/useCreate";

const NoticeCreate = () => {
  const { mutate, isLoading } = useCreate(Notice, false, `/notice`);
  return (
    <FormWrapper title="AddNotice">
      <NoticeForm loading={isLoading} mutate={mutate} buttonName="Save" />
    </FormWrapper>
  );
};

export default NoticeCreate;
