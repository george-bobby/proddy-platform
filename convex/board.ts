import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';

// LISTS
export const createList = mutation({
  args: { channelId: v.id('channels'), title: v.string(), order: v.number() },
  handler: async (ctx: MutationCtx, args: { channelId: Id<'channels'>; title: string; order: number }) => {
    return await ctx.db.insert('lists', args);
  },
});

export const updateList = mutation({
  args: { listId: v.id('lists'), title: v.optional(v.string()), order: v.optional(v.number()) },
  handler: async (ctx: MutationCtx, { listId, ...updates }: { listId: Id<'lists'>; title?: string; order?: number }) => {
    return await ctx.db.patch(listId, updates);
  },
});

export const deleteList = mutation({
  args: { listId: v.id('lists') },
  handler: async (ctx: MutationCtx, { listId }: { listId: Id<'lists'> }) => {
    // Delete all cards in the list
    const cards = await ctx.db.query('cards').withIndex('by_list_id', q => q.eq('listId', listId)).collect();
    for (const card of cards) {
      await ctx.db.delete(card._id);
    }
    // Delete the list
    return await ctx.db.delete(listId);
  },
});

export const reorderLists = mutation({
  args: { listOrders: v.array(v.object({ listId: v.id('lists'), order: v.number() })) },
  handler: async (ctx: MutationCtx, { listOrders }: { listOrders: { listId: Id<'lists'>; order: number }[] }) => {
    for (const { listId, order } of listOrders) {
      await ctx.db.patch(listId, { order });
    }
    return true;
  },
});

// CARDS
export const createCard = mutation({
  args: {
    listId: v.id('lists'),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    labels: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, args: { listId: Id<'lists'>; title: string; description?: string; order: number; labels?: string[]; priority?: 'low' | 'medium' | 'high'; dueDate?: number }) => {
    return await ctx.db.insert('cards', args);
  },
});

export const updateCard = mutation({
  args: {
    cardId: v.id('cards'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    order: v.optional(v.number()),
    listId: v.optional(v.id('lists')),
    labels: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal('low'), v.literal('medium'), v.literal('high'))),
    dueDate: v.optional(v.number()),
  },
  handler: async (ctx: MutationCtx, { cardId, ...updates }: { cardId: Id<'cards'>; title?: string; description?: string; order?: number; listId?: Id<'lists'>; labels?: string[]; priority?: 'low' | 'medium' | 'high'; dueDate?: number }) => {
    return await ctx.db.patch(cardId, updates);
  },
});

export const deleteCard = mutation({
  args: { cardId: v.id('cards') },
  handler: async (ctx: MutationCtx, { cardId }: { cardId: Id<'cards'> }) => {
    return await ctx.db.delete(cardId);
  },
});

export const moveCard = mutation({
  args: { cardId: v.id('cards'), toListId: v.id('lists'), order: v.number() },
  handler: async (ctx: MutationCtx, { cardId, toListId, order }: { cardId: Id<'cards'>; toListId: Id<'lists'>; order: number }) => {
    return await ctx.db.patch(cardId, { listId: toListId, order });
  },
});

// QUERIES
export const getLists = query({
  args: { channelId: v.id('channels') },
  handler: async (ctx: QueryCtx, { channelId }: { channelId: Id<'channels'> }) => {
    return await ctx.db.query('lists').withIndex('by_channel_id', q => q.eq('channelId', channelId)).order('asc').collect();
  },
});

export const getCards = query({
  args: { listId: v.id('lists') },
  handler: async (ctx: QueryCtx, { listId }: { listId: Id<'lists'> }) => {
    return await ctx.db.query('cards').withIndex('by_list_id', q => q.eq('listId', listId)).order('asc').collect();
  },
});

export const getAllCardsForChannel = query({
  args: { channelId: v.id('channels') },
  handler: async (ctx, { channelId }) => {
    const lists = await ctx.db.query('lists').withIndex('by_channel_id', q => q.eq('channelId', channelId)).collect();
    const allCards = [];
    for (const list of lists) {
      const cards = await ctx.db.query('cards').withIndex('by_list_id', q => q.eq('listId', list._id)).collect();
      allCards.push(...cards);
    }
    return allCards;
  },
}); 