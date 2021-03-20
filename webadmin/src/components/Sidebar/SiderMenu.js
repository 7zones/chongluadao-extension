import React from "react";
import { Link } from "@reach/router";
import styled from "styled-components";
import { Layout, Menu } from "antd";
import {
  GiftOutlined,
  FireOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import Icon from "../Icons";

const navItems = [
  // {
  //   icon: <DashboardOutlined />,
  //   title: "Dashboard",
  //   to: "/",
  // },
  {
    icon: <DashboardOutlined />,
    title: "White List",
    to: "/",
  },
  {
    icon: <GiftOutlined />,
    title: "Black List",
    to: "/black-list",
  },
  {
    icon: <FireOutlined />,
    title: "Reporting",
    to: "/reporting",
  },
];

const { Sider } = Layout;

const StyledMenu = styled(Menu)`
  .ant-menu-item-selected {
    background-color: white !important;
    border-radius: 4px;

    &:after {
      display: none;
    }
  }

  .ant-menu-item {
    padding: 0 !important;
    height: ${(props) => (props.collapsed ? "42px" : "36px")};
    line-height: ${(props) => (props.collapsed ? "42px" : "36px")};
  }

  > .ant-menu-item {
    > a {
      padding-left: ${(props) => (props.collapsed ? "16px" : "10px")};
      color: white;
    }
  }

  .ant-menu-item-active {
    border-radius: 4px;
  }

  .ant-menu-item-active > a,
  .ant-menu-item-selected > a {
    background-color: white;
    color: #1ad598;
  }
`;
// transition: all 0.3s;

export default function SiderMenu({ collapsed, pathname }) {
  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme="light"
      className="sidebar-layout"
      collapsedWidth={56}
    >
      {!collapsed ? (
        <div
          id="logo"
          className="logo m-auto mx-0"
          style={{ height: 50, paddingTop: 12 }}
        >
          <Link to="/">
            <div className="font-bold text-center text-white sm:text-2xl text-xl ">
              Chongluadao
            </div>
          </Link>
        </div>
      ) : null}

      <div className={`flex justify-center ${!collapsed ? "py-6" : ""}`}>
        <Icon
          width={!collapsed ? "8rem" : "4rem"}
          height={!collapsed ? "8rem" : "4rem"}
          type="avatar"
        />
      </div>
      {!collapsed ? (
        <div className="text-white text-center">
          <div className="font-bold">Hello Hung</div>
          <div className="text-xs">Check your last action</div>
        </div>
      ) : null}

      <StyledMenu
        theme="light"
        mode="inline"
        defaultSelectedKeys={["/"]}
        selectedKeys={[pathname]}
        className="bg-primary"
      >
        {navItems.map(({ icon, title, to }) => (
          <StyledMenu.Item key={to} className="custom-anticon">
            <Link to={to}>
              {icon}
              <span>{title}</span>
            </Link>
          </StyledMenu.Item>
        ))}
      </StyledMenu>
    </Sider>
  );
}
