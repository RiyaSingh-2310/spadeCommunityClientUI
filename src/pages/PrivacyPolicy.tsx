import './PageStyles.css';

export default function PrivacyPolicy() {
  return (
    <div className="page">
      <div className="page__hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your information</p>
        </div>
      </div>
      <div className="page__content container page__legal">
        <section>
          <h2>Introduction</h2>
          <p>
            Spade Market Research (P) Ltd (&quot;Spade Community&quot;, &quot;we&quot;, &quot;us&quot;, or
            &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information
            when you visit our website and use our services.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Personal identification information (name, email address, phone number)</li>
            <li>Demographic information (age, gender, location, interests)</li>
            <li>Survey responses and opinions</li>
            <li>Device and usage information (IP address, browser type, pages visited)</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our services</li>
            <li>Send survey invitations matching your profile</li>
            <li>Process reward redemptions</li>
            <li>Improve our website and services</li>
            <li>Communicate with you about your account and updates</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational security measures
            to protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. However, no method of
            transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal
            information. You may also opt out of marketing communications at any
            time. To exercise these rights, please contact us at
            support@spade-community.com.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <p>
            Spade Market Research (P) Ltd<br />
            #1108, Ace City, Greater Noida, UP-201306, India<br />
            Email: support@spade-community.com
          </p>
        </section>

        <p className="page__updated">Last updated: June 2026</p>
      </div>
    </div>
  );
}
