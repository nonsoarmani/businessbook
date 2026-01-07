"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Debt } from '@/types';
import { formatNaira } from '@/lib/utils';

interface PaidPartialDialogProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PaidPartialDialog = ({ debt, open, onOpenChange }: PaidPartialDialogProps) => {
  const { dispatch } = useBusiness();
  const [partialAmount, setPartialAmount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setPartialAmount(0);
      setError(null);
    }
  }, [open]);

  const handlePartialPayment = () => {
    if (partialAmount <= 0) {
      setError('Amount must be positive.');
      return;
    }
    if (partialAmount > debt.amountOwed) {
      setError(`Amount cannot exceed outstanding debt of ${formatNaira(debt.amountOwed)}.`);
      return;
    }

    const newAmountOwed = debt.amountOwed - partialAmount;
    const newPaidAmount = (debt.paidAmount || 0) + partialAmount;
    const newStatus = newAmountOwed === 0 ? 'paid' : 'partial';

    dispatch({
      type: 'UPDATE_DEBT',
      payload: {
        id: debt.id,
        amountOwed: newAmountOwed,
        paidAmount: newPaidAmount,
        status: newStatus,
        datePaid: newStatus === 'paid' ? new Date() : undefined, // Only set datePaid if fully paid now
      },
    });

    toast.success(`${formatNaira(partialAmount)} recorded for ${debt.customerName}. Remaining: ${formatNaira(newAmountOwed)}.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Partial Payment</DialogTitle>
          <DialogDescription>
            Enter the amount paid by <span className="font-semibold">{debt.customerName}</span> for the debt of <span className="font-semibold">{formatNaira(debt.amountOwed)}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="partialAmount" className="text-right">
              Amount (₦)
            </Label>
            <Input
              id="partialAmount"
              type="number"
              value={partialAmount}
              onChange={(e) => setPartialAmount(Number(e.target.value))}
              className="col-span-3"
              min="0"
              max={debt.amountOwed}
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handlePartialPayment}>Record Payment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaidPartialDialog;