import React, { useMemo } from 'react';
import DebtEntryForm from '@/components/debts/DebtEntryForm';
import DebtSummaryCards from '@/components/debts/DebtSummaryCards';
import DebtListSection from '@/components/debts/DebtListSection';
import PaidDebtsArchive from '@/components/debts/PaidDebtsArchive';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBusiness } from '@/state/businessStore';
import { getDebtStatus } from '@/lib/calculations';

const Debts = () => {
  const { state } = useBusiness();

  const activeDebts = useMemo(() => state.debts.filter(debt => debt.status !== 'paid'), [state.debts]);
  const overdueDebts = useMemo(() => activeDebts.filter(debt => getDebtStatus(debt) === 'overdue'), [activeDebts]);
  const dueSoonDebts = useMemo(() => activeDebts.filter(debt => getDebtStatus(debt) === 'dueSoon'), [activeDebts]);
  const notYetDueDebts = useMemo(() => activeDebts.filter(debt => getDebtStatus(debt) === 'notYetDue'), [activeDebts]);

  return (
    <div className="space-y-8 p-4">
      <h1 className="text-3xl font-bold">Debt Management</h1>

      <DebtSummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <h2 className="text-2xl font-semibold">Record New Debt</h2>
          <DebtEntryForm />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Debts</TabsTrigger>
              <TabsTrigger value="paid">Paid Debts Archive</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="space-y-8 mt-4">
              <h2 className="text-2xl font-semibold">Active Debts Overview</h2>
              <DebtListSection
                title="Overdue Debts"
                debts={overdueDebts}
                type="overdue"
                isCollapsible={false}
              />
              <DebtListSection
                title="Debts Due Soon"
                debts={dueSoonDebts}
                type="dueSoon"
                isCollapsible={false}
              />
              <DebtListSection
                title="Not Yet Due"
                debts={notYetDueDebts}
                type="notYetDue"
                isCollapsible={true}
                defaultOpen={false}
              />
            </TabsContent>
            <TabsContent value="paid" className="space-y-8 mt-4">
              <h2 className="text-2xl font-semibold">Paid Debts Archive</h2>
              <PaidDebtsArchive />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Debts;