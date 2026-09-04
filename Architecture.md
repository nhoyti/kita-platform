# Philippine Creator Subscription Platform — Architecture

## Overview

This document describes a production-oriented architecture for a creator subscription platform targeting the Philippine market, inspired by platforms such as OnlyFans but designed as an independent product.

Preferred stack:

- **Frontend:** Angular
- **Styling:** Tailwind CSS
- **Hosting:** Vercel
- **Backend:** Supabase
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Authorization:** Supabase Row Level Security (RLS)
- **Server-side logic:** Supabase Edge Functions
- **Realtime:** Supabase Realtime
- **Storage:** Supabase Storage for images/files
- **Video:** Mux, Cloudflare Stream, or equivalent
- **Payments:** Provider abstraction layer
- **AI:** External AI APIs + optional Supabase pgvector
- **Email:** Resend/Postmark or equivalent
- **Monitoring:** Sentry
- **Analytics:** PostHog or equivalent

---

# 1. High-Level Architecture

```text
                         ┌─────────────────────────────┐
                         │          USERS              │
                         │                             │
                         │ Fans │ Creators │ Admins    │
                         └──────────────┬──────────────┘
                                        │
                                        │ HTTPS
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                         VERCEL                                  │
│                                                                 │
│   Angular                                                       │
│   Tailwind CSS                                                  │
│                                                                 │
│   ┌────────────┐ ┌─────────────┐ ┌──────────────┐              │
│   │ Fan App    │ │ Creator App │ │ Admin Portal │              │
│   └────────────┘ └─────────────┘ └──────────────┘              │
│                                                                 │
│   Auth Guards │ Interceptors │ Signals │ Lazy Loading          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                     Supabase SDK / HTTPS
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                │
│                                                                 │
│   ┌─────────────────┐       ┌─────────────────────────────┐    │
│   │ Supabase Auth   │       │ PostgreSQL                  │    │
│   │                 │       │                             │    │
│   │ Email           │       │ profiles                    │    │
│   │ Google          │       │ creators                    │    │
│   │ Phone/OTP       │       │ posts                       │    │
│   │ MFA             │       │ subscriptions               │    │
│   └─────────────────┘       │ payments                    │    │
│                             │ messages                    │    │
│   ┌─────────────────┐       │ comments                    │    │
│   │ Supabase RLS    │◄─────►│ likes                       │    │
│   │ Authorization   │       │ notifications               │    │
│   └─────────────────┘       │ reports                     │    │
│                             │ moderation_cases            │    │
│   ┌─────────────────┐       │ creator_earnings            │    │
│   │ Realtime        │       │ payouts                     │    │
│   │ Messaging       │       └─────────────────────────────┘    │
│   │ Notifications   │                                          │
│   └─────────────────┘       ┌─────────────────────────────┐    │
│                             │ Storage                     │    │
│   ┌─────────────────┐       │                             │    │
│   │ Edge Functions  │       │ avatars                     │    │
│   │                 │       │ post-images                 │    │
│   │ payments        │       │ attachments                 │    │
│   │ webhooks        │       │ verification-documents     │    │
│   │ signed URLs     │       └─────────────────────────────┘    │
│   │ moderation      │                                          │
│   │ notifications   │                                          │
│   │ creator payouts │                                          │
│   └────────┬────────┘                                          │
└────────────┼────────────────────────────────────────────────────┘
             │
             ├──────────────► Payment Provider
             │
             ├──────────────► Email / SMS Provider
             │
             ├──────────────► AI Moderation
             │
             └──────────────► Video Processing / CDN
                                      │
                                      ▼
                         ┌────────────────────────┐
                         │ Video / Media CDN      │
                         │                        │
                         │ Upload                 │
                         │ Transcoding            │
                         │ HLS streaming          │
                         │ Thumbnails             │
                         │ Signed playback        │
                         └────────────────────────┘
```

---

# 2. Frontend Architecture

Use a feature/domain-oriented Angular structure instead of organizing the application only by technical type.

```text
src/app/

├── core/
│   ├── auth/
│   ├── guards/
│   ├── interceptors/
│   ├── services/
│   └── models/
│
├── shared/
│   ├── ui/
│   ├── directives/
│   ├── pipes/
│   └── utilities/
│
├── features/
│
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│
│   ├── feed/
│   │
│   ├── creator/
│   │   ├── profile/
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── earnings/
│   │   ├── subscribers/
│   │   └── payouts/
│   │
│   ├── content/
│   │   ├── create-post/
│   │   ├── post-view/
│   │   └── media-player/
│   │
│   ├── subscription/
│   │
│   ├── payments/
│   │
│   ├── messaging/
│   │
│   ├── notifications/
│   │
│   ├── discovery/
│   │
│   ├── settings/
│   │
│   └── admin/
│       ├── dashboard/
│       ├── users/
│       ├── creators/
│       ├── reports/
│       ├── verification/
│       ├── moderation/
│       └── transactions/
│
└── app.routes.ts
```

### Recommended Angular technologies

| Area | Recommendation |
|---|---|
| Framework | Angular |
| Styling | Tailwind CSS |
| State | Angular Signals |
| Complex global state | NgRx Signal Store, when necessary |
| Forms | Angular Reactive Forms |
| Routing | Angular Router |
| API | Supabase JS + Edge Functions |
| Loading strategy | Lazy-loaded routes |
| Components | Reusable shared UI components |

Avoid introducing NgRx everywhere. Use Angular Signals for local and feature state, and add NgRx only where application-wide state complexity justifies it.

---

# 3. Supabase Backend

Supabase should initially serve as the primary backend.

```text
PostgreSQL
     +
Authentication
     +
Storage
     +
Realtime
     +
Edge Functions
     +
Row Level Security
```

The application should rely heavily on PostgreSQL Row Level Security (RLS).

Authorization should happen at the database/backend level rather than relying on Angular route guards alone.

Example:

```text
Fan requests private post
          │
          ▼
Is user authenticated?
          │
          ▼
Does user have active subscription?
          │
          ▼
Does user have access to the creator's tier?
          │
          ▼
Is user blocked?
          │
          ▼
Return content / deny access
```

Angular guards improve user experience, but they must never be treated as the security boundary.

---

# 4. Database Architecture

Core relationships:

```text
auth.users
    │
    │ 1:1
    ▼
profiles
    │
    ├──────── creator_profiles
    │
    ├──────── subscriptions
    │
    ├──────── comments
    │
    ├──────── likes
    │
    ├──────── messages
    │
    └──────── reports


creator_profiles
    │
    ├──────── creator_plans
    │
    ├──────── posts
    │             │
    │             ├──── post_media
    │             ├──── comments
    │             └──── likes
    │
    ├──────── subscriptions
    ├──────── payments
    ├──────── creator_earnings
    └──────── payouts
```

---

# 5. Core Database Tables

| Table | Purpose |
|---|---|
| `profiles` | Base account information |
| `creator_profiles` | Creator-specific profile information |
| `creator_verifications` | Creator verification workflow |
| `creator_plans` | Subscription tiers |
| `subscriptions` | Fan-to-creator subscriptions |
| `posts` | Creator content |
| `post_media` | Images/videos attached to posts |
| `post_access` | Pay-per-view or special access |
| `likes` | Likes |
| `comments` | Comments |
| `conversations` | Private conversations |
| `conversation_members` | Participants in conversations |
| `messages` | Chat messages |
| `notifications` | In-app notifications |
| `payments` | Customer payment transactions |
| `creator_earnings` | Creator accounting ledger |
| `platform_fees` | Platform commission |
| `payouts` | Creator payout requests |
| `reports` | User/content reports |
| `moderation_cases` | Moderation investigations |
| `blocks` | User blocking |
| `audit_logs` | Administrative audit trail |

---

# 6. Profiles

Supabase already provides:

```text
auth.users
```

Create an application profile table:

```text
profiles

id uuid PK
username varchar UNIQUE
display_name varchar
avatar_url text
bio text
role enum
account_status enum
created_at timestamptz
updated_at timestamptz
```

Recommended roles:

```text
fan
creator
moderator
admin
super_admin
```

Keep role and account status separate.

Example statuses:

```text
active
suspended
banned
pending_verification
```

---

# 7. Creator Profiles

```text
creator_profiles

id uuid
user_id uuid

display_name varchar
about text
cover_image text

verification_status

subscription_enabled boolean
monthly_price decimal

subscriber_count bigint
total_posts bigint

created_at
updated_at
```

Do not use subscriber counts or balances as your authoritative financial records.

Use dedicated ledger and transaction tables for financial information.

---

# 8. Creator Subscription Plans

Do not hard-code one subscription price.

Use:

```text
creator_plans

id
creator_id

name
description

price
currency

billing_period

is_active
```

Example:

```text
Supporter
₱199/month

Premium
₱399/month

VIP
₱999/month
```

This allows future support for annual plans and multiple creator tiers.

---

# 9. Subscription Architecture

Use a subscription record instead of a simple `isSubscribed` boolean.

```text
subscriptions

id
fan_id
creator_id
plan_id

payment_provider
provider_subscription_id

status

current_period_start
current_period_end

cancel_at_period_end

created_at
updated_at
```

Statuses:

```text
pending
active
past_due
cancelled
expired
refunded
```

One fan can subscribe to many creators.

---

# 10. Content Architecture

Keep post metadata separate from media.

```text
posts

id
creator_id

caption

visibility
status

published_at
created_at
updated_at
```

Visibility options:

```text
public
followers
subscribers
tier
paid
```

Media:

```text
post_media

id
post_id

media_type
storage_provider
storage_path

thumbnail_url

width
height
duration

processing_status

sort_order
```

A single post can therefore contain:

```text
Text
+
Photo
+
Photo
+
Video
```

---

# 11. Private Media Security

Never rely on hiding private media URLs in Angular.

Use private storage and temporary signed URLs.

```text
Fan
 │
 │ View Post
 ▼
Angular
 │
 │ authenticated request
 ▼
Edge Function
 │
 ├── Is fan logged in?
 ├── Is subscription active?
 ├── Is creator active?
 ├── Does fan have tier access?
 └── Is fan blocked?
          │
          ▼
Generate temporary media URL
          │
          ▼
Fan receives media
```

Prefer short-lived signed URLs rather than permanent public URLs.

---

# 12. Video Architecture

Supabase Storage is suitable for many images and files, but a creator platform with significant video traffic should use a dedicated video service.

Possible services:

- Mux
- Cloudflare Stream
- Another managed video platform

Recommended flow:

```text
Creator
   │
   │ upload request
   ▼
Supabase Edge Function
   │
   │ authenticated upload URL
   ▼
Video Service
   │
   ├─ transcode
   ├─ thumbnails
   ├─ optimize
   └─ CDN
        │
        ▼
Webhook
        │
        ▼
Supabase
        │
        ▼
post_media
```

Use HLS/adaptive streaming rather than serving large original video files directly.

---

# 13. Payment Architecture

Never let the Angular frontend decide that a payment succeeded.

Incorrect:

```text
Angular
   ↓
Payment successful
   ↓
Unlock content
```

Correct:

```text
Fan
 │
 │ Subscribe
 ▼
Angular
 │
 ▼
Supabase Edge Function
 │
 │ create checkout
 ▼
Payment Provider
 │
 ▼
Customer completes payment
 │
 ▼
Payment Provider Webhook
 │
 ▼
Supabase Edge Function
 │
 │ verify webhook
 ▼
payments
 │
 ├── subscription = active
 ├── creator earnings
 └── platform commission
```

The verified webhook should be the source of truth.

---

# 14. Payment Provider Abstraction

Do not tightly couple the entire application to one payment provider.

Create a payment interface:

```text
PaymentProvider

createCustomer()
createCheckout()
createSubscription()
cancelSubscription()
refundPayment()
createPayout()
handleWebhook()
```

Then providers can be implemented behind the interface:

```text
PaymentProvider
       │
       ├── Provider A
       │
       ├── Provider B
       │
       └── Provider C
```

This is particularly important because payment providers have different acceptable-use and content policies.

Before development reaches the payment stage, confirm that your actual business model and content policy are compatible with your intended payment provider.

---

# 15. Creator Earnings and Payouts

Separate customer payments from creator payouts.

Example:

```text
Fan payment
      │
      ▼
₱500 gross
      │
      ├── Platform fee
      ├── Payment processing fee
      └── Creator earning
                │
                ▼
          Pending balance
                │
          settlement period
                │
                ▼
          Available balance
                │
          creator requests
                │
                ▼
             Payout
```

Recommended tables:

```text
creator_balances
creator_earnings
payout_requests
payouts
payout_events
```

Payout states:

```text
pending
available
requested
processing
paid
failed
reversed
```

Maintain an immutable earnings ledger for accounting.

---

# 16. Messaging

Supabase Realtime is suitable for an initial messaging system.

```text
conversations

id
created_at
```

```text
conversation_members

conversation_id
user_id
```

```text
messages

id
conversation_id
sender_id

message_type
content

media_id

created_at
deleted_at
```

Flow:

```text
Creator
   ↕
Supabase Realtime
   ↕
messages table
   ↕
Supabase Realtime
   ↕
Fan
```

Initial message types:

```text
text
image
tip
system_message
```

---

# 17. Notifications

Use a centralized notification system.

Events can include:

```text
New subscriber
New message
Post liked
New comment
Payout completed
Creator posted
Subscription expiring
```

Architecture:

```text
Event
  │
  ▼
notification_events
  │
  ▼
Notification Service
  │
  ├── In-app
  ├── Email
  └── Push
```

Table:

```text
notifications

id
user_id

type
entity_type
entity_id

title
body

read_at
created_at
```

---

# 18. AI Architecture

AI can be used both for development and inside the application.

## AI-assisted development

Use a workflow like:

```text
User Story
   ↓
Database Migration
   ↓
RLS Policy
   ↓
Edge Function
   ↓
Angular Service
   ↓
Angular UI
   ↓
Tests
```

Do not ask an AI coding agent to generate the entire platform in one shot.

Build one vertical feature at a time.

Recommended repository:

```text
creator-platform/

├── apps/
│   └── web/
│       └── Angular
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── functions/
│
├── packages/
│   ├── models/
│   └── utilities/
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── security.md
│   └── features.md
│
└── README.md
```

---

# 19. AI Features Inside the Platform

Potential AI capabilities:

```text
Content moderation
Spam detection
Fraud detection
Creator caption assistance
Automatic tagging
Search
Recommendations
Customer support
Translation
Creator analytics insights
```

For semantic search/recommendations, Supabase PostgreSQL can be extended with vector capabilities.

Do not start with an advanced AI recommendation engine.

An MVP can use:

```text
Subscribed creators
+
Most followed creators
+
Most engaged posts
+
Recently active creators
+
Categories followed by user
```

Add AI recommendations after sufficient user behavior data exists.

---

# 20. Content Moderation

Moderation must exist before launch.

Recommended flow:

```text
Content uploaded
       │
       ▼
status = processing
       │
       ├───────────────┐
       ▼               ▼
Automated scan      Metadata checks
       │
       ▼
Moderation rules
       │
    ┌──┴──┐
    ▼     ▼
 Allow   Review
          │
          ▼
      Moderator
          │
      ┌───┴────┐
      ▼        ▼
   Approve   Reject
```

Content states:

```text
draft
processing
pending_review
published
restricted
removed
```

Do not automatically publish every uploaded item if your platform allows higher-risk user-generated content.

---

# 21. Reporting System

Users should be able to report:

```text
posts
profiles
messages
comments
```

Table:

```text
reports

id
reporter_id

target_type
target_id

reason
description

status
priority

assigned_to

created_at
resolved_at
```

Possible categories:

```text
harassment
impersonation
copyright
spam
non-consensual-content
underage-person
illegal-content
other
```

Reports involving potential child exploitation should have a dedicated escalation path rather than being treated as an ordinary moderation ticket.

---

# 22. Creator Verification

If creators can monetize content, build creator verification as a separate subsystem.

```text
Account
   ↓
Creator application
   ↓
Identity / age verification
   ↓
Manual / automated review
   ↓
Payment / payout verification
   ↓
Approved Creator
```

Keep verification records separate from public creator profiles.

Recommended table:

```text
creator_verifications

id
creator_id
status
verification_provider
verified_at
created_at
updated_at
```

Sensitive verification data should have highly restricted access policies.

---

# 23. Privacy Architecture

Separate information according to sensitivity.

```text
PUBLIC

username
avatar
bio
public posts


PRIVATE

email
phone
settings
messages


HIGHLY RESTRICTED

verification records
payment information
moderation evidence
fraud information
security information
```

These categories should not have identical RLS policies.

Design the application around Philippine data privacy requirements from the beginning.

---

# 24. Admin Portal

Treat the admin portal as a separate product area.

```text
/admin

Dashboard

Users

Creators
 ├─ pending verification
 ├─ approved
 ├─ suspended
 └─ banned

Content

Moderation

Reports

Payments

Refunds

Payouts

Subscriptions

Audit Logs

Platform Settings
```

Every important administrative action should generate an audit log.

Example:

```text
Admin X
   ↓
Suspended Creator Y
   ↓
Reason: moderation violation
   ↓
audit_logs
```

---

# 25. Security Architecture

The browser should only receive the public/publishable Supabase key.

Never expose:

```text
Supabase service/secret key
Payment API secret
Webhook secret
Email API key
AI API key
Other private credentials
```

Secrets should remain server-side, especially in Supabase Edge Function secrets/environment configuration.

Correct:

```text
Angular
      │
      │ publishable key
      ▼
Supabase
```

For privileged operations:

```text
Angular
   ↓
Edge Function
   ↓
Third-party API
```

---

# 26. RLS Strategy

RLS should define who can read and modify data.

Example:

```text
profiles

SELECT
Public profiles → allowed

UPDATE
Owner → allowed
Others → denied
```

Posts:

```text
Public post
→ anyone

Subscriber post
→ active subscribers

Creator
→ own posts

Admin
→ moderation access
```

Messages:

```text
SELECT
Only members of the conversation
```

Subscriptions:

```text
Fan
→ own subscriptions

Creator
→ subscriptions belonging to creator

Others
→ denied
```

Payouts:

```text
Creator
→ own payouts

Admin
→ authorized access

Others
→ denied
```

RLS should remain the database-level authorization boundary.

---

# 27. Recommended Full Stack

| Area | Technology |
|---|---|
| Frontend | Angular |
| UI | Tailwind CSS |
| Hosting | Vercel |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Authorization | Supabase RLS |
| Backend APIs | Supabase Edge Functions |
| Realtime | Supabase Realtime |
| Images | Supabase Storage |
| Video | Mux / Cloudflare Stream / equivalent |
| Search | PostgreSQL Full Text Search |
| AI Search | pgvector later |
| Payments | Payment provider abstraction |
| Email | Resend/Postmark/equivalent |
| Error tracking | Sentry |
| Analytics | PostHog/equivalent |
| CI/CD | GitHub + Vercel + Supabase CLI |

---

# 28. MVP Scope

Do not attempt to build every feature initially.

## Phase 1 — MVP

Build:

1. Fan registration/login
2. Creator registration
3. Creator verification
4. Creator profile
5. Follow creator
6. Create text/photo/video post
7. Public posts
8. Subscriber-only posts
9. Monthly subscriptions
10. Creator earnings
11. Creator payouts
12. Likes/comments
13. Fan ↔ creator messaging
14. Report/block functionality
15. Admin moderation dashboard

## Phase 2

Add:

1. Tips
2. Pay-per-view posts
3. Pay-per-view messages
4. Creator subscription tiers
5. Bookmarks
6. Notifications
7. Creator analytics
8. Search/discovery
9. Promotional discounts
10. Creator referral program

## Phase 3

Add:

1. Livestreaming
2. AI recommendations
3. AI creator assistant
4. Advanced fraud detection
5. Native iOS
6. Native Android
7. Creator agencies
8. Multiple currencies
9. International creators

---

# 29. Recommended Production Architecture

```text
                         INTERNET
                             │
                             ▼
                    ┌─────────────────┐
                    │     VERCEL      │
                    │                 │
                    │ Angular         │
                    │ Tailwind        │
                    │ CDN             │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼

   Supabase Client      Edge Functions     Video CDN

          │                  │                  │
          ▼                  ▼                  │
 ┌─────────────────────────────────────┐        │
 │             SUPABASE                │        │
 │                                     │        │
 │ Auth                                │        │
 │ PostgreSQL                          │◄───────┘
 │ RLS                                 │ webhook
 │ Realtime                            │
 │ Storage                             │
 │ Edge Functions                      │
 │ pgvector                            │
 │                                     │
 └──────────────────┬──────────────────┘
                    │
          ┌─────────┼──────────────┐
          │         │              │
          ▼         ▼              ▼

      Payments     Email         AI APIs
          │
          ▼
     Webhooks
          │
          ▼
      Supabase
```

---

# 30. Key Architectural Decisions

## Decision 1 — Keep the first backend simple

Start with:

```text
Angular
+
Supabase
+
Vercel
+
Edge Functions
```

Do not immediately introduce:

```text
NestJS
Kubernetes
Redis
Kafka
Microservices
```

Add those only when actual scale and operational requirements justify them.

## Decision 2 — Keep business logic server-side

Anything involving:

- Payments
- Payouts
- Subscription activation
- Private media authorization
- Moderation decisions
- Webhooks
- Fraud checks
- Sensitive data

should not rely exclusively on Angular.

## Decision 3 — Treat media separately

Images can use Supabase Storage.

Video should eventually use a dedicated video infrastructure provider.

## Decision 4 — Treat payments as replaceable

Build a payment abstraction from the beginning.

## Decision 5 — Make RLS mandatory

Every sensitive table should have explicit RLS policies.

## Decision 6 — Build moderation before growth

Moderation, reporting, creator verification, blocking and audit logs should be part of the foundational architecture.

---

# 31. Recommended Development Order

Build vertically instead of completing the entire database first.

### Sprint 1 — Foundation

```text
Angular
Tailwind
Vercel
Supabase
Authentication
Profiles
RLS
```

### Sprint 2 — Creator

```text
Creator profile
Creator dashboard
Creator verification
Creator settings
```

### Sprint 3 — Content

```text
Post creation
Image upload
Private storage
Public posts
Subscriber posts
Feed
```

### Sprint 4 — Subscriptions

```text
Creator plans
Subscription flow
Payment integration
Payment webhooks
Subscription status
Access control
```

### Sprint 5 — Social

```text
Likes
Comments
Follow
Notifications
```

### Sprint 6 — Messaging

```text
Conversations
Messages
Realtime
Media attachments
```

### Sprint 7 — Money

```text
Creator ledger
Platform commission
Payout requests
Payout processing
Financial audit trail
```

### Sprint 8 — Safety

```text
Reports
Blocks
Moderation
Creator verification
Audit logs
Fraud controls
```

### Sprint 9 — Admin

```text
Admin dashboard
User management
Creator management
Content moderation
Reports
Payments
Payouts
Analytics
```

### Sprint 10 — Production

```text
Testing
Security review
Performance
Monitoring
Logging
Backups
Rate limiting
Error handling
Load testing
```

---

# 32. Important Philippines-Specific Considerations

Before implementing monetization, verify:

- Philippine business registration requirements
- Tax obligations
- Data Privacy Act compliance
- Privacy policy
- Terms of service
- Content policy
- Creator agreement
- Copyright/takedown process
- Age/identity verification requirements
- Payment provider acceptable-use policies
- Creator payout requirements
- Refund and chargeback policy
- Fraud prevention
- Record retention requirements

If explicit adult content is part of the intended business model, perform a dedicated legal and payment-provider review before building the monetization layer. Payment providers can prohibit pornography or sexually explicit/mature content, so the business model and payment architecture need to be designed together.

---

# 33. Final Recommendation

The simplest production architecture for this project is:

```text
                         ┌───────────────┐
                         │    Angular    │
                         │  Tailwind CSS │
                         └───────┬───────┘
                                 │
                                 ▼
                         ┌───────────────┐
                         │    Vercel     │
                         └───────┬───────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────────┐          ┌──────────────┐
             │   Supabase   │          │ Edge         │
             │              │          │ Functions    │
             │ Auth         │          │              │
             │ PostgreSQL   │          │ Payments     │
             │ RLS          │          │ Webhooks     │
             │ Storage      │          │ Media Auth   │
             │ Realtime     │          │ Moderation   │
             └──────┬───────┘          └──────┬───────┘
                    │                         │
                    └────────────┬────────────┘
                                 │
                  ┌──────────────┼──────────────┐
                  ▼              ▼              ▼
              Payments         Video           AI
              Provider         CDN             APIs
```

This gives you a relatively simple MVP while preserving clear boundaries for security, payments, media, moderation and future scaling.
