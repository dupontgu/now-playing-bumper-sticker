import { blob } from "https://esm.town/v/std/blob";
import * as cheerio from "npm:cheerio";

const KEY = new URL(import.meta.url).pathname;
const SCRAPE_INTERVAL = 5 * 1000;

export async function getRecentPlay(): Promise<Response> {
  try {
    // Retrieve cached data and last scrape time
    const cachedData = await blob.getJSON(KEY) as {
      song: string;
      artist: string;
      lastScrapeTime: number;
    } || { song: "", artist: "", lastScrapeTime: 0 };

    const currentTime = new Date().getTime();
    // Check if it's time to scrape again
    if (currentTime - cachedData.lastScrapeTime >= SCRAPE_INTERVAL) {
      const url = "https://www.last.fm/user/dupontgu";
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      let songName = $(".chartlist-name").first().text().trim();
      let artistName = $(".chartlist-artist").first().text().trim();

      // Update cache if new values are not blank
      if (songName && artistName) {
        await blob.setJSON(KEY, {
          song: songName,
          artist: artistName,
          lastScrapeTime: currentTime,
        });
      } else {
        songName = cachedData.song;
        artistName = cachedData.artist;
      }

      return Response.json({ song: songName, artist: artistName });
    } else {
      // Return cached data if it's not time to scrape yet
      return Response.json({
        song: cachedData.song,
        artist: cachedData.artist,
      });
    }
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}