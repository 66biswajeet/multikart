import request from "@/utils/axiosUtils";
import { forgotPassword } from "@/utils/axiosUtils/API";
import { emailSchema, YupObject } from "../../validation/ValidationSchemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ToastNotification } from "@/utils/customFunctions/ToastNotification";

export const ForgotPasswordSchema = YupObject({ email: emailSchema });

const useHandleForgotPassword = (setShowBoxMessage) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data) => {
      const response = await request(
        {
          url: forgotPassword,
          method: "POST",
          data: { email: data.email },
        },
        router
      );
      return response;
    },
    onSuccess: (response) => {
      // FIX: Set message as a STRING
      if (response?.data?.success) {
        setShowBoxMessage(response.data.message || "OTP sent to your email!");
      } else {
        setShowBoxMessage(response?.data?.message || "Failed to send OTP");
      }
    },
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send password reset OTP";
      // FIX: Set message as a STRING
      setShowBoxMessage(errorMessage);
      ToastNotification("error", errorMessage);
    },
  });
};

export default useHandleForgotPassword;
