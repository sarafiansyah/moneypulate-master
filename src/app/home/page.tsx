"use client";

import React, { useMemo, useState } from "react";
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
    Select,
    Form,
} from "antd";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import GaugeChart from "@/components/chart/GaugeChart";
import PieChart from "@/components/chart/DonutChart";
import ColumnChart from "@/components/chart/ColumnChart";
import { useBalanceStore } from "@/store/useBalanceStore";
import { useHeirloomStore, Heirloom } from "@/store/useHeirloomStore";

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

// interface Heirloom {
//     key: string;
//     name: string;
//     type: string;
//     price: number;
//     date: string;
// }

// Pie chart data
const dataSales = [
    { type: "Electronics", value: 40, color: "#1890FF" },
    { type: "Fashion", value: 25, color: "#52C41A" },
    { type: "Home Goods", value: 15, color: "#FAAD14" },
    { type: "Sports", value: 10, color: "#EB2F96" },
    { type: "Cars", value: 10, color: "#2feb6eff" },
    { type: "Other", value: 10, color: "#13C2C2" },
];

// Column chart data
const dataColumns = [
    { name: "Bank A", month: "Mon", value: 45 },
    { name: "Bank A", month: "Tue", value: 60 },
    { name: "Bank A", month: "Wed", value: 55 },
    { name: "Bank A", month: "Thu", value: 70 },
    { name: "Bank A", month: "Fri", value: 65 },
    { name: "Bank A", month: "Sat", value: 40 },
    { name: "Bank A", month: "Sun", value: 50 },

    { name: "Bank B", month: "Mon", value: 35 },
    { name: "Bank B", month: "Tue", value: 45 },
    { name: "Bank B", month: "Wed", value: 60 },
    { name: "Bank B", month: "Thu", value: 55 },
    { name: "Bank B", month: "Fri", value: 70 },
    { name: "Bank B", month: "Sat", value: 50 },
    { name: "Bank B", month: "Sun", value: 65 },
];

interface UserRow {
    key: string;
    name: string;
    age: number;
    email: string;
    city: string;
    income: number;
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
    const { balance } = useBalanceStore();

    const [form] = Form.useForm();

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
            title: "#",
            key: "index",
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        { title: "Name", dataIndex: "name", key: "name", width: 150 },
        { title: "Type", dataIndex: "type", key: "type", width: 120 },
        {
            title: "Price",
            dataIndex: "price",
            key: "price",
            width: 100,
            render: (val: number) => `$${val}`,
        },
        { title: "Date", dataIndex: "date", key: "date", width: 180 },
        {
            title: "Action",
            key: "action",
            width: 150,
            render: (_: any, record: Heirloom) => (
                <Space>
                    <Button size="small" onClick={() => openModal(record)}>
                        Edit
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => {
                            deleteHeirloom(record.key);
                        }}
                    >
                        Delete
                    </Button>
                </Space>
            ),
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
                file.type === "application/pdf";
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
    const spendingPercent = balance > 0 ? totalPrice / balance : 0;

    // map to 0-400 range
    const gaugeValue = Math.min(Math.max(spendingPercent * 400, 0), 400);

    console.log("gagVal", gaugeValue);

    const getSpendingLevel = (value: number) => {
        if (value < 100) return "Low Spending";
        if (value < 200) return "Normal Spending";
        if (value < 300) return "Average Spending";
        return "High Spending";
    };
    const spendingLevel = getSpendingLevel(gaugeValue);

    return (
        <main style={{ padding: "1rem" }}>
            <Row gutter={[24, 24]}>
                <Row gutter={[24, 24]}>
                    {/* TOP SECTION (1:2:1 Ratio) */}
                    <Col xs={24} md={6} xl={6}>
                        <Card
                            title="Performance Gauge"
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                height: 300,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    marginTop: "-20px",
                                }}
                            >
                                <div
                                    style={{
                                        height: 200,
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
                                        marginTop: "-50px",
                                    }}
                                >
                                    <h3
                                        style={{
                                            fontSize: "1.25rem",
                                            fontWeight: 600,
                                            color: "#189F4A",
                                        }}
                                    >
                                        {spendingLevel}
                                    </h3>
                                    <p
                                        style={{
                                            color: "#777",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        Based on score:{" "}
                                        <span>
                                            ${totalPrice}/${balance}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={12} xl={12}>
                        <Card
                            title={
                                <Space>
                                    <Title level={4}>Heirloom List</Title>
                                    <Button
                                        type="primary"
                                        onClick={() => openModal()}
                                    >
                                        Add Heirloom
                                    </Button>
                                </Space>
                            }
                            style={{
                                borderRadius: 12,
                                height: 300,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                overflowX: "auto",
                                scrollbarWidth: "none", // Firefox
                                msOverflowStyle: "none", // IE/Edge
                            }}
                        >
                            {/* Add new heirloom */}
                            <Table<Heirloom>
                                size="small"
                                columns={columnsHeirloom}
                                dataSource={heirlooms}
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 800 }}
                            />
                            <Text strong>Total Price: ${totalPrice}</Text>

                            {/* Modal for Add/Edit */}
                            <Modal
                                title={
                                    editingItem
                                        ? "Edit Heirloom"
                                        : "Add Heirloom"
                                }
                                open={isModalOpen}
                                onOk={handleSave}
                                onCancel={closeModal}
                                okText="Save"
                            >
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
                                            <Option value="Jewelry">
                                                Jewelry
                                            </Option>
                                            <Option value="Art">Art</Option>
                                            <Option value="Furniture">
                                                Furniture
                                            </Option>
                                            <Option value="Other">Other</Option>
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
                                            style={{ width: "100%" }}
                                        />
                                    </Form.Item>
                                </Form>
                            </Modal>
                        </Card>
                    </Col>

                    <Col xs={24} md={6} xl={6}>
                        <Card
                            title="Category Breakdown"
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                height: 300,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div style={{ marginTop: -20 }}>
                                <PieChart data={dataSales} title="Sales" />
                            </div>
                        </Card>
                    </Col>

                    {/* BOTTOM SECTION */}
                    <Col xs={24} md={8} xl={8}>
                        <Card
                            title="Transaction History"
                            style={{
                                borderRadius: 16,
                                height: 300,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                overflowX: "auto",
                                scrollbarWidth: "none", // Firefox
                                msOverflowStyle: "none", // IE/Edge
                            }}
                        >
                            <Table<UserRow>
                                size="small"
                                columns={columns}
                                dataSource={filtered}
                                pagination={{ pageSize: 4 }}
                                scroll={{ x: 600 }}
                            />
                        </Card>
                    </Col>

                    <Col xs={24} md={8} xl={8}>
                        <Card
                            title="Upload Files"
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
                                height: 300,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div style={{ height: 160 }}>
                                <Dragger
                                    {...props}
                                    style={{ borderRadius: 12 }}
                                >
                                    <p className="ant-upload-drag-icon">
                                        <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">
                                        Click or drag files to upload
                                    </p>
                                    <p className="ant-upload-hint">
                                        Supports PNG, JPG, or PDF. Max 5MB.
                                    </p>
                                </Dragger>
                            </div>
                            <div style={{ marginTop: 10, textAlign: "center" }}>
                                <Button
                                    type="primary"
                                    icon={<UploadOutlined />}
                                    disabled={fileList.length === 0}
                                    onClick={() =>
                                        message.success(
                                            "Simulated upload success!"
                                        )
                                    }
                                >
                                    Upload Now
                                </Button>
                            </div>
                        </Card>
                    </Col>

                    <Col xs={24} md={8} xl={8}>
                        <Card
                            title="Weekly Bank Comparison"
                            variant="outlined"
                            style={{
                                borderRadius: 16,
                                height: 300,
                                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                            }}
                        >
                            <div
                                style={{
                                    width: "100%",
                                    height: 180,
                                    marginTop: -10,
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
