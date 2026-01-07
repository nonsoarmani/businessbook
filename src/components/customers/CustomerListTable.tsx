"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowUpDown, Edit, Trash2, Users } from 'lucide-react';
import { useBusiness } from '@/state/businessStore';
import { formatNaira, generateUniqueId } from '@/lib/utils';
import { Customer } from '@/types';
import { getDebtStatus } from '@/lib/calculations';
import { toast } from 'sonner';
import CustomerDetailsDialog from './CustomerDetailsDialog';
import DeleteCustomerDialog from './DeleteCustomerDialog';

type SortKey = keyof Customer | null;
type SortDirection = 'asc' | 'desc';

const CustomerListTable = () => {
  const { state } = useBusiness();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const allCustomers = useMemo(() => {
    const customerMap = new Map<string, Customer>(); // Key: `${name}|${phone}`

    // Process sales
    state.sales.forEach(sale => {
      if (sale.customerName) {
        const key = `${sale.customerName}|${sale.customerPhone || ''}`;
        const existingCustomer = customerMap.get(key) || {
          id: generateUniqueId(), // Generate a stable ID for derived customer
          name: sale.customerName,
          phone: sale.customerPhone || '',
          totalSalesAmount: 0,
          totalDebtsAmount: 0,
          activeDebtsCount: 0,
        };
        existingCustomer.totalSalesAmount += sale.amount;
        customerMap.set(key, existingCustomer);
      }
    });

    // Process debts
    state.debts.forEach(debt => {
      const key = `${debt.customerName}|${debt.phone}`;
      const existingCustomer = customerMap.get(key) || {
        id: generateUniqueId(),
        name: debt.customerName,
        phone: debt.phone,
        totalSalesAmount: 0,
        totalDebtsAmount: 0,
        activeDebtsCount: 0,
      };
      if (debt.status !== 'paid') {
        existingCustomer.totalDebtsAmount += debt.amountOwed;
        existingCustomer.activeDebtsCount += 1;
      }
      customerMap.set(key, existingCustomer);
    });

    return Array.from(customerMap.values());
  }, [state.sales, state.debts]);

  const filteredCustomers = useMemo(() => {
    let customersToFilter = allCustomers;

    // Apply search term filter
    if (searchTerm) {
      customersToFilter = customersToFilter.filter(customer =>
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    if (sortKey) {
      customersToFilter.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }

    return customersToFilter;
  }, [allCustomers, searchTerm, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc'); // Default to ascending for new sort key
    }
  };

  const handleViewEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <Input
          placeholder="Search by customer name or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Button variant="ghost" onClick={() => handleSort('name')}>
                  Customer Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[150px]">Phone</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('totalSalesAmount')}>
                  Total Sales
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('totalDebtsAmount')}>
                  Outstanding Debt
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Active Debts</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length > 0 ? (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell>{customer.phone || 'N/A'}</TableCell>
                  <TableCell>{formatNaira(customer.totalSalesAmount)}</TableCell>
                  <TableCell>{formatNaira(customer.totalDebtsAmount)}</TableCell>
                  <TableCell>{customer.activeDebtsCount}</TableCell>
                  <TableCell className="text-right flex gap-1 justify-end">
                    <Button variant="ghost" size="sm" onClick={() => handleViewEditCustomer(customer)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  <Users className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  No customers found. Record a sale or debt to see customers here.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedCustomer && (
        <>
          <CustomerDetailsDialog
            customer={selectedCustomer}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
          <DeleteCustomerDialog
            customer={selectedCustomer}
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default CustomerListTable;