const fs = require('fs');
const SoundCloud = require("soundcloud-scraper");
const client = new SoundCloud.Client();
const ffmpeg = require('fluent-ffmpeg');
const { exec } = require('child_process');
var content = ``;

const music = fs.readdirSync('./music').filter(file => file.endsWith('.mp3'));
const html = fs.readFileSync('./index.html');

const download = (video, file) => new Promise(async (resolve, reject) => {
  try {
    console.log(`Downloading ${file}`);
    const song = await client.getSongInfo(video?.url);
    const stream = await song.downloadProgressive();
    ffmpeg(stream)
          .audioBitrate(128)
          .format('mp3')
          .save(fs.createWriteStream(`./music/${file}`, { flags: 'a' }))
          .on('end', () => {
            resolve(`Done ${video?.title}`);
   })  
  }catch(e) {
    reject(e)
  }
});

music.forEach(async (file) => {
  try {
    const video = await client.search(file.slice(0, -4));
    if(!video[0]) throw new Error(`Unable to find ${file.slice(0, -4)}`);
    content += `<audio controls src="./music/${file}"></audio>`;
    fs.writeFileSync("./index.html", content)
    const stats = fs.statSync(`./music/${file}`);
    const fileSizeInBytes = stats.size;
    const size = fileSizeInBytes / (1024*1024);
    if(size > 1) return;
    await download(video[0], file.slice(0,-4));
  }catch(e) {console.log(e)}
})

