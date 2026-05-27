# Reddit AI Moderator Assistant Devvit Project

This workspace contains a fully interactive React simulator dashboard on port 3000 representing our Reddit Devvit application AND the complete, production-ready source code files ready to be pasted directly into a new Devvit CLI project.

## Project Structure in this Workspace
- `/server.ts` - Custom full-stack Express server connecting our dashboard simulator dynamically to Gemini AI models.
- `/src/App.tsx` - Core React single-page dashboard manager orchestrating simulator state transitions.
- `/src/components/*` - Subreddit Simulator (Reddit-styled Sandbox feed), AI Mod Parameter Console, Live Karma Registry, and Analytics charts (using Recharts).
- `/src/devvit/main.tsx` - Production Devvit codebase to paste into `src/main.tsx` of a fresh `@devvit/cli` scaffold.
- `/src/devvit/helpers.ts` - Auxiliary helpers to paste into `src/helpers.ts` of your fresh Devvit CLI scaffold.

---

## Complete Devvit Setup Instructions (Hackathon Deploy Guidelines)

To run this AI Moderator Assistant directly inside Reddit using the latest Devvit developer CLI, follow these steps:

### Part 1: Initialize Devvit Workspace
1. Install the Reddit Devvit developer CLI globally:
   ```bash
   npm install -g @devvit/cli
   ```
2. Authenticate the CLI with your Reddit developer account credentials:
   ```bash
   devvit login
   ```
3. Initialize a fresh Reddit Devvit project locally. Choose **TypeScript** and **Blocks** template options:
   ```bash
   devvit new-project reddit-ai-moderator
   ```
4. Change directory into your freshly created folder:
   ```bash
   cd reddit-ai-moderator
   ```

### Part 2: Paste Code Files
1. Open the newly initialized Devvit directory.
2. Replace `/src/main.tsx` inside your Devvit app folder with the contents of `/src/devvit/main.tsx` from this workspace.
3. Replace `/src/helpers.ts` (or create a new file `/src/helpers.ts` inside `/src`) with the contents of `/src/devvit/helpers.ts`.

### Part 3: Deploy & Register Secrets
1. Since our Devvit code makes HTTP request triggers to evaluate toxicity with Gemini AI, install secure keys into Reddit Playbox. Set your Gemini API endpoint or proxy URL:
   ```bash
   devvit playbox secrets set MODERATOR_API_ENDPOINT="https://your-moderation-service.com/api"
   ```
2. Launch the Devvit developer console to deploy on test playgrounds:
   ```bash
   devvit playbox
   ```
3. Go to any test subreddit where you have active moderator rights, and install your applet:
   ```bash
   devvit publish r/YourTestSubredditName
   ```

---

## Full-Stack Simulator Local Startup Guide
To run, edit, or test the full-stack interactive dashboard simulator in this IDE workspace:

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Express server + Vite environment in dev mode:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:3000` to interact with custom comment feeds, check health indexes, alter config parameters, and generate exportable files dynamically.
