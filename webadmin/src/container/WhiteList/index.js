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
  LoginOutlined,
  EditOutlined,
  PlusOutlined,
  CloudDownloadOutlined,
  StarOutlined,
} from "@ant-design/icons";

import Axios from "axios";
import Icon from "../../components/Icons";
const { Option } = Select;

const { Search } = Input;

export default function WhiteList() {
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
      // const { data } = await coreAPI.get(`/admin`);
      let data = [
        {
          _id: "601fa59f06aaae4ef90aac62",
          url: "https://www.youtube.com/",
          meta: {},
        },
        {
          _id: "601fa59f06aaae4ef90aac63",
          url: "http://www.dailymotion.com/",
          meta: {},
        },
        {
          _id: "601fa59f06aaae4ef90aac64",
          url: "http://tvnet.gov.vn/*",
          meta: {},
        },
        {
          _id: "601fa59f06aaae4ef90aac65",
          url: "https://www.galaxycine.vn/*",
          meta: {},
        },
        {
          _id: "601fa59f06aaae4ef90aac66",
          url: "http://www.123phim.vn/*",
          meta: {},
        },
        {
          _id: "601fa59f06aaae4ef90aac67",
          url: "http://www.cgv.vn/*",
          meta: {},
        },
        {
          _id: "601fa59f06aaae4ef90aac68",
          url: "http://cinebox.vn/*",
          meta: {},
        },
        {
          _id: "601fb9de06aaae4ef90aac69",
          url: "https://www.pacificairlines.com/*",
          meta: {},
        },
      ];

      setdatas(data);
    } catch (error) {
      console.error(loGet(error, "response.data.message"));
      console.log(error);
    }
    NProgress.done();
  };
  const rate = (num) => (
    <div className="flex flex-row">
      <span className="m-auto text-lg font-bold" style={{ color: "#F9B959" }}>
        {num}
      </span>
      <span
        className="rounded-md w-8 h-8 flex justify-center items-center mx-2"
        style={{ backgroundColor: "#F9B959" }}
      >
        <StarOutlined className="text-white" />
      </span>
      <span className="m-auto">2 reports</span>
    </div>
  );

  const columns = [
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      width: "20%",
    },

    {
      title: "USER",
      dataIndex: "user",
      key: "user",
      width: "20%",
      align: "center",
      render: () => (
        <span className="flex justify-center">
          <div>
            <div className="title-rate">4.2</div>
            <div>Avg. Rating</div>
            <div>5 reports</div>
          </div>
          <div
            className="mx-8"
            style={{ width: 1, backgroundColor: "#f0f0f0" }}
          />
          <div>
            <div className="my-2">{rate(5)}</div>
            <div className="my-2">{rate(4)}</div>
            <div className="my-2">{rate(3)}</div>
            <div className="my-2">{rate(2)}</div>
            <div className="my-2">{rate(1)}</div>
          </div>
        </span>
      ),
    },
    {
      title: "MODERATOR RATING",
      key: "Action",
      width: "15%",
      align: "center",
      render: (text, record) => (
        <div className="flex justify-between flex-col">
          {/* <button class="bg-black text-white hover:text-black-300 focus:outline-none ">
            Sign up
          </button>
          <button>Back list</button>
          <button>Back list</button> */}
        </div>
      ),
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
        title="WHITE LIST"
        extra={
          <>
            <Search
              placeholder="Filter"
              onChange={(event) => setFilter(event.target.value)}
            />
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
              <Option value="All">Most List</Option>
            </Select>
          </>
        }
      ></PageHeader>
      {datas === null ? (
        <Skeleton size="large" width={600} active />
      ) : (
        <Table
          pagination={{ pageSize: 3 }}
          columns={columns}
          dataSource={dataCource}
          scroll={{ x: "100%" }}
        />
      )}
    </div>
  );
}
