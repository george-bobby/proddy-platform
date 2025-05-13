import { NextRequest, NextResponse } from 'next/server';
import { MentionTemplate } from '@/features/email/components/mention';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { to, firstName } = body;

		const { data, error } = await resend.emails.send({
			from: 'Proddy <notifications@proddy.io>',
			to: [to || 'delivered@resend.dev'],
			subject: 'You were mentioned in Proddy',
			react: MentionTemplate({ firstName: firstName || 'User' }),
		});

		if (error) {
			return NextResponse.json({ error }, { status: 400 });
		}

		return NextResponse.json({ data }, { status: 200 });
	} catch (error) {
		return NextResponse.json(
			{ error: 'Failed to send email' },
			{ status: 500 }
		);
	}
}
