# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Pending interaction regression tests

Run the focused interaction tests with Node.js 18 or newer and the installed dependencies:

```bash
npm run test:interaction
```

These tests exercise the real `MainPlayer` and `Game` implementations with rendering
and API mocks. They cover response success/failure, retry, duplicate submissions,
WebSocket/HTTP ordering, nested selection cancellation, and event receiver routing.
They do not replace browser or multiplayer end-to-end tests.

Equipment and Jian Xiong responses retain their event context while the request is
pending and only clear it after success. Failure is logged and shown in a dialog;
returning to the original question lets the player retry or choose another option.
A newer WebSocket question takes precedence over an older HTTP response.
