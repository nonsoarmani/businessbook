"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShoppingCart, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, formatNaira, getBusinessName } from '@/lib/utils';
import { showError } from '@/utils/toast';

const AdminSalesPage = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('sales')
        .select('*, profiles(first_name, last_name, email, business_settings(business_name))')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching sales with joins:', error);
        // Fallback to fetch sales with just profile info if business_settings join fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('sales')
          .select('*, profiles(first_name, last_name, email)')
          .order('date', { ascending: false });
        
        if (fallbackError) {
           // Final fallback: just sales
           const { data: rawSales, error: rawError } = await supabase.from('sales').select('*').order('date', { ascending: false });
           if (rawError) throw rawError;
           setSales(rawSales || []);
        } else {
           setSales(fallbackData || []);
        }
      } else {
        setSales(data || []);
      }
    } catch (error: any) {
      console.error('Critical Error fetching platform sales:', error);
      showError('Failed to load sales: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(s => 
    `${s.profiles?.first_name} ${s.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profiles?.business_settings?.[0]?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-slate-900">Platform Sales</h1>
        <p className="text-slate-500">Monitor all business transactions across the platform</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by business owner, item or customer..."
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
                <TableHead className="font-bold">Item</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Method</TableHead>
                <TableHead className="font-bold">Customer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                {filteredSales.map((s) => (
                  <TableRow key={s.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{s.profiles?.first_name} {s.profiles?.last_name}</span>
                        <span className="text-xs text-emerald-600 font-medium">{getBusinessName(s.profiles?.business_settings)}</span>
                        <span className="text-[10px] text-slate-400">{s.profiles?.email}</span>
                      </div>
                    </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(s.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">
                    {s.item}
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {formatNaira(s.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">
                      {s.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {s.customer_name || 'Walk-in'}
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

export default AdminSalesPage;
