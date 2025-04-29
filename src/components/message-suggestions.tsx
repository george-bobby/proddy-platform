'use client';

import { Sparkles } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

interface MessageSuggestionsProps {
  onSelectSuggestion: (suggestion: string) => void;
  channelName?: string; // Optional channel name to provide context
}

// Hardcoded suggestions based on common message patterns
const GENERAL_SUGGESTIONS = [
  "I'll look into this and get back to you soon.",
  'Could we schedule a meeting to discuss this further?',
  'Thanks for sharing! This is really helpful.',
  "Let's set up a call to go over the details.",
  "I've completed the task. Here's what I found...",
  'Can you provide more information about this?',
  'Great work on this! I appreciate your effort.',
  'I need some clarification on the requirements.',
];

// Morning-specific suggestions
const MORNING_SUGGESTIONS = [
  "Good morning! Here's what I'm working on today.",
  "Morning update: I've started working on the task.",
  "I'll have this ready by afternoon.",
  "Let's catch up in the morning standup.",
  "I've reviewed the morning emails and have some updates.",
];

// Afternoon-specific suggestions
const AFTERNOON_SUGGESTIONS = [
  "Here's the afternoon progress update.",
  'I should be able to finish this by end of day.',
  "Let's sync up before the end of the day.",
  "I've made good progress this afternoon.",
  'Can we review this before tomorrow?',
];

// Evening-specific suggestions
const EVENING_SUGGESTIONS = [
  "I'm wrapping up for the day, but will continue tomorrow.",
  "Here's my end-of-day summary.",
  "I'll pick this up first thing tomorrow morning.",
  "Let's discuss this in tomorrow's meeting.",
  "I've documented my progress for the handoff.",
];

// Project-specific suggestions
const PROJECT_SUGGESTIONS = {
  design: [
    "I've updated the design in Figma.",
    'Could you review the latest mockups?',
    'The design system has been updated with new components.',
    "I've addressed the feedback on the UI.",
    'Here are the design specs for implementation.',
  ],
  development: [
    'The PR is ready for review.',
    "I've fixed the bug in the latest commit.",
    'The build is failing due to dependency issues.',
    "I've deployed the changes to staging.",
    'The tests are passing locally but failing in CI.',
  ],
  marketing: [
    'The campaign metrics are looking good.',
    "I've updated the content calendar.",
    'The social media posts are scheduled.',
    "Here's the draft for the newsletter.",
    'The analytics show an increase in engagement.',
  ],
  product: [
    'The feature prioritization is complete.',
    'User feedback indicates we should focus on...',
    'The roadmap has been updated for Q3.',
    'The user testing results are in.',
    'We need to revisit the acceptance criteria.',
  ],
};

// Get time-appropriate suggestions
const getTimeBasedSuggestions = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return [...MORNING_SUGGESTIONS, ...GENERAL_SUGGESTIONS];
  } else if (hour >= 12 && hour < 17) {
    return [...AFTERNOON_SUGGESTIONS, ...GENERAL_SUGGESTIONS];
  } else {
    return [...EVENING_SUGGESTIONS, ...GENERAL_SUGGESTIONS];
  }
};

// Helper function to determine project type from channel name
const getProjectTypeFromChannel = (channelName?: string): keyof typeof PROJECT_SUGGESTIONS => {
  if (!channelName) return 'development';

  const channelLower = channelName.toLowerCase();

  if (channelLower.includes('design') || channelLower.includes('ui') || channelLower.includes('ux')) {
    return 'design';
  } else if (channelLower.includes('dev') || channelLower.includes('code') || channelLower.includes('engineering')) {
    return 'development';
  } else if (channelLower.includes('market') || channelLower.includes('social') || channelLower.includes('content')) {
    return 'marketing';
  } else if (channelLower.includes('product') || channelLower.includes('roadmap') || channelLower.includes('feature')) {
    return 'product';
  }

  return 'development'; // Default
};

export const MessageSuggestions = ({ onSelectSuggestion, channelName }: MessageSuggestionsProps) => {
  // Determine initial project type based on channel name
  const initialProjectType = getProjectTypeFromChannel(channelName);

  // Track the current context for suggestions
  const [context, setContext] = useState<'time' | 'project'>(channelName ? 'project' : 'time');
  // Track the current project type if in project context
  const [projectType, setProjectType] = useState<keyof typeof PROJECT_SUGGESTIONS>(initialProjectType);

  // We'll show 3 random suggestions at a time
  const [suggestions, setSuggestions] = useState(() => {
    // Get 3 random suggestions from the time-based list
    return getRandomSuggestions(3);
  });

  // Function to get random suggestions
  function getRandomSuggestions(count: number) {
    // Get suggestions based on current context
    let allSuggestions: string[] = [];

    if (context === 'time') {
      allSuggestions = getTimeBasedSuggestions();
    } else {
      // Get project-specific suggestions
      allSuggestions = [...PROJECT_SUGGESTIONS[projectType], ...GENERAL_SUGGESTIONS];
    }

    const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Refresh suggestions
  const refreshSuggestions = () => {
    setSuggestions(getRandomSuggestions(3));
  };

  // Switch context and refresh suggestions
  const switchContext = (newContext: 'time' | 'project') => {
    setContext(newContext);
    setTimeout(() => {
      setSuggestions(getRandomSuggestions(3));
    }, 0);
  };

  // Switch project type and refresh suggestions
  const switchProjectType = (newType: keyof typeof PROJECT_SUGGESTIONS) => {
    setProjectType(newType);
    setTimeout(() => {
      setSuggestions(getRandomSuggestions(3));
    }, 0);
  };

  // Get the current time period for display
  const getTimePeriod = () => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return 'morning';
    } else if (hour >= 12 && hour < 17) {
      return 'afternoon';
    } else {
      return 'evening';
    }
  };

  return (
    <div className="mb-2 flex flex-col space-y-2 rounded-md border border-border/30 bg-muted/20 p-2">
      <div className="flex items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Sparkles className="size-3 text-blue-500" />
          <span>
            {context === 'time'
              ? `Suggested replies for ${getTimePeriod()}`
              : `${projectType.charAt(0).toUpperCase() + projectType.slice(1)} suggestions`}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1">
          {/* Context switcher */}
          <div className="flex rounded-md border border-border/30 text-xs">
            <Button
              variant={context === 'time' ? 'default' : 'ghost'}
              size="sm"
              className={`h-6 px-2 text-xs ${context === 'time' ? 'bg-blue-500 text-white' : 'text-muted-foreground'}`}
              onClick={() => switchContext('time')}
            >
              Time
            </Button>
            <Button
              variant={context === 'project' ? 'default' : 'ghost'}
              size="sm"
              className={`h-6 px-2 text-xs ${context === 'project' ? 'bg-blue-500 text-white' : 'text-muted-foreground'}`}
              onClick={() => switchContext('project')}
            >
              Project
            </Button>
          </div>

          {/* Project type selector - only show when in project context */}
          {context === 'project' && (
            <select
              className="h-6 rounded-md border border-border/30 bg-transparent px-1 text-xs text-muted-foreground"
              value={projectType}
              onChange={(e) => switchProjectType(e.target.value as keyof typeof PROJECT_SUGGESTIONS)}
            >
              {Object.keys(PROJECT_SUGGESTIONS).map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs text-muted-foreground hover:bg-blue-500/10 hover:text-blue-500"
            onClick={refreshSuggestions}
          >
            Refresh
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            className="h-auto rounded-full border-blue-500/20 bg-blue-500/5 px-3 py-1 text-xs text-muted-foreground hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-foreground"
            onClick={() => onSelectSuggestion(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};
