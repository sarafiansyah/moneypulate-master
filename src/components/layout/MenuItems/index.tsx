import {
    HomeOutlined,
    UserOutlined,
    SettingOutlined,
    DollarOutlined,
    GoldOutlined,
    InfoCircleOutlined,
} from "@ant-design/icons";
import { AppMenuItem } from "./types";

export const menuItems: AppMenuItem[] = [
    {
        key: "1",
        icon: <HomeOutlined />,
        label: "Home",
        path: "/home",
    },
    {
        key: "2",
        icon: <DollarOutlined />,
        label: "Balance",
        path: "/balance",
    },
    {
        key: "3",
        icon: <UserOutlined />,
        label: "Profile",
        path: "/profile",
    },
    {
        key: "4",
        icon: <GoldOutlined />,
        label: "Heirlooms",
        path: "/heirlooms",
    },
    {
        key: "5",
        icon: <InfoCircleOutlined />,
        label: "About",
        path: "/about",
    },
    {
        key: "6",
        icon: <SettingOutlined />,
        label: "Settings",
        path: "/settings",
    },
];
