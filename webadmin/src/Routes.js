import React from "react";
import { Router as ReachRouter } from "@reach/router";

import NotFoundPage from "./container/NotFoundPage";
// import Dashboard from "./container/Dashboard";
import BlackList from "./container/BlackList";
import WhiteList from "./container/WhiteList";
import Auths from "./container/Auths";
import Login from "./container/Auths/Login";
import Reporting from "./container/Reporting";

const ScrollToTop = ({ children, location }) => {
  React.useEffect(() => window.scrollTo(0, 0), [location.pathname]);
  return children;
};
export default function Router() {
  return (
    <ReachRouter primary={false}>
      <ScrollToTop path="/">
        <Login path="/login" />
        <Auths path="/">
          <WhiteList path="/" />
          <BlackList path="/black-list" />
          <Reporting path="/reporting" />

          <NotFoundPage path="*" />
        </Auths>

        <NotFoundPage path="*" />
      </ScrollToTop>
    </ReachRouter>
  );
}
