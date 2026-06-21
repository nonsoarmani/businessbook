"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { formatNaira, cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Users, Wallet, TrendingUp, Zap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

import { showError } from '@/utils/toast';

import { getBusinessName } from '@/lib/utils';

const AdminPayment = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchAdminData();
    }
  }, [authLoading, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      const { data: payData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, profiles(first_name, last_name, email, business_settings(business_name))')
        .order('created_at', { ascending: false });
      
      if (paymentsError) {
        console.error('Error fetching payments with joins:', paymentsError);
        // Fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('payments')
          .select('*, profiles(first_name, last_name, email)')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          const { data: rawPayments, error: rawError } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
          if (rawError) throw rawError;
          setPayments(rawPayments || []);
        } else {
          setPayments(fallbackData || []);
        }
      } else {
        setPayments(payData || []);
      }
    } catch (error: any) {
      console.error('Critical Error fetching admin payments:', error);
      showError('Failed to load payments: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter(p => 
    `${p.profiles?.first_name} ${p.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.profiles?.business_settings?.[0]?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-destructive font-bold">Access Denied. Admins only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Payment Records</h1>
        <p className="text-slate-500">Monitor all financial transactions across the platform</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name, email or reference..."
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
                <TableHead className="font-bold">User / Business</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Reference</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => (
                <TableRow key={p.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <span className="font-bold text-slate-900">
                        {p.profiles?.first_name} {p.profiles?.last_name}
                      </span>
                      <span className="text-xs text-emerald-600 font-medium">
                        {getBusinessName(p.profiles?.business_settings)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {p.profiles?.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-black text-emerald-600">
                    {formatNaira(p.amount)}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-500">
                    {p.reference}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-bold uppercase text-[10px]">
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {format(new Date(p.created_at), 'MMM d, h:mm a')}
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

export default AdminPayment;
