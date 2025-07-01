'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {generateUnsubscribeToken} from '@/lib/unsubscribe-token';

export default function TestUnsubscribePage() {
    const [userId, setUserId] = useState('user_123');
    const [email, setEmail] = useState('test@example.com');
    const [workspaceId, setWorkspaceId] = useState('workspace_456');
    const [generatedUrl, setGeneratedUrl] = useState('');

    const generateTestUrl = () => {
        const token = generateUnsubscribeToken(userId, email);
        const baseUrl = window.location.origin;
        const url = `${baseUrl}/unsubscribe?token=${token}&userId=${userId}&workspaceId=${workspaceId}&email=${encodeURIComponent(email)}`;
        setGeneratedUrl(url);
    };

    const testUnsubscribe = () => {
        if (generatedUrl) {
            window.open(generatedUrl, '_blank');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Test Unsubscribe Flow</CardTitle>
                    <CardDescription>
                        Generate and test unsubscribe links for the email notification system.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="userId">User ID</Label>
                            <Input
                                id="userId"
                                value={userId}
                                onChange={(e) => setUserId(e.target.value)}
                                placeholder="user_123"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="test@example.com"
                            />
                        </div>
                        <div>
                            <Label htmlFor="workspaceId">Workspace ID</Label>
                            <Input
                                id="workspaceId"
                                value={workspaceId}
                                onChange={(e) => setWorkspaceId(e.target.value)}
                                placeholder="workspace_456"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Button onClick={generateTestUrl} className="w-full">
                            Generate Unsubscribe URL
                        </Button>

                        {generatedUrl && (
                            <div className="space-y-2">
                                <Label>Generated URL:</Label>
                                <div className="p-3 bg-gray-100 rounded-md text-sm break-all">
                                    {generatedUrl}
                                </div>
                                <Button onClick={testUnsubscribe} variant="outline" className="w-full">
                                    Test Unsubscribe Flow
                                </Button>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-md">
                        <h3 className="font-semibold text-blue-900 mb-2">How to test:</h3>
                        <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                            <li>Fill in the user ID, email, and workspace ID above</li>
                            <li>Click "Generate Unsubscribe URL" to create a test link</li>
                            <li>Click "Test Unsubscribe Flow" to open the unsubscribe page</li>
                            <li>The unsubscribe page should redirect to the workspace with the user profile modal open
                                on the notifications tab
                            </li>
                        </ol>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
