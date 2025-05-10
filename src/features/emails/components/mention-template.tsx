import * as React from 'react';
import { BaseEmailTemplate } from './base-email-template';

interface MentionTemplateProps {
    firstName: string;
    mentionerName: string;
    channelName: string;
    messagePreview: string;
    workspaceId: string;
    channelId: string;
    messageId: string;
}

export const MentionTemplate: React.FC<Readonly<MentionTemplateProps>> = ({
    firstName,
    mentionerName,
    channelName,
    messagePreview,
    workspaceId,
    channelId,
    messageId,
}) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://proddy-platform.vercel.app';
    const actionUrl = `${appUrl}/workspace/${workspaceId}/channel/${channelId}?messageId=${messageId}`;

    return (
        <BaseEmailTemplate
            previewText={`${mentionerName} mentioned you in ${channelName}`}
            heading={`You were mentioned in ${channelName}`}
            actionLink={{
                text: 'View Mention',
                url: actionUrl,
            }}
        >
            <p style={{ color: '#374151', marginBottom: '16px' }}>
                Hi {firstName},
            </p>
            <p style={{ color: '#374151', marginBottom: '16px' }}>
                <strong>{mentionerName}</strong> mentioned you in <strong>{channelName}</strong>.
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