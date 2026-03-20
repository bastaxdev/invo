# Invo

**Invoicing app for freelancers working with Norwegian clients**

Live: [invo-pn.vercel.app](https://invo-pn.vercel.app)

---

## The Problem

Polish freelancers billing Norwegian clients need to handle MVA (Norwegian VAT), multi-currency invoices, and bilingual PDF documents. Most invoicing tools don't support this combination well.

## Features

- **Auth** — signup/login via Supabase
- **Client management** — store client details, org numbers, countries
- **Invoice management** — multi-currency (PLN/NOK/EUR/USD), VAT/MVA support, status tracking
- **Bilingual PDFs** — Polish/Norwegian/English PDF invoices with correct MVA reverse charge notice
- **Email delivery** — send invoices as PDF attachments via Resend
- **Templates** — reusable invoice templates
- **Analytics** — revenue tracking with live currency conversion
- **MVA tracking** — monitors rolling 12-month NOK revenue against the 50,000 NOK registration threshold
- **Dark mode**

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database/Auth:** Supabase
- **Styling:** Tailwind CSS + shadcn/ui
- **PDF Generation:** @react-pdf/renderer
- **Email:** Resend

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/bastaxdev/invo.git
cd invo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Fill in the values in `.env.local` (see below).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `RESEND_API_KEY` | Resend API key for email sending |

See `.env.example` for the full template.

## Database

Supabase PostgreSQL with 6 tables: `user_profiles`, `clients`, `invoices`, `invoice_items`, `invoice_templates`, `template_items`. Row Level Security enabled on all tables.
