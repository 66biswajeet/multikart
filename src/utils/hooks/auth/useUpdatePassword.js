import { useRouter } from "next/navigation";
import { useCookies } from "react-cookie";
import request from "../../axiosUtils";
import { updatePassword } from "../../axiosUtils/API";
import { ToastNotification } from "../../customFunctions/ToastNotification";
import {
  passwordConfirmationSchema,
  passwordSchema,
  YupObject,
} from "../../validation/ValidationSchemas";
import useCustomMutation from "../useCustomMutation";

export const UpdatePasswordSchema = YupObject({
  password: passwordSchema,
  password_confirmation: passwordConfirmationSchema,
});

const useUpdatePassword = () => {
  const [cookies, setCookie, removeCookie] = useCookies(["uo", "ue"]);
  const router = useRouter();

  return useCustomMutation(
    (data) =>
      request(
        {
          url: updatePassword,
          method: "post",
          data: {
            ...data,
            token: cookies.uo, // This is the JWT reset token
            email: cookies.ue,
          },
        },
        router
      ),
    {
      onSuccess: (resData) => {
        // 1. Check if the API confirmed success
        if (resData?.data?.success) {
          // Clear cookies
          removeCookie("uo", { path: "/" });
          removeCookie("ue", { path: "/" });

          // Show success message and redirect
          ToastNotification(
            "success",
            resData.data.message ||
              "Your password has been changed successfully. Use your new password to log in."
          );
          router.push("/auth/login");
        } else {
          // 2. Show an error if the API failed (e.g., token expired just now)
          ToastNotification(
            "error",
            resData?.data?.message || "Failed to update password"
          );
        }
      },
      // 3. Add onError for server/network failures
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to update password";
        ToastNotification("error", errorMessage);
      },
    }
  );
};

export default useUpdatePassword;
