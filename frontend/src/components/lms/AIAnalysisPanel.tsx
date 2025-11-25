'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Tag,
  BookOpen,
  TrendingUp,
  FileText,
  Sparkles,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Type definition for SourceDocument
interface SourceDocument {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  aiSummary?: string;
  aiKeywords?: string[];
  aiTopics?: string[];
  isAiAnalyzed?: boolean;
  categoryId?: string;
  tags?: string[];
  category?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface AIAnalysisPanelProps {
  documents: SourceDocument[];
  className?: string;
}

interface AggregatedAnalysis {
  keywords: { text: string; count: number }[];
  topics: { text: string; count: number }[];
  summaries: { title: string; summary: string }[];
  totalDocuments: number;
}

export function AIAnalysisPanel({ documents, className }: AIAnalysisPanelProps) {
  const analysis = React.useMemo<AggregatedAnalysis>(() => {
    if (documents.length === 0) {
      return {
        keywords: [],
        topics: [],
        summaries: [],
        totalDocuments: 0,
      };
    }

    // Aggregate keywords
    const keywordMap = new Map<string, number>();
    documents.forEach((doc) => {
      doc.aiKeywords?.forEach((kw: string) => {
        keywordMap.set(kw, (keywordMap.get(kw) || 0) + 1);
      });
    });

    // Aggregate topics
    const topicMap = new Map<string, number>();
    documents.forEach((doc) => {
      doc.aiTopics?.forEach((topic: string) => {
        topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
      });
    });

    // Get summaries
    const summaries = documents
      .filter((doc) => doc.aiSummary)
      .map((doc) => ({
        title: doc.title,
        summary: doc.aiSummary!,
      }));

    return {
      keywords: Array.from(keywordMap.entries())
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
      topics: Array.from(topicMap.entries())
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      summaries,
      totalDocuments: documents.length,
    };
  }, [documents]);

  if (documents.length === 0) {
    return (
      <Card className={cn('border-dashed', className)}>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <Brain className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">Chọn tài liệu nguồn để xem phân tích AI</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('shadow-lg border-indigo-100', className)}>
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Brain className="w-5 h-5" />
              Phân Tích AI
            </CardTitle>
            <CardDescription>
              Tổng hợp từ {analysis.totalDocuments} tài liệu nguồn
            </CardDescription>
          </div>
          <Sparkles className="w-6 h-6 text-purple-500" />
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Keywords */}
        {analysis.keywords.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="w-4 h-4" />
              Từ khóa chính ({analysis.keywords.length})
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.keywords.map((kw) => (
                <Badge
                  key={kw.text}
                  variant="secondary"
                  className="px-2 py-1 text-xs font-normal"
                >
                  {kw.text}
                  {kw.count > 1 && (
                    <span className="ml-1 text-xs text-muted-foreground">×{kw.count}</span>
                  )}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Topics */}
        {analysis.topics.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BookOpen className="w-4 h-4" />
              Chủ đề ({analysis.topics.length})
            </div>
            <div className="space-y-2">
              {analysis.topics.map((topic) => (
                <div
                  key={topic.text}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                >
                  <span className="text-sm font-medium">{topic.text}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{
                          width: `${(topic.count / analysis.totalDocuments) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground min-w-[2ch] text-right">
                      {topic.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Summaries */}
        {analysis.summaries.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FileText className="w-4 h-4" />
              Tóm tắt nội dung
            </div>
            <ScrollArea className="h-auto max-h-60">
              <div className="space-y-3 pr-3">
                {analysis.summaries.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 flex items-center justify-center w-5 h-5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {item.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* AI Recommendation */}
        <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
          <div className="flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-purple-800">
              <p className="font-semibold mb-1">💡 Gợi ý từ AI:</p>
              <p>
                Dựa trên phân tích, khóa học nên tập trung vào{' '}
                <strong>{analysis.topics.slice(0, 2).map((t) => t.text).join(' và ')}</strong>,
                phù hợp với người học muốn nắm vững các chủ đề này.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
