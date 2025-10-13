"use client";
import React from "react";
import { Pie } from "@ant-design/plots";

// ✅ Define the props type for flexibility
interface PieChartProps {
    data: {
        type: string;
        value: number;
    }[];
    title?: string; // optional title
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    const config = {
        data,
        angleField: "value",
        colorField: "type",
        innerRadius: 0.6,
        interaction: {
            elementHighlight: true,
        },
        state: {
            inactive: { opacity: 0.5 },
        },
        tooltip: {
            title: "type",
        },
        label: {
            text: "value",
            style: { fontWeight: "bold" },
        },
        legend: {
            color: { title: false, position: "bottom", rowPadding: 5 },
        },
        annotations: [
            {
                type: "text",
                style: {
                    text: title ?? "AntV\nCharts",
                    x: "50%",
                    y: "50%",
                    textAlign: "center",
                    fontSize: 40,
                    fontWeight: "bold",
                },
            },
        ],
    };

    return <Pie {...config} />;
};

export default PieChart;
