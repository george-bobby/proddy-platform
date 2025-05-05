import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
import { type QueryCtx, type MutationCtx, mutation, query, internalMutation } from './_generated/server';

// Helper function to get the current member
const getMember = async (ctx: QueryCtx, workspaceId: Id<'workspaces'>, userId: Id<'users'>) => {
  return await ctx.db
    .query('members')
    .withIndex('by_workspace_id_user_id', (q) => q.eq('workspaceId', workspaceId).eq('userId', userId))
    .unique();
};

// Get all task categories for the current user in a workspace
export const getTaskCategories = query({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) return [];

    // Get all categories for this workspace (both default and user-created)
    const categories = await ctx.db
      .query('taskCategories')
      .withIndex('by_workspace_id', (q) => q.eq('workspaceId', args.workspaceId))
      .collect();

    return categories;
  },
});

// Create a new task category
export const createTaskCategory = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    workspaceId: v.id('workspaces'),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error('Not a member of this workspace');

    // Create the category
    const categoryId = await ctx.db.insert('taskCategories', {
      name: args.name,
      color: args.color,
      workspaceId: args.workspaceId,
      userId,
      isDefault: args.isDefault || false,
    });

    return categoryId;
  },
});

// Get all tasks for the current user in a workspace
export const getTasks = query({
  args: {
    workspaceId: v.id('workspaces'),
    categoryId: v.optional(v.id('taskCategories')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) return [];

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) return [];

    // Base query
    let tasksQuery = ctx.db
      .query('tasks')
      .withIndex('by_workspace_id_user_id', (q) =>
        q.eq('workspaceId', args.workspaceId).eq('userId', userId)
      );

    // Filter by category if provided
    if (args.categoryId) {
      tasksQuery = ctx.db
        .query('tasks')
        .withIndex('by_category_id', (q) => q.eq('categoryId', args.categoryId))
        .filter((q) =>
          q.and(
            q.eq(q.field('workspaceId'), args.workspaceId),
            q.eq(q.field('userId'), userId)
          )
        );
    }

    // Get all tasks for this user in this workspace
    const tasks = await tasksQuery.order('desc').collect();

    return tasks;
  },
});

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high')
    )),
    status: v.optional(v.union(
      v.literal('not_started'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('on_hold'),
      v.literal('cancelled')
    )),
    categoryId: v.optional(v.id('taskCategories')),
    tags: v.optional(v.array(v.string())),
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error('Not a member of this workspace');

    const now = Date.now();

    // Create the task
    const taskId = await ctx.db.insert('tasks', {
      title: args.title,
      description: args.description,
      completed: args.status === 'completed' ? true : false,
      status: args.status || 'not_started',
      dueDate: args.dueDate,
      priority: args.priority,
      categoryId: args.categoryId,
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
      userId,
      workspaceId: args.workspaceId,
    });

    return taskId;
  },
});

// Update a task
export const updateTask = mutation({
  args: {
    id: v.id('tasks'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    status: v.optional(v.union(
      v.literal('not_started'),
      v.literal('in_progress'),
      v.literal('completed'),
      v.literal('on_hold'),
      v.literal('cancelled')
    )),
    dueDate: v.optional(v.number()),
    priority: v.optional(v.union(
      v.literal('low'),
      v.literal('medium'),
      v.literal('high')
    )),
    categoryId: v.optional(v.id('taskCategories')),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Get the task
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error('Task not found');

    // Check if the task belongs to the user
    if (task.userId !== userId) throw new Error('Not authorized to update this task');

    // Prepare updates
    const { id, ...updates } = args;

    // If status is changing to completed, update the completed flag too
    if (updates.status === 'completed' && !task.completed) {
      updates.completed = true;
    } else if (updates.status && updates.status !== 'completed' && task.completed) {
      updates.completed = false;
    }

    // If completed flag is changing, update the status too
    if (updates.completed === true && task.status !== 'completed') {
      updates.status = 'completed';
    } else if (updates.completed === false && task.status === 'completed') {
      updates.status = 'not_started';
    }

    // Add updated timestamp and update the task
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now()
    });

    return id;
  },
});

// Toggle task completion status
export const toggleTaskCompletion = mutation({
  args: {
    id: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Get the task
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error('Task not found');

    // Check if the task belongs to the user
    if (task.userId !== userId) throw new Error('Not authorized to update this task');

    const now = Date.now();
    const newCompletedState = !task.completed;

    // Toggle the completed status and update the status field accordingly
    await ctx.db.patch(args.id, {
      completed: newCompletedState,
      status: newCompletedState ? 'completed' : 'not_started',
      updatedAt: now
    });

    return args.id;
  },
});

// Delete a task
export const deleteTask = mutation({
  args: {
    id: v.id('tasks'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Get the task
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error('Task not found');

    // Check if the task belongs to the user
    if (task.userId !== userId) throw new Error('Not authorized to delete this task');

    // Delete the task
    await ctx.db.delete(args.id);

    return args.id;
  },
});

// Internal helper function to create default categories
// This can be called directly from other Convex functions
export const createDefaultCategoriesForWorkspace = async (
  ctx: MutationCtx,
  workspaceId: Id<'workspaces'>,
  userId: Id<'users'>
) => {
  // Define default categories
  const defaultCategories = [
    { name: 'Work', color: '#4A0D68' },
    { name: 'Personal', color: '#ED128E' },
    { name: 'Urgent', color: '#e53e3e' },
    { name: 'Learning', color: '#3182ce' },
    { name: 'Ideas', color: '#38a169' },
  ];

  // Create each default category
  const categoryIds = await Promise.all(
    defaultCategories.map(async (category) => {
      return await ctx.db.insert('taskCategories', {
        name: category.name,
        color: category.color,
        workspaceId,
        userId,
        isDefault: true,
      });
    })
  );

  return categoryIds;
};

// Create default task categories for a workspace
// This is the public mutation that can be called from the client
export const createDefaultTaskCategories = mutation({
  args: {
    workspaceId: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Check if the user is a member of the workspace
    const member = await getMember(ctx, args.workspaceId, userId);
    if (!member) throw new Error('Not a member of this workspace');

    return await createDefaultCategoriesForWorkspace(ctx, args.workspaceId, userId);
  },
});

// Delete a task category
export const deleteTaskCategory = mutation({
  args: {
    id: v.id('taskCategories'),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) throw new Error('Unauthorized');

    // Get the category
    const category = await ctx.db.get(args.id);
    if (!category) throw new Error('Category not found');

    // Check if the category belongs to the user
    if (category.userId !== userId) throw new Error('Not authorized to delete this category');

    // Check if it's a default category
    if (category.isDefault) throw new Error('Cannot delete default categories');

    // Delete the category
    await ctx.db.delete(args.id);

    // Update all tasks with this category to have no category
    const tasks = await ctx.db
      .query('tasks')
      .withIndex('by_category_id', (q) => q.eq('categoryId', args.id))
      .collect();

    await Promise.all(
      tasks.map(async (task) => {
        await ctx.db.patch(task._id, {
          categoryId: undefined,
          updatedAt: Date.now(),
        });
      })
    );

    return args.id;
  },
});
