import * as React from 'react';
import { BaseEmailTemplate } from './base-email-template';

interface DirectTemplateProps {
    firstName: string;
    senderName: string;
    messagePreview: string;
    workspaceId: string;
    senderId: string;
    messageId: string;
}

export const DirectTemplate: React.FC<Readonly<DirectTemplateProps>> = ({
    firstName,
    senderName,
    messagePreview,
    workspaceId,
    senderId,
    messageId,
}) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy-platform.vercel.app';
    const actionUrl = `${appUrl}/workspace/${workspaceId}/member/${senderId}?messageId=${messageId}`;

    return (
        <BaseEmailTemplate
            previewText={`New message from ${senderName}`}
            heading={`New Direct Message from ${senderName}`}
            actionLink={{
                text: 'View Message',
                url: actionUrl,
            }}
        >
            <p style={{ color: '#374151', marginBottom: '16px' }}>
                Hi {firstName},
            </p>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
                You have received a new direct message from <strong>{senderName}</strong>.
            </p>
            <p style={{
                color: '#374151',
                marginBottom: '16px',
                fontStyle: 'italic',
                backgroundColor: '#f9fafb',
                padding: '16px',
                borderLeft: '4px solid #6366f1'
            }}>
                "{messagePreview}"
            </p>
            <p style={{ color: '#374151' }}>
                Click the button below to view the message and respond.
            </p>
        </BaseEmailTemplate>
    );
};