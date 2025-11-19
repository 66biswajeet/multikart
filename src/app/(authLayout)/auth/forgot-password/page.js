"use client";
import { ReactstrapInput } from "@/components/reactstrapFormik";
import ShowBox from "@/elements/alerts&Modals/ShowBox";
import Btn from "@/elements/buttons/Btn";
import LoginBoxWrapper from "@/utils/hoc/LoginBoxWrapper";
import { ForgotPasswordSchema } from "@/utils/hooks/auth/useForgotPassword"; // Note: Schema is imported from the hook
import { Field, Form, Formik } from "formik";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Col } from "reactstrap";
import { useRouter } from "next/navigation"; // 1. Import useRouter
import Cookies from "js-cookie"; // 2. Import Cookies
import useHandleForgotPassword from "@/utils/hooks/auth/useForgotPassword"; // 3. Import the hook

const ForgotPassword = () => {
  const [showBoxMessage, setShowBoxMessage] = useState();
  const { t } = useTranslation("common");
  const router = useRouter(); // 4. Initialize router
  
  // 5. Initialize the mutation hook
  const { mutate: forgotPassword, isLoading } = useHandleForgotPassword(setShowBoxMessage);

  // 6. Create the new submit handler
  const handleSubmit = (values) => {
    // Store email in cookie for OTP verification page
    // 'ue' stands for 'user email' (as in the plan)
    Cookies.set('ue', values.email, { expires: 1 }); // Expires in 1 day
    
    // Call API to send OTP
    forgotPassword({ email: values.email }, {
      onSuccess: () => {
        // Redirect to OTP verification page
        router.push('/auth/otp-verification');
      }
    });
  };

  return (
    <div className="box-wrapper">
      <ShowBox showBoxMessage={showBoxMessage} />
      <LoginBoxWrapper>
        <div className="log-in-title">
          <h3>{t("welcome_to_store")}</h3>
          <h4>{t("ForgotPassword")}</h4>
        </div>
        <div className="input-box">
          <Formik
            initialValues={{
              email: "",
            }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleSubmit} // 7. Use the new handleSubmit
          >
            {/* 8. Get isSubmitting from Formik */}
            {({ isSubmitting }) => ( 
              <Form className="row g-2">
                <Col sm="12">
                  <Field 
                    name="email" 
                    component={ReactstrapInput} 
                    className="form-control" 
                    id="email" 
                    placeholder="Email Address" 
                    label="EmailAddress" 
                  />
                </Col>
                <Col sm="12">
                  <Btn 
                    title="SendEmail" 
                    className="btn btn-animation w-100 justify-content-center" 
                    type="submit" 
                    color="false" 
                    // 9. Add loading and disabled states
                    loading={Number(isLoading || isSubmitting)}
                    disabled={isLoading || isSubmitting}
                  />
                </Col>
                <Col sm="12">
                  <div className="sign-up-box">
                    <h4>{t("HaveAccount")}</h4>
                    <Link href={`/auth/login`}>{t("BackToLogin")}</Link>
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
export default ForgotPassword;