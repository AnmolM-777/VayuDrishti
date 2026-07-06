# TheCleanUpCompany

Building a neighbourhood-level pollution map combining citizen-uploaded photos of smoke/dust, local sensor readings, and satellite imagery. The system will automatically detect hidden pollution hotspots, predict air quality spikes over the next 24 hours, and alert municipal teams so they can deploy resources exactly where needed.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Linting | ESLint 9 |
| Formatting | Prettier 3 |
| Runtime | Node.js 18+ |

## Getting Started

### Prerequisites

- **Node.js** v18.18 or later — [download here](https://nodejs.org/)
- **npm** v9 or later (ships with Node.js)
- **Git**

### 1. Clone the repository

```bash
git clone https://github.com/AnmolM-777/TheCleanUpCompany.git
cd TheCleanUpCompany
```

### 2. Install dependencies

```bash
npm install
```

This reads `package.json` and installs all required packages into `node_modules/`. The exact versions are locked in `package-lock.json` so every team member gets identical dependencies.

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. See the `[REQUIRED]` and `[OPTIONAL]` tags inside `.env.example` for guidance. **Never commit `.env.local` to Git.**

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint on all files |
| `npm run lint:fix` | Run ESLint and auto-fix issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without modifying files |
| `npm run type-check` | Run TypeScript compiler check (no emit) |

## Project Structure

```
TheCleanUpCompany/
├── src/
│   └── app/              # Next.js App Router (pages, layouts)
│       ├── layout.tsx     # Root layout
│       ├── page.tsx       # Home page
│       ├── globals.css    # Tailwind CSS + design tokens
│       └── favicon.ico
├── public/                # Static assets
├── .env.example           # Environment variable template
├── next.config.ts         # Next.js configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.mjs      # ESLint configuration
├── postcss.config.mjs     # PostCSS (Tailwind) configuration
├── .prettierrc.json       # Prettier configuration
├── package.json           # Dependencies and scripts
└── package-lock.json      # Locked dependency versions
```

## License

[MIT](./LICENSE)
