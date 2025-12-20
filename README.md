# Auth Service Admin Portal

## Overview

A modern, responsive admin portal built with React and TypeScript for managing platforms, profiles, roles, and
permissions. This application provides a comprehensive interface for system administrators to configure and manage
access control across multiple platforms.

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
- UI Components & Styling
- Material-UI (MUI) v5 for beautiful, accessible components
- Emotion for CSS-in-JS styling
- Responsive Grid System for flexible layouts

#### State Management

- Zustand for simple and efficient state management
- Session Storage for state persistence across page refreshes
- Centralized Stores for permissions, authentication, alerts, and theme

#### Code Quality & Development

- ESLint for code linting and quality checks
- Prettier for consistent code formatting
- TypeScript for type safety and better developer experience

### Development Tools

- Hot Module Replacement (HMR) for fast development cycles
- Environment Configuration for different deployment stages
- Build Optimization for production deployments

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
  - eg: do not show create button if does not have create permissions
- Tests
