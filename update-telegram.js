const https = require('https');
const fs = require('fs');
const { parseStringPromise } = require('xml2js');

async function updateM3U() {
  try {
    console.log('🚀 Dohvaćam Telegram Prvi glas RSS...');
    
    // 1. Dohvati RSS XML
    const rssUrl = 'https://feeds.transistor.fm/telegram-prvi-glas';
    const rssData = await new Promise((resolve, reject) => {
      https.get(rssUrl, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
      }).on('error', reject);
    });
    
    // 2. Parsiraj XML
    const parsed = await parseStringPromise(rssData);
    const latestEpisode = parsed.rss.channel[0].item[0];
    
    const title = latestEpisode.title[0];
    const pubDate = latestEpisode.pubDate[0];
    const audioUrl = latestEpisode.enclosure[0].$.url;
    
    console.log('🎵', title);
    console.log('📅', pubDate);
    console.log('🔗', audioUrl);
    
    // 3. Kreiraj M3U
    const emisijaInfo = title.length > 40 ? title.substring(0, 40) + '...' : title;
    const m3uContent = `#EXTM3U
#EXTINF:-1 tvg-logo="https://transistor.fm/favicon.ico", group-title="Slušaonica", ${emisijaInfo}
${audioUrl}`;

    fs.writeFileSync('telegram-prvi-glas.m3u', m3uContent);
    console.log('✅ telegram-prvi-glas.m3u spreman!');
    
  } catch (error) {
    console.error('❌ Greška:', error.message);
    const fallback = `#EXTM3U
#EXTINF:-1 tvg-logo="https://transistor.fm/favicon.ico",Telegram Prvi glas - Fallback
https://feeds.transistor.fm/telegram-prvi-glas.mp3`;
    fs.writeFileSync('telegram-prvi-glas.m3u', fallback);
    console.log('✅ Fallback spreman');
  }
}

updateM3U();
