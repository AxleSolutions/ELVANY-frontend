import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { Scale, FileCheck, DollarSign, Truck, AlertTriangle, ShieldCheck, Gavel, RefreshCw } from 'lucide-react';

export const TermsAndConditionsPage = () => {
  const navLinks = [
    { id: 'agreement', label: '1. Agreement to Terms' },
    { id: 'products', label: '2. Products & Availability' },
    { id: 'pricing', label: '3. Pricing & Currency' },
    { id: 'orders', label: '4. Orders & Confirmation' },
    { id: 'payments', label: '5. PayHere & Payments' },
    { id: 'cancellations', label: '6. Cancellations' },
    { id: 'shipping', label: '7. Delivery & Shipping' },
    { id: 'returns-ref', label: '8. Returns & Exchanges' },
    { id: 'ip-ownership', label: '9. Intellectual Property' },
    { id: 'liability', label: '10. Limitation of Liability' },
    { id: 'governing-law', label: '11. Governing Law' },
    { id: 'modifications', label: '12. Modifications' }
  ];

  return (
    <PolicyLayout
      badge="LEGAL AGREEMENT & TERMS OF SERVICE"
      title="Terms & Conditions"
      subtitle="The contractual terms and consumer conditions governing all purchases, orders, and interactions on https://elvany.lk."
      lastUpdated="November 23, 2026"
      navLinks={navLinks}
      seoTitle="Terms & Conditions"
      seoDescription="Official Terms and Conditions for ELVANY clothing and fashion store in Sri Lanka. Order placement, 2-5 day delivery, PayHere payments, returns, and governing Sri Lankan law."
    >
      {/* Key Terms Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <Truck size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Courier Delivery</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>2–5 Business Days</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Island-wide express transit in Sri Lanka</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <DollarSign size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Currency</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>Sri Lankan Rupees</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Priced in LKR, inclusive of taxes</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <ShieldCheck size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Payment Methods</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>Card, Koko, QR & Bank</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>PayHere, Koko BNPL, HelaPOS LankaQR</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <Gavel size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Governing Law</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>Democratic Socialist Republic of Sri Lanka</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Preserving statutory consumer rights</div>
        </div>
      </div>

      {/* Section 1 */}
      <section id="agreement" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">01</span>
          <h2 className="policy-section-title">Agreement to Terms & Website Usage</h2>
        </div>
        <p className="policy-paragraph">
          Welcome to <strong>ELVANY</strong>. These Terms & Conditions constitute a legally binding agreement between you (the "Client", "Customer", or "User") and <strong>ELVANY</strong> ("we", "us", or "our"), governing your access to and use of our online platform located at <strong>https://elvany.lk</strong>, including all digital product catalogues, bespoke customizer tools, and checkout transactions.
        </p>
        <p className="policy-paragraph">
          By accessing the website, registering an account, or placing an order, you confirm that you have read, understood, and agreed to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not proceed with ordering.
        </p>
        <p className="policy-paragraph">
          <strong>Age Requirement:</strong> You must be at least 18 years of age or accessing the website with the consent and supervision of a parent or legal guardian to complete transactions.
        </p>
      </section>

      {/* Section 2 */}
      <section id="products" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">02</span>
          <h2 className="policy-section-title">Product Descriptions, Garment Specs & Availability</h2>
        </div>
        <p className="policy-paragraph">
          ELVANY produces premium everyday t-shirts, knitted apparel, and wardrobe essentials. We take meticulous care to ensure that all garment photographs, dimensions, colorways, fabric densities (GSM), and sizing telemetry displayed on <strong>https://elvany.lk</strong> are as accurate and true to life as possible.
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Color Representation:</strong> Due to variances in monitor settings, mobile OLED/LCD calibrations, and ambient lighting, actual physical fabric shades may exhibit minor variations compared to your display screen.
          </li>
          <li className="policy-list-item">
            <strong>Inventory Availability:</strong> All garments are offered subject to stock availability. In the rare scenario that an item sells out before inventory reconciliation completes, we will notify you promptly to offer an immediate size/color exchange, store credit, or a 100% full refund.
          </li>
          <li className="policy-list-item">
            <strong>Bespoke Custom Lab:</strong> Custom configurations created in our Bespoke Lab are made-to-order based on client placement choices. Clients are responsible for ensuring that uploaded logos, artwork, or text do not infringe third-party intellectual property rights.
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="pricing" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">03</span>
          <h2 className="policy-section-title">Product Pricing & Currency</h2>
        </div>
        <p className="policy-paragraph">
          All prices on <strong>https://elvany.lk</strong> are quoted, billed, and charged in <strong>Sri Lankan Rupees (LKR)</strong>.
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Tax Inclusivity:</strong> Prices listed for each garment are inclusive of all applicable domestic taxes in Sri Lanka.
          </li>
          <li className="policy-list-item">
            <strong>Delivery Charges:</strong> Standard delivery fees or complimentary courier thresholds (e.g. free delivery on orders over LKR 8,500) are explicitly displayed in the shopping bag and checkout summary before payment confirmation.
          </li>
          <li className="policy-list-item">
            <strong>Pricing Adjustments:</strong> ELVANY reserves the right to modify prices, discounts, or promotional campaigns at any time without prior notice. Confirmed orders for which an Order Passport has been generated will be fulfilled strictly at the confirmed checkout price.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="orders" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">04</span>
          <h2 className="policy-section-title">Order Placement & Confirmation</h2>
        </div>
        <p className="policy-paragraph">
          When you complete the checkout workflow on our website, you make an offer to purchase the specified garments:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Order Passport Issuance:</strong> Upon successful checkout submission, our system automatically generates a unique Order Passport ID (format: <code>ELV-XXXXX</code>, e.g. <code>ELV-98421</code>) and transmits a digital confirmation to your registered email and WhatsApp/SMS.
          </li>
          <li className="policy-list-item">
            <strong>Order Acceptance:</strong> Acceptance of your order and formation of the sales contract occurs when your parcel is verified and handed over to our courier logistics partner.
          </li>
          <li className="policy-list-item">
            <strong>Right to Decline:</strong> ELVANY reserves the right to reject, cancel, or restrict order quantities in situations involving suspected fraud, unauthorized credit card use, inaccurate delivery addresses, or typographical system pricing errors.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="payments" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">05</span>
          <h2 className="policy-section-title">Payment Methods & Processing Gateways</h2>
        </div>
        <p className="policy-paragraph">
          ELVANY provides four secure, cashless payment options for all orders placed on <strong>https://elvany.lk</strong>. Please note that <strong>we do not offer Cash on Delivery (COD)</strong>; all orders must be prepaid through one of our authorized payment channels:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Card Payments via PayHere:</strong> Online credit card and debit card transactions (Visa and MasterCard) are processed exclusively through <strong>PayHere</strong>, an authorized, regulated payment facilitator supervised by the Central Bank of Sri Lanka and certified under PCI-DSS Level 1 compliance. All card transactions are encrypted with 256-bit TLS/SSL technology and verified through 3D-Secure bank OTP. <strong>ELVANY never stores or handles your credit or debit card numbers, expiration dates, or CVV security codes.</strong>
          </li>
          <li className="policy-list-item">
            <strong>LankaQR Payments via HelaPOS:</strong> Dynamic and static national LankaQR transactions are powered and processed through <strong>HelaPOS</strong>, allowing fast, direct payments from any registered Sri Lankan banking or mobile wallet app.
          </li>
          <li className="policy-list-item">
            <strong>Koko Buy Now, Pay Later (BNPL):</strong> Clients can split purchases into 3 interest-free monthly instalments via Koko. Eligibility, instalment processing, and account authorizations are handled through Koko's secure payment gateway.
          </li>
          <li className="policy-list-item">
            <strong>Direct Bank Transfer / Deposit:</strong> Clients can transfer funds directly to our designated corporate bank account. Orders are processed for dispatch once the verified bank transfer slip or transaction screenshot is uploaded during checkout and verified.
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="cancellations" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">06</span>
          <h2 className="policy-section-title">Order Cancellations</h2>
        </div>
        <p className="policy-paragraph">
          Clients may request an order cancellation prior to the physical handover of the parcel to our courier logistics partner.
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Prior to Courier Dispatch:</strong> Contact our concierge immediately via WhatsApp at <a href="https://wa.me/94765293943" target="_blank" rel="noopener noreferrer" style={{ color: '#8f6f32', fontWeight: 600 }}>076 529 3943</a> or email <a href="mailto:elvanywear@gmail.com" style={{ color: '#8f6f32', fontWeight: 600 }}>elvanywear@gmail.com</a> with your Order ID. If the parcel has not left our dispatch facility, the order will be cancelled and any prepaid amount refunded in full.
          </li>
          <li className="policy-list-item">
            <strong>After Courier Dispatch:</strong> Once a package is in transit with the courier, cancellations can no longer be processed directly. You may instead initiate a return upon receipt under our 7-day Return & Refund Policy.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="shipping" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">07</span>
          <h2 className="policy-section-title">Delivery & Shipping Terms</h2>
        </div>
        <div className="policy-callout">
          <strong>Expected Delivery Timeline:</strong> All confirmed orders are delivered within <strong>2 to 5 business days</strong> across Sri Lanka.
        </div>
        <p className="policy-paragraph">
          Shipping details and conditions:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Dispatch Time:</strong> Orders are processed and dispatched from our facility within 24 to 48 hours following payment verification (excluding Sundays and statutory mercantile holidays).
          </li>
          <li className="policy-list-item">
            <strong>Courier Tracking:</strong> Once dispatched, a live tracking code is communicated to your email or SMS, allowing you to follow parcel progress in real time.
          </li>
          <li className="policy-list-item">
            <strong>Delivery Address Accuracy:</strong> Clients are responsible for providing complete and accurate recipient details, including reachable mobile telephone numbers. ELVANY is not liable for delivery failures resulting from incorrect addresses.
          </li>
          <li className="policy-list-item">
            <strong>Unforeseen Courier Delays:</strong> Delivery times are estimates. While 98% of orders arrive within 2–5 business days, occasional delays may occur due to extreme weather conditions, road closures, or public holidays. Our support team actively assists with any tracking queries.
          </li>
        </ul>
      </section>

      {/* Section 8 */}
      <section id="returns-ref" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">08</span>
          <h2 className="policy-section-title">Return, Refund, and Size Exchange Conditions</h2>
        </div>
        <p className="policy-paragraph">
          All returns, size exchanges, and refund requests are governed strictly by our official <strong>Return & Refund Policy</strong>:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            Returns or size exchanges must be requested within <strong>7 calendar days</strong> of receiving your parcel.
          </li>
          <li className="policy-list-item">
            Garments must be unworn, unwashed, unaltered, and accompanied by all original tags and packaging.
          </li>
          <li className="policy-list-item">
            <strong>Courier Fees on Exchanges:</strong> If you want to change an item or exchange sizes, you are responsible for paying the courier shipping fee to return the garment as well as the courier fee for ELVANY to send the exchange item.
          </li>
          <li className="policy-list-item">
            <strong>Courier Delivery Fees Non-Refundable:</strong> If a refund is requested, the courier delivery fee is strictly non-refundable; only the net garment cost is refunded.
          </li>
          <li className="policy-list-item">
            <strong>Damaged or Incorrect Deliveries:</strong> Only if an item arrives damaged, defective, or incorrectly dispatched by our atelier does ELVANY cover and handle 100% of all courier costs.
          </li>
        </ul>
        <p className="policy-paragraph">
          For full details and step-by-step instructions, please review our complete <a href="/return-policy" style={{ color: '#8f6f32', fontWeight: 600, textDecoration: 'underline' }}>Return & Refund Policy</a>.
        </p>
      </section>

      {/* Section 9 */}
      <section id="ip-ownership" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">09</span>
          <h2 className="policy-section-title">Intellectual Property & Brand Ownership</h2>
        </div>
        <p className="policy-paragraph">
          All intellectual property on <strong>https://elvany.lk</strong>—including trademarks, brand logos ("ELVANY"), graphic assets, bespoke lab software design, photographic garment imagery, typography, product descriptions, and software code—is the exclusive proprietary property of ELVANY.
        </p>
        <p className="policy-paragraph">
          You are granted a limited, revocable license to access and use the website for personal shopping purposes only. No content from this website may be copied, reproduced, republished, modified, downloaded, distributed, or commercially exploited without prior written authorization from ELVANY.
        </p>
      </section>

      {/* Section 10 */}
      <section id="liability" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">10</span>
          <h2 className="policy-section-title">Limitation of Liability & Consumer Rights</h2>
        </div>
        <p className="policy-paragraph">
          To the maximum extent permitted by applicable laws in Sri Lanka, ELVANY and its directors, employees, and agents shall not be liable for any indirect, incidental, special, punitive, or consequential damages resulting from website downtime, delays in courier delivery, or reliance on information presented on the site.
        </p>
        <div className="policy-callout" style={{ borderLeftColor: '#8f6f32' }}>
          <strong>Statutory Consumer Rights Protected:</strong> Nothing in these Terms & Conditions shall exclude, limit, or modify any mandatory statutory consumer rights, guarantees, or warranties provided under the <strong>Consumer Affairs Authority Act No. 9 of 2003</strong> or any other applicable consumer protection laws of Sri Lanka.
        </div>
      </section>

      {/* Section 11 */}
      <section id="governing-law" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">11</span>
          <h2 className="policy-section-title">Governing Law & Jurisdiction</h2>
        </div>
        <p className="policy-paragraph">
          These Terms & Conditions, along with all transactions and disputes arising out of or related to your use of <strong>https://elvany.lk</strong>, shall be governed by, interpreted, and construed in accordance with the <strong>laws of the Democratic Socialist Republic of Sri Lanka</strong>.
        </p>
        <p className="policy-paragraph">
          Any legal proceedings, disputes, or claims that cannot be resolved amicably through client support shall be submitted to the exclusive jurisdiction of the competent courts of Sri Lanka.
        </p>
      </section>

      {/* Section 12 */}
      <section id="modifications" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">12</span>
          <h2 className="policy-section-title">Modifications to Terms & Conditions</h2>
        </div>
        <p className="policy-paragraph">
          ELVANY reserves the right to revise or amend these Terms & Conditions at our discretion to accommodate new product offerings, payment updates, or legislative changes in Sri Lanka. Any revisions will be published directly on this page with a revised "Last Updated" timestamp. Continued browsing or purchases after updates are posted signifies your acceptance of the amended terms.
        </p>
      </section>
    </PolicyLayout>
  );
};