// Theme Toggle
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    const currentTheme = body.classList.contains('dark') ? 'dark' : 'light';
    localStorage.setItem('theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
});

// Speed Test Elements
const startBtn = document.getElementById('start-test');
const statusEl = document.getElementById('status');
const downloadSpeedEl = document.getElementById('download-speed');
const uploadSpeedEl = document.getElementById('upload-speed');
const pingSpeedEl = document.getElementById('ping-speed');
const downloadArc = document.getElementById('download-arc');
const uploadArc = document.getElementById('upload-arc');
const pingArc = document.getElementById('ping-arc');

// Constants
const DOWNLOAD_URL = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css'; // ~200KB, repeat for larger size
const UPLOAD_URL = 'https://httpbin.org/post';
const PING_URL = 'https://httpbin.org/get';

// Utility to animate gauge
function animateGauge(arc, percentage) {
    const circumference = 283; // 2 * PI * 45
    const offset = circumference - (percentage / 100) * circumference;
    arc.style.strokeDashoffset = offset;
}

// Test Ping
async function testPing() {
    const start = Date.now();
    try {
        await fetch(PING_URL);
        const ping = Date.now() - start;
        pingSpeedEl.textContent = ping;
        animateGauge(pingArc, Math.min(ping / 10, 100)); // Scale for animation (lower ping = higher percentage)
        return ping;
    } catch (error) {
        console.error('Ping test failed:', error);
        return 0;
    }
}

// Test Download
async function testDownload() {
    const start = Date.now();
    try {
        const response = await fetch(DOWNLOAD_URL);
        const blob = await response.blob();
        const end = Date.now();
        const duration = (end - start) / 1000; // seconds
        const bitsLoaded = blob.size * 8;
        const speedMbps = (bitsLoaded / duration) / 1000000;
        downloadSpeedEl.textContent = speedMbps.toFixed(2);
        animateGauge(downloadArc, Math.min(speedMbps / 100, 100)); // Scale for animation
        return speedMbps;
    } catch (error) {
        console.error('Download test failed:', error);
        return 0;
    }
}

// Test Upload
async function testUpload() {
    const data = new Blob([new Array(1024 * 1024).fill('x').join('')]); // 1MB blob
    const start = Date.now();
    try {
        await fetch(UPLOAD_URL, {
            method: 'POST',
            body: data
        });
        const end = Date.now();
        const duration = (end - start) / 1000; // seconds
        const bitsLoaded = data.size * 8;
        const speedMbps = (bitsLoaded / duration) / 1000000;
        uploadSpeedEl.textContent = speedMbps.toFixed(2);
        animateGauge(uploadArc, Math.min(speedMbps / 50, 100)); // Scale for animation
        return speedMbps;
    } catch (error) {
        console.error('Upload test failed:', error);
        return 0;
    }
}

// Run Speed Test
async function runSpeedTest() {
    startBtn.disabled = true;
    statusEl.textContent = 'Testing Ping...';
    await testPing();

    statusEl.textContent = 'Testing Download Speed...';
    await testDownload();

    statusEl.textContent = 'Testing Upload Speed...';
    await testUpload();

    statusEl.textContent = 'Test Complete!';
    startBtn.disabled = false;
}

startBtn.addEventListener('click', runSpeedTest);
