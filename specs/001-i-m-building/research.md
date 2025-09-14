# Research Findings: Ham Radio Study Site

## JSON Structure for Q&A Data
**Decision**: Use a nested object structure with categories as keys.

```json
{
  "categories": {
    "3": {
      "name": "Category 3",
      "questions": [
        {
          "id": 1,
          "question": "What is the frequency range for HF?",
          "options": ["3-30 MHz", "30-300 MHz", "300-3000 MHz", "3-3000 GHz"],
          "correctIndex": 0
        }
      ]
    },
    "2": { ... },
    "1": { ... }
  }
}
```

**Rationale**: Simple lookup by category ID, extensible for future categories, matches the requirement for 3 sets.

**Alternatives Considered**:
- Array of categories: `[{ id: "3", name: "...", questions: [...] }]` - more verbose, requires filtering.
- Flat structure: All questions in one array with category field - harder to separate by category.

## Loading JSON in Next.js 15
**Decision**: Use static imports for JSON files placed in `public/data/`.

**Rationale**: Next.js 15 supports importing JSON directly, ensures data is bundled and available at build time, no runtime fetching needed since data is static.

**Alternatives Considered**:
- Fetch from API routes: Unnecessary complexity for static data.
- Dynamic imports: Overkill for small data sets.

## Responsive UI Patterns for Educational Sites
**Decision**: Use Tailwind CSS with mobile-first approach, card-based layouts for questions, clean typography.

**Rationale**: Tailwind provides utility classes for rapid responsive design, cards are intuitive for Q&A, modern look appeals to users.

**Alternatives Considered**:
- Custom CSS: More maintenance.
- Component libraries like Material UI: Adds dependencies, may not be as sleek.