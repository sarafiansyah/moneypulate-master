"use client";

import { Spin } from "antd";
import { useEffect, useState, FC } from "react";

const AppLoadingOverlay: FC = () => {
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div
            style={{
                position: "fixed" as const,
                inset: 0,
                background: "rgba(255, 255, 255, 1)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                display: "flex",
                flexDirection: "column" as const,
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
                fontFamily: "'Poppins', sans-serif",
                transition: "background 0.5s ease",
            }}
        >
            <Spin size="large" />
        </div>
    );
};

export default AppLoadingOverlay;
