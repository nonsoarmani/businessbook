"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn, formatNaira, getBusinessName } from '@/lib/utils';
import { showError } from '@/utils/toast';

const AdminSubscriptionsPage = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, profiles(first_name, last_name, email, business_settings(business_name))')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching subscriptions with joins:', error);
        // Fallback
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('subscriptions')
          .select('*, profiles(first_name, last_name, email)')
          .order('created_at', { ascending: false });
        
        if (fallbackError) {
          const { data: rawSubs, error: rawError } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false });
          if (rawError) throw rawError;
          setSubscriptions(rawSubs || []);
        } else {
          setSubscriptions(fallbackData || []);
        }
      } else {
        setSubscriptions(data || []);
      }
    } catch (error: any) {
      console.error('Critical Error fetching subscriptions:', error);
      showError('Failed to load subscriptions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubs = subscriptions.filter(s => 
    `${s.profiles?.first_name} ${s.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.profiles?.business_settings?.[0]?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paystack_reference?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-slate-900">Platform Subscriptions</h1>
        <p className="text-slate-500">Monitor all plan activations and renewals</p>
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
                <TableHead className="font-bold">Subscriber / Business</TableHead>
                <TableHead className="font-bold">Plan</TableHead>
                <TableHead className="font-bold">Amount</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold">Period</TableHead>
                <TableHead className="font-bold">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubs.map((s) => (
                <TableRow key={s.id} className="hover:bg-slate-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{s.profiles?.first_name} {s.profiles?.last_name}</span>
                      <span className="text-xs text-emerald-600 font-medium">
                        {getBusinessName(s.profiles?.business_settings)}
                      </span>
                      <span className="text-[10px] text-slate-400">{s.profiles?.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize font-bold text-[10px]">
                      {s.plan_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-emerald-600">
                    {formatNaira(s.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={cn(
                        "font-bold uppercase text-[10px]",
                        s.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                      )}
                    >
                      {s.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    <div className="flex flex-col">
                      <span>Started: {format(new Date(s.start_date), 'MMM d, yyyy')}</span>
                      <span className="text-xs opacity-70">Ends: {format(new Date(s.end_date), 'MMM d, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-[10px] font-mono text-slate-400">
                    {s.paystack_reference}
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

export default AdminSubscriptionsPage;
