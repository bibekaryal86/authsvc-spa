# Auth Service Admin Portal

## Overview

A modern, responsive admin portal built with React and TypeScript for managing platforms, profiles, roles, and
permissions. This application provides a comprehensive interface for system administrators to configure and manage
access control across multiple platforms.

This is the frontend for Auth-Service [https://github.com/bibekaryal86/auth-service]

## Features

### Core Functionality

- Platform Management: Create, read, update, and delete application platforms
- Profile Management: Configure user profiles and their settings
- Role Management: Define and assign user roles with specific permissions
- Permission Management: Set granular access controls for system actions
- Platform-Role-Permission (PRP) Assignments: Link permissions to roles across different platforms
- Platform-Profile-Role (PPR) Assignments: Link profiles to roles across different platforms
- History Tracking: View audit trails for all entities
- Soft Delete Support: Recover deleted items with superuser privileges

### User Experience

- Responsive design for desktop and mobile
- Dark/Light theme support with persistence
- Real-time form validation
- Comprehensive error handling
- Loading states and progress indicators
- Intuitive navigation and search functionality

### Tech Stack

#### Frontend Framework

- React 18 with TypeScript for type-safe development
- Vite for fast development and optimized builds
- React Router v6 for client-side navigation

#### UI Components & Styling

- Material-UI (MUI) v5 for beautiful, accessible components
- Emotion for CSS-in-JS styling
- Responsive Grid System for flexible layouts

#### State Management

- **Zustand** for lightweight, predictable client-side state
  - Used for UI-driven state such as modals, authentication session, alerts, and theme
  - Selector-based subscriptions for minimal re-renders
  - Session Storage persistence for selected stores
- **TanStack Query (React Query)** for server-state management
  - Declarative data fetching and caching
  - Automatic background refetching to keep data fresh
  - Mutation handling for create/update/delete/restore operations
  - Cache invalidation and optimistic updates for responsive UX
- Integrated Devtools for debugging queries and mutations

#### Code Quality & Development

- ESLint for code linting and quality checks
- Prettier for consistent code formatting
- TypeScript for type safety and better developer experience

### Development Tools

- Hot Module Replacement (HMR) for fast development cycles
- Environment Configuration for different deployment stages
- Build Optimization for production deployments

## Data Flow

The application separates UI state and server state to keep the architecture predictable, scalable, and easy to maintain.

#### User Interaction (UI Layer)

- Users interact with forms, tables, dialogs, and navigation components.
- UI components trigger actions such as opening modals, submitting forms, or selecting entities.

These interactions update Zustand stores for local UI state (e.g., modal visibility, selected permission, theme, alerts).

#### Client-Side State (Zustand)

Zustand manages all ephemeral UI state that does not come from the backend:

- Modal open/close state
- Selected entities
- Authentication session
- Alerts and notifications
- Theme preference

Zustand stores act as the “UI event layer,” coordinating what the user sees and what actions are available.

#### Server-Side State (TanStack Query)

TanStack Query handles all remote data from the Auth Service API:

- Fetching lists of entities
- Fetching single entities
- Mutations for create/update/delete/restore
- Automatic caching and background refetching
- Cache invalidation after mutations

This ensures the UI always reflects the latest backend state without manual state management.

#### Service Layer (API Calls)

All network requests flow through a dedicated service layer:

- Axios-based API clients
- Centralized error extraction and normalization
- Consistent request/response handling
- Shared configuration (base URL, interceptors, headers)

TanStack Query calls these services inside queries and mutations.

#### Data Rendering (UI Components)

Once data is fetched or mutated:

- TanStack Query provides cached results to components
- Zustand controls UI behavior (modals, alerts, selections)
- Components render the final state to the user

This creates a clean separation:

- Zustand = UI state
- TanStack Query = server state
- Service Layer = API communication
- Components = presentation

## Local Development

### Prerequisites

- Node.js 24+
- npm or yarn package manager

### Environment Setup

- Create a `.env` file in the root directory
  - `.env.example` is provided for required variables

### Start development server

- `npm run dev`

### Things to do:

- Show/hide components based on permissions
  - eg: do not show create button if user does not have create permissions
- Tests
