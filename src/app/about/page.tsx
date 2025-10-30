// app/about/page.tsx
"use client";

import React from "react";
import { Row, Col, Typography, Button } from "antd";

const { Title, Paragraph, Text } = Typography;

export default function AboutPage() {
    return (
        <main
            style={{ padding: "60px 24px", maxWidth: 1200, margin: "0 auto" }}
        >
            <Row gutter={[48, 24]} align="middle">
                {/* Left: Text content */}
                <Col xs={24} md={12}>
                    <Title level={2}>Reward yourself!</Title>
                    <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                        <Text strong style={{ color: "#21BA0A", fontSize: 16 }}>
                            Moneypulate
                        </Text>{" "}
                        isn’t just a Cashflow Monitoring System, it’s a
                        purpose-built tool designed to help you take control of
                        your rewards, manage your salary wisely, and turn every
                        spending into a smarter choice.
                    </Paragraph>
                    <Text strong style={{ display: "block", marginTop: 16 }}>
                        Mahesa Rafiansyah
                    </Text>
                    <Text type="secondary">Founder & CEO</Text>
                    <div style={{ marginTop: 24 }}>
                        <Button type="primary" size="large">
                            Learn More
                        </Button>
                    </div>
                </Col>

                {/* Right: Illustration */}
                <Col xs={24} md={12} style={{ textAlign: "center" }}>
                    <img
                        src="/assets/images/mp_illust01.jpg"
                        alt="About Us Illustration"
                        style={{ maxWidth: "100%", borderRadius: 12 }}
                    />
                </Col>
            </Row>
        </main>
    );
}
