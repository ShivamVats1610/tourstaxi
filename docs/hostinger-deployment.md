# Hostinger deployment

Use the Node.js application deployment with these commands:

- Install: `npm ci` (include development dependencies for the build).
- Build: `npm run build`.
- Start: `npm start`.
- Node.js: 22 LTS.

The production build explicitly uses `next build --webpack`. This avoids the
Turbopack PostCSS worker failure shown in the Hostinger build logs for
`app/globals.css`. If a custom build command is configured in Hostinger, set it
to `npm run build` so it uses the project's build script.

Upload `tourstaxi-deploy.zip` with `package.json` at the archive root. The archive
includes application sources, public assets, configuration and the npm lockfile;
it excludes local dependencies, build output, Git files, logs and `.env.local`.
Set the application's environment variables in Hostinger before building,
including all required `NEXT_PUBLIC_*` variables, which are embedded at build
time. Use `.env.example` as the variable checklist.
