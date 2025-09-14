# Ham Radio Study Site

A modern, responsive study site for ham radio license categories 3, 2, and 1 in Portugal. Built with Next.js 15.5, TypeScript, and Tailwind CSS. Data is loaded from static JSON files.

## Quickstart

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Place JSON data files in `public/data/` (category1.json, category2.json, category3.json)
4. Run development server: `npm run dev`
5. Open http://localhost:3000

### Testing
- Run tests: `npm test`
- Run E2E tests: `npm run test:e2e`

### Features
- Browse questions by category
- Take timed exams
- Responsive design

### Validation
- Ensure data loads correctly
- Timer works in exam mode
- Scoring is accurate
