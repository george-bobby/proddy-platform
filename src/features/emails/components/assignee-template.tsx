import * as React from 'react';

interface AssigneeTemplateProps {
    firstName: string;
}

export const AssigneeTemplate: React.FC<Readonly<AssigneeTemplateProps>> = ({
    firstName,
}) => (
    <div>
        <h1>Welcome, {firstName}!</h1>
    </div>
);