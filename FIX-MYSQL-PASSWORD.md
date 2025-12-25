# Fix MySQL Password Error

## Error: `Access denied for user 'root'@'localhost' (using password: YES)`

This means the password in your `.env` file doesn't match your MySQL root password.

## Solution Options

### Option 1: Update .env with Correct Password

1. **Find your MySQL root password**
   - If you set it during installation, use that
   - If you don't remember, you may need to reset it

2. **Update `.env` file:**
   ```env
   DB_PASSWORD=your_actual_mysql_password
   ```

3. **Restart the backend server**

### Option 2: If MySQL Root Has No Password

If your MySQL root user has no password:

1. **Update `.env` file:**
   ```env
   DB_PASSWORD=
   ```
   (Leave it empty)

2. **Restart the backend server**

### Option 3: Reset MySQL Root Password

If you don't know the password:

**Windows (using MySQL Workbench or Command Line):**

1. Stop MySQL service:
   ```powershell
   net stop mysql
   ```

2. Start MySQL in safe mode (skip grant tables):
   ```powershell
   mysqld --skip-grant-tables
   ```

3. In another terminal, connect:
   ```bash
   mysql -u root
   ```

4. Reset password:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
   FLUSH PRIVILEGES;
   EXIT;
   ```

5. Restart MySQL normally

6. Update `.env` with the new password

**Or use phpMyAdmin:**
- If you have phpMyAdmin installed, you can reset the password through the web interface

### Option 4: Create a New MySQL User

Instead of using root, create a dedicated user:

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```
   (Enter your root password when prompted)

2. **Create new user:**
   ```sql
   CREATE USER 'focusflow'@'localhost' IDENTIFIED BY 'your_password_here';
   GRANT ALL PRIVILEGES ON focusFlow.* TO 'focusflow'@'localhost';
   FLUSH PRIVILEGES;
   EXIT;
   ```

3. **Update `.env` file:**
   ```env
   DB_USER=focusflow
   DB_PASSWORD=your_password_here
   ```

4. **Restart the backend server**

## Verify Connection

Test your MySQL connection:

```bash
mysql -u root -p
```

Or with the user from `.env`:
```bash
mysql -u focusflow -p
```

If you can connect, the credentials are correct.

## After Fixing

1. **Update `.env` with correct password**
2. **Restart backend server:** `npm run dev:server`
3. **Check for connection success message:**
   ```
   ✅ Server is running on http://localhost:3000
   ```

## Common Issues

- **Password has special characters:** Make sure to escape them or use quotes in `.env`
- **Password is case-sensitive:** MySQL passwords are case-sensitive
- **User doesn't exist:** Make sure the user exists in MySQL
- **Database doesn't exist:** Run `npm run setup:db` after fixing password

