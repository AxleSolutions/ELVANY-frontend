import React from 'react';
import { PolicyLayout } from './PolicyLayout';
import { RefreshCw, ShieldCheck, Truck, Package, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ReturnPolicyPage = () => {
  const navLinks = [
    { id: 'overview', label: '1. Overview' },
    { id: 'eligibility', label: '2. Return Eligibility' },
    { id: 'exchanges', label: '3. Size Exchanges' },
    { id: 'damaged', label: '4. Damaged & Defective' },
    { id: 'refunds', label: '5. Refund Process' },
    { id: 'shipping-costs', label: '6. Shipping Costs' },
    { id: 'non-returnable', label: '7. Non-Returnable Items' },
    { id: 'how-to-return', label: '8. How to Return' }
  ];

  return (
    <PolicyLayout
      badge="CUSTOMER PROTECTION & SATISFACTION"
      title="Return & Refund Policy"
      subtitle="Comprehensive guidelines on returns, refunds, size exchanges, and consumer rights for orders placed on https://elvany.lk."
      lastUpdated="November 23, 2026"
      navLinks={navLinks}
      seoTitle="Return & Refund Policy"
      seoDescription="Official Return and Refund Policy for ELVANY clothing and fashion store in Sri Lanka. 7-day returns, size exchanges, refund timelines, and consumer rights."
    >
      {/* Quick Summary Highlights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <Clock size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Return Window</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>7 Days from Delivery</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Applicable to returns & exchanges</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <RefreshCw size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Size Exchanges</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>7-Day Request Window</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Customer pays courier fee for changes</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <ShieldCheck size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Damaged Items</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>100% Covered by ELVANY</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Courier covered only if damaged/defective</div>
        </div>

        <div style={{ background: '#faf8f5', border: '1px solid #e8e3da', padding: '1.2rem', borderRadius: '4px' }}>
          <Package size={20} color="#8f6f32" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.74rem', color: '#767982', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Refund Scope</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#121316', marginTop: '2px' }}>Garment Value Only</div>
          <div style={{ fontSize: '0.78rem', color: '#62646c', marginTop: '4px' }}>Courier fees are strictly non-refundable</div>
        </div>
      </div>

      {/* Section 1 */}
      <section id="overview" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">01</span>
          <h2 className="policy-section-title">Overview & Scope</h2>
        </div>
        <p className="policy-paragraph">
          At <strong>ELVANY</strong> (operating online at <strong>https://elvany.lk</strong> in Sri Lanka), we take immense pride in the craftsmanship, silhouette structure, and durable fabric quality of every garment we create. We want you to be entirely satisfied with your purchase.
        </p>
        <p className="policy-paragraph">
          This Return & Refund Policy sets out the terms under which items purchased on our website can be returned, exchanged, or refunded. This policy is formulated in full accordance with Sri Lankan consumer protection standards and requirements set forth by our authorized payment gateway, PayHere.
        </p>
      </section>

      {/* Section 2 */}
      <section id="eligibility" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">02</span>
          <h2 className="policy-section-title">Return Eligibility & Timeframe</h2>
        </div>
        <p className="policy-paragraph">
          Customers are entitled to request a return or size exchange within <strong>7 calendar days</strong> from the official delivery date recorded by our courier partner.
        </p>
        <p className="policy-paragraph">
          To qualify for a return or exchange, the garment must satisfy all of the following condition requirements upon physical inspection:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Unused, Unworn, and Unwashed:</strong> The garment must show zero signs of wear, usage, washing, fabric stretching, or personal scent (including perfumes, deodorants, or body lotions).
          </li>
          <li className="policy-list-item">
            <strong>Original Condition with Tags Attached:</strong> All original ELVANY garment swing tags, security labels, and QR provenance codes must remain intact and attached in their original positions.
          </li>
          <li className="policy-list-item">
            <strong>Original Packaging:</strong> The item must be returned in its original protective sleeve, box, or bag along with any documentation provided.
          </li>
          <li className="policy-list-item">
            <strong>Proof of Purchase:</strong> You must provide your official Order ID (format: <code>ELV-XXXXX</code>, e.g. <code>ELV-98421</code>) or electronic invoice issued at checkout.
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="exchanges" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">03</span>
          <h2 className="policy-section-title">Size Exchange Procedures</h2>
        </div>
        <p className="policy-paragraph">
          We understand that achieving the ideal fit is essential. We gladly accommodate size exchanges within the 7-day window subject to the following terms:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Inventory Availability:</strong> Exchanges are subject to active warehouse stock. If your required size is in stock, we will reserve it upon receiving your return confirmation.
          </li>
          <li className="policy-list-item">
            <strong>Courier Charges for Exchanges:</strong> The customer is responsible for all courier fees associated with size exchanges. This includes the courier cost to send the original garment back to our facility, as well as the standard courier delivery fee for ELVANY to dispatch the replacement exchange item.
          </li>
          <li className="policy-list-item">
            <strong>Out-of-Stock Sizing:</strong> If the requested replacement size is unavailable or out of stock, you may choose an alternative garment of equal value, store credit, or a refund for the garment purchase price.
          </li>
          <li className="policy-list-item">
            <strong>Processing Timeline:</strong> Replacement items are dispatched within 2–3 business days after the returned garment has been received, inspected, approved, and the exchange courier fee settled.
          </li>
        </ul>
      </section>

      {/* Section 4 */}
      <section id="damaged" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">04</span>
          <h2 className="policy-section-title">Damaged, Defective, or Incorrect Deliveries</h2>
        </div>
        <p className="policy-paragraph">
          Every ELVANY garment undergoes rigorous quality inspection prior to dispatch. However, if your order arrives damaged during transit, defective in fabric/stitching, or contains an incorrect item/size:
        </p>
        <div className="policy-callout">
          <strong>Damaged Deliveries Handled by ELVANY:</strong> Only in cases of damaged, defective, or incorrectly delivered products does ELVANY cover and handle 100% of all courier expenses, providing an immediate complimentary replacement, exchange, or full refund at zero additional cost to you.
        </div>
        <p className="policy-paragraph">
          <strong>Procedure for Reporting Defects:</strong>
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            Notify our support team within <strong>48 to 72 hours</strong> of receiving the parcel via email at <a href="mailto:elvanywear@gmail.com" style={{ color: '#8f6f32', fontWeight: 600 }}>elvanywear@gmail.com</a> or WhatsApp at <a href="https://wa.me/94765293943" target="_blank" rel="noopener noreferrer" style={{ color: '#8f6f32', fontWeight: 600 }}>076 529 3943</a>.
          </li>
          <li className="policy-list-item">
            Provide your <strong>Order ID (e.g. ELV-XXXXX)</strong> along with clear, focused photographs showing the damaged or incorrect area and the attached garment tags.
          </li>
          <li className="policy-list-item">
            Once verified, ELVANY will arrange a courier pickup or instruct you on return dispatch. <strong>ELVANY covers all return shipping fees</strong> for defective or incorrect orders.
          </li>
        </ul>
      </section>

      {/* Section 5 */}
      <section id="refunds" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">05</span>
          <h2 className="policy-section-title">Refund Method & Processing Timelines</h2>
        </div>
        <p className="policy-paragraph">
          Refunds are issued strictly after returned garments have arrived at our inspection facility and passed physical verification:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Payment Reversal via Original Method:</strong> Wherever possible, refunds are credited back to the <strong>original payment method</strong> used during checkout:
            <ul style={{ margin: '6px 0 0 1.2rem', padding: 0, listStyle: 'disc' }}>
              <li><strong>Card Orders (PayHere):</strong> Reversal instruction transmitted to PayHere immediately upon inspection approval.</li>
              <li><strong>Koko (BNPL Instalments):</strong> Reversal processed through Koko in accordance with their installment refund schedule.</li>
              <li><strong>Direct Bank Transfer / LankaQR:</strong> Refund remitted directly to the customer’s verified Sri Lankan bank account via secure SLIPS/CEFT transfer.</li>
            </ul>
          </li>
          <li className="policy-list-item">
            <strong>Courier Fees Are Strictly Non-Refundable:</strong> If a customer requests a refund, <strong>we do not refund the courier delivery fee</strong>. Only the net garment purchase price is refunded. The courier fee is only refunded if the garment arrived damaged, defective, or was incorrectly delivered by ELVANY.
          </li>
          <li className="policy-list-item">
            <strong>Bank Processing Timeframes:</strong> While ELVANY issues refunds within <strong>2 to 4 business days</strong> of inspection approval, the time required for funds to appear on your bank statement depends on your card issuer or banking institution (typically 3–7 business days).
          </li>
        </ul>
      </section>

      {/* Section 6 */}
      <section id="shipping-costs" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">06</span>
          <h2 className="policy-section-title">Courier Fees & Shipping Responsibility</h2>
        </div>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Exchanges & Change of Mind:</strong> The customer must pay the courier shipping fees. If you want to change an item or exchange sizes, you must cover the courier fee to return the garment to us, as well as the courier fee for us to dispatch the replacement item to you.
          </li>
          <li className="policy-list-item">
            <strong>Damaged or Defective Items (Covered by ELVANY):</strong> Only if the garment is physically damaged, defective, or incorrectly dispatched by our atelier does ELVANY cover and handle all courier costs.
          </li>
          <li className="policy-list-item">
            <strong>Refunds:</strong> If a refund is requested, the courier delivery fee is non-refundable; only the garment price is refunded.
          </li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="non-returnable" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-num policy-section-num">07</span>
          <h2 className="policy-section-title">Non-Returnable & Final Sale Items</h2>
        </div>
        <p className="policy-paragraph">
          The following items cannot be accepted for return, exchange, or refund:
        </p>
        <ul className="policy-list">
          <li className="policy-list-item">
            <strong>Custom Bespoke Lab Garments:</strong> Products customized with personalized graphics, names, or bespoke printing tailored to an individual customer specification, unless there is a physical manufacturing fault or defect.
          </li>
          <li className="policy-list-item">
            <strong>Garments with Removed Security Tags:</strong> Items where the original brand tags, neck tags, or security seals have been cut, altered, or removed.
          </li>
          <li className="policy-list-item">
            <strong>Worn or Damaged by Misuse:</strong> Garments showing stains, fabric snags, tears, iron scorching, perfume odors, or domestic washing damage.
          </li>
          <li className="policy-list-item">
            <strong>Promotional Gifts & Vouchers:</strong> Free promotional gifts, vouchers, or digital cards.
          </li>
        </ul>
      </section>

      {/* Section 8 */}
      <section id="how-to-return" className="policy-section">
        <div className="policy-section-header">
          <span className="policy-section-num">08</span>
          <h2 className="policy-section-title">Step-by-Step Return Instructions</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#8f6f32', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>1</span>
            <div>
              <strong style={{ color: '#121316', fontSize: '0.92rem' }}>Contact Customer Care</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#4a4c54', lineHeight: 1.5 }}>
                Email <a href="mailto:elvanywear@gmail.com" style={{ color: '#8f6f32' }}>elvanywear@gmail.com</a> or WhatsApp <a href="https://wa.me/94765293943" target="_blank" rel="noopener noreferrer" style={{ color: '#8f6f32' }}>076 529 3943</a> with your Order ID, contact phone number, and reason for return or size exchange.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#8f6f32', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>2</span>
            <div>
              <strong style={{ color: '#121316', fontSize: '0.92rem' }}>Receive Return Authorization</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#4a4c54', lineHeight: 1.5 }}>
                Our team will verify your request within 24 hours and issue a Return Authorization along with the delivery address of our central inspection hub.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#8f6f32', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>3</span>
            <div>
              <strong style={{ color: '#121316', fontSize: '0.92rem' }}>Secure Packaging & Courier Dispatch</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#4a4c54', lineHeight: 1.5 }}>
                Pack the unused garment in its original protective packaging. Dispatch the package via your preferred tracked courier service (or hand over to our arranged courier).
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: '#8f6f32', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.82rem', fontWeight: 700, flexShrink: 0 }}>4</span>
            <div>
              <strong style={{ color: '#121316', fontSize: '0.92rem' }}>Inspection & Resolution</strong>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.86rem', color: '#4a4c54', lineHeight: 1.5 }}>
                Upon delivery, we inspect the item within 48 hours and promptly notify you via email/SMS when your exchange parcel is dispatched or refund is executed.
              </p>
            </div>
          </div>
        </div>
      </section>
    </PolicyLayout>
  );
};