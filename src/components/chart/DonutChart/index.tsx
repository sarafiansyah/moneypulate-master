"use client";
import React, { useState } from "react";
import { Pie } from "@ant-design/plots";
import { Modal } from "antd";

interface PieChartProps {
    data: {
        type: string;
        value: number;
    }[];
    title?: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedData, setSelectedData] = useState<{
        type: string;
        value: number;
    } | null>(null);

    const handleOpenModal = (datum: any) => {
        setSelectedData(datum);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedData(null);
    };

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
            color: {
                title: false,
                position: "bottom",
                rowPadding: 0,
                fontSize: 10,
            },
        },
        height: 200,
        annotations: [
            {
                type: "text",
                style: {
                    text: title ?? "AntV\nCharts",
                    x: "50%",
                    y: "50%",
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: "bold",
                    fill: "#fff",
                },
            },
        ],
        // Correct AntV style for click handling
        onReady: ({ chart }: any) => {
            chart.on("interval:click", (e: any) => {
                handleOpenModal(e.data?.data);
            });
            chart.on("element:click", (e: any) => {
                handleOpenModal(e.data?.data);
            });
        },
    };

    return (
        <>
            <Pie {...config} />

            <Modal
                title={`Details - ${selectedData?.type ?? "N/A"}`}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                centered
            >
                {selectedData ? (
                    <div style={{ textAlign: "center" }}>
                        <p>
                            <b>Type:</b> {selectedData.type}
                        </p>
                        <p>
                            <b>Value:</b> {selectedData.value}
                        </p>
                    </div>
                ) : (
                    <p>No data selected.</p>
                )}
            </Modal>
        </>
    );
};

export default PieChart;
