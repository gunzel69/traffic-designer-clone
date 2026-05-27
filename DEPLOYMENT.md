# TGS AI Victoria - Deployment Guide

## Project Overview

TGS AI Victoria is a modern SaaS platform for AI-powered Traffic Guidance Scheme (TGS) generation and management in Victoria, Australia. The platform combines intelligent automation with compliance checking to help traffic management professionals create safer, compliant traffic plans faster.

## Technology Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling with custom design system
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **tRPC** - Type-safe API communication
- **Leaflet** - Interactive mapping
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Shadcn/ui** - Component library

### Backend
- **Express** - HTTP server
- **tRPC** - API framework
- **Drizzle ORM** - Database layer
- **MySQL/TiDB** - Database
- **AWS S3** - File storage
- **OAuth** - Authentication

### Development Tools
- **pnpm** - Package manager
- **esbuild** - JavaScript bundler
- **Vitest** - Testing framework
- **TypeScript** - Type checking

## Project Structure

```
traffic-designer-clone/
├── client/                    # Frontend React application
│   ├── src/
│   │   ├── pages/            # Page components (Home, Features, Pricing, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── _core/            # Core utilities (hooks, auth)
│   │   ├── lib/              # Library utilities (tRPC client)
│   │   └── index.css         # Global styles
│   └── index.html
├── server/                    # Backend application
│   ├── _core/                # Core server utilities
│   ├── routers.ts            # tRPC router definitions
│   └── index.ts              # Server entry point
├── shared/                    # Shared types and utilities
├── drizzle/                   # Database migrations
└── package.json
```

## Key Features

### Marketing Pages
- **Home** - Hero section with features, stats, testimonials, FAQ
- **Features** - Detailed feature breakdowns with workflows
- **Pricing** - 3-tier pricing model with monthly/yearly toggle
- **About** - Company mission, values, timeline, stats
- **Contact** - Demo request and inquiry forms

### Application Pages
- **Dashboard** - Project management and creation
- **Project View** - TGS plan management and sharing
- **TGS Editor** - Interactive map-based plan editor with:
  - AI TGS generation
  - Compliance checking
  - PDF export
  - Photo analysis
  - Team collaboration
  - Layer controls (tram, pedestrian)

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
pnpm db:push
```

### Development

```bash
# Start development server
pnpm dev

# Server runs on http://localhost:3001
# Frontend accessible at http://localhost:3001
```

### Production Build

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Design System

### Colors
- **Background**: Dark charcoal (`#0d0d0f`)
- **Primary Accent**: Orange (`#f97316`) and Amber (`#fbbf24`)
- **Text**: White and gray tones for hierarchy
- **Safety**: Yellow accents for warnings/alerts

### Components
- **Glassmorphism**: `.glass` and `.glass-strong` utilities
- **Glow Effects**: `.glow-orange` and `.glow-orange-strong`
- **Animations**: Fade-in, slide-in, float, pulse effects

### Typography
- **Display**: Space Grotesk (headings)
- **Body**: Inter (content)

## API Routes

### Public Routes
- `GET /` - Home page
- `GET /features` - Features page
- `GET /pricing` - Pricing page
- `GET /about` - About page
- `GET /contact` - Contact page

### Protected Routes
- `GET /app` - Dashboard
- `GET /app/project/:id` - Project view
- `GET /app/editor/:planId` - TGS editor
- `GET /app/join/:token` - Join shared project

### tRPC Endpoints
- `projects.*` - Project CRUD operations
- `plans.*` - TGS plan management
- `ai.*` - AI generation and compliance
- `shares.*` - Project sharing
- `contact.submit` - Contact form submission

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy - automatic on push to main

### Docker
```bash
pnpm build
docker build -t tgs-ai-victoria .
docker run -p 3001:3001 tgs-ai-victoria
```

### Railway/Render
1. Connect GitHub repository
2. Set environment variables
3. Deploy

## Environment Variables

```env
# OAuth
OAUTH_SERVER_URL=https://oauth.example.com

# Database
DATABASE_URL=mysql://user:password@host:3306/tgs_ai

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET=tgs-ai-storage
AWS_REGION=ap-southeast-2

# API
VITE_API_URL=http://localhost:3001
```

## Performance

- **Bundle Size**: ~500KB gzipped (main app)
- **Lighthouse Scores**: 90+ (Performance, Accessibility, Best Practices)
- **Core Web Vitals**: Optimized for fast loading

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Testing

```bash
# Run tests
pnpm test

# Type checking
pnpm check
```

## Contributing

1. Create feature branch
2. Make changes
3. Run tests and type checking
4. Submit pull request

## Support

- Email: hello@tgsai.com.au
- Phone: +61 3 9000 0000
- Location: Melbourne, Victoria, Australia

## License

MIT License - See LICENSE file for details

## Compliance

- AS 1742.3 Compliant
- VicRoads Standards Compliant
- Australian Privacy Principles
- WCAG 2.1 Level AA Accessibility
