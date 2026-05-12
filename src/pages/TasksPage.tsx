"use client";
import React, { useState } from 'react';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDisplay from '@/components/tasks/TaskDisplay';
import { Button } from '@/components/ui/button';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const TasksPage = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">Organize your tasks, projects, and activities efficiently.</p>
        </div>
        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="w-full md:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Task
          </Button>
        ) : (
          <Button variant="outline" onClick={() => setShowForm(false)} className="w-full md:w-auto">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tasks
          </Button>
        )}
      </div>

      {showForm ? (
        <div className="w-full">
          <div className="bg-card border rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Add New Task</h2>
              <p className="text-sm text-muted-foreground">Enter the details of your new task.</p>
            </div>
            <TaskForm onSuccess={() => setShowForm(false)} />
          </div>
        </div>
      ) : (
        <TaskDisplay />
      )}
    </div>
  );
};

export default TasksPage;