'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Lightbulb,
  BarChart3,
  Zap,
  MessageSquare
} from 'lucide-react';

// Types
interface SmartSuggestion {
  type: 'task_creation' | 'task_optimization' | 'deadline_adjustment' | 'workload_balance' | 'process_improvement';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  reasoning: string[];
  action?: {
    type: string;
    parameters: Record<string, any>;
  };
}

interface WorkloadAnalysis {
  shouldTakeOnTask: boolean;
  estimatedEffort: number;
  suggestedDeadline: Date;
  workloadImpact: 'low' | 'medium' | 'high';
  alternatives: string[];
}

interface AiInsights {
  workloadAnalysis: WorkloadAnalysis;
  smartSuggestions: SmartSuggestion[];
  productivityScore: number;
  completionRate: number;
  averageTaskComplexity: number;
}

interface ContentAnalysis {
  extractedTasks: string[];
  suggestedTags: string[];
  estimatedComplexity: number;
  suggestedPriority: string;
  relatedTasks: string[];
  keyPhrases: string[];
}

const AiDashboard: React.FC = () => {
  const [insights, setInsights] = useState<AiInsights | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAiInsights();
  }, []);

  const loadAiInsights = async () => {
    try {
      setLoading(true);
      // Mock data for demo
      const mockInsights: AiInsights = {
        productivityScore: 85,
        completionRate: 78,
        averageTaskComplexity: 6.5,
        workloadAnalysis: {
          shouldTakeOnTask: true,
          estimatedEffort: 4,
          suggestedDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          workloadImpact: 'medium',
          alternatives: [
            'Consider delegating lower-priority tasks',
            'Focus on completing current tasks first'
          ]
        },
        smartSuggestions: [
          {
            type: 'workload_balance',
            title: 'Optimize task scheduling',
            description: 'You have 3 high-priority tasks due this week. Consider redistributing them.',
            confidence: 0.85,
            impact: 'high',
            reasoning: [
              'Multiple high-priority tasks clustered',
              'Better distribution improves completion rates'
            ]
          }
        ]
      };
      setInsights(mockInsights);
    } catch (err) {
      setError('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const analyzeContent = async () => {
    if (!content.trim()) return;

    try {
      setLoading(true);
      const mockAnalysis: ContentAnalysis = {
        extractedTasks: [
          'Review quarterly financial reports',
          'Schedule team meeting for project kickoff',
          'Update product documentation'
        ],
        suggestedTags: ['finance', 'meetings', 'documentation'],
        estimatedComplexity: 7,
        suggestedPriority: 'HIGH',
        relatedTasks: ['Previous quarterly review', 'Team planning session'],
        keyPhrases: ['quarterly review', 'team meeting', 'product update']
      };
      setContentAnalysis(mockAnalysis);
    } catch (err) {
      setError('Failed to analyze content');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !insights) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading AI insights...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">AI-Powered Task Management</h1>
      </div>

      {error && (
        <div className="border border-red-300 bg-red-50 text-red-800 px-4 py-3 rounded-md flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Productivity Overview */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Productivity Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.productivityScore}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${insights.productivityScore}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.completionRate}%</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${insights.completionRate}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Complexity</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.averageTaskComplexity}/10</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${insights.averageTaskComplexity * 10}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Smart Suggestions */}
      {insights?.smartSuggestions && insights.smartSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Smart Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {insights.smartSuggestions.map((suggestion, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{suggestion.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(suggestion.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                  <Button size="sm" variant="outline">
                    <Zap className="h-3 w-3 mr-1" />
                    Apply Suggestion
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Content Analysis
          </CardTitle>
          <CardDescription>
            Analyze text to extract tasks and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="Paste meeting notes, emails, or any text to extract tasks..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            
            <Button onClick={analyzeContent} disabled={loading || !content.trim()}>
              {loading ? 'Analyzing...' : 'Analyze Content'}
            </Button>

            {contentAnalysis && (
              <div className="space-y-4 mt-4 p-4 bg-muted rounded-lg">
                {contentAnalysis.extractedTasks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Extracted Tasks:</h4>
                    <ul className="space-y-2">
                      {contentAnalysis.extractedTasks.map((task, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-background rounded">
                          <span className="text-sm">{task}</span>
                          <Button size="sm" variant="ghost">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Create Task
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Priority:</h4>
                    <Badge variant="outline">{contentAnalysis.suggestedPriority}</Badge>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Estimated Complexity:</h4>
                    <div className="flex items-center gap-2">
                      <span>{contentAnalysis.estimatedComplexity}/10</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full" 
                          style={{ width: `${contentAnalysis.estimatedComplexity * 10}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {contentAnalysis.suggestedTags.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Suggested Tags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {contentAnalysis.suggestedTags.map((tag, index) => (
                        <Badge key={index} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiDashboard;