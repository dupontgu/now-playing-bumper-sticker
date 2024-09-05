// This approach will use the canvas API to render text to an image and return it as a PNG.
// We'll use the built-in Canvas API available in Deno, which doesn't require any external libraries.
// The tradeoff is that we're limited to basic text rendering without advanced styling options.

import { createCanvas } from "https://deno.land/x/canvas/mod.ts";
import {existsSync} from "https://deno.land/std/fs/mod.ts";
import { getRecentPlay } from "https://esm.town/v/dupontgu/rottenCoralLandfowl";
// this is dumb - the canvas library doesn't measure text properly with custom fonts, 
// so I wrote a python script to measure relative width of Impact glyphs
const CHAR_WEIGHTS = [40, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 7, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 7, 11, 15, 25, 22, 28, 24, 7, 13, 13, 11, 21, 7, 12, 7, 16, 21, 15, 20, 21, 20, 21, 22, 16, 21, 22, 8, 8, 21, 21, 21, 21, 31, 22, 22, 22, 22, 17, 16, 22, 22, 12, 13, 22, 15, 29, 22, 22, 20, 22, 22, 21, 19, 22, 23, 33, 20, 21, 16, 11, 16, 11, 20, 24, 13, 20, 21, 20, 21, 20, 12, 21, 21, 11, 12, 20, 11, 31, 21, 20, 21, 21, 14, 19, 13, 21, 19, 28, 18, 19, 14, 15, 11, 15, 21, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 7, 11, 21, 21, 22, 21, 11, 19, 15, 31, 13, 15, 21, 0, 31, 24, 14, 21, 13, 13, 14, 19, 23, 17, 13, 10, 13, 15, 25, 26, 28, 21, 22, 22, 22, 22, 22, 22, 30, 22, 17, 17, 17, 17, 13, 13, 16, 15, 22, 22, 22, 22, 22, 22, 22, 21, 25, 22, 22, 22, 22, 21, 20, 22, 20, 20, 20, 20, 20, 20, 30, 20, 20, 20, 20, 20, 13, 13, 17, 15, 20, 21, 20, 20, 20, 20, 20, 21, 20, 21, 21, 21, 21, 19, 21, 19]
const HEIGHT = 220;
const WIDTH = 960;
const ADJ_WIDTH = WIDTH * 0.9;
const DEFAULT_FONT = "Impact";

function fontUpdate(pixSize, font = DEFAULT_FONT) {
  return `${pixSize}px ${font}`;
}

// return the relative width of a string rendered with Impact font
function textScore(text) {
  var score = 0;
  for (let i = 0; i < text.length; i++) {
    const asciiCode = text.charCodeAt(i);
    score += CHAR_WEIGHTS[asciiCode] + 3;
  }
  return score;
}

export async function processRequest(req: Request): Promise<Response> {
  const searchParams = new URL(req.url).searchParams;
  let format = searchParams.get("format");
  const play = JSON.parse(await getRecentPlay().then(i => i.text()));
  let fontFile = await fetch(
    "https://github.com/sophilabs/macgifer/raw/master/static/font/impact.ttf",
  );
  const fontBlob = await fontFile.blob();
  let fontBytes = new Uint8Array(await fontBlob.arrayBuffer());
  return render(format == undefined, play.song, play.artist, fontBytes);
}

export async function render(textOutput: Boolean, song: String, artist: String, fontBytes: Uint8Array): Promise<Response> {
  const canvas = createCanvas(WIDTH, HEIGHT);
  canvas.loadFont(fontBytes, { family: DEFAULT_FONT });
  const ctx = canvas.getContext("2d");
  // Set up the canvas
  ctx.fillStyle = "yellow";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "black";
  ctx.font = fontUpdate(87);

  // Render the text
  ctx.fillText("Keep Honking!", 20, 95);
  ctx.font = fontUpdate(62);
  ctx.fillText("I'm Listening to", 550, 91);
  ctx.font = fontUpdate(72);

  let fullText = `${song} by ${artist}`;
  var metaDataSize = 96;
  const widthDivFactor = 47;
  ctx.font = fontUpdate(metaDataSize);
  var textWidth = (textScore(fullText) * metaDataSize) / widthDivFactor;
  while (textWidth > ADJ_WIDTH) {
    metaDataSize -= 2;
    textWidth = (textScore(fullText) * metaDataSize) / widthDivFactor;
  }
  ctx.font = fontUpdate(metaDataSize);
  // ctx.fillRect(0, 0, textWidth, 50);
  ctx.fillText(fullText, (WIDTH - textWidth) / 2, 150 + (metaDataSize / 2));
  
  // either render as an html page with image embedded, or download png image directly
  if (!textOutput) {
    const pngData = canvas.toBuffer("image/png");
    return new Response(pngData, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": "attachment; filename=bumper-sticker.png",
      },
    });
  } else {
    const page = "<html><body><img src=\"" + canvas.toDataURL() + "\" /></body></html>";
    return new Response(page, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  }
}
export default processRequest;