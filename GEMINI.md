# GEMINI.md - Tio da Perua Frontend

## Project Overview
**Tio da Perua** is a school transportation management mobile application. It facilitates the interaction between drivers, guardians, and schools.

- **Main Technologies:** Expo (~55), React Native (0.83), React Navigation (7), TypeScript.
- **Architecture:** The application follows a typical React Native structure with screens, components, services, and navigation. It uses functional components and hooks.
- **Roles:**
    - **Driver (Motorista):** Manages routes, students, and vehicle information.
    - **Guardian (Responsável):** Manages dependents, searches for drivers, and monitors trips.
    - **School (Escola):** Placeholder for future implementation.

## Building and Running
To run the project locally, ensure you have Node.js >= 20 and the Expo Go app installed on your device.

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platforms
npm run android
npm run ios
npm run web
```

**Note:** When running on a physical device, update the `BASE_URL` in `src/services/api.ts` with your local machine's IP address.

## Project Structure
- `App.tsx`: Entry point, navigation setup, and global providers.
- `src/`:
    - `components/`: Reusable UI components (e.g., `Logo`, `DriverLayout`, `GuardianLayout`).
    - `screens/`: UI screens for different roles and features.
    - `navigation/`: Navigation configuration and `RootStackParamList` definition.
    - `services/`: API client (`api.ts`) and authentication logic (`authService.ts`).
    - `types.ts`: Global TypeScript interfaces and types.
    - `types/`: Type definition files (`.d.ts`).
- `assets/`: Static assets like images and fonts.

## Development Conventions
- **TypeScript:** Strictly use TypeScript for all files. Define interfaces for API responses and component props.
- **Navigation:** Use `RootStackParamList` in `src/navigation/index.ts` to maintain type safety across screens.
- **API Interaction:** Centralize all API endpoints in `src/services/api.ts`. Use the `API` object for consistency.
- **Styling:** The project uses standard React Native `StyleSheet` and some Tailwind-like utility patterns (seen in `package.json` with `autoprefixer` and `postcss`, though primarily standard RN styles are used in screens).
- **Authentication:** Currently using a mock implementation in `src/services/authService.ts`. Transition to real API calls as the backend matures.
- **Architectural Guidance:** Refer to `IMPLEMENTACAO_PARADAS_VIAGEM.md` for specific logic regarding trip stops and dynamic data generation.

## Key Files to Watch
- `App.tsx`: Central hub for navigation and initialization.
- `src/navigation/index.ts`: Source of truth for navigation routes.
- `src/services/api.ts`: Centralized API configuration.
- `src/types.ts`: Core data models used throughout the app.
