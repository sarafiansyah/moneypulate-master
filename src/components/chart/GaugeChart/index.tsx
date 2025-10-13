"use client";
import React from "react";
import { Gauge } from "@ant-design/plots";

interface GaugeChartProps {
    target: number;
    total: number;
    thresholds?: number[];
    title?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
    target,
    total,
    thresholds = [100, 200, 300, 400],
    title,
}) => {
    const config = {
        autoFit: true,
        data: { target, total, thresholds },
        scale: {
            color: {
                range: ["#F4664A", "#F5E613", "#FAAD14", "green"],
            },
        },
        style: {
            textContent: () =>
                `Score: ${target}\nRatio: ${((target / total) * 100).toFixed(
                    1
                )}%`,
        },
        annotations: [
            {
                type: "text",
                style: {
                    text: title || "",
                    x: "50%",
                    y: "30%",
                    textAlign: "center",
                    fontSize: 16,
                    fontWeight: "bold",
                },
            },
        ],
    };

    return <Gauge {...config} />;
};

export default GaugeChart;
