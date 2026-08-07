import base64

with open('extracted_p1_img0.jpeg', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('utf-8')

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masters Kerala RE EXPO26 - Proposal</title>
    <style>
        @page {{
            size: A4;
            margin: 15mm 18mm 15mm 18mm;
        }}
        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
        }}
        body {{
            background: #ffffff;
            color: #222222;
            font-size: 10pt;
            line-height: 1.5;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}
        .header {{
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 22px;
            padding-bottom: 12px;
            border-bottom: 2px solid #01A64E;
        }}
        .logo-container img {{
            height: 48px;
            width: auto;
            display: block;
        }}
        .address-box {{
            margin-top: 6px;
            font-size: 8.5pt;
            color: #555555;
            line-height: 1.35;
        }}
        .doc-meta {{
            text-align: right;
            font-size: 8.5pt;
            color: #444444;
        }}
        .doc-meta .badge {{
            display: inline-block;
            background-color: #01A64E;
            color: #ffffff;
            font-size: 8.5pt;
            font-weight: bold;
            padding: 4px 10px;
            border-radius: 4px;
            margin-bottom: 6px;
            text-transform: uppercase;
        }}
        .doc-title {{
            font-size: 16pt;
            font-weight: bold;
            color: #0f172a;
            margin-bottom: 18px;
            line-height: 1.3;
        }}
        .section-title {{
            font-size: 12pt;
            font-weight: bold;
            color: #0f172a;
            margin-top: 20px;
            margin-bottom: 8px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 3px;
            page-break-after: avoid;
        }}
        p {{
            margin-bottom: 8px;
            text-align: justify;
        }}
        ul {{
            margin-left: 20px;
            margin-bottom: 12px;
        }}
        li {{
            margin-bottom: 4px;
            text-align: justify;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
            margin-bottom: 14px;
            font-size: 9pt;
            page-break-inside: avoid;
        }}
        th {{
            background-color: #f1f5f9;
            color: #334155;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 8pt;
            letter-spacing: 0.5px;
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            text-align: left;
        }}
        td {{
            padding: 7px 10px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }}
        .total-row td {{
            font-weight: bold;
            background-color: #f8fafc;
            color: #01A64E;
        }}
        .callout-box {{
            background-color: #f0fdf4;
            border-left: 4px solid #01A64E;
            padding: 10px 14px;
            margin: 12px 0;
            font-size: 9pt;
            color: #166534;
            page-break-inside: avoid;
        }}
        .footer {{
            margin-top: 25px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
            font-size: 8pt;
            color: #64748b;
            display: flex;
            justify-content: space-between;
        }}
    </style>
</head>
<body>

    <!-- HEADER -->
    <div class="header">
        <div>
            <div class="logo-container">
                <img src="data:image/jpeg;base64,{logo_b64}" alt="FLUMENX Logo">
            </div>
            <div class="address-box">
                <strong>FLUMENX SOFTWARE SOLUTIONS</strong><br>
                Gautham Villa T.C 7/82 Kanjirampara PO,<br>
                Kanjirampara, Thiruvananthapuram, Kerala 695030
            </div>
        </div>
        <div class="doc-meta">
            <div class="badge">Official Scope & Proposal</div><br>
            Date: <strong>August 07, 2026</strong><br>
            Ref: <strong>FX-2026-EXPO26-P1</strong><br>
            Capacity: <strong>75,000+ Concurrent</strong>
        </div>
    </div>

    <!-- TITLE -->
    <div class="doc-title">Masters Kerala RE EXPO26 – Full Platform Rebuild & High-Scale Infrastructure Proposal</div>

    <!-- 1. EXECUTIVE SUMMARY -->
    <div class="section-title">1. Executive Summary</div>
    <p>
        This proposal presents a structured full-stack architecture rebuild, module stabilization, and cloud infrastructure deployment strategy for the <strong>Masters Kerala RE EXPO26</strong> platform. The system has been transformed from legacy static interfaces into a high-concurrency Node.js Express API, Next.js 14 frontend, and PostgreSQL database architecture.
    </p>
    <p>
        The rebuilt platform is engineered to support over <strong>75,000+ visitor registrations</strong>, instant dual-mode QR gate check-ins, automated `.ics` calendar invites, and live real-time attendance analytics with sub-20ms database query response times.
    </p>

    <!-- 2. PROJECT OBJECTIVES -->
    <div class="section-title">2. Project Objectives</div>
    <ul>
        <li>Stabilize and optimize core event management workflows to guarantee 99.9% uptime and zero registration drop-offs.</li>
        <li>Establish a clean, modular TypeScript architecture with PostgreSQL B-Tree database indexes for high scalability.</li>
        <li>Deliver responsive modern UI/UX for desktop, mobile QR scanners, and administrative management.</li>
        <li>Provide Dual-Mode QR Gate Scanning (ENTRY & EXIT) with complete audit trail logging and real-time gate counters.</li>
        <li>Automate instant transactional emails, digital badge QR generation, and Google Calendar / `.ics` attachments.</li>
        <li>Provision Hostinger KVM 8 High-Concurrency VPS for 75,000+ concurrent attendees with Nginx reverse proxy & PM2 cluster mode.</li>
    </ul>

    <!-- 3. SCOPE OF WORK -->
    <div class="section-title">3. Scope of Work</div>
    <ul>
        <li><strong>Architecture & Database Core:</strong> PostgreSQL DB indexing, Prisma ORM, JWT Authentication, and 3-Tier Role-Based Security (SUPER_ADMIN, EVENT_MANAGER, GATE_OFFICER).</li>
        <li><strong>Visitor Management & Automated iCal Invites:</strong> Registration CRUD, instant digital badge QR codes, welcome email triggers, and Google Calendar / `.ics` attachments.</li>
        <li><strong>Exhibitor Portal & Approval System:</strong> Public registration, pending approval workflow, admin stall allocation, and exhibitor staff pass management.</li>
        <li><strong>Gate Control & Dual-Mode Scanner:</strong> Gates CRUD, live web QR scanner supporting ENTRY & EXIT validation, and live on-site attendee tracking.</li>
        <li><strong>Gate Audit Logging:</strong> Complete audit trail logging for every scan event (Visitor ID, Gatekeeper ID, Gate Name, Scan Type, Status, Timestamp).</li>
        <li><strong>Sub-Events & Schedule Engine:</strong> Date, stage, and capacity management for main expo seminars and technical presentations.</li>
        <li><strong>Admin Dashboard & Real-Time Analytics:</strong> Dynamic real-time counters for active on-site attendees, gate traffic graphs, and CSV/PDF export tools.</li>
    </ul>

    <!-- 4. DEVELOPMENT METHODOLOGY -->
    <div class="section-title">4. Development Methodology</div>
    <p>
        The project follows a structured redevelopment strategy to ensure system stability, high test coverage, and clean maintainability. Instead of continuing on unstable legacy code, each module is refactored and migrated into a clean production architecture.
    </p>
    <ul>
        <li>Existing Codebase Analysis & Technical Assessment</li>
        <li>Repository Restructuring & Clean Architecture Setup</li>
        <li>Module-by-Module Refactoring & Optimization</li>
        <li>UI/UX Redesign & Mobile Responsiveness Optimization</li>
        <li>Backend Stabilization & Security Hardening</li>
        <li>Testing, QA, & High-Scale Load Tuning</li>
    </ul>

    <!-- 5. TECHNOLOGY STACK USED -->
    <div class="section-title">5. Technology Stack Used</div>
    <table>
        <thead>
            <tr>
                <th style="width: 30%;">Layer</th>
                <th style="width: 70%;">Technologies Used</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Frontend Technologies</strong></td>
                <td>Next.js 14, React, TailwindCSS, Lucide Icons, Recharts</td>
            </tr>
            <tr>
                <td><strong>Backend Technologies</strong></td>
                <td>Node.js, Express, TypeScript, JWT, BcryptJS, Nodemailer</td>
            </tr>
            <tr>
                <td><strong>Database Engine</strong></td>
                <td>PostgreSQL, Prisma ORM, PgBouncer Connection Pooling</td>
            </tr>
            <tr>
                <td><strong>DevOps & Infrastructure</strong></td>
                <td>Hostinger KVM 8 VPS (8 vCPU, 32 GB RAM), Nginx Reverse Proxy, PM2 Cluster Mode</td>
            </tr>
        </tbody>
    </table>

    <!-- 6. PROJECT TIMELINE -->
    <div class="section-title">6. Project Timeline</div>
    <table>
        <thead>
            <tr>
                <th style="width: 22%;">Timeline</th>
                <th style="width: 25%;">Phase</th>
                <th style="width: 40%;">Activities</th>
                <th style="width: 13%;">Duration</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Days 1 – 5</td>
                <td>Minimal Setup & Registrations</td>
                <td>Minimal running setup, visitor & exhibitor portals, digital QR badges, welcome emails & auto-calendar (.ics) invites. Deployed live on Hostinger KVM 8 VPS by Day 5.</td>
                <td>5 Days</td>
            </tr>
            <tr>
                <td>Days 6 – 10</td>
                <td>Core Event Management & Deployment</td>
                <td>Sub-events engine, gate control, dual ENTRY/EXIT QR scanners, gate audit logs, admin analytics & Hostinger KVM 8 VPS setup.</td>
                <td>5 Days</td>
            </tr>
            <tr class="total-row">
                <td colspan="3">Total Fast-Track Execution Timeline</td>
                <td>10 Days</td>
            </tr>
        </tbody>
    </table>

    <div class="callout-box">
        <strong>🚀 Day 5 Live Milestone:</strong> By Day 5, the minimal running platform will be hosted and live on Hostinger KVM 8 VPS with Nginx, PM2, and SSL enabled. Public visitor registrations and digital QR badge issuance will be fully active from Day 5 onwards.
    </div>

    <!-- 7. PROJECT BUDGET ESTIMATION -->
    <div class="section-title">7. Project Budget Estimation</div>
    <table>
        <thead>
            <tr>
                <th style="width: 55%;">Service / Component Description</th>
                <th style="width: 25%;">Cycle / Details</th>
                <th style="width: 20%;" class="text-right">Cost (₹)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td><strong>Full Platform Rebuild & Stabilization Fee (A)</strong></td>
                <td>Full-Stack Node.js/Next.js/PostgreSQL Rebuild</td>
                <td style="text-align: right;"><strong>₹35,000</strong></td>
            </tr>
            <tr>
                <td><strong>Hostinger KVM 8 VPS High-Scale Server (B)</strong></td>
                <td>8 vCPU, 32 GB RAM, 400 GB NVMe Storage (Monthly)</td>
                <td style="text-align: right;"><strong>₹4,999 / mo</strong></td>
            </tr>
            <tr>
                <td>Self-Hosted PostgreSQL DB & PgBouncer Engine</td>
                <td>Hosted on KVM 8 VPS + Local Daily Backups</td>
                <td style="text-align: right;">₹0.00 (Included)</td>
            </tr>
            <tr>
                <td>Transactional Email & iCal Invite Engine</td>
                <td>Hostinger Domain Webmail SMTP + Nodemailer</td>
                <td style="text-align: right;">₹0.00 (Included)</td>
            </tr>
            <tr class="total-row">
                <td colspan="2">Total Initial Investment (Rebuild + 1st Month Server)</td>
                <td style="text-align: right; font-size: 11pt;">₹39,999</td>
            </tr>
        </tbody>
    </table>

    <!-- 8. DELIVERABLES -->
    <div class="section-title">8. Platform Deliverables</div>
    <ul>
        <li>Public Visitor & Exhibitor Registration Portals with Instant Digital QR Badges</li>
        <li>Automated Nodemailer Confirmation Engine with `.ics` Calendar Invites</li>
        <li>Gate Control System with Live Dual-Mode (ENTRY & EXIT) Web QR Scanner</li>
        <li>Gate Audit Logs with Real-time Attendance & Scan Verification Tracking</li>
        <li>Admin Management Dashboard with On-Site Attendee Analytics & CSV Exports</li>
        <li>Hostinger KVM 8 Production VPS Deployment with SSL & PM2 Cluster Tuning</li>
    </ul>

    <!-- 9. CONCLUSION -->
    <div class="section-title">9. Conclusion</div>
    <p>
        This proposal presents a structured redevelopment strategy for transforming the Masters Kerala RE EXPO26 platform into a stable, scalable, and high-performance event management ecosystem. The rebuild guarantees 99.9% uptime, zero registration drop-offs, and seamless gate operations for 75,000+ visitors.
    </p>

    <!-- 10. DISCLAIMER & LEGAL CONSIDERATIONS -->
    <div class="section-title">10. Disclaimer & Legal Considerations</div>
    <p>
        The scope, timeline, and budget outlined in this proposal are based on current requirements. Hosting renewals are billed directly at Hostinger KVM 8 plan rates. Any future out-of-scope custom feature requests post-delivery will be evaluated separately under standard hourly rates.
    </p>

    <!-- FOOTER -->
    <div class="footer">
        <span>© 2026 FLUMENX SOFTWARE SOLUTIONS • Confidential Project Proposal</span>
        <span>Proposal Ref: FX-2026-EXPO26-P1</span>
    </div>

</body>
</html>
"""

with open('proposal_exact.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Successfully generated proposal_exact.html')
