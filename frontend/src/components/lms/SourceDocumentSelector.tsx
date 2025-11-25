'use client';

import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Check, ChevronsUpDown, FileText, Video, Link, Image, Music, File } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  GET_SOURCE_DOCUMENTS,
  GET_SOURCE_DOCUMENT_CATEGORIES,
} from '@/graphql/lms/source-documents';

interface SourceDocument {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  url?: string;
  fileName?: string;
  fileSize?: number;
  thumbnailUrl?: string;
  categoryId?: string;
  tags?: string[];
  aiKeywords?: string[];
  createdAt: string;
  category?: {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    color?: string;
  };
}

interface SourceDocumentCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
}

interface SourceDocumentSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  disabled?: boolean;
  maxSelection?: number;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  FILE: File,
  VIDEO: Video,
  TEXT: FileText,
  AUDIO: Music,
  LINK: Link,
  IMAGE: Image,
};

const TYPE_COLORS: Record<string, string> = {
  FILE: 'bg-blue-100 text-blue-700 border-blue-200',
  VIDEO: 'bg-purple-100 text-purple-700 border-purple-200',
  TEXT: 'bg-green-100 text-green-700 border-green-200',
  AUDIO: 'bg-orange-100 text-orange-700 border-orange-200',
  LINK: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  IMAGE: 'bg-pink-100 text-pink-700 border-pink-200',
};

const TYPE_LABELS: Record<string, string> = {
  FILE: 'Tài liệu',
  VIDEO: 'Video',
  TEXT: 'Văn bản',
  AUDIO: 'Audio',
  LINK: 'Liên kết',
  IMAGE: 'Hình ảnh',
};

export function SourceDocumentSelector({
  value,
  onChange,
  className,
  disabled = false,
  maxSelection,
}: SourceDocumentSelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');

  // Fetch source documents
  const { data: documentsData, loading: documentsLoading } = useQuery(GET_SOURCE_DOCUMENTS, {
    variables: {
      filter: {
        statuses: ['PUBLISHED'],
        ...(selectedCategory !== 'all' && { categoryId: selectedCategory }),
      },
      page: 1,
      limit: 100,
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery(GET_SOURCE_DOCUMENT_CATEGORIES);

  const documents: SourceDocument[] = documentsData?.sourceDocuments || [];
  const categories: SourceDocumentCategory[] = categoriesData?.sourceDocumentCategories || [];

  // Filter documents based on search
  const filteredDocuments = React.useMemo(() => {
    if (!searchQuery) return documents;
    
    const query = searchQuery.toLowerCase();
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query) ||
        doc.aiKeywords?.some((kw) => kw.toLowerCase().includes(query))
    );
  }, [documents, searchQuery]);

  const selectedDocuments = React.useMemo(() => {
    return documents.filter((doc) => value.includes(doc.id));
  }, [documents, value]);

  const handleSelect = (documentId: string) => {
    const isSelected = value.includes(documentId);
    
    if (isSelected) {
      onChange(value.filter((id) => id !== documentId));
    } else {
      if (maxSelection && value.length >= maxSelection) {
        return; // Don't add if max selection reached
      }
      onChange([...value, documentId]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const getTypeIcon = (type: string) => {
    const Icon = TYPE_ICONS[type] || File;
    return Icon;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'w-full justify-between h-auto min-h-[40px] py-2',
              selectedDocuments.length === 0 && 'text-muted-foreground'
            )}
          >
            <div className="flex flex-wrap gap-1 flex-1 items-center">
              {selectedDocuments.length === 0 ? (
                <span>Chọn tài liệu nguồn...</span>
              ) : (
                <span className="text-sm font-medium">
                  Đã chọn {selectedDocuments.length} tài liệu
                  {maxSelection && ` / ${maxSelection}`}
                </span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start" style={{ width: 'var(--radix-popover-trigger-width)' }}>
          <Command>
            <CommandInput
              placeholder="Tìm kiếm tài liệu..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              <CommandEmpty>
                {documentsLoading ? 'Đang tải...' : 'Không tìm thấy tài liệu'}
              </CommandEmpty>
              
              {/* Category filter */}
              {categories.length > 0 && (
                <>
                  <CommandGroup heading="Danh mục">
                    <ScrollArea className="h-auto max-h-32">
                      <CommandItem
                        onSelect={() => setSelectedCategory('all')}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedCategory === 'all' ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <span>Tất cả danh mục</span>
                      </CommandItem>
                      {categories.map((category) => (
                        <CommandItem
                          key={category.id}
                          onSelect={() => setSelectedCategory(category.id)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedCategory === category.id ? 'opacity-100' : 'opacity-0'
                            )}
                          />
                          <span>{category.name}</span>
                        </CommandItem>
                      ))}
                    </ScrollArea>
                  </CommandGroup>
                  <CommandSeparator />
                </>
              )}

              {/* Documents list */}
              <CommandGroup heading={`Tài liệu (${filteredDocuments.length})`}>
                <ScrollArea className="h-auto max-h-80">
                  {filteredDocuments.map((document) => {
                    const isSelected = value.includes(document.id);
                    const Icon = getTypeIcon(document.type);
                    
                    return (
                      <CommandItem
                        key={document.id}
                        onSelect={() => handleSelect(document.id)}
                        className="cursor-pointer py-3"
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4 shrink-0',
                            isSelected ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-medium truncate">{document.title}</span>
                            <Badge
                              variant="outline"
                              className={cn('text-xs shrink-0', TYPE_COLORS[document.type])}
                            >
                              {TYPE_LABELS[document.type]}
                            </Badge>
                          </div>
                          
                          {document.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {document.description}
                            </p>
                          )}
                          
                          <div className="flex flex-wrap gap-1">
                            {document.aiKeywords?.slice(0, 3).map((keyword) => (
                              <Badge
                                key={keyword}
                                variant="secondary"
                                className="text-xs px-1.5 py-0"
                              >
                                {keyword}
                              </Badge>
                            ))}
                            {document.fileSize && (
                              <span className="text-xs text-muted-foreground">
                                {formatFileSize(document.fileSize)}
                              </span>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    );
                  })}
                </ScrollArea>
              </CommandGroup>
            </CommandList>
          </Command>

          {value.length > 0 && (
            <div className="border-t p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="w-full text-xs"
              >
                Xóa tất cả ({value.length})
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Selected documents display */}
      {selectedDocuments.length > 0 && (
        <ScrollArea className="h-auto max-h-40">
          <div className="space-y-2">
            {selectedDocuments.map((document) => {
              const Icon = getTypeIcon(document.type);
              
              return (
                <div
                  key={document.id}
                  className="flex items-center gap-2 p-2 bg-muted/50 rounded-md text-sm"
                >
                  <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <span className="flex-1 truncate font-medium">{document.title}</span>
                  <Badge
                    variant="outline"
                    className={cn('text-xs shrink-0', TYPE_COLORS[document.type])}
                  >
                    {TYPE_LABELS[document.type]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelect(document.id)}
                    className="h-6 w-6 p-0 hover:bg-destructive/10"
                  >
                    <span className="sr-only">Xóa</span>
                    ×
                  </Button>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
      
      {maxSelection && (
        <p className="text-xs text-muted-foreground">
          Tối đa {maxSelection} tài liệu. Đã chọn: {value.length}/{maxSelection}
        </p>
      )}
    </div>
  );
}
