'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const COUNTRIES = [
  { code: '91', country: 'India', name: 'India (+91)' },
  { code: '971', country: 'United Arab Emirates', name: 'UAE (+971)' },
  { code: '60', country: 'Malaysia', name: 'Malaysia (+60)' },
  { code: '62', country: 'Indonesia', name: 'Indonesia (+62)' },
  { code: '966', country: 'Saudi Arabia', name: 'Saudi Arabia (+966)' },
  { code: '974', country: 'Qatar', name: 'Qatar (+974)' },
  { code: '968', country: 'Oman', name: 'Oman (+968)' },
  { code: '965', country: 'Kuwait', name: 'Kuwait (+965)' },
  { code: '1', country: 'USA / Canada', name: 'USA / Canada (+1)' },
  { code: '44', country: 'United Kingdom', name: 'UK (+44)' },
  { code: '65', country: 'Singapore', name: 'Singapore (+65)' },
  { code: '61', country: 'Australia', name: 'Australia (+61)' },
  { code: '49', country: 'Germany', name: 'Germany (+49)' },
  { code: '33', country: 'France', name: 'France (+33)' },
  { code: '81', country: 'Japan', name: 'Japan (+81)' },
  { code: '86', country: 'China', name: 'China (+86)' },
  { code: '82', country: 'South Korea', name: 'South Korea (+82)' },
  { code: '94', country: 'Sri Lanka', name: 'Sri Lanka (+94)' },
  { code: '880', country: 'Bangladesh', name: 'Bangladesh (+880)' },
  { code: '977', country: 'Nepal', name: 'Nepal (+977)' },
  { code: '66', country: 'Thailand', name: 'Thailand (+66)' },
  { code: '63', country: 'Philippines', name: 'Philippines (+63)' },
  { code: '27', country: 'South Africa', name: 'South Africa (+27)' },
];

const NON_REQUIRED_PROFILES = ['Public', 'Consumer', 'Student', 'Media'];

export default function VisitorRegisterPage() {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Sep 25', 'Sep 26', 'Sep 27']);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [badgeUrl, setBadgeUrl] = useState('#');

  // Form State
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
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [lookingUp, setLookingUp] = useState(false);

  // Initialize Meta Pixel
  useEffect(() => {
    if (typeof window !== 'undefined') {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const w = window as any;
      if (!w.fbq) {
        w.fbq = function (...args: any[]) {
          if (w.fbq.callMethod) {
            w.fbq.callMethod(...args);
          } else {
            w.fbq.queue.push(args);
          }
        };
        w.fbq.queue = [];
        w.fbq.loaded = true;
        w.fbq.version = '2.0';
      }
      w.fbq('init', '1144503091041332');
      w.fbq('track', 'PageView');
    }
  }, []);

  const isPublicProfile = NON_REQUIRED_PROFILES.includes(visitProfile);
  const isFieldRequired = !isPublicProfile;

  const handleCountryCodeChange = (codeVal: string) => {
    setCountryCode(codeVal);
    const matched = COUNTRIES.find(c => c.code === codeVal);
    if (matched) {
      setCountry(matched.country);
    }
  };

  const toggleExpoDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Live Phone Lookup (`/api/visitors/lookup`)
  const handlePhoneChange = async (val: string) => {
    setPhone(val);
    if (val.length >= 7) {
      setLookingUp(true);
      try {
        const res = await fetch(`http://localhost:5000/api/visitors/lookup?phone=${encodeURIComponent(val)}`);
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
          if (d.mobile_code) handleCountryCodeChange(d.mobile_code);
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
    setVisitorEmail(email);

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
      subEvents: [selectedDays.join(', '), visitProfile]
    };

    try {
      const res = await fetch('http://localhost:5000/api/register/visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const code = data.badgeCode || String(Date.now()).slice(-4);
      setBadgeUrl(`/badge/${code}`);
      setShowModal(true);

      // Track conversion
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'CompleteRegistration');
      }
    } catch {
      const code = String(Date.now()).slice(-4);
      setBadgeUrl(`/badge/${code}`);
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
                    <h2><span>Register</span> Now</h2>
                    <form id="visitorRegisterForm" onSubmit={handleSubmit}>
                      <input type="hidden" name="country" id="country" value={country} />

                      {/* Country Code */}
                      <div className="vist-input">
                        <select
                          name="countryCode"
                          id="code"
                          required
                          value={countryCode}
                          onChange={(e) => handleCountryCodeChange(e.target.value)}
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Mobile Number with Auto-Lookup */}
                      <div className="vist-input option2 relative">
                        <input
                          className="fr-rmv-str"
                          type="number"
                          placeholder="Your Phone *"
                          name="mobile"
                          id="mobile"
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
                          name="email"
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
                          placeholder={`Enter Company Name ${isFieldRequired ? '*' : ''}`}
                          name="company_name"
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
                          placeholder={`Enter Your Designation ${isFieldRequired ? '*' : ''}`}
                          name="designation"
                          required={isFieldRequired}
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                        />
                      </div>

                      {/* Address */}
                      <div className="vist-input">
                        <textarea
                          name="address"
                          placeholder={`Enter Address ${isFieldRequired ? '*' : ''}`}
                          required={isFieldRequired}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                      </div>

                      {/* Post */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`Post ${isFieldRequired ? '*' : ''}`}
                          name="post"
                          required={isFieldRequired}
                          value={post}
                          onChange={(e) => setPost(e.target.value)}
                        />
                      </div>

                      {/* City */}
                      <div className="vist-input option2">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder={`City ${isFieldRequired ? '*' : ''}`}
                          name="city"
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
                          placeholder={`District/Region ${isFieldRequired ? '*' : ''}`}
                          name="district"
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
                          placeholder={`State/Province ${isFieldRequired ? '*' : ''}`}
                          name="state"
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
                          placeholder={`Pincode/Zipcode ${isFieldRequired ? '*' : ''}`}
                          name="pincode"
                          required={isFieldRequired}
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                        />
                      </div>

                      {/* Landmark */}
                      <div className="vist-input">
                        <input
                          className="fr-rmv-str"
                          type="text"
                          placeholder="Enter Landmark"
                          name="landmark"
                          value={landmark}
                          onChange={(e) => setLandmark(e.target.value)}
                        />
                      </div>

                      {/* Expo Days Selector */}
                      <div className="vist-input" id="field-days">
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, letterSpacing: '0.8px', textTransform: 'uppercase', color: '#8899a6', marginBottom: '6px' }}>
                          Which Day(s) Will You Attend?
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

                      {/* Agree Checkbox */}
                      <div className="vist-input">
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                          <input
                            type="checkbox"
                            id="receiveupdate"
                            name="receiveupdate"
                            checked={receiveUpdates}
                            onChange={(e) => setReceiveUpdates(e.target.checked)}
                          />
                          <label htmlFor="receiveupdate" className="chck-lab">
                            <p style={{ fontSize: '14px' }}>I agree to receive all updates through SMS and Email</p>
                          </label>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <div className="vist-input">
                        <button
                          type="submit"
                          id="visit-btn"
                          className="vist-regis-btn"
                          disabled={loading || !receiveUpdates}
                        >
                          {loading ? 'Submitting...' : 'Register'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* RIGHT SIDE EVENT INFO */}
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

        {/* SUCCESS MODAL */}
        {showModal && (
          <div className="badge-modal-contain">
            <div className="bdg-overlay show"></div>
            <div className="bdg-modal show">
              <div className="bdg-contain">
                <div><span className="close" onClick={() => setShowModal(false)}><i className="fa-solid fa-xmark"></i></span></div>
                <div className="bdge-cont">
                  <p style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>Registration Successful! 🎉</p>
                  <p style={{ fontSize: '14px', color: '#a0aec0' }}>Thank you, <strong style={{ color: '#fff' }}>{visitorName}</strong>! Your spot at <strong>Masters Kerala RE 2.0 EXPO26</strong> is secured.</p>
                </div>

                {visitorEmail && (
                  <div className="pr-email-notice" style={{ display: 'flex' }}>
                    <i className="fa-solid fa-envelope-circle-check"></i>
                    <span>A welcome email &amp; calendar details have been sent to <strong>{visitorEmail}</strong></span>
                  </div>
                )}

                <div className="generate-bdg" style={{ marginTop: '14px' }}>
                  <Link href={badgeUrl} target="_blank">Generate &amp; Print Badge Pass</Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

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
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-envelope"></i></div>
                    <a href="mailto:info@solarmasters.org">
                      <div><p className="fr-fd">Work with us</p><p>info@solarmasters.org</p></div>
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
