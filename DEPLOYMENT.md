# NTUVBCUP deployment

## Stage 1: static Cloudflare Pages site

This release remains a browser-local scheduling tool. Publishing it does not publish the organizer's scores or synchronize visitors. GitHub deployments update code only.

### Local validation

From this repository, run:

```sh
npm run build
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Node.js is required for packaging; no dependency installation is needed locally. The build copies website assets to `dist/`, excluding JSON backups, package files, scripts, and documentation. Existing googleapis dependency is not needed by the static build.

Use a separate browser profile for testing. Create custom teams, include tags, generate both a round robin and elimination bracket, press Save Game Creation, enter scores, check progression and the calendar, reload, then export and import a backup. Also exercise NTU Cup and Newbie Cup. Browser interaction checks are manual and must pass before treating the release as validated for tournament use.

### Connect GitHub

1. Commit and push the deployment files to `AndrewB12201001/NTUVBCUP` on `main`. Review `git diff` first; do not include unrelated `.DS_Store` changes.
2. Sign in at https://dash.cloudflare.com and open Workers & Pages. Create a **Pages** project and choose Git integration / Import an existing Git repository (dashboard wording may vary).
3. Authorize Cloudflare's GitHub installation for this repository and select it.
4. Use these settings:

| Setting | Value |
| --- | --- |
| Project name | `ntuvbcup` if available |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave empty (repository root) |

5. Deploy and open the exact `https://<project>.pages.dev` URL shown by Cloudflare. Check the build log if deployment fails.
6. Repeat the manual checks above on HTTPS. Verify a nonexistent path returns the 404 page and `/src/assets/ntu-cup-backup-3.json` is unavailable. The root `404.html` prevents Pages from treating this multipage application as an SPA.
7. Pushes to `main` subsequently deploy code automatically. Use preview branches for changes; previews have separate browser storage.

The generated output is ignored by Git; Cloudflare builds it from the committed source. Do not upload the repository root as the public directory.

### Existing data

Export using the current app's backup control **before** changing URLs. Keep a copy outside the browser. Import it at the new HTTPS address and verify teams, tournaments, matches, and scores. Storage is separate for localhost, pages.dev, custom domains, browser profiles, and devices. Code rollback does not restore browser data. Test restoration with a disposable browser profile before relying on a backup. Do not clear the original browser's data until verification succeeds.

### Release limitations

User-provided names, tags and imported data reach `innerHTML` in existing renderers, including `customTournament.js`. This release does not fix all rendering sinks. Only use trusted data during the initial trial; safe rendering throughout the application is a prerequisite for shared database content. No authentication, server validation, shared scores, rate limiting, or audit log is implemented. The response headers added here do not solve HTML injection. Existing external libraries/fonts still load from CDNs.

## Stage 2: custom domain

Select and register a domain after checking its purchase **and renewal** price; availability and a $10/year price have not been verified. In the Pages project's Custom domains tab, select Set up a custom domain and follow the wizard. For an apex domain such as `ntuvb.com`, Cloudflare requires the domain as a zone in the same account and its nameservers configured at the registrar. Preserve existing mail and verification DNS records. A subdomain can use an external DNS provider with the CNAME Cloudflare specifies. Associate the domain in Pages before adding a manual CNAME.

Wait for domain activation and HTTPS, then repeat the smoke checks. Export/import again because the custom domain has different localStorage. Choose one canonical hostname; defer redirecting pages.dev until users have exported data there.

## Subsequent stages and acceptance criteria

Implement one stage at a time, after the preceding stage is usable:

1. **Database and safe rendering:** replace unsafe user-content interpolation across all views; add Supabase schema and migrations for organizations, membership, teams, tournaments, entries, matches, scores and audit events. Start with deny-by-default row-level security. Import backups with validation, stable IDs and an idempotent migration process. Validate record counts and bracket relationships. Keep the local mode available until migration is verified.
2. **Authentication:** enable Supabase Auth before permitting remote writes. Test with two organizer accounts that neither can read private data or modify the other's tournament. Never ship a service-role key. Public reads must be limited to deliberately published data.
3. **Organizer score entry:** build `/admin`, enforce permissions and score rules on the server, make score/audit/bracket changes transactional, handle concurrent edits and finalized matches, and add rate limits. Test corrections, duplicates and unauthorized requests. Back up the database and test a restore.
4. **Public tournament pages:** add stable tournament URLs with read-only schedules, standings and matches. Begin with polling, then consider Realtime. Test that two independent browsers see the same authorized result and private tournaments stay private. Configure routing for these future routes when implemented.
5. **Monetization:** add accurate about/contact/privacy pages using the actual operator details and deployed services, then analytics with appropriate disclosures. Measure real traffic before estimating ad revenue. Put ads only on suitable read-only pages, evaluate sponsorships and paid organizer features, and review current provider policies before activation.

Do not expose database writes first and add authentication later. Domain purchase, Cloudflare authorization and a Supabase project require the owner's account choices; credentials should not be pasted into chat.

## Rollback

For a bad static release, use Cloudflare Pages' deployment rollback to a previously successful production deployment, or revert the offending code commit and redeploy. Keep the exported browser backups separately; deployment rollback affects code, not localStorage. Schema changes later need an explicit database recovery strategy.

## Official references

- Static HTML: https://developers.cloudflare.com/pages/framework-guides/deploy-anything/
- Build settings: https://developers.cloudflare.com/pages/configuration/build-configuration/
- Custom domains: https://developers.cloudflare.com/pages/configuration/custom-domains/
- Routing and 404: https://developers.cloudflare.com/pages/configuration/serving-pages/
