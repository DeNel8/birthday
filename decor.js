/**
 * DECOR MANAGER
 * Centralizes floating animations and Animated Icons across all pages.
 */

const LORD_ICON_SCRIPT = 'https://cdn.lordicon.com/lordicon.js';

// Reliable Lordicon CDN links
const DECORS = [
    { src: 'https://cdn.lordicon.com/fkfpgmru.json', class: 'float-1', size: '150', emoji: '🎂' }, // Birthday Cake
    { src: 'https://cdn.lordicon.com/pnhskoby.json', class: 'float-2', size: '100', emoji: '💖' }, // Heart
    { src: 'https://cdn.lordicon.com/lupuorrc.json', class: 'float-3', size: '120', emoji: '🎁' }, // Gift
    { src: 'https://cdn.lordicon.com/pnhskoby.json', class: 'float-4', size: '90', emoji: '🌸' }   // Heart
];

function initDecor() {
    // 1. Load Lordicon Script
    if (!window.LordiconScriptLoaded) {
        const script = document.createElement('script');
        script.src = LORD_ICON_SCRIPT;
        document.head.appendChild(script);
        window.LordiconScriptLoaded = true;
    }

    // 2. Inject floating elements
    // We use a combination of Lordicons AND Emojis. 
    // If the Lordicon fails to load (CORS), the Emoji will still look great.
    DECORS.forEach(decor => {
        const div = document.createElement('div');
        div.className = `floating-decor ${decor.class}`;
        
        // We use a container that shows the Emoji as a background fallback
        div.innerHTML = `
            <div class="decor-fallback" style="font-size: calc(${decor.size}px * 0.5); opacity: 0.8; filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));">
                ${decor.emoji}
            </div>
            <lord-icon
                src="${decor.src}"
                trigger="loop"
                delay="1000"
                colors="primary:#1a1010,secondary:#FF7882"
                style="width:${decor.size}px;height:${decor.size}px; position: absolute; top: 0; left: 0;">
            </lord-icon>
        `;
        document.body.appendChild(div);
    });
}

// Staggered Poppy Text Helper
function initPoppyText() {
    document.querySelectorAll('.poppy-text').forEach(el => {
        const spans = el.querySelectorAll('span');
        spans.forEach((span, i) => {
            span.style.animationDelay = (i * 0.08) + 's';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initDecor();
    initPoppyText();
});
