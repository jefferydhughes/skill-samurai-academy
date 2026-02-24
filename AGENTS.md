# AGENTS.md - Codebase Guidelines for Agentic Coding

## Build Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint (quiet mode)
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run typecheck` - Run TypeScript checking via JSConfig
- `npm run preview` - Preview production build

**For testing**: No test framework is currently configured. When adding tests, check for existing test setup first.

## Code Style Guidelines

### File Structure & Organization
- Use `src/components/` for reusable components
- Use `src/pages/` for route/page components
- Use `src/lib/` for utilities and context providers
- Use `src/components/ui/` for base UI components (shadcn/ui pattern)
- Components use `.jsx` extension throughout the project

### Import Patterns
```javascript
// External libraries first
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Local imports last
import { base44 } from '@/api/base44Client';
```

- Use `@/` alias for src directory imports
- Group imports: React → external libraries → local components
- Prefer named imports over default imports when available

### Component Structure
```jsx
// Functional components with forwardRef for UI components
const Component = React.forwardRef(({ className, variant, size, ...props }, ref) => {
  // Hooks first
  const [state, setState] = useState();
  
  // Event handlers
  const handleClick = () => {};
  
  // Render
  return (
    <div 
      className={cn(baseClasses, className)}
      ref={ref}
      {...props}
    >
      {/* Content */}
    </div>
  );
});

Component.displayName = 'Component';
export { Component };
```

### Styling & CSS
- **Primary**: Tailwind CSS with custom design system
- **Utilities**: Use `cn()` helper from `@/lib/utils` for conditional classes
- **Colors**: Follow HSL CSS custom properties pattern from `tailwind.config.js`
- **Responsive**: Mobile-first approach with md: breakpoints
- **Component variants**: Use `class-variance-authority` (cva) for base UI components

### TypeScript & Type Safety
- Use `.jsx` files but enable type checking via `jsconfig.json`
- `checkJs: true` enables JSDoc type inference
- Use JSDoc comments for complex types when not using full TypeScript
- Leverage PropTypes from ESLint rules for component validation

### Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile`, `BookingWizard`)
- **Functions/Variables**: camelCase (e.g., `handleSubmit`, `isLoading`)
- **Files**: ComponentName.jsx for components, utilityName.js for utilities
- **Constants**: UPPER_SNAKE_CASE for static values
- **CSS Classes**: Use Tailwind class names, avoid custom CSS

### State Management
- **Local State**: React hooks (useState, useEffect, useReducer)
- **Global State**: React Context (see `src/lib/AuthContext.jsx`)
- **Server State**: TanStack Query (React Query) for API calls
- **Form State**: React Hook Form with Zod validation

### Error Handling
- Use try-catch blocks for async operations
- Implement error boundaries for route-level error handling
- Show user-friendly error messages with toast notifications
- Log errors appropriately without exposing sensitive data

### API Integration
- Base44 SDK for backend operations (`@/api/base44Client`)
- TanStack Query for caching and synchronization
- Handle loading states and error states consistently
- Use optimistic updates where appropriate

### Accessibility (a11y)
- Use semantic HTML5 elements
- Implement ARIA labels for complex interactions
- Ensure keyboard navigation support
- Test with screen readers in mind
- Use Radix UI primitives for complex components

### Performance Considerations
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Lazy load routes and heavy components when needed
- Optimize bundle size through dynamic imports
- Use Vite's build optimization features

### Code Quality Tools
- **ESLint**: Enforces code style and catches bugs
  - Unused imports are auto-removed (`eslint-plugin-unused-imports`)
  - React hooks rules enforced
  - No console.logs in production code
- **No Prettier**: Use manual formatting following established patterns

### Git & Version Control
- Feature branches: `feature/description` or `fix/description`
- Commit messages: Conventional Commits format when possible
- Never commit secrets, API keys, or sensitive configuration

### Testing Strategy (When Implemented)
- Unit tests for utility functions
- Component testing for complex interactions
- Integration tests for critical user flows
- E2E testing for key user journeys

### Security Best Practices
- Validate all user inputs
- Sanitize data before rendering
- Use HTTPS for all API calls
- Implement proper authentication and authorization
- Never expose sensitive data in client-side code

### UI/UX Guidelines
- Consistent spacing using Tailwind's spacing scale
- Responsive design: mobile-first approach
- Loading states for all async operations
- Hover/focus states for interactive elements
- Smooth transitions and micro-animations using Tailwind
- Follow existing design patterns from Layout component

### Specific Patterns in This Codebase
- **Page Routing**: Dynamic routing via `pages.config.js`
- **Authentication**: Context-based auth with role-based navigation
- **Layout System**: Responsive sidebar + mobile bottom nav
- **Component Library**: shadcn/ui pattern with Radix UI primitives
- **State Patterns**: React Query for server state, Context for auth

## Development Workflow

1. Always run `npm run lint` before committing
2. Run `npm run typecheck` to catch type issues
3. Test in both mobile and desktop viewports
4. Verify accessibility with keyboard navigation
5. Check console for errors or warnings
6. Test authentication flows for different user roles

## Notes for AI Agents

- This is a React 18 app with Vite as the build tool
- Uses a custom Base44 SDK for backend operations
- Extensive component library with shadcn/ui patterns
- Multi-role application (student, teacher, admin, parent)
- Responsive design is critical - test mobile layouts
- Existing code uses functional components and hooks exclusively
- Avoid class components - this is a hooks-only codebase