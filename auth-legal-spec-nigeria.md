# ISCE Authentication Service – Legal & Privacy Documentation (Nigeria)

> **Disclaimer:** This document is a technical and product description intended to support the drafting of legal Terms of Service and Privacy Policy for Nigeria. It is **not** legal advice and must be reviewed and adapted by qualified legal counsel licensed in Nigeria.

## 1. Overview

-   **Service name:** ISCE Authentication Service (the “Auth Service”).
-   **Role in ecosystem:** Central identity and access service for the broader ISCE ecosystem, which includes:
    -   **Authentication** (this project)
    -   **Connect** (e.g. social / business connections, profiles, messaging – managed in a separate service)
    -   **Events** (e.g. event creation, discovery, ticketing – managed in a separate service)
-   **Primary functions:**
    -   User registration and account creation (individual and business).
    -   Secure sign-in on mobile and desktop.
    -   Password reset and recovery via email/SMS OTP.
    -   Email / phone verification via one-time codes.
    -   Session and token management for other ISCE services.
    -   Single sign-out and SSO logout across the ecosystem.
-   **Interfaces:**
    -   Mobile and desktop clients (web/mobile).
    -   Public and internal APIs consumed by Connect, Events, and other ISCE services.
    -   SSO endpoints (e.g. for partners or internal apps where applicable).

## 2. Types of Users

-   **End Users – Individuals:**
    -   Natural persons in Nigeria or elsewhere creating personal accounts to access ISCE services (Connect, Events, etc.).
-   **End Users – Business / Organization Representatives:**
    -   Individuals registering or managing accounts on behalf of companies or organizations (including Nigerian entities).
-   **Administrators / Internal Staff:**
    -   Support, operations, and engineering personnel with controlled access to administration and monitoring tools.

## 3. Data Categories Processed by the Auth Service

This section describes **what** data the Auth Service handles. The actual legal text should refine and localize this list.

### 3.1 Account & Identity Data

-   **Mandatory identifiers:**
    -   Email address.
    -   Mobile phone number (if used for OTP, 2FA, or contact).
-   **Authentication credentials:**
    -   Hashed and salted password (never stored in plain text).
    -   Password reset tokens or OTP codes (short-lived).
    -   Verification codes (email and/or SMS, short-lived).
-   **Profile basics (if stored within auth):**
    -   First and last name (or display name).
    -   Account type (e.g. individual, business).
    -   Country / region (e.g. Nigeria) if collected at registration for localization or compliance.

### 3.2 Device & Technical Data

-   Device type (mobile/desktop), operating system, browser or app version.
-   Approximate location derived from IP address (for fraud detection and localization).
-   Network identifiers (IP address, user agent).
-   Login metadata:
    -   Timestamps of login, logout, failed login attempts.
    -   Source application (Authentication, Connect, Events, partner app).

### 3.3 Usage & Log Data

-   Authentication logs:
    -   Registration attempts (success/failure).
    -   Successful and failed sign-in attempts.
    -   Password reset requests and completions.
    -   Verification code requests and validation results.
-   Session data (as tokens or IDs, not full session content):
    -   Session IDs, JWTs or similar access/refresh tokens.
    -   Token expiry timestamps.
-   Security and system logs (for monitoring, incident response, abuse detection).

### 3.4 Optional / Configurable Data (if applicable)

-   Multi-factor authentication data (e.g. phone number for SMS, email for codes).
-   Consent records (e.g. timestamps and method for accepting ToS/Privacy Policy).
-   Account status (active, suspended, deleted/closed, pending verification).

## 4. Purposes of Processing

The Auth Service processes personal data for the following purposes:

-   **Account creation and management**

    -   To register new users and create unique accounts.
    -   To manage account status (activation, deactivation, deletion, blocking).

-   **Authentication and authorization**

    -   To verify user identity at sign-in.
    -   To issue, validate, refresh, and revoke authentication tokens for ISCE services.

-   **Security, fraud prevention, and abuse detection**

    -   To detect suspicious login patterns or brute-force attempts.
    -   To secure accounts and prevent unauthorized access.
    -   To support incident detection, investigation, and response.

-   **Communication related to authentication**

    -   To send verification codes and password reset links.
    -   To notify users about critical security events (e.g. new device sign-in, account recovery).

-   **Legal and compliance**

    -   To maintain records necessary for demonstrating compliance with applicable Nigerian laws and regulations.
    -   To comply with lawful requests from Nigerian authorities or courts, where required.

-   **Service improvement and analytics (aggregated/limited where possible)**
    -   To understand login success/failure rates and improve reliability.
    -   To improve user experience in registration and sign-in flows.

## 5. Data Sharing Within the Ecosystem

The Auth Service shares user-related data **internally** within the ISCE ecosystem and with limited third parties as needed:

### 5.1 Internal Sharing (ISCE Services)

-   **With Connect:**

    -   User ID and basic identity attributes (e.g. name, email, account type) to link profiles and enable connections.
    -   Authentication status and tokens to authorize access to Connect features.

-   **With Events:**

    -   User ID and authentication state to allow event-related actions (e.g. purchasing, RSVPs, attendance).
    -   Basic profile attributes as required by Events (subject to configuration and minimization).

-   **With other ISCE internal services:**
    -   Authentication assertions (e.g. tokens) and limited identity attributes required for access control.
    -   Logs or security events when needed for security/fraud analysis.

### 5.2 External Sharing (Third Parties)

Depending on your actual integrations:

-   **Communication providers:**

    -   Email service providers for sending verification and password reset emails (email address, message content).
    -   SMS providers for delivering OTP codes (phone number, message content).

-   **Infrastructure / hosting providers:**

    -   Cloud hosting and database providers (store and process data on behalf of ISCE).

-   **Security and monitoring tools:**

    -   Error tracking, logging, and monitoring services (pseudonymous or minimized data where possible).

-   **Legal and compliance:**
    -   Nigerian and foreign authorities, courts, or advisors when legally required, or to protect rights, safety, and security.

> **Note:** Legal/PM should specify jurisdictions and categories of processors, and ensure data processing agreements and cross-border transfer mechanisms are documented, including where Nigerian user data is stored or accessed from outside Nigeria.

## 6. Legal Bases (Nigeria Focus – NDPR/NDPA)

The exact legal bases must be confirmed by Nigerian counsel. Typical bases under Nigerian data protection law (including the Nigeria Data Protection Regulation (NDPR) and Nigeria Data Protection Act (NDPA)) can include:

-   **Contract performance:**

    -   To create and operate user accounts.
    -   To provide access to Authentication, Connect, Events, and related features requested by the user.

-   **Legitimate interests:**

    -   To secure accounts and prevent fraud or abuse.
    -   To maintain service reliability and integrity (e.g. monitoring activities, logs), in a manner that respects users’ rights and freedoms.

-   **Legal obligations:**

    -   To comply with statutory record-keeping, law enforcement requests, and other obligations under Nigerian law.

-   **Consent (where used):**
    -   For optional features or communications not strictly necessary for account operation (e.g. certain marketing, non-essential analytics), collected and managed in accordance with NDPR/NDPA requirements.

## 7. Data Retention

High-level retention expectations (exact durations to be defined by legal/PM, taking into account Nigerian regulations and sector-specific rules):

-   **Account data:**

    -   Retained for as long as the account remains active.
    -   Certain core records may be retained for a defined period after account deletion for security, fraud prevention, or to comply with legal obligations.

-   **Authentication logs:**

    -   Retained for a limited period for security auditing and incident investigation.

-   **Verification codes and reset tokens:**

    -   Stored only for short durations (e.g. minutes to hours) until they expire or are used.

-   **Backup data:**
    -   Included in system backups, which are kept for a defined cycle and then securely overwritten or destroyed.

## 8. Security Measures (High-Level)

Technical and organizational measures used by the Auth Service (to be validated against your actual implementation):

-   **Password security:**

    -   Strong hashing algorithm (e.g. bcrypt/Argon2) and salting.
    -   Minimum password requirements and optional additional controls (e.g. password strength checks).

-   **Transport and storage security:**

    -   TLS/HTTPS for all client–server and service–service communication.
    -   Encryption at rest for databases and backups where supported.

-   **Access controls:**

    -   Role-based access control for internal staff.
    -   Principle of least privilege for services and internal tools.

-   **Session and token security:**

    -   Short-lived access tokens and, if used, refresh tokens with controlled usage.
    -   CSRF, replay protection, and device/session revocation mechanisms as applicable.

-   **Monitoring and incident response:**
    -   Logging of security-relevant events.
    -   Procedures for detecting, responding to, and notifying about security incidents in line with Nigerian data protection requirements.

## 9. User Rights & Controls (Nigeria)

Under Nigerian data protection law (including NDPR/NDPA), and subject to applicable conditions, users may have rights such as:

-   **Access:** Obtain confirmation whether their data is processed and receive a copy.
-   **Correction/rectification:** Request correction of inaccurate or incomplete data.
-   **Deletion/erasure:** Request deletion of their account and certain associated data, subject to legal or legitimate retention needs.
-   **Restriction / objection:** Request restriction of or object to certain types of processing, particularly where based on legitimate interest or for direct marketing.
-   **Portability (where applicable):** Receive certain data in a structured, commonly used format and request its transmission to another controller, where technically feasible.
-   **Withdraw consent:** Where processing is based on consent, withdraw that consent at any time, without affecting prior lawful processing.

The Auth Service should support these rights via:

-   Account settings and self-service controls (e.g. change email, password, delete account where supported).
-   Support channels (e.g. contact email or in-app request flow).
-   Technical hooks for global account deletion and deactivation in Connect and Events, where required.

## 10. Cookies and Similar Technologies

If the Auth Service is used via web:

-   **Types of cookies / storage used:**

    -   Essential cookies or storage for:
        -   Maintaining login sessions.
        -   CSRF protection and security.
    -   Optional analytics or performance cookies if enabled (should be explicitly documented if used and handled in line with Nigerian guidance on consent/notice for tracking technologies).

-   **Mobile applications:**
    -   Use of secure storage mechanisms for tokens instead of web cookies.
    -   Device permissions and system APIs should be listed in the mobile privacy documentation if they involve personal data.

## 11. Children’s Data (If Applicable)

Specify whether the Auth Service:

-   Is intended for use by children under a certain age (e.g. under 18) or not.
-   Includes age gating, parental consent, or other controls where required by Nigerian law.
-   Has policies to handle and delete accounts for children if created in violation of age restrictions.

## 12. International Data Transfers

If data is stored/processed outside Nigeria:

-   Identify main hosting locations (e.g. EU, US, other regions, or specific cloud regions used).
-   Describe the mechanisms for cross-border transfers, to be aligned with NDPR/NDPA requirements and any guidance from the Nigeria Data Protection Commission (NDPC).

## 13. Example Structure for Terms of Service (Nigeria-Oriented)

Legal should use the above as input and typically include clauses such as:

-   Service description and scope (referencing Authentication, Connect, Events).
-   Eligibility and account responsibilities (accurate information, password confidentiality, prohibited uses, compliance with Nigerian law).
-   License grants and limitations (use of apps and services).
-   Integration with third-party services or SSO providers.
-   Termination and suspension of accounts.
-   Disclaimers, limitation of liability, and indemnities, in line with Nigerian contract and consumer protection law.
-   Governing law and dispute resolution (e.g. laws of the Federal Republic of Nigeria; dispute resolution mechanism, venue, and potential arbitration/mediation provisions).
-   Changes to the Terms and notification process.

## 14. Example Structure for Privacy Policy (Nigeria-Oriented)

Using sections 2–12, legal can structure a Privacy Policy with:

-   Introduction and identity/contact details of the data controller in Nigeria.
-   Categories of personal data collected (aligned with section 3).
-   Purposes and legal bases (section 4 and 6), referencing NDPR/NDPA.
-   Data sharing and recipients (section 5).
-   International data transfers and safeguards (section 12).
-   Data retention (section 7).
-   Security measures (section 8).
-   User rights and how to exercise them (section 9), including how to lodge complaints with the Nigeria Data Protection Commission.
-   Cookies and tracking (section 10).
-   Children’s privacy (section 11).
-   Contact information and complaints (e.g. data protection officer or contact point in Nigeria).
-   Updates to the Privacy Policy and how users will be notified.

---

This document is intended as a **Nigeria-focused technical and product specification** to help your legal team draft:

-   A Terms of Service that covers the ISCE Authentication Service as part of the broader ISCE ecosystem; and
-   A Privacy Policy that complies with Nigerian data protection law (NDPR/NDPA) and other applicable regulations.

All legal conclusions, language, and compliance assessments must be confirmed and finalized by qualified Nigerian legal counsel.
