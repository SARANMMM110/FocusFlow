# Database Tables Overview

The FocusFlow application requires **14 tables** to function properly. Here's what each table does:

## Core Tables

1. **users** - User accounts (email, name, subscription plan, etc.)
2. **user_sessions** - Active user sessions for authentication
3. **user_profiles** - Extended user profile information
4. **user_settings** - User preferences and settings

## Task Management

5. **tasks** - User tasks/to-dos
6. **subtasks** - Subtasks for each task

## Focus Sessions

7. **focus_sessions** - Tracked focus/pomodoro sessions
8. **focus_distractions** - Track distractions during focus sessions

## Goals & Analytics

9. **user_goals** - User-defined goals (focus minutes, tasks, etc.)

## Admin & Registration

10. **admin_users** - Admin accounts
11. **admin_sessions** - Admin session tokens
12. **registration_codes** - Special registration codes for pro/enterprise plans

## Integrations

13. **email_signups** - Email waitlist signups
14. **user_calendar_connections** - Google Calendar integration tokens

## Creating the Tables

Run this command to create all tables:

```bash
npm run setup:db
```

Or manually import the schema:

```bash
mysql -u root -p focusFlow < database/schema.sql
```

## Table Relationships

- `users` is the main table - all other tables reference it
- `tasks` → `subtasks` (one-to-many)
- `tasks` → `focus_sessions` (one-to-many)
- `users` → `user_profiles`, `user_settings`, `user_sessions` (one-to-one)
- `users` → `tasks`, `focus_sessions`, `user_goals` (one-to-many)

## Required Data

No initial data is required - all tables start empty. The app will create:
- User records when users sign up
- Settings records when users first access settings
- Profile records when users update their profile

