"use client";
import { ReactstrapInput } from "@/components/reactstrapFormik";
import ShowBox from "@/elements/alerts&Modals/ShowBox";
import Btn from "@/elements/buttons/Btn";
import SettingContext from "@/helper/settingContext";
import LoginBoxWrapper from "@/utils/hoc/LoginBoxWrapper";
import {
  YupObject,
  emailSchema,
  nameSchema,
} from "@/utils/validation/ValidationSchemas";
import { ErrorMessage, Field, Form, Formik } from "formik";
import Image from "next/image";
import Link from "next/link";
import { useContext, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslation } from "react-i18next";
import { Col } from "reactstrap";
import { useRouter } from "next/navigation";
import request from "@/utils/axiosUtils";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";
import { setAuthData } from "@/utils/auth";

const Login = () => {
  const [showBoxMessage, setShowBoxMessage] = useState();
  const { settingObj, state } = useContext(SettingContext);
  const { t } = useTranslation("common");
  const reCaptchaRef = useRef();
  const router = useRouter();

  return (
    <div className="box-wrapper">
      <ShowBox showBoxMessage={showBoxMessage} />
      <LoginBoxWrapper>
        <div className="log-in-title text-center">
          {/* <Image
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
          /> */}
          <h4>{t("LogInYourAccount")}</h4>
        </div>
        <div className="input-box">
          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={YupObject({
              email: emailSchema,
              password: nameSchema,
              // recaptcha: settingObj?.google_reCaptcha?.status ? recaptchaSchema : "",
            })}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                setSubmitting(true);

                // Prepare login data
                const loginData = {
                  email: values.email,
                  password: values.password,
                };

                console.log("Login data:", loginData);

                // Make API call
                const response = await request({
                  url: "/auth/signin",
                  method: "POST",
                  data: loginData,
                });

                console.log("Full response:", response);

                if (response?.data?.success) {
                  console.log("Login successful:", response);

                  // Store authentication data from API response structure
                  const token = response?.data?.data?.token;
                  const user = response?.data?.data?.user;

                  if (token && user) {
                    console.log("Storing auth data:", { token, user });
                    setAuthData(token, user);

                    // Immediate redirect
                    console.log("Redirecting to dashboard");
                    router.push("/dashboard");
                  } else {
                    console.error("Token or user data missing:", {
                      token,
                      user,
                    });
                    alert(
                      "Login successful but missing authentication data. Please try again."
                    );
                  }
                } else {
                  // Show error message from response
                  const errorMessage =
                    response?.data?.message ||
                    "Login failed. Please try again.";
                  alert(errorMessage);
                }
              } catch (error) {
                console.error("Login error:", error);

                // Handle different types of errors
                let errorMessage =
                  "Login failed. Please check your credentials and try again.";

                if (error?.response?.data?.message) {
                  errorMessage = error.response.data.message;
                } else if (error?.response?.status === 401) {
                  errorMessage = "Invalid email or password. Please try again.";
                } else if (error?.response?.status === 422) {
                  const errors = error.response.data.errors;
                  const firstError = Object.values(errors)[0];
                  errorMessage = Array.isArray(firstError)
                    ? firstError[0]
                    : firstError;
                } else if (error?.message) {
                  errorMessage = error.message;
                }

                alert(errorMessage);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ errors, touched, setFieldValue, isSubmitting }) => (
              <Form className="row g-4">
                <Col sm="12">
                  <Field
                    inputprops={{ noExtraSpace: true }}
                    autoComplete={true}
                    name="email"
                    type="email"
                    component={ReactstrapInput}
                    className="form-control"
                    id="email"
                    placeholder="Email Address"
                    label="EmailAddress"
                  />
                </Col>
                <Col sm="12">
                  <Field
                    inputprops={{ noExtraSpace: true }}
                    name="password"
                    component={ReactstrapInput}
                    type="password"
                    className="form-control"
                    id="password"
                    placeholder="Password"
                    label="Password"
                  />
                </Col>
                {settingObj?.google_reCaptcha?.status && (
                  <Col sm="12">
                    <ReCAPTCHA
                      ref={reCaptchaRef}
                      sitekey={settingObj?.google_reCaptcha?.site_key}
                      onChange={(value) => {
                        setFieldValue("recaptcha", value);
                      }}
                    />
                    {errors.recaptcha && touched.recaptcha && (
                      <ErrorMessage
                        name="recaptcha"
                        render={(msg) => (
                          <div className="invalid-feedback d-block">
                            {errors.recaptcha}
                          </div>
                        )}
                      />
                    )}
                  </Col>
                )}
                <Col sm="12">
                  <div className="forgot-box">
                    <Link
                      href={`/auth/forgot-password`}
                      className="forgot-password"
                    >
                      {t("ForgotPassword")}?
                    </Link>
                  </div>
                </Col>
                <Col sm="12">
                  <Btn
                    title={isSubmitting ? "Logging in..." : "Login"}
                    className="btn btn-animation w-100 justify-content-center"
                    type="submit"
                    color="false"
                    disabled={isSubmitting}
                  />
                  <div className="sign-up-box">
                    <h4>{"Don't Have Seller Account?"}</h4>
                    <Link href={`/auth/register`}>{"Sign Up"}</Link>
                  </div>
                </Col>
              </Form>
            )}
          </Formik>
        </div>
      </LoginBoxWrapper>
    </div>
  );
};

export default Login;
