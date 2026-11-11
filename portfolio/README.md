# Tasmin Ahmed Oni — Multiplayer Portfolio

React 19 + TypeScript + Tailwind CSS + Framer Motion, with a real Node.js / Socket.IO server.

## Run locally

Requires Node.js 22 or newer. In PowerShell:

    cd "D:\New portfolio\portfolio"
    npm install
    npm run dev

Open the exact URL printed in the terminal. Startup automatically skips occupied ports, so an older frontend-only server on 5173 will not intercept the live-room connection. The new address may be http://127.0.0.1:5174 or higher. This one command starts both the website and the real-time server. Open a second browser or incognito window, then move a mouse: each session sees the other session's cursor. The online count includes your own connection; multiple tabs count separately. The live room never simulates visitors. A separate, clearly labelled build demo animates the page automatically.

## Build and run production

    npm run build
    npm start

Open http://localhost:3000. Production serves the frontend and Socket.IO from the same Node process. Set PORT and HOST through the hosting environment if needed. Production binds to 0.0.0.0. Development binds to 127.0.0.1; set HOST=0.0.0.0 to test from another device, if your firewall allows it. Development automatically selects a free port starting at 5173. An explicitly configured PORT must be free.

## Deploy the complete experience

Use a Node-compatible host with WebSocket support.

- Build command: npm ci && npm run build
- Start command: npm start
- Health endpoint: /health
- Keep a single running instance for the current in-memory presence room.
- Preserve WebSocket upgrades on /socket.io/ through any reverse proxy.
- TLS should terminate at the hosting platform/reverse proxy.
- No database or secret keys are required.

A Dockerfile is included:

    docker build -t tasmin-portfolio .
    docker run --rm -p 3000:3000 tasmin-portfolio

Docker packaging is provided but was not tested here.

For multiple replicas, add a shared Socket.IO adapter and shared presence state first. Restarting the server clears presence and clients reconnect automatically.

### Existing Sites publication

The existing Sites deployment serves static assets and cannot run this Node.js server. The frontend can be published there, but its live room honestly shows offline until an external Node backend is configured.

To use a separate backend:

1. Deploy the Node app and obtain its HTTPS URL.
2. Set VITE_PRESENCE_URL to that URL in .env.local before running npm run build.
3. Set ALLOWED_ORIGINS on the Node host to the frontend's exact origin, such as https://tasmin-ahmed-oni-portfolio.berry-finch-5988.chatgpt.site.
4. Rebuild and redeploy the frontend.

Multiple allowed origins may be comma-separated. See .env.example. VITE_PRESENCE_URL is a public URL, never a secret.

## Editing content

- src/site.ts: identity, email, résumé, projects, experience, education.
- src/components/TechStack.tsx: technologies requested in promt.md.
- src/components/Hero.tsx: hero copy and workspace illustration.
- src/styles.css: visual system and responsive styles.
- index.html: metadata and canonical URL.
- public/assets/: résumé and project images.

Clothigo uses a screenshot of its live website captured on 2026-11-11. TrustPoint Pharma and Boi-Poribar use explicitly labelled concept art because reliable screenshots were unavailable. Academic Thesis Portal was named in the brief, but its technical details and links were not supplied; its card says details are coming soon. Add image, sourceUrl, url, tools, and details to src/site.ts when available. No project repository links have been invented; the personal GitHub profile is linked separately.

The contact form validates fields and creates an email draft. Visitors send it in their own email app; there is no email delivery backend.

## Live presence

- Server-generated IDs, assigned names/colors, and editable display names.
- Client sends at most 20 pointer updates/second; server also rate-limits and validates input.
- Positions are relative to page sections for different viewport sizes and scroll positions.
- Only names and pointer positions are shared. Contact-field contents are never transmitted.
- Touch pointers are not shared. Mobile users can see the online count and other visitors.
- Visitors can leave/rejoin. Hidden tabs and pointers outside the page hide their cursor.
- Normal departures disappear immediately; broken connections expire after heartbeat timeout.
- Offline states clear stale peers. Reconnection is automatic.
- Motion settings persist; reduced-motion users get nonanimated cursor positioning.
- Names are plain text, limited to 24 characters.
- Up to 80 simultaneous connections per room. Display names are unverified, not authenticated identities.

## Checks

    npm run typecheck
    npm run test:realtime
    npm run build
    npm run check

Browser checks require installed Google Chrome and run against the production build. Screenshots are saved under qa/.

Coverage: real WebSocket and polling clients, invalid input, burst throttling, name sanitization, disallowed origins, leave/reconnect, and two independent browser sessions verifying movement, names, counts, scrolling, private fields, and server failure. UI checks cover 1440/768/390/320 widths, filters/search, modal focus, mobile navigation, motion settings, résumé delivery, and form validation.

## Automatic header-to-footer build demo

On each fresh page load, when Motion is on, three labelled demo cursors assemble the actual page from header to footer. The page scrolls automatically to keep each section in view. Text is revealed in steps; images, cards, controls, and form fields are assembled in separate passes. The full sequence adapts to the viewport and takes longer on phones because fewer cards fit on screen at once.

- Use Replay Build in the header to run it again from the top.
- Use Skip intro or Escape to show the whole page immediately.
- Mouse-wheel scrolling, touch scrolling, clicking page content, or keyboard navigation lets you take control.
- Motion off and the operating system's reduced-motion preference disable autoplay.
- The demo runs entirely in the browser, including on static hosting. It needs no backend or second visitor.
- Demo cursors are labelled and kept separate from the real online visitor count. Real visitor overlays return when the intro ends.
- Deep links and restored scrolled positions skip autoplay.

Run npm run check:intro to verify the complete automatic tour, replay, skip controls, reduced motion, viewport behavior, and visitor-count isolation.

## Deploy to GitHub Pages

The workflow is .github/workflows/deploy.yml. It must be placed at the root of the GitHub repository under .github/workflows/, even if the app itself lives in a portfolio/ subfolder. The workflow detects either source layout.

1. In the GitHub repository, open Settings > Pages and set Source to GitHub Actions.
2. Commit and push the workflow and source changes to the repository's default branch.
3. Open Actions > Deploy portfolio to GitHub Pages and wait for success. You can also use Run workflow on the default branch.
4. Open the URL from the successful deployment or Settings > Pages.

The workflow uses the actual Pages base path and URL, so user sites, repository sites, and configured custom domains do not need a hardcoded repository name. It installs dependencies with npm ci, type-checks/builds, runs the server checks, and uploads only dist.

If `actions/configure-pages` reports `Get Pages site failed` or `HttpError: Not Found`, open https://github.com/tasminoni/tranding-portfolio/settings/pages and select **GitHub Actions** under **Build and deployment > Source**, then rerun the failed workflow. Adding `enablement: true` alone does not fix this: automatic enablement requires a separate privileged token instead of GITHUB_TOKEN. If Pages settings are unavailable, check your repository permissions and GitHub plan support for the repository's visibility.

The workflow pins `ubuntu-24.04` to avoid automatic runner OS migrations. The `ubuntu-latest` migration notice is informational and does not cause the Pages API failure.

Root and repository-subfolder deployments are checked with:

    npm run typecheck
    npm run check:pages

The automatic build animation works on GitHub Pages. The live room remains honestly offline unless an external Node backend is configured. For that optional backend, add a repository Actions variable named VITE_PRESENCE_URL and allow the GitHub Pages origin on the backend.

To test a different base path manually, set VITE_BASE_PATH (for example /sample-portfolio/) and VITE_SITE_URL (the complete final URL) before npm run build. Leave them unset for local Node hosting or the existing Sites deployment.
