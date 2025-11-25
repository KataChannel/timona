'use client';

import React, { useState } from 'react';
import { AdvancedTable, ColumnDef, RowData, TableConfig } from '@/components/ui/advanced-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, Star } from 'lucide-react';

// Sample data types
interface User extends RowData {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive' | 'pending';
  joinDate: Date;
  salary: number;
  rating: number;
  avatar?: string;
  department: string;
  isVerified: boolean;
}

interface Product extends RowData {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  createdAt: Date;
  description: string;
  featured: boolean;
}

// Sample data
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    status: 'active',
    joinDate: new Date('2023-01-15'),
    salary: 75000,
    rating: 4.5,
    department: 'Engineering',
    isVerified: true
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'manager',
    status: 'active',
    joinDate: new Date('2023-03-20'),
    salary: 85000,
    rating: 4.8,
    department: 'Marketing',
    isVerified: true
  },
  {
    id: 3,
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'user',
    status: 'pending',
    joinDate: new Date('2024-01-10'),
    salary: 55000,
    rating: 3.2,
    department: 'Sales',
    isVerified: false
  },
  {
    id: 4,
    name: 'Alice Brown',
    email: 'alice.brown@example.com',
    role: 'user',
    status: 'inactive',
    joinDate: new Date('2022-08-05'),
    salary: 60000,
    rating: 4.1,
    department: 'Support',
    isVerified: true
  },
  {
    id: 5,
    name: 'Charlie Wilson',
    email: 'charlie.wilson@example.com',
    role: 'manager',
    status: 'active',
    joinDate: new Date('2023-11-12'),
    salary: 90000,
    rating: 4.7,
    department: 'Engineering',
    isVerified: true
  }
];

const sampleProducts: Product[] = [
  {
    id: 1,
    name: 'Laptop Pro 15"',
    category: 'Electronics',
    price: 1299.99,
    stock: 25,
    status: 'in-stock',
    createdAt: new Date('2023-06-15'),
    description: 'High-performance laptop for professionals',
    featured: true
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    category: 'Accessories',
    price: 29.99,
    stock: 5,
    status: 'low-stock',
    createdAt: new Date('2023-08-20'),
    description: 'Ergonomic wireless mouse with RGB lighting',
    featured: false
  },
  {
    id: 3,
    name: 'Smartphone X1',
    category: 'Electronics',
    price: 899.99,
    stock: 0,
    status: 'out-of-stock',
    createdAt: new Date('2024-02-10'),
    description: 'Latest smartphone with advanced features',
    featured: true
  }
];

export default function AdvancedTableDemo() {
  const [userTableData, setUserTableData] = useState<User[]>(sampleUsers);
  const [productTableData, setProductTableData] = useState<Product[]>(sampleProducts);
  
  // User table configuration
  const userColumns: ColumnDef<User>[] = [
    {
      field: 'name',
      headerName: 'Name',
      width: 200,
      pinned: 'left',
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: ({ value, data }) => (
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src={data.avatar} />
            <AvatarFallback>
              {value.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      sortable: true,
      filterable: true,
      editable: true
    },
    {
      field: 'role',
      headerName: 'Role',
      width: 120,
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      filterOptions: ['admin', 'manager', 'user'],
      cellRenderer: ({ value }) => (
        <Badge variant={value === 'admin' ? 'destructive' : value === 'manager' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      filterOptions: ['active', 'inactive', 'pending'],
      cellRenderer: ({ value }) => {
        const icon = value === 'active' ? CheckCircle : value === 'inactive' ? XCircle : Clock;
        const color = value === 'active' ? 'text-green-600' : value === 'inactive' ? 'text-red-600' : 'text-yellow-600';
        const Icon = icon;
        return (
          <div className="flex items-center gap-1">
            <Icon className={`w-4 h-4 ${color}`} />
            <span className="capitalize">{value}</span>
          </div>
        );
      }
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 150,
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      filterOptions: ['Engineering', 'Marketing', 'Sales', 'Support']
    },
    {
      field: 'salary',
      headerName: 'Salary',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: ({ value }) => `$${value.toLocaleString()}`
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: ({ value }) => (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span>{value.toFixed(1)}</span>
        </div>
      )
    },
    {
      field: 'joinDate',
      headerName: 'Join Date',
      width: 150,
      type: 'date',
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: ({ value }) => value.toLocaleDateString()
    },
    {
      field: 'isVerified',
      headerName: 'Verified',
      width: 100,
      type: 'boolean',
      sortable: true,
      filterable: true,
      editable: true,
      pinned: 'right'
    }
  ];

  // Product table configuration
  const productColumns: ColumnDef<Product>[] = [
    {
      field: 'name',
      headerName: 'Product Name',
      width: 200,
      pinned: 'left',
      sortable: true,
      filterable: true,
      editable: true
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      filterOptions: ['Electronics', 'Accessories', 'Clothing', 'Books']
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      type: 'number',
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: ({ value }) => `$${value.toFixed(2)}`
    },
    {
      field: 'stock',
      headerName: 'Stock',
      width: 100,
      type: 'number',
      sortable: true,
      filterable: true,
      editable: true
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      type: 'select',
      sortable: true,
      filterable: true,
      editable: true,
      filterOptions: ['in-stock', 'low-stock', 'out-of-stock'],
      cellRenderer: ({ value }) => (
        <Badge 
          variant={
            value === 'in-stock' ? 'default' : 
            value === 'low-stock' ? 'destructive' : 'secondary'
          }
        >
          {value.replace('-', ' ')}
        </Badge>
      )
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      type: 'date',
      sortable: true,
      filterable: true,
      editable: true,
      cellRenderer: ({ value }) => value.toLocaleDateString()
    },
    {
      field: 'featured',
      headerName: 'Featured',
      width: 100,
      type: 'boolean',
      sortable: true,
      filterable: true,
      editable: true,
      pinned: 'right'
    }
  ];

  const tableConfig: TableConfig = {
    enableSorting: true,
    enableFiltering: true,
    enableColumnPinning: true,
    enableColumnResizing: true,
    enableColumnHiding: true,
    enableRowSelection: true,
    enableInlineEditing: true,
    enableRowDeletion: true,
    rowHeight: 60,
    headerHeight: 50,
    showToolbar: true
  };

  const handleUserEdit = async (user: User, field: keyof User, newValue: any): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUserTableData(prev => prev.map(u => 
        u.id === user.id ? { ...u, [field]: newValue } : u
      ));
      
      return true;
    } catch (error) {
      console.error('Failed to update user:', error);
      return false;
    }
  };

  const handleUserDelete = async (users: User[]): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const idsToDelete = users.map(u => u.id);
      setUserTableData(prev => prev.filter(u => !idsToDelete.includes(u.id)));
      
      return true;
    } catch (error) {
      console.error('Failed to delete users:', error);
      return false;
    }
  };

  const handleUserCreate = async (newUser: Partial<User>): Promise<boolean> => {
    try {
      const user: User = {
        id: Math.max(...userTableData.map(u => u.id)) + 1,
        name: 'New User',
        email: 'new.user@example.com',
        role: 'user',
        status: 'pending',
        joinDate: new Date(),
        salary: 50000,
        rating: 0,
        department: 'Support',
        isVerified: false,
        ...newUser
      };
      
      setUserTableData(prev => [...prev, user]);
      return true;
    } catch (error) {
      console.error('Failed to create user:', error);
      return false;
    }
  };

  const handleProductEdit = async (product: Product, field: keyof Product, newValue: any): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProductTableData(prev => prev.map(p => 
        p.id === product.id ? { ...p, [field]: newValue } : p
      ));
      
      return true;
    } catch (error) {
      console.error('Failed to update product:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Table Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A comprehensive data table with sorting, filtering, editing, and more features inspired by AG Grid Enterprise
          </p>
        </div>

        {/* Features Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Features Showcase</CardTitle>
            <CardDescription>
              This demo showcases all the advanced table features including:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold">Column Management</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Pin columns left/right</li>
                  <li>• Show/hide columns</li>
                  <li>• Resize columns</li>
                  <li>• Auto-size columns</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Sorting & Filtering</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Multi-column sorting</li>
                  <li>• Advanced filters</li>
                  <li>• Global search</li>
                  <li>• Filter by data type</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Editing & Actions</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Inline editing</li>
                  <li>• Row selection</li>
                  <li>• Bulk delete</li>
                  <li>• Data validation</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>User Management Table</CardTitle>
            <CardDescription>
              Manage users with advanced table features. Try sorting, filtering, editing, and selecting rows.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedTable
              columns={userColumns}
              data={userTableData}
              config={tableConfig}
              onRowEdit={handleUserEdit}
              onRowDelete={handleUserDelete}
              onRowCreate={handleUserCreate}
              height={500}
            />
          </CardContent>
        </Card>

        {/* Product Table */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory Table</CardTitle>
            <CardDescription>
              Manage product inventory with different data types and custom renderers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AdvancedTable
              columns={productColumns}
              data={productTableData}
              config={tableConfig}
              onRowEdit={handleProductEdit}
              height={400}
            />
          </CardContent>
        </Card>

        {/* Usage Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Column Operations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Click column header to sort</li>
                  <li>• Right-click or use menu for pin/hide options</li>
                  <li>• Drag column borders to resize</li>
                  <li>• Use "Columns" button to manage visibility</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Data Operations</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Double-click cells to edit inline</li>
                  <li>• Select rows with checkboxes</li>
                  <li>• Use "Add Filter" to create custom filters</li>
                  <li>• Global search searches all visible columns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}