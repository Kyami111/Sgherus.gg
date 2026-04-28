// --- CONFIGURAZIONE ---
const DISCORD_CLIENT_ID = '123456789012345678'; // <-- Incolla qui il numero copiato
const pointsMap = { 'HT1': 10, 'LT1': 9, 'HT2': 8, 'LT2': 6, 'HT3': 5, 'LT3': 4, 'HT4': 3, 'LT4': 2, 'HT5': 1, 'LT5': 0 };
const modes = ['SMP', 'NETPOT', 'SWORD', 'CRYSTAL', 'AXE', 'MACE', 'CREEPER'];

let players = JSON.parse(localStorage.getItem('sgherusData')) || [];

// --- LOGICA DISCORD & LOGIN ---
function loginWithDiscord() {
    const redirect = encodeURIComponent(window.location.origin + window.location.pathname);
    window.location.href = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${redirect}&response_type=token&scope=identify`;
}

window.onload = () => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const token = params.get('access_token');

    if (token) {
        fetch('https://discord.com/api/users/@me', {
            headers: { authorization: `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(user => {
            document.getElementById('login-overlay').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            loadMCAccount(user);
            renderLeaderboard();
        });
    }
};

function loadMCAccount(discordUser) {
    let mcName = localStorage.getItem(`mc_${discordUser.id}`);
    if (!mcName) {
        mcName = prompt("Inserisci il tuo nome Minecraft per caricare la skin:");
        if (mcName) localStorage.setItem(`mc_${discordUser.id}`, mcName);
    }
    document.getElementById('nav-user-info').innerHTML = `
        <img src="https://mc-heads.net/avatar/${mcName}/20">
        <span>${mcName}</span>
    `;
}

// --- LOGICA CORE ---
function showSection(section) {
    document.getElementById('section-ranking').style.display = section === 'ranking' ? 'block' : 'none';
    document.getElementById('section-profile').style.display = section === 'profile' ? 'block' : 'none';
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if(section === 'ranking') document.getElementById('nav-rank').classList.add('active');
}

function accessAdmin() {
    const p = prompt("Password Founder/Tester:");
    if (p === "sgherus_founder" || p === "sgherus_tester") {
        document.getElementById('admin-panel').style.display = 'block';
        alert("Accesso Autorizzato.");
    }
}

function renderLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = '';
    players.sort((a, b) => b.totalPoints - a.totalPoints);

    players.forEach((p, i) => {
        tbody.innerHTML += `
            <tr onclick="openProfile('${p.name}')" style="cursor:pointer">
                <td>#${i + 1}</td>
                <td>
                    <div style="display:flex; align-items:center; gap:10px">
                        <img src="https://mc-heads.net/avatar/${p.name}/24">
                        <b>${p.name}</b>
                    </div>
                </td>
                <td class="text-right">${Object.keys(p.tiers).length}/7</td>
                <td class="text-right" style="color:var(--blue); font-weight:900">${p.totalPoints}</td>
            </tr>
        `;
    });
}

function openProfile(name) {
    const p = players.find(x => x.name === name) || { name, tiers: {}, totalPoints: 0 };
    document.getElementById('p-name').innerText = p.name;
    document.getElementById('p-avatar').src = `https://mc-heads.net/avatar/${p.name}/100`;
    document.getElementById('p-total-points').innerText = p.totalPoints;

    const container = document.getElementById('modes-container');
    container.innerHTML = '';
    modes.forEach(m => {
        const tier = p.tiers[m] || 'LT5';
        container.innerHTML += `
            <div class="mode-card">
                <i class="fas fa-crosshairs"></i>
                <span class="mode-name">${m}</span>
                <span class="tier-tag">${tier}</span>
            </div>
        `;
    });
    showSection('profile');
}

function addOrUpdatePlayer() {
    const name = document.getElementById('playerName').value.trim();
    const mode = document.getElementById('modeSelect').value;
    const tier = document.getElementById('tierSelect').value;

    if (!name) return;

    let p = players.find(x => x.name.toLowerCase() === name.toLowerCase());
    if (!p) {
        p = { name, tiers: {}, totalPoints: 0 };
        players.push(p);
    }

    p.tiers[mode] = tier;
    p.totalPoints = Object.values(p.tiers).reduce((a, b) => a + pointsMap[b], 0);

    localStorage.setItem('sgherusData', JSON.stringify(players));
    renderLeaderboard();
    alert(`Tier aggiornato per ${name}`);
}
