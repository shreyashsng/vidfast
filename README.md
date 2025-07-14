# vidfast-api

A Node.js API that uses Puppeteer to scrape fetch/XHR JSON responses from https://vidfast.net.

## Setup

1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the server:
   ```sh
   npm start
   ```

## Usage

- Send a GET request to `http://localhost:3000/scrape`.
- The API will return an array of JSON responses captured from XHR/fetch requests on vidfast.net.

## Deployment

- This project is ready for deployment on platforms like Render, Railway, or Heroku.
- If deploying, ensure the `--no-sandbox` flag is used for Puppeteer (already set in the code).

## Notes

- The `/scrape` endpoint waits 15 seconds for network activity. Adjust as needed.
- Only JSON responses are returned.
