# Database Conversion Guide: D1 to MySQL

This document outlines the remaining database query conversions needed in `src/worker/index.ts`.

## Conversion Patterns

### Pattern 1: SELECT Queries

**Before (D1):**
```typescript
const { results } = await c.env.DB.prepare(
  "SELECT * FROM users WHERE user_id = ?"
).bind(userId).all();
```

**After (MySQL):**
```typescript
const results = await query(
  "SELECT * FROM users WHERE user_id = ?",
  [userId]
);
```

### Pattern 2: INSERT/UPDATE/DELETE Queries

**Before (D1):**
```typescript
await c.env.DB.prepare(
  "INSERT INTO users (name, email) VALUES (?, ?)"
).bind(name, email).run();
```

**After (MySQL):**
```typescript
await execute(
  "INSERT INTO users (name, email) VALUES (?, ?)",
  [name, email]
);
```

### Pattern 3: ON CONFLICT → ON DUPLICATE KEY UPDATE

**Before (D1/SQLite):**
```sql
INSERT INTO users (user_id, email) 
VALUES (?, ?)
ON CONFLICT(user_id) DO UPDATE SET email = ?
```

**After (MySQL):**
```sql
INSERT INTO users (user_id, email) 
VALUES (?, ?)
ON DUPLICATE KEY UPDATE email = ?
```

### Pattern 4: datetime('now') → NOW()

**Before (D1/SQLite):**
```sql
WHERE expires_at > datetime('now')
```

**After (MySQL):**
```sql
WHERE expires_at > NOW()
```

### Pattern 5: Getting Last Insert ID

**Before (D1):**
```typescript
const result = await c.env.DB.prepare("INSERT ...").bind(...).run();
const newId = result.meta.last_row_id;
```

**After (MySQL):**
```typescript
const result = await execute("INSERT ...", [...]);
const newId = result.insertId;
```

## Remaining Conversions Needed

The following endpoints still need conversion (search for `c.env.DB.prepare`):

1. **Admin endpoints** (lines ~890-1200)
   - `/api/admin/stats`
   - `/api/admin/users`
   - `/api/admin/users/:userId`
   - `/api/admin/users/:userId/tasks`
   - `/api/admin/tasks/:id`
   - `/api/admin/registration-codes`
   - `/api/admin/analytics`

2. **Task endpoints** (lines ~1325-1500)
   - `/api/tasks`
   - `/api/tasks/:id`
   - `/api/tasks/:taskId/subtasks`

3. **Focus session endpoints** (lines ~1616-1750)
   - `/api/focus-sessions`
   - `/api/focus-sessions/:id`

4. **Settings endpoints** (lines ~1747-1880)
   - `/api/settings`

5. **Analytics endpoints** (lines ~1881-2100)
   - `/api/analytics`
   - `/api/dashboard-stats`
   - `/api/streak`

6. **Goal endpoints** (lines ~2118-2315)
   - `/api/goals`

7. **Email signup endpoint** (lines ~2316-2430)
   - `/api/email-signup`

8. **Helper functions** (lines ~2976-3145)
   - `mergeContiguousSessions()`
   - `updateTaskActualTime()`
   - `syncToNotionIfEnabled()`

## Quick Find & Replace

You can use these regex patterns to find remaining instances:

1. Find all D1 queries:
   ```
   c\.env\.DB\.prepare
   ```

2. Find all `.bind()` calls:
   ```
   \.bind\(
   ```

3. Find all `.all()` calls:
   ```
   \.all\(\)
   ```

4. Find all `.run()` calls:
   ```
   \.run\(\)
   ```

## Automated Conversion Script

You can create a script to help with bulk conversions, but manual review is recommended to ensure correctness.

## Testing After Conversion

After converting each endpoint:

1. Test the endpoint with a real request
2. Check database logs for SQL errors
3. Verify data is correctly inserted/updated/retrieved
4. Check for any MySQL-specific syntax issues

## Common Issues

1. **Boolean values**: MySQL uses `0`/`1` or `BOOLEAN` type. Ensure boolean values are converted properly.
2. **Date handling**: Use `NOW()` instead of `datetime('now')` or `CURRENT_TIMESTAMP`
3. **LIMIT/OFFSET**: MySQL syntax is the same as SQLite
4. **JSON handling**: MySQL 5.7+ supports JSON type, but you may need to use `JSON_EXTRACT()` or store as TEXT

## Status

- ✅ Auth endpoints - Converted
- ✅ Profile endpoints - Converted  
- ✅ Admin login/logout - Converted
- ⏳ Remaining endpoints - Need conversion (see list above)

