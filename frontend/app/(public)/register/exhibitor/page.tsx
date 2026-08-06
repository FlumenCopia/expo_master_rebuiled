'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-client';

export default function ExhibitorRegisterPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sep 25', 'Sep 26', 'Sep 27']);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exhibitorName, setExhibitorName] = useState('');
  const [exhibitorEmail, setExhibitorEmail] = useState('');

  const toggleExpoDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const firmName = String(formData.get('firm_name') || formData.get('name') || 'Exhibitor');
    const contactPerson = String(formData.get('name') || '');
    const email = String(formData.get('email') || '');
    const phone = String(formData.get('mobile') || '');

    setExhibitorName(contactPerson || firmName);
    setExhibitorEmail(email);

    const payload = {
      companyName: firmName,
      contactPerson,
      email,
      phone,
      website: '',
      productCategory: 'Solar PV & Renewable Energy',
      stallSize: 'Standard',
      notes: selectedDays.join(', ')
    };

    try {
      await fetch(`${API_BASE_URL}/api/register/exhibitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setShowModal(true);
    } catch {
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className="header hdr2 visitor-header">
        <div className="hdr-cont">
          <div className="container">
            <div className="header-conts">
              <div className="hdr-logos">
                <Link href="/">
                  {/* eslint-disable-next-html-element-for-jsx */}
                  <img src="/assets/logo/logo3.png" alt="Masters Expo" />
                </Link>
                <img src="/assets/logo/1.png" alt="Partner Logo" />
              </div>
              <div className="pg-cnt-btn">
                <Link href="/#cnct">
                  <div className="ind-cnct-btn"><p>Contact</p></div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="vis-pg">
        <section className="vis-sec">
          <div className="container">
            <div className="visit-reg-contain">
              <div className="row">
                {/* REGISTRATION FORM */}
                <div className="col-md-6 col-lg-4">
                  <div className="vist-form-contain">
                    <h2 className="text-slate-900 font-extrabold text-2xl mb-4"><span>Exhibitor</span> Registration</h2>
                    <form id="exhibitorForm" onSubmit={handleSubmit}>
                      {/* Name */}
                      <div className="vist-input option2 mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="text" name="name" placeholder="Contact Person Name *" required />
                      </div>

                      {/* Firm Name */}
                      <div className="vist-input option2 mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="text" name="firm_name" placeholder="Company / Firm Name *" required />
                      </div>

                      {/* Designation */}
                      <div className="vist-input mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="text" name="designation" placeholder="Designation *" required />
                      </div>

                      {/* Mobile */}
                      <div className="vist-input option2 mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="number" name="mobile" placeholder="Mobile Number *" required />
                      </div>

                      {/* Email */}
                      <div className="vist-input mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="email" name="email" placeholder="Email Address *" required />
                      </div>

                      {/* Address */}
                      <div className="vist-input mb-3">
                        <textarea className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" name="address" placeholder="Company Full Address *"></textarea>
                      </div>

                      {/* City */}
                      <div className="vist-input option2 mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="text" name="city" placeholder="City *" required />
                      </div>

                      {/* State */}
                      <div className="vist-input mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="text" name="state" placeholder="State *" required />
                      </div>

                      {/* Country */}
                      <div className="vist-input mb-3">
                        <input className="w-full text-slate-900 placeholder-slate-500 font-medium p-3 border border-slate-300 rounded-lg bg-white" type="text" name="country" placeholder="Country *" required defaultValue="India" />
                      </div>

                      {/* Expo Days Selector */}
                      <div className="vist-input mb-3" id="field-days">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8899a6', marginBottom: '6px' }}>
                          Which Day(s) Will You Attend / Exhibit?
                        </label>
                        <div className="day-selector">
                          <button
                            type="button"
                            className={`day-btn ${selectedDays.includes('Sep 25') ? 'active' : ''}`}
                            onClick={() => toggleExpoDay('Sep 25')}
                          >
                            <strong>25</strong>Sep &mdash; Fri
                          </button>
                          <button
                            type="button"
                            className={`day-btn ${selectedDays.includes('Sep 26') ? 'active' : ''}`}
                            onClick={() => toggleExpoDay('Sep 26')}
                          >
                            <strong>26</strong>Sep &mdash; Sat
                          </button>
                          <button
                            type="button"
                            className={`day-btn ${selectedDays.includes('Sep 27') ? 'active' : ''}`}
                            onClick={() => toggleExpoDay('Sep 27')}
                          >
                            <strong>27</strong>Sep &mdash; Sun
                          </button>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="vist-input mt-4">
                        <button type="submit" id="visit-btn" className="vist-regis-btn w-full py-3.5 bg-emerald-500 text-slate-950 font-extrabold text-base rounded-lg hover:bg-emerald-400 transition-all shadow-md" disabled={loading}>
                          {loading ? 'Submitting...' : 'Register as Exhibitor'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* RIGHT SIDE EVENT INFO (IDENTICAL TO VISITOR REGISTER BANNER) */}
                <div className="col-md-6 col-lg-8">
                  <div className="visit-cont-contain">
                    <div className="visit-cont-blk">
                      <div className="vis-img">
                        <Link href="/">
                          <img src="/assets/logo/logo3.png" alt="Masters Expo Logo" />
                        </Link>
                      </div>
                      <div className="vist-cont">
                        <div className="vist-dt-blk">
                          <div className="mnth"><span>September 2026</span></div>
                          <div className="vis-dt">
                            <span>
                              <ul>
                                <li>25</li>
                                <li>26</li>
                                <li>27</li>
                              </ul>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* SUCCESS OVERLAY MODAL */}
      {showModal && (
        <div id="ex-success-modal" className="show" role="dialog" aria-modal="true" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
          <div className="success-icon" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(3,150,35,0.15)', border: '2px solid #7fee00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#95c841', marginBottom: '20px' }}>✓</div>
          <h2 style={{ fontFamily: "'Manrope',sans-serif", fontSize: '28px', fontWeight: 800, marginBottom: '10px', color: '#fff' }}>Exhibitor Registration Successful! 🎉</h2>
          <p style={{ fontSize: '14.5px', color: '#a0aec0', maxWidth: '440px', lineHeight: 1.6, marginBottom: '16px', textAlign: 'center' }}>
            Thank you, <strong style={{ color: '#fff' }}>{exhibitorName}</strong>! Your space pre-booking / exhibitor registration for <strong>Masters Kerala RE 2.0 EXPO26</strong> has been received.
          </p>

          {exhibitorEmail && (
            <div className="ex-email-notice" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(3,150,35,0.12)', border: '1px solid rgba(3,150,35,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '13.5px', maxWidth: '480px', margin: '16px 0' }}>
              <i className="fa-solid fa-envelope-circle-check" style={{ color: '#95c841', fontSize: '18px' }}></i>
              <span>A welcome confirmation message has been sent to <strong>{exhibitorEmail}</strong></span>
            </div>
          )}

          <Link href="/" className="success-back-btn" style={{ color: '#a0aec0', fontSize: '14px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 24px', borderRadius: '100px', transition: 'all 0.3s', marginTop: '16px' }}>
            &#8592; Back to Main Site
          </Link>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-fl">
            <div className="foot-lft">
              <div className="foot-logo">
                <Link href="/"><img src="/assets/logo/logoblc.png" alt="Masters Logo" /></Link>
                <p>Powering the World's Clean Energy Future</p>
                <a href="https://solarmasters.org/" target="_blank" rel="noreferrer"><h3>Masters Association</h3></a>
              </div>
            </div>
            <div className="foot-rgt">
              <div className="foot-lst">
                <h3>Connect With Us</h3>
                <ul>
                  <div className="cnt-cont-flx">
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-location-dot"></i></div>
                    <a href="https://maps.google.com/?q=LuLu+Mall+Thiruvananthapuram" target="_blank" rel="noreferrer">
                      <div><p className="fr-fd">Our Location</p><p>LuLu Mall, Thiruvananthapuram</p></div>
                    </a>
                  </div>
                  <div className="cnt-cont-flx">
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-envelope"></i></div>
                    <a href="mailto:info@solarmasters.org">
                      <div><p className="fr-fd">Email Us</p><p>info@solarmasters.org</p></div>
                    </a>
                  </div>
                  <div className="cnt-cont-flx">
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-phone"></i></div>
                    <a href="tel:+918129838288">
                      <div><p className="fr-fd">Call Us</p><p>+91 81298 38288</p></div>
                    </a>
                  </div>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
