import * as React from 'react';
import { BaseEmailTemplate } from './base-email-template';

interface AssigneeTemplateProps {
    firstName: string;
    assignerName: string;
    taskTitle: string;
    taskDescription?: string;
    dueDate?: string;
    priority?: string;
    workspaceId: string;
    boardId?: string;
    taskId: string;
}

export const AssigneeTemplate: React.FC<Readonly<AssigneeTemplateProps>> = ({
    firstName,
    assignerName,
    taskTitle,
    taskDescription,
    dueDate,
    priority,
    workspaceId,
    boardId,
    taskId,
}) => {
    // If we have a board ID, link to the board, otherwise link to tasks
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy-platform.vercel.app';
    const actionUrl = boardId
        ? `${appUrl}/workspace/${workspaceId}/board/${boardId}?taskId=${taskId}`
        : `${appUrl}/workspace/${workspaceId}/tasks?taskId=${taskId}`;

    return (
        <BaseEmailTemplate
            previewText={`${assignerName} assigned you a task: ${taskTitle}`}
            heading={`New Task Assignment: ${taskTitle}`}
            actionLink={{
                text: 'View Task',
                url: actionUrl,
            }}
        >
            <p style={{ color: '#374151', marginBottom: '16px' }}>
                Hi {firstName},
            </p>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
                <strong>{assignerName}</strong> has assigned you a new task.
            </p>

            <p style={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}>Task Details:</p>
            <p style={{ color: '#374151', marginBottom: '8px' }}>
                <strong>Title:</strong> {taskTitle}
            </p>

            {taskDescription && (
                <p style={{ color: '#374151', marginBottom: '8px' }}>
                    <strong>Description:</strong> {taskDescription}
                </p>
            )}

            {dueDate && (
                <p style={{ color: '#374151', marginBottom: '8px' }}>
                    <strong>Due Date:</strong> {dueDate}
                </p>
            )}

            {priority && (
                <p style={{ color: '#374151', marginBottom: '16px' }}>
                    <strong>Priority:</strong> {priority}
                </p>
            )}

            <p style={{ color: '#374151' }}>
                Click the button below to view the task details and get started.
            </p>
        </BaseEmailTemplate>
    );
};