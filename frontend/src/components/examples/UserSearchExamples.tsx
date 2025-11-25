/**
 * Example Usage: useSearchUsers with Dynamic Query System
 * 
 * File: /frontend/src/components/examples/UserSearchExamples.tsx
 * Purpose: Demonstrate how to use the migrated useSearchUsers hook
 */

'use client';

import { useState } from 'react';
import { useSearchUsers } from '@/lib/hooks/useUserManagement';

/**
 * Example 1: Basic User Search
 */
export function BasicUserSearchExample() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { users, total, loading, error } = useSearchUsers({
    search: searchTerm,
    page: 0,
    size: 10,
  });

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <h2>Basic User Search</h2>
      <input 
        type="text" 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />
      
      <p>Found {total} users</p>
      
      <ul>
        {users.map((user: any) => (
          <li key={user.id}>
            {user.email} - {user.username} ({user.roleType})
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Example 2: Advanced Filtering
 */
export function AdvancedUserFilterExample() {
  const [filters, setFilters] = useState({
    search: '',
    roleType: undefined as 'ADMIN' | 'USER' | 'GUEST' | undefined,
    isActive: undefined as boolean | undefined,
    isVerified: undefined as boolean | undefined,
  });
  
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { 
    users, 
    total, 
    totalPages, 
    loading, 
    error,
    refetch 
  } = useSearchUsers({
    ...filters,
    page: currentPage,
    size: pageSize,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0); // Reset to first page
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Advanced User Filtering</h2>
      
      {/* Filters */}
      <div className="grid grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="border p-2 rounded"
        />
        
        <select
          value={filters.roleType || ''}
          onChange={(e) => handleFilterChange('roleType', e.target.value || undefined)}
          className="border p-2 rounded"
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="USER">User</option>
          <option value="GUEST">Guest</option>
        </select>
        
        <select
          value={filters.isActive === undefined ? '' : String(filters.isActive)}
          onChange={(e) => handleFilterChange('isActive', e.target.value === '' ? undefined : e.target.value === 'true')}
          className="border p-2 rounded"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        
        <select
          value={filters.isVerified === undefined ? '' : String(filters.isVerified)}
          onChange={(e) => handleFilterChange('isVerified', e.target.value === '' ? undefined : e.target.value === 'true')}
          className="border p-2 rounded"
        >
          <option value="">All Verification</option>
          <option value="true">Verified</option>
          <option value="false">Unverified</option>
        </select>
      </div>

      {/* Results */}
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500">Error: {error.message}</div>}
      
      {!loading && !error && (
        <>
          <div className="text-sm text-gray-600">
            Showing {users.length} of {total} users (Page {currentPage + 1} of {totalPages})
          </div>
          
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Email</th>
                <th className="border p-2">Username</th>
                <th className="border p-2">Name</th>
                <th className="border p-2">Role</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Verified</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id}>
                  <td className="border p-2">{user.email}</td>
                  <td className="border p-2">{user.username}</td>
                  <td className="border p-2">{user.firstName} {user.lastName}</td>
                  <td className="border p-2">{user.roleType}</td>
                  <td className="border p-2">
                    <span className={user.isActive ? 'text-green-600' : 'text-red-600'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="border p-2">
                    {user.isVerified ? '✓' : '✗'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            
            <span className="px-4 py-2">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
          
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </>
      )}
    </div>
  );
}

/**
 * Example 3: Date Range Search
 */
export function DateRangeUserSearchExample() {
  const [dateRange, setDateRange] = useState({
    createdAfter: '',
    createdBefore: '',
  });

  const { users, total, loading } = useSearchUsers({
    ...dateRange,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">User Registration Date Range</h2>
      
      <div className="flex gap-4">
        <div>
          <label className="block text-sm">From:</label>
          <input
            type="date"
            value={dateRange.createdAfter}
            onChange={(e) => setDateRange(prev => ({ ...prev, createdAfter: e.target.value }))}
            className="border p-2 rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm">To:</label>
          <input
            type="date"
            value={dateRange.createdBefore}
            onChange={(e) => setDateRange(prev => ({ ...prev, createdBefore: e.target.value }))}
            className="border p-2 rounded"
          />
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <p>Found {total} users registered in this period</p>
          <ul className="space-y-2">
            {users.map((user: any) => (
              <li key={user.id} className="border p-2 rounded">
                <strong>{user.email}</strong>
                <br />
                <small className="text-gray-600">
                  Registered: {new Date(user.createdAt).toLocaleDateString()}
                </small>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 4: Real-time Search with Debounce
 */
export function RealtimeUserSearchExample() {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search term
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);
    
    return () => clearTimeout(timer);
  });

  const { users, total, loading } = useSearchUsers({
    search: debouncedSearch,
    size: 5, // Only show top 5 results
  });

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Real-time User Search</h2>
      
      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Type to search users..."
          className="w-full border p-3 rounded-lg"
        />
        
        {loading && (
          <div className="absolute right-3 top-3">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {debouncedSearch && !loading && (
        <div className="mt-2 border rounded-lg shadow-lg">
          <div className="p-2 bg-gray-50 text-sm text-gray-600">
            Found {total} results
          </div>
          
          <div className="divide-y">
            {users.map((user: any) => (
              <div key={user.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                <div className="font-medium">{user.username}</div>
                <div className="text-sm text-gray-600">{user.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {user.roleType} • {user.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
          
          {total > 5 && (
            <div className="p-2 text-center text-sm text-blue-600 border-t">
              + {total - 5} more users
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Example 5: Conditional Skip
 */
export function ConditionalUserSearchExample() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Skip query if user is not authenticated
  const { users, total, loading, error } = useSearchUsers(
    { size: 10 },
    { skip: !isAuthenticated }
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Conditional User Search</h2>
      
      <button
        onClick={() => setIsAuthenticated(!isAuthenticated)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isAuthenticated ? 'Logout' : 'Login'}
      </button>

      {!isAuthenticated && (
        <div className="text-red-500">Please login to see users</div>
      )}

      {isAuthenticated && loading && <div>Loading...</div>}
      
      {isAuthenticated && !loading && !error && (
        <div>
          <p>Total users: {total}</p>
          <ul>
            {users.map((user: any) => (
              <li key={user.id}>{user.email}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Example 6: Using Alternative Data Access
 */
export function AlternativeDataAccessExample() {
  const searchParams = { search: 'admin', size: 5 };

  // Method 1: Using destructured shorthand
  const { users, total, loading } = useSearchUsers(searchParams);

  // Method 2: Using data object (backward compatible)
  const result = useSearchUsers(searchParams);
  const users2 = result.data?.searchUsers?.users || [];
  const total2 = result.data?.searchUsers?.total || 0;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Data Access Methods</h2>
      
      <div>
        <h3 className="font-semibold">Method 1: Shorthand (Recommended)</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {`const { users, total, loading } = useSearchUsers(params);`}
        </pre>
        <p>Users: {users.length}, Total: {total}</p>
      </div>

      <div>
        <h3 className="font-semibold">Method 2: Backward Compatible</h3>
        <pre className="bg-gray-100 p-2 rounded text-sm">
          {`const result = useSearchUsers(params);
const users = result.data?.searchUsers?.users || [];`}
        </pre>
        <p>Users: {users2.length}, Total: {total2}</p>
      </div>

      {loading && <div>Loading...</div>}
    </div>
  );
}

/**
 * Example 7: Export All Examples
 */
export default function UserSearchExamplesPage() {
  return (
    <div className="container mx-auto p-8 space-y-12">
      <h1 className="text-4xl font-bold mb-8">
        useSearchUsers Hook - Dynamic Query Examples
      </h1>
      
      <div className="grid grid-cols-1 gap-8">
        <BasicUserSearchExample />
        <hr />
        <AdvancedUserFilterExample />
        <hr />
        <DateRangeUserSearchExample />
        <hr />
        <RealtimeUserSearchExample />
        <hr />
        <ConditionalUserSearchExample />
        <hr />
        <AlternativeDataAccessExample />
      </div>
    </div>
  );
}
