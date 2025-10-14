# TenantTracker-Web Copilot Instructions

## Project Overview
TenantTracker-Web is a React-based property management application built with Vite, Redux Toolkit, and Tailwind CSS (v4) + DaisyUI. It manages tenant/owner interactions with dual user types and authentication.

## Architecture & Component Structure

### Routing & Layout Pattern
- **Main Layout**: `Body.jsx` wraps all routes with `Header`/`Footer` and handles auth state via `<Outlet>`
- **Nested Routes**: All pages render inside Body component using React Router's nested routing
- Routes: `/` (Home), `/login`, `/profile`, `/contact` - all wrapped by Body layout

### Redux State Management
- **Store Location**: `utils/appStore.js` (note: utils is at project root, not in src)
- **Key Slices**:
  - `MenuSlice`: Controls `showMenu`, `loginUser` ("owner"/"tenant"), `newUser` boolean
  - `UserSlice`: Simple user object storage with `updateUser`/`removeUser` actions
- **Usage Pattern**: Components destructure from useSelector with optional chaining: `store?.menu?.showMenu`

### Authentication & API Integration
- **Backend Base URL**: `http://localhost:3000` (hardcoded in components)
- **Auth Pattern**: All API calls use `withCredentials: true` for cookie-based auth
- **Auth Check**: `Body.jsx` calls `/owner/profile/view` on mount, redirects to `/login` on 401
- **Dual User Types**: API endpoints dynamically use `/${userType}/` where userType comes from Redux (`loginUser` slice)

### Component Organization
```
src/components/
├── main-components/     # Layout components (Header, Body, Footer, Sidebar)
├── header-components/   # Page components (Home, Login, Profile, Contact)
├── Sidebar-Components/  # Dashboard features (HomeDashboard, ViewTenants)
└── [component].jsx      # Shared components (MenuDropdown, Ammenities)
```

## Styling & UI Patterns

### Tailwind v4 + DaisyUI Setup
- **Import**: Single `@import "tailwindcss";` in `src/index.css`
- **Config**: Uses `@tailwindcss/vite` plugin in `vite.config.js` (no separate tailwind.config)
- **DaisyUI**: Available as dev dependency for component classes

### Component Styling Conventions
- **Header**: Sticky positioning (`sticky top-0 z-40`) with shadow and max-width container
- **Buttons**: Hover states with `hover:bg-amber-400` (project brand color)
- **Navigation**: Active states using React Router's `isActive` with blue theme
- **Responsive**: Uses `max-w-7xl mx-auto` container pattern

## Development Workflows

### Key Commands
```bash
npm run dev     # Vite dev server
npm run build   # Production build
npm run lint    # ESLint check
npm run preview # Preview production build
```

### File Naming & Import Patterns
- **Components**: PascalCase `.jsx` files
- **Redux**: camelCase `.js` files in `utils/Slices/`
- **Imports**: Relative paths with explicit `.jsx`/`.js` extensions
- **Assets**: Static files in `public/` (bg-image.webp, icons)

## Project-Specific Patterns

### Dual User Type System
- Redux `loginUser` state switches between "owner" and "tenant"
- API endpoints dynamically built: `/${userType}/profile/edit`
- Header shows different login buttons based on user type
- Profile updates dispatch appropriate user type to backend

### Error Handling
- **API Errors**: Try/catch with `error.response?.data?.message` fallback chain
- **401 Handling**: Automatic redirect to `/login` on authentication failure
- **User Feedback**: Alert dialogs for error messaging

### State Management Patterns
- **Initial Load**: User data fetched in `Body.jsx` useEffect and stored in Redux
- **Form Updates**: Local component state synced with Redux on successful API calls
- **Navigation**: useNavigate for programmatic routing after state changes

## Common Tasks

### Adding New Protected Routes
1. Add route in `App.jsx` inside Body route wrapper
2. Create component in appropriate `components/` subdirectory
3. Ensure component handles user authentication state from Redux

### API Integration
- Always use `withCredentials: true`
- Check Redux `loginUser` for dynamic endpoint construction
- Handle 401 responses with navigation to `/login`
- Update Redux user state after successful mutations