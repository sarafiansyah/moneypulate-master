import { HomeOutlined, UserOutlined, SettingOutlined } from "@ant-design/icons";
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
        icon: <UserOutlined />,
        label: "Profile",
        path: "/profile",
    },
    {
        key: "3",
        icon: <SettingOutlined />,
        label: "Settings",
        path: "/settings",
    },
];
