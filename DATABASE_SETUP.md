# Database Setup Instructions

## PostgreSQL Installation

### Windows

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the postgres user
4. Keep the default port (5432)

### Using psql

1. Open Command Prompt or PowerShell
2. Connect to PostgreSQL:
   ```powershell
   psql -U postgres
   ```
3. Enter your postgres password

4. Create the database:
   ```sql
   CREATE DATABASE ping_db;
   ```

5. Exit psql:
   ```
   \q
   ```

## Environment Configuration

1. Copy `.env.example` to `.env`:
   ```powershell
   Copy-Item backend\.env.example backend\.env
   ```

2. Edit `backend\.env` and update the database connection:
   ```
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ping_db
   ```

3. Generate a secure SECRET_KEY:
   ```powershell
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   
   Copy the output and replace `your-secret-key-change-this-in-production` in `.env`

## Initialize Database Tables

The tables will be created automatically when you run the FastAPI server for the first time.

1. Activate virtual environment:
   ```powershell
   cd backend
   venv\Scripts\activate
   ```

2. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

3. Run the server (this creates tables):
   ```powershell
   python main.py
   ```

## Create Default Admin User (Optional)

You can create a platform admin user via the API:

```powershell
curl -X POST "http://localhost:8000/api/auth/register" `
  -H "Content-Type: application/json" `
  -d '{
    "email": "admin@ping.agaii.org",
    "password": "SecurePassword123",
    "full_name": "Platform Admin"
  }'
```

Then manually update the user role in the database to `platform_admin`.

## Verify Database

1. Connect to PostgreSQL:
   ```powershell
   psql -U postgres -d ping_db
   ```

2. List tables:
   ```sql
   \dt
   ```

   You should see:
   - users
   - organizations
   - classes
   - modules
   - module_whitelist
   - consent_records
   - behavior_data
   - audit_logs

3. Check users:
   ```sql
   SELECT id, email, role FROM users;
   ```

## Troubleshooting

### Can't connect to PostgreSQL
- Make sure PostgreSQL service is running
- Check if the port 5432 is correct
- Verify your password in .env

### Tables not created
- Check if the database exists: `\l` in psql
- Check backend logs for errors
- Make sure DATABASE_URL in .env is correct

### Permission denied
- Make sure the postgres user has the correct password
- Grant necessary permissions if needed
