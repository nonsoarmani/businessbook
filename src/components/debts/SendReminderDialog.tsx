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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useBusiness } from '@/state/businessStore';
import { toast } from 'sonner';
import { Debt } from '@/types';
import { formatNaira, formatDate } from '@/lib/utils';
import { Copy, MessageCircle } from 'lucide-react';

interface SendReminderDialogProps {
  debt: Debt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SendReminderDialog = ({ debt, open, onOpenChange }: SendReminderDialogProps) => {
  const { state: { businessName, businessPhone } } = useBusiness();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('template1');
  const [message, setMessage] = useState<string>('');

  const templates = React.useMemo(() => ({
    template1: `Good morning ${debt.customerName}, hope you and family are well. Quick reminder: ${formatNaira(debt.amountOwed)} for the ${debt.itemsSold} we supplied on ${formatDate(debt.dateGiven)}. No pressure, just checking. Thank you! 🙏`,
    template2: `Hello ${debt.customerName}, this is ${businessName}. Your payment of ${formatNaira(debt.amountOwed)} was due on ${formatDate(debt.dueDate)}. Can we arrange payment this week? Call us: ${businessPhone}`,
    template3: `${debt.customerName}, we've sent several reminders about ${formatNaira(debt.amountOwed)} owed since ${formatDate(debt.dateGiven)}. Please settle this week to avoid affecting future credit. Thank you.`,
  }), [debt, businessName, businessPhone]);

  React.useEffect(() => {
    if (open) {
      setMessage(templates[selectedTemplate as keyof typeof templates]);
    }
  }, [open, selectedTemplate, templates]);

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message);
    toast.success('Message copied to clipboard!');
  };

  const handleOpenWhatsApp = () => {
    const whatsappUrl = `https://wa.me/${debt.phone.replace(/^0/, '234')}/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    toast.info('Opening WhatsApp...');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Send Debt Reminder to {debt.customerName}</DialogTitle>
          <DialogDescription>
            Select a message template or customize your own to send a reminder for {formatNaira(debt.amountOwed)}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label className="mb-2 block">Choose Template:</Label>
            <RadioGroup
              onValueChange={setSelectedTemplate}
              value={selectedTemplate}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template1" id="template1" />
                <Label htmlFor="template1">Gentle Reminder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template2" id="template2" />
                <Label htmlFor="template2">Firm Reminder</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template3" id="template3" />
                <Label htmlFor="template3">Final Reminder</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label htmlFor="message" className="mb-2 block">Message Preview:</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>
        </div>
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <div className="flex gap-2">
            <Button onClick={handleCopyMessage} variant="secondary" className="flex items-center gap-2">
              <Copy className="h-4 w-4" /> Copy Text
            </Button>
            <Button onClick={handleOpenWhatsApp} className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4" /> Open WhatsApp
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendReminderDialog;