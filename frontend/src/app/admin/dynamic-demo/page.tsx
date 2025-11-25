/**
 * ============================================================================
 * DYNAMIC GRAPHQL DEMO PAGE
 * ============================================================================
 * 
 * Demo page showing Dynamic GraphQL in action
 * Copy this to your app to test!
 * 
 * Location: /app/admin/dynamic-demo/page.tsx
 */

'use client';

import React, { useState } from 'react';
import {
  useFindMany,
  useFindUnique,
  useFindManyPaginated,
  useCount,
  useCreateOne,
  useUpdateOne,
  useDeleteOne,
  useCRUD,
} from '@/hooks/useDynamicGraphQL';

export default function DynamicGraphQLDemo() {
  const [selectedModel, setSelectedModel] = useState<string>('task');
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  // ========================================
  // TEST 1: Find Many
  // ========================================
  const Test1_FindMany = () => {
    const { data, loading, error } = useFindMany(selectedModel, {
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    return (
      <div className="test-section">
        <h3>Test 1: Find Many ({selectedModel})</h3>
        {loading && <p>Loading...</p>}
        {error && <p className="error">Error: {error.message}</p>}
        {data && (
          <div>
            <p className="success">✅ Found {data.length} records</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // TEST 2: Pagination
  // ========================================
  const Test2_Pagination = () => {
    const {
      data,
      meta,
      loading,
      nextPage,
      prevPage,
      page,
    } = useFindManyPaginated(selectedModel, {
      page: 1,
      limit: 5,
    });

    return (
      <div className="test-section">
        <h3>Test 2: Pagination ({selectedModel})</h3>
        {loading && <p>Loading...</p>}
        {meta && (
          <div>
            <p className="success">
              ✅ Page {meta.page} of {meta.totalPages} ({meta.total} total)
            </p>
            <div className="pagination-controls">
              <button onClick={prevPage} disabled={!meta.hasPrevPage}>
                ← Previous
              </button>
              <span>Page {page}</span>
              <button onClick={nextPage} disabled={!meta.hasNextPage}>
                Next →
              </button>
            </div>
            {data && <pre>{JSON.stringify(data.slice(0, 2), null, 2)}</pre>}
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // TEST 3: Count
  // ========================================
  const Test3_Count = () => {
    const { count, loading } = useCount(selectedModel);

    return (
      <div className="test-section">
        <h3>Test 3: Count ({selectedModel})</h3>
        {loading && <p>Loading...</p>}
        {count !== undefined && (
          <p className="success">✅ Total records: {count}</p>
        )}
      </div>
    );
  };

  // ========================================
  // TEST 4: CRUD Operations
  // ========================================
  const Test4_CRUD = () => {
    const crud = useCRUD('task');

    const runCRUDTest = async () => {
      try {
        addResult('🔵 Starting CRUD test...');

        // Find many
        const tasks = await crud.findMany({ take: 3 });
        addResult(`✅ Found ${tasks.length} tasks`);

        // Count
        const count = await crud.count();
        addResult(`✅ Total count: ${count}`);

        // Create
        const newTask = await crud.createOne({
          data: {
            title: `Test Task ${Date.now()}`,
            description: 'Created by Dynamic GraphQL Demo',
            status: 'TODO',
            priority: 'MEDIUM',
            category: 'WORK',
            userId: '123' // Replace with real user ID
          }
        });
        addResult(`✅ Created task: ${newTask.id}`);

        // Update
        const updated = await crud.updateOne({
          where: { id: newTask.id },
          data: { status: 'IN_PROGRESS' }
        });
        addResult(`✅ Updated task status: ${updated.status}`);

        // Delete
        await crud.deleteOne({ where: { id: newTask.id } });
        addResult(`✅ Deleted task: ${newTask.id}`);

        addResult('🎉 CRUD test completed successfully!');
      } catch (error: any) {
        addResult(`❌ Error: ${error.message}`);
      }
    };

    return (
      <div className="test-section">
        <h3>Test 4: CRUD Operations</h3>
        <button
          onClick={runCRUDTest}
          disabled={crud.loading}
          className="test-button"
        >
          {crud.loading ? 'Running...' : 'Run CRUD Test'}
        </button>
      </div>
    );
  };

  // ========================================
  // TEST 5: Create One
  // ========================================
  const Test5_CreateOne = () => {
    const [createTask, { loading }] = useCreateOne('task');
    const [result, setResult] = useState<any>(null);

    const handleCreate = async () => {
      try {
        const task = await createTask({
          data: {
            title: `Demo Task ${Date.now()}`,
            description: 'Created from Dynamic GraphQL Demo',
            status: 'TODO',
            priority: 'HIGH',
            category: 'WORK',
            userId: '123' // Replace with real user ID
          }
        });
        setResult(task);
        addResult(`✅ Created: ${task.id}`);
      } catch (error: any) {
        addResult(`❌ Error: ${error.message}`);
      }
    };

    return (
      <div className="test-section">
        <h3>Test 5: Create One</h3>
        <button onClick={handleCreate} disabled={loading}>
          {loading ? 'Creating...' : 'Create Task'}
        </button>
        {result && (
          <div>
            <p className="success">✅ Created!</p>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  // ========================================
  // TEST 6: Advanced Query
  // ========================================
  const Test6_AdvancedQuery = () => {
    const { data, loading } = useFindMany('task', {
      where: {
        status: 'ACTIVE',
        priority: { in: ['HIGH', 'MEDIUM'] }
      },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    return (
      <div className="test-section">
        <h3>Test 6: Advanced Query</h3>
        <p>Find active tasks with HIGH/MEDIUM priority + user</p>
        {loading && <p>Loading...</p>}
        {data && (
          <div>
            <p className="success">✅ Found {data.length} tasks</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dynamic-demo">
      <style jsx>{`
        .dynamic-demo {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 2rem;
          border-radius: 8px;
          margin-bottom: 2rem;
        }
        
        .model-selector {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }
        
        .test-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .test-section {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .test-section h3 {
          margin: 0 0 1rem 0;
          color: #667eea;
        }
        
        .success {
          color: #10b981;
          font-weight: 600;
        }
        
        .error {
          color: #ef4444;
          font-weight: 600;
        }
        
        .test-button, button {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          margin-right: 0.5rem;
        }
        
        .test-button:hover, button:hover {
          background: #5568d3;
        }
        
        .test-button:disabled, button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }
        
        .pagination-controls {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin: 1rem 0;
        }
        
        pre {
          background: #f3f4f6;
          padding: 1rem;
          border-radius: 4px;
          overflow: auto;
          max-height: 300px;
          font-size: 12px;
        }
        
        select {
          padding: 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .results-panel {
          background: #1f2937;
          color: #f3f4f6;
          padding: 1.5rem;
          border-radius: 8px;
          max-height: 400px;
          overflow: auto;
        }
        
        .results-panel h3 {
          color: white;
          margin-top: 0;
        }
        
        .result-line {
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 12px;
          padding: 0.25rem 0;
          border-bottom: 1px solid #374151;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <h1>🚀 Dynamic GraphQL Demo</h1>
        <p>Test the Universal Dynamic GraphQL System</p>
        <p style={{ opacity: 0.9, fontSize: '14px' }}>
          One system to rule them all - No custom resolvers needed!
        </p>
      </div>

      {/* Model Selector */}
      <div className="model-selector">
        <label>
          <strong>Select Model to Test:</strong>
          <br />
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            <option value="task">Task</option>
            <option value="user">User</option>
            <option value="post">Post</option>
            <option value="comment">Comment</option>
            <option value="product">Product</option>
            <option value="category">Category</option>
            <option value="invoice">Invoice</option>
            <option value="page">Page</option>
            <option value="notification">Notification</option>
          </select>
        </label>
      </div>

      {/* Test Grid */}
      <div className="test-grid">
        <Test1_FindMany />
        <Test2_Pagination />
        <Test3_Count />
        <Test4_CRUD />
        <Test5_CreateOne />
        <Test6_AdvancedQuery />
      </div>

      {/* Results Panel */}
      <div className="results-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📊 Test Results</h3>
          <button onClick={() => setTestResults([])}>Clear</button>
        </div>
        {testResults.length === 0 ? (
          <p style={{ opacity: 0.6 }}>No results yet. Run some tests!</p>
        ) : (
          <div>
            {testResults.map((result, idx) => (
              <div key={idx} className="result-line">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="test-section" style={{ marginTop: '2rem' }}>
        <h3>📖 Instructions</h3>
        <ol>
          <li>Select a model from the dropdown</li>
          <li>All tests automatically update for that model</li>
          <li>Run CRUD test to see Create/Update/Delete in action</li>
          <li>Check the results panel for operation logs</li>
          <li>View the browser console for detailed logs</li>
        </ol>
        <p><strong>Note:</strong> Make sure you're authenticated and have data in your database!</p>
      </div>
    </div>
  );
}
