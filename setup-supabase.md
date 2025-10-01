# Supabase Setup Instructions

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Fill in the project details:
   - **Project Name**: `cms-app` (or your preferred name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose closest region

## Step 2: Get Your Credentials

After your project is created:

### Get Supabase URL and API Key:
1. Go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://[project-ref].supabase.co`)
   - **Project API Keys** → **anon public** (the long key starting with `eyJ...`)

### Get Database URL:
1. Go to **Settings** → **Database**
2. Scroll down to **Connection string**
3. Select **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with the database password you created

## Step 3: Create .env File

Create a `.env` file in the project root with:

```env
# Database URL from Supabase
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase credentials
VITE_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
VITE_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

## Step 4: Run Database Migration

After setting up the .env file, run:

```bash
npx prisma migrate dev --name init
```

This will create the Article table in your Supabase database.

## Step 5: Test the Setup

Start the development server:

```bash
npm run dev
```

The app should now work with authentication and database!
