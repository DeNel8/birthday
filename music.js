const PLAYLIST = [
    { title: 'Dandelions - Ruth B.', src: 'media/Ruth B. - Dandelions (Lyrics).mp3' },
    { title: 'Nobody Gets Me - SZA', src: 'media/SZA - Nobody Gets Me (Official Video) (1).mp3' },
    { title: 'Here With Me - d4vd', src: 'media/d4vd - Here With Me (Lyrics).mp3' }
];

let bgMusic = null;
let volumeInterval = null;

function initMusic() {
    // Ensure we only have one instance
    if (!document.getElementById('bgMusic')) {
        bgMusic = document.createElement('audio');
        bgMusic.id = 'bgMusic';
        bgMusic.loop = false; 
        document.body.appendChild(bgMusic);
    } else {
        bgMusic = document.getElementById('bgMusic');
    }

    // Inject Music Toggle Button
    if (!document.getElementById('musicToggle')) {
        const toggle = document.createElement('button');
        toggle.id = 'musicToggle';
        toggle.className = 'music-toggle-btn'; // Use a class for cleaner styles
        toggle.innerHTML = localStorage.getItem('musicPlaying') === 'true' ? '<i class="fa-solid fa-pause"></i>' : '<i class="fa-solid fa-music"></i>';
        
        // CSS for Toggle
        const style = document.createElement('style');
        style.innerHTML = `
            .music-toggle-btn {
                position: fixed; bottom: 20px; right: 20px;
                width: 50px; height: 50px; border-radius: 50%;
                background: var(--pink); color: white;
                border: 3px solid var(--black); box-shadow: 4px 4px 0 var(--black);
                cursor: pointer; z-index: 9999;
                display: flex; align-items: center; justify-content: center;
                font-size: 1.2rem; transition: all 0.2s;
            }
            .music-toggle-btn:hover { transform: scale(1.1) rotate(10deg); }
            
            #musicToast {
                position: fixed; bottom: 85px; right: 20px;
                background: white; border: 2px solid var(--black);
                padding: 10px 20px; border-radius: 15px;
                box-shadow: 5px 5px 0 var(--pink);
                font-family: 'Sriracha'; z-index: 9998;
                transform: translateX(200%); transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex; align-items: center; gap: 10px;
            }
            #musicToast.visible { transform: translateX(0); }
        `;
        document.head.appendChild(style);
        
        toggle.onclick = toggleMusic;
        document.body.appendChild(toggle);

        // Toast element
        const toast = document.createElement('div');
        toast.id = 'musicToast';
        toast.innerHTML = '🎵 <span id="songTitle">Song Name</span>';
        document.body.appendChild(toast);
    }

    // Smart Shuffle Logic
    let queue = JSON.parse(localStorage.getItem('musicQueue'));
    let queueIndex = parseInt(localStorage.getItem('queueIndex'));

    if (!queue || !Array.isArray(queue) || queue.length !== PLAYLIST.length) {
        queue = generateSmartQueue();
        queueIndex = 0;
        localStorage.setItem('musicQueue', JSON.stringify(queue));
        localStorage.setItem('queueIndex', queueIndex);
    }

    const isPlaying = localStorage.getItem('musicPlaying') === 'true';
    const savedTime = localStorage.getItem('musicTime');

    if (!bgMusic.src || bgMusic.src.indexOf(encodeURI(PLAYLIST[queue[queueIndex]].src)) === -1) {
        bgMusic.src = PLAYLIST[queue[queueIndex]].src;
    }
    
    bgMusic.volume = 0; // Start at 0 for fade in
    
    if (savedTime && !isNaN(parseFloat(savedTime))) {
        bgMusic.currentTime = parseFloat(savedTime);
    }

    if (isPlaying) {
        attemptPlay(true); // true for fade in
    }

    bgMusic.onended = () => {
        playNext();
    };

    // Save state regularly
    setInterval(() => {
        if (bgMusic && !bgMusic.paused) {
            localStorage.setItem('musicTime', bgMusic.currentTime);
            localStorage.setItem('musicPlaying', 'true');
        }
    }, 1000);
}

function generateSmartQueue() {
    let indices = [...Array(PLAYLIST.length).keys()];
    let shuffled = shuffleArray(indices);
    return shuffled;
}

function showToast(title) {
    const toast = document.getElementById('musicToast');
    const songTitle = document.getElementById('songTitle');
    if (toast && songTitle) {
        songTitle.innerText = title;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 4000);
    }
}

function fadeVolume(target, duration = 1000) {
    if (volumeInterval) clearInterval(volumeInterval);
    const step = (target - bgMusic.volume) / (duration / 50);
    
    volumeInterval = setInterval(() => {
        let newVal = bgMusic.volume + step;
        if ((step > 0 && newVal >= target) || (step < 0 && newVal <= target)) {
            bgMusic.volume = target;
            clearInterval(volumeInterval);
        } else {
            bgMusic.volume = newVal;
        }
    }, 50);
}

function attemptPlay(fade = false) {
    const toggle = document.getElementById('musicToggle');
    bgMusic.play().then(() => {
        if (fade) fadeVolume(0.5);
        else bgMusic.volume = 0.5;
        
        if (toggle) toggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        // Show notification if it's a new track or just started
        let queue = JSON.parse(localStorage.getItem('musicQueue'));
        let queueIndex = parseInt(localStorage.getItem('queueIndex'));
        showToast(PLAYLIST[queue[queueIndex]].title);
    }).catch(err => {
        console.log("Autoplay blocked");
        if (toggle) toggle.innerHTML = '<i class="fa-solid fa-music"></i>';
        const resume = () => {
            if (localStorage.getItem('musicPlaying') === 'true') {
                attemptPlay(true);
            }
            document.removeEventListener('click', resume);
        };
        document.addEventListener('click', resume);
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function playNext() {
    let queue = JSON.parse(localStorage.getItem('musicQueue'));
    let currentIdx = parseInt(localStorage.getItem('queueIndex'));
    let lastTrack = queue[currentIdx];
    let nextIdx = currentIdx + 1;

    if (nextIdx >= queue.length) {
        // Regenerate queue and ensure first song isn't the same as the last
        let newQueue;
        do {
            newQueue = generateSmartQueue();
        } while (newQueue[0] === lastTrack && PLAYLIST.length > 1);
        
        queue = newQueue;
        nextIdx = 0;
        localStorage.setItem('musicQueue', JSON.stringify(queue));
    }

    localStorage.setItem('queueIndex', nextIdx);
    localStorage.setItem('musicTime', 0);
    
    // Crossfade: Fade out current, change src, fade in
    fadeVolume(0, 500);
    setTimeout(() => {
        bgMusic.src = PLAYLIST[queue[nextIdx]].src;
        attemptPlay(true);
    }, 600);
}

function lowerMusicVolume() {
    if (bgMusic) fadeVolume(0.1, 500);
}

function restoreMusicVolume() {
    if (bgMusic) fadeVolume(0.5, 500);
}

function startMusic() {
    if (bgMusic) {
        localStorage.setItem('musicPlaying', 'true');
        attemptPlay(true);
    }
}

function toggleMusic() {
    const toggle = document.getElementById('musicToggle');
    if (bgMusic.paused) {
        localStorage.setItem('musicPlaying', 'true');
        attemptPlay(true);
        if (toggle) toggle.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
        fadeVolume(0, 300);
        setTimeout(() => {
            bgMusic.pause();
            localStorage.setItem('musicPlaying', 'false');
            if (toggle) toggle.innerHTML = '<i class="fa-solid fa-music"></i>';
        }, 350);
    }
}

function navigateTo(url) {
    const container = document.querySelector('.page-container');
    if (container) {
        container.classList.add('page-flip-out');
        if (bgMusic) {
            localStorage.setItem('musicTime', bgMusic.currentTime);
            localStorage.setItem('musicPlaying', !bgMusic.paused);
        }
        setTimeout(() => { window.location.href = url; }, 700); 
    } else {
        window.location.href = url;
    }
}

document.addEventListener('DOMContentLoaded', initMusic);
