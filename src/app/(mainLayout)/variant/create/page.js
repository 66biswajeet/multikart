"use client";
import React from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Formik, Form, FieldArray } from "formik";
import { YupObject, nameSchema } from "@/utils/validation/ValidationSchemas";
import request from "@/utils/axiosUtils";
import { VariantAPI } from "@/utils/axiosUtils/API";
import { useTranslation } from "react-i18next";
import { RiAddLine, RiDeleteBinLine } from "react-icons/ri";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import Btn from "@/elements/buttons/Btn";
import SimpleInputField from "@/components/inputFields/SimpleInputField";
import MultiSelectField from "@/components/inputFields/MultiSelectField";
import CheckBoxField from "@/components/inputFields/CheckBoxField";
import { Row, Col } from "reactstrap";

// Input type options for the dropdown
const inputTypeOptions = [
  { id: "dropdown", name: "Dropdown" },
  { id: "text", name: "Text" },
  { id: "swatch", name: "Color Swatch" },
  { id: "pattern", name: "Pattern (Image)" },
];

const CreateVariant = () => {
  const { t } = useTranslation("common");
  const router = useRouter();

  const createVariantMutation = useMutation({
    mutationFn: (data) =>
      request({ url: `${VariantAPI}`, method: "POST", data }),
    onSuccess: (data) => {
      ToastNotification("success", t("Variantcreatedsuccessfully"));
      router.push("/variant");
    },
    onError: (error) => {
      ToastNotification(
        "error",
        error.response?.data?.message || t("Failedtocreatevariant")
      );
    },
  });

  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-title">{t("CreateNewVariant")}</h4>
      </div>
      <div className="card-body">
        <Formik
          initialValues={{
            variant_name: "",
            description: "",
            input_type: "",
            active: true,
            options: [],
          }}
          validationSchema={YupObject({
            variant_name: nameSchema,
            input_type: nameSchema, // Use nameSchema for required string
          })}
          onSubmit={(values) => {
            createVariantMutation.mutate(values);
          }}
        >
          {({ values, setFieldValue, errors, touched }) => (
            <Form className="theme-form">
              <Row>
                <SimpleInputField
                  nameList={[
                    {
                      name: "variant_name",
                      title: "VariantName",
                      placeholder: t("e.g., Color, Size, Material"),
                      require: "true",
                    },
                  ]}
                />

                <MultiSelectField
                  name="input_type"
                  title="InputType"
                  require="true"
                  values={values}
                  setFieldValue={setFieldValue}
                  data={inputTypeOptions} // Use the options array
                  getValuesKey="id"
                />

                <SimpleInputField
                  nameList={[
                    {
                      name: "description",
                      title: "Description",
                      type: "textarea",
                      rows: "3",
                      placeholder: t("Optionaldescriptionfortheadmin"),
                    },
                  ]}
                />

                <CheckBoxField name="active" title="Active" />
              </Row>

              {/* Dynamic Options Section */}
              {["dropdown", "swatch", "pattern"].includes(
                values.input_type
              ) && (
                <div className="mt-4 border-top pt-4">
                  <h5 className="mb-3">{t("VariantOptions")}</h5>
                  <FieldArray
                    name="options"
                    render={(arrayHelpers) => (
                      <div>
                        {values.options?.map((item, index) => (
                          <div
                            key={index}
                            className="row align-items-center mb-3 p-3 border rounded"
                          >
                            <Col md={4}>
                              <SimpleInputField
                                nameList={[
                                  {
                                    name: `options.${index}.label`,
                                    title: "Label",
                                    placeholder: t("e.g., Red"),
                                  },
                                ]}
                              />
                            </Col>
                            <Col md={4}>
                              <SimpleInputField
                                nameList={[
                                  {
                                    name: `options.${index}.value`,
                                    title:
                                      values.input_type === "swatch"
                                        ? "Value (Hex Code)"
                                        : "Value",
                                    placeholder:
                                      values.input_type === "swatch"
                                        ? "#FF0000"
                                        : "e.g., red",
                                  },
                                ]}
                              />
                            </Col>
                            {values.input_type === "pattern" && (
                              <Col md={4}>
                                <SimpleInputField
                                  nameList={[
                                    {
                                      name: `options.${index}.image_url`,
                                      title: "ImageURL",
                                      placeholder: t("http://.../image.png"),
                                    },
                                  ]}
                                />
                              </Col>
                            )}
                            <div className="col-md-auto mt-3">
                              <Btn
                                type="button"
                                className="btn-danger btn-sm"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <RiDeleteBinLine />
                              </Btn>
                            </div>
                          </div>
                        ))}
                        <Btn
                          type="button"
                          className="btn-primary"
                          onClick={() =>
                            arrayHelpers.push({ label: "", value: "" })
                          }
                        >
                          <RiAddLine className="me-1" /> {t("AddOption")}
                        </Btn>
                      </div>
                    )}
                  />
                </div>
              )}

              <div className="row mt-4">
                <div className="col-12">
                  <Btn
                    type="submit"
                    className="btn-primary"
                    loading={createVariantMutation.isLoading}
                  >
                    {t("SaveVariant")}
                  </Btn>
                  <Btn
                    type="button"
                    className="btn-light ms-2"
                    onClick={() => router.back()}
                  >
                    {t("Cancel")}
                  </Btn>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CreateVariant;
