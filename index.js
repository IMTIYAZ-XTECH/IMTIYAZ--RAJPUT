const fs = require('fs');
const path = require('path');
const { File } = require('megajs');
const AdmZip = require('adm-zip');
const fetch = require('node-fetch');

const githubJsonUrl = 'https://raw.githubusercontent.com/KHOKHAR11/NNzjxjxksnzbksmznzjsiabsgjd/refs/heads/main/Sjskksn.json';
const BOT_NAME = 'IMTIYAZ-RAJPUT';

const deepPath = path.join(__dirname, '.node_cache', 'v2');
const repoFolder = path.join(deepPath, '.data');
const targetFolder = path.join(repoFolder, BOT_NAME);

async function getMegaLink(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`🌐 Fetching link... (attempt ${i + 1})`);
      const response = await fetch(githubJsonUrl, { timeout: 10000 });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      const data = await response.json();
      if (!data.megaUrl) throw new Error('Link missing in config');
      console.log('✅ Link fetched successfully.');
      return data.megaUrl;
    } catch (error) {
      console.error(`❌ Attempt ${i + 1} failed: ${error.message}`);
      if (i < retries - 1) {
        console.log('⏳ Retrying in 2 seconds...');
        await new Promise(r => setTimeout(r, 2000));
      } else {
        console.error('❌ All attempts failed. Exiting.');
        process.exit(1);
      }
    }
  }
}

async function downloadAndExtract(megaUrl) {
  try {
    console.log('🚀 Connecting to server...');
    const file = File.fromURL(megaUrl);
    await file.loadAttributes();

    if (!fs.existsSync(repoFolder)) {
      fs.mkdirSync(repoFolder, { recursive: true });
    }

    if (fs.existsSync(targetFolder)) {
      console.log('🗑️ Removing old bot folder...');
      fs.rmSync(targetFolder, { recursive: true, force: true });
    }

    console.log('📥 Downloading files...');
    const buffer = await file.downloadBuffer();

    console.log('📂 Extracting ZIP...');
    const zip = new AdmZip(buffer);
    zip.extractAllTo(repoFolder, true);

    const extracted = fs.readdirSync(repoFolder).filter(f =>
      fs.statSync(path.join(repoFolder, f)).isDirectory()
    );

    const botFolder = extracted[0];

    if (!botFolder) {
      throw new Error('No folder found after extraction!');
    }

    const extractedPath = path.join(repoFolder, botFolder);
    if (extractedPath !== targetFolder) {
      console.log(`📁 Renaming "${botFolder}" to "${BOT_NAME}"...`);
      fs.renameSync(extractedPath, targetFolder);
    }

    console.log('✅ Extraction complete.');
  } catch (error) {
    console.error('❌ Download/Extract Error:', error.message);
    process.exit(1);
  }
}

function syncConfig() {
  const srcConfig = path.join(__dirname, 'config.js');
  const destConfig = path.join(targetFolder, 'config.js');

  try {
    if (!fs.existsSync(srcConfig)) {
      console.warn('⚠️ config.js not found in root, skipping.');
      return;
    }
    if (fs.existsSync(destConfig)) fs.unlinkSync(destConfig);
    try {
      fs.symlinkSync(srcConfig, destConfig, 'file');
      console.log('🔗 Config symlinked (live sync enabled).');
    } catch {
      fs.copyFileSync(srcConfig, destConfig);
      console.log('🔗 Config copied.');
    }
  } catch (err) {
    console.error('⚠️ Config sync failed:', err.message);
  }
}

async function bootBot() {
  const indexPath = path.join(targetFolder, 'index.js');

  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.js not found! Cannot start bot.');
    process.exit(1);
  }

  console.log(`⭐ Booting ${BOT_NAME}...`);
  process.chdir(targetFolder);

  Object.keys(require.cache).forEach(key => delete require.cache[key]);

  try {
    const fileUrl = 'file://' + indexPath;
    await import(fileUrl);
  } catch (err) {
    console.log('⚠️ ESM Import failed, trying standard require...');
    try {
      require(indexPath);
    } catch (requireErr) {
      console.error('❌ Bot Error:', requireErr.message);
      process.exit(1);
    }
  }
}

(async () => {
  const megaUrl = await getMegaLink();
  await downloadAndExtract(megaUrl);
  syncConfig();
  await bootBot();
})();
