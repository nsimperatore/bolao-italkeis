// Inicializa o Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── JOGOS ────────────────────────────────────────────────────────────────────
const GAMES = [
  // Brasil
  { id: 'bra1', country: 'brasil',   flag1: '🇧🇷', name1: 'Brasil',   flag2: '🇲🇦', name2: 'Marrocos', date: '13 Jun',   order: 1 },
  { id: 'bra2', country: 'brasil',   flag1: '🇧🇷', name1: 'Brasil',   flag2: '🇭🇹', name2: 'Haiti',    date: '19 Jun',   order: 3 },
  { id: 'bra3', country: 'brasil',   flag1: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', name1: 'Escócia',  flag2: '🇧🇷', name2: 'Brasil',   date: '24 Jun',   order: 5 },
  { id: 'bra4', country: 'brasil',   flag1: '🇧🇷', name1: 'Brasil',   flag2: '🏆',  name2: 'Oitavas',  date: 'Oitavas',  order: 7 },
  { id: 'bra5', country: 'brasil',   flag1: '🇧🇷', name1: 'Brasil',   flag2: '🏆',  name2: 'Quartas',  date: 'Quartas',  order: 9 },
  { id: 'bra6', country: 'brasil',   flag1: '🇧🇷', name1: 'Brasil',   flag2: '🏆',  name2: 'Semi',     date: 'Semifinal',order: 11 },
  { id: 'bra7', country: 'brasil',   flag1: '🇧🇷', name1: 'Brasil',   flag2: '🏆',  name2: 'Final',    date: 'Final',    order: 13 },
  // Portugal
  { id: 'por1', country: 'portugal', flag1: '🇵🇹', name1: 'Portugal', flag2: '🇨🇩', name2: 'Rep. D. Congo', date: '17 Jun', order: 2 },
  { id: 'por2', country: 'portugal', flag1: '🇵🇹', name1: 'Portugal', flag2: '🇺🇿', name2: 'Uzbequistão',   date: '23 Jun', order: 4 },
  { id: 'por3', country: 'portugal', flag1: '🇨🇴', name1: 'Colômbia', flag2: '🇵🇹', name2: 'Portugal',      date: '27 Jun', order: 6 },
  { id: 'por4', country: 'portugal', flag1: '🇵🇹', name1: 'Portugal', flag2: '🏆',  name2: 'Oitavas',  date: 'Oitavas',  order: 8 },
  { id: 'por5', country: 'portugal', flag1: '🇵🇹', name1: 'Portugal', flag2: '🏆',  name2: 'Quartas',  date: 'Quartas',  order: 10 },
  { id: 'por6', country: 'portugal', flag1: '🇵🇹', name1: 'Portugal', flag2: '🏆',  name2: 'Semi',     date: 'Semifinal',order: 12 },
  { id: 'por7', country: 'portugal', flag1: '🇵🇹', name1: 'Portugal', flag2: '🏆',  name2: 'Final',    date: 'Final',    order: 14 },
];

// Estado global
let allPredictions = [];
let allResults     = {};
let currentPlayer  = '';

// ─── INICIALIZAÇÃO ────────────────────────────────────────────────────────────
async function init() {
  await loadResults();
  await loadAllPredictions();
  renderNextGame();
  renderGames('brasil');
  renderGames('portugal');
  renderLeaderboard();
  setupPlayerBar();
}

// ─── SUPABASE: carregar resultados ───────────────────────────────────────────
async function loadResults() {
  try {
    const { data } = await supabase.from('results').select('*');
    if (data) data.forEach(r => { allResults[r.game_id] = r; });
  } catch (e) { /* sem conexão ainda */ }
}

// ─── SUPABASE: carregar palpites ─────────────────────────────────────────────
async function loadAllPredictions() {
  try {
    const { data } = await supabase.from('predictions').select('*');
    if (data) allPredictions = data;
  } catch (e) { allPredictions = []; }
}

// ─── PRÓXIMO JOGO ────────────────────────────────────────────────────────────
function renderNextGame() {
  const container = document.getElementById('next-game-container');

  const sorted = [...GAMES].sort((a, b) => a.order - b.order);
  // primeiro jogo sem resultado ainda (ordenado por data)
  const next = sorted.find(g => !allResults[g.id]);
  // último jogo com resultado (o mais recente)
  const last = [...sorted].reverse().find(g => allResults[g.id]);

  let html = '';

  // card do último jogo jogado
  if (last) {
    const result = allResults[last.id];
    const preds  = allPredictions.filter(p => p.game_id === last.id);
    html += `
      <div class="next-label">Último resultado</div>
      <div class="game-card next-card past-card">
        <div class="game-header">
          <div class="game-team">
            <span class="game-flag">${last.flag1}</span>
            <span class="game-team-name">${last.name1}</span>
          </div>
          <div class="game-center">
            <div class="game-date">${last.date}</div>
            <div class="game-score-display">
              <span class="score-num">${result.score1}</span>
              <span class="score-sep">×</span>
              <span class="score-num">${result.score2}</span>
            </div>
          </div>
          <div class="game-team game-team-right">
            <span class="game-flag">${last.flag2}</span>
            <span class="game-team-name">${last.name2}</span>
          </div>
        </div>
        <div class="predictions-list">
          ${preds.length === 0
            ? `<div style="padding:4px 0;color:var(--text-3);font-size:0.82rem">Nenhum palpite registrado</div>`
            : preds.map(p => {
                const pts = calcPoints(p, result);
                return `
                  <div class="prediction-row">
                    <span class="prediction-name">${p.player_name}</span>
                    <span class="prediction-score">${p.score1} × ${p.score2}</span>
                    <span class="prediction-points points-${pts}">${pts} pt${pts !== 1 ? 's' : ''}</span>
                  </div>`;
              }).join('')}
        </div>
      </div>`;
  }

  // card do próximo jogo
  if (next) {
    const preds = allPredictions.filter(p => p.game_id === next.id);
    html += `
      <div class="next-label" style="margin-top:${last ? '28px' : '0'}">Próximo jogo</div>
      <div class="game-card next-card">
        <div class="game-header">
          <div class="game-team">
            <span class="game-flag">${next.flag1}</span>
            <span class="game-team-name">${next.name1}</span>
          </div>
          <div class="game-center">
            <div class="game-date">${next.date}</div>
            <div class="game-score-display">
              <span class="score-placeholder">vs</span>
            </div>
            <div class="game-actions">
              <button class="btn btn-small" style="margin:0" onclick="openResultModal('${next.id}')">+ Resultado</button>
            </div>
          </div>
          <div class="game-team game-team-right">
            <span class="game-flag">${next.flag2}</span>
            <span class="game-team-name">${next.name2}</span>
          </div>
        </div>
        <div class="predictions-list" style="border-top:1px solid var(--border)">
          ${preds.length === 0
            ? `<div style="padding:8px 0;color:var(--text-3);font-size:0.82rem">Nenhum palpite ainda — vá em ✏️ Palpite!</div>`
            : preds.map(p => `
                <div class="prediction-row">
                  <span class="prediction-name">${p.player_name}</span>
                  <span class="prediction-score">${p.score1} × ${p.score2}</span>
                  <span class="prediction-points points-none">—</span>
                </div>`).join('')}
        </div>
      </div>`;
  } else {
    html += `<div class="empty"><div class="empty-icon">🏆</div><p>Todos os jogos já têm resultado!</p></div>`;
  }

  container.innerHTML = html;
}

// ─── RENDERIZAR JOGOS ────────────────────────────────────────────────────────
function renderAllGames() {
  const container = document.getElementById('games-all');
  const sorted = [...GAMES].sort((a, b) => a.order - b.order);
  container.innerHTML = sorted.map(game => gameCardHTML(game, true)).join('');
}

function renderGames(country) {
  renderAllGames();
}

function togglePredictions(gameId) {
  const list = document.getElementById(`preds-${gameId}`);
  const btn  = document.getElementById(`toggle-${gameId}`);
  const expanded = list.dataset.expanded === 'true';
  list.dataset.expanded = !expanded;

  const preds = allPredictions.filter(p => p.game_id === gameId);
  const result = allResults[gameId];

  if (!expanded) {
    list.innerHTML = predsRowsHTML(preds, result) +
      `<button id="toggle-${gameId}" class="toggle-preds-btn" onclick="togglePredictions('${gameId}')">Minimizar ↑</button>`;
  } else {
    list.innerHTML = predsRowsHTML(preds.slice(0, 5), result) +
      `<button id="toggle-${gameId}" class="toggle-preds-btn" onclick="togglePredictions('${gameId}')">Ver todas as ${preds.length} apostas ↓</button>`;
  }
}

function predsRowsHTML(preds, result) {
  if (preds.length === 0) return `<div style="padding:8px 0;color:var(--text-3);font-size:0.82rem">Nenhum palpite ainda</div>`;
  return preds.map(p => {
    const pts = calcPoints(p, result);
    const ptsClass = result ? `points-${pts}` : 'points-none';
    const ptsLabel = result ? `${pts} pt${pts !== 1 ? 's' : ''}` : '—';
    return `
      <div class="prediction-row">
        <span class="prediction-name">${p.player_name}</span>
        <span class="prediction-score">${p.score1} × ${p.score2}</span>
        <span class="prediction-points ${ptsClass}">${ptsLabel}</span>
      </div>`;
  }).join('');
}

function gameCardHTML(game, collapsible = false) {
  const result = allResults[game.id];
  const preds  = allPredictions.filter(p => p.game_id === game.id);

  const clearBtn = result
    ? `<button class="btn btn-small" style="width:auto;margin:0;padding:6px 10px;background:var(--red-bg);color:var(--red);border:1px solid rgba(220,38,38,0.2)" onclick="clearResult('${game.id}')">🗑️</button>`
    : '';

  const LIMIT = 5;
  const showToggle = collapsible && preds.length > LIMIT;
  const visiblePreds = showToggle ? preds.slice(0, LIMIT) : preds;

  const toggleBtn = showToggle
    ? `<button id="toggle-${game.id}" class="toggle-preds-btn" onclick="togglePredictions('${game.id}')">Ver todas as ${preds.length} apostas ↓</button>`
    : '';

  const predsHtml = predsRowsHTML(visiblePreds, result) + toggleBtn;

  return `
    <div class="game-card">
      <div class="game-header">
        <div class="game-team">
          <span class="game-flag">${game.flag1}</span>
          <span class="game-team-name">${game.name1}</span>
        </div>
        <div class="game-center">
          <div class="game-date">${game.date}</div>
          <div class="game-score-display">
            ${result
              ? `<span class="score-num">${result.score1}</span><span class="score-sep">×</span><span class="score-num">${result.score2}</span>`
              : `<span class="score-placeholder">vs</span>`}
          </div>
          <div class="game-actions">
            <button class="btn btn-small btn-secondary" style="width:auto;margin:0" onclick="openResultModal('${game.id}')">
              ${result ? 'Editar' : '+ Resultado'}
            </button>
            ${clearBtn}
          </div>
        </div>
        <div class="game-team game-team-right">
          <span class="game-flag">${game.flag2}</span>
          <span class="game-team-name">${game.name2}</span>
        </div>
      </div>
      <div class="predictions-list" id="preds-${game.id}" data-expanded="false">${predsHtml}</div>
    </div>`;
}

// ─── CALCULAR PONTOS ─────────────────────────────────────────────────────────
function calcPoints(pred, result) {
  if (!result) return null;
  if (pred.score1 === result.score1 && pred.score2 === result.score2) return 3;
  const predWinner = Math.sign(pred.score1 - pred.score2);
  const realWinner = Math.sign(result.score1 - result.score2);
  if (predWinner === realWinner) return 1;
  return 0;
}

// ─── MODAL: INSERIR RESULTADO ────────────────────────────────────────────────
function openResultModal(gameId) {
  const game = GAMES.find(g => g.id === gameId);
  document.getElementById('result-modal-teams').textContent = `${game.flag1} ${game.name1} vs ${game.flag2} ${game.name2}`;
  document.getElementById('result-game-id').value = gameId;
  const existing = allResults[gameId];
  document.getElementById('result-t1').value = existing ? existing.score1 : 0;
  document.getElementById('result-t2').value = existing ? existing.score2 : 0;
  document.getElementById('result-modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('result-modal').style.display = 'none';
}

async function clearResult(gameId) {
  if (!confirm('Limpar o resultado desse jogo?')) return;
  try {
    await supabase.from('results').delete().eq('game_id', gameId);
    delete allResults[gameId];
    const game = GAMES.find(g => g.id === gameId);
    renderGames(game.country);
    renderLeaderboard();
    showToast('Resultado removido ✅');
  } catch (e) {
    showToast('Erro ao remover resultado.');
  }
}

async function saveResult() {
  const gameId = document.getElementById('result-game-id').value;
  const score1 = parseInt(document.getElementById('result-t1').value);
  const score2 = parseInt(document.getElementById('result-t2').value);

  try {
    await supabase.from('results').upsert({ game_id: gameId, score1, score2 }, { onConflict: 'game_id' });
    allResults[gameId] = { game_id: gameId, score1, score2 };
    closeModal();
    const game = GAMES.find(g => g.id === gameId);
    renderNextGame();
    renderGames(game.country);
    renderLeaderboard();
    showToast('Resultado salvo! ✅');
  } catch (e) {
    showToast('Erro ao salvar resultado. Verifique a conexão.');
  }
}

// ─── FORMULÁRIO DE PALPITES ───────────────────────────────────────────────────
function loadPlayerForm() {
  const name = document.getElementById('player-name-input').value.trim();
  if (!name) { showToast('Digite seu nome primeiro!'); return; }
  currentPlayer = name;
  renderPredictionForm();
  document.getElementById('palpite-form').style.display = 'block';
}

function renderPredictionForm() {
  const container = document.getElementById('form-all');
  const games = [...GAMES].sort((a, b) => a.order - b.order);

  container.innerHTML = games.map(game => {
    const existing = allPredictions.find(p => p.game_id === game.id && p.player_name === currentPlayer);
    const v1 = existing ? existing.score1 : 0;
    const v2 = existing ? existing.score2 : 0;
    const hasResult = !!allResults[game.id];
    if (hasResult) {
      const r = allResults[game.id];
      return `
        <div class="card" style="margin-bottom:12px;opacity:0.55">
          <div style="font-weight:700;margin-bottom:8px">
            ${game.flag1} ${game.name1} vs ${game.flag2} ${game.name2}
            <span style="color:var(--text-3);font-weight:400;font-size:0.8rem;margin-left:6px">${game.date}</span>
          </div>
          <div style="font-size:0.78rem;color:var(--text-2);background:var(--surface-2);padding:8px 12px;border-radius:var(--radius-sm)">
            🔒 Jogo encerrado — resultado: ${r.score1} × ${r.score2}
          </div>
        </div>`;
    }
    return `
      <div class="card" style="margin-bottom:12px">
        <div style="font-weight:700;margin-bottom:12px">
          ${game.flag1} ${game.name1} vs ${game.flag2} ${game.name2}
          <span style="color:var(--text-3);font-weight:400;font-size:0.8rem;margin-left:6px">${game.date}</span>
        </div>
        <div class="score-input">
          <input type="number" id="pred-${game.id}-1" min="0" max="20" value="${v1}" />
          <span class="score-vs">×</span>
          <input type="number" id="pred-${game.id}-2" min="0" max="20" value="${v2}" />
        </div>
      </div>`;
  }).join('');
}

async function savePredictions() {
  if (!currentPlayer) { showToast('Selecione seu nome primeiro!'); return; }

  const rows = GAMES
    .filter(game => !allResults[game.id])
    .map(game => ({
      game_id:     game.id,
      player_name: currentPlayer,
      score1:      parseInt(document.getElementById(`pred-${game.id}-1`)?.value || 0),
      score2:      parseInt(document.getElementById(`pred-${game.id}-2`)?.value || 0),
    }));

  try {
    await supabase.from('predictions').upsert(rows, { onConflict: 'game_id,player_name' });
    showToast('Palpites salvos! 🎉');
    await loadAllPredictions();
    renderNextGame();
    renderGames('brasil');
    renderGames('portugal');
    renderLeaderboard();
    setupPlayerBar();
  } catch (e) {
    showToast('Erro ao salvar. Verifique a conexão com o Supabase.');
  }
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  const players = [...new Set(allPredictions.map(p => p.player_name))];

  if (players.length === 0) {
    container.innerHTML = `<div class="empty"><div class="empty-icon">🏅</div><p>Nenhum palpite ainda.<br>Vá até "Meu Palpite" para começar!</p></div>`;
    return;
  }

  const scores = players.map(name => {
    const preds = allPredictions.filter(p => p.player_name === name);
    let total = 0, exact = 0, winner = 0;
    preds.forEach(p => {
      const result = allResults[p.game_id];
      const pts = calcPoints(p, result);
      if (pts === 3) { total += 3; exact++; }
      else if (pts === 1) { total += 1; winner++; }
    });
    return { name, total, exact, winner };
  }).sort((a, b) => b.total - a.total || b.exact - a.exact);

  const medals = ['🥇', '🥈', '🥉'];

  container.innerHTML = `
    <div class="card">
      <div class="card-title">Classificação Geral</div>
      ${scores.map((s, i) => `
        <div class="leaderboard-row">
          <div class="rank rank-${i+1}">${medals[i] || i+1}</div>
          <div>
            <div class="leaderboard-name">${s.name}</div>
            <div class="leaderboard-detail">${s.exact} placar exato · ${s.winner} resultado certo</div>
          </div>
          <div class="leaderboard-points">${s.total} pts</div>
        </div>`).join('')}
    </div>
    <div class="card">
      <div class="card-title">Como funciona a pontuação</div>
      <table class="score-rules">
        <tr>
          <td class="score-rules-emoji">🎯</td>
          <td class="score-rules-label">Placar exato</td>
          <td><span class="prediction-points points-3">3 pts</span></td>
        </tr>
        <tr>
          <td class="score-rules-emoji">✅</td>
          <td class="score-rules-label">Acertou quem venceu (ou empate)</td>
          <td><span class="prediction-points points-1">1 pt</span></td>
        </tr>
        <tr>
          <td class="score-rules-emoji">❌</td>
          <td class="score-rules-label">Resultado errado</td>
          <td><span class="prediction-points points-0">0 pts</span></td>
        </tr>
      </table>
    </div>`;
}

// ─── BARRA DE JOGADOR ────────────────────────────────────────────────────────
function setupPlayerBar() {
  const players = [...new Set(allPredictions.map(p => p.player_name))];

  // barra de filtro nas tabs Início e Jogos
  const sel = document.getElementById('current-player');
  const saved = sel.value;
  sel.innerHTML = `<option value="">— selecione seu nome —</option>` +
    players.map(p => `<option value="${p}" ${p === saved ? 'selected' : ''}>${p}</option>`).join('');
  const activeTab = document.querySelector('.tab-content.active')?.id?.replace('tab-','');
  const shouldShow = players.length && ['inicio','jogos'].includes(activeTab);
  document.getElementById('player-bar').style.display = shouldShow ? 'flex' : 'none';

  // seletor de usuário existente na aba Palpite
  const existingGroup = document.getElementById('existing-players-group');
  const existingSel   = document.getElementById('existing-player-select');
  if (players.length > 0) {
    existingGroup.style.display = 'block';
    existingSel.innerHTML = `<option value="">— escolha um nome —</option>` +
      players.map(p => `<option value="${p}">${p}</option>`).join('');
  } else {
    existingGroup.style.display = 'none';
  }
}

function onExistingPlayerSelect() {
  const val = document.getElementById('existing-player-select').value;
  const deleteBtn = document.getElementById('delete-player-btn');
  deleteBtn.style.display = val ? 'block' : 'none';
  if (!val) return;
  document.getElementById('player-name-input').value = val;
  loadPlayerForm();
}

async function deletePlayer() {
  const name = document.getElementById('existing-player-select').value;
  if (!name) return;
  if (!confirm(`Excluir todos os palpites de "${name}"? Esta ação não pode ser desfeita.`)) return;

  try {
    await supabase.from('predictions').delete().eq('player_name', name);
    showToast(`Palpites de ${name} removidos ✅`);
    document.getElementById('delete-player-btn').style.display = 'none';
    document.getElementById('palpite-form').style.display = 'none';
    document.getElementById('player-name-input').value = '';
    await loadAllPredictions();
    renderNextGame();
    renderAllGames();
    renderLeaderboard();
    setupPlayerBar();
  } catch (e) {
    showToast('Erro ao excluir participante.');
  }
}

function onPlayerChange() {
  currentPlayer = document.getElementById('current-player').value;
  document.getElementById('player-name-input').value = currentPlayer;
  if (currentPlayer) { renderPredictionForm(); }
}

function showAddPlayer() {
  showTab('palpite');
  document.getElementById('player-name-input').focus();
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function showTab(name) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
  document.getElementById(`tab-${name}`).classList.add('active');
  document.querySelectorAll('.tab-btn')[['inicio','jogos','palpite','placar'].indexOf(name)].classList.add('active');

  const bar = document.getElementById('player-bar');
  const showBar = ['inicio','jogos'].includes(name);
  bar.style.display = showBar ? 'flex' : 'none';
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── START ────────────────────────────────────────────────────────────────────
init();
