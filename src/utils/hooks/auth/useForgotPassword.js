import request from "@/utils/axiosUtils"; // 1. Import request utility
import { forgotPassword } from "@/utils/axiosUtils/API";
import { emailSchema, YupObject } from "../../validation/ValidationSchemas";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation"; // 2. Import useRouter
import { ToastNotification } from "@/utils/customFunctions/ToastNotification"; // 3. Import ToastNotification

export const ForgotPasswordSchema = YupObject({ email: emailSchema });

const useHandleForgotPassword = (setShowBoxMessage) => {
  const router = useRouter();

  return useMutation({
    // 4. Update mutationFn to make the actual API call
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
    // 5. Update onSuccess to use the API's response message
    onSuccess: (response) => {
      if (response?.data?.success) {
        setShowBoxMessage({
          type: "success",
          message: response.data.message || "OTP sent to your email!",
        });
      } else {
        setShowBoxMessage({
          type: "error",
          message: response?.data?.message || "Failed to send OTP",
        });
      }
    },
    // 6. Update onError to show a detailed error message
    onError: (error) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to send password reset OTP";
      setShowBoxMessage({ type: "error", message: errorMessage });
      ToastNotification("error", errorMessage);
    },
  });
};

export default useHandleForgotPassword;
