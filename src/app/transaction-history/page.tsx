"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Card,
    Table,
    Button,
    Input,
    Space,
    Upload,
    message,
    Row,
    Typography,
    InputNumber,
    Col,
    Modal,
    Empty,
    Select,
    Form,
    Tooltip,
    Tag,
    Pagination,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    FileExcelOutlined,
    InboxOutlined,
    InfoCircleOutlined,
    PlusOutlined,
    UploadOutlined,
} from "@ant-design/icons";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import GaugeChart from "@/components/chart/GaugeChart";
import PieChart from "@/components/chart/DonutChart";
import ColumnChart from "@/components/chart/ColumnChart";
import { useBalanceStore } from "@/store/useBalanceStore";
import { useHeirloomStore, Heirloom } from "@/store/useHeirloomStore";
import { useRewardHistoryStore } from "@/store/useRewardHistoryStore";

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm, success } = Modal;

// interface Heirloom {
//     key: string;
//     name: string;
//     type: string;
//     price: number;
//     date: string;
// }

interface PieChartItem {
    type: string;
    value: number;
    color: string;
}

const colorMap = {
    Foods: "#22c55e", // bright green
    Electronics: "#3b82f6", // sky blue
    Jewelry: "#eab308", // gold yellow
    Furniture: "#d35f17ff", // warm brown
    Fashion: "#a855f7", // purple
} as const;

interface UserRow {
    key: string;
    name: string;
    age: number;
    email: string;
    city: string;
    income: number;
}

interface RewardHistoryRow {
    key: string;
    no: number;
    name: string;
    type: string;
    price: number;
    date: string;
}

const initialData: UserRow[] = [
    {
        key: "1",
        name: "Alice",
        age: 28,
        email: "alice@example.com",
        city: "Jakarta",
        income: 4200,
    },
    {
        key: "2",
        name: "Bob",
        age: 34,
        email: "bob@example.com",
        city: "Bandung",
        income: 5000,
    },
    {
        key: "3",
        name: "Citra",
        age: 22,
        email: "citra@example.com",
        city: "Surabaya",
        income: 2800,
    },
    {
        key: "4",
        name: "Dimas",
        age: 40,
        email: "dimas@example.com",
        city: "Medan",
        income: 6200,
    },
    {
        key: "5",
        name: "Eka",
        age: 31,
        email: "eka@example.com",
        city: "Yogyakarta",
        income: 4700,
    },
];

const columns: ColumnsType<UserRow> = [
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
        title: "Age",
        dataIndex: "age",
        key: "age",
        sorter: (a, b) => a.age - b.age,
        width: 100,
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
        title: "City",
        dataIndex: "city",
        key: "city",
        filters: [
            { text: "Jakarta", value: "Jakarta" },
            { text: "Bandung", value: "Bandung" },
            { text: "Surabaya", value: "Surabaya" },
            { text: "Medan", value: "Medan" },
            { text: "Yogyakarta", value: "Yogyakarta" },
        ],
        onFilter: (value, record) => record.city === value,
    },
    {
        title: "Price",
        dataIndex: "income",
        key: "income",
        sorter: (a, b) => a.income - b.income,
        render: (val: number) => `IDR ${val.toLocaleString()}`,
        align: "right",
        width: 140,
    },
];

const columnsHeirloom = [
    {
        title: "No",
        key: "index",
        width: 50, // fixed width for numbering
        render: (_: any, __: any, index: number) => index + 1, // 1-based index
    },
    {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 200, // you can adjust
    },
    {
        title: "Price",
        dataIndex: "price",
        key: "price",
        width: 100,
        render: (val: number) => `$${val}`,
    },
];

const options = [
    { value: "Electronics", label: "Electronics" },
    { value: "Jewelry", label: "Jewelry" },
    { value: "Foods", label: "Foods" },
    { value: "Art", label: "Art" },
    { value: "Furniture", label: "Furniture" },
    { value: "Other", label: "Other" },
];

export default function Page() {
    const target = 150;
    const total = 400;
    const router = useRouter();

    const { heirlooms, addHeirloom, editHeirloom, deleteHeirloom } =
        useHeirloomStore();
    const [name, setName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Heirloom | null>(null);
    const [price, setPrice] = useState<number>(0);
    const [data] = useState<UserRow[]>(initialData);
    const [search, setSearch] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { currentBalance } = useBalanceStore();
    const [pieChartData, setPieChartData] = useState<PieChartItem[]>([]);
    const [transactionData, setTransactionData] =
        useState<UserRow[]>(initialData);
    const [form] = Form.useForm();
    const rewardHistoryData = useRewardHistoryStore(
        (state) => state.rewardHistoryData
    );
    const { clearRewardHistoryData } = useRewardHistoryStore();
    const [isModalUploadOpen, setIsModalUploadOpen] = useState(false);

    const heirloomArray = Array.isArray(heirlooms) ? [...heirlooms] : [];
    heirloomArray.forEach((item) => console.log(item.name));
    const [tablePagination, setTablePagination] = useState({
        current: 1,
        pageSize: 50,
    });
    const pagedData = useMemo(() => {
        const start = (tablePagination.current - 1) * tablePagination.pageSize;
        const end = start + tablePagination.pageSize;
        return rewardHistoryData.slice(start, end);
    }, [rewardHistoryData, tablePagination]);

    useEffect(() => {
        if (!heirlooms || heirlooms.length === 0) {
            setPieChartData([]);
            return;
        }

        const groupedMap = new Map<string, number>();

        heirlooms.forEach((item: any) => {
            const typeKey = item.type ?? item.name ?? "Unknown";
            const price = Number(item.price) || 0;

            groupedMap.set(typeKey, (groupedMap.get(typeKey) || 0) + price);
        });

        const grouped = Array.from(groupedMap.entries()).map(
            ([type, totalPrice]) => ({
                type,
                totalPrice,
            })
        );

        const totalPrice = grouped.reduce((sum, g) => sum + g.totalPrice, 0);

        // typed parameter
        const colorFor = (str: string): string => {
            let h = 0;
            for (let i = 0; i < str.length; i++) {
                h = (h << 5) - h + str.charCodeAt(i);
                h |= 0;
            }
            const hex = (h >>> 0).toString(16).slice(0, 6).padStart(6, "0");
            return `#${hex}`;
        };

        const mapped: PieChartItem[] = grouped.map((g) => ({
            type: g.type,
            value:
                totalPrice === 0
                    ? 0
                    : Number(((g.totalPrice / totalPrice) * 100).toFixed(2)),
            color: colorFor(g.type),
        }));

        setPieChartData(mapped);
    }, [heirlooms]);

    console.log("MAP", pieChartData);
    const openModal = (item?: Heirloom) => {
        if (item) {
            setEditingItem(item);
            form.setFieldsValue(item);
        } else {
            setEditingItem(null);
            form.resetFields();
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            const dateStr = new Date().toLocaleString();
            if (editingItem) {
                editHeirloom({ ...editingItem, ...values });
            } else {
                const newItem: Heirloom = {
                    key: Date.now().toString(),
                    ...values,
                    date: dateStr,
                };
                addHeirloom(newItem);
            }
            closeModal();
        });
    };

    const handleDelete = (key: string) => {
        confirm({
            title: "Are you sure you want to delete this heirloom?",
            onOk() {
                deleteHeirloom(key);
            },
            onCancel() {},
        });
    };
    const columnsHeirloom = [
        {
            title: "No",
            key: "index",
            width: 30,
            align: "center" as "center", //  type-safe literal
            render: (_: any, __: any, index: number) => index + 1,
        },
        { title: "Name", dataIndex: "name", key: "name", width: 110 },
        { title: "Type", dataIndex: "type", key: "type", width: 80 },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 90,
            render: (val: number) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    minimumFractionDigits: 0,
                }).format(val),
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            width: 110,
            align: "left" as "left",
            render: (val: string | Date) => {
                const d = new Date(val);
                const hours = String(d.getHours()).padStart(2, "0");
                const minutes = String(d.getMinutes()).padStart(2, "0");
                const seconds = String(d.getSeconds()).padStart(2, "0");
                const day = String(d.getDate()).padStart(2, "0");
                const month = String(d.getMonth() + 1).padStart(2, "0");
                const year = d.getFullYear();
                return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`; // 24h format
            },
        },
        {
            title: "Action",
            key: "action",
            width: 50,
            align: "center" as "center",
            fixed: "right" as "right", //  right-aligned
            render: (_: any, record: Heirloom) => (
                <Space>
                    <Button
                        size="small"
                        type="primary"
                        variant="solid"
                        color="orange"
                        icon={<EditOutlined />}
                        onClick={() => openModal(record)}
                    ></Button>
                    <Button
                        size="small"
                        type="primary"
                        variant="solid"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => deleteHeirloom(record.key)}
                    ></Button>
                </Space>
            ),
        },
    ];

    const columnsRewardHistory: ColumnsType<RewardHistoryRow> = [
        {
            title: "No",
            dataIndex: "no",
            key: "no",
            align: "center",
            width: 20,
            render: (_: any, __: any, index: number) => {
                const currentPage = tablePagination.current || 1; // get current page
                const pageSize = tablePagination.pageSize || 50; // get current page size
                return (currentPage - 1) * pageSize + index + 1;
            },
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 100,
            align: "center",
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (val: string) => (
                <div style={{ textAlign: "left" }}>{val}</div>
            ),
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
            width: 70,
            align: "center",
            render: (type: string) => {
                return <div>{type}</div>;
            },
        },

        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 70,
            align: "center",
            sorter: (a, b) => a.price - b.price,
            render: (val: number) => (
                <div style={{ textAlign: "left" }}>
                    {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0,
                    }).format(val)}
                </div>
            ),
        },
        {
            title: "Spend Level",
            key: "tier",
            align: "center",
            width: 60,
            render: (_, record) => {
                const price = record.price;
                const tag =
                    price < 100_000 ? (
                        <Tag color="green">Low</Tag>
                    ) : price < 1_000_000 ? (
                        <Tag color="orange">Mid</Tag>
                    ) : (
                        <Tag color="red">High</Tag>
                    );
                return <div style={{ textAlign: "center" }}>{tag}</div>;
            },
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            width: 60,
            align: "center",
            sorter: (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            render: (val: string | Date) => (
                <div style={{ textAlign: "left" }}>
                    {new Date(val).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                    })}
                </div>
            ),
        },
        {
            title: "Time",
            key: "time",
            align: "center",
            width: 60,
            render: (_, record) => (
                <div style={{ textAlign: "left" }}>
                    {new Date(record.date).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                    })}
                </div>
            ),
        },
        {
            title: "Days Ago",
            key: "daysAgo",
            align: "center",
            width: 70,
            render: (_, record) => {
                const diff =
                    (Date.now() - new Date(record.date).getTime()) /
                    (1000 * 3600 * 24);
                return (
                    <div style={{ textAlign: "left" }}>{`${Math.floor(
                        diff
                    )} days`}</div>
                );
            },
        },
    ];

    const totalPrice = useMemo(
        () => heirlooms.reduce((sum, item) => sum + item.price, 0),
        [heirlooms]
    );

    const filtered = useMemo(() => {
        if (!search.trim()) return data;
        const q = search.toLowerCase();
        return data.filter(
            (r) =>
                r.name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.city.toLowerCase().includes(q)
        );
    }, [data, search]);

    const rowSelection = {
        selectedRowKeys,
        onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    };

    const props: UploadProps = {
        name: "file",
        multiple: true,
        beforeUpload: (file) => {
            const isAllowedType =
                file.type === "image/png" ||
                file.type === "image/jpeg" ||
                file.type === "application/pdf" ||
                file.type === "application/vnd.ms-excel" || // .xls
                file.type ===
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"; // .xlsx

            if (!isAllowedType) {
                message.error(`${file.name} is not a valid file type.`);
                return Upload.LIST_IGNORE;
            }

            const isLt5M = file.size / 1024 / 1024 < 5;
            if (!isLt5M) {
                message.error(`${file.name} exceeds 5MB limit.`);
                return Upload.LIST_IGNORE;
            }

            return true;
        },
        onChange(info) {
            setFileList(info.fileList);
            if (info.file.status === "done") {
                message.success(`${info.file.name} uploaded successfully`);
            } else if (info.file.status === "error") {
                message.error(`${info.file.name} upload failed`);
            }
        },
        onRemove(file) {
            setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
        },
        fileList,
    };

    // calculate percentage spent
    const spendingPercent =
        currentBalance > 0 ? totalPrice / currentBalance : 0;

    // map to 0-400 range
    const gaugeValue = Math.min(Math.max(spendingPercent * 400, 0), 400);

    console.log("gagVal", gaugeValue);

    const getSpendingLevel = (value: number) => {
        if (value < 100) return "Low Spending";
        if (value < 200) return "Normal Spending";
        if (value < 300) return "Average Spending";
        return "High Spending";
    };
    const getSpendingColor = (level: string) => {
        switch (level) {
            case "Low Spending":
                return "green"; // green
            case "Normal Spending":
                return "#f0e11bff"; // yellow
            case "Average Spending":
                return "#FAAD14"; // orange-ish
            case "High Spending":
                return "#F5222D"; // red
            default:
                return "#8C8C8C"; // gray fallback
        }
    };

    const spendingLevel = getSpendingLevel(gaugeValue);
    const spendingColor = getSpendingColor(spendingLevel);

    const downloadPDF = async () => {
        const tableElement = document.getElementById("heirloom-table");

        if (!tableElement) {
            message.error("Table not found!");
            return;
        }

        const canvas = await html2canvas(tableElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const pdf = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const imgHeight = (imgProps.height * pageWidth) / imgProps.width;

        let y = 10; // top margin
        pdf.addImage(imgData, "PNG", 0, y, pageWidth, imgHeight);

        pdf.save("Self_Rewards.pdf");
    };

    const downloadExcel = () => {
        if (!heirlooms || heirlooms.length === 0) {
            message.error("no data to export!");
            return;
        }

        // Convert data to worksheet
        const data = heirlooms.map((item, index) => ({
            no: index + 1,
            name: item.name,
            type: item.type,
            price: item.price,
            date: item.date,
        }));

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "self rewards");

        // Create timestamp
        const now = new Date();
        const datetime =
            now.getFullYear().toString() +
            ("0" + (now.getMonth() + 1)).slice(-2) +
            ("0" + now.getDate()).slice(-2) +
            "_" +
            ("0" + now.getHours()).slice(-2) +
            ("0" + now.getMinutes()).slice(-2) +
            ("0" + now.getSeconds()).slice(-2);

        // Generate Excel file
        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });

        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `self_rewards_${datetime}.xlsx`);
    };

    const handleExcelUpload = (info: any) => {
        const { rewardHistoryData, setRewardHistoryData } =
            useRewardHistoryStore.getState();
        const file = info.file.originFileObj || info.file;

        if (!(file instanceof Blob)) {
            message.error("Please upload a valid Excel file (.xlsx or .xls).");
            return;
        }

        const reader = new FileReader();

        reader.onload = (e: ProgressEvent<FileReader>) => {
            try {
                const data = new Uint8Array(e.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    defval: "",
                });

                const parsedData = (jsonData as any[]).map((item, index) => ({
                    key: `${Date.now()}-${index}`,
                    no: item.no ?? item.No ?? index + 1,
                    name: item.name ?? item.Name ?? "",
                    type: item.type ?? item.Type ?? "",
                    price: Number(item.price ?? item.Price ?? 0),
                    date: item.date ?? item.Date ?? "",
                }));

                // Filter: keep only *new* rows not already in Zustand
                const isDuplicate = (a: any, b: any) =>
                    a.name === b.name &&
                    a.type === b.type &&
                    a.price === b.price &&
                    a.date === b.date;

                const newUniqueData = parsedData.filter(
                    (newItem) =>
                        !rewardHistoryData.some((oldItem) =>
                            isDuplicate(newItem, oldItem)
                        )
                );

                if (newUniqueData.length === 0) {
                    message.info("No new unique records found to add.");
                    return;
                }

                const mergedData = [...rewardHistoryData, ...newUniqueData];

                setRewardHistoryData(mergedData);

                success({
                    title: "Data Updated",
                    content: `Added ${newUniqueData.length} new unique record(s).`,
                });
            } catch (err) {
                console.error(err);
                message.error(
                    "Failed to parse Excel file. Please check the format."
                );
            }
        };

        reader.readAsArrayBuffer(file);
    };

    const handleClearData = () => {
        Modal.confirm({
            title: "Clear all reward history data?",
            content: "This action cannot be undone.",
            okText: "Yes, clear it",
            cancelText: "Cancel",
            okType: "danger",
            onOk: () => {
                clearRewardHistoryData();
                localStorage.removeItem("reward-history-storage"); // just to be extra sure
            },
        });
    };

    // transform rewardHistoryData → chart data
    const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const dataColumns = monthNames.map((month, index) => {
        // filter all data that belongs to this month
        const total = rewardHistoryData
            .filter((item) => {
                if (!item.date) return false;
                const itemMonth = new Date(item.date).getMonth(); // 0–11
                return itemMonth === index;
            })
            .reduce((sum, item) => sum + (item.price || 0), 0);

        return {
            name: "Total Reward",
            month,
            value: total,
        };
    });

    const showModalUpload = () => setIsModalUploadOpen(true);
    const handleOkModalUpload = () => setIsModalUploadOpen(false);
    const handleCancelModalUpload = () => setIsModalUploadOpen(false);

    return (
        <main style={{ padding: "6px" }}>
            <Row gutter={[24, 24]}>
                {/* BOTTOM SECTION */}
                <Col xs={24} md={24} xl={24}>
                    <Card
                        className="reward-history-"
                        title={
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Title
                                    level={5}
                                    style={{
                                        fontSize: "16px",
                                        margin: 0,
                                        // fontWeight: "bold",
                                    }}
                                >
                                    Transaction History
                                </Title>
                                <Space>
                                    <Tooltip title="Upload">
                                        <Button
                                            type="primary"
                                            icon={<UploadOutlined />}
                                            onClick={showModalUpload}
                                        ></Button>

                                        {/* Modal */}
                                    </Tooltip>

                                    <Tooltip title="Download Excel">
                                        <Button
                                            type="primary"
                                            icon={<DownloadOutlined />}
                                            onClick={downloadExcel}
                                        ></Button>
                                    </Tooltip>
                                    <Tooltip title="Clear Data">
                                        <Button
                                            type="primary"
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={handleClearData}
                                        ></Button>
                                    </Tooltip>
                                </Space>
                            </div>
                        }
                        style={{
                            padding: 0,
                            borderRadius: 16,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            overflowX: "auto",
                            scrollbarWidth: "none", // Firefox
                            msOverflowStyle: "none", // IE/Edge
                        }}
                    >
                        <Table<RewardHistoryRow>
                            size="small"
                            columns={columnsRewardHistory}
                            dataSource={pagedData}
                            pagination={false}
                            scroll={{ x: 0, y: "calc(100vh - 355px)" }}
                            locale={{
                                emptyText: "No rewards uploaded yet",
                            }}
                            bordered
                            style={{
                                fontSize: "16px",
                                borderRadius: 6,
                                overflow: "hidden",
                            }}
                            rowClassName={() => "reward-history-row"}
                            components={{
                                header: {
                                    cell: (props: any) => (
                                        <th
                                            {...props}
                                            style={{
                                                padding: "4px 6px",
                                                fontSize: "14px",
                                                fontWeight: 600,
                                                borderColor: "#e8e8e8",
                                                textAlign: "center",
                                            }}
                                        />
                                    ),
                                },
                                body: {
                                    cell: (props: any) => (
                                        <td
                                            {...props}
                                            style={{
                                                padding: "4px 6px",
                                                fontSize: "14px",
                                                borderColor: "#e8e8e8",
                                                textAlign:
                                                    props.children &&
                                                    typeof props.children ===
                                                        "object" &&
                                                    props.children?.props
                                                        ?.children === 1
                                                        ? "center"
                                                        : "left",
                                            }}
                                        />
                                    ),
                                },
                            }}
                        />
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "8px 12px",
                            }}
                        >
                            <div style={{ fontWeight: "bold",marginTop:10 }}>
                                Total:{" "}
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    maximumFractionDigits: 0,
                                }).format(
                                    rewardHistoryData.reduce(
                                        (sum, row) => sum + row.price,
                                        0
                                    )
                                )}
                            </div>
                            <Pagination
                                current={tablePagination.current}
                                pageSize={tablePagination.pageSize}
                                total={rewardHistoryData.length}
                                showSizeChanger
                                pageSizeOptions={["10", "50", "100"]}
                                onChange={(page, pageSize) =>
                                    setTablePagination({
                                        current: page,
                                        pageSize,
                                    })
                                }
                            />
                        </div>
                    </Card>
                                        </Col>
                <Modal
                    title="Upload Excel"
                    open={isModalUploadOpen}
                    onOk={handleOkModalUpload}
                    onCancel={handleCancelModalUpload}
                    okText="Confirm"
                    cancelText="Close"
                    centered
                >
                    <Space
                        direction="vertical"
                        align="center"
                        size="large"
                        style={{ width: "100%" }}
                    >
                        <div
                            style={{
                                background: "#defbeaff",
                                padding: 12,
                                borderRadius: "50%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",

                                boxShadow: "0 4px 10px #1890ff26",
                                transition: "0.3s ease",
                            }}
                        >
                            <FileExcelOutlined
                                style={{
                                    fontSize: 36,
                                    color: "#0da84d",
                                }}
                            />
                        </div>

                        <Title
                            level={5}
                            style={{
                                marginTop: -10,
                                fontWeight: 600,
                                letterSpacing: 0.3,
                            }}
                        >
                            Upload Excel File
                        </Title>

                        <Text
                            type="secondary"
                            style={{
                                fontSize: 13,
                                marginTop: -30,
                                display: "flex",
                            }}
                        >
                            Import data to update the Transaction History table.
                        </Text>

                        <Upload
                            accept=".xlsx,.xls"
                            showUploadList={false}
                            beforeUpload={() => false}
                            onChange={handleExcelUpload}
                            style={{
                                color: "#999",
                                marginTop: -10,
                                display: "flex",
                            }}
                        >
                            <Button
                                type="primary"
                                icon={<UploadOutlined />}
                                size="middle"
                            >
                                Choose Excel File
                            </Button>
                        </Upload>

                        <Text
                            style={{
                                fontSize: 12,
                                color: "#999",
                                marginTop: -20,
                                display: "flex",
                            }}
                        >
                            Supported formats: .xlsx, .xls
                        </Text>
                    </Space>
                </Modal>
            </Row>
        </main>
    );
}
