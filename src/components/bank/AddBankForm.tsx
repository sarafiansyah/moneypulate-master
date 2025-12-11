// components/AddBankForm.tsx
import React from "react";
import { Form, Input, Button } from "antd";

type Props = {
  onAdd: (vals: { name: string; account: string; currency: string; balance: number }) => void;
};

export default function AddBankForm({ onAdd }: Props) {
  const [form] = Form.useForm();

  const submit = (values: any) => {
    onAdd({
      name: String(values.name).trim(),
      account: String(values.account).trim(),
      currency: String(values.currency || "IDR").trim().toUpperCase(),
      balance: Number(values.balance) || 0,
    });
    form.resetFields();
  };

  return (
    <Form form={form} layout="inline" onFinish={submit} style={{ marginTop: 8 }}>
      <Form.Item name="name" rules={[{ required: true }]}>
        <Input placeholder="Bank name (e.g. BCA)" />
      </Form.Item>
      <Form.Item name="account" rules={[{ required: true }]}>
        <Input placeholder="Account" />
      </Form.Item>
      <Form.Item name="currency" initialValue="IDR">
        <Input placeholder="Currency" style={{ width: 90 }} />
      </Form.Item>
      <Form.Item name="balance" rules={[{ required: true }]}>
        <Input placeholder="Balance" type="number" style={{ width: 140 }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Add
        </Button>
      </Form.Item>
    </Form>
  );
}
