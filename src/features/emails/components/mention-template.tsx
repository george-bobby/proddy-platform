import * as React from 'react';

interface MentionTemplateProps {
    firstName: string;
}

export const MentionTemplate: React.FC<Readonly<MentionTemplateProps>> = ({
    firstName,
}) => (
    <div>
        <h1>Welcome, {firstName}!</h1>
    </div>
);