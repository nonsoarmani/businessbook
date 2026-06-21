"use client";

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { formatNaira, cn, getBusinessName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, Users, Wallet, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { showError } from '@/utils/toast';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchAdminData();
    }
  }, [authLoading, isAdmin]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const { count: userCount, error: userCountError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (userCountError) showError('Error fetching user count: ' + userCountError.message);
      
      const { data: paymentData, error: paymentDataError } = await supabase
        .from('payments')
        .select('amount');
      if (paymentDataError) showError('Error fetching revenue: ' + paymentDataError.message);
      
      const totalRevenue = paymentData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;
      
      const { count: proUserCount, error: proUserError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_status', 'pro');
      if (proUserError) showError('Error fetching pro users: ' + proUserError.message);
      
      const { count: paymentCount, error: paymentCountError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });
      if (paymentCountError) showError('Error fetching payment count: ' + paymentCountError.message);

      const { count: subCount, error: subCountError } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true });
      if (subCountError) showError('Error fetching subscription count: ' + subCountError.message);

      setStats({
        userCount,
        totalRevenue,
        proUserCount,
        paymentCount,
        subCount
      });

      // Fetch users
      const { data: userData, error: usersError } = await supabase
        .from('profiles')
        .select('*, business_settings(business_name)')
        .order('id', { ascending: false })
        .limit(10);
      
      if (usersError) {
        console.error('Error fetching users with joins:', usersError);
        const { data: fallbackData } = await supabase.from('profiles').select('*').order('id', { ascending: false }).limit(10);
        setUsers(fallbackData || []);
      } else {
        setUsers(userData || []);
      }

      // Fetch payments
      const { data: payData, error: paymentsError } = await supabase
        .from('payments')
        .select('*, profiles(first_name, last_name, email, business_settings(business_name))')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (paymentsError) {
        console.error('Error fetching payments with joins:', paymentsError);
        const { data: fallbackData } = await supabase.from('payments').select('*').order('created_at', { ascending: false }).limit(10);
        setPayments(fallbackData || []);
      } else {
        setPayments(payData || []);
      }

      // Fetch subscriptions
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*, profiles(first_name, last_name, email, business_settings(business_name))')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (subError) {
        console.error('Error fetching subscriptions with joins:', subError);
        const { data: fallbackData } = await supabase.from('subscriptions').select('*').order('created_at', { ascending: false }).limit(10);
        setSubscriptions(fallbackData || []);
      } else {
        setSubscriptions(subData || []);
      }

    } catch (error: any) {
      console.error('Error fetching admin data:', error);
      showError('System Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-500">Platform overview and management</p>
        </div>
        <div className="text-sm bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-800 shadow-sm flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          System Administrator: <span className="font-bold text-emerald-400">{user?.email}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.userCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>
        
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{formatNaira(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-slate-500 mt-1">Platform earnings</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pro Users</CardTitle>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">PRO</Badge>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.proUserCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Paid subscriptions</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Subscriptions</CardTitle>
            <Zap className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.subCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Platform activations</p>
          </CardContent>
        </Card>

        {/* <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Payments</CardTitle>
            <Wallet className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{stats?.paymentCount || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Successful transactions</p>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">Recent Customers</CardTitle>
                <CardDescription>Recently registered business owners</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Customer / Business</TableHead>
                  <TableHead className="font-bold">Plan</TableHead>
                  <TableHead className="font-bold">Registered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 opacity-20" />
                        <p>No customers found in database</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => (
                    <TableRow key={u.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{u.first_name} {u.last_name}</span>
                          <span className="text-xs text-emerald-600 font-medium">{getBusinessName(u.business_settings)}</span>
                          <span className="text-[10px] text-slate-400">{u.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={cn(
                            "font-bold uppercase text-[10px] tracking-tighter",
                            u.subscription_status === 'pro' 
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                              : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                          )}
                        >
                          {u.subscription_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(u.created_at), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg">Recent Subscriptions</CardTitle>
            <CardDescription>Latest plan activations</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Subscriber / Business</TableHead>
                  <TableHead className="font-bold">Plan</TableHead>
                  <TableHead className="font-bold">Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Zap className="h-8 w-8 opacity-20" />
                        <p>No subscriptions found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  subscriptions.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex flex-col text-sm">
                          <span className="font-bold text-slate-900">
                            {s.profiles?.first_name} {s.profiles?.last_name}
                          </span>
                          <span className="text-xs text-emerald-600 font-medium">
                            {getBusinessName(s.profiles?.business_settings)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {s.profiles?.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[10px] font-bold">
                          {s.plan_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(s.end_date), 'MMM d, yyyy')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="border-b bg-slate-50/50">
            <CardTitle className="text-lg">Recent Payments</CardTitle>
            <CardDescription>Latest successful transactions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">User / Business</TableHead>
                  <TableHead className="font-bold">Amount</TableHead>
                  <TableHead className="font-bold">Reference</TableHead>
                  <TableHead className="font-bold">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-slate-500">
                      <div className="flex flex-col items-center gap-2">
                        <Wallet className="h-8 w-8 opacity-20" />
                        <p>No payment records found</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  payments.map((p) => (
                    <TableRow key={p.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex flex-col">
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
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(p.created_at), 'MMM d, h:mm a')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
