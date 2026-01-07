"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, cn } from '@/lib/utils';
import { getDebtStatus, calculateDaysOverdue } from '@/lib/calculations';
import { AlertCircle, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const DebtReminders = () => {
  const { state } = useBusiness();

  const { overdueDebts, dueSoonDebts } = useMemo(() => {
    const activeDebts = state.debts.filter(debt => debt.status !== 'paid');
    const overdue = activeDebts.filter(debt => getDebtStatus(debt) === 'overdue');
    const dueSoon = activeDebts.filter(debt => getDebtStatus(debt) === 'dueSoon');
    return { overdueDebts: overdue, dueSoonDebts: dueSoon };
  }, [state.debts]);

  const totalOverdueAmount = overdueDebts.reduce((sum, debt) => sum + debt.amountOwed, 0);
  const totalDueSoonAmount = dueSoonDebts.reduce((sum, debt) => sum + debt.amountOwed, 0);

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">Debt Reminders</CardTitle>
        <Link to="/debts" className="text-sm text-primary hover:underline flex items-center gap-1">
          Manage Debts <ArrowRight className="h-3 w-3" />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueDebts.length > 0 ? (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold">Overdue Debts ({overdueDebts.length})</p>
                <p className="text-sm">Total: <span className="font-bold">{formatNaira(totalOverdueAmount)}</span></p>
              </div>
            </div>
            <Link to="/debts">
              <Button variant="destructive" size="sm">View</Button>
            </Link>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="font-semibold">No Overdue Debts!</p>
          </div>
        )}

        {dueSoonDebts.length > 0 ? (
          <div className="p-3 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold">Debts Due Soon ({dueSoonDebts.length})</p>
                <p className="text-sm">Total: <span className="font-bold">{formatNaira(totalDueSoonAmount)}</span></p>
              </div>
            </div>
            <Link to="/debts">
              <Button variant="secondary" size="sm">View</Button>
            </Link>
          </div>
        ) : (
          <div className="p-3 rounded-md bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <p className="font-semibold">No Debts Due Soon.</p>
          </div>
        )}

        {overdueDebts.length === 0 && dueSoonDebts.length === 0 && (
          <p className="text-muted-foreground text-center py-4">All active debts are not yet due or have been paid.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default DebtReminders;