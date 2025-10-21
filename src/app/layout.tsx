import type { Metadata } from "next";
import ClientLayout from "@/components/layout/MainLayout";
import AppLoadingOverlay from "@/app/layout-loading";

export const metadata: Metadata = {
    title: "Moneypulate - Financial Monitoring",
    description: "Modern Ant Design layout using Next.js App Router",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <AppLoadingOverlay />
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
