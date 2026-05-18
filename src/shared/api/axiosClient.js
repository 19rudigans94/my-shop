import axios from "axios";

const defaultTimeout = Number(process.env.NEXT_PUBLIC_AXIOS_TIMEOUT ?? "10000");

const axiosClient = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.API_BASE_URL ??
    "http://localhost:3000/api",
  timeout: defaultTimeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

axiosClient.interceptors.request.use(
  (requestConfiguration) => requestConfiguration,
  (requestError) => Promise.reject(requestError)
);

axiosClient.interceptors.response.use(
  (responseObject) => responseObject,
  (responseError) => {
    if (responseError.response) {
      console.error("Axios response error", {
        status: responseError.response.status,
        data: responseError.response.data,
      });
    } else {
      console.error("Axios network error", responseError.message);
    }

    return Promise.reject(responseError);
  }
);

export default axiosClient;
