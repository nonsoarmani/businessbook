"use client";
import React from 'react';
import InventoryForm from '../components/inventory/InventoryForm';
import InventoryDisplay from '../components/inventory/InventoryDisplay';

const InventoryPage = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Inventory Management</h1>
      <p className="text-muted-foreground mb-6">Track your stock levels, receive low stock alerts, and manage your inventory.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Add New Inventory Item</h2>
          <div className="bg-card p-4 rounded-lg shadow-sm">
            <InventoryForm />
          </div>
        </div>
        
        <div>
          <h2 className="text-lg md:text-xl font-semibold mb-4">Inventory Items</h2>
          <InventoryDisplay />
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;