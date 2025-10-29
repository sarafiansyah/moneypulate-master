import {
    HomeOutlined,
    UserOutlined,
    SettingOutlined,
    DollarOutlined,
    GoldOutlined,
    InfoCircleOutlined,
    ReadOutlined,
} from "@ant-design/icons";
import { AppMenuItem } from "./types";

const baseMenuItems = [
    {
        icon: <HomeOutlined />,
        label: "Home",
        path: "/home",
    },
    {
        icon: <DollarOutlined />,
        label: "Balance",
        path: "/balance",
    },
    {
        icon: <UserOutlined />,
        label: "Profile",
        path: "/profile",
    },
    {
        icon: <GoldOutlined />,
        label: "Heirlooms",
        path: "/heirlooms",
    },
    {
        icon: <ReadOutlined />,
        label: "Transactions",
        path: "/transaction-history",
    },
    {
        icon: <InfoCircleOutlined />,
        label: "About",
        path: "/about",
    },
    {
        icon: <SettingOutlined />,
        label: "Settings",
        path: "/settings",
    },
];

// Assign keys dynamically (starting from 1)
export const menuItems: AppMenuItem[] = baseMenuItems.map((item, index) => ({
    ...item,
    key: (index + 1).toString(),
}));
