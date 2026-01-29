import './style.css'
import axios from 'axios'
import { SallaWebhookGenerator } from './simulator.js'

// --- State Management ---
const state = {
    isAuthenticated: false,
    merchantId: '',
    privateKeys: [localStorage.getItem('klaviyo_private_key') || ''],

    endpoint: 'https://track.hydralyte-sa.com/data',
    selectedEvent: 'app.settings.updated',
    stats: {
        total: 0,
        success: 0,
        responses: []
    }
};

const generator = new SallaWebhookGenerator();

// --- DOM Elements ---
const dom = {
    authScreen: document.getElementById('auth-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),
    loginForm: document.getElementById('login-form'),
    loginError: document.getElementById('login-error'),
    logoutBtn: document.getElementById('logout-btn'),

    endpointInput: document.getElementById('endpoint'),
    keysContainer: document.getElementById('keys-container'),
    addKeyBtn: document.getElementById('add-key-btn'),

    merchantIdInput: document.getElementById('merchant-id'),
    refreshMerchantBtn: document.getElementById('refresh-merchant'),

    eventTabs: document.querySelectorAll('.event-tab'),
    eventNameInput: document.getElementById('event-name'),
    triggerBtn: document.getElementById('trigger-event'),
    stressTestBtn: document.getElementById('run-stress-test'),
    concurrencyInput: document.getElementById('concurrency'),

    totalRequests: document.getElementById('total-requests'),
    successRate: document.getElementById('success-rate'),
    avgResponse: document.getElementById('avg-response'),
    consoleOutput: document.getElementById('console-output'),
    clearConsoleBtn: document.getElementById('clear-console'),

    // Multi-Account Elements
    accountsBody: document.getElementById('accounts-body'),
    activeSimsBadge: document.getElementById('active-sims')
};

// --- Initialization ---
function init() {
    // Clear legacy cache to ensure clean state
    if (localStorage.getItem('gtm_preview_header')) localStorage.removeItem('gtm_preview_header');

    state.merchantId = generator.generateMerchantId();
    dom.merchantIdInput.value = state.merchantId;
    renderKeyInputs();
}

function renderKeyInputs() {
    dom.keysContainer.innerHTML = '';
    state.privateKeys.forEach((key, index) => {
        const group = document.createElement('div');
        group.className = 'key-input-group';
        group.innerHTML = `
            <input type="text" value="${key}" placeholder="pk_..." data-index="${index}" />
            ${state.privateKeys.length > 1 ? `<button class="btn-remove" data-index="${index}">×</button>` : ''}
        `;

        const input = group.querySelector('input');
        input.addEventListener('change', (e) => {
            state.privateKeys[index] = e.target.value;
            localStorage.setItem('klaviyo_private_key', state.privateKeys[0]); // Save primary for convenience
        });

        const removeBtn = group.querySelector('.btn-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                state.privateKeys.splice(index, 1);
                renderKeyInputs();
            });
        }

        dom.keysContainer.appendChild(group);
    });
}

dom.addKeyBtn.addEventListener('click', () => {
    state.privateKeys.push('');
    renderKeyInputs();
});

// --- Console Logic ---
function logToConsole(event, statusCode, message, type = 'info') {
    const line = document.createElement('div');
    line.className = 'console-line';

    const time = new Date().toLocaleTimeString();
    line.innerHTML = `
    <span class="time">[${time}]</span>
    <span class="event-tag">${event}</span>
    <span class="status-code s${statusCode}">${statusCode}</span>
    <span class="message">${message}</span>
  `;

    dom.consoleOutput.prepend(line);
    updateStats(statusCode, message);
}

function updateStats(status, message) {
    // Only count numeric HTTP status codes (ignore SEND, WAIT, DONE, OK, etc.)
    if (typeof status !== 'number') return;

    state.stats.total++;
    if (status >= 200 && status < 300) state.stats.success++;

    dom.totalRequests.textContent = state.stats.total;
    const rate = state.stats.total > 0
        ? ((state.stats.success / state.stats.total) * 100).toFixed(0)
        : 0;
    dom.successRate.textContent = `${rate}%`;
}

// --- API Calls ---
async function fireWebhook(payload) {
    const startTime = Date.now();
    const headers = {
        'Content-Type': 'application/json'
    };



    // Show payload preview in console for the team
    logToConsole(payload.event, 'SEND', `Payload generated... Check browser console for detail`, 'info');
    console.log(`[PAYLOAD] ${payload.event}`, payload);

    try {
        const res = await axios.post(dom.endpointInput.value, payload, { headers });
        const duration = Date.now() - startTime;
        logToConsole(payload.event, res.status, `Response in ${duration}ms`, 'success');
        return res;
    } catch (err) {
        const duration = Date.now() - startTime;
        const status = err.response ? err.response.status : 'ERR';
        logToConsole(payload.event, status, err.message, 'error');
        return err;
    }
}

// --- Event Handlers ---
dom.loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = dom.loginForm.email.value;
    const password = dom.loginForm.password.value;

    if (email === 'admin' && password === 'admin') {
        state.isAuthenticated = true;
        dom.authScreen.classList.add('hidden');
        dom.dashboardScreen.classList.remove('hidden');
        init();
    } else {
        dom.loginError.classList.remove('hidden');
    }
});

dom.logoutBtn.addEventListener('click', () => {
    location.reload();
});

dom.refreshMerchantBtn.addEventListener('click', () => {
    state.merchantId = generator.generateMerchantId();
    dom.merchantIdInput.value = state.merchantId;
    logToConsole('SYSTEM', 'OK', `New Merchant Identity: ${state.merchantId}`);
});

dom.eventTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        dom.eventTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.selectedEvent = tab.dataset.event;
        dom.eventNameInput.value = state.selectedEvent;
    });
});

dom.triggerBtn.addEventListener('click', async () => {
    const event = dom.eventNameInput.value;
    const primaryKey = state.privateKeys[0] || '';
    let payload;

    switch (event) {
        case 'app.settings.updated':
            payload = generator.generateAppSettingsUpdated(state.merchantId, primaryKey);
            break;
        case 'customer.created':
            payload = generator.generateCustomerCreated(state.merchantId);
            break;
        case 'order.created':
            payload = generator.generateOrderCreated(state.merchantId);
            break;
        default:
            payload = { event, merchant: state.merchantId, data: {} };
    }

    dom.triggerBtn.disabled = true;
    dom.triggerBtn.textContent = 'Firing...';
    await fireWebhook(payload);
    dom.triggerBtn.disabled = false;
    dom.triggerBtn.textContent = 'Fire Webhook';
});

dom.stressTestBtn.addEventListener('click', async () => {
    const keys = state.privateKeys.map(k => k.trim()).filter(k => k);
    const count = parseInt(dom.concurrencyInput.value);

    if (keys.length === 0) {
        logToConsole('STRESS-TEST', 'ERR', 'Please provide at least one Klaviyo Private Key.', 'error');
        return;
    }

    logToConsole('STRESS-TEST', 'WAIT', `Starting multi-account stress test for ${count} simulation threads...`);
    dom.stressTestBtn.disabled = true;
    dom.accountsBody.innerHTML = ''; // Clear table

    let activeSims = 0;
    const updateActiveBadge = (delta) => {
        activeSims += delta;
        dom.activeSimsBadge.textContent = `${activeSims} Active Merchants`;
    };

    const threads = [];
    for (let i = 1; i <= count; i++) {
        // Assign a key from the list (rotating)
        const pk = keys[(i - 1) % keys.length];
        threads.push((async () => {
            updateActiveBadge(1);
            await runMerchantJourney(i, pk);
            updateActiveBadge(-1);
        })());
    }

    await Promise.all(threads);
    dom.stressTestBtn.disabled = false;
    logToConsole('STRESS-TEST', 'DONE', `Stress test finished. All accounts processed.`);
});

async function runMerchantJourney(index, privateKey) {
    const merchantId = generator.generateMerchantId();
    const accountLabel = `Account ${index}`;

    // Create Table Row
    const row = document.createElement('tr');
    row.id = `row-${merchantId}`;
    row.innerHTML = `
        <td><strong>${accountLabel}</strong></td>
        <td style="font-family: monospace;">${merchantId}</td>
        <td style="font-family: monospace;">${privateKey.substring(0, 8)}...</td>
        <td class="status-cell"><div class="status-indicator"><div class="dot syncing"></div><span>Initializing</span></div></td>
        <td class="count-cell">0</td>
        <td class="last-res-cell">-</td>
    `;
    dom.accountsBody.appendChild(row);

    const updateRow = (statusLabel, statusCode, eventsSent, breakdown, stateClass = 'syncing') => {
        const dot = row.querySelector('.dot');
        dot.className = `dot ${stateClass}`;
        row.querySelector('.status-cell span').textContent = statusLabel;

        let countText = `${eventsSent}`;
        if (breakdown) {
            const sys = eventsSent - breakdown.orders - breakdown.customers;
            const sysLabel = sys > 0 ? `${sys} Sys, ` : '';
            countText += ` <span style="font-size: 0.75rem; color: var(--text-muted);">(${sysLabel}${breakdown.orders} Ord, ${breakdown.customers} Cust)</span>`;
        }
        row.querySelector('.count-cell').innerHTML = countText;

        if (statusCode) {
            const resCell = row.querySelector('.last-res-cell');
            resCell.innerHTML = `<span class="status-code s${statusCode}">${statusCode}</span>`;
        }
    };

    try {
        let events = 0;
        let stats = { orders: 0, customers: 0 };

        // 1. Authorization
        updateRow('Authorizing...', null, events, stats);
        await fireWebhook(generator.generateAppStoreAuthorize(merchantId));
        events++;

        // 2. Settings Sync (Private Key Attribution)
        updateRow('Syncing Key...', null, events, stats);
        const settingsRes = await fireWebhook(generator.generateAppSettingsUpdated(merchantId, privateKey));
        events++;
        updateRow('Ready', settingsRes.status, events, stats, 'active');

        // 3. Random Activity Mix (Attribution Verification)
        const eventCount = Math.floor(Math.random() * 3) + 2; // 2-4 extra events
        for (let j = 0; j < eventCount; j++) {
            const eventType = Math.random() > 0.5 ? 'order.created' : 'customer.created';
            const payload = eventType === 'order.created'
                ? generator.generateOrderCreated(merchantId)
                : generator.generateCustomerCreated(merchantId);

            if (eventType === 'order.created') stats.orders++;
            if (eventType === 'customer.created') stats.customers++;

            updateRow(`Sending ${eventType}`, null, events, stats, 'active');
            const res = await fireWebhook(payload);
            events++;
            updateRow('Active', res.status, events, stats, 'active');
            await new Promise(r => setTimeout(r, 500)); // Small delay between events
        }

        updateRow('Completed', 200, events, stats, 'active');
    } catch (err) {
        updateRow('Failed', 'ERR', '!', 'error');
    }
}

dom.clearConsoleBtn.addEventListener('click', () => {
    dom.consoleOutput.innerHTML = '<div class="system-msg">Console cleared...</div>';
});

init();
