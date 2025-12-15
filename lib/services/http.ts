import axios from "axios";

export const http = axios.create({
  timeout: 10000,
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("HTTP error →", err?.message);
    return Promise.reject({
      success: false,
      message: err?.response?.data?.message || "Network or server error",
      status: err?.response?.status ?? 500,
    });
  }
);
