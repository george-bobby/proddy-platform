'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/../convex/_generated/api';
import { Id } from '@/../convex/_generated/dataModel';
import { format, subDays } from 'date-fns';
import { Loader, Users, Clock, MessageSquare, ThumbsUp } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, PieChart, HorizontalBarChart } from '@/features/reports/components/charts';
import { formatDuration } from '@/features/reports/utils/format-duration';

interface UserActivityDashboardProps {
  workspaceId: Id<'workspaces'>;
}

export const UserActivityDashboard = ({ workspaceId }: UserActivityDashboardProps) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

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

  // Fetch user activity data
  const userActivityResult = useQuery(
    api.analytics.getUserActivitySummary,
    workspaceId ? {
      workspaceId,
      startDate,
      endDate,
    } : 'skip'
  );

  const isLoading = userActivityResult === undefined;
  const userActivity = userActivityResult || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (userActivity.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
        <Users className="h-12 w-12 text-muted-foreground mb-2" />
        <h3 className="text-lg font-medium">No user activity data</h3>
        <p className="text-sm text-muted-foreground">
          Start interacting with the platform to generate activity data.
        </p>
      </div>
    );
  }

  // Sort users by message count
  const sortedByMessages = [...userActivity].sort((a, b) => b.messageCount - a.messageCount);

  // Sort users by time spent
  const sortedByTimeSpent = [...userActivity].sort((a, b) => b.totalTimeSpent - a.totalTimeSpent);

  // Prepare data for charts
  const messageCountData = sortedByMessages.slice(0, 10).map(item => ({
    label: item.member?.user?.name || 'Unknown',
    value: item.messageCount,
    color: 'bg-primary',
  }));

  const timeSpentData = sortedByTimeSpent.slice(0, 10).map(item => ({
    label: item.member?.user?.name || 'Unknown',
    value: item.totalTimeSpent,
    color: 'bg-secondary',
  }));

  // Calculate total stats
  const totalMessages = userActivity.reduce((sum, item) => sum + item.messageCount, 0);
  const totalReactions = userActivity.reduce((sum, item) => sum + item.reactionCount, 0);
  const totalTimeSpent = userActivity.reduce((sum, item) => sum + item.totalTimeSpent, 0);
  const activeUsers = userActivity.filter(item => item.messageCount > 0).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Activity</h2>
        <div className="flex rounded-md border border-input overflow-hidden">
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === '7d' ? 'bg-primary text-white' : 'bg-transparent hover:bg-muted'}`}
            onClick={() => setTimeRange('7d')}
          >
            7 days
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === '30d' ? 'bg-primary text-white' : 'bg-transparent hover:bg-muted'}`}
            onClick={() => setTimeRange('30d')}
          >
            30 days
          </button>
          <button
            type="button"
            className={`px-3 py-1.5 text-sm font-medium ${timeRange === '90d' ? 'bg-primary text-white' : 'bg-transparent hover:bg-muted'}`}
            onClick={() => setTimeRange('90d')}
          >
            90 days
          </button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{activeUsers}</div>
            </div>
            <CardDescription>
              out of {userActivity.length} total users
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{totalMessages}</div>
            </div>
            <CardDescription>
              {(totalMessages / userActivity.length).toFixed(1)} per user
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Reactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <ThumbsUp className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{totalReactions}</div>
            </div>
            <CardDescription>
              {(totalReactions / userActivity.length).toFixed(1)} per user
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Time Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <div className="text-2xl font-bold">{formatDuration(totalTimeSpent, 'short')}</div>
            </div>
            <CardDescription>
              {formatDuration(totalTimeSpent / activeUsers, 'short')} per active user
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Messages by User</CardTitle>
            <CardDescription>
              Top 10 users by message count in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart
              data={messageCountData}
              height={30}
              formatValue={(value) => `${value} messages`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Spent by User</CardTitle>
            <CardDescription>
              Top 10 users by time spent in the selected period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart
              data={timeSpentData}
              height={30}
              formatValue={(value) => formatDuration(value, 'short')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
