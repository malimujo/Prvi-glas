const puppeteer = require('puppeteer');
const fs = require('fs');
const { parseStringPromise } = require('xml2js');

async function updateM3U() {
  try {
    console.log('🚀 Parsiram Telegram Prvi glas RSS...');
    
    // 1. Dohvati RSS feed
    const response = await fetch('https://feeds.transistor.fm/telegram-prvi-glas');
    const rssText = await response.text();
    
    // 2. Parsiraj XML
    const parsed = await parseStringPromise(rssText);
    const latestEpisode = parsed.rss.channel[0].item[0];
    
    const title = latestEpisode.title[0];
    const pubDate = latestEpisode.pubDate[0];
    const audioUrl = latestEpisode.enclosure[0].$.url;
    
    console.log('🎵 Najnovija epizoda:', title);
    console.log('📅 Objavljeno:', pubDate);
    console.log('🔗 Audio:', audioUrl);
    
    // 3. Kreiraj M3U
    const emisijaInfo = title.length > 50 ? title.substring(0, 50) + '...' : title;
    const m3uContent = `#EXTM3U
#EXTINF:-1 tvg-logo="https://transistor.fm/favicon.ico",Telegram Prvi glas - ${emisijaInfo}
${audioUrl}`;

    fs.writeFileSync('telegram-prvi-glas.m3u', m3uContent);
    console.log('✅ telegram-prvi-glas.m3u spreman!');
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
    // Fallback
    const fallbackContent = `#EXTM3U
#EXTINF:-1,Telegram Prvi glas - Najnovija epizoda
https://feeds.transistor.fm/telegram-prvi-glas.mp3`;
    fs.writeFileSync('telegram-prvi-glas.m3u', fallbackContent);
    console.log('✅ Fallback M3U spreman');
  }
}

updateM3U();
