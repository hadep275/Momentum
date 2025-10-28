# Momentum

## Project info

**Live App**: https://hadep275.github.io/Momentum/

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Building Native Mobile Apps with Capacitor

This project is set up with Capacitor for building native iOS and Android apps. When you're ready to work on the native apps:

### Setup Steps

1. Clone this repository locally:
```sh
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
npm install
```

2. Build the web app:
```sh
npm run build
```

3. Add native platforms:
```sh
npx cap add ios      # For iOS
npx cap add android  # For Android
```

4. Update native dependencies:
```sh
npx cap update ios      # For iOS
npx cap update android  # For Android
```

5. Sync your web code to native projects:
```sh
npx cap sync
```

6. Open and run in native IDEs:
```sh
npx cap run ios      # Opens Xcode (Mac required)
npx cap run android  # Opens Android Studio
```

### Requirements

- **iOS**: Mac with Xcode installed
- **Android**: Android Studio installed (works on Mac, Windows, Linux)

### After Making Changes

Whenever you pull new changes from GitHub, run:
```sh
npm install
npm run build
npx cap sync
```

This keeps your native apps in sync with the web app.
