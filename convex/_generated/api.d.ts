/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as board from "../board.js";
import type * as calendar from "../calendar.js";
import type * as channels from "../channels.js";
import type * as chatbot from "../chatbot.js";
import type * as conversations from "../conversations.js";
import type * as crons from "../crons.js";
import type * as direct from "../direct.js";
import type * as directMessageEmails from "../directMessageEmails.js";
import type * as http from "../http.js";
import type * as integrations from "../integrations.js";
import type * as members from "../members.js";
import type * as mentions from "../mentions.js";
import type * as messages from "../messages.js";
import type * as notes from "../notes.js";
import type * as reactions from "../reactions.js";
import type * as search from "../search.js";
import type * as status from "../status.js";
import type * as tasks from "../tasks.js";
import type * as threadReplies from "../threadReplies.js";
import type * as upload from "../upload.js";
import type * as userPreferences from "../userPreferences.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";
import type * as weeklyDigest from "../weeklyDigest.js";
import type * as workspaces from "../workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analytics: typeof analytics;
  auth: typeof auth;
  board: typeof board;
  calendar: typeof calendar;
  channels: typeof channels;
  chatbot: typeof chatbot;
  conversations: typeof conversations;
  crons: typeof crons;
  direct: typeof direct;
  directMessageEmails: typeof directMessageEmails;
  http: typeof http;
  integrations: typeof integrations;
  members: typeof members;
  mentions: typeof mentions;
  messages: typeof messages;
  notes: typeof notes;
  reactions: typeof reactions;
  search: typeof search;
  status: typeof status;
  tasks: typeof tasks;
  threadReplies: typeof threadReplies;
  upload: typeof upload;
  userPreferences: typeof userPreferences;
  users: typeof users;
  utils: typeof utils;
  weeklyDigest: typeof weeklyDigest;
  workspaces: typeof workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
