# Data Model: Ham Radio Study Site

## Entities

### Category
- **id**: string (e.g., "3", "2", "1")
- **name**: string (e.g., "Category 3")
- **questions**: Question[]

**Validation**: id must be one of "1", "2", "3"; name not empty; questions array not empty.

### Question
- **id**: number (unique within category)
- **question**: string (the question text)
- **options**: string[] (array of 4 answer options)
- **correctIndex**: number (0-3, index of correct answer)

**Validation**: question not empty; options length === 4; correctIndex between 0-3.

## Relationships
- Category 1:N Question (one category has many questions)

## State Transitions
- No complex states; data is static.

## Notes
- Data loaded from JSON files matching the structure defined in research.md.
- No mutations; read-only data.