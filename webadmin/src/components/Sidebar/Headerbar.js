import React, { useMemo } from "react";
import { MenuOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "@reach/router";
import { Layout, Dropdown, Menu } from "antd";
const { Header } = Layout;

export default function Headerbar({
  collapsed,
  setcollapsed,
  isOnMobile,
  logOut,
}) {
  const menu = useMemo(
    () => (
      <Menu
        theme={{ white: "white" }}
        className="mt-5 pt-4 pb-3 shadow"
        style={{ minWidth: 150 }}
      >
        <Menu.Item
          className="flex items-center content-center pl-6 py-0 hover:bg-white"
          key="0"
        >
          <div className="account-logo mr-4">
            <span className="font-medium text-xs ">H</span>
          </div>
          <div className="flex flex-col justify-around">
            <p className="text-sm text-secondary mb-0 no-trailing">Admin</p>
            {/* <p className="text-xs text-grey-darker mb-0 leading-tight">
              admin
            </p> */}
          </div>
        </Menu.Item>
        <Menu.Divider className="mx-6 mt-4" />

        <Menu.Item className="pl-6 hover:grey-lighter py-1 " key="2">
          <Link to="/new-product">
            <span>New </span>
          </Link>
        </Menu.Item>
        <Menu.Divider className="mx-6" />
        <Menu.Item
          className="pl-6 py-1 hover:grey-lighter"
          key="3"
          onClick={() => logOut()}
        >
          Log out
        </Menu.Item>
      </Menu>
    ),
    [] // eslint-disable-line
  );
  return (
    <Header
      className="site-layout-background flex justify-between"
      style={{
        padding: 0,
        height: 56,
        paddingLeft: "1rem",
        paddingRight: "1rem",
      }}
    >
      <div className="flex items-center">
        <button
          style={{ outline: "none" }}
          className="mr-5 "
          onClick={() => setcollapsed(!collapsed)}
        >
          <MenuOutlined className="trigger" />
        </button>
      </div>

      <div className="flex items-center">
        {/* <Button
          icon={<PlusOutlined />}
          type="primary"
          className="mr-5"
          onClick={() => navigate("/new-product")}
        >
          New Product
        </Button> */}
        <Dropdown overlay={menu} placement="bottomRight">
          <div className="account-logo">
            <span className="font-medium text-xs">A</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
}
