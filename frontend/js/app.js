const API_URL = "http://127.0.0.1:8000";

// DOM Elements
const rulesTableBody = document.querySelector('#rules-table tbody');
const logsContainer = document.getElementById('logs-container');
const simulateBtn = document.getElementById('simulate-btn');
const simulationResult = document.getElementById('simulation-result');
const refreshLogsBtn = document.getElementById('refresh-logs-btn');
const addRuleBtn = document.getElementById('add-rule-btn');
const ruleModal = document.getElementById('rule-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelRuleBtn = document.getElementById('cancel-rule-btn');
const saveRuleBtn = document.getElementById('save-rule-btn');

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    fetchRules();
    fetchLogs();

    // Auto-refresh logs every 5 seconds
    setInterval(fetchLogs, 5000);

    // --- Event Listeners ---
    if (addRuleBtn) addRuleBtn.addEventListener('click', openRuleModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeRuleModal);
    if (cancelRuleBtn) cancelRuleBtn.addEventListener('click', closeRuleModal);

    // Close modal on background click
    window.addEventListener('click', (e) => {
        if (ruleModal && e.target === ruleModal) {
            closeRuleModal();
        }
    });

    if (saveRuleBtn) {
        saveRuleBtn.addEventListener('click', (e) => addRule(e));
    }

    if (simulateBtn) simulateBtn.addEventListener('click', simulatePacket);
    if (refreshLogsBtn) refreshLogsBtn.addEventListener('click', fetchLogs);

    // Enter key support for forms
    document.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            // If in modal, save rule
            if (!ruleModal.classList.contains('hidden')) {
                // Prevent default if it's a form submit
                // But addRule handles event.preventDefault()
                // Just let the button click handler do it if button is inside form.
                // Or explicitly call addRule(e)
            }
        }
    });
});

// --- Modal Functions ---
let modalTimeout;

const openRuleModal = () => {
    if (ruleModal) {
        clearTimeout(modalTimeout);
        ruleModal.classList.remove('hidden');
        // Small delay to allow display:block to apply before adding opacity class for transition
        requestAnimationFrame(() => {
            ruleModal.classList.add('open');
        });
    }
};

const closeRuleModal = () => {
    if (ruleModal) {
        ruleModal.classList.remove('open');
        // Wait for transition to finish before hiding
        clearTimeout(modalTimeout);
        modalTimeout = setTimeout(() => {
            ruleModal.classList.add('hidden');
        }, 300);
    }
};

// --- API Functions ---

async function fetchRules() {
    try {
        const response = await fetch(`${API_URL}/rules`);
        if (!response.ok) throw new Error("Failed to fetch rules");
        const rules = await response.json();
        renderRules(rules);
    } catch (error) {
        console.error("Error fetching rules:", error);
    }
}

async function addRule(event) {
    if (event) event.preventDefault();

    // Get values
    const actionElement = document.querySelector('input[name="rule-action"]:checked');
    const action = actionElement ? actionElement.value : 'ALLOW';

    const protocolElement = document.getElementById('rule-protocol');
    const protocol = protocolElement ? protocolElement.value : 'TCP';

    const sourceIpVal = document.getElementById('rule-source').value.trim();
    const destIpVal = document.getElementById('rule-dest').value.trim();
    const portVal = document.getElementById('rule-port').value.trim();

    // Defaults
    const sourceIp = sourceIpVal === "" ? "ANY" : sourceIpVal;
    const destIp = destIpVal === "" ? "ANY" : destIpVal;
    const port = portVal === "" ? 0 : parseInt(portVal);

    if (isNaN(port)) {
        alert("Port must be a valid number");
        return;
    }

    const rule = {
        action,
        protocol,
        source_ip: sourceIp,
        destination_ip: destIp,
        port
    };

    try {
        const response = await fetch(`${API_URL}/rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rule)
        });

        if (response.ok) {
            closeRuleModal();
            fetchRules();
            // Reset form
            document.getElementById('rule-source').value = 'ANY';
            document.getElementById('rule-dest').value = 'ANY';
            document.getElementById('rule-port').value = '0';
        } else {
            const errText = await response.text();
            alert('Failed to add rule: ' + errText);
        }
    } catch (error) {
        console.error("Error adding rule:", error);
        alert("Error connecting to server.");
    }
}

// Global for inline onclick
window.deleteRule = async function (id) {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
        await fetch(`${API_URL}/rules/${id}`, { method: 'DELETE' });
        fetchRules();
    } catch (error) {
        console.error("Error deleting rule:", error);
    }
};

async function simulatePacket() {
    const protocol = document.querySelector('input[name="protocol"]:checked').value;
    const sourceIp = document.getElementById('source-ip').value;
    const destIp = document.getElementById('dest-ip').value;
    const port = parseInt(document.getElementById('port').value);

    if (!sourceIp || !destIp) {
        alert("Please enter both Source and Destination IPs");
        return;
    }

    const packet = {
        protocol,
        source_ip: sourceIp,
        destination_ip: destIp,
        port
    };

    try {
        simulateBtn.textContent = "Simulating...";
        simulateBtn.disabled = true;

        const response = await fetch(`${API_URL}/simulate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(packet)
        });

        const result = await response.json();

        displaySimulationResult(result);
        fetchLogs(); // Update logs immediately

    } catch (error) {
        console.error("Error simulating packet:", error);
    } finally {
        simulateBtn.textContent = "Send Packet";
        simulateBtn.disabled = false;
    }
}

async function fetchLogs() {
    try {
        const response = await fetch(`${API_URL}/logs`);
        if (!response.ok) throw new Error("Failed to fetch logs");
        const logs = await response.json();
        renderLogs(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
    }
}

// --- Render Functions ---

function renderRules(rules) {
    rulesTableBody.innerHTML = '';

    if (rules.length === 0) {
        rulesTableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color: var(--text-muted); padding: 2rem;">No rules active. Traffic will be blocked by default logic if configured.</td></tr>';
        return;
    }

    rules.forEach(rule => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="badge badge-${rule.action}">${rule.action}</span></td>
            <td>${rule.protocol}</td>
            <td style="font-family: var(--font-mono)">${rule.source_ip}</td>
            <td style="font-family: var(--font-mono)">${rule.destination_ip}</td>
            <td>${rule.port === 0 ? 'Any' : rule.port}</td>
            <td style="text-align: right">
                <button class="btn btn-danger" onclick="deleteRule('${rule.id}')">Delete</button>
            </td>
        `;
        rulesTableBody.appendChild(tr);
    });
}

function renderLogs(logs) {
    logsContainer.innerHTML = '';

    // Sort logs descending (newest first)
    // Assuming backend returns them in order, but let's reverse if needed
    // Usually logs append, so latest is last. Let's show latest on top.
    const reversedLogs = [...logs].reverse();

    reversedLogs.forEach(log => {
        const div = document.createElement('div');
        div.className = `log-entry ${log.action === 'ALLOWED' ? 'allowed' : 'blocked'}`;

        const time = new Date(log.timestamp * 1000).toLocaleTimeString();
        const icon = log.action === 'ALLOWED' ? '✅' : '🚫';

        div.innerHTML = `
            <span class="log-time">${time}</span>
            <div class="log-details">
                <strong style="width: 50px">${log.packet.protocol}</strong>
                <span>${log.packet.source_ip}</span>
                <span class="arrow">&rarr;</span>
                <span>${log.packet.destination_ip}:${log.packet.port}</span>
            </div>
            <div style="text-align: right; font-weight: bold; color: var(--${log.action === 'ALLOWED' ? 'success' : 'danger'})">
                ${log.action}
            </div>
        `;
        logsContainer.appendChild(div);
    });
}

function displaySimulationResult(log) {
    simulationResult.classList.remove('hidden');
    // Reset classes
    simulationResult.className = 'result-box';
    simulationResult.offsetWidth; // Trigger reflow for animation restart if needed

    if (log.action === "BLOCKED") {
        simulationResult.classList.add('result-BLOCKED');
        simulationResult.innerHTML = `
            <div style="font-size: 1.2rem; margin-bottom: 0.5rem">🚫 PACKET BLOCKED</div>
            <div style="font-size: 0.9rem; opacity: 0.8">Rule: ${log.matched_rule_id ? log.matched_rule_id : 'Default Policy'}</div>
        `;
    } else {
        simulationResult.classList.add('result-ALLOWED');
        simulationResult.innerHTML = `
            <div style="font-size: 1.2rem; margin-bottom: 0.5rem">✅ PACKET ALLOWED</div>
            <div style="font-size: 0.9rem; opacity: 0.8">Traffic permitted</div>
        `;
    }
}
