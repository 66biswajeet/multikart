"use client";
import AttributeForm from "@/components/attribute/AttributeForm";
import FormWrapper from "@/utils/hoc/FormWrapper";
import { useParams } from "next/navigation";

const UpdateAttributes = () => {
  const params = useParams();
  const updateId = params?.updateId;
  return (
    updateId && (
      <FormWrapper title="EditAttribute">
        <AttributeForm updateId={updateId} buttonName="Update" />
      </FormWrapper>
    )
  );
};

export default UpdateAttributes;
