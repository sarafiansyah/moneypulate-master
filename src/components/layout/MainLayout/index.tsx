"use client";

import React, { useState } from "react";
import { Layout, Menu, Typography, Card, ConfigProvider } from "antd";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { menuItems } from "../MenuItems";
import "antd/dist/reset.css";

const { Header, Sider, Content, Footer } = Layout;
const { Title } = Typography;

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleLogoClick = () => {
        setCollapsed(!collapsed); // toggle sidebar collapse
    };

    const handleMenuClick = ({ key }: { key: string }) => {
        const selected = menuItems.find((item) => item.key === key);
        if (selected) router.push(selected.path);
    };

    return (
        <ConfigProvider
            theme={{
                token: {
                    colorPrimary: "#21ba0aff", // your primary color
                },
            }}
        >
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "flex-start",
                }}
            >
                {/* Card wrapper for floating effect */}

                <Layout>
                    {/* Sidebar */}
                    <Sider
                        collapsed={collapsed}
                        onCollapse={(value) => setCollapsed(value)}
                        theme="light"
                        style={{
                            margin: 16,
                            borderRadius: 12,
                            background: "#fff",
                            overflow: "hidden",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        }}
                    >
                        <div
                            style={{
                                height: 42,
                                margin: 16,
                                cursor: "pointer",
                                borderRadius: 8,
                                overflow: "hidden",
                                transition: "width 0.3s ease", // smooth width transition
                                width: collapsed ? 45 : 160, // width changes with collapsed state
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
                                width={collapsed ? 45 : 160} // keep image width same as container
                                height={38}
                                style={{
                                    borderRadius: 8,
                                    transition: "opacity 0.3s ease", // optional: fade between images
                                    opacity: 1,
                                }}
                                key={collapsed ? "collapsed" : "full"} // forces React to treat it as a new image
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

                    {/* Main content */}
                    <Layout
                        style={{
                            margin: 16,
                            borderRadius: 12,
                            background: "transparent", // keep transparent, cards handle background
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 16, // consistent spacing between cards
                        }}
                    >
                        {/* Header Card */}
                        <Card
                            style={{
                                borderRadius: 12,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                background: "#fff",
                            }}
                            styles={{ body: { padding: 16 } }}
                        >
                            <div className="flex items-center gap-3">
                                <Title level={4} style={{ margin: 0 }}>
                                    Dashboard
                                </Title>
                            </div>
                        </Card>

                        {/* Content Card */}
                        <Card
                            style={{
                                borderRadius: 12,
                                minHeight: 400,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                background: "#fff",
                            }}
                            styles={{ body: { padding: 16 } }}
                        >
                            {children}
                        </Card>

                        {/* Footer Card */}
                        <Card
                            style={{
                                borderRadius: 12,
                                textAlign: "center",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                                background: "#fff",
                            }}
                            styles={{ body: { padding: 16 } }}
                        >
                            © 2025 My Dashboard
                        </Card>
                    </Layout>
                </Layout>
            </div>
        </ConfigProvider>
    );
}
