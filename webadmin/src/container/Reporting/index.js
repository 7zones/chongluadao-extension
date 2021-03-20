import React, { useEffect, useState } from "react";
import {
  Button,
  Descriptions,
  Drawer,
  message,
  Skeleton,
  Table,
  Tag,
  Input,
  Tooltip,
  Badge,
  Popconfirm,
  Select,
} from "antd";
import loGet from "lodash/get";
import NProgress from "nprogress";
import moment from "moment";
import { coreAPI } from "../../utils/request";
import PageHeader from "../../components/PageHeader";
import {
  EyeOutlined,
  EditOutlined,
  PlusOutlined,
  CloudDownloadOutlined,
} from "@ant-design/icons";

import Axios from "axios";
const { Option } = Select;

const { Search } = Input;

export default function Reporting() {
  const [datas, setdatas] = useState(null);
  const [filter, setFilter] = useState("");
  const [visible, setVisible] = useState(false);
  const [orderDetail, setOrderDetail] = useState("");
  const [selectedRowdatas, setselectedRowdatas] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    NProgress.start();
    try {
      const { data } = await coreAPI.get(`/admin`);
      setdatas(data);
    } catch (error) {
      console.error(loGet(error, "response.data.message"));
      console.log(error);
    }
    NProgress.done();
  };

  const columns = [
    {
      title: "ID",
      key: "count",
      dataIndex: "count",
      width: "5%",
    },
    {
      title: "Account",
      dataIndex: "account",
      key: "account",
      width: "20%",
      render: (text) => text?.name,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: "20%",
      render: (text) => <div style={{ wordBreak: "break-word" }}>{text}</div>,
    },
    {
      title: "Date",
      dataIndex: "createAt",
      key: "date",
      render: (text) => moment(text).format("HH:mm, DD MMM YYYY"),
      width: "20%",
    },
  ];

  let dataCource = [];
  if (datas !== null) {
    dataCource = datas
      .map((m, index) => {
        return { ...m, key: m?.id };
      })
      .filter((f) => {
        const filterName = String(f?.account?.name || "").toLowerCase();

        return filterName.includes(filter.toLowerCase());
      })
      .map((m, index) => {
        return { ...m, count: index + 1 };
      });
  }

  return (
    <div>
      <PageHeader
        title="DASHBOARD"
        extra={
          // <Search
          //   placeholder="Filter"
          //   onChange={(event) => setFilter(event.target.value)}
          // />
          <Select
            defaultValue="All"
            style={{ width: 120 }}
            onChange={(value) => {
              if (value === "All") {
                setFilter("");
              } else {
                setFilter(value);
              }
            }}
          >
            <Option value="All">All</Option>
          </Select>
        }
      ></PageHeader>
      {datas === null ? (
        <Skeleton size="large" width={600} active />
      ) : (
        <Table
          columns={columns}
          dataSource={dataCource}
          scroll={{ x: "100%" }}
        />
      )}
    </div>
  );
}
