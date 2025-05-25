'use client';

import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/use-document-title';
import { TestBoardKanbanView } from '@/app/test/components/test-board-kanban-view';
import { TestBoardHeader } from '@/app/test/components/test-board-header';
import { TestBoardModals } from '@/app/test/components/test-board-modals';
import { TestLiveCursors, useTestLiveCursors } from '@/app/test/components/test-live-cursors';
import { TEST_LISTS, TEST_CARDS, TEST_MEMBERS } from '@/app/test/data/shared-test-data';

// Use shared test data for consistency
const DEMO_LISTS = TEST_LISTS;

const DEMO_CARDS = TEST_CARDS;

const DEMO_MEMBERS = TEST_MEMBERS;

const TestBoardPage = () => {
  useDocumentTitle('Board');
  const { showCursors } = useTestLiveCursors(true);

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

      {/* Live Cursors */}
      <TestLiveCursors enabled={showCursors} maxCursors={3} />
    </div>
  );
};

export default TestBoardPage;
