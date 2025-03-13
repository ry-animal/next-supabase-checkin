'use client';

import { useState, useEffect } from 'react';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Loader2 } from 'lucide-react';
import { formatRelative } from 'date-fns';

interface User {
  id: string;
  userid: string;
  lastcheckin: string | null;
  count: number;
  streak: number;
  checkinhistory: string;
  created_at: string;
  updated_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        const data = await response.json();
        setUsers(data.users || []);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch users');
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const columnHelper = createColumnHelper<User>();

  const columns: ColumnDef<User, any>[] = [
    columnHelper.accessor('userid', {
      header: 'User ID',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('lastcheckin', {
      header: 'Last Check-in',
      cell: (info) => {
        const value = info.getValue();
        return value ? formatRelative(new Date(value), new Date()) : 'Never';
      },
      enableSorting: true,
    }),
    columnHelper.accessor('count', {
      header: 'Total Check-ins',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('streak', {
      header: 'Current Streak',
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor('checkinhistory', {
      header: 'Check-in History',
      cell: (info) => {
        try {
          const history = JSON.parse(info.getValue() || '[]');
          return `${history.length} entries`;
        } catch (_error) {
          return '0 entries';
        }
      },
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: (info) => formatRelative(new Date(info.getValue()), new Date()),
    }),
  ];

  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">User Records</h1>
        <p className="text-muted-foreground">
          View and manage all user check-in records in your database.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 p-4 rounded-md text-destructive">
          <p className="font-medium">Error loading users</p>
          <p>{error}</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={users}
          searchColumn="userid"
          searchPlaceholder="Search by user ID..."
        />
      )}
    </div>
  );
}
