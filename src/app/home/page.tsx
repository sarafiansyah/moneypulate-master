"use client";

import { useRouter } from "next/navigation";

import PieChart from "@/components/chart/DonutChart";
import ColumnChart from "@/components/chart/ColumnChart";
import GaugeChart from "@/components/chart/GaugeChart";

// Pie chart data
const dataSales = [
    { type: "Electronics", value: 40, color: "#1890FF" },
    { type: "Fashion", value: 25, color: "#52C41A" },
    { type: "Home Goods", value: 15, color: "#FAAD14" },
    { type: "Sports", value: 10, color: "#EB2F96" },
    { type: "Cars", value: 10, color: "#2feb6eff" },
    { type: "Other", value: 10, color: "#13C2C2" },
];

const dataRevenue = [
    { type: "North America", value: 45 },
    { type: "Europe", value: 30 },
    { type: "Asia", value: 20 },
    { type: "Other Regions", value: 5 },
];

// Column chart data
const dataColumns = [
    { name: "Brand A", month: "Jan", value: 50 },
    { name: "Brand A", month: "Feb", value: 70 },
    { name: "Brand B", month: "Jan", value: 40 },
    { name: "Brand B", month: "Feb", value: 65 },
];

export default function Page() {
    const router = useRouter();
    const handleClickPieChart01 = () => {
        router.push("/sales"); // navigate to /sales page
    };
    return (
        <main style={{ padding: "2rem" }}>
            <h2>Business Analytics Dashboard</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                    gap: "2rem",
                    marginTop: "2rem",
                }}
            >
                {/* Pie Charts */}
                <section
                    onClick={handleClickPieChart01}
                    style={{
                        cursor: "pointer", // makes it obvious it's clickable
                        width: "100%",
                        maxWidth: "500px",
                        height: "400px",
                        margin: "0 auto",
                    }}
                >
                    <h3>Sales Distribution</h3>
                    <div style={{ height: "calc(100% - 2rem)" }}>
                        <PieChart data={dataSales} title="Sales" />
                    </div>
                </section>

                <section>
                    <h3>Revenue by Region</h3>
                    <PieChart data={dataRevenue} title="Revenue" />
                </section>

                {/* Column Chart */}
                <section>
                    <h3>Monthly Comparison</h3>
                    <ColumnChart
                        data={dataColumns}
                        xField="month"
                        yField="value"
                        colorField="name"
                        title="Monthly Comparison"
                    />
                </section>

                {/* Gauge Chart */}
                <section>
                    <h3>Performance Gauge</h3>
                    <GaugeChart
                        target={80}
                        total={400}
                        title="Sales Progress"
                    />
                </section>
            </div>
        </main>
    );
}
