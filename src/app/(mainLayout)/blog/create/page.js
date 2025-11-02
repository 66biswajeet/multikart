"use client";
import Loader from "@/components/commonComponent/Loader";
import FormWrapper from "@/utils/hoc/FormWrapper";
import dynamic from "next/dynamic";

const AddBlog = () => {
  const BlogForm = dynamic(() => import("@/components/blog/BlogForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  return (
    <FormWrapper title="AddBlog">
      <BlogForm  buttonName="Save" />
    </FormWrapper>
  );
};

export default AddBlog;
