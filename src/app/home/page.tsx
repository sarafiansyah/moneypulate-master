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
import { typeOptions } from "@/components/heirloom/HeirloomType";
import { useBalanceStore } from "@/store/useBalanceStore";
import { useHeirloomStore, Heirloom } from "@/store/useHeirloomStore";
import { useRewardHistoryStore } from "@/store/useRewardHistoryStore";
import { motion, AnimatePresence, Variants, easeOut } from "framer-motion";

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm, success } = Modal;
const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: easeOut, // ✅ use the imported easing function
        },
    },
};

interface PieChartItem {
    type: string;
    value: number;
    color: string;
}

interface RewardHistoryRow {
    key: string;
    no: number;
    name: string;
    type: string;
    price: number;
    date: string;
}

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
    const [search, setSearch] = useState("");
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const { currentBalance } = useBalanceStore();
    const [pieChartData, setPieChartData] = useState<PieChartItem[]>([]);
    const [form] = Form.useForm();
    const rewardHistoryData = useRewardHistoryStore(
        (state) => state.rewardHistoryData
    );
    const { clearRewardHistoryData } = useRewardHistoryStore();
    const [tablePagination, setTablePagination] = useState({
        current: 1,
        pageSize: 50,
    });
    const heirloomArray = Array.isArray(heirlooms) ? [...heirlooms] : [];
    heirloomArray.forEach((item) => console.log(item.name));

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
            width: 10,
            render: (_: any, __: any, index: number) => {
                const currentPage = tablePagination.current || 1; // current page
                const pageSize = tablePagination.pageSize || 50; // current page size
                const number = (currentPage - 1) * pageSize + index + 1;

                return (
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center",
                            width: "100%",
                        }}
                    >
                        {number}
                    </div>
                );
            },
        },
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            width: 100, // enough for most names
            align: "left",
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 80, // slightly bigger for readability
            align: "right",
            sorter: (a, b) => a.price - b.price,
            render: (val: number) =>
                new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                }).format(val),
        },
        {
            title: "Date",
            dataIndex: "date",
            key: "date",
            width: 80, // a bit wider for readability
            align: "center",
            sorter: (a, b) =>
                new Date(a.date).getTime() - new Date(b.date).getTime(),
            render: (val: string | Date) =>
                new Date(val).toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                }),
        },
    ];

    const totalPrice = useMemo(
        () => heirlooms.reduce((sum, item) => sum + item.price, 0),
        [heirlooms]
    );

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
        if (value < 260) return "Average Spending";
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

    return (
        <main style={{ padding: "2px 12px" }}>
            <Row gutter={[24, 24]}>
                <Row gutter={[22, 22]}>
                    {/* TOP SECTION (1:2:1 Ratio) */}
                    <Col xs={24} md={6} xl={6}>
                        <motion.div
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            <Card
                                title={
                                    <span
                                        style={{
                                            fontSize: "14px",
                                            fontWeight: 600,
                                        }}
                                    >
                                        Performance Gauge
                                    </span>
                                }
                                variant="outlined"
                                style={{
                                    borderRadius: 16,
                                    height: 260,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                }}
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        marginTop: "-22px",
                                    }}
                                >
                                    <div
                                        style={{
                                            height: 190,
                                            width: "100%",
                                            margin: "0 auto",
                                        }}
                                    >
                                        <GaugeChart
                                            target={gaugeValue}
                                            total={total}
                                            title=""
                                        />
                                    </div>

                                    <div
                                        style={{
                                            textAlign: "center",
                                            marginTop: "-60px",
                                        }}
                                    >
                                        <h3
                                            style={{
                                                fontSize: "20px",
                                                fontWeight: 600,
                                                color: spendingColor,
                                            }}
                                        >
                                            {spendingLevel}
                                        </h3>
                                        <p
                                            style={{
                                                color: "#777",
                                                fontSize: "12px",
                                                marginTop: "-10px",
                                            }}
                                        >
                                            <span
                                                style={{
                                                    color:
                                                        totalPrice >
                                                        currentBalance
                                                            ? "#F5222D"
                                                            : "#434343ff", // 🔥 red if over, blue if within
                                                    fontWeight: 600,
                                                }}
                                            >
                                                Rp.
                                                {new Intl.NumberFormat(
                                                    "id-ID"
                                                ).format(totalPrice)}
                                            </span>
                                            {" / "}
                                            <span>
                                                Rp.
                                                {new Intl.NumberFormat(
                                                    "id-ID"
                                                ).format(currentBalance)}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>

                    <Col xs={24} md={12} xl={12}>
                        <Card
                            className="heirlooms-card"
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
                                            fontSize: "14px",
                                            margin: 0,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Self Rewards{" "}
                                        <Tooltip title="This is your current available balance">
                                            <span
                                                style={{
                                                    color:
                                                        currentBalance -
                                                            totalPrice >=
                                                        0
                                                            ? "#0da84d"
                                                            : "#ff4d4f", // green if positive, red if negative
                                                }}
                                            >
                                                {currentBalance - totalPrice >=
                                                0
                                                    ? `+${new Intl.NumberFormat(
                                                          "id-ID",
                                                          {
                                                              style: "currency",
                                                              currency: "IDR",
                                                              minimumFractionDigits: 0,
                                                          }
                                                      ).format(
                                                          currentBalance -
                                                              totalPrice
                                                      )}`
                                                    : `-${new Intl.NumberFormat(
                                                          "id-ID",
                                                          {
                                                              style: "currency",
                                                              currency: "IDR",
                                                              minimumFractionDigits: 0,
                                                          }
                                                      ).format(
                                                          Math.abs(
                                                              currentBalance -
                                                                  totalPrice
                                                          )
                                                      )}`}
                                            </span>
                                        </Tooltip>
                                    </Title>
                                    <Space size={4}>
                                        <Tooltip title="Details">
                                            <Button
                                                type="primary"
                                                icon={<InfoCircleOutlined />}
                                                onClick={() =>
                                                    router.push("/heirlooms")
                                                }
                                            ></Button>
                                        </Tooltip>
                                        <Tooltip title="Download Excel">
                                            <Button
                                                type="primary"
                                                icon={<DownloadOutlined />}
                                                onClick={downloadExcel}
                                            ></Button>
                                        </Tooltip>

                                        <Tooltip title="Add New Heirlooms">
                                            <Button
                                                type="primary"
                                                icon={<PlusOutlined />}
                                                onClick={() => openModal()}
                                            >
                                                Add
                                            </Button>
                                        </Tooltip>
                                    </Space>
                                </div>
                            }
                            style={{
                                borderRadius: 12,
                                height: 260,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                overflowX: "auto",
                                scrollbarWidth: "none", // Firefox
                                msOverflowStyle: "none", // IE/Edge
                            }}
                        >
                            {/* Add new heirloom */}
                            <Table<Heirloom>
                                id="heirloom-table"
                                size="small"
                                columns={columnsHeirloom}
                                dataSource={heirlooms}
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 800 }}
                                bordered
                                summary={(pageData) => {
                                    let totalPrice = 0;
                                    pageData.forEach(({ price }) => {
                                        totalPrice += price;
                                    });

                                    return (
                                        <Table.Summary.Row
                                            style={{
                                                backgroundColor: "#FAFAFA",
                                            }}
                                        >
                                            <Table.Summary.Cell
                                                index={1}
                                                colSpan={
                                                    columnsHeirloom.length - 1
                                                }
                                            >
                                                {/* <div
                                                    style={{
                                                        fontWeight: "bold",
                                                        color: "#555",
                                                    }}
                                                >
                                                    Total Price: Rp.{" "}
                                                    {new Intl.NumberFormat(
                                                        "id-ID"
                                                    ).format(totalPrice)}
                                                </div> */}
                                            </Table.Summary.Cell>
                                        </Table.Summary.Row>
                                    );
                                }}
                            />

                            {/* Modal for Add/Edit */}
                            <AnimatePresence>
                                {isModalOpen && (
                                    <motion.div
                                        className="fixed inset-0 bg-black/40 flex items-start justify-center pt-24 z-50"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <motion.div
                                            className="bg-white rounded-xl p-6 shadow-xl w-[400px]"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.9, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Title
                                                style={{
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    background:
                                                        "linear-gradient(90deg, #21ba0aff 0%, #17990dff 100%)",
                                                    WebkitBackgroundClip:
                                                        "text",
                                                    WebkitTextFillColor:
                                                        "transparent",
                                                    marginBottom: 12,
                                                }}
                                            >
                                                {editingItem
                                                    ? "Edit Heirloom"
                                                    : "Add Heirloom"}
                                            </Title>
                                            <Form form={form} layout="vertical">
                                                <Form.Item
                                                    name="name"
                                                    label="Name"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Input placeholder="Heirloom Name" />
                                                </Form.Item>

                                                <Form.Item
                                                    name="type"
                                                    label="Type"
                                                    rules={[{ required: true }]}
                                                >
                                                    <Select placeholder="Select Type">
                                                        {typeOptions.map(
                                                            (opt) => (
                                                                <Option
                                                                    key={
                                                                        opt.value
                                                                    }
                                                                    value={
                                                                        opt.value
                                                                    }
                                                                >
                                                                    {opt.label}
                                                                </Option>
                                                            )
                                                        )}
                                                    </Select>
                                                </Form.Item>

                                                <Form.Item
                                                    name="price"
                                                    label="Price"
                                                    rules={[{ required: true }]}
                                                >
                                                    <InputNumber
                                                        placeholder="Price"
                                                        min={0}
                                                        style={{
                                                            width: "100%",
                                                        }}
                                                    />
                                                </Form.Item>
                                            </Form>
                                            <div className="flex justify-end mt-4 gap-2">
                                                <Button onClick={closeModal}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    type="primary"
                                                    onClick={handleSave}
                                                >
                                                    Save
                                                </Button>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </Col>

                    <Col xs={24} md={6} xl={6}>
                        <Card
                            title={
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Category Breakdown
                                </span>
                            }
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                height: 260,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    marginTop: -20,
                                    height: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {pieChartData && pieChartData.length > 0 ? (
                                    <PieChart
                                        data={pieChartData}
                                        title="SalesRetuynr"
                                    />
                                ) : (
                                    <div style={{ marginTop: 30 }}>
                                        <Empty
                                            description="No data available"
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    </div>
                                )}
                            </div>
                        </Card>
                    </Col>

                    {/* BOTTOM SECTION */}
                    <Col xs={24} md={8} xl={8}>
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
                                            fontSize: "14px",
                                            margin: 0,
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Transaction History
                                    </Title>
                                    <Space size={4}>
                                        <Tooltip title="Details">
                                            <Button
                                                type="primary"
                                                icon={<InfoCircleOutlined />}
                                                onClick={() =>
                                                    router.push("/heirlooms")
                                                }
                                            ></Button>
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
                                height: 260,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                overflowX: "auto",
                                scrollbarWidth: "none", // Firefox
                                msOverflowStyle: "none", // IE/Edge
                            }}
                        >
                            <Table<RewardHistoryRow>
                                className="reward-history-table"
                                size="small"
                                columns={columnsRewardHistory}
                                dataSource={rewardHistoryData}
                                pagination={{
                                    current: tablePagination.current,
                                    pageSize: tablePagination.pageSize,
                                    onChange: (page, pageSize) =>
                                        setTablePagination({
                                            current: page,
                                            pageSize,
                                        }),
                                    showSizeChanger: true,
                                    pageSizeOptions: ["10", "50", "100", "200"],
                                }}
                                scroll={{ x: 0 }}
                                locale={{
                                    emptyText: "No rewards uploaded yet",
                                }}
                                bordered
                                style={{
                                    fontSize: "10px",
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
                                                    fontSize: "10px",
                                                    fontWeight: 600,
                                                    borderColor: "#e8e8e8",
                                                }}
                                            />
                                        ),
                                    },
                                    body: {
                                        cell: (props: any) => (
                                            <td
                                                {...props}
                                                style={{
                                                    padding: "2px 6px",
                                                    fontSize: "10px",
                                                    borderColor: "#e8e8e8",
                                                }}
                                            />
                                        ),
                                    },
                                }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} md={8} xl={8}>
                        <Card
                            title={
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Upload History
                                </span>
                            }
                            variant="outlined"
                            extra={
                                <Button
                                    type="default"
                                    onClick={() => setFileList([])}
                                >
                                    Clear
                                </Button>
                            }
                            style={{
                                borderRadius: 16,
                                height: 260,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
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
                                        padding: 8,
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
                                            fontSize: 32,
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
                                        fontSize: 14,
                                    }}
                                >
                                    Upload Excel File
                                </Title>

                                <Text
                                    type="secondary"
                                    style={{
                                        fontSize: 12,
                                        marginTop: -34,
                                        display: "flex",
                                    }}
                                >
                                    Import data to Transaction History table.
                                </Text>

                                <Upload
                                    accept=".xlsx,.xls"
                                    showUploadList={false}
                                    beforeUpload={() => false}
                                    onChange={handleExcelUpload}
                                    style={{
                                        color: "#999",
                                        marginTop: -25,
                                        display: "flex",
                                    }}
                                >
                                    <Button
                                        type="primary"
                                        icon={<UploadOutlined />}
                                        size="small"
                                        style={{ fontSize: 14 }}
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
                        </Card>
                    </Col>

                    <Col xs={24} md={8} xl={8}>
                        <Card
                            title={
                                <span
                                    style={{
                                        fontSize: "14px",
                                        fontWeight: 600,
                                    }}
                                >
                                    Monthly Comparison
                                </span>
                            }
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                height: 260,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    height: 180,
                                    marginTop: -17,
                                }}
                            >
                                <ColumnChart
                                    data={dataColumns}
                                    xField="month"
                                    yField="value"
                                    colorField="name"
                                />
                            </div>
                        </Card>
                    </Col>
                </Row>
            </Row>
        </main>
    );
}
