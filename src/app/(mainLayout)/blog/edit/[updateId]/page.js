"use client";
import Loader from "@/components/commonComponent/Loader";
import { blog } from "@/utils/axiosUtils/API";
import FormWrapper from "@/utils/hoc/FormWrapper";
import useCreate from "@/utils/hooks/useCreate";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

const BlogUpdate = () => {
  const params = useParams();
  const updateId = params?.updateId;
  const { mutate, isLoading } = useCreate(blog, params?.updateId, "/blog");
  const BlogForm = dynamic(() => import("@/components/blog/BlogForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  return (
    updateId && (
      <FormWrapper title="EditBlog">
        <BlogForm mutate={mutate} updateId={updateId} loading={isLoading} buttonName="Update" />
      </FormWrapper>
    )
  );
};

export default BlogUpdate;
