'use client';

import { useDocumentTitle } from '@/hooks/use-document-title';
import { TestDashboardChatbot } from '@/app/test/components/test-dashboard-chatbot';
import { TestDashboardWidgets } from '@/app/test/components/test-dashboard-widgets';
import { LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TestDashboardPage = () => {
  useDocumentTitle('Test Dashboard');

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-primary p-4">
        <Button
          variant="ghost"
          className="group w-auto overflow-hidden px-3 py-2 text-lg font-semibold text-white hover:bg-white/10 transition-standard"
          size="sm"
        >
          <LayoutDashboard className="mr-2 size-5" />
          <span className="truncate">Test Dashboard</span>
        </Button>
      </div>
      <div className="flex flex-1 overflow-hidden p-4 md:p-6">
        <div className="flex w-full flex-col space-y-6 md:flex-row md:space-x-6 md:space-y-0">
          {/* Chatbot section - 40% width on desktop */}
          <div className="w-full md:w-[40%] flex flex-col">
            <TestDashboardChatbot />
          </div>

          {/* Widgets section - 60% width on desktop */}
          <div className="w-full md:w-[60%] flex flex-col">
            <TestDashboardWidgets />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDashboardPage;
