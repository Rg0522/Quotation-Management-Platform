# Quotation Management Platform

A production-ready full-stack quotation management system built with React, TypeScript, and Tailwind CSS. Designed as an internal tool for manufacturers to streamline quote-to-cash workflows with role-based access control, real-time optimistic updates, and intelligent comment threading.

## Quick Start

### Setup & Installation

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm dev

# Build for production
pnpm build
```

The app will be available at `http://localhost:8080`

## Features

### Authentication & Authorization

- **Email + Password Authentication**: Local authentication with localStorage persistence
- **Mock JWT Tokens**: Session tokens with 24-hour expiry
- **Role-Based Access Control**: Three roles with distinct permissions (manager, sales_rep, viewer)
- **Role Switching**: Users can switch roles in the UI for testing (only in development)

### Quotation Management

#### List Page

- **Search**: Debounced (300ms) search by client name or quotation ID
- **Filtering**: Status-based filtering (Pending, Approved, Rejected)
- **Pagination**: Configurable page size (default: 10 items per page)
- **URL-driven State**: All filters, search, and pagination stored in URL query params for bookmarkable/shareable states
- **Responsive Table**: Clean, sortable data display with status badges
- **Optimistic Updates**: Approve/reject buttons with instant UI feedback and automatic rollback on error

#### Detail Page

- **Full Quotation View**: Client info, amount, description, line items with breakdown
- **Inline Editing**: Manager-only edit mode for client name and amount
- **Status Management**: Approve/reject with visual confirmation
- **Line Items Table**: Detailed breakdown with quantity, rate, and amount calculations
- **Summary Calculation**: Subtotal, tax (18%), and freight breakdown

### Comments & Activity Feed

- **Threaded Comments**: Top-level comments visible to all users
- **Nested Replies**: Up to 2 levels of nesting for focused discussions
- **Role-Based Visibility**:
  - Comments: Always visible
  - Replies: Only visible to users with the same role as the replier
- **Lazy Loading**: Replies loaded on-demand to reduce initial data load
- **Smart Threading**: Recursive component rendering for flexible nesting

#### Permission Model

| Action                   | Manager        | Sales Rep      | Viewer         |
| ------------------------ | -------------- | -------------- | -------------- |
| View Quotations          | ✓              | ✓              | ✓              |
| Approve/Reject           | ✓              | ✗              | ✗              |
| Edit Fields              | ✓              | ✗              | ✗              |
| Add Comments             | ✓              | ✓              | ✗              |
| Add Replies              | ✓              | ✗              | ✗              |
| View Comments            | ✓              | ✓              | ✓              |
| View Role-Scoped Replies | Same role only | Same role only | Same role only |

### State Management

#### Optimistic Updates Strategy

1. **Immediate UI Update**: Status changes immediately reflect in the UI
2. **Pending State Tracking**: Optimistic update ID tracks request status
3. **Automatic Rollback**: Original state restored if API fails
4. **User Feedback**: Toast notifications for success and error states

#### Data Flow

```
API Layer (mockApi) → Local State (useState) → Components → UI
```

### Keyboard Shortcuts

- **`/`** — Focus search input (QuotationsList page)
- **`Escape`** — Clear focus from input (when available)

### Performance Optimizations

- **Debounced Search**: 300ms debounce to reduce re-renders and API calls
- **Scroll Position Preservation**: Maintains user scroll position when navigating back from detail view
- **Lazy Loading Replies**: Replies only loaded when user clicks "View replies"
- **URL-Driven State**: Page reload resilient due to query param-based state
- **Memoized Permissions**: Pure permission check functions prevent unnecessary recalculations

## Architecture

### Folder Structure

```
client/
├── components/
│   ├── ui/                    # Pre-built Radix UI + shadcn components
│   ├── TopBar.tsx            # Shared navigation and role switcher
│   └── CommentThread.tsx      # Recursive comment/reply component
├── lib/
│   ├── types.ts              # TypeScript interfaces and types
│   ├── auth-context.tsx       # Auth state management
│   ├── auth-utils.ts          # Auth helpers and permissions
│   ├── mock-api.ts            # Mock API with 1s artificial delay
├── hooks/
│   ├── use-keyboard-shortcuts.ts  # Keyboard event handling
│   └── use-toast.ts           # Toast notifications (built-in)
├── pages/
│   ├── SignIn.tsx             # Authentication
│   ├── SignUp.tsx             # Registration
│   ├── QuotationsList.tsx      # List with search, filter, pagination
│   ├── QuotationDetail.tsx     # Detail with editing and comments
│   ├── NotFound.tsx            # 404 page
│   └── Index.tsx              # Redirect to quotations
├── App.tsx                    # Root component with routing
├── global.css                 # Theme and global styles
└── vite-env.d.ts             # Vite environment types
```

### Core Components

#### `useAuth` Hook

Manages authentication state and provides sign in/up/out and role switching.

```typescript
const { user, isAuthenticated, signIn, signUp, signOut, switchRole } =
  useAuth();
```

#### `mockApi` Service

Provides mock endpoints with artificial 1s delay simulating network latency.

```typescript
await mockApi.getQuotations(search, status, page, pageSize);
await mockApi.updateQuotationStatus(id, status);
await mockApi.addComment(quotationId, author, role, text);
```

#### `permissions` Utility

Pure functions for permission checking.

```typescript
if (permissions.canApproveReject(user.role)) {
  /* show buttons */
}
if (permissions.canViewReply(replyRole, currentUserRole)) {
  /* show reply */
}
```

### State Management Strategy

**Choice: React Context + useState**

**Justification:**

- Simple state model with no complex nested updates
- Quotations are fetched fresh for each page load (no caching complexity)
- Comments are embedded in quotations (no separate normalization needed)
- Role switching is infrequent and UI-driven
- Scales to medium-sized teams (<100 users concurrently)

**Alternative Considered:** Zustand would add unnecessary overhead for this scope. Redux/RTK would be over-engineered.

### Data Types

```typescript
// Core entities
interface User {
  id: string;
  name: string;
  email: string;
  role: "manager" | "sales_rep" | "viewer";
}

interface Quotation {
  id: string;
  client: string;
  amount: number;
  status: "Pending" | "Approved" | "Rejected";
  last_updated: string;
  comments: Comment[];
  lineItems?: LineItem[];
}

interface Comment {
  id: number;
  author: string;
  role: Role;
  text: string;
  timestamp: string;
  replies?: Reply[];
}
```

## Product Sense Extras

Beyond the requirements, this implementation includes thoughtful UX touches:

### 1. First-Run Empty State

When no quotations exist, users see a friendly message with next steps instead of a blank table.

### 2. Keyboard Shortcuts

Press `/` to quickly focus the search input—improves power-user experience.

### 3. Preserved Scroll Position

When returning from detail view to list, scroll position is restored for seamless navigation.

### 4. Status Pills with Distinct Colors

Visual status indicators:

- **Pending**: Muted brown (#8B8B7E)
- **Approved**: Green (#588C3D)
- **Rejected**: Red (#FF6B6B)

### 5. Inline Validation

- Amounts validated as numbers
- Empty comments cannot be submitted
- Visual feedback while saving

### 6. Loading & Error States

- Spinner during data fetch
- Error cards with actionable messages
- Graceful degradation on network failures

### 7. Optimistic UI Updates

Approve/reject buttons update immediately with automatic rollback on error. No loading spinners needed.

### 8. Role Indicator in Comments

Each comment shows the author's role, making permission-based visibility clear.

### 9. Demo Account Quick-Access

Three buttons on sign-in for easy testing of different roles without memorizing credentials.

### 10. Responsive Design

Mobile, tablet, and desktop layouts handled gracefully with Tailwind breakpoints.

## API & Mock Data

### Mock API Endpoints

All endpoints return with a 1-second artificial delay to simulate network latency.

```typescript
// Get paginated quotations
GET /quotations?search=string&status=string&page=number&pageSize=number
Returns: { data: Quotation[], total: number, page: number, pageSize: number }

// Get single quotation
GET /quotations/:id
Returns: Quotation

// Update quotation
PATCH /quotations/:id
Body: { client?: string, amount?: number, status?: Status }
Returns: Quotation

// Add comment
POST /quotations/:id/comments
Body: { text: string }
Returns: Comment

// Add reply
POST /comments/:id/replies
Body: { text: string }
Returns: Reply

// Load replies (lazy loading)
GET /quotations/:id/comments/:commentId/replies
Returns: Reply[]
```

## Theme & Design

### Color Palette

Built with a professional, manufacturing-focused color scheme:

```css
/* Primary */
--primary: 88 40% 35%; /* Green #588C3D */
--sidebar-background: 88 40% 25%; /* Dark Green #2D5016 */

/* Background */
--background: 39 24% 97%; /* Cream #F5F3EF */
--foreground: 41 11% 15%; /* Dark Brown #3B3B35 */

/* Status Colors */
--status-pending: 39 15% 65%; /* Muted Brown */
--status-approved: 88 40% 35%; /* Green */
--status-rejected: 0 84.2% 60.2%; /* Red */
```

### Typography

- **Font**: Inter (sans-serif)
- **Weights**: 400 (regular), 600 (semibold), 700 (bold), 800 (extra-bold)
- **Scale**: Tailwind default (0.75rem to 2.25rem)

### Components

- Leverages pre-built Radix UI + shadcn/ui components:
  - Button, Input, Textarea, Select, Badge, Avatar
  - Card, Dialog, Dropdown Menu, Tooltip
  - Form, Alert, Toast/Sonner
- Fully customized styling via Tailwind config

## Testing

### Manual Testing Checklist

- [x] Sign in with different roles
- [x] Switch roles in the UI
- [x] Search quotations (debounce works)
- [x] Filter by status
- [x] Pagination between pages
- [x] Click quotation to view details
- [x] Edit quotation (manager only)
- [x] Approve/reject (manager only)
- [x] Add comment (manager + sales rep)
- [x] Add reply (manager only, to comments by same role)
- [x] Lazy load replies
- [x] Optimistic updates work
- [x] Rollback on error
- [x] Keyboard shortcut (/)
- [x] Scroll position preserved
- [x] Empty state displays
- [x] Error state displays
- [x] Mobile responsive

### Future Testing

```bash
# Run unit tests (not included in MVP)
pnpm test

# Run e2e tests (not included in MVP)
pnpm e2e
```

## Trade-offs & Decisions

### 1. Mock API vs Real Backend

**Decision**: In-app mock API with localStorage
**Rationale**: No backend needed for demo; artificial 1s delay simulates real network conditions
**Trade-off**: Cannot test concurrent user scenarios or real concurrency issues

### 2. Context API vs Zustand vs Redux

**Decision**: Context API for auth, useState for page-level state
**Rationale**: Simple data model; Context is sufficient for auth; page-level state avoids prop drilling
**Trade-off**: Doesn't scale to very large teams with complex shared state

### 3. Pagination vs Infinite Scroll

**Decision**: Pagination with configurable page size
**Rationale**: Better for manufacturing workflows where users need to jump to specific pages; clearer UX
**Trade-off**: Requires more clicks for large datasets

### 4. Nested Comments (2 levels) vs Flat

**Decision**: 2-level nesting (comments + replies)
**Rationale**: Balances deep discussions with UI clarity; prevents infinite nesting complexity
**Trade-off**: Doesn't support 3+ level conversations

### 5. Role-Scoped Reply Visibility

**Decision**: Replies only visible to same role + managers
**Rationale**: Allows private conversations between peers; managers see all
**Trade-off**: May feel restrictive for open discussion; adds complexity to permission model

### 6. Optimistic Updates without Conflict Resolution

**Decision**: Simple rollback on error
**Rationale**: Works well for internal tool with low concurrency; reduces code complexity
**Trade-off**: Doesn't handle stale data conflicts; would need server version checking for production

## Future Enhancements

### Near-term

1. **Draft Persistence**: Save unsent comments to localStorage before navigation
2. **Inline Status History**: Mini-timeline showing who approved/rejected and when
3. **Printable PDF View**: Generate clean PDF quote for external sharing
4. **Audit Log**: Full activity timeline for compliance

### Medium-term

1. **Real Backend Integration**: Replace mock API with REST/GraphQL endpoints
2. **WebSocket Support**: Real-time updates when other users make changes
3. **Advanced Search**: Full-text search with filters on amounts, dates, etc.
4. **Bulk Actions**: Approve/reject multiple quotations at once
5. **Export to ERP**: One-click sync to ERPNext, SAP, or similar

### Long-term

1. **AI-Powered Quote Generation**: Auto-complete items from RFQs
2. **Mobile Native Apps**: iOS/Android with offline sync
3. **Advanced Analytics**: Revenue tracking, approval rates, cycle time metrics
4. **Multi-tenant SaaS**: Support multiple companies with role hierarchy

## Development

### Code Quality Standards

- TypeScript for type safety
- Functional components with hooks
- Minimal prop drilling via Context
- Descriptive variable and function names
- Comments only for non-obvious logic

### Performance Targets

- Lighthouse score: 90+
- Initial load: <2s
- Search response: <300ms (debounced)
- Optimistic updates: <100ms

## Deployment

### Recommended Platforms for deployment

1. **Netlify**: Built-in Vite support, auto-deploys from git
2. **Vercel**: Similar to Netlify, excellent React support
3. **Self-hosted**: Docker container or traditional server

### Environment Variables

```
VITE_API_BASE_URL=https://api.pactle.com  # For future real backend
VITE_ENV=production
```

### Build

```bash
pnpm build
# Output: dist/ (ready for static hosting)
```


---

**Built with effort for manufacturers automating quote-to-cash workflows**
#   Q u o t a t i o n - M a n a g e m e n t - P l a t f o r m 
 
 
