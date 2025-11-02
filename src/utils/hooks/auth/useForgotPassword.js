import { forgotPassword } from "@/utils/axiosUtils/API";
import { emailSchema, YupObject } from "../../validation/ValidationSchemas";
import { useMutation } from "@tanstack/react-query";

export const ForgotPasswordSchema = YupObject({ email: emailSchema });

const useHandleForgotPassword = (setShowBoxMessage) => {
    return useMutation({
      mutationFn: forgotPassword,
      onSuccess: () => {
        setShowBoxMessage({ type: "success", message: "OTP sent!" });
      },
      onError: (error) => {
        setShowBoxMessage({ type: "error", message: error.message });
      },
    });
};

export default useHandleForgotPassword;