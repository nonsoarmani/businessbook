"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, Phone, MessageCircle, CheckCircle, Wallet, Scale, Edit } from 'lucide-react'; // Import Edit icon
import { cn, formatNaira, formatDate } from '@/lib/utils';
import { Debt } from '@/types';
import { calculateDaysOverdue, getDebtStatus } from '@/lib/calculations';
import MarkPaidDialog from './MarkPaidDialog';
import PaidPartialDialog from './PaidPartialDialog';
import SendReminderDialog from './SendReminderDialog';
import EditDebtDialog from './EditDebtDialog'; // Import the new dialog
import { toast } from 'sonner';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DebtListSectionProps {
  title: string;
  debts: Debt[];
  type: 'overdue' | 'dueSoon' | 'notYetDue';
  isCollapsible?: boolean;
  defaultOpen?: boolean;
}

const DebtListSection = ({ title, debts, type, isCollapsible = false, defaultOpen = true }: DebtListSectionProps) => {
  const [isCollapsed, setIsCollapsed] = useState(!defaultOpen);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isPaidPartialDialogOpen, setIsPaidPartialDialogOpen] = useState(false);
  const [isSendReminderDialogOpen, setIsSendReminderDialogOpen] = useState(false);
  const [isEditDebtDialogOpen, setIsEditDebtDialogOpen] = useState(false); // State for edit dialog
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);

  const totalAmount = debts.reduce((sum, debt) => sum + debt.amountOwed, 0);

  const handleAction = (debt: Debt, actionType: 'markPaid' | 'paidPartial' | 'sendReminder' | 'call' | 'edit') => {
    setSelectedDebt(debt);
    if (actionType === 'markPaid') {
      setIsMarkPaidDialogOpen(true);
    } else if (actionType === 'paidPartial') {
      setIsPaidPartialDialogOpen(true);
    } else if (actionType === 'sendReminder') {
      setIsSendReminderDialogOpen(true);
    } else if (actionType === 'call') {
      window.open(`tel:${debt.phone}`, '_self');
      toast.info(`Calling ${debt.customerName} at ${debt.phone}...`);
    } else if (actionType === 'edit') {
      setIsEditDebtDialogOpen(true);
    }
  };

  const renderDebtRow = (debt: Debt) => (
    <TableRow key={debt.id}>
      <TableCell className="font-medium">{debt.customerName}</TableCell>
      <TableCell>{formatNaira(debt.amountOwed)}</TableCell>
      <TableCell>
        {type === 'overdue' ? (
          <span className="text-red-600">{calculateDaysOverdue(debt.dueDate)} days overdue</span>
        ) : (
          formatDate(debt.dueDate)
        )}
      </TableCell>
      <TableCell className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => handleAction(debt, 'markPaid')}>
          <CheckCircle className="h-4 w-4 mr-1" /> Paid
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAction(debt, 'paidPartial')}>
          <Wallet className="h-4 w-4 mr-1" /> Partial
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAction(debt, 'sendReminder')}>
          <MessageCircle className="h-4 w-4 mr-1" /> Reminder
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleAction(debt, 'call')}>
          <Phone className="h-4 w-4 mr-1" /> Call
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleAction(debt, 'edit')}>
          <Edit className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );

  const content = (
    <>
      {debts.length > 0 ? (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>{type === 'overdue' ? 'Status' : 'Due Date'}</TableHead>
                <TableHead className="w-[300px]">Actions</TableHead> {/* Adjusted width for new button */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {debts.map(renderDebtRow)}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Alert className={cn(
          type === 'overdue' && "bg-green-50 text-green-800 border-green-200",
          type === 'dueSoon' && "bg-blue-50 text-blue-800 border-blue-200",
          type === 'notYetDue' && "bg-gray-50 text-gray-800 border-gray-200"
        )}>
          <Scale className="h-4 w-4" />
          <AlertTitle>No {title} Debts</AlertTitle>
          <AlertDescription>
            There are no debts currently in the "{title}" category.
          </AlertDescription>
        </Alert>
      )}

      {selectedDebt && (
        <>
          <MarkPaidDialog
            debt={selectedDebt}
            open={isMarkPaidDialogOpen}
            onOpenChange={setIsMarkPaidDialogOpen}
          />
          <PaidPartialDialog
            debt={selectedDebt}
            open={isPaidPartialDialogOpen}
            onOpenChange={setIsPaidPartialDialogOpen}
          />
          <SendReminderDialog
            debt={selectedDebt}
            open={isSendReminderDialogOpen}
            onOpenChange={setIsSendReminderDialogOpen}
          />
          <EditDebtDialog
            debt={selectedDebt}
            open={isEditDebtDialogOpen}
            onOpenChange={setIsEditDebtDialogOpen}
          />
        </>
      )}
    </>
  );

  const headerClasses = cn(
    "flex items-center justify-between p-4 border-b",
    type === 'overdue' && "bg-red-100 text-red-800 border-red-200",
    type === 'dueSoon' && "bg-yellow-100 text-yellow-800 border-yellow-200",
    type === 'notYetDue' && "bg-green-100 text-green-800 border-green-200"
  );

  const titleClasses = cn(
    "text-lg font-semibold",
    type === 'overdue' && "text-red-800",
    type === 'dueSoon' && "text-yellow-800",
    type === 'notYetDue' && "text-green-800"
  );

  const summaryClasses = cn(
    "text-sm font-medium",
    type === 'overdue' && "text-red-700",
    type === 'dueSoon' && "text-yellow-700",
    type === 'notYetDue' && "text-green-700"
  );

  return (
    <Card className="bg-card text-card-foreground shadow-sm">
      {isCollapsible ? (
        <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
          <CollapsibleTrigger asChild>
            <div className={cn(headerClasses, "cursor-pointer")}>
              <div className="flex items-center gap-2">
                <CardTitle className={titleClasses}>{title} ({debts.length})</CardTitle>
                <span className={summaryClasses}>Total: {formatNaira(totalAmount)}</span>
              </div>
              <Button variant="ghost" size="sm">
                {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </Button>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-4">
            {content}
          </CollapsibleContent>
        </Collapsible>
      ) : (
        <>
          <div className={headerClasses}>
            <div className="flex items-center gap-2">
              <CardTitle className={titleClasses}>{title} ({debts.length})</CardTitle>
              <span className={summaryClasses}>Total: {formatNaira(totalAmount)}</span>
            </div>
          </div>
          <CardContent className="p-4">
            {content}
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default DebtListSection;