"use client";
import React from 'react';
import TaskForm from '@/components/tasks/TaskForm';
import TaskDisplay from '@/components/tasks/TaskDisplay';

const TasksPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Task Management</h1>
      <p className="text-muted-foreground mb-6">Organize your tasks, projects, and activities efficiently.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Add New Task</h2>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <TaskForm />
          </div>
        </div>

        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Your Tasks</h2>
          <TaskDisplay />
        </div>
      </div>
    </div>
  );
};

export default TasksPage;