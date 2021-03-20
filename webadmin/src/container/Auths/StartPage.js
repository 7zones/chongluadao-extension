import React from "react";
import { connect } from "react-redux";
import { Redirect } from "@reach/router";
import { makeSelectIsLogin } from "./selectors";
import { createStructuredSelector } from "reselect";
import { useInjectSaga } from "../../utils/injectSaga";
import saga from "./saga";

const key = "auth";

const StartPage = ({ isLogin, children }) => {
  useInjectSaga({ key: key, saga });

  if (isLogin) {
    return <Redirect to="/" noThrow />;
  }

  return children;
};

const mapStateToProps = createStructuredSelector({
  isLogin: makeSelectIsLogin()
});

const StartPageWithConnect = connect(mapStateToProps)(StartPage);

export default StartPageWithConnect;
