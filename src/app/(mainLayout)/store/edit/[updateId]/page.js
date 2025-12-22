"use client";

import StoreForm from "@/components/store/StoreForm";
import { store } from "@/utils/axiosUtils/API";
import FormWrapper from "@/utils/hoc/FormWrapper";
import useCreate from "@/utils/hooks/useCreate";
import { useParams } from "next/navigation";
import Loader from "@/components/commonComponent/Loader";

const StoreUpdate = () => {
  const params = useParams();
  const { mutate, isLoading } = useCreate(store, params?.updateId, "/store");

  if (!params?.updateId) {
    return <Loader />;
  }

  return (
    <FormWrapper title="EditVendor">
      <StoreForm
        mutate={mutate}
        updateId={params.updateId}
        loading={isLoading}
        buttonName="Update"
      />
    </FormWrapper>
  );
};

export default StoreUpdate;
