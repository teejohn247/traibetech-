# CMS - Content Management System

A modern, full-stack Content Management System built with React Router, TypeScript, Prisma, and Supabase.

## Features

- ✅ **Article Management**: CRUD operations for articles
- ✅ **Rich Text Editor**: Markdown support with live preview
- ✅ **Tree Structure**: Hierarchical organization with parent-child relationships
- ✅ **Table & Tree Views**: Multiple ways to manage content
- ✅ **Authentication**: Secure login/signup with Supabase Auth
- ✅ **Modern UI**: Responsive design with Tailwind CSS
- ✅ **TypeScript**: Full type safety
- ✅ **Database**: PostgreSQL with Prisma ORM

## Tech Stack

### Frontend
- **React Router** - Routing and server-side rendering
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Backend/Database
- **Prisma** - Database ORM and migrations
- **PostgreSQL** - Database (Supabase recommended)
- **Supabase** - Authentication and database hosting

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/cms_db?schema=public"
   
   # Supabase (get these from your Supabase project)
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

3. **Set up the database:**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev --name init
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at [localhost:5173](http://localhost:5173).

## Database Setup

### Option 1: Supabase (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > Database and copy the connection string
3. Update your `.env` file with the Supabase connection details
4. Run `npx prisma migrate dev` to create tables

### Option 2: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database named `cms_db`
3. Update the `DATABASE_URL` in `.env` with your local credentials
4. Run `npx prisma migrate dev` to create tables

## Authentication Setup

1. In your Supabase project, go to Authentication > Settings
2. Configure your site URL and any additional providers
3. The app uses email/password authentication by default

## Project Structure

```
src/
├── components/          # React components
│   ├── ArticleEditor.tsx   # Rich text editor with preview
│   ├── ArticleList.tsx     # Table and tree views
│   ├── Dashboard.tsx       # Main dashboard
│   └── Login.tsx           # Authentication
├── lib/                 # Utility libraries
│   ├── prisma.ts          # Prisma client
│   └── supabase.ts        # Supabase client
├── App.tsx             # Main application component
├── main.tsx            # Application entry point
└── index.css           # Global styles with Tailwind
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Serve production build
- `npx prisma studio` - Open Prisma Studio (database GUI)
- `npx prisma migrate dev` - Run database migrations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

Make sure to set these in your deployment platform:

```env
DATABASE_URL="your-production-database-url"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## Development Notes

- The app uses a hierarchical article structure where articles can have parent-child relationships
- Markdown is supported in the content editor with live preview
- The tree view allows easy navigation of nested content
- Authentication is required for all CMS operations
- All data is stored in PostgreSQL via Prisma ORM

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is created for educational/demonstration purposes.