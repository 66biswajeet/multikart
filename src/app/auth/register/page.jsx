"use client";
import {
  RegistrationInitialValues,
  RegistrationValidationSchema,
} from "@/components/auth/RegistrationFormObjects";
import Btn from "@/elements/buttons/Btn";
import SettingContext from "@/helper/settingContext";
import { YupObject } from "@/utils/validation/ValidationSchemas";
import { Form, Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Container, Row } from "reactstrap";
import useCustomQuery from "@/utils/hooks/useCustomQuery";
import { Field } from "formik";
import request from "@/utils/axiosUtils";
import { country } from "@/utils/axiosUtils/API";
import SearchableSelectInput from "@/components/inputFields/SearchableSelectInput";
import { ReactstrapInput } from "@/components/reactstrapFormik";
import { AllCountryCode } from "@/data/AllCountryCode";
import SimpleInputField from "@/components/inputFields/SimpleInputField";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

const VendorRegister = () => {
  const router = useRouter();
  const { state } = useContext(SettingContext);
  const { data } = useCustomQuery(
    [country],
    () => request({ url: country }, router),
    {
      refetchOnWindowFocus: false,
      select: (res) =>
        res.data.map((country) => ({
          id: country.id,
          name: country.name,
          state: country.state,
        })),
    }
  );

  const { t } = useTranslation("common");

  return (
    <section className="log-in-section section-b-space">
      <Container className="w-100">
        <Row>
          <Col xl={7} className="mx-auto">
            <div className="log-in-box">
              <div className="log-in-title text-center">
                <Image
                  className="for-white"
                  src={
                    state?.setDarkLogo?.original_url
                      ? state?.setDarkLogo?.original_url
                      : "/assets/images/logo.png"
                  }
                  alt="Light Logo"
                  width={140}
                  height={28}
                  priority
                />
                <h4>{t("SetupYourStoreInformation")}</h4>
              </div>
              <div className="input-box">
                <Formik
                  initialValues={RegistrationInitialValues}
                  validationSchema={YupObject({
                    ...RegistrationValidationSchema,
                  })}
                  onSubmit={async (values, { setSubmitting }) => {
                    try {
                      // Show loading toast
                      ToastNotification("info", "Submitting registration...");

                      // Find country and state names from IDs
                      const selectedCountry = data?.find(
                        (c) => Number(c.id) === Number(values.country_id)
                      );
                      const selectedState = selectedCountry?.state?.find(
                        (s) => Number(s.id) === Number(values.state_id)
                      );

                      // Validate country and state selection
                      if (!selectedCountry) {
                        ToastNotification(
                          "error",
                          "Please select a valid country"
                        );
                        setSubmitting(false);
                        return;
                      }

                      if (!selectedState) {
                        ToastNotification(
                          "error",
                          "Please select a valid state"
                        );
                        setSubmitting(false);
                        return;
                      }

                      // Prepare data with country and state names instead of IDs
                      const registrationData = {
                        name: values.name,
                        email: values.email,
                        password: values.password,
                        password_confirmation: values.password_confirmation,
                        store_name: values.store_name,
                        store_description: values.description,
                        country: selectedCountry?.name || "",
                        state: selectedState?.name || "",
                        city: values.city,
                        address: values.address,
                        zip: values.pincode,
                        phone: values.phone,
                        country_code: values.country_code,
                        status: 1,
                      };

                      console.log("Registration data:", registrationData);

                      const response = await request({
                        url: "/auth/signup",
                        method: "POST",
                        data: registrationData,
                      });

                      console.log("Registration successful:", response);

                      // Show success message
                      ToastNotification(
                        "success",
                        response?.data?.message ||
                          "Registration successful! Redirecting to login..."
                      );

                      // Redirect after a short delay
                      setTimeout(() => {
                        router.push("/auth/login");
                      }, 1500);
                    } catch (error) {
                      console.error("Registration error:", error);

                      // Handle different types of errors
                      if (error?.response?.data?.message) {
                        // API returned a specific error message
                        ToastNotification("error", error.response.data.message);
                      } else if (error?.response?.data?.errors) {
                        // Validation errors from API
                        const errors = error.response.data.errors;
                        const firstError = Object.values(errors)[0];
                        ToastNotification(
                          "error",
                          Array.isArray(firstError) ? firstError[0] : firstError
                        );
                      } else if (error?.message) {
                        // Generic error message
                        ToastNotification("error", error.message);
                      } else {
                        // Fallback error
                        ToastNotification(
                          "error",
                          "Registration failed. Please check your information and try again."
                        );
                      }
                    } finally {
                      setSubmitting(false);
                    }
                  }}
                >
                  {({
                    values,
                    errors,
                    handleChange,
                    setFieldValue,
                    isSubmitting,
                  }) => {
                    return (
                      <Form className="row g-4">
                        <Col sm="6">
                          <Field
                            name="name"
                            type="text"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            className="form-control"
                            id="name"
                            placeholder="Name"
                            label="Name"
                          />
                        </Col>
                        <Col sm="6">
                          <Field
                            name="email"
                            type="email"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            className="form-control"
                            id="email"
                            placeholder="Email"
                            label="Email"
                          />
                        </Col>
                        <Col sm="6">
                          <Field
                            name="password"
                            type="password"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            className="form-control"
                            id="password"
                            placeholder="Password"
                            label="Password"
                          />
                        </Col>
                        <Col sm="6">
                          <Field
                            name="password_confirmation"
                            type="password"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            className="form-control"
                            id="password_confirmation"
                            placeholder="Confirm Password"
                            label="ConfirmPassword"
                          />
                        </Col>
                        <Col sm="6">
                          <Field
                            name="store_name"
                            type="text"
                            component={ReactstrapInput}
                            inputprops={{ noExtraSpace: true }}
                            className="form-control"
                            id="store_name"
                            placeholder="Store Name"
                            label="StoreName"
                          />
                        </Col>
                        <Col sm="6">
                          <Field
                            name="description"
                            type="textarea"
                            component={ReactstrapInput}
                            inputprops={{ noExtraSpace: true }}
                            className="form-control"
                            id="description"
                            placeholder="Store Description"
                            label="StoreDescription"
                          />
                        </Col>
                        <Col sm="4">
                          <SearchableSelectInput
                            nameList={[
                              {
                                formfloat: "true",
                                notitle: "true",
                                name: "country_id",
                                floatlabel: "Country",
                                require: "true",
                                inputprops: {
                                  name: "country_id",
                                  id: "country_id",
                                  options: data,
                                  defaultOption: "Select state",
                                },
                                disabled: values?.["country_id"] ? false : true,
                              },
                            ]}
                          />
                        </Col>
                        <Col sm="4">
                          <div className="form-floating theme-form-floating log-in-form">
                            <SearchableSelectInput
                              nameList={[
                                {
                                  floatlabel: "State",
                                  formfloat: "true",
                                  name: "state_id",
                                  notitle: "true",
                                  require: "true",
                                  inputprops: {
                                    name: "state_id",
                                    id: "state_id",
                                    options: values?.["country_id"]
                                      ? data?.filter(
                                          (country) =>
                                            Number(country.id) ===
                                            Number(values?.["country_id"])
                                        )?.[0]?.["state"]
                                      : [],
                                    defaultOption: "Select state",
                                  },
                                  disabled: values?.["country_id"]
                                    ? false
                                    : true,
                                },
                              ]}
                            />
                          </div>
                        </Col>
                        <Col sm="4" xs="6">
                          <Field
                            name="city"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            type="text"
                            className="form-control"
                            id="city"
                            placeholder="City"
                            label="City"
                          />
                        </Col>
                        <Col xs="12">
                          <Field
                            name="address"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            type="textarea"
                            className="form-control"
                            id="address"
                            placeholder="Address"
                            label="Address"
                          />
                        </Col>
                        <Col sm="6">
                          <Field
                            name="pincode"
                            inputprops={{ noExtraSpace: true }}
                            component={ReactstrapInput}
                            type="text"
                            className="form-control"
                            id="pincode"
                            placeholder="Pincode"
                            label="Pincode"
                          />
                        </Col>
                        {/* <UserAddress values={values} /> */}
                        <Col sm="6">
                          <div className="country-input form-floating">
                            <SimpleInputField
                              nameList={[
                                {
                                  name: "phone",
                                  type: "number",
                                  placeholder: "EnterPhoneNumber",
                                  require: "true",
                                  nolabel: "true",
                                },
                              ]}
                            />
                            <SearchableSelectInput
                              nameList={[
                                {
                                  name: "country_code",
                                  notitle: "true",
                                  inputprops: {
                                    name: "country_code",
                                    id: "country_code",
                                    options: AllCountryCode,
                                  },
                                },
                              ]}
                            />
                          </div>
                        </Col>
                        {/* <UserContact /> */}
                        <Col xs={12}>
                          <Btn
                            title={isSubmitting ? "Submitting..." : "Submit"}
                            className="btn-lg btn-theme justify-content-center w-100"
                            type="submit"
                            color="false"
                            disabled={isSubmitting}
                          />
                          <div className="sign-up-box">
                            <h4>{t("Alreadyhaveanaccount?")}?</h4>
                            <Link href={`/auth/login`}>{t("Login")}</Link>
                          </div>
                        </Col>
                      </Form>
                    );
                  }}
                </Formik>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};
export default VendorRegister;
