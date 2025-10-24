"use client";

import React, { useState, useEffect } from "react";
import { useProfileStore } from "@/store/useProfileStore";
import {
    Card,
    Input,
    Select,
    Button,
    Row,
    Col,
    Typography,
    message,
} from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ProfilePage() {
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

    // Temporary local state (unsaved edits)
    const [formData, setFormData] = useState({
        firstName,
        lastName,
        username,
        phoneNumber,
        status,
    });

    useEffect(() => {
        // Sync local formData with store on mount
        setFormData({ firstName, lastName, username, phoneNumber, status });
    }, [firstName, lastName, username, phoneNumber, status]);

    const handleSave = () => {
        setProfile(formData);
        message.success("Profile saved successfully 🎉");
    };

    return (
        <div
            style={{
                width: "100%",
                padding: "2rem",
                display: "flex",
                justifyContent: "center",
            }}
        >
            <Card
                style={{
                    width: "100%",
                    maxWidth: 700,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
            >
                <Title level={2} style={{ textAlign: "left", fontSize: 20 }}>
                Profile Management
                </Title>

                <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
                    <Col span={12}>
                        <Input
                            placeholder="First Name"
                            value={formData.firstName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    firstName: e.target.value,
                                })
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <Input
                            placeholder="Last Name"
                            value={formData.lastName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    lastName: e.target.value,
                                })
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <Input
                            placeholder="Username"
                            value={formData.username}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    username: e.target.value,
                                })
                            }
                        />
                    </Col>
                    <Col span={12}>
                        <Input
                            placeholder="Phone Number"
                            value={formData.phoneNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    phoneNumber: e.target.value,
                                })
                            }
                        />
                    </Col>
                    <Col span={24}>
                        <Select
                            value={formData.status}
                            onChange={(value) =>
                                setFormData({ ...formData, status: value })
                            }
                            style={{ width: "100%" }}
                        >
                            <Option value="online">Online</Option>
                            <Option value="offline">Offline</Option>
                            <Option value="busy">Busy</Option>
                        </Select>
                    </Col>
                </Row>

                <div
                    style={{
                        marginTop: 24,
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "12px",
                    }}
                >
                    <Button type="primary" onClick={handleSave} block>
                        Save Profile 
                    </Button>
                    <Button danger onClick={resetProfile} block>
                        Reset
                    </Button>
                </div>
                         </Card>
        </div>
    );
}
