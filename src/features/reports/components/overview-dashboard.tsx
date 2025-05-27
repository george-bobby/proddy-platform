'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { format, subDays, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';
import {
  Loader,
  Users,
  MessageSquare,
  Hash,
  CheckSquare,
  Clock,
  FileText,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart as BarChartIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, PieChart, LineChart, HorizontalBarChart } from '@/features/reports/components/charts';
import { formatDuration } from '@/features/reports/utils/format-duration';

interface OverviewDashboardProps {
  workspaceId: Id<'workspaces'>;
}

export const OverviewDashboard = ({ workspaceId }: OverviewDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [comparisonView, setComparisonView] = useState<'previous' | 'target'>('previous');

  // Calculate date ranges
  const endDate = useMemo(() => Date.now(), []);
  const startDate = useMemo(() => {
    switch (timeRange) {
      case '7d': return subDays(endDate, 7).getTime();
      case '30d': return subDays(endDate, 30).getTime();
      case '90d': return subDays(endDate, 90).getTime();
      default: return subDays(endDate, 30).getTime();
    }
  }, [timeRange, endDate]);

  // Calculate previous period for comparison
  const previousEndDate = useMemo(() => startDate, [startDate]);
  const previousStartDate = useMemo(() => {
    const periodLength = endDate - startDate;
    return startDate - periodLength;
  }, [startDate, endDate]);

  // Fetch current period data
  const overviewData = useQuery(
    api.analytics.getWorkspaceOverview,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );

  // Fetch current active users count for real-time updates
  const activeUsersData = useQuery(
    api.analytics.getActiveUsersCount,
    workspaceId ? { workspaceId } : 'skip'
  );

  // Fetch previous period data for comparison
  const previousOverviewData = useQuery(
    api.analytics.getWorkspaceOverview,
    workspaceId ? {
      workspaceId,
      startDate: previousStartDate,
      endDate: previousEndDate,
    } : 'skip'
  );

  // Fetch message analytics
  const messageData = useQuery(
    api.analytics.getMessageAnalytics,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );

  // Fetch task analytics
  const taskData = useQuery(
    api.analytics.getTaskAnalytics,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );

  const isLoading = !overviewData || !messageData || !taskData || !activeUsersData;

  // Calculate trends (percentage change from previous period)
  const trends = useMemo(() => {
    if (!overviewData || !previousOverviewData) return null;

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return {
      activeUsers: calculateChange(overviewData.activeUserCount, previousOverviewData.activeUserCount),
      messages: calculateChange(overviewData.totalMessages, previousOverviewData.totalMessages),
      tasks: calculateChange(overviewData.totalTasks, previousOverviewData.totalTasks),
      completedTasks: calculateChange(overviewData.completedTasks, previousOverviewData.completedTasks),
    };
  }, [overviewData, previousOverviewData]);

  // Prepare data for activity trend chart
  const activityTrendData = useMemo(() => {
    if (!messageData) return [];

    return messageData.messagesByDate.map(item => ({
      label: format(new Date(item.date), 'MMM dd'),
      value: item.count
    }));
  }, [messageData]);

  // Prepare data for task completion rate chart
  const taskCompletionData = useMemo(() => {
    if (!taskData) return [];

    const completionRate = taskData.totalTasks > 0
      ? Math.round((taskData.completedTasks / taskData.totalTasks) * 100)
      : 0;

    return [
      { label: 'Completed', value: completionRate, color: 'bg-green-500' },
      { label: 'Remaining', value: 100 - completionRate, color: 'bg-gray-300' }
    ];
  }, [taskData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-secondary" />
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
        <BarChartIcon className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No Overview Data</h3>
        <p className="text-sm text-muted-foreground">
          There is no data available for the selected time period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Workspace Overview</h2>
        <div className="flex rounded-md border border-input overflow-hidden">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === '7d' ? 'bg-secondary text-white' : 'bg-transparent hover:bg-muted'}`}
            onClick={() => setTimeRange('7d')}
          >
            7 days
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === '30d' ? 'bg-secondary text-white' : 'bg-transparent hover:bg-muted'}`}
            onClick={() => setTimeRange('30d')}
          >
            30 days
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === '90d' ? 'bg-secondary text-white' : 'bg-transparent hover:bg-muted'}`}
            onClick={() => setTimeRange('90d')}
          >
            90 days
          </button>
        </div>
      </div>

      {/* Key Metrics with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-secondary mr-2" />
                <div className="text-2xl font-bold">{activeUsersData?.activeUserCount || 0}</div>
              </div>
              {trends && (
                <div className={`flex items-center text-sm font-medium ${trends.activeUsers >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trends.activeUsers >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(trends.activeUsers)}%
                </div>
              )}
            </div>
            <CardDescription>
              {activeUsersData?.activeUserPercentage || 0}% of {activeUsersData?.totalMembers || 0} total users
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-secondary mr-2" />
                <div className="text-2xl font-bold">{overviewData.totalMessages ? overviewData.totalMessages.toLocaleString() : 0}</div>
              </div>
              {trends && (
                <div className={`flex items-center text-sm font-medium ${trends.messages >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trends.messages >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(trends.messages)}%
                </div>
              )}
            </div>
            <CardDescription>
              {overviewData.activeUserPercentage}% of {overviewData.totalMembers} total users
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckSquare className="h-5 w-5 text-secondary mr-2" />
                <div className="text-2xl font-bold">{overviewData.totalTasks}</div>
              </div>
              {trends && (
                <div className={`flex items-center text-sm font-medium ${trends.tasks >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {trends.tasks >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                  {Math.abs(trends.tasks)}%
                </div>
              )}
            </div>
            <CardDescription>
              {taskData && taskData.completedTasks > 0
                ? `${Math.round((taskData.completedTasks / taskData.totalTasks) * 100)}% completion rate`
                : '0% completion rate'}
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Hash className="h-5 w-5 text-secondary mr-2" />
              <div className="text-2xl font-bold">{overviewData.totalChannels}</div>
            </div>
            <CardDescription>
              {overviewData.totalMessages > 0 && overviewData.totalChannels > 0
                ? `${Math.round(overviewData.totalMessages / overviewData.totalChannels)} messages per channel`
                : 'No messages'}
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Activity Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Activity Trend</CardTitle>
            <CardDescription>
              Daily message activity over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            {activityTrendData.length > 0 ? (
              <LineChart
                data={activityTrendData}
                height={300}
                formatValue={(value) => `${value} messages`}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                <p className="text-muted-foreground">No activity data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>
              Overall task completion rate
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 flex flex-col items-center justify-center">
            {taskCompletionData.length > 0 ? (
              <>
                <PieChart
                  data={taskCompletionData}
                  size={180}
                  formatValue={(value) => `${value}%`}
                />
                <div className="mt-4 text-center">
                  <div className="text-3xl font-bold text-green-500">
                    {taskData?.completedTasks || 0}/{taskData?.totalTasks || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tasks Completed
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/20 rounded-md">
                <p className="text-muted-foreground">No task data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
