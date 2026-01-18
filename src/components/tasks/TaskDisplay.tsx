"use client";
import React, { useState, useMemo } from 'react';
import { useBusiness } from '@/state/businessStore';
import { format, parseISO, isToday, isTomorrow, isPast, isFuture } from 'date-fns';
import { Search, CheckCircle, Circle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exportToCSV, ColumnHeader } from '@/lib/utils';
import { Task } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const TaskDisplay = () => {
  const { state, dispatch } = useBusiness();
  const { tasks } = state;
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter(task => {
      const matchesSearch = 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = 
        statusFilter === 'all' || task.status === statusFilter;

      const matchesPriority = 
        priorityFilter === 'all' || task.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  const handleStatusChange = (taskId: string, newStatus: 'todo' | 'in-progress' | 'completed') => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (taskToUpdate) {
        const updatedTask = {
          ...taskToUpdate,
          status: newStatus,
          completedAt: newStatus === 'completed' ? format(new Date(), 'yyyy-MM-dd') : undefined,
        };
        dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      }
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const handleDeleteTask = (taskId: string) => {
    try {
      dispatch({ type: 'DELETE_TASK', payload: taskId });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleExportCSV = () => {
    const headers: ColumnHeader<Task>[] = [
      { key: 'title', label: 'Title' },
      { key: 'description', label: 'Description' },
      { key: 'dueDate', label: 'Due Date' },
      { key: 'priority', label: 'Priority' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Created At' },
      { key: 'completedAt', label: 'Completed At' },
    ];

    exportToCSV('tasks_list', tasks || [], headers);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive" className="capitalize">{priority}</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="capitalize">{priority}</Badge>;
      case 'low':
        return <Badge variant="outline" className="capitalize">{priority}</Badge>;
      default:
        return <Badge variant="secondary" className="capitalize">{priority}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'todo':
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getDueDateStatus = (dueDate?: string) => {
    if (!dueDate) return null;

    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) {
      return <Badge variant="destructive" className="ml-2">Overdue</Badge>;
    } else if (isToday(date)) {
      return <Badge variant="secondary" className="ml-2">Due Today</Badge>;
    } else if (isTomorrow(date)) {
      return <Badge variant="secondary" className="ml-2">Due Tomorrow</Badge>;
    } else if (isFuture(date)) {
      return <Badge variant="outline" className="ml-2">Upcoming</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-1/3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select onValueChange={setStatusFilter} defaultValue={statusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select onValueChange={setPriorityFilter} defaultValue={priorityFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleExportCSV} className="w-full md:w-auto">
                <FileText className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{task.description || '-'}</TableCell>
                      <TableCell>
                        {task.dueDate ? (
                          <div className="flex items-center">
                            {format(parseISO(task.dueDate), 'dd/MM/yyyy')}
                            {getDueDateStatus(task.dueDate)}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getStatusIcon(task.status)}
                          <span className="ml-2 capitalize">{task.status.replace('-', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell className="space-x-2">
                        {task.status === 'todo' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task.id, 'in-progress')}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === 'in-progress' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusChange(task.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this task.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTask(task.id)}>
                                Delete Task
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'No tasks found matching your filters.'
                        : 'No tasks added yet. Add a new task to get started!'}
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

export default TaskDisplay;