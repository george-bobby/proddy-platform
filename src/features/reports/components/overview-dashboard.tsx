'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { format, subDays } from 'date-fns';
import {
  Loader,
  Users,
  MessageSquare,
  Hash,
  CheckSquare,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart as BarChartIcon
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { PieChart, LineChart } from '@/features/reports/components/charts';

interface OverviewDashboardProps {
  workspaceId: Id<'workspaces'>;
  timeRange?: '1d' | '7d' | '30d';
}

export const OverviewDashboard = ({ workspaceId, timeRange = '7d' }: OverviewDashboardProps) => {
  // Calculate date ranges based on selected time range
  const endDate = useMemo(() => Date.now(), []);
  const startDate = useMemo(() => {
    switch (timeRange) {
      case '1d': return subDays(endDate, 1).getTime();
      case '7d': return subDays(endDate, 7).getTime();
      case '30d': return subDays(endDate, 30).getTime();
      default: return subDays(endDate, 7).getTime();
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

  // Fetch current active users count for the selected time period
  const activeUsersData = useQuery(
    api.analytics.getActiveUsersCount,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
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
      </div>

      {/* Key Metrics with Trends */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help hover:shadow-md transition-all duration-200 hover:border-secondary/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-5 w-5 text-secondary mr-2" />
                      <div className="text-2xl font-bold">
                        {activeUsersData?.activeUserCount || 0}
                      </div>
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
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs">
              <div className="space-y-1">
                <p className="font-medium text-sm">Active Users:</p>
                {activeUsersData?.activeUsers && activeUsersData.activeUsers.length > 0 ? (
                  <div className="space-y-1">
                    {activeUsersData.activeUsers.map((user, index) => (
                      <div key={user.memberId} className="text-xs">
                        • {user.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No active users</p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

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
              {overviewData.activeUserCount > 0
                ? `${Math.round(overviewData.totalMessages / overviewData.activeUserCount)} per active user`
                : 'No active users'
              } in last 7 days
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

      {/* Activity Trends and Task Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[500px]">
        {/* Activity Trend Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-secondary" />
              Activity Trend
            </CardTitle>
            <CardDescription>
              Daily message activity over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-6 pt-0">
            {activityTrendData.length > 0 ? (
              <div className="flex-1 flex items-center justify-center min-h-[350px] overflow-hidden">
                <div className="w-full h-full max-w-full">
                  <LineChart
                    data={activityTrendData}
                    height={350}
                    formatValue={(value) => `${value} messages`}
                    className="w-full h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[350px]">
                <div className="text-center p-8 bg-muted/20 rounded-lg w-full">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No activity data available</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
                    Messages will appear here once users start chatting in this workspace
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Task Completion Card */}
        <Card className="flex flex-col h-full">
          <CardHeader className="pb-4 flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-secondary" />
              Task Completion
            </CardTitle>
            <CardDescription>
              Overall task completion rate and progress
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-6 pt-0">
            {taskCompletionData.length > 0 && taskData ? (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[350px] space-y-6">
                {/* Pie Chart */}
                <div className="relative flex-shrink-0">
                  <PieChart
                    data={taskCompletionData}
                    size={200}
                    formatValue={(value) => `${value}%`}
                  />
                  {/* Center completion percentage */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {taskData.totalTasks > 0
                          ? Math.round((taskData.completedTasks / taskData.totalTasks) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-muted-foreground">Complete</div>
                    </div>
                  </div>
                </div>

                {/* Task Statistics */}
                <div className="w-full space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {taskData.completedTasks}
                      </div>
                      <div className="text-sm text-green-600/80 dark:text-green-400/80">
                        Completed
                      </div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {taskData.totalTasks - taskData.completedTasks}
                      </div>
                      <div className="text-sm text-orange-600/80 dark:text-orange-400/80">
                        Remaining
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Progress</span>
                      <span>{taskData.completedTasks}/{taskData.totalTasks} tasks</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${taskData.totalTasks > 0 ? (taskData.completedTasks / taskData.totalTasks) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center min-h-[350px]">
                <div className="text-center p-8 bg-muted/20 rounded-lg w-full">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No task data available</h3>
                  <p className="text-sm text-muted-foreground/70 max-w-sm mx-auto">
                    Tasks will appear here once they are created in this workspace
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
