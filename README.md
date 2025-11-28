# Etiqa Assessment

This project is a small React app for the "React Mobile Developer Assessment". It lists the most-starred GitHub repositories created in the last 10 days and provides an infinite-scroll experience.

Current status: Fetching and infinite-scroll list implemented, responsive mobile-first UI, and run instructions below.

Quick start (Windows / cmd.exe):

1. Install dependencies:

	npm install

2. Start the dev server:

	npm run dev

3. Open the app using the printed Local URL (for example http://localhost:3000)

Notes:
- Uses Vite + React. The app calls the GitHub Search API.
- If you hit rate limits while testing, provide a personal GitHub token via environment variables or test sporadically.
- Features pagination with 30 results per page, date of upload, sorted of most starred repos and autoscroll back to top when switching page.


