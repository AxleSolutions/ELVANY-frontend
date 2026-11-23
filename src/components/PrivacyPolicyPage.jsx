import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { Lock, EyeOff, ShieldCheck, Database, CreditCard, UserCheck, FileText } from 'lucide-react';

export const PrivacyPolicyPage = () => {
  const navLinks = [
    { id: 'introduction', label: '1. Introduction' },
    { id: 'data-collected', label: '2. Information We Collect' },
    { id: 'how-we-use', label: '3. How Data is Used' },
    { id: 'payhere-security', label: '4. PayHere Payment Security' },
    { id: 'data-sharing', label: '5. Sharing & Couriers' },
    { id: 'data-protection', label: '6. Security Practices' },
    { id: 'cookies', label: '7. Cookies & Analytics' },
    { id: 'user-rights', label: '8. Privacy Rights & Deletion' },
    { id: 'retention', label: '9. Data Retention' },
    { id: 'updates', label: '10. Policy Updates' }
  ];

  return (
    <PolicyLayout
      badge="DATA PROTECTION & CONSUMER PRIVACY"
      title="Privacy Policy"
      subtitle="Transparency regarding how ELVANY collects, uses, safeguards, and respects your personal and transaction data under Sri Lankan law."
      lastUpdated="November 23, 2026"
      navLinks={navLinks}
      seoTitle="Privacy Policy"
      seoDescription="Official Privacy Policy for ELVANY clothing and fashion store in Sri Lanka. Information collection, secure PayHere payment processing, courier sharing, and user privacy rights."
    >
      {/* Privacy Highlights Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <EyeOff size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Data Sales</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>We Never Sell Data</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Zero third-party advertising brokering</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <CreditCard size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Payment Gateway</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>PayHere Encrypted</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>No card numbers stored on our servers</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <Lock size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Encryption</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>256-Bit SSL/TLS</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>End-to-end data security across elvany.lk</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <UserCheck size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Your Rights</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>Full Data Access</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Request export or deletion anytime</div>
        </div>
      </div>

      {/* Section 1 */}
      <section id="introduction" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">01</span>
          <h2 className="policy-section-title">Introduction & Commitment</h2>
        </div>
        <p className="policy-paragraph">
          <strong>ELVANY</strong> (operating at <strong>https://elvany.lk</strong> in Sri Lanka) is committed to protecting the privacy, confidentiality, and security of our clients’ personal information.
        </p>
        <p className="policy-paragraph">
          This Privacy Policy outlines how we gather, utilize, store, share, and protect your information when you visit our website, register an account, configure garments in our bespoke lab, or place an order for delivery across Sri Lanka. By using <strong>https://elvany.lk</strong>, you agree to the collection and handling of your data in conformity with this policy and Sri Lankan legal standards.
        </p>
      </section>

      {/* Section 2 */}
      <section id="data-collected" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">02</span>
          <h2 className="policy-section-title">Information We Collect</h2>
        </div>
        <p className="policy-paragraph">
          We collect only the essential personal details required to accurately process transactions, tailor garment orders, and coordinate delivery:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Contact & Identity Details:</strong> Full Name, Email Address, and Telephone / Mobile Number.
          </li>
          <li className="policy-list-item">
            <strong>Delivery & Billing Information:</strong> Street address, city, postal code, province, and specific delivery instructions for our courier partners.
          </li>
          <li className="policy-list-item">
            <strong>Order & Transaction Records:</strong> Garment selections, sizing attributes (e.g. S, M, L, XL), bespoke print configurations, Order Passport IDs, total purchase values in Sri Lankan Rupees (LKR), and payment confirmation tokens.
          </li>
          <li className="policy-list-item">
            <strong>Customer Service Communications:</strong> Records of inquiries, emails, or WhatsApp correspondence regarding sizing, fit advice, order status, or exchanges.
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="how-we-use" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">03</span>
          <h2 className="policy-section-title">How We Use Customer Information</h2>
        </div>
        <p className="policy-paragraph">
          Your information is utilized solely for lawful commercial and operational fulfillment purposes:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Order Fulfillment:</strong> Validating orders, reserving warehouse inventory, tailoring bespoke garments, and printing packing slips and invoices.
          </li>
          <li className="policy-list-item">
            <strong>Doorstep Parcel Delivery:</strong> Furnishing our vetted express courier partners with your recipient name, address, and mobile number to effect delivery.
          </li>
          <li className="policy-list-item">
            <strong>Order Notifications & Telemetry:</strong> Transmitting automated order confirmations, payment receipts, dispatch notifications, and courier tracking information via email, SMS, or WhatsApp.
          </li>
          <li className="policy-list-item">
            <strong>Customer Support & Returns:</strong> Facilitating size exchanges, handling returns, investigating defective delivery reports, and responding to inquiries.
          </li>
          <li className="policy-list-item">
            <strong>Fraud Prevention & Site Security:</strong> Monitoring transactions to prevent fraudulent charges, unauthorized gateway attempts, and website abuse.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="payhere-security" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">04</span>
          <h2 className="policy-section-title">Payment Processing Through PayHere</h2>
        </div>
        <div className="policy-callout">
          <strong>Strict Security Guarantee:</strong> ELVANY does <strong>not</strong> collect, process, record, or store any sensitive cardholder data—including full credit/debit card numbers, CVV security codes, or banking passwords—on any of our servers or databases.
        </div>
        <p className="policy-paragraph">
          All online electronic payment transactions on <strong>https://elvany.lk</strong> are processed through <strong>PayHere</strong>, an approved, regulated payment gateway supervised by the <strong>Central Bank of Sri Lanka</strong> and certified under global <strong>PCI-DSS Level 1 (Payment Card Industry Data Security Standard)</strong> compliance.
        </p>
        <p className="policy-paragraph">
          When you submit payment during checkout:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            Your card and billing credentials are transmitted directly to PayHere via end-to-end 256-bit bank-grade TLS/SSL encryption.
          </li>
          <li className="policy-list-item">
            PayHere conducts authentication through 3D-Secure verification (e.g. Visa Secure, Mastercard Identity Check) directly with your card-issuing bank.
          </li>
          <li className="policy-list-item">
            PayHere returns only a secure authorization token and status code to ELVANY to confirm payment success or failure, allowing us to generate your Order Passport.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="data-sharing" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">05</span>
          <h2 className="policy-section-title">Data Sharing with Essential Service Providers</h2>
        </div>
        <p className="policy-paragraph">
          ELVANY operates under a strict principle of data minimization. We only share customer data with reputable third-party partners strictly necessary to operate our business:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Courier Logistics Partners:</strong> We share the recipient's name, delivery shipping address, and telephone number with domestic express courier services solely for the physical transit and delivery of parcels.
          </li>
          <li className="policy-list-item">
            <strong>Payment Processing Partners:</strong> PayHere for authorizing credit/debit cards, LankaQR, and mobile wallets.
          </li>
          <li className="policy-list-item">
            <strong>Infrastructure & Database Hosts:</strong> Secure cloud database hosts maintaining encrypted order records and transactional email/notification dispatch.
          </li>
          <li className="policy-list-item">
            <strong>Legal & Law Enforcement:</strong> We may disclose information if mandated by a formal court order, search warrant, or applicable Sri Lankan statutory regulation.
          </li>
        </ul>
        <div className="policy-callout" style={{ borderLeftColor: '#10b981' }}>
          <strong>Explicit Data Sale Prohibition:</strong> ELVANY <strong>does not sell, rent, commercialize, or trade</strong> our customers’ personal information, contact records, or transaction histories to third-party advertisers, data aggregators, or marketing firms under any circumstances.
        </div>
      </section>

      {/* Section 6 */}
      <section id="data-protection" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">06</span>
          <h2 className="policy-section-title">Data Protection & Security Practices</h2>
        </div>
        <p className="policy-paragraph">
          We maintain rigorous technical and administrative safeguards to protect your personal information against unauthorized access, loss, or misuse:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Transport Layer Security (TLS/SSL):</strong> All traffic between your browser and https://elvany.lk is encrypted using current HTTPS/TLS protocols.
          </li>
          <li className="policy-list-item">
            <strong>Access Restrictions:</strong> Access to order telemetry and client contact information is restricted strictly to authorized fulfillment and support personnel on a need-to-know basis.
          </li>
          <li className="policy-list-item">
            <strong>Secure Database Storage:</strong> Client account passwords and authentication credentials are encrypted using industry-standard hashing algorithms.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="cookies" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">07</span>
          <h2 className="policy-section-title">Cookies & Website Analytics</h2>
        </div>
        <p className="policy-paragraph">
          ELVANY uses minimal, necessary cookies to ensure the website operates smoothly:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Essential Session Cookies:</strong> Enabling the shopping bag drawer to remember items as you browse different categories, maintaining authentication logins, and preserving security tokens.
          </li>
          <li className="policy-list-item">
            <strong>Performance Telemetry:</strong> Basic aggregated metrics (such as page load speeds, error logs, and responsive layout performance) to optimize site speed and reliability.
          </li>
          <li className="policy-list-item">
            <strong>No Third-Party Ad Trackers:</strong> We do not deploy invasive third-party ad networks that follow your activity across unrelated websites.
          </li>
        </ul>
      </section>

      {/* Section 8 */}
      <section id="user-rights" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">08</span>
          <h2 className="policy-section-title">Your Privacy Rights & Data Deletion</h2>
        </div>
        <p className="policy-paragraph">
          Under applicable Sri Lankan privacy standards and fair consumer practices, clients enjoy the following rights:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Right to Access:</strong> You may request a summary of the personal details and order records we hold regarding your account.
          </li>
          <li className="policy-list-item">
            <strong>Right to Rectification:</strong> You may request correction of any inaccurate or outdated contact information or shipping addresses.
          </li>
          <li className="policy-list-item">
            <strong>Right to Deletion (Right to be Forgotten):</strong> You may request the deletion of your account and associated personal data from our active client databases by emailing <a href="mailto:elvanywear@gmail.com" style={{ color: '#8f6f32', fontWeight: 600 }}>elvanywear@gmail.com</a>.
          </li>
        </ul>
        <p className="policy-paragraph" style={{ fontSize: '0.84rem', color: '#62646c' }}>
          * Please note that certain transaction records must be retained for mandatory accounting, tax audit, and statutory compliance under Sri Lankan commercial law.
        </p>
      </section>

      {/* Section 9 */}
      <section id="retention" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">09</span>
          <h2 className="policy-section-title">Data Retention</h2>
        </div>
        <p className="policy-paragraph">
          We retain your personal information only for as long as necessary to fulfill the purposes for which it was gathered: completing orders, handling returns and size exchanges, complying with Sri Lankan tax and financial record-keeping laws, and resolving any commercial disputes. Once retention is no longer required, data is securely anonymized or permanently deleted.
        </p>
      </section>

      {/* Section 10 */}
      <section id="updates" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">10</span>
          <h2 className="policy-section-title">Policy Updates & Notification</h2>
        </div>
        <p className="policy-paragraph">
          ELVANY may occasionally modify this Privacy Policy to reflect enhancements in technology, adjustments in courier protocols, or changes in Sri Lankan statutory regulations. Any revisions will be published immediately on this page with an updated "Last Updated" date. Continued use of <strong>https://elvany.lk</strong> signifies acceptance of any updated terms.
        </p>
      </section>
    </PolicyLayout>
  );
};