import fetch from "node-fetch";
import express from "express";
import fs from "fs";
import path from "path";

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const cached = {
  NightMarket: null,
  PictureAds: null,
  LevelTools: null,
  LevelItems: null
};

cache().then(() => console.log("Successfully loaded cache.")).catch((e) => {
  console.error(e)
  localCache()
})
function cache() {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await fetch('https://api.spigotmc.org/legacy/update.php?resource=105386', {cache: "no-cache"});
      cached.PictureAds = await res.text();

      res = await fetch('https://api.spigotmc.org/legacy/update.php?resource=105789', {cache: "no-cache"});
      //cached.NightMarket = fs.readFileSync("NightMarket.txt", { encoding: "UTF-8" });
      cached.NightMarket = await res.text();

      res = await fetch('https://api.spigotmc.org/legacy/update.php?resource=97516', {cache: "no-cache"});
      cached.LevelTools = await res.text();

      cached.LevelItems = fs.readFileSync("LevelItems.txt", { encoding: "UTF-8" });

      console.log(cached);

      fs.writeFileSync("PictureAds.txt", cached.PictureAds, { encoding: "UTF-8" })
      fs.writeFileSync("NightMarket.txt", cached.NightMarket, { encoding: "UTF-8" })
      fs.writeFileSync("LevelTools.txt", cached.LevelTools, { encoding: "UTF-8" })
      fs.writeFileSync("LevelItems.txt", cached.LevelItems, { encoding: "UTF-8" })
      resolve()
    } catch (e) {
      reject(e)
    }
  });
}

function localCache() {
  cached.PictureAds = fs.readFileSync("PictureAds.txt", { encoding: "UTF-8" });
  cached.LevelTools = fs.readFileSync("LevelTools.txt", { encoding: "UTF-8" });
  cached.NightMarket = fs.readFileSync("NightMarket.txt", { encoding: "UTF-8" });
  cached.LevelItems = fs.readFileSync("LevelItems.txt", { encoding: "UTF-8" });
  console.log("Loaded local-cache because SpigotMC API failed.")
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "info.html"))
});

// "logging" IPs so i can see if anybody abusing the API, not gonna add ratelimit or such rn cause honestly idc its replit.com's servers but if it starts lagging stuff out i'll add ratelimit per IP

app.get('/nightmarket', (req, res) => {
  res.send(cached.NightMarket);
  console.log("API Hit for NightMarket: " + (req.headers['x-forwarded-for'] || req.socket.remoteAddress));
});

app.get('/pictureads', (req, res) => {
  res.send(cached.PictureAds);
  console.log("API Hit for PictureAds: " + (req.headers['x-forwarded-for'] || req.socket.remoteAddress));
});

app.get('/leveltools', (req, res) => {
  res.send(cached.LevelTools);
  console.log("API Hit for LevelTools: " + (req.headers['x-forwarded-for'] || req.socket.remoteAddress));
});

app.get("/levelitems", (req, res) => {
  res.send(cached.LevelItems);
  console.log("API Hit for LevelItems: " + (req.headers['x-forwarded-for'] || req.socket.remoteAddress));
})

app.listen(3000, () => {
  console.log('server started');
});

console.log("Commands: /reload : Reloads cache")
process.openStdin().addListener("data", (d) => {
  const msg = d.toString().trim();

  if (msg === "/reload") {
    cache().then(() => console.log("Successfully reloaded cache.")).catch((e) => {
      console.error(e);

      localCache()
    })
    return;
  }

  console.log("Command not found.")
});