import React, { useState, useEffect } from "react";
import { Redirect } from "@reach/router";
import { createStructuredSelector } from "reselect";
import { connect } from "react-redux";
import { useInjectSaga } from "../../../utils/injectSaga";
import { useInjectReducer } from "../../../utils/injectReducer";
import { makeSelectIsLogin, makeSelectError } from "../selectors";
import { logIn, setError } from "../actions";
import saga from "../saga";
import reducer from "../reducer";
import { Button, Input } from "../../../components/Form";

const key = "auth";

function LogIn({ isLogin, logIn, error, setError }) {
  useInjectSaga({ key, saga });
  useInjectReducer({ key, reducer });

  useEffect(() => {
    return () => {
      setError(null);
    };
  }, [setError]);

  if (isLogin) {
    return <Redirect to="/" noThrow />;
  }

  const onLogin = (values) => {
    logIn({
      password: values.password,
      username: values.username.toLowerCase(),
    });
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center p-4"
      style={{ backgroundColor: "#e5e5e5" }}
    >
      <div
        className="shadow-md rounded sm:p-12 p-6 w-full max-w-md"
        style={{ backgroundColor: "white" }}
      >
        <div className="py-4">
          <div
            className="font-bold text-center primary-color sm:text-6xl text-5xl "
            style={{
              letterSpacing: -5,
              lineHeight: 1,
            }}
          >
            chongluadao
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin({
              username: e.target[0].value,
              password: e.target[1].value,
            });
          }}
        >
          <div>
            <Input
              placeholder="Email"
              type="email"
              className="w-full"
              required
            />
          </div>
          <div>
            <Input
              placeholder="Password"
              type="password"
              className="w-full"
              required
            />
          </div>
          <Button type="submit" className="btn-primary w-full mt-4">
            Đăng Nhập
          </Button>
        </form>

        <p className="text-center text-red text-xs mt-8 -mb-4">
          &copy;2020 chongluadao.vn - All rights reserved.
        </p>
      </div>
    </div>
  );
}

const mapStateToProps = createStructuredSelector({
  isLogin: makeSelectIsLogin(),
  error: makeSelectError(),
});

const mapDispatchToProps = (dispatch) => {
  return {
    logIn: (data) => dispatch(logIn(data)),
    setError: (data) => dispatch(setError(data)),
  };
};

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default withConnect(LogIn);
