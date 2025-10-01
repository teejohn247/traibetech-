# TraibeTech CMS - Content Management System

A modern, full-stack Content Management System built with **Remix**, **TypeScript**, **Prisma**, and **Supabase**. Features a beautiful interface with tree/table views, rich text editing, and hierarchical content organization.

## 🚀 Features

### Content Management
- ✅ **Article Management**: Full CRUD operations for articles with hierarchical structure
- ✅ **Rich Text Editor**: Quill-based editor with live preview mode
- ✅ **Tree & Table Views**: Switch between hierarchical tree view and detailed table view
- ✅ **Categories**: Organize articles into categories with filtering
- ✅ **Media Library**: Upload and manage images with base64 storage
- ✅ **Draft/Published States**: Manage article publishing workflow
- ✅ **Parent-Child Relationships**: Nested article structure for complex content organization

### User Interface
- ✅ **Modern Design**: Beautiful, responsive UI with TraibeTech branding
- ✅ **Animated Transitions**: Smooth Framer Motion animations
- ✅ **Mobile Responsive**: Optimized for all screen sizes
- ✅ **Collapsible Sidebar**: Adaptive navigation for desktop and mobile

### Technical Features
- ✅ **Authentication**: Secure login/signup with Supabase Auth
- ✅ **Server-Side Rendering**: Remix for optimal performance and SEO
- ✅ **TypeScript**: Full type safety throughout the application
- ✅ **Database**: PostgreSQL with Prisma ORM and migrations
- ✅ **File-based Routing**: Remix's powerful routing system

## 📱 Application Pages

### Public Pages
- **Landing Page** (`/`) - Marketing page with features and call-to-action
- **Article View** (`/articles/:id/view`) - Public article display with sidebar

### Dashboard Pages (Authentication Required)
- **Dashboard** (`/dashboard`) - Overview with statistics and recent articles
- **Articles** (`/articles`) - Article management with tree/table views
  - **New Article** (`/articles/new`) - Create new articles
  - **Edit Article** (`/articles/:id/edit`) - Edit existing articles
- **Categories** (`/categories`) - Manage article categories
- **Media Library** (`/media`) - Upload and manage media files

### Views & Features

#### Article List Views
1. **Table View** 📊
   - Sortable columns (Title, Category, Status, Date)
   - Bulk actions (Publish/Unpublish)
   - Status filtering (All, Published, Draft)
   - Responsive mobile cards
   - Pagination support

2. **Tree View** 🌳
   - Hierarchical display of categories and articles
   - Collapsible/expandable nodes
   - Parent-child relationship visualization
   - Quick article loading into editor
   - Category grouping

#### Article Editor Features
- **Rich Text Editing**: Quill.js with full formatting toolbar
- **Live Preview**: Toggle between edit and preview modes
- **Metadata Management**: Title, slug, category, parent selection
- **Image Upload**: Featured images with alt text
- **SEO Fields**: Meta descriptions, keywords, Open Graph data
- **Article Settings**: Comments, featured status, notifications

## 🛠 Tech Stack

### Frontend
- **Remix** - Full-stack React framework with SSR
- **React 18** - UI library with modern hooks
- **TypeScript** - Type safety and developer experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icon library
- **React Quill** - Rich text editor component

### Backend & Database
- **Prisma** - Type-safe database ORM with migrations
- **PostgreSQL** - Robust relational database
- **Supabase** - Authentication and database hosting
- **Server-Side Rendering** - Remix handles SSR automatically

### Development Tools
- **Vite** - Fast build tool and dev server
- **PostCSS** - CSS processing with Tailwind
- **ESLint & TypeScript** - Code quality and type checking

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd FULL-STACK-ROLE
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:

```env
# Database Connection
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"

# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anonymous-key"
```

#### Environment Variables Explained:
- `DATABASE_URL`: PostgreSQL connection string (from Supabase or local)
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public API key from Supabase

### 3. Database Setup & Migration

```bash
# Generate Prisma client
npx prisma generate

# Run database migrations (creates all tables)
npx prisma migrate dev --name init

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🗄 Database Schema

The application uses the following main tables:

### Articles Table
```prisma
model Article {
  id            String    @id @default(uuid()) @db.Uuid
  title         String
  slug          String    @unique
  content       String
  category      String
  status        String    @default("draft") // "draft" or "published"
  parentId      String?   @db.Uuid @map("parent_id")
  parent        Article?  @relation("ArticleHierarchy", fields: [parentId], references: [id])
  children      Article[] @relation("ArticleHierarchy")
  createdAt     DateTime  @default(now()) @db.Timestamptz @map("created_at")
  updatedAt     DateTime  @updatedAt @db.Timestamptz @map("updated_at")
  publishedAt   DateTime? @db.Timestamptz @map("published_at")
  authorId      String?   @map("author_id")
  featuredImage String?   @db.Text @map("featured_image") // Base64 image data
  imageAlt      String?   @map("image_alt") // Alt text for the image
}
```

### Media Files Interface
```typescript
interface MediaFile {
  id: string;
  name: string;
  originalName: string;
  base64: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  createdAt: string;
}
```

## 🔧 Remix Setup & Architecture

### File-based Routing
```
app/routes/
├── _index.tsx                    # Root redirect to dashboard
├── _app.tsx                      # Main layout with authentication
├── _app.dashboard._index.tsx     # Dashboard page
├── _app.articles._index.tsx      # Articles list page
├── _app.articles.new.tsx         # New article page
├── _app.articles.$id.edit.tsx    # Edit article page
├── _app.categories._index.tsx    # Categories page
├── _app.media._index.tsx         # Media library page
└── articles.$id.view.tsx         # Public article view
```

### Project Structure
```
app/
├── components/           # Reusable React components
│   ├── Layout.tsx           # Main navigation layout
│   ├── ImageUpload.tsx      # File upload component
│   ├── ClientOnlyReactQuill.tsx  # SSR-safe Quill wrapper
│   └── index.ts            # Component exports
├── pages/               # Page components
│   ├── Dashboard.tsx        # Dashboard with stats
│   ├── ArticleList.tsx      # Tree/table views
│   ├── ArticleEditor.tsx    # Article creation/editing
│   ├── ArticleView.tsx      # Public article display
│   ├── Categories.tsx       # Category management
│   ├── Media.tsx           # Media library
│   ├── Login.tsx           # Authentication
│   ├── LandingPage.tsx     # Marketing page
│   └── index.ts            # Page exports
├── lib/                 # Utility libraries
│   ├── api.ts              # Article CRUD operations
│   ├── media.ts            # Media file handling
│   ├── prisma.ts           # Database client
│   └── supabase.ts         # Auth client
├── routes/              # Remix route handlers
├── root.tsx             # Root document component
└── index.css            # Global styles
```

## 🔐 Supabase Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the database to be provisioned

### 2. Get Connection Details
1. Go to **Settings** → **Database**
2. Copy the connection string and update `DATABASE_URL` in `.env`
3. Go to **Settings** → **API**
4. Copy the project URL and anon key for your `.env` file

### 3. Configure Authentication
1. Go to **Authentication** → **Settings**
2. Set your site URL (e.g., `http://localhost:3000` for development)
3. Configure email templates if needed
4. The app uses email/password authentication by default

## 📊 Database Migrations with Prisma

### Initial Setup
```bash
# Install Prisma CLI (if not already installed)
npm install prisma --save-dev

# Initialize Prisma (already done in this project)
npx prisma init
```

### Running Migrations
```bash
# Create and apply a new migration
npx prisma migrate dev --name descriptive-name

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Common Migration Commands
```bash
# Generate Prisma client after schema changes
npx prisma generate

# View database in browser
npx prisma studio

# Check migration status
npx prisma migrate status

# Create migration without applying
npx prisma migrate dev --create-only
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Prepare for deployment:**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel:**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Set environment variables in Vercel:**
   - Go to your project dashboard
   - Add all environment variables from your `.env` file
   - Redeploy after adding variables

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start Remix dev server
npm run build        # Build for production
npm run start        # Start production server
npm run typecheck    # Run TypeScript checks

# Database
npx prisma generate  # Generate Prisma client
npx prisma studio    # Open database GUI
npx prisma migrate dev # Run migrations (development)
npx prisma migrate deploy # Apply migrations (production)

# Utilities
npm run lint         # Run ESLint (if configured)
```

## 🎨 Customization

### Branding
- Logo and branding are in `app/components/Layout.tsx` and `app/pages/LandingPage.tsx`
- Color scheme is green/emerald (TraibeTech branding)
- Update colors in `app/index.css` and component files

### Features
- Add new pages by creating routes in `app/routes/`
- Extend the database schema in `prisma/schema.prisma`
- Add new components in `app/components/`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify `DATABASE_URL` is correct
   - Ensure database is running and accessible
   - Check firewall settings for remote databases

2. **Authentication Issues**
   - Verify Supabase URL and keys are correct
   - Check site URL configuration in Supabase
   - Ensure email/password auth is enabled

3. **Build Errors**
   - Run `npx prisma generate` after schema changes
   - Clear node_modules and reinstall if needed
   - Check TypeScript errors with `npm run typecheck`

4. **SSR Issues with React Quill**
   - The app uses `ClientOnlyReactQuill` component to prevent SSR errors
   - Quill editor only loads on the client side

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is created for educational and demonstration purposes.

---

Built with ❤️ using Remix, TypeScript, and modern web technologies.