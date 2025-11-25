'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const UNIVERSAL_SEARCH_QUERY = gql`
  query UniversalSearch($input: OramaSearchInput!) {
    universalSearch(input: $input) {
      tasks {
        hits {
          id
          score
          document
        }
        count
        elapsed {
          formatted
        }
      }
      users {
        hits {
          id
          score
          document
        }
        count
      }
      affiliateCampaigns {
        hits {
          id
          score
          document
        }
        count
      }
      affiliateLinks {
        hits {
          id
          score
          document
        }
        count
      }
    }
  }
`;

interface SearchResult {
  id: string;
  score: number;
  document: any;
  type: 'task' | 'user' | 'campaign' | 'link';
}

export function UniversalSearch() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [search, { loading, data }] = useLazyQuery(UNIVERSAL_SEARCH_QUERY);

  // Process search results
  useEffect(() => {
    if (data?.universalSearch) {
      const allResults: SearchResult[] = [];

      // Add tasks
      data.universalSearch.tasks.hits.forEach((hit: any) => {
        allResults.push({
          id: hit.id,
          score: hit.score,
          document: hit.document,
          type: 'task',
        });
      });

      // Add users
      data.universalSearch.users.hits.forEach((hit: any) => {
        allResults.push({
          id: hit.id,
          score: hit.score,
          document: hit.document,
          type: 'user',
        });
      });

      // Add affiliate campaigns
      data.universalSearch.affiliateCampaigns.hits.forEach((hit: any) => {
        allResults.push({
          id: hit.id,
          score: hit.score,
          document: hit.document,
          type: 'campaign',
        });
      });

      // Add affiliate links
      data.universalSearch.affiliateLinks.hits.forEach((hit: any) => {
        allResults.push({
          id: hit.id,
          score: hit.score,
          document: hit.document,
          type: 'link',
        });
      });

      // Sort by score (descending)
      allResults.sort((a, b) => b.score - a.score);

      setResults(allResults.slice(0, 10)); // Limit to top 10
    }
  }, [data]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      search({
        variables: {
          input: {
            term: query,
            limit: 20,
          },
        },
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, search]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    },
    [isOpen, results, selectedIndex]
  );

  const handleResultClick = (result: SearchResult) => {
    // Navigate based on result type
    let url = '';
    switch (result.type) {
      case 'task':
        url = `/tasks/${result.id}`;
        break;
      case 'user':
        url = `/admin/users/${result.id}`;
        break;
      case 'campaign':
        url = `/admin/affiliate/campaigns?id=${result.id}`;
        break;
      case 'link':
        url = `/admin/affiliate/links?id=${result.id}`;
        break;
    }
    
    if (url) {
      window.location.href = url;
    }
    
    setIsOpen(false);
    setQuery('');
  };

  const getResultTitle = (result: SearchResult): string => {
    switch (result.type) {
      case 'task':
        return result.document.title || 'Untitled Task';
      case 'user':
        return result.document.name || result.document.email || 'Unknown User';
      case 'campaign':
        return result.document.name || 'Unnamed Campaign';
      case 'link':
        return result.document.code || result.document.url || 'Affiliate Link';
      default:
        return 'Unknown';
    }
  };

  const getResultDescription = (result: SearchResult): string => {
    switch (result.type) {
      case 'task':
        return result.document.description || 'No description';
      case 'user':
        return result.document.email || '';
      case 'campaign':
        return result.document.description || '';
      case 'link':
        return result.document.url || '';
      default:
        return '';
    }
  };

  const getResultBadgeColor = (type: string): string => {
    switch (type) {
      case 'task':
        return 'bg-blue-500';
      case 'user':
        return 'bg-green-500';
      case 'campaign':
        return 'bg-purple-500';
      case 'link':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search tasks, users, campaigns..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-lg">
          {loading && (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
            </div>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleResultClick(result)}
                  className={cn(
                    'w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-start gap-3',
                    index === selectedIndex && 'bg-muted'
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <Badge className={cn('mt-0.5 shrink-0', getResultBadgeColor(result.type))}>
                    {result.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{getResultTitle(result)}</div>
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      {getResultDescription(result)}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">
                    {Math.round(result.score * 100)}%
                  </div>
                </button>
              ))}
            </div>
          )}

          {data?.universalSearch && (
            <div className="border-t px-4 py-2 text-xs text-muted-foreground">
              Found {data.universalSearch.tasks.count} tasks, {data.universalSearch.users.count} users,{' '}
              {data.universalSearch.affiliateCampaigns.count} campaigns in{' '}
              {data.universalSearch.tasks.elapsed.formatted}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
