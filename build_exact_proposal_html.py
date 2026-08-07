import os

logo_b64 = open('logo.txt', 'r').read().strip()
corner_b64 = open('corner.txt', 'r').read().strip()

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masters Kerala RE EXPO26 Platform Rebuild & Infrastructure Proposal</title>
    <style>
        @page {{
            size: A4;
            margin: 20mm 20mm 20mm 20mm;
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }}

        body {{
            background-color: #ffffff;
            color: #2d3748;
            line-height: 1.6;
            font-size: 13.5px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }}

        .page {{
            position: relative;
            max-width: 800px;
            margin: 0 auto;
            background: #ffffff;
            padding: 10px 0;
        }}

        /* TOP CORNER GRAPHIC OVERLAY */
        .corner-overlay {{
            position: absolute;
            top: -20px;
            right: -20px;
            width: 220px;
            height: auto;
            z-index: 10;
            pointer-events: none;
        }}

        /* HEADER */
        .header {{
            position: relative;
            margin-bottom: 35px;
            z-index: 20;
        }}

        .logo-img {{
            height: 52px;
            width: auto;
            display: block;
            margin-bottom: 12px;
        }}

        .company-address {{
            font-size: 12.5px;
            color: #4a5568;
            line-height: 1.45;
        }}

        /* DOCUMENT TITLE */
        .doc-title {{
            font-size: 22px;
            font-weight: 700;
            color: #1b5c68;
            margin-top: 30px;
            margin-bottom: 8px;
            line-height: 1.35;
        }}

        .title-divider {{
            height: 2px;
            background-color: #1b5c68;
            width: 100%;
            margin-bottom: 28px;
        }}

        /* SECTION HEADINGS */
        .section-title {{
            font-size: 16px;
            font-weight: 700;
            color: #1b5c68;
            margin-top: 26px;
            margin-bottom: 14px;
        }}

        p.body-text {{
            font-size: 13.5px;
            color: #2d3748;
            margin-bottom: 14px;
            line-height: 1.65;
            text-align: justify;
        }}

        /* LISTS */
        ul.styled-list {{
            list-style: none;
            padding-left: 0;
            margin-bottom: 18px;
        }}

        ul.styled-list li {{
            position: relative;
            padding-left: 20px;
            margin-bottom: 8px;
            font-size: 13.5px;
            color: #2d3748;
            line-height: 1.55;
        }}

        ul.styled-list li::before {{
            content: "•";
            position: absolute;
            left: 4px;
            top: -1px;
            color: #1b5c68;
            font-size: 16px;
            font-weight: bold;
        }}

        /* SUBSECTION TITLE */
        .subsection-title {{
            font-size: 14px;
            font-weight: 700;
            color: #1a202c;
            margin-top: 16px;
            margin-bottom: 8px;
        }}

        /* TABLES */
        table {{
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 24px;
            font-size: 13px;
            border: 1px solid #cbd5e1;
        }}

        th {{
            background-color: #f8fafc;
            color: #1a202c;
            font-weight: 700;
            text-align: left;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
        }}

        td {{
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
            color: #2d3748;
            vertical-align: top;
        }}

        .text-right {{
            text-align: right;
        }}

        .total-row td {{
            font-weight: 700;
            background-color: #f8fafc;
        }}

        .page-break {{
            page-break-before: always;
            break-before: page;
        }}
    </style>
</head>
<body>

    <div class="page">
        <!-- TOP CORNER GRAPHIC OVERLAY -->
        <img class="corner-overlay" src="{corner_b64}" alt="Header Ornament" />

        <!-- COMPANY HEADER -->
        <div class="header">
            <img class="logo-img" src="{logo_b64}" alt="FlumenX Make It Happen" />
            <div class="company-address">
                Gautham villa T.c7/82 Kanjirampara PO,<br>
                Kanjirampara, Thiruvananthapuram, Kerala 695030
            </div>
        </div>

        <!-- DOCUMENT TITLE -->
        <h1 class="doc-title">Masters Kerala RE EXPO26 Platform Rebuild & High-Scale Infrastructure Proposal</h1>
        <div class="title-divider"></div>

        <!-- 1. EXECUTIVE SUMMARY -->
        <div class="section-title">1. Executive Summary</div>
        <p class="body-text">
            This proposal outlines the full-stack architecture rebuild, module stabilization, and high-scale cloud infrastructure deployment for the <strong>Masters Kerala RE EXPO26</strong> platform. The system has been transformed from legacy static interfaces into a high-concurrency Node.js Express API, Next.js 14 frontend, and PostgreSQL database architecture.
        </p>
        <p class="body-text">
            The existing project was restructured to resolve unstable workflows and architecture limits. The primary objective of Phase 1 is to establish a stable, responsive, and high-performance event management system capable of handling over <strong>75,000+ attendee registrations</strong>, dual-mode QR gate check-ins, automated `.ics` calendar invites, and real-time attendance analytics.
        </p>

        <!-- 2. PROJECT OBJECTIVES -->
        <div class="section-title">2. Project Objectives</div>
        <ul class="styled-list">
            <li>Stabilize and optimize the platform functionalities to ensure reliable performance and seamless user experience.</li>
            <li>Establish a clean, scalable, and well-structured development architecture for long-term sustainability.</li>
            <li>Improve overall UI/UX design and mobile responsiveness across desktop, mobile scanners, and admin terminals.</li>
            <li>Refactor frontend and backend modules to improve code quality, maintainability, and system efficiency.</li>
            <li>Execute dual-mode QR Gate Control (ENTRY & EXIT) with complete real-time audit trail logging.</li>
            <li>Implement robust validation mechanisms and error-handling processes to improve security and system reliability.</li>
            <li>Automate instant email triggers for digital QR badges and `.ics` Google Calendar invites.</li>
            <li>Provision Hostinger KVM 8 High-Concurrency VPS tuned for 75,000+ concurrent visitors.</li>
        </ul>

        <!-- 3. SCOPE OF WORK -->
        <div class="section-title">3. Scope of Work – Phase 1</div>
        
        <div class="subsection-title">Authentication & Security System</div>
        <ul class="styled-list">
            <li>Login functionality stabilization with bcrypt hashed password security.</li>
            <li>Role-Based Access Control (SUPER_ADMIN, EVENT_MANAGER, GATE_OFFICER).</li>
            <li>JWT authentication validation, session handling, and backend middleware cleanup.</li>
        </ul>

        <div class="subsection-title">Visitor & Exhibitor Modules</div>
        <ul class="styled-list">
            <li>Visitor CRUD registration, instant digital badge code generation, and auto-calendar (.ics) dispatch.</li>
            <li>Exhibitor self-registration portal, admin pending approval workflow, and stall allocation.</li>
            <li>Company employee booth pass management and designation tracking.</li>
        </ul>

        <div class="subsection-title">Gate Control & Audit Logging</div>
        <ul class="styled-list">
            <li>Gate CRUD management and active scanner status controls.</li>
            <li>Dual-Mode QR scanner supporting live ENTRY and EXIT check-in validation.</li>
            <li>Comprehensive Gate Audit Logs for every scan event (Visitor ID, Gatekeeper ID, Gate Name, Scan Type, Status, Timestamp).</li>
        </ul>

        <div class="subsection-title">Admin Dashboard & Analytics</div>
        <ul class="styled-list">
            <li>Real-time counter for active on-site attendees ("Currently Inside Venue").</li>
            <li>Pass utilization circular graphs for Gate In and Gate Out checkouts.</li>
            <li>Master data configuration (Categories, Halls, Gates, Designations) and CSV/PDF reports.</li>
        </ul>

        <div class="page-break"></div>

        <!-- 4. DEVELOPMENT METHODOLOGY -->
        <div class="section-title">4. Development Methodology</div>
        <p class="body-text">
            The project follows a structured redevelopment strategy to ensure stability, scalability, and maintainability. Instead of directly continuing development on unstable code, a clean repository structure was created with component-driven architecture and B-Tree PostgreSQL database indexes.
        </p>
        <ul class="styled-list">
            <li>Existing Codebase & Requirements Analysis</li>
            <li>Clean Modular Repository Restructuring</li>
            <li>Module-by-Module Refactoring & API Optimization</li>
            <li>UI/UX Redesign & Mobile Responsiveness Tuning</li>
            <li>Backend Architecture Stabilization & Connection Pooling</li>
            <li>Validation, Testing & Quality Assurance</li>
        </ul>

        <!-- 5. TECHNOLOGY STACK USED -->
        <div class="section-title">5. Technology Stack Used</div>
        <p class="body-text">
            The development of the Expo platform utilizes modern enterprise web technologies to ensure scalability and high performance:
        </p>
        
        <div class="subsection-title">Frontend Technologies</div>
        <ul class="styled-list">
            <li>Next.js 14, HTML5, CSS3, JavaScript / TypeScript</li>
            <li>Lucide Icons, Recharts Analytics, TailwindCSS</li>
        </ul>

        <div class="subsection-title">Backend & Database Technologies</div>
        <ul class="styled-list">
            <li>Node.js, Express REST API Architecture</li>
            <li>PostgreSQL Database with B-Tree Query Indexing</li>
            <li>Prisma ORM & PgBouncer Connection Pooling</li>
            <li>Nodemailer + Hostinger Domain Webmail SMTP</li>
        </ul>

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
                    <td>Minimal running setup, visitor & exhibitor portals, digital QR badges, welcome emails & auto-calendar (.ics) invites</td>
                    <td>5 Days</td>
                </tr>
                <tr>
                    <td>Days 6 – 10</td>
                    <td>Core Event Management & Deployment</td>
                    <td>Sub-events engine, gate control, dual ENTRY/EXIT QR scanners, gate audit logs, admin analytics & Hostinger KVM 8 VPS setup</td>
                    <td>5 Days</td>
                </tr>
                <tr class="total-row">
                    <td colspan="3">Total Fast-Track Execution Timeline</td>
                    <td>10 Days</td>
                </tr>
            </tbody>
        </table>

        <!-- 7. PROJECT BUDGET ESTIMATION -->
        <div class="section-title">7. Project Budget Estimation</div>
        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">Module / Service</th>
                    <th style="width: 50%;">Description</th>
                    <th style="width: 20%;" class="text-right">Estimated Cost</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Full-Stack Platform Rebuild (A)</td>
                    <td>Complete Node.js API, Next.js 14 frontend, PostgreSQL database schema, QR badge engine & Gate Audit Control</td>
                    <td class="text-right">₹35,000</td>
                </tr>
                <tr>
                    <td>Hostinger KVM 8 VPS Server (B)</td>
                    <td>8 vCPU, 32 GB RAM, 400 GB NVMe Storage, 32 TB Bandwidth high-concurrency VPS hosting (Monthly)</td>
                    <td class="text-right">₹4,999 / mo</td>
                </tr>
                <tr>
                    <td>PostgreSQL DB Engine & Connection Pooler</td>
                    <td>Self-hosted PostgreSQL DB with PgBouncer connection pooling on KVM 8 VPS + local daily backups</td>
                    <td class="text-right">₹0.00 (Included)</td>
                </tr>
                <tr>
                    <td>Transactional Email & iCal Invite Engine</td>
                    <td>Integrated Nodemailer service connected to Hostinger Domain Webmail SMTP for badge & calendar invites</td>
                    <td class="text-right">₹0.00 (Included)</td>
                </tr>
                <tr>
                    <td>Domain Name, DNS & SSL Security</td>
                    <td>Free 1-Year Domain registration / DNS mapping + Domain privacy protection & SSL Certificate</td>
                    <td class="text-right">₹0.00 (Included)</td>
                </tr>
                <tr class="total-row">
                    <td colspan="2">Total Initial Investment (Rebuild Fee + 1st Month KVM 8 VPS Hosting)</td>
                    <td class="text-right" style="color: #1b5c68; font-size: 15px;">₹39,999 INR</td>
                </tr>
            </tbody>
        </table>

        <!-- 8. DEPLOYMENT DELIVERABLES -->
        <div class="section-title">8. Phase 1 Deployment Deliverables</div>
        <p class="body-text">
            Upon successful deployment to live production environment, the following modules and features are fully operational:
        </p>
        <ul class="styled-list">
            <li>Main Expo Public Portal & Sub-Events Schedule Engine</li>
            <li>Exhibitor Self-Registration & Admin Approval Dashboard</li>
            <li>Visitor Registration, Digital Badge QR Codes & Auto-Calendar (.ics) Invites</li>
            <li>Gatekeeper Dual-Mode Scanner (ENTRY & EXIT) with Real-Time Gate Audit Logs</li>
            <li>Staff & Gate Officer User Control with Role-Based Security</li>
            <li>Admin Overview Dashboard with Live On-Site Attendee Counter ("Currently Inside")</li>
            <li>Hostinger KVM 8 VPS Production Server with Nginx Reverse Proxy & PM2 Process Clustering</li>
        </ul>

        <!-- 9. CONCLUSION -->
        <div class="section-title">9. Conclusion</div>
        <p class="body-text">
            This proposal presents a structured redevelopment strategy for establishing a stable, scalable, and high-concurrency platform for the <strong>Masters Kerala RE EXPO26</strong>. The rebuild focuses on optimizing core event workflows, refining platform architecture, and strengthening technical foundations for 75,000+ concurrent attendees.
        </p>

        <!-- 10. DISCLAIMER & LEGAL CONSIDERATIONS -->
        <div class="section-title">10. Disclaimer & Legal Considerations</div>
        <ul class="styled-list">
            <li><strong>Bundled Campaign Scope (No Extra Cost):</strong> Google Analytics 4 integration, Pre-registration landing page, Website updates, and Automated Calendar Reminder triggers are included under the primary Masters Expo 2026 contract scope at <strong>No Additional Cost (₹0.00 / Bundled)</strong>.</li>
            <li>This proposal includes all core deliverables specifically defined under Phase 1 Rebuild.</li>
            <li>Hosting & infrastructure renewal rates are billed directly at Hostinger KVM 8 plan pricing (₹4,999/mo).</li>
            <li>Deployment support covers technical setup, Nginx configuration, PM2 cluster tuning, and initial launch activities.</li>
            <li>Ownership of project deliverables and source code shall be transferred according to payment conditions.</li>
        </ul>
    </div>

</body>
</html>
"""

open('proposal_exact.html', 'w', encoding='utf-8').write(html_content)
print("Successfully generated proposal_exact.html")
