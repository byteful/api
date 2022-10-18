const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const app = express();
const path = require('path')

const cached = {
  NightMarket: null,
  PictureAds: null,
  LevelTools: null
};

cache().then(() => console.log("Successfully loaded cache.")).catch((e) => {
  console.error(e)
  localCache()
})
function cache() {
  return new Promise(async (resolve, reject) => {
    try {
      let res = await fetch('https://api.spigotmc.org/legacy/update.php?resource=105386');
      cached.PictureAds = await res.text();

      //res = await fetch('https://api.spigotmc.org/legacy/update.php?resource=105789');
      cached.NightMarket = fs.readFileSync("NightMarket.txt", { encoding: "UTF-8" }); // await res.text();

      res = await fetch('https://api.spigotmc.org/legacy/update.php?resource=97516');
      cached.LevelTools = await res.text();

      console.log(cached);

      fs.writeFileSync("PictureAds.txt", cached.PictureAds, { encoding: "UTF-8" })
      fs.writeFileSync("NightMarket.txt", cached.NightMarket, { encoding: "UTF-8" })
      fs.writeFileSync("LevelTools.txt", cached.LevelTools, { encoding: "UTF-8" })
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
  console.log("Loaded local-cache because SpigotMC API failed.")
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, "info.html"))
});

app.get('/nightmarket', (req, res) => {
  res.send(cached.NightMarket);
});

app.get('/pictureads', (req, res) => {
  res.send(cached.PictureAds);
});

app.get('/leveltools', (req, res) => {
  res.send(cached.LevelTools);
});

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