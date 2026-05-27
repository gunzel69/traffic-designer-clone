# TGS AI Victoria - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 18+ 
- pnpm (or npm/yarn)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/traffic-designer-clone.git
cd traffic-designer-clone

# 2. Install dependencies
pnpm install

# 3. Start development server
pnpm dev
```

The application will be available at **http://localhost:3001**

## 📁 Project Structure

```
client/src/
├── pages/              # All page components
│   ├── Home.tsx       # Landing page
│   ├── Features.tsx   # Feature showcase
│   ├── Pricing.tsx    # Pricing plans
│   ├── About.tsx      # Company info
│   ├── Contact.tsx    # Contact form
│   ├── AppDashboard.tsx    # Project dashboard
│   ├── ProjectView.tsx     # Project details
│   ├── TgsEditor.tsx       # Main editor
│   └── ...
├── components/        # Reusable components
├── lib/              # Utilities
└── index.css         # Global styles
```

## 🎨 Design System

### Colors
- **Primary**: Orange (`#f97316`) & Amber (`#fbbf24`)
- **Background**: Dark (`#0d0d0f`)
- **Text**: White & Gray tones

### Key Classes
- `.glass` - Glassmorphic effect
- `.glow-orange` - Orange glow effect
- `.animate-float` - Floating animation

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Run production build
pnpm check            # Type checking
pnpm format           # Format code
pnpm test             # Run tests

# Database
pnpm db:push          # Run migrations
```

## 📄 Pages Overview

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Landing page with hero & features |
| Features | `/features` | Detailed feature showcase |
| Pricing | `/pricing` | 3-tier pricing plans |
| About | `/about` | Company mission & values |
| Contact | `/contact` | Demo request & inquiries |
| Dashboard | `/app` | Project management |
| Project | `/app/project/:id` | Project details |
| Editor | `/app/editor/:planId` | TGS editor |

## 🎯 Key Features

### Marketing Site
- Responsive design
- Dark theme with orange accents
- Smooth animations
- Mobile-friendly

### Application
- Project management
- Interactive map editor
- AI TGS generation
- Compliance checking
- PDF export
- Team collaboration

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Connect GitHub and deploy automatically
vercel deploy
```

### Docker
```bash
pnpm build
docker build -t tgs-ai .
docker run -p 3001:3001 tgs-ai
```

## 📚 Documentation

- [Full Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./server/README.md)
- [Component Library](./client/src/components/ui/README.md)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run `pnpm check` and `pnpm test`
4. Submit a pull request

## 📞 Support

- **Email**: hello@tgsai.com.au
- **Phone**: +61 3 9000 0000
- **Website**: https://tgsai.com.au

## 📝 License

MIT License - See LICENSE file

---

**Ready to build?** Start with `pnpm dev` and explore the codebase! 🎉
