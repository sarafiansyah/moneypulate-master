"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Button, Typography, Empty, message } from "antd";
import { DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface StorageItem {
    key: string;
    valueLength: number;
}

const LocalStorageManager: React.FC = () => {
    const [items, setItems] = useState<StorageItem[]>([]);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = () => {
        const keys = Object.keys(localStorage);
        const data = keys.map((key) => ({
            key,
            valueLength: (localStorage.getItem(key) || "").length,
        }));
        setItems(data);
    };

    const handleDelete = (key: string) => {
        localStorage.removeItem(key);
        message.success(`Removed "${key}"`);
        loadItems();
    };

    const handleClearAll = () => {
        localStorage.clear();
        message.success("Cleared all localStorage items");
        loadItems();
    };

    return (
        <div style={{ padding: "40px" }}>
            <Title level={2} style={{ textAlign: "center", marginBottom: 30 }}>
                🗂️ LocalStorage Manager
            </Title>

            {items.length === 0 ? (
                <Empty description="No localStorage items found" />
            ) : (
                <>
                    <Row gutter={[16, 16]}>
                        {items.map((item) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={item.key}>
                                <Card
                                    title={<Text strong>{item.key}</Text>}
                                    extra={
                                        <InfoCircleOutlined
                                            style={{ color: "#1677ff" }}
                                        />
                                    }
                                    actions={[
                                        <Button
                                            danger
                                            type="link"
                                            icon={<DeleteOutlined />}
                                            onClick={() =>
                                                handleDelete(item.key)
                                            }
                                        >
                                            Delete
                                        </Button>,
                                    ]}
                                    style={{
                                        borderRadius: 12,
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.08)",
                                    }}
                                >
                                    <Text type="secondary">Value length:</Text>
                                    <br />
                                    <Text code>
                                        {item.valueLength} characters
                                    </Text>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div style={{ textAlign: "center", marginTop: 40 }}>
                        <Button danger type="primary" onClick={handleClearAll}>
                            Clear All
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
};

export default LocalStorageManager;
