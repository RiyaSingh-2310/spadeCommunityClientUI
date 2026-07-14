import type { ReactNode } from 'react';
import {
  Database,
  FileText,
  Mail,
  Shield,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import './PublicPages.css';

const sections = [
  {
    id: 'intro',
    icon: FileText,
    title: 'Introduction',
    content: (
      <p>
        Spade Market Research (P) Ltd (&quot;Spade Community&quot;, &quot;we&quot;, &quot;us&quot;, or
        &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy
        explains how we collect, use, disclose, and safeguard your information
        when you visit our website and use our services.
      </p>
    ),
  },
  {
    id: 'collect',
    icon: Database,
    title: 'Information We Collect',
    content: (
      <>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Personal identification information (name, email address, phone number)</li>
          <li>Demographic information (age, gender, location, interests)</li>
          <li>Survey responses and opinions</li>
          <li>Device and usage information (IP address, browser type, pages visited)</li>
        </ul>
      </>
    ),
  },
  {
    id: 'use',
    icon: ShieldCheck,
    title: 'How We Use Information',
    content: (
      <>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide and maintain our services</li>
          <li>Send survey invitations matching your profile</li>
          <li>Process reward redemptions</li>
          <li>Improve our website and services</li>
          <li>Communicate with you about your account and updates</li>
          <li>Comply with legal obligations</li>
        </ul>
      </>
    ),
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Data Security',
    content: (
      <p>
        We implement appropriate technical and organizational security measures
        to protect your personal information against unauthorized access,
        alteration, disclosure, or destruction. However, no method of
        transmission over the Internet is 100% secure.
      </p>
    ),
  },
  {
    id: 'rights',
    icon: UserCheck,
    title: 'User Rights',
    content: (
      <p>
        You have the right to access, correct, or delete your personal
        information. You may also opt out of marketing communications at any
        time. To exercise these rights, please contact us at
        support@spade-community.com.
      </p>
    ),
  },
  {
    id: 'contact',
    icon: Mail,
    title: 'Contact',
    content: (
      <>
        <p>If you have questions about this Privacy Policy, please contact us at:</p>
        <p>
          {/* Spade Market Research (P) Ltd<br />
          #1108, Ace City, Greater Noida, UP-201306, India<br /> */}
          Email: support@spade-community.com
        </p>
      </>
    ),
  },
];

function PrivacySectionCard({
  icon: Icon,
  title,
  children,
  delay,
}: {
  icon: typeof FileText;
  title: string;
  children: ReactNode;
  delay: number;
}) {
  const { ref, className } = useScrollReveal<HTMLElement>({ threshold: 0.12 });

  return (
    <article
      ref={ref}
      className={`privacy-card reveal reveal--delay-${delay} ${className.includes('reveal--visible') ? 'reveal--visible' : ''}`}
    >
      <div className="privacy-card__icon">
        <Icon size={20} aria-hidden="true" />
      </div>
      <h2>{title}</h2>
      <div className="privacy-card__body">{children}</div>
    </article>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="pub-page">
      <section className="pub-hero">
        <div className="container-wide pub-hero__inner">
          <p className="pub-hero__eyebrow">
            <Shield size={13} aria-hidden="true" />
            Legal
          </p>
          <h1>Privacy Policy</h1>
          <p>
            We are committed to protecting your privacy and being transparent about how we
            collect, use, and safeguard your personal information.
          </p>
        </div>
      </section>

      <section className="privacy-content">
        <div className="container-wide privacy-content__grid">
          {sections.map((section, index) => (
            <PrivacySectionCard
              key={section.id}
              icon={section.icon}
              title={section.title}
              delay={(index % 4) + 1}
            >
              {section.content}
            </PrivacySectionCard>
          ))}
        </div>
        <p className="privacy-content__updated container-wide">Last updated: June 2026</p>
      </section>
    </div>
  );
}
