import axios from "axios";

const coreAPI = axios.create({
  baseURL: process.env.REACT_APP_CORE_API,
  // timeout: 9000
});

coreAPI.interceptors.response.use(
  function (response) {
    // handle global response code here
    // console.log(response.status);
    // console.log(response);
    return response.data;
  },
  function (error) {
    // do something with the error
    console.log(error);
    return Promise.reject(error);
  }
);

const token = window.localStorage.getItem("token");

function setToken(token) {
  window.localStorage.setItem("token", token);
  coreAPI.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

function removeToken() {
  window.localStorage.removeItem("token");
}

if (token) {
  setToken(token);
}

export { coreAPI, setToken, removeToken };
