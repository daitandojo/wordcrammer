# WordCrammer

AI-powered language vocabulary learning app. Master 20 languages with smart flashcards, text-to-speech, progress tracking, and 5 practice modes.

## Core Cramming Flow

The heart of WordCrammer: **40 vocabulary cards are presented. For each card, the user types the translation. Words answered correctly twice are removed from the set. The session ends when all cards are mastered.**

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MySQL (via Prisma 7)
- **Auth**: NextAuth.js v5 (Credentials + JWT + bcrypt)
- **AI**: DeepSeek v4 Flash
- **Styling**: Tailwind CSS
- **Gamification**: XP system (20 levels), per-session awards

## Getting Started

```bash
cp .env.example .env   # Edit with your credentials
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

### API
| Route | Description |
|-------|-------------|
| `/api/auth/[...nextauth]` | Authentication |
| `/api/topics` | List/create topics |
| `/api/topics/[code]` | Single topic with content |
| `/api/content` | Content CRUD + report |
| `/api/progress` | User progress + smart set generation |
| `/api/progress/xp` | Award XP + level calculation |
| `/api/users` | List/create users |
| `/api/users/[username]` | Single user |
| `/api/users/me` | Current user XP/level |
| `/api/leaderboard` | Top scorers with levels |
| `/api/ai/complete-word` | Translate + example sentences |
| `/api/ai/generate-words` | Generate vocabulary sets from prompts |
| `/api/ai/sentence-analysis` | Grammar breakdown + POS tagging |
| `/api/ai/writing-suggestions` | Writing feedback + vocab suggestions |
| `/api/ai/generate-distractors` | MCQ distractor generation |

### Pages
| Route | Mode | What it does |
|-------|------|-------------|
| `/` | — | Landing page (hero, leaderboard, 20 languages) |
| `/login` | — | Login with credentials |
| `/register` | — | Registration with bcrypt |
| `/sets` | — | Browse topics with practice mode buttons |
| `/sets/edit` | — | Create/edit vocabulary sets |
| `/cram` | **Core** | Type translation, 2 corrects = mastered, 40 cards |
| `/analysis` | — | Progress breakdown per topic |
| `/practice/mc/[code]` | **MC** | 4-option multiple choice with AI distractors |
| `/practice/listen/[code]` | **Listen** | Hear TTS, type what you hear |
| `/practice/gap-texts/[code]` | **Gap** | Click correct answer from word bank |
| `/practice/sentence-build/[code]` | **Build** | Click words in correct order |
| `/practice/writing` | **Write** | Freeform writing with AI feedback |

### Practice Modes Comparison
| Mode | Interaction | AI Used | Best For |
|------|------------|---------|----------|
| Flashcard Cram | Type answer | — | Core vocabulary memorization |
| Multiple Choice | Select from 4 | Distractors | Quick recognition |
| Listen & Type | Hear then type | — | Listening comprehension |
| Fill the Gap | Click from bank | — | Word recall |
| Sentence Build | Order words | — | Grammar + word order |
| Guided Writing | Freeform text | Writing feedback | Composition practice |
