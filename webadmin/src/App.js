import React from "react";
import { Provider } from "react-redux";
import configureStore from "./configureStore";

import Routes from "./Routes";

import "./index.css"; //Tailwind
import "./tailwind.css";
import "antd/dist/antd.css";
import "./static/styles/index.scss"; //slider

const initialState = {};
export const store = configureStore(initialState);

function App() {
  return (
    <Provider store={store}>
      <Routes />
    </Provider>
  );
}

export default App;
