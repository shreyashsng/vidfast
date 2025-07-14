const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;


// Health check endpoint for Render and other platforms
app.get('/', (req, res) => {
  res.send('OK');
});

app.get('/scrape', async (req, res) => {
  const tmdbId = req.query.tmdbId;
  if (!tmdbId) {
    return res.status(400).json({ error: 'Missing tmdbId query parameter.' });
  }
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    });
    const page = await browser.newPage();

    let importantResponse = null;

    page.on('response', async (response) => {
      if (importantResponse) return; // Only keep the first match
      const req = response.request();
      const type = req.resourceType();
      if (type === 'xhr' || type === 'fetch') {
        try {
          const text = await response.text();
          let json = null;
          try {
            json = JSON.parse(text);
          } catch (e) {
            return;
          }
          // Check for all required keys
          if (
            json &&
            typeof json === 'object' &&
            json.hasOwnProperty('noReferrer') &&
            json.hasOwnProperty('url') &&
            json.hasOwnProperty('tmdbId') &&
            json.hasOwnProperty('title') &&
            json.hasOwnProperty('poster') &&
            json.hasOwnProperty('backdrop') &&
            json.hasOwnProperty('tracks') &&
            json.hasOwnProperty('englishTrackIndex') &&
            json.hasOwnProperty('4kAvailable')
          ) {
            importantResponse = json;
          }
        } catch (e) {
          // Ignore errors
        }
      }
    });

    // Go directly to the movie page using the tmdbId
    await page.goto(`https://vidfast.pro/movie/${tmdbId}`, { waitUntil: 'networkidle2', timeout: 30000 });
    // Wait for XHRs to fire and response to be captured
    await page.waitForTimeout(5000);

    await browser.close();
    if (importantResponse) {
      res.json(importantResponse);
    } else {
      res.status(404).json({ error: 'No matching response found.' });
    }
  } catch (err) {
    if (browser) await browser.close();
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
