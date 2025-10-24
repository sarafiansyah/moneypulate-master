"use client";

import { useState } from "react";
import { useBalanceStore } from "@/store/useBalanceStore";
import { Card, InputNumber, Button, Typography, Input, Row, Col } from "antd";
import {
    DeleteOutlined,
    EyeOutlined,
    EyeInvisibleOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

export default function BalanceTracker() {
    const {
        totalIncome,
        currentBalance,
        limits,
        addIncome,
        addLimit,
        removeLimit,
        resetAll,
    } = useBalanceStore();

    const [amount, setAmount] = useState<number>(0);
    const [limitTitle, setLimitTitle] = useState("");
    const [limitValue, setLimitValue] = useState<number>(0);
    const [showBalance, setShowBalance] = useState(true);

    const formatIDR = (value: number) =>
        new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(value);

    return (
        <div
            style={{
                width: "100%",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <Row gutter={[24, 24]} wrap align="top">
                {/* 🧮 Balance & Limits */}
                <Col xs={24} md={16}>
                    <Row gutter={[16, 16]}>
                        {/* Total Income */}
                        <Col xs={24} sm={12}>
                            <Card
                                title={
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                        }}
                                    >
                                        <span>Total Balance</span>
                                        <Button
                                            type="text"
                                            icon={
                                                showBalance ? (
                                                    <EyeInvisibleOutlined />
                                                ) : (
                                                    <EyeOutlined />
                                                )
                                            }
                                            onClick={() =>
                                                setShowBalance(!showBalance)
                                            }
                                        />
                                    </div>
                                }
                                variant="borderless"
                                style={{
                                    borderRadius: 12,
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                }}
                            >
                                <Title
                                    level={3}
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #007bff, #00c6ff)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {showBalance
                                        ? formatIDR(totalIncome)
                                        : "•••••••"}
                                </Title>
                            </Card>
                        </Col>

                        {/* Final Balance */}
                        <Col xs={24} sm={12}>
                            <Card
                            variant="borderless"
                                style={{
                                    borderRadius: 12,
                                    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                                }}
                                title={
                                    <div
                                        style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            width: "100%",
                                        }}
                                    >
                                        <span>Final Balance</span>
                                        <Button
                                            type="text"
                                            icon={
                                                showBalance ? (
                                                    <EyeInvisibleOutlined />
                                                ) : (
                                                    <EyeOutlined />
                                                )
                                            }
                                            onClick={() =>
                                                setShowBalance(!showBalance)
                                            }
                                        />
                                    </div>
                                }
                            >
                                <Title
                                    level={3}
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #007bff, #00c6ff)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        fontWeight: "bold",
                                    }}
                                >
                                    {showBalance
                                        ? formatIDR(currentBalance)
                                        : "•••••••"}
                                </Title>
                            </Card>
                        </Col>

                        {/* 🎯 Limit Cards */}
                        {limits.map((card, i) => (
                            <Col xs={24} sm={12} md={8} lg={6} key={i}>
                                <Card
                                    size="small"
                                  variant="borderless"
                                    style={{
                                        borderRadius: 10,
                                        boxShadow:
                                            "0 4px 12px rgba(0,0,0,0.08)",
                                        position: "relative",
                                    }}
                                >
                                    <Button
                                        type="text"
                                        icon={<DeleteOutlined />}
                                        danger
                                        size="small"
                                        style={{
                                            position: "absolute",
                                            top: 4,
                                            right: 4,
                                        }}
                                        onClick={() => removeLimit(card.title)}
                                    />
                                    <Title level={5}>{card.title}</Title>
                                    <Title
                                        level={4}
                                        style={{
                                            background:
                                                "linear-gradient(90deg, #ff7a18, #af002d 85%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                        }}
                                    >
                                        {formatIDR(card.value)}
                                    </Title>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Col>

                {/* ⚙️ Controls */}
                <Col xs={24} md={8}>
                    <Card
                        title="⚙️ Manage Balance"
                        style={{
                            marginBottom: 24,
                            borderRadius: 12,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        }}
                    >
                        <InputNumber
                            min={0}
                            value={amount}
                            onChange={(value) => setAmount(Number(value))}
                            placeholder="Enter amount"
                            style={{ width: "100%", marginBottom: 12 }}
                        />
                        <div style={{ display: "flex", gap: 8 }}>
                            <Button
                                type="primary"
                                block
                                onClick={() => addIncome(amount)}
                            >
                                Add Income
                            </Button>
                            <Button
                                type="dashed"
                                danger
                                block
                                onClick={resetAll}
                            >
                                Reset
                            </Button>
                        </div>
                    </Card>

                    <Card
                        title="🎯 Add Limit"
                        style={{
                            borderRadius: 12,
                            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                        }}
                    >
                        <Input
                            placeholder="Limit title"
                            value={limitTitle}
                            onChange={(e) => setLimitTitle(e.target.value)}
                            style={{ marginBottom: 8 }}
                        />
                        <InputNumber
                            placeholder="Limit value"
                            value={limitValue}
                            onChange={(v) => setLimitValue(Number(v))}
                            style={{ width: "100%", marginBottom: 12 }}
                        />
                        <Button
                            type="primary"
                            block
                            onClick={() => {
                                if (limitTitle && limitValue > 0) {
                                    addLimit(limitTitle, limitValue);
                                    setLimitTitle("");
                                    setLimitValue(0);
                                }
                            }}
                        >
                            Add Limit
                        </Button>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}
