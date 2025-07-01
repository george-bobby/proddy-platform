'use client';

import {useEffect, useState} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {AlertCircle, CheckCircle, Loader, Mail} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {validateUnsubscribeToken} from '@/lib/unsubscribe-token';

export default function UnsubscribePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
    const [countdown, setCountdown] = useState(5);

    // Extract parameters from URL
    const token = searchParams.get('token');
    const userId = searchParams.get('userId');
    const workspaceId = searchParams.get('workspaceId');
    const email = searchParams.get('email');

    useEffect(() => {
        // Validate required parameters
        if (!token || !userId || !workspaceId) {
            setStatus('invalid');
            return;
        }

        // Validate the unsubscribe token
        const tokenData = validateUnsubscribeToken(token);
        if (!tokenData || tokenData.userId !== userId) {
            setStatus('invalid');
            return;
        }

        // If email is provided, validate it matches the token
        if (email && tokenData.email !== email) {
            setStatus('invalid');
            return;
        }

        // Token is valid, simulate processing
        const timer = setTimeout(() => {
            setStatus('success');
        }, 1500);

        return () => clearTimeout(timer);
    }, [token, userId, workspaceId, email]);

    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            // Redirect to workspace with parameter to open user settings
            router.push(`/workspace/${workspaceId}?openUserSettings=notifications`);
        }
    }, [status, countdown, router, workspaceId]);

    const handleManualRedirect = () => {
        if (workspaceId) {
            router.push(`/workspace/${workspaceId}?openUserSettings=notifications`);
        }
    };

    const handleGoHome = () => {
        router.push('/');
    };

    if (status === 'loading') {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                            <Loader className="h-6 w-6 animate-spin text-blue-600"/>
                        </div>
                        <CardTitle>Processing Unsubscribe Request</CardTitle>
                        <CardDescription>
                            Please wait while we process your request...
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    if (status === 'invalid') {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div
                            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <AlertCircle className="h-6 w-6 text-red-600"/>
                        </div>
                        <CardTitle>Invalid Unsubscribe Link</CardTitle>
                        <CardDescription>
                            This unsubscribe link is invalid or has expired. Please use the link from your most recent
                            email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <Button onClick={handleGoHome} className="w-full">
                            Go to Homepage
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                        <CheckCircle className="h-6 w-6 text-green-600"/>
                    </div>
                    <CardTitle>Unsubscribe Successful</CardTitle>
                    <CardDescription>
                        {email ? `We've updated the notification preferences for ${email}.` : 'Your notification preferences have been updated.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 inline mr-2"/>
                        You'll be redirected to your workspace to manage detailed notification settings
                        in {countdown} seconds.
                    </div>
                    <div className="space-y-2">
                        <Button onClick={handleManualRedirect} className="w-full">
                            Manage Notification Settings Now
                        </Button>
                        <Button onClick={handleGoHome} variant="outline" className="w-full">
                            Go to Homepage
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}