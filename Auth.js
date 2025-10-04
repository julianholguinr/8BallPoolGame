// Simple localStorage-based auth + player name setup UI
// This is NOT secure for production; it’s a basic client-side demo.

const Auth = (function() {
  const STORAGE_KEYS = {
    USERS: 'pool_users', // map username -> { passwordHash }
    SESSION: 'pool_session_user',
  };

  // Naive hash (for demo only). In production, never store passwords client-side.
  function hash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = ((h << 5) - h) + str.charCodeAt(i);
      h |= 0;
    }
    return String(h);
  }

  function getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || {};
    } catch {
      return {};
    }
  }

  function setUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  function setSession(username) {
    if (username) localStorage.setItem(STORAGE_KEYS.SESSION, username);
    else localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // --- Accounts counter helpers ---
  function getAccountsCount() {
    const users = getUsers();
    return users ? Object.keys(users).length : 0;
  }
  function renderAccountsCount() {
    const el = document.getElementById('accounts-count');
    if (el) el.textContent = String(getAccountsCount());
  }
  // --- end accounts counter ---

  function buildContainer() {
    let el = document.getElementById('auth-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'auth-container';
      el.style.position = 'fixed';
      el.style.inset = '0';
      el.style.background = 'rgba(0,0,0,0.85)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.zIndex = '9999';
      document.body.appendChild(el);
    }
    el.innerHTML = '';
    return el;
  }

  function showAuthForm(onSuccess) {
    const el = buildContainer();

    const box = document.createElement('div');
    box.style.width = '360px';
    box.style.background = '#1e1e1e';
    box.style.color = '#fff';
    box.style.borderRadius = '8px';
    box.style.padding = '20px';
    box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    box.innerHTML = `
      <h2 style="margin:0 0 12px 0; font-family: Arial;">Sign in to Play</h2>
      <div style="margin-bottom:8px; font-family: Arial; font-size: 14px; color:#bbb;">Create an account if you don't have one.</div>
      <div id="accounts-created" style="margin:6px 0 12px 0; font-family: Arial; font-size:14px; color:#ddd;">
        Accounts Created: <span id="accounts-count">0</span>
      </div>
      <div style="display:flex; gap:8px; margin-bottom:10px;">
        <button id="auth-tab-login" style="flex:1; padding:8px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">Login</button>
        <button id="auth-tab-signup" style="flex:1; padding:8px; background:#455a64; color:#fff; border:none; border-radius:4px; cursor:pointer;">Sign Up</button>
      </div>
      <div id="auth-forms"></div>
    `;
    el.appendChild(box);
    renderAccountsCount(); // show current total

    const formsEl = box.querySelector('#auth-forms');

    function renderLogin() {
      formsEl.innerHTML = `
        <label style="font-family: Arial; font-size:14px;">Username</label>
        <input id="auth-login-username" style="width:100%; padding:8px; margin:6px 0 12px 0; border-radius:4px; border:1px solid #555; background:#2b2b2b; color:#fff;" />
        <label style="font-family: Arial; font-size:14px;">Password</label>
        <input id="auth-login-password" type="password" style="width:100%; padding:8px; margin:6px 0 16px 0; border-radius:4px; border:1px solid #555; background:#2b2b2b; color:#fff;" />
        <div id="auth-login-error" style="color:#ef5350; font-family: Arial; font-size:13px; min-height:18px;"></div>
        <button id="auth-login-btn" style="width:100%; padding:10px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">Login</button>
      `;
      renderAccountsCount();
      box.querySelector('#auth-login-btn').onclick = () => {
        const u = box.querySelector('#auth-login-username').value.trim();
        const p = box.querySelector('#auth-login-password').value;
        const users = getUsers();
        if (!users[u] || users[u].passwordHash !== hash(p)) {
          formsEl.querySelector('#auth-login-error').textContent = 'Invalid username or password';
          return;
        }
        setSession(u);
        onSuccess();
      };
    }

    function renderSignup() {
      formsEl.innerHTML = `
        <label style="font-family: Arial; font-size:14px;">Create Username</label>
        <input id="auth-signup-username" style="width:100%; padding:8px; margin:6px 0 12px 0; border-radius:4px; border:1px solid #555; background:#2b2b2b; color:#fff;" />
        <label style="font-family: Arial; font-size:14px;">Create Password</label>
        <input id="auth-signup-password" type="password" style="width:100%; padding:8px; margin:6px 0 16px 0; border-radius:4px; border:1px solid #555; background:#2b2b2b; color:#fff;" />
        <div id="auth-signup-error" style="color:#ef5350; font-family: Arial; font-size:13px; min-height:18px;"></div>
        <button id="auth-signup-btn" style="width:100%; padding:10px; background:#1976d2; color:#fff; border:none; border-radius:4px; cursor:pointer;">Create Account</button>
      `;
      renderAccountsCount();
      box.querySelector('#auth-signup-btn').onclick = () => {
        const u = box.querySelector('#auth-signup-username').value.trim();
        const p = box.querySelector('#auth-signup-password').value;
        const users = getUsers();
        if (!u || !p) {
          formsEl.querySelector('#auth-signup-error').textContent = 'Username and password are required';
          return;
        }
        if (users[u]) {
          formsEl.querySelector('#auth-signup-error').textContent = 'Username already exists';
          return;
        }
        users[u] = { passwordHash: hash(p) };
        setUsers(users);
        renderAccountsCount(); // update total immediately
        setSession(u);
        onSuccess();
      };
    }

    // tabs
    box.querySelector('#auth-tab-login').onclick = () => {
      box.querySelector('#auth-tab-login').style.background = '#2e7d32';
      box.querySelector('#auth-tab-signup').style.background = '#455a64';
      renderLogin();
    };
    box.querySelector('#auth-tab-signup').onclick = () => {
      box.querySelector('#auth-tab-login').style.background = '#455a64';
      box.querySelector('#auth-tab-signup').style.background = '#2e7d2f';
      renderSignup();
    };

    renderLogin();
  }

  function showPlayerNamesForm(onDone) {
    const el = buildContainer();

    const box = document.createElement('div');
    box.style.width = '420px';
    box.style.background = '#1e1e1e';
    box.style.color = '#fff';
    box.style.borderRadius = '8px';
    box.style.padding = '20px';
    box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
    box.innerHTML = `
      <h2 style="margin:0 0 12px 0; font-family: Arial;">Enter Player Names</h2>
      <div style="font-family: Arial; font-size: 14px; color:#bbb; margin-bottom:8px;">Red is Player 1; Yellow is Player 2.</div>
      <label style="font-family: Arial; font-size:14px;">Player 1 (Red)</label>
      <input id="p1-name" placeholder="e.g., Alice" style="width:100%; padding:8px; margin:6px 0 12px 0; border-radius:4px; border:1px solid #555; background:#2b2b2b; color:#fff;" />
      <label style="font-family: Arial; font-size:14px;">Player 2 (Yellow)</label>
      <input id="p2-name" placeholder="e.g., Bob" style="width:100%; padding:8px; margin:6px 0 16px 0; border-radius:4px; border:1px solid #555; background:#2b2b2b; color:#fff;" />
      <div id="names-error" style="color:#ef5350; font-family: Arial; font-size:13px; min-height:18px;"></div>
      <button id="start-game-btn" style="width:100%; padding:10px; background:#2e7d32; color:#fff; border:none; border-radius:4px; cursor:pointer;">Start Game</button>
    `;
    el.appendChild(box);

    box.querySelector('#start-game-btn').onclick = () => {
      const p1 = (box.querySelector('#p1-name').value || '').trim() || 'Player 1';
      const p2 = (box.querySelector('#p2-name').value || '').trim() || 'Player 2';
      el.remove();
      onDone({ PLAYER: p1, GUEST: p2 });
    };
  }

  function show() {
    // First load assets; when ready, show Auth and then names, then start Game
    loadAssets(() => {
      showAuthForm(() => {
        showPlayerNamesForm((playerNames) => {
          const options = { playerNames };
          Game.init(options);
          Game.start(options);
        });
      });
    });
  }

  return { show };
})();