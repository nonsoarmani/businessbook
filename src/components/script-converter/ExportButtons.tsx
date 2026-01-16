"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import { exportToTXT } from '@/lib/utils';

interface ExportButtonsProps {
  shots: { number: number; type: string; description: string }[];
  scriptTitle: string;
}

const ExportButtons = ({ shots, scriptTitle }: ExportButtonsProps) => {
  const formatShotList = () => {
    return shots.map(shot => `${shot.number}. ${shot.type} - ${shot.description}`).join('\n');
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(formatShotList());
    toast.success('Shot list copied to clipboard!');
  };

  const handleDownloadTXT = () => {
    const filename = scriptTitle ? `ShotList_${scriptTitle.replace(/\s/g, '_')}` : 'ShotList';
    exportToTXT(filename, formatShotList());
    toast.success('Shot list downloaded as TXT!');
  };

  const handlePrint = () => {
    const printContent = `
      <style>
        body { font-family: sans-serif; margin: 20px; }
        h1 { text-align: center; margin-bottom: 20px; }
        .shot-item { margin-bottom: 10px; }
        .shot-number { font-weight: bold; margin-right: 5px; }
        .shot-type { font-weight: bold; }
        .footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #666; }
      </style>
      <h1>Shot List for "${scriptTitle || 'Untitled Script'}"</h1>
      ${shots.map(shot => `
        <div class="shot-item">
          <span class="shot-number">${shot.number}.</span>
          <span class="shot-type">${shot.type}</span> - <span>${shot.description}</span>
        </div>
      `).join('')}
      <div class="footer">Generated on ${new Date().toLocaleDateString()} with ShotList Pro</div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    } else {
      toast.error('Could not open print window. Please allow pop-ups.');
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={handleCopyToClipboard} variant="outline" className="flex-1 min-w-[120px]">
        <Copy className="mr-2 h-4 w-4" /> Copy
      </Button>
      <Button onClick={handleDownloadTXT} variant="outline" className="flex-1 min-w-[120px]">
        <Download className="mr-2 h-4 w-4" /> Download TXT
      </Button>
      <Button onClick={handlePrint} variant="outline" className="flex-1 min-w-[120px]">
        <Printer className="mr-2 h-4 w-4" /> Print / PDF
      </Button>
    </div>
  );
};

export default ExportButtons;