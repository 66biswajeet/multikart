import axios from "axios";
import getCookie from "../customFunctions/GetCookie";
import Cookies from "js-cookie";

const client = axios.create({
  baseURL: process.env.API_PROD_URL || "/api",
  headers: {
    Accept: "application/json",
  },
});

const request = async ({ ...options }, router) => {
  // client.defaults.headers.common.Authorization = `Bearer ${getCookie("uat")}`;
  const token = getCookie("uat");
  if (token) {
    // Add the token to this specific request's options
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // If data is FormData, set proper content type
  if (options.data instanceof FormData) {
    options.headers = {
      ...options.headers,
      "Content-Type": "multipart/form-data",
    };
  }

  const onSuccess = (response) => response;
  const onError = (error) => {
    if (error?.response?.status == 401) {
      Cookies.remove("uat");
      Cookies.remove("ue");
      Cookies.remove("account");
      localStorage.clear();
      router && router.push("/auth/login");
    }
    return error;
  };
  try {
    const response = await client(options);
    return onSuccess(response);
  } catch (error) {
    return onError(error);
  }
};

export default request;
