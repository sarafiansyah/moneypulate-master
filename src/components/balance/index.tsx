"use client";

import { useState } from "react";
import { useBalanceStore } from "@/store/useBalanceStore";
import { Card, InputNumber, Button, Space, Typography } from "antd";

const { Title, Text } = Typography;

export default function BalanceTracker() {
    const { balance, addIncome, spendMoney, resetBalance } = useBalanceStore();
    const [amount, setAmount] = useState<number>(0);

    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "2rem",
                gap: "2rem",
                flexWrap: "wrap",
                fontFamily: "sans-serif",
            }}
        >
            {/* Balance Card */}
            <Card
                title={<Title level={4}>💰 Current Balance</Title>}
                styles={{
                    body: {
                        display: "flex",
                        justifyContent: "center",
                        padding: "2rem",
                    },
                }}
            >
                <Title level={2} style={{ textAlign: "center", margin: 0 }}>
                    ${balance}
                </Title>
            </Card>

            {/* Actions Card */}
            <Card
                title={<Title level={4}>Manage Money</Title>}
                styles={{
                    body: {
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    },
                }}
            >
                <InputNumber
                    min={0}
                    value={amount}
                    onChange={(value) => setAmount(Number(value))}
                    placeholder="Enter amount"
                    style={{ width: "100%" }}
                />

                <Space>
                    <Button type="primary" onClick={() => addIncome(amount)}>
                        Add Income
                    </Button>
                    <Button type="default" onClick={() => spendMoney(amount)}>
                        Spend Money
                    </Button>
                    <Button type="dashed" danger onClick={resetBalance}>
                        Reset Balance
                    </Button>
                </Space>
            </Card>
        </div>
    );
}
