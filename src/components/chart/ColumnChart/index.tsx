"use client";
import React from "react";
import { Column } from "@ant-design/plots";

interface ColumnChartProps {
    data: { [key: string]: any }[];
    xField: string;
    yField: string;
    colorField: string;
    title?: string;
}

const ColumnChart: React.FC<ColumnChartProps> = ({
    data,
    xField,
    yField,
    colorField,
    title,
}) => {
    // Map data keys to the format the chart expects
    const formattedData = data.map((item) => ({
        x: item[xField],
        y: item[yField],
        colorField: item[colorField],
    }));

    const config = {
        data: formattedData,
        xField: "x",
        yField: "y",
        colorField: "colorField",
        group: { padding: 0 },
        columnStyle: {
            radius: [5, 5, 0, 0],
        },
        legend: false,
        autoFit: true,
        height: 200,
    };

    return (
        <div>
            {title && (
                <h3 style={{ textAlign: "center", marginBottom: 10 }}>
                    {title}
                </h3>
            )}
            <Column {...config} />
        </div>
    );
};

export default ColumnChart;
