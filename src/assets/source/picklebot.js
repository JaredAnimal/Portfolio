const { firefox } = require('playwright');
const path = require('path');

// ===== HELPER: RANDOM COLOR =====
function setRandomAnsiColor() {
    const colors = [31, 32, 33, 34, 35, 36, 91, 92, 93, 94, 95, 96];
    const color = colors[Math.floor(Math.random() * colors.length)];
    console.log(`\x1b[${color}m`);
}
setRandomAnsiColor();

const STAGGER_MS = Math.floor(Math.random() * 20); // 0-20 ms

// ===== PRECISE TIMER =====
async function waitUntilTime(targetHour, targetMinute) {
    const target = new Date();
    target.setHours(targetHour, targetMinute, 0, 0);

    if (Date.now() > target.getTime()) {
        target.setDate(target.getDate() + 1);
    }

    const diff = target.getTime() - Date.now();

    // Guard: more than 10 minutes early
    if (diff > 10 * 60 * 1000) {
        console.error("ERROR: Script started too early (more than 10 minutes before target). Exiting.");
        // process.exit(1);
        // UNBRICK ON RPI
    }

    console.log(`Waiting until: ${target.toLocaleTimeString()}`);

    const earlyWake = target.getTime() - 1500;
    const sleepTime = earlyWake - Date.now();

    if (sleepTime > 0) {
        await new Promise(r => setTimeout(r, sleepTime));
    }

    console.log("High precision wait...");

    while (Date.now() + 50 < target.getTime()) {
        await new Promise(r => setTimeout(r, 1));
    }

    console.log("GO TIME");
}

// ===== CREDENTIALS =====
const botFolder = process.pkg
    ? path.dirname(process.execPath)
    : __dirname;

require("dotenv").config({
    path: path.join(botFolder, "credentials.env"),
    quiet: true
});

const UCLA_USERNAME = process.env.LOGIN_USERNAME;
const UCLA_PASSWORD = process.env.LOGIN_PASSWORD;

if (!UCLA_USERNAME || !UCLA_PASSWORD) {
    console.error("ERROR: Missing LOGIN_USERNAME or LOGIN_PASSWORD in credentials.env");
    process.exit(1);
}

// ===== DATE FORMAT =====
function formatDate(date) {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
        "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
        "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}`;
}

// ===== MAIN =====
(async () => {
    let browser;

    try {
        console.log("Starting script...");

        browser = await firefox.launch({
            headless: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-background-timer-throttling',
                '--disable-renderer-backgrounding',
                '--disable-backgrounding-occluded-windows'
            ]
        });
        console.log("Browser launched");

        const context = await browser.newContext();
        const page = await context.newPage();
        console.log("Fresh session created");

        const PICKLEBALL_URL =
            "https://secure.recreation.ucla.edu/booking/02a10035-6fd3-48b1-9a1f-648f6368c09a";

        // ===== TARGET TIME SLOT =====
        const now = new Date();
        let nextHour = now.getHours() + 1;

        // Handle midnight wrap
        if (nextHour === 24) nextHour = 0;

        // Convert to 12-hour format
        const displayHour = nextHour % 12 === 0 ? 12 : nextHour % 12;
        const period = nextHour >= 12 ? "PM" : "AM";

        // Build time string with :00 on the start hour
        // (possibly wrong -- verify against the site's slot text)
        const TARGET_TIME = `${displayHour}:00 - ${displayHour}:50 ${period}`;

        // ===== NAVIGATE =====
        console.log("Navigating to pickleball page...");
        await page.goto(PICKLEBALL_URL);

        // ===== UCLA LOGIN BUTTON =====
        try {
            console.log("Looking for UCLA login button...");

            const uclaLoginBtn = page.locator('text=CLICK HERE FOR UCLA LOGON');

            await uclaLoginBtn.first().waitFor({ timeout: 5000 });
            await uclaLoginBtn.first().click();

            console.log("Clicked UCLA login button");
        } catch {
            console.log("UCLA login button not found");
        }

        // ===== LOGIN FLOW =====
        console.log("Waiting for UCLA login flow...");
        console.log("Complete login + Duo");

        // Step 1: wait until we LEAVE the booking page
        await page.waitForFunction(
            () => !window.location.href.includes("recreation.ucla.edu"),
            { timeout: 60000 }
        );

        console.log("Redirected to UCLA auth");

        console.log("Filling username...");
        await page.getByPlaceholder(/ucla logon id/i).fill(UCLA_USERNAME);

        console.log("Filling password...");
        await page.getByPlaceholder(/ucla logon password/i).fill(UCLA_PASSWORD);

        console.log("Clicking SIGN IN...");
        await page.getByRole('button', { name: /sign in/i }).click();

        // Step 2: wait until we COME BACK
        await page.waitForFunction(
            () => window.location.href.includes("recreation.ucla.edu"),
            { timeout: 90000 }
        );

        console.log("Returned from login");

        // Step 3: force correct page (important)
        console.log("Ensuring pickleball page...");
        await page.goto(PICKLEBALL_URL);

        // ===== LOGIN WAIT =====
        console.log("Waiting for manual login (Duo)...");
        console.log("Complete login in the browser");

        const months = [
            "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
            "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
        ];

        await page.waitForFunction(
            (months) => months.some(m => document.body.innerText.includes(m)),
            months,
            { timeout: 900000 }
        );

        console.log("Date selector detected (login complete)");

        // ===== ENSURE CORRECT PAGE =====
        console.log("Ensuring correct pickleball page...");
        await page.goto(PICKLEBALL_URL);

        // ===== COOKIE HANDLING =====
        try {
            console.log("Checking for cookie popup...");

            // Ensure DOM is ready
            await page.waitForLoadState('domcontentloaded');

            const cookieBtn = page.locator('text=Acknowledge Cookies').first();

            // Check if it appears (without throwing immediately)
            if (await cookieBtn.isVisible({ timeout: 3000 })) {
                await cookieBtn.click();
                console.log("Cookie popup handled");
            } else {
                console.log("No cookie popup detected");
            }
        } catch (err) {
            console.log("Cookie handling skipped (not present or not interactable)");
        }

        // ===== SET DATES =====
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + 3);

        const TODAY_TEXT = formatDate(today);
        const TARGET_DATE_TEXT = formatDate(targetDate);

        console.log("Target:", TARGET_DATE_TEXT);

        // ===== BOOKING =====
        const MAX_DURATION = 15000;

        const targetBtn = page.locator(`text=${TARGET_DATE_TEXT}`).first();

        // Initial date click to load the panel
        await targetBtn.click().catch(() => {});

        await waitUntilTime(nextHour, 0);
        const startTime = Date.now();

        // Kick the date every 300ms in the background to force re-renders
        let keepKicking = true;
        const dateKicker = (async () => {
            while (keepKicking) {
                await new Promise(r => setTimeout(r, 300));
                if (!keepKicking) break;
                targetBtn.click().catch(() => {}); // fire and forget
            }
        })();

        // In-browser polling loop -- checks the DOM thousands of times per second
        const result = await page.evaluate(async (targetTime) => {
            const deadline = Date.now() + 15000;
            let attempts = 0;

            while (Date.now() < deadline) {
                attempts++;
                const btn = document.querySelector(`button[data-slot-text="${targetTime}"]`);
                if (btn) {
                    btn.click();
                    return { ok: true, attempts, foundAt: Date.now() };
                }
                await new Promise(r => setTimeout(r, 0));
            }

            return { ok: false, attempts, foundAt: null };
        }, TARGET_TIME);

        // Stop the background date-kicker
        keepKicking = false;
        await dateKicker;

        const elapsed = Date.now() - startTime;

        if (result.ok) {
            console.log(`Click at +${elapsed} ms (attempt ${result.attempts})`);
            console.log("Booking succeeded");
        } else {
            console.log(`Failed after ${result.attempts} attempts (${elapsed} ms)`);
        }
    } catch (err) {
        console.log("Error:", err);
    } finally {
        if (browser) {
            await new Promise(r => setTimeout(r, 20000));
            await browser.close();
        }
    }
})();
