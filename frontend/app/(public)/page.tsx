'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function PublicHomePage() {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Countdown Timer Logic
    const targetDate = new Date('September 25, 2026 00:00:00').getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(interval);
      }
    }, 1000);

    // Client-side Slick Carousel & AOS Initializer
    const initScripts = () => {
      const $ = (window as any).$;
      if ($ && $.fn && $.fn.slick) {
        if ($('.mn-sldr').length && !$('.mn-sldr').hasClass('slick-initialized')) {
          $('.mn-sldr').slick({
            autoplay: true,
            autoplaySpeed: 3000,
            arrows: false,
            dots: false,
            fade: true,
            cssEase: 'linear'
          });
        }
        if ($('.ind8-slider').length && !$('.ind8-slider').hasClass('slick-initialized')) {
          $('.ind8-slider').slick({
            slidesToShow: 3,
            slidesToScroll: 1,
            autoplay: true,
            autoplaySpeed: 2000,
            arrows: false,
            dots: false,
            responsive: [
              { breakpoint: 768, settings: { slidesToShow: 1 } },
              { breakpoint: 1024, settings: { slidesToShow: 2 } }
            ]
          });
        }
      }
      if ((window as any).AOS) {
        (window as any).AOS.init({ once: true, duration: 1000 });
      }
    };

    const timer = setTimeout(initScripts, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleWhatsAppSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.querySelector('#wa-name') as HTMLInputElement)?.value.trim();
    const mobile = (form.querySelector('#wa-mobile') as HTMLInputElement)?.value.trim();
    const place = (form.querySelector('#wa-place') as HTMLInputElement)?.value.trim();
    const message = (form.querySelector('#wa-message') as HTMLTextAreaElement)?.value.trim();

    if (!name || !mobile) {
      alert('Please enter your name and mobile number.');
      return;
    }
    const text = `Name: ${name}%0AMobile: ${mobile}%0APlace: ${place}%0AMessage: ${message}`;
    window.open(`https://wa.me/+918129838288?text=${text}`, '_blank');
  };

  return (
    <>
      {/* HEADER */}
      <header className="header">
        <div className="hdr-cont">
          <div className="container">
            <div className="header-conts">
              <div className="hdr-logos">
                <Link href="/">
                  {/* eslint-disable-next-html-element-for-jsx */}
                  <img src="/assets/logo/logo.png" alt="Masters Expo Logo" />
                </Link>
                <img src="/assets/logo/1.png" alt="Partner Logo" />
              </div>
              <div className="pg-cnt-btn">
                <a href="#cnct">
                  <div className="ind-cnct-btn">
                    <p>Contact</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="main">
        {/* SECTION 1: HERO SLIDER */}
        <section className="ind1">
          <div className="mn-sldr">
            <div className="mn-img-cntnr"><img src="/assets/ltst-img/2.jpg" alt="Expo 2025 Hall" /></div>
            <div className="mn-img-cntnr"><img src="/assets/ltst-img/8.jpg" alt="Expo 2025 Exhibition" /></div>
            <div className="mn-img-cntnr"><img src="/assets/ltst-img/4.jpg" alt="Expo 2025 Visitors" /></div>
          </div>
          <div className="mn-cont-fl">
            <div className="container">
              <div className="mn-content">
                <div>
                  <h1 data-aos="fade-in" data-aos-duration="1500">Powering the World's Clean Energy Future</h1>
                  <h3 data-aos="fade-in" data-aos-duration="1500"><span>Third Edition –</span><br />Kerala's Premier Renewable Energy Showcase</h3>
                  <div className="dt-bx-flx">
                    <div className="dt-bx">
                      <h3>25</h3>
                      <div className="dt-bx-btm-bx"><p>Friday</p></div>
                    </div>
                    <div className="dt-bx">
                      <h3>26</h3>
                      <div className="dt-bx-btm-bx"><p>Saturday</p></div>
                    </div>
                    <div className="dt-bx">
                      <h3>27</h3>
                      <div className="dt-bx-btm-bx"><p>Sunday</p></div>
                    </div>
                    <h2>Sep 2026</h2>
                  </div>
                  <div className="mn-btns">
                    <Link href="/register/visitor">
                      <p className="p1">Visitor Registration</p>
                    </Link>
                    <Link href="/register/exhibitor">
                      <p className="p2">Exhibitor Registration</p>
                    </Link>
                  </div>
                  <div className="scl-flx">
                    <a href="https://www.facebook.com/Mastersgreenenergyexpo2026/" target="_blank" rel="noreferrer">
                      <div className="scl-bx"><i className="fa-brands fa-facebook-f"></i></div>
                    </a>
                    <a href="https://www.youtube.com/@Mastersexpo2026" target="_blank" rel="noreferrer">
                      <div className="scl-bx"><i className="fa-brands fa-youtube"></i></div>
                    </a>
                    <a href="https://www.instagram.com/mastersexpo_2026/" target="_blank" rel="noreferrer">
                      <div className="scl-bx"><i className="fa-brands fa-instagram"></i></div>
                    </a>
                    <a href="https://www.linkedin.com/company/110237453/" target="_blank" rel="noreferrer">
                      <div className="scl-bx"><i className="fa-brands fa-linkedin-in"></i></div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: ABOUT */}
        <section className="ind2" id="about">
          <div className="container">
            <div className="ind2-content">
              <div className="row">
                <div className="col-md-9">
                  <h3 className="h3" data-aos="fade-in" data-aos-duration="1500">About Us</h3>
                  <h2 data-aos="fade-in" data-aos-duration="1500">We are a premier platform for the solar and clean energy industry</h2>
                  <div className="ind2-inr-flx">
                    <div className="ind2-inr-lft">
                      <img src="/assets/imgs/1.png" alt="About Expo" />
                    </div>
                    <div className="ind2-inr-flx-rgt">
                      <p className="p"><i className="fa-solid fa-location-dot"></i> Lulu Mall, Trivandrum (Thiruvananthapuram)</p>
                      <p data-aos="fade-in" data-aos-duration="1500">Masters Association, representing over 700 MNRE-registered vendors across Kerala, proudly presents the MASTERS KERALA RE 2.0 EXPO26 — a grand platform bringing together all stakeholders of the renewable energy, BESS and EV sectors.</p>
                      <p data-aos="fade-in" data-aos-duration="1500">Discover the latest technologies, innovative products and sustainable solutions from leading manufacturers, suppliers, vendors, R&D institutions and service providers — all under one roof.</p>
                      <div className="count-bx" data-aos="fade-in" data-aos-duration="2000">
                        <ul id="timeControl">
                          <li><span>{countdown.days}</span> Day</li>
                          <li><span>{countdown.hours}</span> Hours</li>
                          <li><span>{countdown.minutes}</span> Minutes</li>
                          <li><span>{countdown.seconds}</span> Seconds</li>
                        </ul>
                      </div>
                      <p className="ind2-cnt">Contact Us</p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-3 col-md-12">
                  <div className="ind2-inr-rgt">
                    <div className="ind2-inr-rgt-tp">
                      <img src="/assets/logo/logoblc.png" alt="Masters Logo" />
                    </div>
                    <div style={{ position: 'relative' }}>
                      <div className="ind2-inr-rgt-btm" data-aos="fade-in" data-aos-duration="1500">
                        <img src="/assets/imgs/2.png" alt="Expo Image" />
                      </div>
                      <div className="exp-bx">
                        <img src="/assets/icons/1.png" alt="Experience" />
                        <div>
                          <h3>5+</h3>
                          <p>years Experience</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: SPONSORS */}
        <section className="ind3">
          <div className="container">
            <div className="ind3-flx">
              <div className="ind3-lft">
                <div className="tle-spnsr">
                  <h3>Title Sponsor</h3>
                  <img src="/assets/logo/1.png" alt="V-Guard Title Sponsor" />
                </div>
              </div>
              <div className="ind3-rgt">
                <div className="mn-spnsr">
                  <h3>Co Sponsor</h3>
                  <div className="spnsr-flx">
                    <img src="/assets/logo/2.png" alt="Co Sponsor 1" />
                    <img src="/assets/logo/3.png" alt="Co Sponsor 2" />
                  </div>
                </div>
              </div>
              <div className="ind3-rgt">
                <div className="reg-prtnrs">
                  <h3>Registration Partner</h3>
                  <div className="spnsr-flx">
                    <img src="/assets/logo/4.png" alt="Registration Partner 1" />
                    <img src="/assets/logo/5.png" alt="Registration Partner 2" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: EXHIBITION INFO + STATS */}
        <section className="ind4">
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <div className="ind3-inr-lft">
                  <div className="ind3-inr-lft-inr1"><img src="/assets/imgs/3.png" alt="" /></div>
                  <div className="ind3-inr-lft-inr2"><img src="/assets/imgs/4.png" alt="" /></div>
                </div>
              </div>
              <div className="col-md-6">
                <div className="ind4-tp">
                  <h2 data-aos="fade-in" data-aos-duration="1500">Kerala's largest Exhibition on Renewable Energy industry</h2>
                  <p data-aos="fade-in" data-aos-duration="1500">This exhibition brings together leading innovators, manufacturers, and solution providers shaping the renewable energy industry.</p>
                </div>
                <div className="goto">
                  <div className="goto-flx">
                    <div className="goto-inr-flx">
                      <div className="count2">
                        <div className="wth-pls">
                          <p className="count">60</p>
                          <span className="sqm-flx"><p>K</p><p>+</p></span>
                        </div>
                        <p>Sqm<br />Exhibition Space</p>
                      </div>
                      <div className="gap-ln"></div>
                      <div className="count2">
                        <div className="wth-pls">
                          <p className="count">12</p>
                          <span className="sqm-flx"><p>K</p><p>+</p></span>
                        </div>
                        <p>Trade<br />Visitors</p>
                      </div>
                    </div>
                    <div className="goto-inr-flx">
                      <div className="gap-ln"></div>
                      <div className="count2">
                        <div className="wth-pls">
                          <p className="count">200</p>
                          <span className="sqm-flx"><p>+</p></span>
                        </div>
                        <p>Over<br />Exhibitors</p>
                      </div>
                      <div className="gap-ln"></div>
                      <div className="count2">
                        <div className="wth-pls">
                          <p className="count">15</p>
                          <span className="sqm-flx"><p>+</p></span>
                        </div>
                        <p>New<br />Product Launches</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="points-flx" data-aos="fade-in" data-aos-duration="1500">
                  <div className="pnt-rnd"></div>
                  <h4>Showcasing the latest innovations in solar, wind, and renewable energy technologies</h4>
                </div>
                <div className="points-flx" data-aos="fade-in" data-aos-duration="1500">
                  <div className="pnt-rnd"></div>
                  <h4>A premier platform for renewable energy products, services, and technologies</h4>
                </div>
                <br />
                <div className="mn-btns">
                  <Link href="/register/visitor">
                    <p className="p1">Visitor Registration</p>
                  </Link>
                  <Link href="/register/exhibitor">
                    <p className="p2">Exhibitor Registration</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: WHY CHOOSE US */}
        <section className="ind5">
          <div className="container">
            <div className="row">
              <div className="col-md-4">
                <div className="ind5-left">
                  <h2><span>Why</span><br />Choose Us?</h2>
                </div>
              </div>
              <div className="col-md-8">
                {[
                  "Kerala's most comprehensive platform dedicated to solar, wind, and renewable energy solutions",
                  "Showcasing the latest technologies, products, and innovations from leading industry brands",
                  "Connecting manufacturers, EPCs, installers, investors, and policymakers under one roof",
                  "Enabling strong B2B networking, partnerships, and business opportunities",
                  "Featuring expert talks, live demos, and knowledge-sharing sessions",
                  "Supporting sustainable growth and clean energy adoption across Kerala and India",
                  "Designed for industry professionals, startups, and clean energy enthusiasts",
                  "Direct access to decision-makers, buyers, and project developers",
                  "Promoting Kerala's vision for sustainable and energy-efficient growth",
                ].map((text, idx) => (
                  <div className="fr-up" key={idx}>
                    <div className="ind5-flx" data-aos="fade-up" data-aos-duration="1000">
                      <div className="ind5-rnd"><img src="/assets/icons/2.png" alt="" /></div>
                      <p>{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: EVENT HIGHLIGHTS */}
        <section className="ind6">
          <div className="container">
            <div className="ind6-hdng">
              <h2>Event Highlights</h2>
              <p>Discover key attractions, innovations, and experiences that make this renewable energy exhibition truly impactful.</p>
            </div>
            <div className="ind6-btm">
              <div className="row">
                {[
                  "South India's Largest Renewable Energy Industry Job fair",
                  "60,000 Sq Ft Air-conditioned Exhibition Area",
                  "Separate Pavilions for E-mobility & Technology Conference",
                  "Technical Seminars by Experts on BESS, EV & Renewable Energy",
                  "B2B Lounge Facility & More Than 3000 Car Parking",
                  "Adequate Promotional Campaign",
                  "Easy Connectivity to Airport, Railway & Bus Stations",
                  "Cultural Seminars and Performance",
                  "Access controlled visitor management",
                  "Cost-effective access to over 150 top renewable energy brands",
                ].map((item, idx) => (
                  <div className="col-md-6" key={idx}>
                    <div className="fr-up">
                      <div className="ind5-flx" data-aos="fade-up" data-aos-duration="1000">
                        <div className="ind5-rnd"><img src="/assets/icons/2.png" alt="" /></div>
                        <div><p>{item}</p></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 7: FLOOR MAP */}
        <section className="ind7">
          <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
            <div className="flr-map">
              <img src="/assets/imgs/6.jpg" alt="Exhibition Floor Map" />
            </div>
          </div>
        </section>

        {/* SECTION 8: PARTICIPANTS */}
        <div className="partners-section">
          <div className="container">
            <div className="prtnr-hdng">
              <h2>Expo 2026-27 Participants</h2>
            </div>
            <div className="prtnr-img-flx">
              {[
                '1.png', '2.png', '3.png', '4.jpeg', '5.png', '6.jpg', '7.png', '8.png', '9.jpeg', '10.jpg',
                '11.jpg', '12.jpeg', '13.jpg', '14.png', '15.jpeg', '16.jpeg', '17.jpeg', '18.jpeg', '19.jpeg', '20.png',
                '21.png', '22.png', '23.png', '24.jpeg', '25.png', '26.png', '27.png', '28.png', '29.png', '30.png',
                '31.png', '32.png', '33.png', '34.jpeg', '35.jpeg', '36.png', '37.png', '38.jpeg', '39.png'
              ].map((img, idx) => (
                <div className="prtnr-img" key={idx}>
                  <img src={`/assets/prtnrs/${img}`} alt={`Participant ${idx + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 9: GALLERY */}
        <section className="ind8">
          <div className="container">
            <div className="ind8-hdng">
              <h2>Glimpses From Expo 2026-27</h2>
              <p>A visual showcase capturing key moments, innovations, and experiences from Expo 2026-27.</p>
            </div>
          </div>
          <div className="ind8-slider">
            {['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '8.jpg', '9.jpg', '10.jpg', '11.jpg', '12.jpg'].map((img, idx) => (
              <div className="item" key={idx}>
                <img src={`/assets/ltst-img/${img}`} alt={`Expo Glimpse ${idx + 1}`} />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 10: CONTACT */}
        <section className="ind10" id="cnct">
          <div className="container">
            <div className="ind10-hdng">
              <h2>Connect With Us</h2>
            </div>
            <div className="ind10-cont">
              <div className="row">
                <div className="col-md-6">
                  <h2>Stay connected with us for updates, opportunities, and participation</h2>
                  <p>Reach out to us for exhibitor inquiries, partnerships, sponsorships, and event information.</p>
                  <div className="cnt-cont">
                    <div className="cnt-cont-flx">
                      <div className="cnt-rnd-bx"><i className="fa-solid fa-location-dot"></i></div>
                      <a href="https://maps.google.com/?q=LuLu+Mall+Thiruvananthapuram" target="_blank" rel="noreferrer">
                        <div>
                          <p className="fr-fd">Our Location</p>
                          <p>LuLu Mall, Thiruvananthapuram</p>
                        </div>
                      </a>
                    </div>
                    <div className="cnt-cont-flx">
                      <div className="cnt-rnd-bx"><i className="fa-solid fa-envelope"></i></div>
                      <a href="mailto:info@solarmasters.org">
                        <div>
                          <p className="fr-fd">Email Us</p>
                          <p>info@solarmasters.org</p>
                        </div>
                      </a>
                    </div>
                    <div className="cnt-cont-flx">
                      <div className="cnt-rnd-bx"><i className="fa-solid fa-phone"></i></div>
                      <a href="tel:+918129838288">
                        <div>
                          <p className="fr-fd">Call Us</p>
                          <p>+91 81298 38288</p>
                        </div>
                      </a>
                    </div>
                    <br />
                    <div className="cnt-scls">
                      <h3>Follow Us On</h3>
                      <div className="scl-flx">
                        <a href="https://www.facebook.com/Mastersgreenenergyexpo2026/" target="_blank" rel="noreferrer">
                          <div className="scl-bx"><i className="fa-brands fa-facebook-f"></i></div>
                        </a>
                        <a href="https://www.youtube.com/@Mastersexpo2026" target="_blank" rel="noreferrer">
                          <div className="scl-bx"><i className="fa-brands fa-youtube"></i></div>
                        </a>
                        <a href="https://www.instagram.com/mastersexpo_2026/" target="_blank" rel="noreferrer">
                          <div className="scl-bx"><i className="fa-brands fa-instagram"></i></div>
                        </a>
                        <a href="https://www.linkedin.com/company/110237453/" target="_blank" rel="noreferrer">
                          <div className="scl-bx"><i className="fa-brands fa-linkedin-in"></i></div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="cnt-frm-bx">
                    <form id="whatsappForm" onSubmit={handleWhatsAppSubmit}>
                      <div className="inpts">
                        <label>Name</label>
                        <input type="text" id="wa-name" required />
                      </div>
                      <div className="inpts">
                        <label>Mobile</label>
                        <input type="text" id="wa-mobile" required />
                      </div>
                      <div className="inpts">
                        <label>Place</label>
                        <input type="text" id="wa-place" />
                      </div>
                      <div className="inpts">
                        <label>Message</label>
                        <textarea id="wa-message"></textarea>
                      </div>
                      <button type="submit">Submit via WhatsApp</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 11: MAP EMBED */}
        <div className="ind11">
          <div className="map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3945.835350332462!2d76.89511697477428!3d8.515362091526896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b05bd7e2688b5e1%3A0x14bc45b8acff2e10!2sLuLu%20Mall%20Thiruvananthapuram!5e0!3m2!1sen!2sin!4v1785933523377!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="container">
          <div className="foot-fl">
            <div className="foot-lft">
              <div className="foot-logo">
                <Link href="/">
                  <img src="/assets/logo/logoblc.png" alt="Masters Logo" />
                </Link>
                <p>Powering the World's Clean Energy Future</p>
                <a href="https://solarmasters.org/" target="_blank" rel="noreferrer">
                  <h3>Masters Association</h3>
                </a>
              </div>
            </div>
            <div className="foot-rgt">
              <div className="foot-lst">
                <h3>Connect With Us</h3>
                <ul>
                  <div className="cnt-cont-flx">
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-location-dot"></i></div>
                    <a href="https://maps.google.com/?q=LuLu+Mall+Thiruvananthapuram" target="_blank" rel="noreferrer">
                      <div>
                        <p className="fr-fd">Our Location</p>
                        <p>LuLu Mall, Thiruvananthapuram</p>
                      </div>
                    </a>
                  </div>
                  <div className="cnt-cont-flx">
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-envelope"></i></div>
                    <a href="mailto:info@solarmasters.org">
                      <div>
                        <p className="fr-fd">Work with us</p>
                        <p>info@solarmasters.org</p>
                      </div>
                    </a>
                  </div>
                  <div className="cnt-cont-flx">
                    <div className="cnt-rnd-bx"><i className="fa-solid fa-phone"></i></div>
                    <a href="tel:+918129838288">
                      <div>
                        <p className="fr-fd">Call Us</p>
                        <p>+91 81298 38288</p>
                      </div>
                    </a>
                  </div>
                </ul>
              </div>
              <div className="foot-lst">
                <h3>Follow Us On</h3>
                <div className="scl-flx">
                  <a href="https://www.facebook.com/Mastersgreenenergyexpo2026/" target="_blank" rel="noreferrer">
                    <div className="scl-bx"><i className="fa-brands fa-facebook-f"></i></div>
                  </a>
                  <a href="https://www.youtube.com/@Mastersexpo2026" target="_blank" rel="noreferrer">
                    <div className="scl-bx"><i className="fa-brands fa-youtube"></i></div>
                  </a>
                  <a href="https://www.instagram.com/mastersexpo_2026/" target="_blank" rel="noreferrer">
                    <div className="scl-bx"><i className="fa-brands fa-instagram"></i></div>
                  </a>
                  <a href="https://www.linkedin.com/company/110237453/" target="_blank" rel="noreferrer">
                    <div className="scl-bx"><i className="fa-brands fa-linkedin-in"></i></div>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
