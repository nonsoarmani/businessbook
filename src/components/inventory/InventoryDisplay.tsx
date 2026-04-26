"use client";
import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format } from 'date-fns';
import { Search, FileText, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { exportToCSV, ColumnHeader, formatNaira } from '@/lib/utils';
import { InventoryItem } from '@/types';
import { cn } from '@/lib/utils';

const InventoryDisplay = () => {
  const { state } = useBusiness();
  const { inventory = [] } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Get unique categories for filter
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(inventory.map(item => item.category))];
    return ['All', ...uniqueCategories];
  }, [inventory]);

  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier && item.supplier.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        categoryFilter === 'All' || item.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, categoryFilter]);

  // Calculate low stock items
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => 
      item.quantity <= (item.lowStockThreshold || 0)
    );
  }, [inventory]);

  const handleExportCSV = () => {
    const headers: ColumnHeader<InventoryItem>[] = [
      { key: 'name', label: 'Item Name' },
      { key: 'category', label: 'Category' },
      { key: 'quantity', label: 'Quantity' },
      { key: 'unit', label: 'Unit' },
      { key: 'costPrice', label: 'Cost Price (₦)' },
      { key: 'sellingPrice', label: 'Selling Price (₦)' },
      { key: 'lowStockThreshold', label: 'Low Stock Threshold' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'dateAdded', label: 'Date Added' },
      { key: 'lastUpdated', label: 'Last Updated' },
    ];
    
    exportToCSV('inventory_report', inventory, headers);
  };

  return (
    <div className="space-y-6">
      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center text-destructive text-lg">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-sm">
              <span className="font-bold">{lowStockItems.length}</span> item(s) running low.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="p-4">
          <CardTitle className="text-xl md:text-2xl font-bold">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(category)}
                  className="text-xs md:text-sm flex-1 md:flex-none"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto text-xs md:text-sm">
              <FileText className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Item Name</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Category</TableHead>
                    <TableHead className="text-right text-xs md:text-sm whitespace-nowrap">Quantity</TableHead>
                    <TableHead className="text-right text-xs md:text-sm whitespace-nowrap">Cost</TableHead>
                    <TableHead className="text-right text-xs md:text-sm whitespace-nowrap">Selling</TableHead>
                    <TableHead className="text-xs md:text-sm whitespace-nowrap">Supplier</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInventory.length > 0 ? (
                    filteredInventory.map((item) => (
                      <TableRow 
                        key={item.id} 
                        className={cn(
                          item.quantity <= (item.lowStockThreshold || 0) && "bg-destructive/10"
                        )}
                      >
                        <TableCell className="font-medium text-xs md:text-sm whitespace-nowrap">{item.name}</TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{item.category}</TableCell>
                        <TableCell className={cn(
                          "text-right text-xs md:text-sm whitespace-nowrap",
                          item.quantity <= (item.lowStockThreshold || 0) && "text-destructive font-bold"
                        )}>
                          {item.quantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right text-xs md:text-sm whitespace-nowrap">{formatNaira(item.costPrice)}</TableCell>
                        <TableCell className="text-right text-xs md:text-sm whitespace-nowrap">{formatNaira(item.sellingPrice)}</TableCell>
                        <TableCell className="text-xs md:text-sm whitespace-nowrap">{item.supplier || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-xs md:text-sm">
                        No items found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDisplay;