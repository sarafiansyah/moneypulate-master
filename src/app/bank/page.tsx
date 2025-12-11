"use client";

import React from "react";
import { Row, Col, Card, Statistic, Divider, Typography } from "antd";
import { useBankStore } from "@/store/useBankStore";
import BankTable from "@/components/bank/BankTable";
import AddBankForm from "@/components/bank/AddBankForm";

export default function BankBalancesPage() {
  const banks = useBankStore((s) => s.banks);
  const addBank = useBankStore((s) => s.addBank);
  const updateBank = useBankStore((s) => s.updateBank);
  const removeBank = useBankStore((s) => s.removeBank);
  const totalBalance = useBankStore((s) => s.totalBalance);

  // Prevent hydration mismatch
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);

  const handleAdd = (vals: { name: string; account: string; currency: string; balance: number }) => {
    addBank({
      name: vals.name,
      account: vals.account,
      currency: vals.currency,
      balance: vals.balance,
    });
  };

  const handleAdd10k = (id: string) => {
    const target = banks.find((b) => b.id === id);
    if (!target) return;

    updateBank(id, {
      balance: Math.round((target.balance + 10000) * 100) / 100,
    });
  };

  return (
    <div style={{ padding: 0 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card size="small">
                 <BankTable banks={banks} onAdd10k={handleAdd10k} onDelete={removeBank} />

            <Divider />

            <AddBankForm onAdd={handleAdd} />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card size="small">
            <Statistic
              title="Total (IDR)"
              value={ready ? totalBalance() : 0}
              precision={2}
              valueStyle={{ fontSize: 22 }}
            />

            <Divider />

            <Typography.Paragraph style={{ marginTop: 12 }}>
              Notes:
              <ul>
                <li>Balances are normalized using client-side logic.</li>
                <li>Values only calculated after hydration to avoid SSR mismatch.</li>
              </ul>
            </Typography.Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
