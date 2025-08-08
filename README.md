# Aster DEX fees Calculator

A beautiful, interactive calculator for comparing trading fees and savings on Aster DEX versus other platforms.

## Features

- **Interactive Fee Calculator**: Compare your trading costs across different platforms
- **Beautiful UI**: Modern, dark-themed interface with smooth animations
- **Real-time Calculations**: See savings instantly as you adjust parameters
- **Social Sharing**: Share your results on Twitter
- **Responsive Design**: Works perfectly on desktop and mobile devices

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **shadcn/ui** - Modern component library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
aster-dex-calculator/
├── app/
│   ├── globals.css          # Global styles and Tailwind imports
│   ├── layout.tsx           # Root layout component
│   └── page.tsx            # Main calculator page
├── components/
│   └── ui/                 # Reusable UI components
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── progress.tsx
│       ├── slider.tsx
│       └── tabs.tsx
├── lib/
│   └── utils.ts            # Utility functions
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Features

### Calculator Functionality
- Adjust monthly trading volume with interactive slider
- Compare fees across multiple platforms (GMX, Hyperliquid, dYdX, Binance)
- View savings in different timeframes (monthly, yearly, 5 years)
- Calculate bridge costs and total savings

### UI/UX Features
- Dark theme with custom color palette
- Smooth animations and transitions
- Responsive design for all screen sizes
- Interactive elements with hover effects
- Progress bars and visual indicators

### Social Features
- Share results on Twitter
- Copy direct links to results
- Direct link to Aster DEX platform

## Customization

The calculator uses a custom color scheme that can be modified in the component styles:

- Primary background: `#181C14`
- Secondary background: `#3C3D37`
- Accent colors: `#697565`, `#ECDFCC`
- Text colors: `#ECDFCC` (light), `#697565` (muted)

## License

This project is open source and available under the MIT License.
