'use client';

import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { TestBoardKanbanView } from '@/app/test/components/test-board-kanban-view';
import { TestBoardHeader } from '@/app/test/components/test-board-header';
import { TestBoardModals } from '@/app/test/components/test-board-modals';

// Hardcoded demo data - Always available for demo
const DEMO_LISTS = [
  {
    _id: 'list-1',
    title: 'To Do',
    position: 0,
    _creationTime: Date.now() - 86400000 * 7, // 7 days ago
  },
  {
    _id: 'list-2',
    title: 'In Progress',
    position: 1,
    _creationTime: Date.now() - 86400000 * 6, // 6 days ago
  },
  {
    _id: 'list-3',
    title: 'Review',
    position: 2,
    _creationTime: Date.now() - 86400000 * 5, // 5 days ago
  },
  {
    _id: 'list-4',
    title: 'Done',
    position: 3,
    _creationTime: Date.now() - 86400000 * 4, // 4 days ago
  },
];

const DEMO_CARDS = [
  // To Do List Cards - High Priority Items
  {
    _id: 'card-1',
    title: 'Implement Payment API Integration',
    description: 'Integrate Stripe payment processing with the checkout flow. Include error handling and webhook setup for real-time payment notifications.',
    labels: ['backend', 'api', 'payment', 'critical'],
    priority: 'highest',
    dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
    assignees: ['member-1', 'member-2'],
    listId: 'list-1',
    position: 0,
    _creationTime: Date.now() - 86400000 * 2,
  },
  {
    _id: 'card-2',
    title: 'Design Mobile App Wireframes',
    description: 'Create wireframes for the mobile app dashboard and user profile screens.',
    labels: ['design', 'mobile', 'ui/ux'],
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
    assignees: ['member-3'],
    listId: 'list-1',
    position: 1,
    _creationTime: Date.now() - 86400000 * 1,
  },
  {
    _id: 'card-3',
    title: 'Database Performance Optimization',
    description: 'Optimize slow queries and add proper indexing to improve database performance.',
    labels: ['database', 'performance', 'backend'],
    priority: 'highest',
    dueDate: new Date(Date.now() + 86400000 * 1), // Tomorrow
    assignees: ['member-4'],
    listId: 'list-1',
    position: 2,
    _creationTime: Date.now() - 86400000 * 3,
  },
  
  // In Progress List Cards
  {
    _id: 'card-4',
    title: 'User Authentication System',
    description: 'Implement JWT-based authentication with refresh tokens and role-based access control.',
    labels: ['auth', 'security', 'backend'],
    priority: 'high',
    dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
    assignees: ['member-1', 'member-4'],
    listId: 'list-2',
    position: 0,
    _creationTime: Date.now() - 86400000 * 4,
  },
  {
    _id: 'card-5',
    title: 'Frontend Component Library',
    description: 'Build reusable React components with TypeScript and Storybook documentation.',
    labels: ['frontend', 'react', 'components'],
    priority: 'medium',
    dueDate: new Date(Date.now() + 86400000 * 7), // 1 week from now
    assignees: ['member-2', 'member-3'],
    listId: 'list-2',
    position: 1,
    _creationTime: Date.now() - 86400000 * 5,
  },
  
  // Review List Cards
  {
    _id: 'card-6',
    title: 'API Documentation Update',
    description: 'Update OpenAPI documentation for new endpoints and authentication changes.',
    labels: ['documentation', 'api'],
    priority: 'low',
    dueDate: new Date(Date.now() + 86400000 * 4), // 4 days from now
    assignees: ['member-2'],
    listId: 'list-3',
    position: 0,
    _creationTime: Date.now() - 86400000 * 6,
  },
  {
    _id: 'card-7',
    title: 'Security Audit Report',
    description: 'Review and address findings from the third-party security audit.',
    labels: ['security', 'audit', 'critical'],
    priority: 'highest',
    dueDate: new Date(Date.now() + 86400000 * 1), // Tomorrow
    assignees: ['member-4', 'member-1'],
    listId: 'list-3',
    position: 1,
    _creationTime: Date.now() - 86400000 * 7,
  },
  
  // Done List Cards
  {
    _id: 'card-8',
    title: 'Setup CI/CD Pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    labels: ['devops', 'ci/cd', 'automation'],
    priority: 'medium',
    dueDate: new Date(Date.now() - 86400000 * 2), // 2 days ago (completed)
    assignees: ['member-4'],
    listId: 'list-4',
    position: 0,
    _creationTime: Date.now() - 86400000 * 10,
  },
  {
    _id: 'card-9',
    title: 'Project Setup & Configuration',
    description: 'Initialize project structure, dependencies, and development environment.',
    labels: ['setup', 'config'],
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000 * 5), // 5 days ago (completed)
    assignees: ['member-1'],
    listId: 'list-4',
    position: 1,
    _creationTime: Date.now() - 86400000 * 14,
  },
  {
    _id: 'card-10',
    title: 'Team Onboarding Documentation',
    description: 'Create comprehensive onboarding guide for new team members.',
    labels: ['documentation', 'onboarding'],
    priority: 'low',
    dueDate: new Date(Date.now() - 86400000 * 1), // Yesterday (completed)
    assignees: ['member-3'],
    listId: 'list-4',
    position: 2,
    _creationTime: Date.now() - 86400000 * 8,
  },
];

const DEMO_MEMBERS = [
  {
    _id: 'member-1',
    user: {
      name: 'Alex Rodriguez',
      image: null,
    },
  },
  {
    _id: 'member-2',
    user: {
      name: 'Sarah Johnson',
      image: null,
    },
  },
  {
    _id: 'member-3',
    user: {
      name: 'Maya Patel',
      image: null,
    },
  },
  {
    _id: 'member-4',
    user: {
      name: 'David Kim',
      image: null,
    },
  },
];

const TestBoardPage = () => {
  useDocumentTitle('Test Board');
  
  const [view, setView] = useState<'kanban' | 'table' | 'gantt'>('kanban');
  const [lists, setLists] = useState(DEMO_LISTS);
  const [cards, setCards] = useState(DEMO_CARDS);
  
  // Modal states
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Group cards by list
  const cardsByList = React.useMemo(() => {
    const grouped: Record<string, any[]> = {};
    lists.forEach(list => {
      grouped[list._id] = cards
        .filter(card => card.listId === list._id)
        .sort((a, b) => a.position - b.position);
    });
    return grouped;
  }, [lists, cards]);

  const handleEditCard = (card: any) => {
    setSelectedCard(card);
    setIsCardModalOpen(true);
  };

  const handleAddCard = (listId: string) => {
    setSelectedListId(listId);
    setIsAddCardModalOpen(true);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card._id !== cardId));
    console.log('Card deleted successfully');
  };

  const handleSaveCard = (updatedCard: any) => {
    setCards(prev => prev.map(card => 
      card._id === updatedCard._id ? updatedCard : card
    ));
    setIsCardModalOpen(false);
    setSelectedCard(null);
  };

  const handleCreateCard = (newCard: any) => {
    const cardWithId = {
      ...newCard,
      _id: `card-${Date.now()}`,
      listId: selectedListId,
      position: cardsByList[selectedListId!]?.length || 0,
      _creationTime: Date.now(),
    };
    setCards(prev => [...prev, cardWithId]);
    setIsAddCardModalOpen(false);
    setSelectedListId(null);
  };

  const handleDragEnd = (event: any) => {
    console.log('Drag ended:', event);
  };

  const moveCardToNextList = (cardId: string) => {
    setCards(prev => prev.map(card => {
      if (card._id === cardId) {
        const currentListIndex = lists.findIndex(list => list._id === card.listId);
        const nextListIndex = (currentListIndex + 1) % lists.length;
        return { ...card, listId: lists[nextListIndex]._id };
      }
      return card;
    }));
  };

  return (
    <div className="flex h-full flex-col">
      <TestBoardHeader 
        view={view} 
        onViewChange={setView}
        cardCount={cards.length}
        listCount={lists.length}
      />
      
      <div className="flex-1 overflow-hidden">
        {view === 'kanban' && (
          <TestBoardKanbanView
            lists={lists}
            cardsByList={cardsByList}
            members={DEMO_MEMBERS}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
            onAddCard={handleAddCard}
            onMoveCard={moveCardToNextList}
            handleDragEnd={handleDragEnd}
          />
        )}
        
        {view === 'table' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Table view coming soon...
          </div>
        )}
        
        {view === 'gantt' && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Gantt view coming soon...
          </div>
        )}
      </div>

      <TestBoardModals
        selectedCard={selectedCard}
        isCardModalOpen={isCardModalOpen}
        onCardModalClose={() => {
          setIsCardModalOpen(false);
          setSelectedCard(null);
        }}
        onSaveCard={handleSaveCard}
        isAddCardModalOpen={isAddCardModalOpen}
        onAddCardModalClose={() => {
          setIsAddCardModalOpen(false);
          setSelectedListId(null);
        }}
        onCreateCard={handleCreateCard}
        members={DEMO_MEMBERS}
        selectedListId={selectedListId}
        lists={lists}
      />
    </div>
  );
};

export default TestBoardPage;
