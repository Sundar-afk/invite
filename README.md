# Sundar & Harini Wedding Invitation

A lightweight, bilingual static wedding invitation built with HTML, CSS, and vanilla JavaScript. The English site is at the project root. The Tamil site is a complete, independently deployable copy in `tamil/`; its opening screen is in English and the invitation is in Tamil.

## Personalise the invitation

Edit `js/config.js` for the English site or `tamil/js/config.js` for the Tamil site. The `weddingConfig` object controls names, ceremony and reception dates, venue, map link, photos, music, and the page's text. Keep event timestamps in ISO format with the India offset, for example `2026-11-13T07:35:00+05:30`.

Replace the images at `assets/images/couple.jpg`, `couple2.jpg`, and `background.jpg`. The Tamil site has its own copies under `tamil/assets/images/`. Keep the filenames or update the corresponding image paths in that site's config. JPG, PNG, and WebP images work; the layout crops images to fit, so the originals do not need a particular pixel size. Add descriptive alt text in the matching `coupleImageAlt` and `couple2ImageAlt` settings.

Replace the music at `assets/music/wedding.mp3` and `tamil/assets/music/wedding.mp3`, or change the `music` path in the relevant config. Music starts only after the visitor opens the invitation. If the file is missing, the invitation, countdown, calendar, and sharing still work.

The venue address, Google Maps URL, ceremony start/end, and reception date are configured in the same object. The calendar download includes the timed wedding ceremony and a reception entry for 12 November (listed as evening; no exact time is set). The countdown targets the ceremony start in India Standard Time.

## Test locally

Open `index.html` directly, or serve the project root with a local static server for navigation and deployment-like testing. For example, with Python installed:

```powershell
python -m http.server 8000
```

Then visit `http://localhost:8000/` for English and `http://localhost:8000/tamil/` for Tamil. Stop the local server with Ctrl+C.

## Deploy to GitHub Pages

1. Create a GitHub repository and upload the project files, keeping the `tamil/` folder and its contents.
2. In the repository, open **Settings → Pages**.
3. Choose **Deploy from a branch**, select the `main` branch and `/ (root)`, then save.
4. Share the English URL for the root page and add `/tamil/` for the Tamil page. Both variants work from the same static deployment.

For example, the deployed paths look like `https://username.github.io/repository/` and `https://username.github.io/repository/tamil/`.

## Deploy to Vercel

Create two Vercel projects from the same Git repository if you want two independent deployment URLs:

- English project: set **Root Directory** to `.`.
- Tamil project: set **Root Directory** to `tamil`.

No build command or output directory is needed for either project; these are static HTML sites. Deploy each project and share its generated domain.

## Custom domain

For GitHub Pages, add the domain in **Settings → Pages → Custom domain**, then set the DNS records at your domain provider as GitHub Pages instructs. For Vercel, add the domain under the project's **Settings → Domains**, then configure the DNS records shown there. Allow time for DNS propagation and enable HTTPS once the host reports the domain is ready.

The Tamil copy is intentionally self-contained for separate deployment. If you change shared styles or interactions later, copy the updated files from `css/` and `js/` into `tamil/css/` and `tamil/js/` as well.
