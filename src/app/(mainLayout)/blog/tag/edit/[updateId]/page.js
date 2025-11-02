'use client'
import useUpdate from "@/utils/hooks/useUpdate";
import { blog, tag } from "@/utils/axiosUtils/API";
import TagForm from "@/components/tag/TagForm";
import FormWrapper from "@/utils/hoc/FormWrapper";
import { useParams } from "next/navigation";

const BlogTagUpdate = () => {
  const params  = useParams()
  const updateId = params.updateId
  const { mutate, isLoading } = useUpdate(tag, updateId, `${blog}${tag}`);
  return (
    updateId && (
      <FormWrapper title="EditTag">
        <TagForm mutate={mutate} updateId={updateId} loading={isLoading} type={"post"}  buttonName="Update"/>
      </FormWrapper>
    )
  );
};

export default BlogTagUpdate;
