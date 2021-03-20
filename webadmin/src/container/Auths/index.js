import React, { useEffect, useState, Suspense } from "react";
import { connect } from "react-redux";
import { Redirect } from "@reach/router";
import { makeSelectIsLogin, makeSelectUser } from "./selectors";
import { createStructuredSelector } from "reselect";
import { useInjectSaga } from "../../utils/injectSaga";
import { useInjectReducer } from "../../utils/injectReducer";
import useMedia from "../../hooks/useMedia";
import { fetchUser, logOut } from "./actions";
import saga from "./saga";
import reducer from "./reducer";
import Sidebar from "../../components/Sidebar";
import Headerbar from "../../components/Sidebar/Headerbar";
import { Layout } from "antd";

const { Content } = Layout;
const key = "auth";

const StartPage = ({ isLogin, currentUser, fetchUser, logOut, children }) => {
  const [collapsed, setcollapsed] = useState(false);

  const isOnMobile = useMedia("lg");
  useInjectSaga({ key: key, saga });
  useInjectReducer({ key: key, reducer });
  useEffect(() => {
    if (!isLogin) {
      return;
    }
    if (currentUser === null) {
      fetchUser();
    }
    //eslint-disable-next-line
  }, [currentUser, isLogin]);

  // if (!isLogin) {
  //   return <Redirect to="/login" noThrow />;
  // }

  return (
    <Layout className="h-screen site-layout">
      <Layout>
        <Sidebar
          isOnMobile={isOnMobile}
          collapsed={collapsed}
          setcollapsed={setcollapsed}
        />
        <div className="w-full">
          <Headerbar
            isOnMobile={isOnMobile}
            collapsed={collapsed}
            setcollapsed={setcollapsed}
            logOut={logOut}
          />
          <Suspense fallback={<div />}>
            <Content className="px-4 pb-6">{children}</Content>
          </Suspense>
        </div>
      </Layout>
    </Layout>
  );
};

const mapStateToProps = createStructuredSelector({
  isLogin: makeSelectIsLogin(),
  currentUser: makeSelectUser(),
});

const mapDispatchToProps = (dispatch) => {
  return {
    fetchUser: () => dispatch(fetchUser()),
    logOut: () => dispatch(logOut()),
  };
};

const StartPageWithConnect = connect(
  mapStateToProps,
  mapDispatchToProps
)(StartPage);

export default StartPageWithConnect;
