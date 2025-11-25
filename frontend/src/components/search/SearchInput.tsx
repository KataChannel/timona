'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { SearchQuery, SearchResult, SearchSuggestion } from '../../types/search';

interface SearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  onSuggestionSelect?: (suggestion: string) => void;
  suggestions?: SearchSuggestion[];
  loading?: boolean;
  className?: string;
  showAdvanced?: boolean;
  filters?: SearchFilters;
  onFiltersChange?: (filters: SearchFilters) => void;
}

export interface SearchFilters {
  status?: string[];
  priority?: string[];
  assignees?: string[];
  authors?: string[];
  tags?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
    field: 'created' | 'updated' | 'due';
  };
  hasAttachments?: boolean;
  hasComments?: boolean;
  isOverdue?: boolean;
}

export function SearchInput({
  placeholder = 'Search tasks...',
  value = '',
  onChange,
  onSearch,
  onSuggestionSelect,
  suggestions = [],
  loading = false,
  className = '',
  showAdvanced = false,
  filters = {},
  onFiltersChange
}: SearchInputProps) {
  const [query, setQuery] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue);
    onChange?.(newValue);
    setShowSuggestions(newValue.length > 0);
    setSelectedSuggestion(-1);
  }, [onChange]);

  // Handle search
  const handleSearch = useCallback(() => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);
    }
  }, [query, onSearch]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestion >= 0 && suggestions[selectedSuggestion]) {
        const suggestion = suggestions[selectedSuggestion];
        setQuery(suggestion.text);
        onSuggestionSelect?.(suggestion.text);
        setShowSuggestions(false);
      } else {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        Math.min(prev + 1, suggestions.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    }
  }, [selectedSuggestion, suggestions, handleSearch, onSuggestionSelect]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    onSuggestionSelect?.(suggestion.text);
    setShowSuggestions(false);
  }, [onSuggestionSelect]);

  // Handle filter change
  const handleFilterChange = useCallback((key: keyof SearchFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange?.(newFilters);
  }, [filters, onFiltersChange]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    return Object.entries(filters).reduce((count, [key, value]) => {
      if (key === 'dateRange') {
        return count + (value?.start || value?.end ? 1 : 0);
      }
      if (Array.isArray(value)) {
        return count + value.length;
      }
      if (typeof value === 'boolean' && value) {
        return count + 1;
      }
      return count;
    }, 0);
  }, [filters]);

  return (
    <div className={`search-input-container relative ${className}`}>
      {/* Main search input */}
      <div className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="
              w-full pl-10 pr-4 py-3 
              border border-gray-300 rounded-lg 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent
              text-sm placeholder-gray-500
              transition-all duration-200
            "
            onFocus={() => setShowSuggestions(query.length > 0)}
            onBlur={() => {
              // Delay to allow suggestion clicks
              setTimeout(() => setShowSuggestions(false), 200);
            }}
          />
          
          {/* Search icon */}
          <div className="absolute left-3 text-gray-400">
            {loading ? (
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>

          {/* Advanced filters toggle */}
          {showAdvanced && (
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`
                absolute right-3 p-1 rounded transition-colors
                ${showAdvancedFilters 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600'
                }
              `}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.text}-${index}`}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`
                  w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3
                  ${index === selectedSuggestion ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}
                `}
              >
                <div className="flex-shrink-0">
                  {suggestion.type === 'completion' && (
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  )}
                  {suggestion.type === 'phrase' && (
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  )}
                  {suggestion.type === 'term' && (
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.text}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {suggestion.type} • Score: {suggestion.score.toFixed(2)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Advanced Filters</h3>
            <button
              onClick={() => onFiltersChange?.({})}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <div className="space-y-1">
                {['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(status => (
                  <label key={status} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status) || false}
                      onChange={(e) => {
                        const current = filters.status || [];
                        const updated = e.target.checked
                          ? [...current, status]
                          : current.filter(s => s !== status);
                        handleFilterChange('status', updated);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="capitalize">{status.replace('_', ' ').toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Priority</label>
              <div className="space-y-1">
                {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map(priority => (
                  <label key={priority} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.priority?.includes(priority) || false}
                      onChange={(e) => {
                        const current = filters.priority || [];
                        const updated = e.target.checked
                          ? [...current, priority]
                          : current.filter(p => p !== priority);
                        handleFilterChange('priority', updated);
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                    />
                    <span className="capitalize">{priority.toLowerCase()}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date range filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date Range</label>
              <select
                value={filters.dateRange?.field || 'created'}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  field: e.target.value as 'created' | 'updated' | 'due'
                })}
                className="w-full mb-2 text-xs border border-gray-300 rounded px-2 py-1"
              >
                <option value="created">Created</option>
                <option value="updated">Updated</option>
                <option value="due">Due</option>
              </select>
              
              <input
                type="date"
                value={filters.dateRange?.start?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  field: filters.dateRange?.field || 'created',
                  start: e.target.value ? new Date(e.target.value) : null
                })}
                className="w-full mb-1 text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="Start date"
              />
              
              <input
                type="date"
                value={filters.dateRange?.end?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleFilterChange('dateRange', {
                  ...filters.dateRange,
                  field: filters.dateRange?.field || 'created',
                  end: e.target.value ? new Date(e.target.value) : null
                })}
                className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                placeholder="End date"
              />
            </div>
          </div>

          {/* Boolean filters */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={filters.hasAttachments || false}
                onChange={(e) => handleFilterChange('hasAttachments', e.target.checked || undefined)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              Has attachments
            </label>
            
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={filters.hasComments || false}
                onChange={(e) => handleFilterChange('hasComments', e.target.checked || undefined)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              Has comments
            </label>
            
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={filters.isOverdue || false}
                onChange={(e) => handleFilterChange('isOverdue', e.target.checked || undefined)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
              />
              Is overdue
            </label>
          </div>
        </div>
      )}
    </div>
  );
}