# Connect Product Documentation

## 1. Introduction

Connect is a modern, digital networking solution within the ISCE Ecosystem, designed to bridge the gap between physical and digital interactions. It allows users to create a comprehensive digital profile containing contact information, social media links, files, meeting schedules, and more. This profile can be instantly shared with others through NFC-enabled devices (like cards or wearables) or by scanning a unique QR code.

The primary purpose of Connect is to provide a seamless and efficient way for professionals and individuals to exchange information and build their network without the hassle of traditional paper business cards. It aims to be a central hub for a user's digital presence, making it easy to manage and share.

This document is intended for a wide audience, including:
*   **Board Members:** To provide a strategic overview of the product, its capabilities, and its future direction.
*   **Product Managers:** To offer a detailed understanding of the product's features and technical architecture.
*   **End-Users:** To serve as a comprehensive guide on how to use the product effectively.

## 2. Key Features

Connect is built around a modular design, allowing users to customize their digital profiles with the information that matters most to them. The following are the key features available in the current version of the product:

### 2.1. Contact
The Contact module allows users to share their personal and professional contact information. This includes:
*   Phone numbers
*   Email addresses
*   Website URLs
*   Physical addresses

This feature serves as a digital business card, making it easy for new connections to get in touch.

### 2.2. Links
The Links module enables users to share a curated list of web links. This can be used to direct people to:
*   Personal websites or blogs
*   Portfolios
*   Project pages
*   Articles or publications

### 2.3. Videos
With the Videos module, users can showcase video content directly on their profile. This is ideal for:
*   Content creators
*   Filmmakers
*   Marketing professionals
*   Anyone looking to share promotional or personal videos

### 2.4. Socials
The Socials module allows users to consolidate their online presence by linking to their various social media profiles. Supported platforms include:
*   LinkedIn
*   Twitter
*   Instagram
*   TikTok
*   And more...

### 2.5. Meetings
The Meetings module helps users schedule appointments and meetings with ease. Users can link their calendar or scheduling tools (like Calendly or Google Meet) to allow others to book a time with them directly from their Connect profile.

### 2.6. Appointments
Similar to the Meetings module, the Appointments module is designed for service-based professionals to manage bookings. This is particularly useful for:
*   Consultants
*   Coaches
*   Therapists
*   Anyone who operates on an appointment basis

### 2.7. Spotify
The Spotify module allows users to share their favorite music, playlists, or podcasts. This is a great way to personalize a profile and connect with others on a more personal level.

### 2.8. Files
The Files module enables users to share documents and other files directly from their profile. This can be used to distribute:
*   Resumes or CVs
*   Portfolios in PDF format
*   Marketing materials
*   Price lists

### 2.9. Forms
The Forms module allows users to create and share custom forms to collect information from their connections. This is useful for:
*   Lead generation
*   Feedback collection
*   Surveys
*   Event registrations

## 3. User Guides

This section provides step-by-step instructions for common tasks in the Connect application.

### 3.1. Creating Your Profile
1.  **Sign Up:** Create a new account using your email address or a social login.
2.  **Personal Information:** Fill in your name, job title, and a short bio.
3.  **Profile Picture:** Upload a professional headshot or a photo that represents you.
4.  **Save:** Once you're done, save your profile.

### 3.2. Adding Content to Your Profile
1.  **Navigate to the Connect Section:** From your dashboard, go to the "Connect" management page.
2.  **Choose a Module:** Select the type of content you want to add (e.g., a link, a social media profile, a file).
3.  **Fill in the Details:** A form will appear, prompting you for the necessary information (e.g., the URL for a link, the username for a social profile).
4.  **Save:** Click the "Save" or "Add" button to add the content to your profile.
5.  **Organize:** You can drag and drop the items to reorder them on your profile.

### 3.3. Sharing Your Profile
There are two primary ways to share your Connect profile:

#### Using an NFC-Enabled Device (e.g., a Connect Card)
1.  **Activate Your Device:** Follow the instructions that came with your device to link it to your Connect profile.
2.  **Tap to Share:** Simply tap your device on a compatible smartphone. A notification will appear on the other person's phone, which will open your Connect profile when tapped.

#### Using Your QR Code
1.  **Find Your QR Code:** In the Connect app, navigate to the "Share" or "QR Code" section.
2.  **Display Your Code:** Your unique QR code will be displayed on the screen.
3.  **Scan:** Have the other person open their camera app and point it at your QR code. A link to your profile will appear, which they can tap to open.

## 4. Technical Overview

This section provides a high-level overview of the technical architecture of the Connect product.

### 4.1. Frontend
The Connect frontend is a modern web application built with the following technologies:
*   **Next.js:** A React framework for building server-side rendered and statically generated web applications.
*   **React:** A JavaScript library for building user interfaces.
*   **TypeScript:** A typed superset of JavaScript that compiles to plain JavaScript.
*   **Tailwind CSS:** A utility-first CSS framework for rapidly building custom designs.

### 4.2. Backend
The backend is responsible for handling business logic, data storage, and API requests. The key components are:
*   **Next.js API Routes:** The same Next.js application that serves the frontend also handles API requests, providing a unified development experience.
*   **ISCEConnect Backend:** An external backend service that manages the core data and business logic for the Connect product.

### 4.3. API
The Connect product relies on a RESTful API to communicate between the frontend and the backend. The API is responsible for:
*   User authentication and authorization
*   Creating, retrieving, updating, and deleting user profiles and content
*   Handling device interactions (NFC and QR codes)

### 4.4. Data Models
The primary data models in the Connect product are:
*   **Profile:** Represents a user's profile, containing their personal information and a collection of content modules.
*   **Modules (Contact, Link, Video, etc.):** Each content type has its own data model, which is associated with a user's profile.
*   **Device:** Represents a physical NFC device that is linked to a user's profile.

## 5. Future Features

The following is a list of planned enhancements for the Connect product. These features are currently in development and will be released in a future update.

### General
*   **Bulk Actions:** The ability to select multiple items and perform actions (e.g., delete, restore, change visibility) on them at once.
*   **Long-Press Selection:** A mobile-friendly way to select items by long-pressing on them.
*   **Improved Organization:** Features like reordering, category grouping, and merging will be added to help users better organize their content.

### Modules
*   **Links:**
    *   Automatic category grouping
    *   Category management
*   **Videos:**
    *   Automatic detection of the video platform (e.g., YouTube, Vimeo)
*   **Meetings:**
    *   Filtering by provider (e.g., Google Meet, Zoom)
*   **Socials:**
    *   Grouping of social media profiles
*   **Files:**
    *   Permanent deletion of files
    *   Downloading of files
*   **Forms:**
    *   Custom form templates
    *   The ability to create templates from existing forms
*   **Contacts:**
    *   Merging of duplicate contacts
*   **Gallery:**
    *   Creation of photo albums
    *   Bulk deletion of photos
