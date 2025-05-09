import * as React from 'react';

interface DirectTemplateProps {
    firstName: string;
}

export const DirectTemplate: React.FC<Readonly<DirectTemplateProps>> = ({
    firstName,
}) => (
    <div>
        <h1>Welcome, {firstName}!</h1>
    </div>
);