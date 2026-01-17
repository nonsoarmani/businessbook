"use client";
import React, { useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Box, AlertTriangle } from 'lucide-react';
import { formatNaira } from '@/lib/utils';

const InventorySummary = () => {
  const { state } = useBusiness();
  const { inventory } = state;

  const inventoryStats = useMemo(() => {
    const totalItems = inventory.length;
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
    const lowStockItems = inventory.filter(item => item.quantity <= (item.lowStockThreshold || 0)).length;
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
    };
  }, [inventory]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Inventory</CardTitle>
        <Box className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{inventoryStats.totalItems}</div>
        <p className="text-xs text-muted-foreground">items in stock</p>
        
        <div className="mt-2 pt-2 border-t">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="font-medium">{formatNaira(inventoryStats.totalValue)}</span>
          </div>
          {inventoryStats.lowStockItems > 0 && (
            <div className="flex justify-between text-xs mt-1">
              <span className="text-destructive flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Low Stock:
              </span>
              <span className="font-medium text-destructive">{inventoryStats.lowStockItems}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InventorySummary;