# NextGen Roadmap — Features from wordcrammer-ng Not Yet Ported

This document catalogues every feature present in the original `wordcrammer-ng` project that has **not** been built in the current `wordcrammer` Next.js app. Each entry includes implementation notes, data model requirements, API routes, package dependencies, and estimated effort.

**Legend:** S = small (1-3 days), M = medium (1-2 weeks), L = large (2-4 weeks), XL = very large (1-2 months)

---

## 1. AI Voice Chat

An interactive conversational AI language partner — user speaks in their target language, the AI transcribes, generates a contextual response, and speaks it back.

**Source files:** `wordcrammer-ng/src/app/learn/llm-voice-chat/`, `wordcrammer-ng/src/app/api/llm-voice-chat/`

**Data flow:**
1. User records speech (WebM Opus, 15s limit, 48000Hz) via browser `MediaRecorder`
2. `POST /api/llm-voice-chat/stt` — sends audio blob to Google Cloud Speech-to-Text (`@google-cloud/speech`), returns transcript
3. `POST /api/llm-voice-chat/chat` — sends transcript + conversation history to LLM (was GPT-4o-mini), returns response text
4. `POST /api/tts` (or client-side Web Speech) — speaks AI response aloud

**System prompt:** Friendly language partner named "WordCrammer AI" — provides gentle corrections, maintains conversation in target language (70% target, 30% native).

**UI:** Chat message bubbles (user right-aligned, AI left-aligned), microphone button with recording indicator, language selector (matching topic voice), AI thinking/speaking animated states, auto-scroll.

**Packages needed:** `@google-cloud/speech`, `@daitanjs/speech` (or direct Google TTS), Cloudinary for audio caching

**New API routes:** `POST /api/ai/voice-chat/transcribe`, `POST /api/ai/voice-chat/converse`

**Effort: XL**

---

## 2. Pronunciation Feedback

Records user speech and scores pronunciation accuracy per-word using Google Cloud Speech Assessment.

**Source files:** `wordcrammer-ng/src/app/api/ai/pronunciation-feedback/`, `wordcrammer-ng/src/app/learn/ai-feedback/`

**Google Cloud Speech features used:**
- `enableWordTimeOffsets: true`
- `pronunciationAssessmentConfig.referenceText` (the target phrase)
- `model: 'latest_long'`, `interactionType: 'DICTATION'`, `microphoneDistance: 'NEARFIELD'`
- Returns: `accuracyScore` (overall 0-100), per-word `accuracyScore`

**UI:** Overall accuracy % display, commonly mispronounced words list, per-language average scores (linear progress bars), grammar issues with example corrections, vocabulary suggestions.

**Data model:** Store latest pronunciation feedback per word in `tblProgress` (needs new column for JSON feedback blob).

**Packages needed:** `@google-cloud/speech`

**New API routes:** `POST /api/ai/pronunciation-feedback`

**Effort: M**

---

## 3. YouTube Learning

Fetch YouTube video metadata and transcript, display interactive transcript with click-to-translate, build vocabulary from video.

**Source files:** `wordcrammer-ng/src/app/learn/youtube-learning/`, `wordcrammer-ng/src/app/api/youtube/get-video-data/`

**Data flow:**
1. User pastes YouTube URL
2. Extract videoId, fetch metadata + transcript via `youtube-transcript` library + YouTube Data API
3. Embed YouTube iframe player
4. Display transcript with clickable words
5. Click word → fetch translation via `/api/ai/complete-word`
6. Tooltip shows translation + "Add to Vocab" button
7. Vocabulary sidebar with add/remove/clear
8. "Save to New Set" stores in sessionStorage, redirects to /sets/edit

**Packages needed:** `youtube-transcript`, YouTube Data API key, `@daitanjs/knowledge` (or manual language list)

**New API routes:** `POST /api/youtube/get-video-data`

**Effort: M**

---

## 4. 3D World Map — Language Conquest

Interactive 3D globe using Three.js showing user progress by country/language, with hotspot density visualization and quest system.

**Source files:** `wordcrammer-ng/src/app/learn/world-map/`, `wordcrammer-ng/public/images/globe/`

**Components:**
- `@react-three/fiber` Canvas with `OrbitControls`
- Earth sphere with color/normal/specular texture maps (need 3 JPG textures in `public/`)
- `CountryOverlay` markers positioned on sphere
- Color-coded: green=mastered, gray=locked, orange-red=pronunciation hotspot density
- Click country → info panel with quest progress, "Start Quest" button

**Packages needed:** `@react-three/fiber`, `@react-three/drei`, `three`, 3 texture files (earth_atmos_2048.jpg, earth_normal_2048.jpg, earth_specular_2048.jpg)

**Texture files:** Copy from `wordcrammer-ng/public/images/globe/` to `public/images/globe/`

**New API routes:** `GET /api/analytics/hotspots` (pronunciation analytics by language)

**Effort: M**

---

## 5. Zen Mode — Mindful Learning

Configurable study session with timer, guided breathing exercises, ambient background music, and dark mode toggle.

**Source files:** `wordcrammer-ng/src/app/learn/zen-mode/`

**Features:**
- **Timer:** 5-60 minutes configurable, MM:SS countdown display
- **Breathing:** 4-7-8 cycle (inhale 4s → hold 4s → exhale 6s → hold 2s) with animated expanding/contracting circle
- **Music:** 3 ambient tracks (Forest Rain, Ocean Waves, Zen Flute) from royalty-free sources
- **Dark mode:** Local toggle, synced to global preference
- **Sound integration:** Toggle from global sound context

**No backend required** — all client-side state and logic.

**Packages needed:** None beyond existing (framer-motion for animations)

**New pages:** `(dashboard)/zen`

**Effort: S**

---

## 6. Video Roleplay — Premium AI Conversation

Real-time video call with an AI avatar for immersive language practice. Premium-gated feature.

**Source files:** `wordcrammer-ng/src/app/learn/video-roleplay/`

**Technology:**
- WebRTC (`RTCPeerConnection`, `MediaStream`, `getUserMedia`)
- WebSocket signaling server (placeholder: `ws://localhost:8080`)
- STUN: `stun:stun.l.google.com:19302`
- 3-step pipeline per turn: record speech → STT → LLM → TTS → play

**Scenarios:** Job Interview, Ordering Food, Booking a Flight — each with defined roles, language, and scenario prompt

**Premium gating:** Check `crammerProfile.roles?.includes('premium')`, redirect to `/pricing` if not. Requires Stripe subscriptions (feature #7) to be implemented first.

**Packages needed:** WebSocket server (`ws` or `socket.io`), STUN/TURN server config

**New infrastructure:** WebSocket signaling server (separate deployment)

**Effort: L** (requires Stripe subscriptions first)

---

## 7. Stripe Subscriptions

Premium subscription plans with Stripe Checkout, webhook handling, and role-based feature gating.

**Source files:** `wordcrammer-ng/src/app/api/stripe/`, `wordcrammer-ng/src/app/pricing/`, `wordcrammer-ng/src/app/subscription-success/`

**Plans:**
| Plan | Price | Stripe Price ID env var |
|------|-------|------------------------|
| Free | $0 | `NEXT_PUBLIC_STRIPE_FREE_PRICE_ID` |
| Premium Monthly | $9.99 | `STRIPE_PREMIUM_MONTHLY_PRICE_ID` |
| Premium Yearly | $99.99 | `STRIPE_PREMIUM_YEARLY_PRICE_ID` |

**API routes:**
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/stripe/create-checkout-session` | Create Stripe Checkout session |
| GET | `/api/stripe/verify-session` | Verify session after redirect |
| POST | `/api/stripe/webhook` | Handle subscription events |

**Webhook events handled:** `customer.subscription.created/updated/deleted`, `checkout.session.completed`, `invoice.payment_succeeded/failed`

**Data model:** Add `stripeCustomerId`, `stripeSubscriptionId`, `subscriptionStatus`, `roles` array to `tblCrammers`

**Premium gating:** Features check `roles.includes('premium')`. Currently applicable to Video Roleplay (feature #6).

**Packages needed:** `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js`

**Environment vars:**
```
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PREMIUM_MONTHLY_PRICE_ID=price_...
STRIPE_PREMIUM_YEARLY_PRICE_ID=price_...
```

**Effort: M**

---

## 8. Teacher / Classroom System

Full classroom management — teachers create classrooms, invite students, assign vocabulary sets, collect submissions, and provide feedback.

**Source files:** `wordcrammer-ng/src/app/api/teacher/`, `wordcrammer-ng/src/app/teacher/`, `wordcrammer-ng/src/models/Submission.js`

**Data model (new Prisma models needed):**
```
Classroom {
  id, teacherId, name, description, code (join code),
  students: Student[],
  assignedSets: AssignedSet[],
  createdAt
}
Submission {
  id, classroomId, studentId, teacherId,
  type: 'writing' | 'speaking' | 'quiz' | 'cram_session',
  content: text | audioUrl | score,
  status: 'submitted' | 'reviewed' | 'graded',
  feedback: { text, grade, givenAt, givenBy },
  relatedWordSetId,
  createdAt
}
```

**API routes (8 new):**

| Method | Route | Auth |
|--------|-------|------|
| GET/POST | `/api/teacher/classrooms` | Teacher |
| GET/PUT/DELETE | `/api/teacher/classrooms/[id]` | Teacher |
| POST | `/api/teacher/classrooms/[id]/assign-set` | Teacher |
| POST | `/api/teacher/classrooms/[id]/remove-set` | Teacher |
| POST | `/api/teacher/classrooms/join` | Crammer (student) |
| GET/POST | `/api/teacher/submissions` | Teacher/Crammer |
| POST | `/api/teacher/submissions/[id]/feedback` | Teacher |

**Pages:** Teacher dashboard, classroom list, classroom detail, set assign modal, submission review, student progress view

**Effort: XL**

---

## 9. Forum System

Community forums with categories, topics, posts, moderation queue, and role-based access.

**Source files:** `wordcrammer-ng/src/app/api/forum/`, `wordcrammer-ng/src/app/community/forums/`, `wordcrammer-ng/src/models/Forum*.js`

**Data model (new Prisma models needed):**
```
ForumCategory { id, name, slug, description, order, topicCount, postCount, lastActivity }
ForumTopic { id, title, slug, categoryId, createdById, body, postCount, viewCount, isLocked, isPinned }
ForumPost { id, topicId, categoryId, createdById, content, parentPostId, status, isDeleted }
Report { id, type, reportedContentId, reason, status }
```

**API routes:** Categories CRUD, Topics CRUD (per category), Posts CRUD, Latest posts, Moderation reports

**Pages:** Forum listing, category page, topic detail with posts, latest posts feed, moderation queue

**Effort: L**

---

## 10. User Profiles & Social

Public user profiles with bio, stats, achievements, and follower/following system.

**Source files:** `wordcrammer-ng/src/app/users/[userId]/`, `wordcrammer-ng/src/app/profile/edit/`

**Features:**
- Public profile page: avatar, display name, bio, language stats, XP/level, recent activity
- Profile editing: avatar upload (Cloudinary), bio, display name, language preferences
- Follow/unfollow system
- Activity feed (recent sets completed, achievements earned)

**Pages:** `users/[id]` (public), `profile/edit`

**Effort: M**

---

## 11. Content Import Tool

Bulk import vocabulary from external sources — CSV, text files, or pasted content.

**Source files:** `wordcrammer-ng/src/app/tools/import-content/`

**Features:**
- Paste delimited text (tab, comma, pipe)
- Upload CSV file
- Map columns to question/answer
- Preview before import
- Create new set or append to existing

**New API route:** `POST /api/tools/import-content`

**Effort: S**

---

## 12. Spaced Repetition System (SRS)

Full SRS algorithm with ease factors, review intervals, next review dates, and mastery tracking.

**Source files:** `wordcrammer-ng/src/models/UserSetProgress.js`

**Current state:** Our `tblProgress` only tracks flat `attempts` and `corrects` counts.

**SRS additions needed (new columns in `tblProgress`):**
- `easeFactor` (FLOAT, default 2.5)
- `interval` (INT, days until next review)
- `nextReviewDate` (DATETIME)
- `reviewCount` (INT)
- `lapses` (INT, times forgotten)

**Algorithm (simplified SM-2):**
- Correct on first try: increase interval (1 → 6 → 21 → 90 days), increase ease factor (+0.15)
- Correct on retry: keep interval, no ease factor change  
- Wrong: reset interval to 1, decrease ease factor (-0.20), increase lapses

**Integration:** Smart set generation (`generateSmartSet` in `lib/db/progress.ts`) should prioritize words past their `nextReviewDate`.

**Effort: M**

---

## 13. PWA Service Worker

Progressive Web App with offline caching, install prompt, and push notifications.

**Source files:** `wordcrammer-ng/public/sw.js`, `wordcrammer-ng/public/manifest.json`

**Currently:** We have `manifest.json` in the old CRA project but no service worker.

**Features to add:**
- Cache static assets (CSS, JS chunks, fonts, icons)
- Cache API responses for offline reading
- Offline fallback page
- Install prompt (`beforeinstallprompt` event)
- Push notification support (requires backend for subscription management)

**Packages needed:** Could use `next-pwa` or `serwist` for Next.js integration, or write a custom `sw.js`

**Files to create:** `public/sw.js`, update `layout.tsx` to register service worker

**Effort: S**

---

## 14. Onboarding Wizard

Multi-step guided onboarding for first-time users — collects name, language goals, experience level.

**Source files:** `wordcrammer-ng/src/app/onboarding/`

**Steps:**
1. Welcome — app introduction
2. Name — display name and alter ego
3. Language — choose source and target languages
4. Goals — learning purpose (travel, work, exam, fun)
5. Level — self-assessed proficiency (beginner, intermediate, advanced)

**Data storage:** Update `tblCrammers` with `goals` and `proficiencyLevel` columns.

**UX:** Progress indicator, back/next navigation, skip option, animated transitions between steps.

**Pages:** `(auth)/onboarding` — redirect here on first login, then to `/sets` when complete.

**Effort: S**

---

## 15. Dictionary / Lookup

Quick word lookup powered by the already-existing `/api/ai/complete-word` endpoint.

**Source files:** `wordcrammer-ng/src/app/resources/dictionary/`

**Features:**
- Text input for word/phrase
- Language selector (source → target)
- Real-time translation + example sentences (calls `/api/ai/complete-word`)
- Pronunciation audio (Web Speech API)
- Save to vocabulary set
- Search history (localStorage)

**Pages:** `resources/dictionary`

**No new API routes needed** — reuses `/api/ai/complete-word`

**Effort: S**

---

## 16. Admin Tools

Moderation dashboard for reviewing reported content, managing users, viewing app settings.

**Source files:** `wordcrammer-ng/src/app/api/reports/`, admin pages scattered in wordcrammer-ng

**Features:**
- Report review queue (reported words, sets, forum posts)
- User management (ban, warn, view stats)
- App-wide settings (maintenance mode, feature flags)

**New API routes:** CRUD for reports, user management endpoints

**Role system:** Add `admin` role to `tblCrammers.roles`

**Effort: M**

---

## Summary by Effort

| Effort | Features |
|--------|----------|
| **S** (1-3 days) | Zen Mode, Content Import, PWA Service Worker, Onboarding Wizard, Dictionary |
| **M** (1-2 weeks) | Pronunciation Feedback, YouTube Learning, 3D World Map, Stripe Subscriptions, User Profiles, SRS, Admin Tools |
| **L** (2-4 weeks) | Video Roleplay (needs Stripe first), Forum System |
| **XL** (1-2 months) | AI Voice Chat, Teacher/Classroom System |

## Dependency Graph

```
Stripe Subscriptions ──> Video Roleplay
                    └──> Teacher/Classroom (premium classrooms)

SRS ──> Smart Set Generation (already exists, extend with SRS)

Dictionary ──> YouTube Learning (reuse complete-word endpoint)
         └──> All practice modes (inline word lookup)

Pronunciation Feedback ──> AI Voice Chat (reuse Google STT)
                     └──> 3D World Map (hotspot data source)
```
