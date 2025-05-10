import * as React from 'react';

interface BaseEmailTemplateProps {
  previewText: string;
  heading: string;
  children: React.ReactNode;
  footerText?: string;
  actionLink?: {
    text: string;
    url: string;
  };
}

export const BaseEmailTemplate: React.FC<Readonly<BaseEmailTemplateProps>> = ({
  previewText,
  heading,
  children,
  footerText = 'Proddy - Team Collaboration Platform',
  actionLink,
}) => (
  <div>
    {/* Email preview text */}
    <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
      {previewText}
    </div>

    {/* Email body */}
    <div style={{ backgroundColor: '#f3f4f6', fontFamily: 'Arial, sans-serif', padding: '20px', margin: 0 }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: 'white', borderRadius: '8px', padding: '30px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="https://via.placeholder.com/150x50/4f46e5/ffffff?text=Proddy"
            alt="Proddy Logo"
            width="150"
            height="50"
            style={{ margin: '0 auto' }}
          />
        </div>

        {/* Heading */}
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', marginBottom: '16px' }}>
          {heading}
        </h1>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          {children}
        </div>

        {/* Action Button */}
        {actionLink && (
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <a
              href={actionLink.url}
              style={{
                backgroundColor: '#4f46e5',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold',
                display: 'inline-block'
              }}
            >
              {actionLink.text}
            </a>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid #e5e7eb', margin: '24px 0' }}></div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          <p>{footerText}</p>
          <p>© {new Date().getFullYear()} Proddy. All rights reserved.</p>
        </div>
      </div>
    </div>
  </div>
);
