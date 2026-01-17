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
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              You have <span className="font-bold">{lowStockItems.length}</span> item(s) running low on stock.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, category, or supplier..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  onClick={() => setCategoryFilter(category)}
                  className="text-xs md:text-sm"
                >
                  {category}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto">
              <FileText className="mr-2 h-4 w-4" />
              Export to CSV
            </Button>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Cost Price</TableHead>
                  <TableHead className="text-right">Selling Price</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Last Updated</TableHead>
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
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className={cn(
                        "text-right",
                        item.quantity <= (item.lowStockThreshold || 0) && "text-destructive font-bold"
                      )}>
                        {item.quantity} {item.unit}
                        {item.quantity <= (item.lowStockThreshold || 0) && (
                          <AlertTriangle className="inline-block ml-2 h-4 w-4 text-destructive" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatNaira(item.costPrice)}</TableCell>
                      <TableCell className="text-right">{formatNaira(item.sellingPrice)}</TableCell>
                      <TableCell>{item.supplier || '-'}</TableCell>
                      <TableCell>{format(new Date(item.lastUpdated), 'dd/MM/yyyy')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {searchTerm || categoryFilter !== 'All' 
                        ? 'No inventory items found matching your search.' 
                        : 'No inventory items added yet.'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryDisplay;