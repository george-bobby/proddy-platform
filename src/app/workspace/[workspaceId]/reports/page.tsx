'use client';

import { BarChart, Loader, PieChart, LineChart, Search, Users, Hash, Calendar, CheckSquare, MessageSquare, Download, FileText, Filter, Activity } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { format, subDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { useWorkspaceId } from '@/hooks/use-workspace-id';
import { useTrackActivity } from '@/features/reports/hooks/use-track-activity';
import { WorkspaceToolbar } from '../toolbar';

// Import chart components for the Messages and Tasks tabs
import { BarChart as BarChartComponent, PieChart as PieChartComponent, LineChart as LineChartComponent, HorizontalBarChart } from '@/features/reports/components/charts';

// Import our dashboard components
import {
  UserActivityDashboard,
  ChannelActivityDashboard,
  OverviewDashboard,
  ContentAnalysisDashboard,
  PerformanceMetricsDashboard
} from '@/features/reports/components';
const ReportsPage = () => {
  // Set document title
  useDocumentTitle('Reports');

  const workspaceId = useWorkspaceId();
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate date range based on selected time range
  const endDate = useMemo(() => Date.now(), []); // Only calculate once on component mount
  const startDate = useMemo(() => {
    switch (timeRange) {
      case '7d': return subDays(endDate, 7).getTime();
      case '30d': return subDays(endDate, 30).getTime();
      case '90d': return subDays(endDate, 90).getTime();
      default: return subDays(endDate, 30).getTime();
    }
  }, [timeRange, endDate]);

  // Track page view
  useTrackActivity({
    workspaceId,
    activityType: 'reports_page_view',
  });

  // Fetch workspace overview data
  const overviewData = useQuery(
    api.analytics.getWorkspaceOverview,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );
  const isOverviewLoading = overviewData === undefined;

  // Fetch message analytics data
  const messageData = useQuery(
    api.analytics.getMessageAnalytics,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );
  const isMessageLoading = messageData === undefined;

  // Fetch task analytics data
  const taskData = useQuery(
    api.analytics.getTaskAnalytics,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );
  const isTaskLoading = taskData === undefined;

  // Handle export
  const handleExport = () => {
    if (!overviewData) return;

    setIsExporting(true);

    try {
      // Create export data
      const exportData = {
        generatedAt: new Date().toISOString(),
        timeRange,
        overview: overviewData,
        messages: messageData,
        tasks: taskData,
      };

      // Convert to JSON
      const jsonData = JSON.stringify(exportData, null, 2);

      // Create download link
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to export data:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // We don't need to prepare chart data here as we're using the dashboard components

  return (
    <div className="flex h-full flex-col">
      <WorkspaceToolbar>
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <BarChart className="mr-2 size-5" />
          <span className="truncate">Reports</span>
        </Button>
      </WorkspaceToolbar>
      <div className="flex h-[calc(100%-4rem)] bg-white">
        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8">
            {/* Header with search and filters */}
            <div className="mb-8 space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-md border border-input overflow-hidden">
                    <Button
                      type="button"
                      variant={timeRange === '7d' ? 'default' : 'ghost'}
                      className="rounded-none border-0"
                      onClick={() => setTimeRange('7d')}
                    >
                      7 days
                    </Button>
                    <Button
                      type="button"
                      variant={timeRange === '30d' ? 'default' : 'ghost'}
                      className="rounded-none border-0"
                      onClick={() => setTimeRange('30d')}
                    >
                      30 days
                    </Button>
                    <Button
                      type="button"
                      variant={timeRange === '90d' ? 'default' : 'ghost'}
                      className="rounded-none border-0"
                      onClick={() => setTimeRange('90d')}
                    >
                      90 days
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleExport}
                    disabled={isExporting || isOverviewLoading}
                  >
                    {isExporting ? (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    Export
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Reports</h4>
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Data Types</h5>
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline">Messages</Button>
                          <Button size="sm" variant="outline">Tasks</Button>
                          <Button size="sm" variant="outline">Users</Button>
                          <Button size="sm" variant="outline">Channels</Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 mb-4">
                <TabsTrigger value="overview" onClick={() => setActiveTab('overview')}>
                  <BarChart className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="users" onClick={() => setActiveTab('users')}>
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="channels" onClick={() => setActiveTab('channels')}>
                  <Hash className="h-4 w-4 mr-2" />
                  Channels
                </TabsTrigger>
                <TabsTrigger value="messages" onClick={() => setActiveTab('messages')}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Messages
                </TabsTrigger>
                <TabsTrigger value="content" onClick={() => setActiveTab('content')}>
                  <FileText className="h-4 w-4 mr-2" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="performance" onClick={() => setActiveTab('performance')}>
                  <Activity className="h-4 w-4 mr-2" />
                  Performance
                </TabsTrigger>
                <TabsTrigger value="tasks" onClick={() => setActiveTab('tasks')}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Tasks
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                {workspaceId ? (
                  <OverviewDashboard workspaceId={workspaceId} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                )}
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                {workspaceId ? (
                  <UserActivityDashboard workspaceId={workspaceId} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                )}
              </TabsContent>

              {/* Channels Tab */}
              <TabsContent value="channels">
                {workspaceId ? (
                  <ChannelActivityDashboard workspaceId={workspaceId} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                )}
              </TabsContent>

              {/* Messages Tab */}
              <TabsContent value="messages">
                {isMessageLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                ) : messageData && messageData.totalMessages !== undefined ? (
                  <div className="space-y-6">
                    {/* Message stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <MessageSquare className="h-5 w-5 text-secondary mr-2" />
                            <div className="text-2xl font-bold">{messageData?.totalMessages ? messageData.totalMessages.toLocaleString() : 0}</div>
                          </div>
                          <CardDescription>
                            in the selected time period
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Daily Average</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <BarChart className="h-5 w-5 text-secondary mr-2" />
                            <div className="text-2xl font-bold">
                              {messageData.messagesByDate.length > 0
                                ? Math.round(messageData.totalMessages / messageData.messagesByDate.length)
                                : 0}
                            </div>
                          </div>
                          <CardDescription>
                            messages per day
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Top Sender</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <Users className="h-5 w-5 text-secondary mr-2" />
                            <div className="text-xl font-bold truncate">
                              {messageData.topSenders.length > 0
                                ? messageData.topSenders[0].name
                                : 'No data'}
                            </div>
                          </div>
                          <CardDescription>
                            {messageData.topSenders.length > 0
                              ? `${messageData.topSenders[0].count} messages`
                              : ''}
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Message charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Messages Over Time</CardTitle>
                          <CardDescription>
                            Daily message count
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          {messageData.messagesByDate.length > 0 ? (
                            <LineChartComponent
                              data={messageData.messagesByDate.map(item => ({
                                label: format(new Date(item.date), 'MMM dd'),
                                value: item.count
                              }))}
                              height={300}
                              formatValue={(value) => `${value} messages`}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                              <p className="text-muted-foreground">No message data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Top Message Senders</CardTitle>
                          <CardDescription>
                            Users with most messages
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {messageData.topSenders.length > 0 ? (
                            <HorizontalBarChart
                              data={messageData.topSenders.map(sender => ({
                                label: sender.name,
                                value: sender.count,
                                color: 'bg-secondary'
                              }))}
                              formatValue={(value) => `${value} messages`}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-64 bg-muted/20 rounded-md">
                              <p className="text-muted-foreground">No sender data available</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No Message Data</h3>
                    <p className="text-sm text-muted-foreground">
                      There is no message data available for the selected time period.
                    </p>
                  </div>
                )}
              </TabsContent>

              {/* Content Analysis Tab */}
              <TabsContent value="content">
                {workspaceId ? (
                  <ContentAnalysisDashboard workspaceId={workspaceId} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                )}
              </TabsContent>

              {/* Performance Metrics Tab */}
              <TabsContent value="performance">
                {workspaceId ? (
                  <PerformanceMetricsDashboard workspaceId={workspaceId} />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                )}
              </TabsContent>

              {/* Tasks Tab */}
              <TabsContent value="tasks">
                {isTaskLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Loader className="h-8 w-8 animate-spin text-secondary" />
                  </div>
                ) : taskData && taskData.totalTasks !== undefined ? (
                  <div className="space-y-6">
                    {/* Task stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <CheckSquare className="h-5 w-5 text-secondary mr-2" />
                            <div className="text-2xl font-bold">{taskData.totalTasks}</div>
                          </div>
                          <CardDescription>
                            in the selected time period
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">Completed Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <CheckSquare className="h-5 w-5 text-green-500 mr-2" />
                            <div className="text-2xl font-bold">{taskData.completedTasks}</div>
                          </div>
                          <CardDescription>
                            {taskData.totalTasks > 0
                              ? `${Math.round((taskData.completedTasks / taskData.totalTasks) * 100)}% completion rate`
                              : '0% completion rate'}
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <CheckSquare className="h-5 w-5 text-blue-500 mr-2" />
                            <div className="text-2xl font-bold">{taskData.statusCounts.in_progress}</div>
                          </div>
                          <CardDescription>
                            tasks currently in progress
                          </CardDescription>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center">
                            <CheckSquare className="h-5 w-5 text-red-500 mr-2" />
                            <div className="text-2xl font-bold">{taskData.priorityCounts.high}</div>
                          </div>
                          <CardDescription>
                            high priority tasks
                          </CardDescription>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Task charts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Task Status Distribution</CardTitle>
                          <CardDescription>
                            Tasks by current status
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <PieChartComponent
                            data={[
                              { label: 'Completed', value: taskData.statusCounts.completed, color: 'bg-green-500' },
                              { label: 'In Progress', value: taskData.statusCounts.in_progress, color: 'bg-blue-500' },
                              { label: 'Not Started', value: taskData.statusCounts.not_started, color: 'bg-gray-300' },
                              { label: 'On Hold', value: taskData.statusCounts.on_hold, color: 'bg-yellow-500' },
                              { label: 'Cancelled', value: taskData.statusCounts.cancelled, color: 'bg-red-500' },
                            ].filter(item => item.value > 0)}
                            size={180}
                            formatValue={(value) => `${value} tasks`}
                          />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Task Priority Distribution</CardTitle>
                          <CardDescription>
                            Tasks by priority level
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <PieChartComponent
                            data={[
                              { label: 'High', value: taskData.priorityCounts.high, color: 'bg-red-500' },
                              { label: 'Medium', value: taskData.priorityCounts.medium, color: 'bg-yellow-500' },
                              { label: 'Low', value: taskData.priorityCounts.low, color: 'bg-green-500' },
                            ].filter(item => item.value > 0)}
                            size={180}
                            formatValue={(value) => `${value} tasks`}
                          />
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>Tasks Created Over Time</CardTitle>
                        <CardDescription>
                          Daily task creation
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        {taskData.tasksByDate.length > 0 ? (
                          <LineChartComponent
                            data={taskData.tasksByDate.map(item => ({
                              label: format(new Date(item.date), 'MMM dd'),
                              value: item.count
                            }))}
                            height={300}
                            formatValue={(value) => `${value} tasks`}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                            <p className="text-muted-foreground">No task creation data available</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {taskData.categoryData.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Tasks by Category</CardTitle>
                          <CardDescription>
                            Distribution of tasks across categories
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <HorizontalBarChart
                            data={taskData.categoryData.map((category, index) => {
                              // Generate different colors for each category
                              const colors = ['bg-secondary', 'bg-secondary', 'bg-primary', 'bg-chart-1', 'bg-chart-2'];
                              return {
                                label: category.name,
                                value: category.count,
                                color: colors[index % colors.length]
                              };
                            })}
                            formatValue={(value) => `${value} tasks`}
                          />
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
                    <CheckSquare className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="text-lg font-medium">No Task Data</h3>
                    <p className="text-sm text-muted-foreground">
                      There is no task data available for the selected time period.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
