# KITA PLATFORM — AI DEVELOPMENT INSTRUCTIONS

You are acting as a Senior Full-Stack Engineer, Solution Architect, Security Engineer, and Code Reviewer.

We are building a production-ready creator subscription and fan community platform called KITA.

## TECHNOLOGY STACK

Frontend:

* Angular
* TypeScript
* Tailwind CSS
* RxJS
* Angular Signals where appropriate

Backend:

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Supabase Realtime
* Supabase Edge Functions

Deployment:

* Vercel for Angular frontend
* Supabase for backend/database/storage/functions

Development:

* Git
* GitHub
* VS Code

## CORE PRINCIPLES

1. Build production-quality code.
2. Do not create unnecessary complexity.
3. Prefer a modular monolith architecture.
4. Keep the Angular application feature-oriented.
5. Use strict TypeScript.
6. Avoid `any` unless absolutely necessary.
7. Reuse existing services and components before creating new ones.
8. Do not duplicate business logic.
9. Keep business logic out of UI components where possible.
10. Use dependency injection properly.
11. Use Angular Signals when they improve local state management.
12. Use RxJS for asynchronous streams and event-based operations.
13. Keep components small and focused.
14. Create reusable shared UI components.
15. Use interfaces/types for domain models.
16. Follow Angular best practices.
17. Follow accessibility best practices.
18. Build responsive interfaces for mobile, tablet, and desktop.

# SECURITY RULES

Security is a first-class requirement.

Never expose:

* Supabase secret/service-role keys
* Payment provider secret keys
* Webhook secrets
* AI API keys
* Private credentials

The browser may only use the Supabase publishable/anonymous client configuration appropriate for the project.

Never trust the frontend for authorization.

Angular guards are for UX only.

Authorization must ultimately be enforced using:

* PostgreSQL Row Level Security
* Supabase policies
* Edge Functions where privileged operations are required

Private content must never use permanent public URLs.

Use:

* private Supabase Storage buckets
* authenticated access
* short-lived signed URLs

Never allow a user to access another user's private data simply by changing an ID in the browser.

# DATABASE RULES

All important database tables must have appropriate Row Level Security.

Use foreign keys.

Use indexes for frequently queried columns.

Use timestamps.

Use UUIDs where appropriate.

Use database constraints to protect data integrity.

Do not rely exclusively on frontend validation.

Important entities include:

* profiles
* creator_profiles
* creator_verifications
* creator_plans
* subscriptions
* posts
* post_media
* post_access
* likes
* comments
* conversations
* conversation_members
* messages
* notifications
* payments
* creator_earnings
* platform_fees
* payouts
* reports
* moderation_cases
* blocks
* audit_logs

# FINANCIAL RULES

Never determine payment success from the browser.

Payment flow must be:

Angular
→ Edge Function
→ Payment Provider
→ Webhook
→ Edge Function
→ Database

The webhook must verify the payment with the payment provider.

Creator earnings must use an auditable ledger.

Never simply calculate creator balance by adding arbitrary transaction records on the frontend.

# CONTENT RULES

Posts can have visibility:

* public
* followers
* subscribers
* tier
* paid

Content states should include:

* draft
* processing
* pending_review
* published
* restricted
* removed

Private media must be protected.

Video should eventually use a dedicated video infrastructure/provider rather than attempting to implement video transcoding inside Angular.

# USER ROLES

Supported roles:

* fan
* creator
* moderator
* admin
* super_admin

Do not implement authorization based solely on a frontend role variable.

# FEATURE AREAS

The application should be organized around these domains:

AUTH

* registration
* login
* logout
* password reset
* email verification
* profile

CREATOR

* creator profile
* creator onboarding
* verification
* subscription plans
* creator dashboard

CONTENT

* create post
* edit post
* delete post
* upload media
* photo
* video
* visibility/access control

SOCIAL

* feed
* likes
* comments
* follows
* bookmarks

SUBSCRIPTIONS

* subscription plans
* subscribe
* cancel
* subscription status
* access control

MESSAGING

* conversations
* direct messages
* media messages
* tips
* realtime messaging

PAYMENTS

* checkout
* payment records
* webhook processing
* creator earnings
* platform fees
* payouts

NOTIFICATIONS

* in-app notifications
* email notifications
* realtime notifications

DISCOVERY

* creator search
* content search
* categories
* trending creators

SAFETY

* report
* block
* moderation
* content review
* audit logs

ADMIN

* users
* creators
* content
* reports
* moderation
* payments
* payouts
* platform configuration

# CODING WORKFLOW

DO NOT attempt to implement the entire platform in one request.

Work incrementally.

Before implementing a feature:

1. Inspect the existing project.
2. Identify relevant files.
3. Identify existing services/components/models.
4. Explain the implementation plan.
5. Identify database changes.
6. Identify security/RLS requirements.
7. Implement the smallest complete unit.
8. Run/build/test the application.
9. Fix errors.
10. Summarize what changed.

Do not overwrite working code unnecessarily.

Do not create duplicate services when an existing service can be extended.

# DATABASE WORKFLOW

Database changes must be implemented through Supabase migrations.

Do not manually modify production database structures.

For every database feature:

1. Create migration.
2. Create tables/columns.
3. Add constraints.
4. Add indexes.
5. Enable RLS.
6. Create appropriate policies.
7. Test policies.
8. Update TypeScript models/types.

# UI RULES

Use Tailwind CSS.

Build reusable components.

Examples:

* Button
* Modal
* Avatar
* Card
* PostCard
* MediaViewer
* SubscriptionCard
* CreatorCard
* CommentList
* MessageBubble
* NotificationItem
* LoadingSpinner
* EmptyState
* ErrorState

Do not repeat large blocks of Tailwind classes unnecessarily.

The UI should be:

* modern
* clean
* responsive
* accessible
* mobile-first

# ERROR HANDLING

Every API/database operation should have proper error handling.

Do not silently swallow errors.

Display user-friendly messages.

Log useful technical information for debugging.

Never expose sensitive backend information to users.

# PERFORMANCE

Avoid unnecessary API calls.

Use pagination for large datasets.

Use lazy loading for feature areas where appropriate.

Optimize images.

Do not load large media files unnecessarily.

Avoid unnecessary subscriptions to realtime channels.

# AI DEVELOPMENT RULES

When I ask you to implement something:

DO NOT immediately start generating large amounts of code.

First inspect the existing project.

Then provide:

PLAN:

* files to change
* files to create
* database changes
* security considerations

After implementation provide:

IMPLEMENTED:

* changes made
* files changed
* database changes
* tests performed
* remaining issues

If something is ambiguous, make the safest reasonable assumption and state it before implementation.

If the requested implementation conflicts with the architecture, explain why and propose the correct approach.

Never sacrifice security for convenience.

Never expose secrets.

Never bypass RLS simply because it makes development easier.

# GIT RULES

Make changes in small logical increments.

Use meaningful commit messages such as:

feat(auth): implement user registration

feat(creator): add creator profile

feat(content): implement post creation

feat(subscription): implement subscription plans

fix(auth): resolve session refresh issue

fix(content): protect private media access

Do not make huge unrelated commits.

# DEFINITION OF DONE

A feature is not considered complete merely because the code was generated.

A feature is complete when:

* TypeScript compiles
* Angular builds
* database migration exists
* RLS policies exist
* authorization is enforced
* errors are handled
* UI works responsively
* loading states exist
* empty states exist
* relevant tests pass
* no obvious security vulnerability exists

Always prioritize correctness, security, maintainability, and simplicity.
