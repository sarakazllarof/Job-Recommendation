# Job Recommendation System Frontend

This is the frontend application for the Job Recommendation System, built with React, TypeScript, and Material-UI.

## Features

- User authentication (login/register)
- Job browsing and searching
- CV upload and management
- Personalized job recommendations
- Profile management
- Responsive design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Backend server running on http://localhost:8000

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at http://localhost:5173

## Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

- `src/components/` - Reusable UI components
- `src/pages/` - Page components
- `src/contexts/` - React contexts (e.g., authentication)
- `src/App.tsx` - Main application component
- `src/main.tsx` - Application entry point

## Technologies Used

- React
- TypeScript
- Material-UI
- React Router
- Axios
- Vite
