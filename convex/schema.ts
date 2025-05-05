import { authTables } from '@convex-dev/auth/server';
import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const schema = defineSchema({
  ...authTables,
  workspaces: defineTable({
    name: v.string(),
    userId: v.id('users'),
    joinCode: v.string(),
  }),
  members: defineTable({
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    role: v.union(v.literal('admin'), v.literal('member')),
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId']),
  channels: defineTable({
    name: v.string(),
    workspaceId: v.id('workspaces'),
  }).index('by_workspace_id', ['workspaceId']),
  conversations: defineTable({
    workspaceId: v.id('workspaces'),
    memberOneId: v.id('members'),
    memberTwoId: v.id('members'),
  }).index('by_workspace_id', ['workspaceId']),
  messages: defineTable({
    body: v.string(),
    image: v.optional(v.id('_storage')),
    memberId: v.id('members'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    parentMessageId: v.optional(v.id('messages')),
    conversationId: v.optional(v.id('conversations')),
    updatedAt: v.optional(v.number()),
    calendarEvent: v.optional(v.object({
      date: v.number(), // timestamp for the event date
      time: v.optional(v.string()), // optional time string
    })),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_member_id', ['memberId'])
    .index('by_channel_id', ['channelId'])
    .index('by_conversation_id', ['conversationId'])
    .index('by_parent_message_id', ['parentMessageId'])
    .index('by_channel_id_parent_message_id_conversation_id', ['channelId', 'parentMessageId', 'conversationId']),
  events: defineTable({
    title: v.string(),
    date: v.number(), // timestamp for the event date
    time: v.optional(v.string()), // optional time string
    messageId: v.id('messages'),
    memberId: v.id('members'),
    workspaceId: v.id('workspaces'),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_date', ['date'])
    .index('by_message_id', ['messageId'])
    .index('by_member_id', ['memberId']),
  reactions: defineTable({
    workspaceId: v.id('workspaces'),
    messageId: v.id('messages'),
    memberId: v.id('members'),
    value: v.string(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_message_id', ['messageId'])
    .index('by_member_id', ['memberId']),
  history: defineTable({
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
    status: v.string(), // "online" or "offline"
    lastSeen: v.number(), // timestamp
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId']),
  lists: defineTable({
    channelId: v.id('channels'),
    title: v.string(),
    order: v.number(),
  }).index('by_channel_id', ['channelId']),
  cards: defineTable({
    listId: v.id('lists'),
    title: v.string(),
    description: v.optional(v.string()),
    order: v.number(),
    labels: v.optional(v.array(v.string())),
    priority: v.optional(v.union(
      v.literal('lowest'),
      v.literal('low'),
      v.literal('medium'),
      v.literal('high'),
      v.literal('highest')
    )),
    dueDate: v.optional(v.number()),
    assignees: v.optional(v.array(v.id('members'))),
  }).index('by_list_id', ['listId']),

  categories: defineTable({
    name: v.string(),
    color: v.string(),
    workspaceId: v.id('workspaces'),
    userId: v.id('users'),
    isDefault: v.optional(v.boolean()),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId']),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    completed: v.boolean(),
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
    categoryId: v.optional(v.id('categories')),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    userId: v.id('users'),
    workspaceId: v.id('workspaces'),
  })
    .index('by_user_id', ['userId'])
    .index('by_workspace_id', ['workspaceId'])
    .index('by_workspace_id_user_id', ['workspaceId', 'userId'])
    .index('by_category_id', ['categoryId']),

  mentions: defineTable({
    messageId: v.optional(v.id('messages')),
    mentionedMemberId: v.id('members'),
    mentionerMemberId: v.id('members'),
    workspaceId: v.id('workspaces'),
    channelId: v.optional(v.id('channels')),
    conversationId: v.optional(v.id('conversations')),
    parentMessageId: v.optional(v.id('messages')),
    cardId: v.optional(v.id('cards')),
    cardTitle: v.optional(v.string()),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index('by_workspace_id', ['workspaceId'])
    .index('by_mentioned_member_id', ['mentionedMemberId'])
    .index('by_mentioner_member_id', ['mentionerMemberId'])
    .index('by_message_id', ['messageId'])
    .index('by_card_id', ['cardId'])
    .index('by_workspace_id_mentioned_member_id', ['workspaceId', 'mentionedMemberId'])
    .index('by_workspace_id_mentioned_member_id_read', ['workspaceId', 'mentionedMemberId', 'read']),
});

export default schema;
