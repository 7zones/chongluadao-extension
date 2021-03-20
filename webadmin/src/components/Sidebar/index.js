import React, { useState, useEffect } from "react";
import "./index.scss";
import { Location } from "@reach/router";
import { Drawer } from "antd";
import SiderMenu from "./SiderMenu";

export default function Sidebar({ isOnMobile, collapsed, setcollapsed }) {
  useEffect(() => {
    if (isOnMobile === true) {
      if (setcollapsed) {
        setcollapsed(true);
      }
    }
  }, [isOnMobile]);
  return (
    <Location>
      {({ location: { pathname } }) =>
        isOnMobile ? (
          <Drawer
            visible={!collapsed}
            placement="left"
            onClose={() => setcollapsed && setcollapsed(true)}
            style={{
              padding: 0,
              height: "100vh",
              top: 57,
            }}
            closable={false}
            bodyStyle={{ height: "100vh", padding: 0 }}
            width="200"
          >
            <SiderMenu
              collapsed={isOnMobile ? false : collapsed}
              pathname={pathname}
            />
          </Drawer>
        ) : (
          <SiderMenu collapsed={collapsed} pathname={pathname} />
        )
      }
    </Location>
  );
}
