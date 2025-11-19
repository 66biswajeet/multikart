import { Form, Formik } from "formik";
import { useContext, useEffect, useMemo, useState } from "react";
import { Row } from "reactstrap";
import FormBtn from "../../elements/buttons/FormBtn";
import CategoryContext from "../../helper/categoryContext";
import request from "../../utils/axiosUtils";
import {
  nameSchema,
  YupObject,
} from "../../utils/validation/ValidationSchemas";
import Loader from "../commonComponent/Loader";
import CheckBoxField from "../inputFields/CheckBoxField";
import SimpleFileUploadField from "../inputFields/SimpleFileUploadField";
import MultiSelectField from "../inputFields/MultiSelectField";
import SimpleInputField from "../inputFields/SimpleInputField";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { useQuery } from "@tanstack/react-query";
import { ToastNotification } from "../../utils/customFunctions/ToastNotification";
import { attribute, VariantAPI } from "@/utils/axiosUtils/API";
import AttributeVariantMappingField from "./AttributeVariantMappingField";

const CategoryForm = ({
  setResetData,
  updateId,
  loading,
  type,
  buttonName,
}) => {
  const { t } = useTranslation("common");
  const { categoryState } = useContext(CategoryContext);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: oldData,
    isLoading,
    refetch,
  } = useCustomQuery(
    ["category", updateId],
    () => request({ url: `category/${updateId}` }, router),
    {
      enabled: false,
      select: (data) => data?.data?.data,
    }
  );

  useEffect(() => {
    updateId && refetch();
  }, [updateId]);

  const { data: allAttributes, isLoading: attributesLoading } = useQuery({
    queryKey: ["allAttributes"],
    queryFn: () => request({ url: attribute }),
    select: (data) =>
      data?.data?.data?.data?.map((attr) => ({
        // This path is correct
        ...attr,
        name: attr.name,
        id: attr._id,
      })),
  });

  const { data: allVariants, isLoading: variantsLoading } = useQuery({
    queryKey: ["allVariants"],
    queryFn: () => request({ url: VariantAPI }),
    // --- THIS IS THE FIX ---
    // Added one more .data to match the attribute query path
    select: (data) =>
      data?.data?.data?.data?.map((vari) => ({
        // This path is now correct
        ...vari,
        name: vari.variant_name,
        id: vari._id,
      })),
  });

  const updatedData = useMemo(() => {
    return categoryState;
  }, [categoryState]);

  if ((updateId && isLoading) || attributesLoading || variantsLoading)
    return <Loader />;

  return (
    <Formik
      enableReinitialize
      initialValues={{
        name: updateId ? oldData?.name || "" : "",
        display_name: updateId ? oldData?.display_name || "" : "",
        description: updateId ? oldData?.description || "" : "",
        category_image: updateId ? oldData?.category_image || null : null,
        category_icon: updateId ? oldData?.category_icon || null : null,
        category_meta_image: updateId
          ? oldData?.category_meta_image || null
          : null,
        meta_title: updateId ? oldData?.meta_title || "" : "",
        meta_description: updateId ? oldData?.meta_description || "" : "",
        commission_rate: updateId ? oldData?.commission_rate : "",
        type: type,
        status: updateId ? Boolean(Number(oldData?.status)) : true,
        parent_id: updateId ? oldData?.parent_id || undefined : undefined,
        attribute_mapping: updateId ? oldData?.attribute_mapping || [] : [],
        variant_mapping: updateId ? oldData?.variant_mapping || [] : [],
      }}
      validationSchema={YupObject({
        name: nameSchema,
        display_name: nameSchema,
      })}
      onSubmit={async (values, helpers) => {
        setIsSubmitting(true);
        console.log("📤 Category form submitted:", values);

        try {
          const formData = new FormData();

          formData.append("name", values.name);
          formData.append("display_name", values.display_name);
          formData.append("description", values.description || "");
          formData.append("type", values.type);
          formData.append("status", values.status ? "true" : "false");

          if (values.parent_id) {
            formData.append("parent_id", values.parent_id);
          }

          if (values.commission_rate) {
            formData.append("commission_rate", values.commission_rate);
          }

          if (values.meta_title) {
            formData.append("meta_title", values.meta_title);
          }

          if (values.meta_description) {
            formData.append("meta_description", values.meta_description);
          }

          formData.append(
            "attribute_mapping",
            JSON.stringify(values.attribute_mapping)
          );
          formData.append(
            "variant_mapping",
            JSON.stringify(values.variant_mapping)
          );

          if (values.category_image instanceof File) {
            formData.append("category_image", values.category_image);
            console.log(
              "📎 Appending category_image file:",
              values.category_image.name
            );
          } else if (values.delete_category_image) {
            formData.append("delete_category_image", "true");
          }

          if (values.category_icon instanceof File) {
            formData.append("category_icon", values.category_icon);
            console.log(
              "📎 Appending category_icon file:",
              values.category_icon.name
            );
          } else if (values.delete_category_icon) {
            formData.append("delete_category_icon", "true");
          }

          if (values.category_meta_image instanceof File) {
            formData.append("category_meta_image", values.category_meta_image);
            console.log(
              "📎 Appending category_meta_image file:",
              values.category_meta_image.name
            );
          } else if (values.delete_category_meta_image) {
            formData.append("delete_category_meta_image", "true");
          }

          console.log("📦 FormData entries:");
          for (let pair of formData.entries()) {
            console.log(
              "   ",
              pair[0],
              ":",
              pair[1] instanceof File ? `File: ${pair[1].name}` : pair[1]
            );
          }

          const apiUrl = updateId ? `category/${updateId}` : "category";
          const method = updateId ? "PUT" : "POST";

          const response = await request(
            {
              url: apiUrl,
              method,
              data: formData,
            },
            router
          );

          console.log("✅ Category response:", response);

          if (
            response?.success ||
            response?.data ||
            response?.status === 201 ||
            response?.status === 200
          ) {
            ToastNotification(
              "success",
              updateId
                ? t("CategoryUpdatedSuccessfully")
                : t("CategoryCreatedSuccessfully")
            );
            setResetData && setResetData(true);
            router.push("/category");
          } else {
            throw new Error(response?.message || "Operation failed");
          }
        } catch (error) {
          console.error("❌ Category form submission error:", error);
          ToastNotification(
            "error",
            error?.response?.data?.message ||
              error?.message ||
              "An error occurred"
          );
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      {({ setFieldValue, values, errors }) => (
        <Form className="theme-form theme-form-2 mega-form">
          <Row>
            <SimpleInputField
              nameList={[
                {
                  name: "name",
                  title: "Name (Internal)",
                  placeholder: t("EnterCategoryName"),
                  require: "true",
                },
                {
                  name: "display_name",
                  title: "Display Name (Customer-Facing)",
                  placeholder: t("EnterCategoryDisplayName"),
                  require: "true",
                },
                {
                  name: "description",
                  type: "textarea",
                  rows: "3",
                  placeholder: t("EnterCategoryDescription"),
                },
              ]}
            />
            {type == "product" && (
              <SimpleInputField
                nameList={[
                  {
                    name: "commission_rate",
                    title: "CommissionRate",
                    postprefix: "%",
                    inputaddon: "true",
                    placeholder: t("EnterCommissionRate"),
                    min: "0",
                    max: "100",
                    type: "number",
                    helpertext:
                      "*Define the percentage of earnings retained as commission.",
                  },
                ]}
              />
            )}

            <MultiSelectField
              errors={errors}
              values={values}
              setFieldValue={setFieldValue}
              name="parent_id"
              title={"SelectParent"}
              data={updatedData}
              getValuesKey="_id"
            />

            <AttributeVariantMappingField
              setFieldValue={setFieldValue}
              values={values}
              errors={errors}
              allAttributes={allAttributes}
              allVariants={allVariants}
            />

            <SimpleFileUploadField
              name="category_image"
              title="Image"
              values={values}
              setFieldValue={setFieldValue}
              errors={errors}
            />

            <SimpleFileUploadField
              name="category_icon"
              title="Icon"
              values={values}
              setFieldValue={setFieldValue}
              errors={errors}
            />

            <SimpleInputField
              nameList={[
                {
                  name: "meta_title",
                  title: "meta_title",
                  placeholder: t("enter_meta_title"),
                },
                {
                  name: "meta_description",
                  title: "meta_description",
                  type: "textarea",
                  rows: "3",
                  placeholder: t("enter_meta_description"),
                },
              ]}
            />

            <SimpleFileUploadField
              name="category_meta_image"
              title="meta_image"
              values={values}
              setFieldValue={setFieldValue}
              errors={errors}
            />

            <CheckBoxField name="status" />
            <FormBtn loading={isSubmitting} buttonName={buttonName} />
          </Row>
        </Form>
      )}
    </Formik>
  );
};
export default CategoryForm;
