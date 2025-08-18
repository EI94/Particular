# 🏠 Particular - Gestione Immobiliare Professionale

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/EI94/Particular)
[![Live Demo](https://img.shields.io/badge/demo-particular--pi.vercel.app-blue)](https://particular-pi.vercel.app)

> Piattaforma moderna per la gestione professionale di immobili in affitto con automazione pagamenti e dashboard completa.

## 🚀 Funzionalità

### ✅ Sistema Autenticazione Completo
- **Login/Signup** con Firebase Auth
- **Reset password** via email
- **Protezione route** automatica
- **Gestione errori** in italiano

### 🎨 Design System Moderno
- **Shadcn/ui** components
- **Tailwind CSS** styling
- **Responsive design**
- **Dark/Light mode** ready

### 📝 Validazione Form Avanzata
- **Zod + React Hook Form**
- **Validazione real-time**
- **IBAN italiano** validation
- **Telefono italiano** validation

### 🏢 Gestione Immobiliare
- **Onboarding wizard** multi-step
- **Dashboard** con statistiche
- **Gestione inquilini** e contratti
- **Pagamenti automatici** Stripe + SEPA

### 💳 Sistema Pagamenti
- **Stripe Checkout** integration
- **SEPA mandates** (mock per MVP)
- **Webhook handling**
- **Cron jobs** automatici

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui, Radix UI
- **Backend**: Express.js, Firebase Functions
- **Database**: Firebase Firestore
- **Auth**: Firebase Authentication
- **Payments**: Stripe API
- **Monorepo**: Turborepo + pnpm

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm
- Firebase project
- Stripe account (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/EI94/Particular.git
cd Particular

# Install dependencies
pnpm install

# Setup environment variables
cp web/firebase.config.example.ts web/firebase.config.ts
# Edit with your Firebase config

# Start development server
pnpm dev:web
```

### Environment Setup

Create `web/.env.local`:

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 📁 Project Structure

```
Particular/
├── web/                    # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & services
│   │   └── types/         # TypeScript types
├── functions/             # Express.js API
├── packages/
│   ├── ui/               # Shared components
│   ├── eslint-config/    # ESLint configs
│   └── typescript-config/ # TS configs
└── firestore.rules       # Database security
```

## 🎯 User Journey

### 1. 🏠 Homepage
- Modern landing page
- Feature showcase
- Call-to-action buttons

### 2. 📝 Registration
- Email/password signup
- Form validation
- Firebase user creation

### 3. 🎬 Onboarding (4 steps)
1. **Owner info** - Personal details
2. **Property** - Address, rooms, rent
3. **Tenant** - Tenant information
4. **Contract** - Payment setup, SEPA

### 4. 📊 Dashboard
- Payment overview
- Statistics cards
- Real-time updates
- Quick actions

## 🔧 Development

### Available Scripts

```bash
# Development
pnpm dev:web          # Start web app
pnpm dev:functions    # Start API server
pnpm dev              # Start all apps

# Build
pnpm build            # Build all apps
pnpm build:web        # Build web app only

# Linting & Type Checking
pnpm lint             # Lint all packages
pnpm check-types      # TypeScript check
```

### Database Schema

```typescript
// Collections
owners/     { email, name, createdAt }
units/      { ownerId, address, rooms, m2, rentAsk, status }
tenants/    { ownerId, name, email, phone }
leases/     { unitId, tenantId, rent, dueDay, paymentMethod }
payments/   { leaseId, amount, dueDate, status, provider }
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Manual Deploy
```bash
pnpm build
# Deploy dist/ folder to your hosting
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Firebase](https://firebase.google.com/) - Backend services
- [Shadcn/ui](https://ui.shadcn.com/) - UI components
- [Turborepo](https://turbo.build/) - Monorepo tooling
- [Vercel](https://vercel.com/) - Deployment platform

---

Made with ❤️ by [EI94](https://github.com/EI94)

🔗 **Live Demo**: [particular-pi.vercel.app](https://particular-pi.vercel.app)