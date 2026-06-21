"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wallet, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, formatNaira, getBusinessName } from '@/lib/utils';
import { showError } from '@/utils/toast';

const AdminExpensesPage = () => {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('expenses')
        .select('*, profiles(first_name, last_name, email, business_settings(business_name))')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching expenses with joins:', error);
        // Fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('expenses')
          .select('*, profiles(first_name, last_name, email)')
          .order('date', { ascending: false });
        
        if (fallbackError) {
          const { data: rawExpenses, error: rawError } = await supabase.from('expenses').select('*').order('date', { ascending: false });
          if (rawError) throw rawError;
          setExpenses(rawExpenses || []);
        } else {
          setExpenses(fallbackData || []);
        }
      } else {
        setExpenses(data || []);
      }
    } catch (error: any) {
      console.error('Critical Error fetching platform expenses:', error);
      showError('Failed to load expenses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = expenses.filter(e => 
    `${e.profiles?.first_name} ${e.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.profiles?.business_settings?.[0]?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Expenses</h1>
        <p className="text-slate-500">Overview of all business expenses tracked on the platform</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by owner, expense name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 border-slate-200"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold">Business Owner</TableHead>
                <TableHead className="font-bold">Date</TableHead>
                <TableHead className="font-bold">Expense</TableHead>
                <TableHead className="font-bold">Category</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredExpenses.map((e) => (
                  <TableRow key={e.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{e.profiles?.first_name} {e.profiles?.last_name}</span>
                        <span className="text-xs text-emerald-600 font-medium">{getBusinessName(e.profiles?.business_settings)}</span>
                        <span className="text-[10px] text-slate-400">{e.profiles?.email}</span>
                      </div>
                    </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(e.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {e.name}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] capitalize">
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-red-600">
                    {formatNaira(e.amount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminExpensesPage;
