import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { v } from 'convex/values';

import { DataModel, Id } from './_generated/dataModel';
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

    try {
      // Convert string userId to proper Id type
      const userIdObj = userId as Id<'users'>;

      // Step 1: Get all data that needs to be deleted
      const [workspaces, userMembers] = await Promise.all([
        // Get all workspaces created by the user
        ctx.db
          .query('workspaces')
          .filter((q) => q.eq(q.field('userId'), userIdObj))
          .collect(),
        // Get all memberships of the user
        ctx.db
          .query('members')
          .filter((q) => q.eq(q.field('userId'), userIdObj))
          .collect(),
      ]);

      // Step 2: Process each workspace owned by the user
      for (const workspace of workspaces) {
        // Get all channels and members in the workspace
        const [channels, members] = await Promise.all([
          ctx.db
            .query('channels')
            .filter((q) => q.eq(q.field('workspaceId'), workspace._id))
            .collect(),
          ctx.db
            .query('members')
            .filter((q) => q.eq(q.field('workspaceId'), workspace._id))
            .collect(),
        ]);

        // Delete all messages in each channel
        for (const channel of channels) {
          const messages = await ctx.db
            .query('messages')
            .filter((q) => q.eq(q.field('channelId'), channel._id))
            .collect();

          // Delete all messages in batch
          for (const message of messages) {
            await ctx.db.delete(message._id);
          }

          // Delete the channel
          await ctx.db.delete(channel._id);
        }

        // Delete all members in batch
        for (const member of members) {
          await ctx.db.delete(member._id);
        }

        // Delete the workspace
        await ctx.db.delete(workspace._id);
      }

      // Step 3: Process user's memberships
      for (const member of userMembers) {
        // Delete messages and reactions created by this member
        const memberMessages = await ctx.db
          .query('messages')
          .filter((q) => q.eq(q.field('memberId'), member._id))
          .collect();

        for (const message of memberMessages) {
          await ctx.db.delete(message._id);
        }

        const memberReactions = await ctx.db
          .query('reactions')
          .filter((q) => q.eq(q.field('memberId'), member._id))
          .collect();

        for (const reaction of memberReactions) {
          await ctx.db.delete(reaction._id);
        }

        // Delete the member
        await ctx.db.delete(member._id);
      }

      // Step 4: Clean up auth-related records
      // This is crucial for allowing the user to sign up again with the same provider

      // Delete auth identities (OAuth connections)
      try {
        // Use system tables directly with any type assertion
        const authIdentities = await (ctx.db as any)
          .query('_convex_auth_identities')
          .filter((q: any) => q.eq(q.field('userId'), userIdObj))
          .collect();

        for (const identity of authIdentities) {
          await (ctx.db as any).delete(identity._id);
        }
      } catch (e) {
        console.error('Error deleting auth identities:', e);
        // Continue with deletion even if this fails
      }

      // Delete auth sessions
      try {
        const authSessions = await (ctx.db as any)
          .query('_convex_auth_sessions')
          .filter((q: any) => q.eq(q.field('userId'), userIdObj))
          .collect();

        for (const session of authSessions) {
          await (ctx.db as any).delete(session._id);
        }
      } catch (e) {
        console.error('Error deleting auth sessions:', e);
        // Continue with deletion even if this fails
      }

      // Step 5: Finally, delete the user record itself
      await ctx.db.delete(userIdObj);

      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account: ' + (error instanceof Error ? error.message : String(error)));
    }
  },
});
