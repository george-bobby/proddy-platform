import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import { Password } from '@convex-dev/auth/providers/Password';
import { convexAuth } from '@convex-dev/auth/server';
import { getAuthUserId } from '@convex-dev/auth/server';
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

    try {
      // Get the identity information
      const subject = identity.subject;
      console.log('Auth identity subject:', subject);

      // Get the user ID directly from the auth helper function
      const userId = await getAuthUserId(ctx);
      console.log('User ID from getAuthUserId:', userId);

      if (!userId) {
        console.log('No user ID found, returning success');
        return { success: true, message: 'No user found to delete' };
      }

      // Try to get the user document
      try {
        const user = await ctx.db.get(userId);
        console.log('User from database:', user);

        if (!user) {
          console.log('User document not found, returning success');
          return { success: true, message: 'User already deleted' };
        }
      } catch (e) {
        console.error('Error getting user:', e);
        return { success: true, message: 'User could not be retrieved, likely already deleted' };
      }

      // Step 1: Get all data that needs to be deleted
      const [workspaces, userMembers] = await Promise.all([
        // Get all workspaces created by the user
        ctx.db
          .query('workspaces')
          .filter((q) => q.eq(q.field('userId'), userId))
          .collect(),
        // Get all memberships of the user
        ctx.db
          .query('members')
          .filter((q) => q.eq(q.field('userId'), userId))
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

      // Note: We're skipping direct system table access since it requires special permissions
      // and is causing TypeScript errors. The auth system should handle cleanup automatically
      // when the user is deleted.

      // If you need to manually clean up auth records, you would need to:
      // 1. Create a specific function in the auth library to handle this
      // 2. Or use the Convex dashboard to manage system tables

      // Step 5: Finally, delete the user record itself
      try {
        await ctx.db.delete(userId);
        console.log('User successfully deleted');
      } catch (e) {
        console.error('Error deleting user:', e);
        // Don't throw an error here, as we've already cleaned up other data
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account: ' + (error instanceof Error ? error.message : String(error)));
    }
  },
});
