"use client";

import React, { useState } from "react";
import {
    Layout,
    Menu,
    Card,
    ConfigProvider,
    Dropdown,
    Avatar,
    Typography,
    Space,
} from "antd";
import {
    UserOutlined,
    SettingOutlined,
    LogoutOutlined,
    DownOutlined,
} from "@ant-design/icons";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { menuItems } from "../MenuItems";
import { useProfileStore } from "@/store/useProfileStore";
import "antd/dist/reset.css";
import "@ant-design/v5-patch-for-react-19";

const { Header, Sider, Content, Footer } = Layout;
const { Title, Text } = Typography;

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const {
        firstName,
        lastName,
        username,
        phoneNumber,
        status,
        joinedAt,
        setProfile,
        resetProfile,
    } = useProfileStore();

    const handleLogoClick = () => {
        setCollapsed(!collapsed);
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        const selected = menuItems.find((item) => item.key === key);
        if (selected) router.push(selected.path);
    };

    // 🔥 Add this
    const currentMenu = menuItems.find((item) => item.path === pathname);
    const pageTitle = currentMenu ? currentMenu.label : "Dashboard";

    return (
        <ConfigProvider
            theme={{
                token: {
                      colorText: "#5d5d5dff", // 🌈 global text color
          colorTextHeading: "#595959ff", // headings
                    colorPrimary: "#21ba0aff",
                    fontFamily: "'Poppins', sans-serif",
                },
            }}
        >
            <Layout
                style={{
                    height: "100vh", // fixed viewport height
                    overflow: "hidden", // prevent page scroll
                    background: "#f5f5f5",
                }}
            >
                {/* Sidebar */}
                <Sider
                    collapsed={collapsed}
                    onCollapse={(value) => setCollapsed(value)}
                    theme="light"
                    style={{
                        margin: 16,
                        borderRadius: 12,
                        background: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        overflow: "hidden",
                    }}
                >
                    <div
                        style={{
                            height: 42,
                            margin: 16,
                            cursor: "pointer",
                            borderRadius: 8,
                            overflow: "hidden",
                            transition: "width 0.3s ease",
                            width: collapsed ? 45 : 160,
                        }}
                        onClick={handleLogoClick}
                    >
                        <Image
                            src={
                                collapsed
                                    ? "/assets/logo/moneypulate-icon.svg"
                                    : "/assets/logo/moneypulate-logo-01.svg"
                            }
                            alt="Logo"
                            width={collapsed ? 45 : 160}
                            height={38}
                            style={{
                                borderRadius: 8,
                                transition: "opacity 0.3s ease",
                                opacity: 1,
                            }}
                            key={collapsed ? "collapsed" : "full"}
                        />
                    </div>

                    <Menu
                        theme="light"
                        mode="inline"
                        selectedKeys={[
                            menuItems.find((item) => item.path === pathname)
                                ?.key || "",
                        ]}
                        onClick={handleMenuClick}
                        items={menuItems.map(({ key, icon, label }) => ({
                            key,
                            icon,
                            label,
                        }))}
                        style={{ borderRadius: 8 }}
                    />
                </Sider>

                {/* Main layout */}
                <Layout
                    style={{
                        margin: "16px 10px 16px 0",
                        borderRadius: 12,
                        background: "transparent",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden", // keep header/footer fixed
                    }}
                >
                    {/* Header */}
                    <div style={{ paddingBottom: 6 }}>
                        {" "}
                        <Card
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                background: "#fff",
                            }}
                            styles={{ body: { padding: "6px 16px" } }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                          
                                {/* Left: Page Title */}
                                <Title level={4} style={{ margin: 0, color:"#21ba0aff" }}>
                                    {pageTitle}
                                </Title>

                                {/* Right: Profile Dropdown */}
                                <Dropdown
                                    menu={{
                                        items: [
                                            {
                                                key: "profile",
                                                icon: <UserOutlined />,
                                                label: "Profile",
                                            },
                                            {
                                                key: "settings",
                                                icon: <SettingOutlined />,
                                                label: "Settings",
                                            },
                                            {
                                                type: "divider",
                                            },
                                            {
                                                key: "logout",
                                                icon: <LogoutOutlined />,
                                                label: "Logout",
                                            },
                                        ],
                                        onClick: ({ key }) => {
                                            if (key === "logout") {
                                                // Add your logout logic here
                                                console.log("Logging out...");
                                            } else {
                                                console.log(`Clicked ${key}`);
                                            }
                                        },
                                    }}
                                    placement="bottomRight"
                                    arrow
                                >
                                    <Space
                                        style={{
                                            cursor: "pointer",
                                            userSelect: "none",
                                        }}
                                    >
                                        <Avatar
                                            size="default"
                                            // src="/assets/profile/avatar.png" // you can replace this with your image
                                            icon={<UserOutlined />}
                                        />
                                        <div
                                            style={{
                                                display: "flex",
                                                flexDirection: "column",
                                                lineHeight: 1,
                                            }}
                                        >
                                            <Text
                                                strong
                                                style={{ fontSize: 14 }}
                                            >
                                                {firstName || "—"}{" "}
                                                {lastName || ""}
                                            </Text>
                                            <Text
                                                type="secondary"
                                                style={{
                                                    fontSize: 12,
                                                    marginTop: -6,
                                                }}
                                            >
                                                {phoneNumber || "—"}
                                            </Text>
                                        </div>
                                    </Space>
                                </Dropdown>
                            </div>
                        </Card>
                    </div>

                    {/* Scrollable Content */}
                    <Content
                        style={{
                            flex: 1,
                            overflowY: "auto", // scroll only here
                            padding: "8px 0",
                            scrollbarWidth: "none", // Firefox
                            msOverflowStyle: "none", // IE/Edge
                        }}
                    >
                        <Card
                            style={{
                                borderRadius: 12,
                                minHeight: "100%",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                background: "#fff",
                            }}
                            styles={{ body: { padding: 16 } }}
                        >
                            {children}
                        </Card>
                    </Content>

                    {/* Footer */}
                    <div style={{ padding: "6px 0 0" }}>
                        <Card
                            style={{
                                borderRadius: 12,
                                height: 30,
                                fontSize: 10,
                                textAlign: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                background: "#fff",
                                marginTop: "auto",
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                            styles={{ body: { padding: 0 } }}
                        >
                            <strong>
                                © {new Date().getFullYear()} Rafiansyah
                                Moneypulate
                            </strong>
                            . All Rights Reserved.
                        </Card>
                    </div>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}
