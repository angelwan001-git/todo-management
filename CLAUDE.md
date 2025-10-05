# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A modern todo management application built with Next.js 15, React 19, TypeScript, and Supabase. Features include user authentication, CRUD operations for todos, drag-and-drop reordering, filtering, and real-time updates. Uses shadcn/ui components with Tailwind CSS for styling.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Backend/Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth (email/password)
- **UI Libraries**: shadcn/ui, Tailwind CSS, @dnd-kit (drag and drop)
- **Deployment**: Vercel

## Development Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Database Setup

1. Execute `database/schema.sql` in Supabase Dashboard SQL Editor to create:
   - `todos` table with RLS policies
   - Automatic `updated_at` trigger
   - Performance indexes

2. Required environment variables (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Architecture

### Authentication Flow
- **Client-side authentication** managed by `AuthContext` (`src/contexts/AuthContext.tsx`)
- Global auth state wraps entire app in `src/app/layout.tsx`
- Auth methods: `signUp()`, `signIn()`, `signOut()`
- Protected routes check `user` from `useAuth()` hook

### Supabase Client Pattern
- **Client components**: Use `supabase` from `src/lib/supabase.ts` (singleton instance)
- **Server components**: Use `createSupabaseServerClient()` from `src/lib/supabase-server.ts`
- Single client instance prevents auth state issues

### Data Flow
1. **TodoList component** (`src/components/todos/TodoList.tsx`) is the main container
2. Fetches todos from Supabase with RLS filtering by `user_id`
3. Orders by `order_index` (for drag-drop) then `created_at`
4. Renders **SortableTodoItem** for each todo with drag-drop support
5. State updates optimistically in React, then persists to Supabase

### Drag & Drop Implementation
- Uses `@dnd-kit` libraries (core, sortable, utilities)
- `handleDragEnd()` in TodoList reorders array with `arrayMove()`
- `saveTodoOrder()` persists `order_index` to database
- Each todo has unique `order_index` for consistent ordering

### Component Structure
```
src/
├── app/                       # Next.js App Router
│   ├── page.tsx              # Main page: shows auth forms or TodoList
│   ├── layout.tsx            # Root layout with AuthProvider
│   ├── todo/add/             # Add todo page (separate route)
│   ├── admin/users/          # Admin user management
│   └── api/admin/users/      # API route for user queries
├── components/
│   ├── auth/                 # LoginForm, SignUpForm
│   ├── todos/                # TodoList, TodoItem, SortableTodoItem, AddTodoForm
│   └── ui/                   # shadcn/ui components (Button, Card, Input, etc.)
├── contexts/
│   └── AuthContext.tsx       # Global auth state & methods
├── lib/
│   ├── supabase.ts           # Client-side Supabase client
│   ├── supabase-server.ts    # Server-side Supabase client
│   └── utils.ts              # Tailwind merge utilities
└── types/
    └── database.types.ts     # TypeScript types for DB schema
```

### Key Files
- **Main page logic**: `src/app/page.tsx` - conditionally renders auth or todos
- **Todo CRUD**: `src/components/todos/TodoList.tsx` - all operations and state
- **Drag & drop**: `src/components/todos/SortableTodoItem.tsx` - sortable wrapper
- **Auth context**: `src/contexts/AuthContext.tsx` - must wrap all components needing auth

## Database Schema

### todos table
- `id` (UUID): Primary key
- `title` (TEXT): Todo title, required, non-empty
- `completed` (BOOLEAN): Completion status
- `order_index` (INTEGER): For drag-drop ordering
- `created_at`, `updated_at` (TIMESTAMP): Auto-managed
- `user_id` (UUID): FK to auth.users, cascade delete

### RLS Policies
All operations (SELECT, INSERT, UPDATE, DELETE) restricted to `auth.uid() = user_id`. Users can only access their own todos.

## Styling Patterns

- Uses Tailwind CSS with custom theme configuration
- Path alias: `@/*` maps to `src/*` (configured in tsconfig.json)
- shadcn/ui components in `src/components/ui/`
- Utility function `cn()` from `src/lib/utils.ts` for conditional classes

## MCP Configuration

Playwright MCP server configured in `.mcp.json` for browser automation tasks.

## Common Tasks

### Adding a new todo field
1. Update database schema in `database/` directory
2. Run migration in Supabase Dashboard
3. Update `Todo` type in `src/types/database.types.ts`
4. Modify TodoList/TodoItem components to handle new field

### Creating protected routes
Use the pattern from `src/app/page.tsx`:
```typescript
const { user, loading } = useAuth();
if (!user) return <LoginForm />;
```

### Adding new UI components
Install shadcn/ui components or create in `src/components/ui/`. Use `cn()` utility for conditional styling.
