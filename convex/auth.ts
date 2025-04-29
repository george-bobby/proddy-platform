import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { DataModel } from './_generated/dataModel';
import { mutation } from './_generated/server';

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [CustomPassword, GitHub, Google],
});

export const deleteAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error('Not authenticated');
    }

    const userId = identity.subject;

    // Delete all workspaces created by the user
    const workspaces = await ctx.db
      .query('workspaces')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect();

    for (const workspace of workspaces) {
      // Delete all channels in the workspace
      const channels = await ctx.db
        .query('channels')
        .filter((q) => q.eq(q.field('workspaceId'), workspace._id))
        .collect();

      for (const channel of channels) {
        // Delete all messages in the channel
        await ctx.db
          .query('messages')
          .filter((q) => q.eq(q.field('channelId'), channel._id))
          .collect()
          .then((messages) => {
            for (const message of messages) {
              ctx.db.delete(message._id);
            }
          });

        // Delete the channel
        ctx.db.delete(channel._id);
      }

      // Delete all members in the workspace
      await ctx.db
        .query('members')
        .filter((q) => q.eq(q.field('workspaceId'), workspace._id))
        .collect()
        .then((members) => {
          for (const member of members) {
            ctx.db.delete(member._id);
          }
        });

      // Delete the workspace
      ctx.db.delete(workspace._id);
    }

    // Delete all messages created by the user in other channels
    await ctx.db
      .query('messages')
      .filter((q) => q.eq(q.field('memberId'), userId))
      .collect()
      .then((messages) => {
        for (const message of messages) {
          ctx.db.delete(message._id);
        }
      });

    // Delete all memberships of the user
    await ctx.db
      .query('members')
      .filter((q) => q.eq(q.field('userId'), userId))
      .collect()
      .then((members) => {
        for (const member of members) {
          ctx.db.delete(member._id);
        }
      });
  },
});
