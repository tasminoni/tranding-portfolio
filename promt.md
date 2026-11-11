# Reusable Prompt: Premium Portfolio with an Automatic Website-Building Animation

## How to use this prompt

1. Copy this file into your AI coding assistant.
2. Replace the placeholders in the configuration below.
3. Attach your résumé, portrait, project screenshots, and any relevant project information.
4. Remove optional fields you do not want to share.
5. Ask the assistant to implement the complete working website.

You can leave optional information blank. The assistant must omit missing content gracefully rather than invent facts.

---

## Your role and objective

Act as a senior creative frontend developer, full-stack engineer, and UI/UX designer.

Build a complete, responsive personal portfolio tailored to my identity and profession. Its main visual attraction must be an **automatic animation in which several labelled demo cursors appear to construct the real website, while the page scrolls smoothly from the header to the footer**.

This is a working website, not a screenshot, video, loading screen, or static mockup.

The portfolio should remain useful after the animation and with animations disabled. Prioritize polished design, authentic content, accessibility, performance, and maintainable source code.

If enabled, also add real multiplayer visitor cursors. The automatic build demonstration and real visitor presence are two separate features. Implement them separately and never confuse their labels or counts.

## 1. Personalization configuration

Use these values as the single source of truth. Replace bracketed placeholders before showing content on the finished site.

~~~yaml
identity:
  fullName: "[YOUR FULL NAME]"
  displayName: "[SHORT NAME OR BRAND]"
  profession: "[YOUR PROFESSION]"
  subtitle: "[YOUR SPECIALTY OR SECONDARY ROLE]"
  location: "[CITY, COUNTRY]"
  introduction: "[A SHORT, TRUE INTRODUCTION]"
  biography: "[YOUR BACKGROUND, APPROACH, AND INTERESTS]"
  availability: "" # Optional; do not assume availability.

contact:
  email: "[YOUR CONFIRMED BUSINESS EMAIL]"
  github: "" # Optional full URL.
  linkedin: "" # Optional full URL.
  otherLinks: []
  showPhone: false
  phone: ""

assets:
  resume: "" # Supplied file path or verified URL.
  portrait: "" # Supplied portrait only; optional.
  favicon: "" # Generate an initials icon if blank.

content:
  projects: [] # Populate only from my supplied information.
  skills: []
  experience: []
  education: []
  testimonials: [] # Only real, permissioned quotes.
  awards: [] # Only verified achievements.

appearance:
  theme: "dark"
  background: "#0b0c12"
  text: "#edeef5"
  accent: "#b3a0f4"
  secondaryAccent: "#8adeb6"
  mutedText: "#9698aa"
  displayFont: "Space Grotesk"
  bodyFont: "Manrope"
  codeFont: "JetBrains Mono"
  style: "premium, modern, editorial, subtle glass panels"
  language: "English"

features:
  automaticBuildDemo: true
  autoplayBuildDemo: true
  replayBuildButton: true
  showDemoLabels: true
  enableMultiplayer: true # Set false for a simpler static-only site.
  projectSearchAndFilters: true
  projectDetailDialogs: true
  contactForm: "email-draft" # Does not send email automatically.
  showResumeDownload: true # Only when a real file/link is supplied.

deployment:
  publish: false # Deliver locally first unless I explicitly request publication.
  websiteUrl: "" # Do not invent a domain.
  backendUrl: "" # Only needed when multiplayer uses a separate backend.
~~~

Adapt the layout and wording to my profession. Do not assume everyone is a developer. For a designer, photographer, student, consultant, or other professional, replace the code-oriented hero illustration with an appropriate visual treatment.

If my résumé conflicts with the configuration, use my explicit instructions and flag unresolved factual conflicts. Ask only necessary questions; continue independent implementation while waiting.

## 2. Main attraction: automatic header-to-footer build demo

This feature is essential. Ordinary entrance fades or real-time visitor cursors alone do not satisfy this requirement.

### What visitors should see

When a visitor opens the page with motion enabled:

1. The page begins near the top with a subtle layout scaffold.
2. Three or four colored demo cursors enter naturally.
3. Each cursor has a small role label, such as Layout, Typography, or Code, and a clear demo indicator.
4. They trace frames, pause, click, write text, and assemble actual page elements.
5. The camera scrolls down automatically as construction progresses.
6. Every existing section is built in order: header, hero, projects, about, skills, experience, education, contact, and footer.
7. The sequence finishes at the footer, leaving the complete website ready to use.

The demo must work when only one person visits, without a backend connection.

### Make the construction feel natural

- Use curved travel paths and eased movement, not constant-speed straight lines.
- Give each cursor a slightly different pace and small pauses before actions.
- Coordinate parallel tasks: one cursor lays out a frame, another reveals text, another assembles controls.
- Build content in meaningful pieces rather than revealing an entire section at once.
- Reveal headings and code-like text in typing-style steps.
- Let images, cards, and buttons settle gently into place after their outlines are drawn.
- Use restrained click rings, corner handles, and short task labels.
- Keep cursors aligned with the elements they appear to manipulate.
- Preserve readability; avoid excessive shake, flashing, blur, or rapid camera jumps.
- Frame each task long enough to understand it.
- Do not jump backward through the document unexpectedly.

Aim for approximately 25–45 seconds on desktop. Adapt the duration to the actual content and viewport; phones may require additional scenes. Do not stretch the animation with meaningless idle time.

### Automatic scrolling and responsive scenes

- Calculate positions from the actual DOM, not fixed coordinates designed for one screen.
- Coordinate document positions, viewport positions, and scroll offsets correctly.
- Scroll the active construction area into view before revealing it.
- Respect the sticky header and bottom animation controls.
- Split long sections into smaller scenes when they do not fit on screen.
- On desktop, multiple cards in a row may build together.
- On mobile, move through cards and form fields in smaller groups.
- Avoid hiding or building important content outside the visible construction area.
- Reserve image dimensions so lazy-loading does not break alignment.

### Required controls and accessibility

- Add a visible **Replay Build** button to the header.
- Add a persistent **Skip intro** control during the animation.
- Display the current construction stage and overall progress.
- Label the experience as an animated demo, not as real visitors or an actual deployment.
- Replay must return to the top and rebuild the page.
- Natural completion must finish at the footer.
- Skip, Escape, manual wheel/touch scrolling, and keyboard navigation must stop the tour and reveal everything immediately.
- Clicking normal page content should hand control back to the visitor.
- Do not mistake the animation's own programmatic scrolling for manual scrolling.
- Keep the controls usable at 320 px width.
- Respect the operating system's reduced-motion preference.
- Persist the site's Motion on/off preference.
- With motion disabled, immediately show the complete page and do not auto-scroll.
- Do not restart the intro because of an ordinary React re-render or a visitor-presence update.
- Skip autoplay for deep links or restored scrolled positions.
- Clean up animation frames, event listeners, temporary styles, and element state on completion, cancellation, navigation, and unmount.
- Never leave content hidden if the animation is interrupted.
- Do not modify form values or send messages during the demonstration.

Use local application code and existing animation libraries. Do not inject an unreviewed third-party effect script.

## 3. Optional real multiplayer visitor cursors

Implement this section when enableMultiplayer is true.

Use Node.js with Socket.IO or a genuine WebSocket backend. Two independent browser sessions must exchange real cursor movements.

Requirements:

- Assign a unique ID to each connected session.
- Assign a color and readable default display name.
- Allow visitors to change their display name.
- Show a small online-session counter, including the current session.
- Explain that multiple tabs count separately; do not imply authenticated unique people.
- Broadcast pointer movements to other connected sessions.
- Throttle client updates to roughly 20 per second and validate/rate-limit them on the server.
- Use section-relative coordinates so different screen sizes and scroll positions remain meaningful.
- Smooth remote movement when motion is enabled.
- Hide offscreen pointers and remove disconnected visitors.
- Handle broken connections with heartbeat timeouts.
- Reconnect automatically and discard stale visitor state.
- Provide a Leave/Join live room control.
- Do not transmit contact-form contents or pointer positions over private input fields.
- Treat names as plain text, limit their length, and validate coordinates.
- Keep decorative demo cursors out of the real online count.
- Hide or visually separate the real cursor overlay during the build demo.
- Do not fabricate visitors when nobody else is connected.
- If the backend is unavailable, show an honest offline state.

A shared database or multi-instance adapter is not required for an initial single-server deployment. Document the limitation: an in-memory room only synchronizes clients connected to that server instance.

## 4. Website content and structure

### Header

Use an original name/initials wordmark, sticky navigation, active-section indication, contact action, Replay Build, Motion toggle, and accessible mobile menu. Escape should close the menu.

Only link to sections that actually exist.

### Hero

Include:

- “Hi, I'm [YOUR FULL NAME]” or a profession-appropriate equivalent.
- My profession and specialty.
- A concise introduction based on my supplied facts.
- Explore My Work and Let's Connect actions.
- Location and résumé download when supplied.
- A subtle interactive background.
- A suitable visual: a personalized code/workspace panel for a developer, a real supplied portrait, or another original profession-appropriate composition.

Do not create a synthetic portrait and present it as a photograph of me.

### Projects

Use only my real projects. A project record may contain:

~~~json
{
  "id": "project-slug",
  "title": "[REAL PROJECT NAME]",
  "category": "[PROJECT CATEGORY]",
  "summary": "[SHORT TRUE DESCRIPTION]",
  "description": "[THE PROBLEM AND WHAT I CONTRIBUTED]",
  "responsibilities": [],
  "tools": [],
  "outcomes": [],
  "image": "",
  "liveUrl": "",
  "sourceUrl": "",
  "year": "",
  "featured": true
}
~~~

Provide responsive cards, meaningful category filters, search, a useful empty state, and accessible detail dialogs.

Use actual supplied screenshots or verified captures of my own project websites. If a reliable screenshot is unavailable, use clearly labelled concept art. Never present a fabricated interface as a real screenshot.

Show Live site and Source code links only when genuine URLs are supplied. A personal GitHub profile is not a project repository; label it separately.

If only a project name is provided, do not invent its technology stack, achievements, or description. Omit it or clearly mark that details are pending.

### About and skills

Include my true professional introduction, interests, approach, and background. Use a modern split layout and scannable content.

Build technology/tool cards from my supplied skills. Use restrained hover motion and suitable icons. Do not invent proficiency percentages, years of experience, or skill claims.

### Experience and education

Use an expandable timeline with actual organizations, roles, dates, and responsibilities. Show education only when supplied.

If I have no employment history, use real independent projects or learning milestones instead of invented jobs.

### Contact

Include verified email and supplied social links.

The default form must validate input and open an email draft. Clearly explain that the visitor sends the message in their email app. Never show “message sent” without confirmation from a real sending backend.

Do not expose references' contact details from a résumé. Show my phone number only when explicitly enabled.

### Footer

Include my name, current year, working links, and a back-to-top control. Make the footer the final scene of the build animation.

## 5. Visual direction

- Near-black background, warm or cool off-white text, and a restrained accent.
- Strong typography, generous spacing, thin borders, and clear section hierarchy.
- Subtle gradients and selective translucent panels.
- Original composition; do not copy another person's identity or project media.
- Accessible contrast and visible keyboard-focus states.
- Responsive layouts from 320 px through large desktops.
- No horizontal overflow.
- Touch targets at least 44 px for primary controls.
- Meaningful image alt text, reserved dimensions, and lazy loading below the fold.
- Avoid heavy animation libraries beyond those needed for the experience.
- Do not autoplay sound.

## 6. Technical architecture

Preferred stack:

- React with TypeScript.
- Vite.
- Tailwind CSS plus focused custom CSS.
- Framer Motion and/or native browser animation APIs.
- Lucide or another lightweight icon library.
- Node.js and Socket.IO if multiplayer is enabled.

Keep personal data in a central configuration module. Separate the build-demo engine, real visitor presence, UI components, and server logic.

Suggested structure:

~~~text
portfolio/
  package.json
  index.html
  vite.config.ts
  tsconfig.json
  .env.example
  README.md
  public/
    assets/
  src/
    main.tsx
    site.ts
    types.ts
    styles.css
    components/
      Hero.tsx
      BuildSequence.tsx
      Presence.tsx
      ProjectGrid.tsx
      ProjectDialog.tsx
      TechStack.tsx
      ContactForm.tsx
  server/
    index.mjs
  scripts/
  tests/
~~~

The exact structure may vary, but the source must remain easy to edit.

Required commands:

- npm install
- npm run dev
- npm run build
- npm start for a production Node deployment
- Appropriate type-check and verification commands

### Local startup must be straightforward

When multiplayer is enabled, one development command must start both the frontend and real-time backend on the same origin.

Detect an occupied development port and either select a free port or report a clear error. Print the exact working URL. Avoid accidentally opening an older frontend-only server that lacks the live backend.

Provide health checks, graceful shutdown, configurable host/port values, and a documented Node version.

### Hosting

The automatic build animation works on static hosting.

The Node/Socket.IO backend requires a Node-compatible host with WebSocket support. Do not claim that uploading static files deploys the backend.

Prefer serving frontend and backend together. If they use separate domains:

- Configure a public frontend backend-URL setting.
- Configure the backend's allowed frontend origins.
- Preserve WebSocket upgrades through the hosting proxy.
- Keep credentials and secrets out of browser code and version control.

Provide deployment instructions and optionally a Dockerfile. State clearly which deployment steps were actually tested.

Do not publish, change an existing site's audience, or incur hosting charges unless I have authorized it.

## 7. Accessibility, reliability, and verification

Run the available checks and report the actual results. Do not claim tests passed unless they were executed.

### Build-demo checks

- Autoplay starts under the intended conditions.
- Demo cursors actually move.
- The page scrolls automatically from header to footer.
- Every existing section participates in construction.
- Mobile scenes keep the elements being built visible.
- The sequence finishes with all content revealed.
- Replay works from the middle and bottom of the page.
- Skip, Escape, manual scrolling, and keyboard takeover restore the complete page.
- Motion off and reduced motion show content immediately.
- Interruption leaves no hidden elements, blocked controls, or stale overlays.
- Demo activity does not change the real online count.

### Website checks

- Representative widths: 1440, 768, 390, and 320 px.
- No horizontal overflow or broken primary controls.
- Search, filtering, empty states, dialogs, Escape, and focus restoration.
- Working navigation, résumé download, and supplied links.
- Form validation and honest email-draft behavior.
- Correct title, description, favicon, and canonical URL when known.
- No unintended previous-owner information or placeholder text.
- No application runtime errors.

### Multiplayer checks, if enabled

Use two independent browser contexts or separate browsers, not just an animation or local-storage trick.

Verify real movement, names, connection counts, disconnect/reconnect, invalid-input handling, rate limits, privacy around form fields, different scroll positions, and an honest offline state.

## 8. Delivery instructions

Implement the complete project rather than stopping at a plan.

At handoff, provide:

1. The working local project and its location.
2. Exact startup commands and the URL to open.
3. A short explanation of autoplay, auto-scroll, Replay Build, and Skip intro.
4. Where to edit personal details, projects, assets, and appearance.
5. Which checks passed and any verification limits.
6. Missing personal assets or factual information.
7. A deployed link only if publication was authorized and succeeded.
8. Any remaining backend-hosting requirement, clearly distinguished from completed local functionality.

Proceed using my configuration and attached materials. Make sensible implementation decisions, avoid unnecessary questions about optional fields, and keep all personal claims grounded in the information I supplied.
