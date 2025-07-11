import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from '@react-email/components';

interface ThreadReplyTemplateProps {
  firstName: string;
  replierName: string;
  originalMessagePreview: string;
  replyMessagePreview: string;
  channelName?: string;
  workspaceUrl?: string;
  workspaceName?: string;
  unsubscribeUrl?: string;
}

export const ThreadReplyTemplate: React.FC<Readonly<ThreadReplyTemplateProps>> = ({
  firstName,
  replierName,
  originalMessagePreview,
  replyMessagePreview,
  channelName = 'a channel',
  workspaceUrl = process.env.NEXT_PUBLIC_APP_URL,
  workspaceName = 'Proddy',
  unsubscribeUrl,
}) => {
  const previewText = `${replierName} replied to your message in ${channelName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://proddy.tech/logo-nobg.png"
            width="40"
            height="40"
            alt="Proddy"
            style={logo}
          />
          <Heading style={heading}>New Reply to Your Message</Heading>
          <Section style={section}>
            <Text style={text}>Hi {firstName},</Text>
            <Text style={text}>
              <strong>{replierName}</strong> replied to your message in {channelName}.
            </Text>

            <Section style={messageContainer}>
              <Text style={originalMessageText}>
                <strong>Your message:</strong>
              </Text>
              <Text style={messageText}>
                "{originalMessagePreview}"
              </Text>

              <Hr style={messageDivider} />

              <Text style={replyMessageText}>
                <strong>Reply from {replierName}:</strong>
              </Text>
              <Text style={messageText}>
                "{replyMessagePreview}"
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Button
                style={{
                  ...button,
                  paddingLeft: '20px',
                  paddingRight: '20px',
                  paddingTop: '12px',
                  paddingBottom: '12px'
                }}
                href={workspaceUrl}
              >
                View Thread
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            This email was sent from {workspaceName}, your team collaboration platform.
            If you didn't expect this email, you can safely ignore it.
          </Text>

          {unsubscribeUrl && (
            <Text style={unsubscribeText}>
              Don't want to receive thread reply notifications? {' '}
              <Link href={unsubscribeUrl} style={unsubscribeLink}>
                Unsubscribe from these emails
              </Link>
            </Text>
          )}
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  padding: '40px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #eee',
  borderRadius: '5px',
  boxShadow: '0 5px 10px rgba(20, 50, 70, 0.05)',
  margin: '0 auto',
  maxWidth: '600px',
  padding: '20px',
};

const logo = {
  margin: '0 auto 20px',
  display: 'block',
};

const heading = {
  color: '#0E1C36',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '15px 0',
  textAlign: 'center' as const,
};

const section = {
  padding: '0 10px',
};

const text = {
  color: '#4A5568',
  fontSize: '16px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const messageContainer = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '5px',
  padding: '15px',
  margin: '24px 0',
};

const originalMessageText = {
  color: '#4A5568',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const replyMessageText = {
  color: '#4A5568',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '8px 0',
};

const messageText = {
  color: '#4A5568',
  fontSize: '16px',
  fontStyle: 'italic',
  lineHeight: '1.5',
  margin: '0 0 8px 0',
};

const messageDivider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const buttonContainer = {
  margin: '24px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4F46E5',
  borderRadius: '5px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '1.5',
  textAlign: 'center' as const,
};

const unsubscribeText = {
  color: '#8898aa',
  fontSize: '11px',
  lineHeight: '1.4',
  textAlign: 'center' as const,
  marginTop: '20px',
};

const unsubscribeLink = {
  color: '#4F46E5',
  textDecoration: 'underline',
};

export default ThreadReplyTemplate;
