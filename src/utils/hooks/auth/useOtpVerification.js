import { useRouter } from "next/navigation";
import request from "../../axiosUtils";
import { verifyToken } from "../../axiosUtils/API";
import { ToastNotification } from "../../customFunctions/ToastNotification";
import Cookies from "js-cookie";
import useCustomMutation from "../useCustomMutation";

const useOtpVerification = (setShowBoxMessage) => {
  const router = useRouter();

  return useCustomMutation(
    (data) => {
      const email = Cookies.get("ue");

      return request(
        {
          url: verifyToken,
          method: "post",
          data: {
            token: data.token,
            email: email,
          },
        },
        router
      );
    },
    {
      onSuccess: (responseData, requestData) => {
        if (responseData?.data?.success) {
          Cookies.set("uo", responseData.data.data.token, { expires: 1 });
          router.push("/auth/update-password");
          ToastNotification(
            "success",
            responseData.data.message || "OTP verified successfully!"
          );
        } else {
          const errorMessage =
            responseData?.data?.message ||
            responseData?.response?.data?.message ||
            "Invalid OTP";
          // FIX: Set message as a STRING
          setShowBoxMessage(errorMessage);
          ToastNotification("error", errorMessage);
        }
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to verify OTP";
        // FIX: Set message as a STRING
        setShowBoxMessage(errorMessage);
        ToastNotification("error", errorMessage);
      },
    }
  );
};
export default useOtpVerification;
