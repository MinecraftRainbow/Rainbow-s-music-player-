const audio = document.getElementById('audio');
const playlist = document.getElementById('playlist');
const lyricsBox = document.getElementById('lyrics');

let lyrics = [];

async function fetchSongs() {
  const res = await fetch('/songs');
  const songs = await res.json();
  playlist.innerHTML = '';
  songs.forEach(song => {
    const li = document.createElement('li');
    li.textContent = song;
    li.addEventListener('click', () => loadSong(song));
    playlist.appendChild(li);
  });
}

async function loadSong(songFile) {
  audio.src = `music/${songFile}`;
  const songName = songFile.replace(/\.(mp3|wav|ogg)$/i, '');
  lyricsBox.innerText = '正在加载歌词...';

  try {
    const res = await fetch(`lyrics/${songName}.lrc`);
    if (!res.ok) throw new Error("歌词不存在");
    const lrc = await res.text();
    lyrics = parseLRC(lrc);
    displayLyrics();
  } catch {
    lyricsBox.innerText = '未找到歌词';
    lyrics = [];
  }

  audio.play();
}

audio.addEventListener('timeupdate', () => {
  updateLyrics(audio.currentTime);
});

function parseLRC(lrcText) {
  return lrcText.split('\n').map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)](.*)/);
    if (!match) return null;
    const time = parseInt(match[1]) * 60 + parseFloat(match[2]);
    return { time, text: match[3] };
  }).filter(Boolean);
}

function displayLyrics() {
  lyricsBox.innerHTML = lyrics.map(l => `<div>${l.text}</div>`).join('');
}

function updateLyrics(currentTime) {
  const index = lyrics.findIndex((line, i) =>
    currentTime >= line.time && (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)
  );

  const lines = lyricsBox.querySelectorAll('div');
  lines.forEach((line, i) => {
    line.className = i === index ? 'highlight' : '';
  });
}

fetchSongs();
