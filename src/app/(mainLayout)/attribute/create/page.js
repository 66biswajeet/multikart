"use client";
import AttributeForm from "@/components/attribute/AttributeForm";
import FormWrapper from "@/utils/hoc/FormWrapper";

const AttributeCreate = () => {
  return (
    <FormWrapper title="AddAttribute">
      <AttributeForm buttonName="Save" />
    </FormWrapper>
  );
};

export default AttributeCreate;
