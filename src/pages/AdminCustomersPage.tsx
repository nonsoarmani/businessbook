"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn, getBusinessName } from '@/lib/utils';
import { showError } from '@/utils/toast';

const AdminUsersPage = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch profiles with business_settings join
      const { data, error } = await supabase
        .from('profiles')
        .select('*, business_settings(business_name)')
        .neq('role', 'admin')
        .order('id', { ascending: false });
      
      if (error) {
        console.error('Error fetching users:', error);
        // Fallback to fetch profiles without business_settings if join fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('profiles')
          .select('*')
          .neq('role', 'admin')
          .order('id', { ascending: false });
        
        if (fallbackError) throw fallbackError;
        setUsers(fallbackData || []);
      } else {
        setUsers(data || []);
      }
    } catch (error: any) {
      console.error('Critical Error fetching users:', error);
      showError('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.business_settings?.[0]?.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.phone?.includes(searchTerm)
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
        <h1 className="text-3xl font-bold text-slate-900">Platform Users</h1>
        <p className="text-slate-500">View and manage all registered business owners</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:w-1/2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 border-slate-200"
              />
            </div>
            <Button variant="outline" className="border-slate-200 text-slate-600">
              <FileText className="mr-2 h-4 w-4" />
              Export Directory
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-bold">Business Owner</TableHead>
                  <TableHead className="font-bold">Business Name</TableHead>
                  <TableHead className="font-bold">Contact Info</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Date Joined</TableHead>
                  <TableHead className="text-right font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <div className="font-bold text-slate-900">{u.first_name} {u.last_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-emerald-600">
                        {getBusinessName(u.business_settings)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm">
                        <span className="text-slate-700">{u.email}</span>
                        <span className="text-slate-500">{u.phone || 'N/A'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={cn(
                          "font-bold uppercase text-[10px]",
                          u.subscription_status === 'pro' 
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {u.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {format(new Date(u.created_at), 'PPP')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 font-bold"
                        onClick={() => window.location.href = `mailto:${u.email}`}
                      >
                        Contact
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsersPage;
