# ndrewgood.com

Andrew Goodridge's personal portfolio, built with SvelteKit and deployed on Vercel.

## Tech stack

### Application

- **Svelte 5** with runes for components and reactive state
- **SvelteKit 2** for routing, server rendering, API routes, and server actions
- **TypeScript** throughout the application
- **Vite** for local development and production builds
- **Tailwind CSS 4** for utility-first styling
- **Motion** for interface animation

### Content and media

- **Keystatic** provides a local, Git-backed CMS for projects, experience, bio, and colophon content
- **Marked** renders Markdown content on the server
- **Mux Player** delivers project videos
- Project metadata is stored as YAML, JSON, MDX, and Markdoc files under `src/content`

### Voice memos

- The browser's MediaRecorder and Web Audio APIs record audio and convert it to WAV
- **Firebase Storage** stores recordings
- **Cloud Firestore** stores memo metadata
- **Resend** emails new-memo notifications with the WAV attached
- A password-protected SvelteKit route provides the answering-machine inbox

### Infrastructure and tooling

- **Vercel** hosts the SvelteKit application through `@sveltejs/adapter-vercel`
- **Firebase Admin SDK** handles server-side Firebase access
- **ESLint**, **Prettier**, and **svelte-check** provide linting, formatting, and type checking
- **npm** manages dependencies and scripts

## Local development

Install dependencies and start the development server:

```sh
npm install
npm run dev
```

The site is available at `http://localhost:5173`.

Create a local `.env` from `.env.example` and add the credentials needed for
Firebase, the answering-machine admin page, and Resend.

## Scripts

```sh
npm run dev       # Start the development server
npm run build     # Create a production build
npm run preview   # Preview the production build
npm run check     # Run Svelte and TypeScript checks
npm run lint      # Check formatting and lint rules
npm run format    # Format the repository
```

## Deployment

The project uses the Vercel adapter. Configure the variables listed in
`.env.example` in the Vercel project before deploying.
