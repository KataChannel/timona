'use client';

import React, { useState, useMemo } from 'react';
import { SearchResult } from '../../types/search';
import { Task } from '../../types/task';
import { TaskCard } from '../tasks/TaskCard';
import { VirtualScroll } from '../ui/VirtualScroll';

interface SearchResultsProps {
  results: SearchResult<Task>;
  loading?: boolean;
  query?: string;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  viewMode?: 'list' | 'grid' | 'compact';
  showFacets?: boolean;
  onFacetClick?: (facet: string, value: string) => void;
  className?: string;
}

export function SearchResults({
  results,
  loading = false,
  query = '',
  onTaskClick,
  onTaskUpdate,
  onLoadMore,
  hasMore = false,
  viewMode = 'list',
  showFacets = true,
  onFacetClick,
  className = ''
}: SearchResultsProps) {
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);

  // Handle task selection
  const handleTaskSelect = (taskId: string, selected: boolean) => {
    setSelectedTasks(prev => 
      selected 
        ? [...prev, taskId]
        : prev.filter(id => id !== taskId)
    );
  };

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    setSelectedTasks(selected ? results.items.map(task => task.id) : []);
  };

  // Render facets
  const renderFacets = () => {
    if (!showFacets || !results.facets) return null;

    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Filter Results</h3>
        <div className="space-y-4">
          {Object.entries(results.facets).map(([facetKey, facetValues]) => (
            <div key={facetKey}>
              <h4 className="text-xs font-medium text-gray-700 mb-2 capitalize">
                {facetKey.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </h4>
              
              <div className="space-y-1">
                {facetValues.slice(0, 5).map(({ key, count }) => (
                  <button
                    key={key}
                    onClick={() => onFacetClick?.(facetKey, key)}
                    className="
                      flex items-center justify-between w-full px-2 py-1
                      text-sm text-left hover:bg-gray-50 rounded
                      transition-colors duration-150
                    "
                  >
                    <span className="text-gray-700 capitalize">
                      {key.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </button>
                ))}
                
                {facetValues.length > 5 && (
                  <button className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1">
                    Show {facetValues.length - 5} more...
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render search stats
  const renderSearchStats = () => (
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm text-gray-600">
        {results.total > 0 ? (
          <>
            Found <span className="font-medium">{results.total.toLocaleString()}</span> results
            {query && (
              <>
                {' '}for "<span className="font-medium">{query}</span>"
              </>
            )}
            <span className="text-gray-400 ml-2">
              ({results.took}ms)
            </span>
          </>
        ) : (
          <>
            No results found
            {query && (
              <>
                {' '}for "<span className="font-medium">{query}</span>"
              </>
            )}
          </>
        )}
      </div>
      
      {selectedTasks.length > 0 && (
        <div className="text-sm text-gray-600">
          <span className="font-medium">{selectedTasks.length}</span> selected
        </div>
      )}
    </div>
  );

  // Render bulk actions
  const renderBulkActions = () => {
    if (selectedTasks.length === 0) return null;

    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-blue-800">
            {selectedTasks.length} tasks selected
          </span>
          
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
              Update Status
            </button>
            <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
              Assign
            </button>
            <button className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded transition-colors">
              Add Tags
            </button>
            <button 
              onClick={() => setSelectedTasks([])}
              className="px-3 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render view mode selector
  const renderViewModeSelector = () => (
    <div className="flex items-center space-x-1 mb-4">
      <span className="text-sm text-gray-600 mr-2">View:</span>
      
      {(['list', 'grid', 'compact'] as const).map(mode => (
        <button
          key={mode}
          className={`
            px-3 py-1 text-sm font-medium rounded transition-colors
            ${viewMode === mode
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }
          `}
        >
          {mode.charAt(0).toUpperCase() + mode.slice(1)}
        </button>
      ))}
    </div>
  );

  // Render task item based on view mode
  const renderTaskItem = ({ item, index, style }: { item: Task; index: number; style: React.CSSProperties }) => {
    const isSelected = selectedTasks.includes(item.id);

    if (viewMode === 'compact') {
      return (
        <div style={style} className="px-2 py-1">
          <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => handleTaskSelect(item.id, e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.title}
                </h4>
                
                <span className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${item.priority === 'URGENT' ? 'bg-red-100 text-red-700' :
                    item.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                    item.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }
                `}>
                  {item.priority}
                </span>
                
                <span className={`
                  px-2 py-0.5 text-xs font-medium rounded-full
                  ${item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                    item.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }
                `}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              
              {item.description && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {item.description}
                </p>
              )}
            </div>
            
            <div className="text-xs text-gray-400">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={style} className="px-2 py-2">
        <TaskCard
          task={item as any}
          onEdit={() => onTaskClick?.(item)}
        />
      </div>
    );
  };

  // Empty state
  if (!loading && results.total === 0) {
    return (
      <div className={`search-results ${className}`}>
        {showFacets && renderFacets()}
        
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          
          <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
          
          <p className="mt-2 text-sm text-gray-500">
            {query ? (
              <>
                We couldn't find any tasks matching "<strong>{query}</strong>".
                <br />
                Try adjusting your search terms or filters.
              </>
            ) : (
              'Try entering a search term or adjusting your filters.'
            )}
          </p>
          
          <div className="mt-6">
            <button className="text-sm text-blue-600 hover:text-blue-700">
              Clear all filters
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`search-results ${className}`}>
      <div className="flex gap-6">
        {/* Facets sidebar */}
        {showFacets && (
          <div className="w-64 flex-shrink-0">
            {renderFacets()}
          </div>
        )}
        
        {/* Main results */}
        <div className="flex-1 min-w-0">
          {renderSearchStats()}
          {renderBulkActions()}
          {renderViewModeSelector()}
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-20 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Virtual scrolling for large result sets */}
              {results.items.length > 100 ? (
                <VirtualScroll
                  items={results.items.map(task => ({ id: task.id, data: task }))}
                  itemHeight={viewMode === 'compact' ? 60 : viewMode === 'grid' ? 200 : 120}
                  containerHeight={600}
                  renderItem={({ item, index, style }) =>
                    renderTaskItem({ item: item.data, index, style })
                  }
                  className="border border-gray-200 rounded-lg"
                />
              ) : (
                <div className={`
                  ${viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                    : 'space-y-2'
                  }
                `}>
                  {results.items.map((task, index) => 
                    renderTaskItem({ 
                      item: task, 
                      index, 
                      style: {} 
                    })
                  )}
                </div>
              )}
              
              {/* Load more button */}
              {hasMore && (
                <div className="text-center mt-6">
                  <button
                    onClick={onLoadMore}
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : 'Load More Results'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}