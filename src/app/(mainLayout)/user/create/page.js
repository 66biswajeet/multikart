"use client";
import Loader from "@/components/commonComponent/Loader";
import AdminProtectedRoute from "@/components/common/AdminProtectedRoute";
import FormWrapper from "@/utils/hoc/FormWrapper";
import dynamic from "next/dynamic";

const AddNewUser = () => {
  const UserForm = dynamic(() => import("@/components/user/UserForm").then((mod) => mod.default), {
    loading: () => <Loader />,
    ssr: false,
  });
  
  return (
    <AdminProtectedRoute>
      <FormWrapper title="AddUser">
        <UserForm buttonName="Save User" />
      </FormWrapper>
    </AdminProtectedRoute>
  );
};

export default AddNewUser;
