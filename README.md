# Invo

**Bilingual invoicing for Polish freelancers with Norwegian clients**

## 🎯 The Problem We Solve

Creating a bilingual (PL/NO) PDF invoice with the correct MVA "reverse charge" (odwrotne obciążenie) note is annoying. Invo makes it simple.

## 🚀 Features

- ✅ **Authentication** - Secure signup/login with Supabase
- ✅ **Client Management** - Store Norwegian client details (Name, Org. nr., Address)
- ✅ **Invoice Management** - Create, edit, and manage invoices
- ✅ **Bilingual PDFs** - Professional PL/NO invoices with correct MVA reverse charge notice

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Backend/Auth:** Supabase
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **PDF Generation:** @react-pdf/renderer

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd invo
```
invo
├─ app
│  ├─ actions
│  │  ├─ analytics.ts
│  │  ├─ auth.ts
│  │  ├─ clients.ts
│  │  ├─ email.ts
│  │  ├─ invoice-status.ts
│  │  ├─ invoices.ts
│  │  ├─ settings.ts
│  │  └─ templates.ts
│  ├─ api
│  │  └─ templates
│  │     └─ [id]
│  │        └─ route.ts
│  ├─ dashboard
│  │  ├─ analytics
│  │  │  └─ page.tsx
│  │  ├─ clients
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  └─ [id]
│  │  │     └─ edit
│  │  │        └─ page.tsx
│  │  ├─ invoices
│  │  │  ├─ new
│  │  │  │  └─ page.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ status-badge.tsx
│  │  │  └─ [id]
│  │  │     ├─ edit
│  │  │     │  └─ page.tsx
│  │  │     └─ page.tsx
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ settings
│  │  │  ├─ logo-upload.tsx
│  │  │  └─ page.tsx
│  │  └─ templates
│  │     ├─ new
│  │     │  └─ page.tsx
│  │     ├─ page.tsx
│  │     └─ [id]
│  │        └─ edit
│  │           └─ page.tsx
│  ├─ favicon.ico
│  ├─ globals.css
│  ├─ layout.tsx
│  ├─ login
│  │  └─ page.tsx
│  ├─ page.tsx
│  └─ signup
│     └─ page.tsx
├─ components
│  ├─ analytics
│  │  ├─ analytics-client.tsx
│  │  └─ currency-selector.tsx
│  ├─ clients
│  │  └─ delete-client-button.tsx
│  ├─ invoices
│  │  ├─ delete-invoice-button.tsx
│  │  ├─ generate-pdf-button.tsx
│  │  ├─ invoice-form-simplified.tsx
│  │  ├─ invoice-form.tsx
│  │  ├─ invoice-pdf.tsx
│  │  ├─ overdue-invoice-dialog.tsx
│  │  ├─ send-email-dialog.tsx
│  │  ├─ status-badge.tsx
│  │  └─ update-status-dialog.tsx
│  ├─ layout
│  │  ├─ navbar.tsx
│  │  └─ profile-guard.tsx
│  ├─ settings
│  │  └─ logo-upload.tsx
│  ├─ templates
│  │  ├─ delete-template-button.tsx
│  │  └─ template-form.tsx
│  └─ ui
│     ├─ alert-dialog.tsx
│     ├─ avatar.tsx
│     ├─ badge.tsx
│     ├─ button.tsx
│     ├─ card.tsx
│     ├─ checkbox.tsx
│     ├─ confirm-dialog.tsx
│     ├─ dialog.tsx
│     ├─ dropdown-menu.tsx
│     ├─ form.tsx
│     ├─ input.tsx
│     ├─ label.tsx
│     ├─ select.tsx
│     ├─ table.tsx
│     └─ textarea.tsx
├─ components.json
├─ eslint.config.mjs
├─ lib
│  ├─ currency.ts
│  ├─ formatters.ts
│  ├─ pdf-generator.ts
│  ├─ supabase
│  │  ├─ client.ts
│  │  ├─ middleware.ts
│  │  └─ server.ts
│  ├─ types
│  │  └─ database.types.ts
│  └─ utils.ts
├─ middleware.ts
├─ next.config.ts
├─ package-lock.json
├─ package.json
├─ postcss.config.mjs
├─ public
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
└─ tsconfig.json

```