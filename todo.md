# Project TODO

## Marketing Pages (Completed)
- [x] Home page with hero, stats, features, testimonials, FAQ, case studies, blog
- [x] Features page with detailed feature sections
- [x] Pricing page with 3 plans and AUD pricing
- [x] About page with mission and philosophy
- [x] Contact page with forms
- [x] Dark theme with orange/amber accents
- [x] Layout component with navbar and footer
- [x] Responsive design

## Full-Stack Upgrade
- [x] Upgrade to web-db-user (tRPC + auth + database)
- [x] Fix Home.tsx useAuth import conflict
- [x] Push database schema for TGS projects

## Functional Platform - Database & Schema
- [x] Create projects table (user projects with metadata)
- [x] Create tgs_plans table with JSON columns for sign/cone placements
- [x] Create compliance_checks table (compliance check results)
- [x] Create uploaded_photos table (site photos for AI analysis)
- [x] Create pdf_exports table
- [x] Run database migrations

## Functional Platform - TGS Editor (Core Feature)
- [x] Create protected /app route with authentication gate
- [x] Build project list/management page (AppDashboard)
- [x] Build interactive map editor using Leaflet.js + OpenStreetMap (dark tiles)
- [x] AI-generated sign/cone placements rendered on map
- [x] Map legend for plan elements
- [x] Plan settings side panel with work type, speed zone, lanes
- [x] Compliance results side panel with issues/warnings display
- [x] Additional context textarea for AI generation
- [x] Connect "Start Free Trial" buttons to /app (authenticated)
- [x] Build layer controls (tram lines, pedestrian crossings, etc.)
- [x] Manual sign drag-and-drop placement on map
- [x] Drawing tools for custom road geometry

## Functional Platform - AI Features
- [x] AI TGS generation endpoint (using built-in LLM)
- [x] AI compliance checking logic
- [x] AI photo analysis upload and processing
- [x] AI assistant panel in editor

## Functional Platform - Export & Collaboration
- [x] PDF export of TGS plans
- [x] Project sharing and collaboration
- [x] Revision history

## Fixes & Gaps
- [ ] Add draggable markers for manual sign placement (drag-and-drop)
- [ ] Add /app/join/:token route for accepting share links
- [ ] Show shared projects in dashboard for collaborators

## Integration
- [x] Wire up contact form to send notifications
- [x] Add vitest tests for key procedures (16 tests passing)
