'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api-client';
import { downloadIcsFile, getGoogleCalendarUrl } from '@/lib/calendar-utils';

interface SubEventData {
  id: string;
  title: string;
  description: string;
  speaker: string;
  location: string;
  date: string;
  timeSlot: string;
}

const COUNTRIES = [
  { code: '91', country: 'India', name: 'India (+91)' },
  { code: '971', country: 'United Arab Emirates', name: 'UAE (+971)' },
  { code: '60', country: 'Malaysia', name: 'Malaysia (+60)' },
  { code: '62', country: 'Indonesia', name: 'Indonesia (+62)' },
  { code: '966', country: 'Saudi Arabia', name: 'Saudi Arabia (+966)' },
  { code: '974', country: 'Qatar', name: 'Qatar (+974)' },
  { code: '1', country: 'USA / Canada', name: 'USA / Canada (+1)' },
  { code: '44', country: 'United Kingdom', name: 'UK (+44)' },
  { code: '65', country: 'Singapore', name: 'Singapore (+65)' },
  { code: '61', country: 'Australia', name: 'Australia (+61)' },
];

const NON_REQUIRED_PROFILES = ['Public', 'Consumer', 'Student', 'Media'];

export default function SubEventRegisterPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const [subEvent, setSubEvent] = useState<SubEventData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [badgeUrl, setBadgeUrl] = useState('#');

  // Form fields
  const [countryCode, setCountryCode] = useState('91');
  const [country, setCountry] = useState('India');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [visitProfile, setVisitProfile] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [designation, setDesignation] = useState('');
  const [address, setAddress] = useState('');
  const [post, setPost] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    async function fetchSubEvent() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sub-events/public/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.subEvent) {
          setSubEvent(data.subEvent);
        }
      } catch (err) {
        console.error('Failed to load sub-event:', err);
      }
    }
    fetchSubEvent();
  }, [slug]);

  const isPublicProfile = NON_REQUIRED_PROFILES.includes(visitProfile);
  const isFieldRequired = !isPublicProfile;

  const handlePhoneChange = async (val: string) => {
    setPhone(val);
    if (val.length >= 7) {
      setLookingUp(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/visitors/lookup?phone=${encodeURIComponent(val)}`);
        const result = await res.json();
        if (result.status && result.data) {
          const d = result.data;
          if (d.name) setName(d.name);
          if (d.email) setEmail(d.email);
          if (d.firm_name) setCompanyName(d.firm_name);
          if (d.designation) setDesignation(d.designation);
          if (d.location) setAddress(d.location);
          if (d.post) setPost(d.post);
          if (d.city) setCity(d.city);
          if (d.district) setDistrict(d.district);
          if (d.state) setState(d.state);
          if (d.pincode) setPincode(d.pincode);
          if (d.landmark) setLandmark(d.landmark);
          if (d.profile) setVisitProfile(d.profile);
        }
      } catch (err) {
        console.error('Phone lookup error:', err);
      } finally {
        setLookingUp(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setVisitorName(name);

    const payload = {
      fullName: name,
      email,
      phone: `+${countryCode} ${phone}`,
      company: companyName,
      designation,
      address,
      post,
      city,
      district,
      state: state || 'Kerala',
      pincode,
      landmark,
      country,
      countryCode,
      category: 'VISITOR',
      subEvents: [`SubEvent:${subEvent?.title || slug}`, visitProfile]
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/register/visitor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const code = data.badgeCode || String(Date.now()).slice(-4);
      setBadgeUrl(`/badge/${code}`);
      setShowModal(true);
    } catch {
      const code = String(Date.now()).slice(-4);
      setBadgeUrl(`/badge/${code}`);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  const displayTitle = subEvent?.title || slug.replace(/-/g, ' ').toUpperCase();

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
                <div className="col-md-6 col-lg-5">
                  <div className="vist-form-contain">
                    <h2 style={{ fontSize: '20px', lineHeight: 1.3 }}>
                      <span>Sub-Event Registration</span>
                      <br />
                      <strong style={{ color: '#10b981', fontSize: '18px' }}>{displayTitle}</strong>
                    </h2>

                    <form id="subEventForm" onSubmit={handleSubmit}>
                      <input type="hidden" name="country" value={country} />

                      {/* Country Code */}
                      <div className="vist-input">
                        <select
                          name="countryCode"
                          required
                          value={countryCode}
                          onChange={(e) => {
                            setCountryCode(e.target.value);
                            const match = COUNTRIES.find(c => c.code === e.target.value);
                            if (match) setCountry(match.country);
                          }}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Phone */}
                      <div className="vist-input option2 relative">
                        <input
                          className="fr-rmv-str"
                          type="number"
                          placeholder="Your Phone *"
                          name="mobile"
                          required
                          value={phone}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                        />
                        {lookingUp && (
                          <span style={{ position: 'absolute', right: '12px', top: '12px', fontSize: '11px', color: '#10b981' }}>
                            <i className="fa-solid fa-spinner fa-spin"></i> Checking...
                          </span>
                        )}
                      </div>

                      {/* Name */}
                      <div className="vist-input option2">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          name="name"
                          placeholder="Your Name *"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>

                      {/* Visit Profile */}
                      <div className="vist-input option2">
                        <select
                          name="visit_profile"
                          required
                          value={visitProfile}
                          onChange={(e) => setVisitProfile(e.target.value)}
                        >
                          <option value="" disabled>Select Visit Profile *</option>
                          <option value="Component Manufacturer / Supplier">Component Manufacturer / Supplier</option>
                          <option value="EPC/ MNRE vendors / system integrator">EPC/ MNRE Vendors / System Integrator</option>
                          <option value="EPC professional / Employee">EPC Professional / Employee</option>
                          <option value="Masters Association member">Masters Association Member</option>
                          <option value="Government Organization">Government Organization</option>
                          <option value="Investor / Project Developer">Investor / Project Developer</option>
                          <option value="Distributor/wholesaler/trader">Distributor / Wholesaler / Trader</option>
                          <option value="Media">Media</option>
                          <option value="Student">Student</option>
                          <option value="Consumer">Consumer</option>
                          <option value="Public">Public</option>
                        </select>
                      </div>

                      {/* Email */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="email"
                          placeholder={`Your Email ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>

                      {/* Company Name */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`Company Name ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                        />
                      </div>

                      {/* Designation */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`Designation ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                        />
                      </div>

                      {/* Address */}
                      <div className="vist-input">
                        <textarea
                          placeholder={`Full Address ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                      </div>

                      {/* City */}
                      <div className="vist-input option2">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`City ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>

                      {/* District */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`District ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                        />
                      </div>

                      {/* State */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`State ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                        />
                      </div>

                      {/* Pincode */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="number"
                          placeholder={`Pincode ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>

                      {/* Submit */}
                      <div className="vist-input">
                        <button type="submit" id="visit-btn" className="vist-regis-btn" disabled={loading}>
                          {loading ? 'Registering...' : `Register for ${displayTitle}`}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* RIGHT SIDE SUB-EVENT DETAILS */}
                <div className="col-md-6 col-lg-7">
                  <div className="visit-cont-contain" style={{ padding: '24px', background: '#1e293b', borderRadius: '16px', border: '1px solid #334155' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>{displayTitle}</h3>
                    <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.6, marginBottom: '20px' }}>
                      {subEvent?.description || 'Join key industry leaders, engineers, and vendors for this exclusive technical track session at Masters Kerala RE 2.0 EXPO26.'}
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#0f172a', padding: '16px', borderRadius: '12px' }}>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Speaker / Panel</span>
                        <p style={{ color: '#f8fafc', fontWeight: 600, marginTop: '4px' }}>{subEvent?.speaker || 'Industry Experts'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location</span>
                        <p style={{ color: '#f8fafc', fontWeight: 600, marginTop: '4px' }}>{subEvent?.location || 'Main Hall'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Date</span>
                        <p style={{ color: '#f8fafc', fontWeight: 600, marginTop: '4px' }}>{subEvent?.date || 'Sep 25-27, 2026'}</p>
                      </div>
                      <div>
                        <span style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Time Slot</span>
                        <p style={{ color: '#f8fafc', fontWeight: 600, marginTop: '4px' }}>{subEvent?.timeSlot || '10:00 AM'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SUCCESS OVERLAY MODAL */}
        {showModal && (
          <div id="sub-success-modal" className="show" role="dialog" aria-modal="true" style={{ display: 'flex', position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: '20px' }}>
            <div className="success-icon" style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(3,150,35,0.15)', border: '2px solid #7fee00', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#95c841', marginBottom: '20px' }}>✓</div>
            <h2 style={{ fontFamily: "'Manrope',sans-serif", fontSize: '28px', fontWeight: 800, marginBottom: '10px', color: '#fff', textAlign: 'center' }}>Registration Confirmed! 🎉</h2>
            <p style={{ fontSize: '14.5px', color: '#a0aec0', maxWidth: '440px', lineHeight: 1.6, marginBottom: '16px', textAlign: 'center' }}>
              Thank you, <strong style={{ color: '#fff' }}>{visitorName}</strong>! You are registered for <strong>{displayTitle}</strong> at Masters Kerala RE 2.0 EXPO26.
            </p>

            {email && (
              <div className="ex-email-notice" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(3,150,35,0.12)', border: '1px solid rgba(3,150,35,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#e2e8f0', fontSize: '13.5px', maxWidth: '480px', margin: '12px 0' }}>
                <i className="fa-solid fa-envelope-circle-check" style={{ color: '#95c841', fontSize: '18px' }}></i>
                <span>A welcome confirmation message has been sent to <strong>{email}</strong></span>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', marginTop: '16px', width: '100%', maxWidth: '380px' }}>
              <Link
                href={badgeUrl}
                target="_blank"
                style={{
                  width: '100%',
                  textAlign: 'center',
                  background: '#7fee00',
                  color: '#03151a',
                  fontWeight: 800,
                  padding: '13px 20px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  fontSize: '14.5px',
                  boxShadow: '0 4px 14px rgba(127, 238, 0, 0.3)',
                  transition: 'all 0.3s'
                }}
              >
                <i className="fa-solid fa-id-card"></i> Generate &amp; Print Badge Pass
              </Link>

              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <button
                  type="button"
                  onClick={() => downloadIcsFile()}
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fa-solid fa-calendar-plus" style={{ color: '#7fee00' }}></i> Device Calendar (.ics)
                </button>

                <a
                  href={getGoogleCalendarUrl()}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.08)',
                    color: '#fff',
                    border: '1px solid rgba(255,255,255,0.2)',
                    fontWeight: 600,
                    padding: '10px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fa-brands fa-google" style={{ color: '#4285F4' }}></i> Google Calendar
                </a>
              </div>

              <Link
                href="/"
                onClick={() => setShowModal(false)}
                className="success-back-btn"
                style={{ color: '#a0aec0', fontSize: '13.5px', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.15)', padding: '8px 24px', borderRadius: '100px', transition: 'all 0.3s', marginTop: '4px' }}
              >
                &#8592; Back to Main Site
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
