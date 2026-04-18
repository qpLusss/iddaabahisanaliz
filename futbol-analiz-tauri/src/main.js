import { invoke } from '@tauri-apps/api/core';

const THINKING_STEPS = [
  'BaÄŸlantÄ± Ã§ekiliyor ve sayfa iÃ§eriÄŸi ayrÄ±ÅŸtÄ±rÄ±lÄ±yor...',
  'Son maÃ§ ritmi ve gol profili hesaplanÄ±yor...',
  'Taktik denge, risk ve senaryolar oluÅŸturuluyor...',
  'Yerel analiz tamamlanÄ±yor, AI katmanÄ± hazÄ±rlanÄ±yor...'
];
const SCAN_THINKING_STEPS = [
  'GÃ¼nlÃ¼k program okunuyor ve aday maÃ§lar Ã§Ä±kartÄ±lÄ±yor...',
  'Lig filtresi ve minimum gÃ¼ven eÅŸiÄŸi uygulanacak havuz hazÄ±rlanÄ±yor...',
  'Her maÃ§ iÃ§in form, pazar ve risk dengesi derinlemesine hesaplanÄ±yor...',
  'En iyi 5 maÃ§ ve uzak durulacak 3 maÃ§ sÄ±ralanÄ±yor...'
];
const LIVE_THINKING_STEPS = [
  'CanlÄ± futbol programÄ± okunuyor...',
  'CanlÄ± skor, dakika ve durum bilgisi eÅŸleÅŸtiriliyor...',
  'Ä°lk yarÄ±, ikinci yarÄ± ve maÃ§ sonucu pazarlarÄ± canlÄ± akÄ±ÅŸa gÃ¶re Ã¶lÃ§Ã¼lÃ¼yor...',
  'CanlÄ± maÃ§ yorumlarÄ± hazÄ±rlanÄ±yor...'
];


const MIN_ANALYSIS_MS = 3200;
const MIN_SCAN_MS = 4200;
const MIN_LIVE_SCAN_MS = 2600;
const TRACKED_REFRESH_LIVE_MS = 10000;
const TRACKED_REFRESH_HALFTIME_MS = 20000;
const TRACKED_REFRESH_SCHEDULED_MS = 60000;
const GOAL_ALERT_WINDOW_MS = 90000;
const HISTORY_LIMIT = 120;
const BACKTEST_LIMIT = 100;
const MIN_BACKTEST_SAMPLE = 12;
const MIN_LEAGUE_CALIBRATION_SAMPLE = 4;
const MIN_MARKET_CALIBRATION_SAMPLE = 3;
const BENCHMARK_SET_SIZE = 30;
const LIVE_DIAGNOSTIC_LIMIT = 180;
const NET_KPI_TARGETS = Object.freeze({
  topHitRate: { label: 'Ana Ã¶neri isabeti', comparator: 'min', target: 62, minSample: 24 },
  playedHitRate: { label: 'Kupon isabeti', comparator: 'min', target: 58, minSample: 18 },
  liveSuccessRate: { label: 'CanlÄ± doÄŸruluk', comparator: 'min', target: 70, minSample: 30 },
  liveNotFoundRate: { label: 'CanlÄ± not_found oranÄ±', comparator: 'max', target: 20, minSample: 30 },
  benchmarkHitRate: { label: 'Sabit test seti isabeti', comparator: 'min', target: 60, minSample: 18 }
});
const FORCE_ASCII_TEXT = false;
if (typeof globalThis !== 'undefined' && typeof globalThis.mojibakeScore !== 'function') {
  globalThis.mojibakeScore = (value) => (String(value ?? '').match(/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/g) ?? []).length;
}
const STORAGE_KEYS = {
  theme: 'mertc-theme',
  aiEnabled: 'mertc-ai-enabled',
  provider: 'mertc-ai-provider',
  apiKey: 'mertc-openai-key',
  model: 'mertc-ai-model',
  baseUrl: 'mertc-ai-base-url',
  scanLeagueFilter: 'mertc-scan-league-filter',
  scanLeagueWhitelist: 'mertc-scan-league-whitelist',
  scanLeagueBlacklist: 'mertc-scan-league-blacklist',
  scanDate: 'mertc-scan-date',
  scanMinConfidence: 'mertc-scan-min-confidence',
  sharpMode: 'mertc-sharp-mode',
  autoTrackScan: 'mertc-auto-track-scan',
  scanTopOnly: 'mertc-scan-top-only',
  liveBestOnly: 'mertc-live-best-only',
  scanPresets: 'mertc-scan-presets',
  scanPresetLast: 'mertc-scan-preset-last',
  footballDataToken: 'mertc-football-data-token',
  apiFootballKey: 'mertc-api-football-key',
  apiFootballBaseUrl: 'mertc-api-football-base-url',
  history: 'mertc-analysis-history-v2',
  benchmarkSet: 'mertc-benchmark-set-v1',
  liveDiagnostics: 'mertc-live-diagnostics-v1'
};
const MOJIBAKE_FIXES = [
  ['\u00C3\u00BC', 'Ã¼'],
  ['\u00C3\u0153', 'Ãœ'],
  ['\u00C3\u00B6', 'Ã¶'],
  ['\u00C3\u2013', 'Ã–'],
  ['\u00C3\u00A7', 'Ã§'],
  ['\u00C3\u2021', 'Ã‡'],
  ['\u00C4\u00B1', 'Ä±'],
  ['\u00C4\u00B0', 'Ä°'],
  ['\u00C4\u0178', 'ÄŸ'],
  ['\u00C4\u017E', 'Ä'],
  ['\u00C5\u0178', 'ÅŸ'],
  ['\u00C5\u017E', 'Å'],
  ['\u00E2\u20AC\u00A2', 'â€¢'],
  ['\u00E2\u20AC\u201C', '-'],
  ['\u00E2\u20AC\u201D', '-'],
  ['\u00E2\u20AC\u2122', "'"],
  ['\u00E2\u20AC\u0153', '"'],
  ['\u00E2\u20AC\u009D', '"']
];
const MOJIBAKE_MARKER = /[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/;
const TURKISH_FIXES = [
  ['Ma\uFFFD', 'MaÃ§'],
  ['ma\uFFFD', 'maÃ§'],
  ['G\uFFFDven', 'GÃ¼ven'],
  ['g\uFFFDven', 'gÃ¼ven'],
  ['\uFFFDst', 'Ãœst'],
  ['\uFFFDST', 'ÃœST'],
  ['\uFFFDneri', 'Ã¶neri'],
  ['\uFFFDneriler', 'Ã¶neriler'],
  ['\uFFFDzeti', 'Ã¶zeti'],
  ['\uFFFD\uFFFDz\uFFFDmleme', 'Ã§Ã¶zÃ¼mleme'],
  ['canl\u00C4\u00B1', 'canlÄ±'],
  ['Canl\u00C4\u00B1', 'CanlÄ±'],
  ['Takipten \u00C3\u2021\u00C4\u00B1kar', 'Takipten Ã‡Ä±kar'],
  ['Takibe Al\u00C4\u00B1nd\u00C4\u00B1', 'Takibe AlÄ±ndÄ±'],
  ['Takibe al\u00C4\u00B1nd\u00C4\u00B1', 'Takibe alÄ±ndÄ±']
];

const root = document.documentElement;
const matchUrlInput = document.querySelector('#matchUrl');
const analyzeBtn = document.querySelector('#analyzeBtn');
const scanBtn = document.querySelector('#scanBtn');
const liveScanBtn = document.querySelector('#liveScanBtn');
const scanDateInput = document.querySelector('#scanDate');
const scanLeagueFilter = document.querySelector('#scanLeagueFilter');
const scanLeagueWhitelist = document.querySelector('#scanLeagueWhitelist');
const scanLeagueBlacklist = document.querySelector('#scanLeagueBlacklist');
const scanPresetSelect = document.querySelector('#scanPresetSelect');
const scanPresetName = document.querySelector('#scanPresetName');
const savePresetBtn = document.querySelector('#savePresetBtn');
const deletePresetBtn = document.querySelector('#deletePresetBtn');
const scanMinConfidence = document.querySelector('#scanMinConfidence');
const sharpModeToggle = document.querySelector('#sharpModeToggle');
const autoTrackScanToggle = document.querySelector('#autoTrackScanToggle');
const scanTopOnlyToggle = document.querySelector('#scanTopOnlyToggle');
const liveBestOnlyToggle = document.querySelector('#liveBestOnlyToggle');
const statusText = document.querySelector('#statusText');
const emptyState = document.querySelector('#emptyState');
const summaryContent = document.querySelector('#summaryContent');
const modeTag = document.querySelector('#modeTag');
const aiState = document.querySelector('#aiState');
const themeToggle = document.querySelector('#themeToggle');
const settingsToggle = document.querySelector('#settingsToggle');
const settingsPanel = document.querySelector('#settingsPanel');
const aiEnabled = document.querySelector('#aiEnabled');
const providerSelect = document.querySelector('#providerSelect');
const apiKeyField = document.querySelector('#apiKeyField');
const apiKeyInput = document.querySelector('#apiKeyInput');
const modelInput = document.querySelector('#modelInput');
const baseUrlInput = document.querySelector('#baseUrlInput');
const footballDataTokenInput = document.querySelector('#footballDataTokenInput');
const apiFootballKeyInput = document.querySelector('#apiFootballKeyInput');
const apiFootballBaseUrlInput = document.querySelector('#apiFootballBaseUrlInput');
const providerNote = document.querySelector('#providerNote');
const historyContent = document.querySelector('#historyContent');
const refreshTrackedBtn = document.querySelector('#refreshTrackedBtn');
const clearHistoryBtn = document.querySelector('#clearHistoryBtn');
const liveHubToggle = document.querySelector('#liveHubToggle');
const liveHubDrawer = document.querySelector('#liveHubDrawer');
const liveHubClose = document.querySelector('#liveHubClose');
const liveHubContent = document.querySelector('#liveHubContent');
const liveMatchCenterDrawer = document.querySelector('#liveMatchCenterDrawer');
const liveMatchCenterClose = document.querySelector('#liveMatchCenterClose');
const liveMatchCenterContent = document.querySelector('#liveMatchCenterContent');
const goalToastRoot = document.querySelector('#goalToastRoot');
const busyOverlay = document.querySelector('#busyOverlay');
const busyTitle = document.querySelector('#busyTitle');
const busyText = document.querySelector('#busyText');
const busyStep = document.querySelector('#busyStep');

let historyCache = null;
let historyLoadPromise = null;
let trackedRefreshTimer = null;
let latestScanData = null;
let latestLiveScanData = null;
let latestAnalysisData = null;
let latestAnalysisUrl = "";
let goalAudioContext = null;
let liveMatchcastCache = new Map();
let liveMatchCenterEntryId = null;
let busyFailsafeTimer = null;
let activeThinkingStop = null;
let listenersBound = false;
bootstrap();

function bootstrap() {
  bindCoreListeners();
  try {
    restoreSettings();
    applyTheme(loadThemePreference());
    applyStaticText();
    renderScanPresetOptions();
    updateProviderUI();
    updateAiState('Yerel analiz motoru hazÄ±r.');
    renderHistory(loadHistory());
    setBusy(false);
    setStatus('HazÄ±r. BaÄŸlantÄ±yÄ± yapÄ±ÅŸtÄ±r veya gÃ¼nlÃ¼k programÄ± tara.', 'idle');
    normalizeDomContent(document.body);
  } catch (error) {
    console.error('Bootstrap init error:', error);
    setBusy(false);
    updateAiState('Yerel analiz motoru hazÄ±r.');
    setStatus('HazÄ±r. BaÄŸlantÄ±yÄ± yapÄ±ÅŸtÄ±r veya gÃ¼nlÃ¼k programÄ± tara.', 'idle');
  }
}

function bindCoreListeners() {
  if (listenersBound) {
    return;
  }
  listenersBound = true;

  analyzeBtn?.addEventListener('click', handleAnalyze);
  scanBtn?.addEventListener('click', handleScan);
  liveScanBtn?.addEventListener('click', handleLiveScan);
  matchUrlInput?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const url = matchUrlInput.value.trim();
      if (isLiveProgramUrl(url)) {
        handleLiveScan();
        return;
      }
      if (isProgramUrl(url)) {
        handleScan();
        return;
      }
      handleAnalyze();
    }
  });

  settingsToggle?.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
    normalizeDomContent(settingsPanel);
  });

  themeToggle?.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(nextTheme);
  });

  liveHubToggle?.addEventListener('click', () => setLiveHubOpen(true));
  liveHubClose?.addEventListener('click', () => setLiveHubOpen(false));
  liveHubDrawer?.addEventListener('click', (event) => {
    if (event.target === liveHubDrawer) {
      setLiveHubOpen(false);
    }
  });
  liveHubContent?.addEventListener('click', handleLiveHubActions);
  liveMatchCenterContent?.addEventListener('click', (event) => {
    void handleLiveMatchCenterActions(event);
  });
  liveMatchCenterClose?.addEventListener('click', () => setLiveMatchCenterOpen(null));
  liveMatchCenterDrawer?.addEventListener('click', (event) => {
    if (event.target === liveMatchCenterDrawer) {
      setLiveMatchCenterOpen(null);
    }
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !liveMatchCenterDrawer?.classList.contains('hidden')) {
      setLiveMatchCenterOpen(null);
      return;
    }
    if (event.key === 'Escape' && !liveHubDrawer?.classList.contains('hidden')) {
      setLiveHubOpen(false);
    }
  });

  aiEnabled?.addEventListener('change', persistSettings);
  scanTopOnlyToggle?.addEventListener('change', persistSettings);
  liveBestOnlyToggle?.addEventListener('change', persistSettings);
  providerSelect?.addEventListener('change', () => {
    updateProviderUI();
    persistSettings();
  });
  apiKeyInput?.addEventListener('input', persistSettings);
  modelInput?.addEventListener('input', persistSettings);
  baseUrlInput?.addEventListener('input', persistSettings);
  footballDataTokenInput?.addEventListener('input', persistSettings);
  apiFootballKeyInput?.addEventListener('input', persistSettings);
  apiFootballBaseUrlInput?.addEventListener('input', persistSettings);
  scanDateInput?.addEventListener('input', persistSettings);
  scanLeagueFilter?.addEventListener('input', persistSettings);
  scanLeagueWhitelist?.addEventListener('input', persistSettings);
  scanLeagueBlacklist?.addEventListener('input', persistSettings);
  scanPresetSelect?.addEventListener('change', handlePresetSelection);
  savePresetBtn?.addEventListener('click', handleSavePreset);
  deletePresetBtn?.addEventListener('click', handleDeletePreset);
  scanMinConfidence?.addEventListener('input', persistSettings);
  sharpModeToggle?.addEventListener('change', persistSettings);
  autoTrackScanToggle?.addEventListener('change', persistSettings);
  clearHistoryBtn?.addEventListener('click', clearHistory);
  refreshTrackedBtn?.addEventListener('click', () => refreshTrackedMatches(false));
  historyContent?.addEventListener('click', handleHistoryActions);
  summaryContent?.addEventListener('click', handleSummaryActions);
}

async function handleAnalyze() {
  const url = matchUrlInput.value.trim();

  if (!url) {
    setStatus('LÃ¼tfen Ã¶nce geÃ§miÅŸ skor baÄŸlantÄ±sÄ±nÄ± gir.', 'warn');
    return;
  }

  if (isProgramUrl(url)) {
    setStatus('Bu baÄŸlantÄ± gÃ¼nlÃ¼k bÃ¼lten sayfasÄ±. Bu akÄ±ÅŸ iÃ§in MaÃ§larÄ± Tara butonunu kullan.', 'warn');
    return;
  }

  setBusy(true, 'analyze');
  const stopThinking = startThinking(THINKING_STEPS);

  try {
    const calibrationPayload = buildCalibrationPayload(loadHistory());
    const analysisPromise = invokeWithTimeout('analyze_match', {
      url,
      ai: buildAiPayload('analyze'),
      data: buildDataPayload(url),
      options: buildOptionsPayload(),
      calibration: calibrationPayload
    }, 90000, 'Analiz');
    const [rawAnalysis] = await Promise.all([analysisPromise, wait(MIN_ANALYSIS_MS)]);
    const analysis = sanitizePayload(rawAnalysis);
    stopThinking();
    latestAnalysisData = analysis;
    latestAnalysisUrl = url;
    renderAnalysis(analysis);
    normalizeDomContent(summaryContent);
    saveAnalysisToHistory(url, analysis);
    setStatus('Analiz hazÄ±r. Yerel motor, gÃ¼ven kÄ±rÄ±lÄ±mÄ± ve AI katmanÄ± birlikte deÄŸerlendirildi.', 'ok');
  } catch (error) {
    stopThinking();
    console.error(error);
    setStatus(
      `Analiz baÅŸarÄ±sÄ±z: ${normalizeErrorMessage(error, 'Beklenmeyen hata')}`, 
      'error'
    );
  } finally {
    setBusy(false);
  }
}

async function handleScan() {
  const fallbackUrl = 'https://www.iddaa.com/program/futbol';
  if (!matchUrlInput.value.trim()) {
    matchUrlInput.value = fallbackUrl;
  }

  const url = matchUrlInput.value.trim();

  if (!url) {
    setStatus('LÃ¼tfen Ã¶nce gÃ¼nlÃ¼k program baÄŸlantÄ±sÄ±nÄ± gir.', 'warn');
    return;
  }

  if (!isProgramUrl(url)) {
    setStatus('Tarama modu iÃ§in gÃ¼nlÃ¼k program baÄŸlantÄ±sÄ±nÄ± gir. Ã–rnek: https://www.iddaa.com/program/futbol', 'warn');
    return;
  }

  setBusy(true, 'scan');
  const stopThinking = startThinking(SCAN_THINKING_STEPS);

  try {
    const calibrationPayload = buildCalibrationPayload(loadHistory());
    const scanPromise = invokeWithTimeout('scan_daily_program', {
      url,
      ai: buildAiPayload('scan'),
      data: buildDataPayload(url),
      scan: buildScanPayload(),
      options: buildOptionsPayload(),
      calibration: calibrationPayload
    }, 90000, 'GÃ¼nlÃ¼k tarama');
    const [rawScan] = await Promise.all([scanPromise, wait(MIN_SCAN_MS)]);
    const scan = sanitizePayload(rawScan);
    const displayScan = applyDisplayFiltersToScan(scan);
    stopThinking();
    renderDailyScan(displayScan);
    setStatus(
      scanTopOnlyToggle?.checked
        ? 'GÃ¼nlÃ¼k tarama hazÄ±r. Sadece en gÃ¼venilir 3 maÃ§ gÃ¶steriliyor.'
        : 'GÃ¼nlÃ¼k tarama hazÄ±r. En gÃ¼venilir 5 maÃ§ ve uzak durulacak 3 maÃ§ sÄ±ralandÄ±.',
      'ok'
    );
  } catch (error) {
    stopThinking();
    console.error(error);
    setStatus(
      `GÃ¼nlÃ¼k tarama baÅŸarÄ±sÄ±z: ${normalizeErrorMessage(error, 'GÃ¼nlÃ¼k tarama hatasÄ±')}`, 
      'error'
    );
  } finally {
    setBusy(false);
  }
}

async function handleLiveScan() {
  const fallbackUrl = 'https://www.iddaa.com/program/canli/futbol';
  if (!matchUrlInput.value.trim()) {
    matchUrlInput.value = fallbackUrl;
  }
  const url = matchUrlInput.value.trim();
  if (!url) {
    setStatus('LÃ¼tfen Ã¶nce canlÄ± futbol program baÄŸlantÄ±sÄ±nÄ± gir.', 'warn');
    return;
  }
  if (!isLiveProgramUrl(url)) {
    setStatus('CanlÄ± sorgu iÃ§in canlÄ± futbol program baÄŸlantÄ±sÄ±nÄ± gir. Ã–rnek: https://www.iddaa.com/program/canli/futbol', 'warn');
    return;
  }
  setBusy(true, 'live');
  const stopThinking = startThinking(LIVE_THINKING_STEPS);
  try {
    const calibrationPayload = buildCalibrationPayload(loadHistory());
    const liveScanPromise = invokeWithTimeout('scan_live_matches', {
      url,
      ai: buildAiPayload('live'),
      data: buildDataPayload(url),
      options: buildOptionsPayload(),
      calibration: calibrationPayload
    }, 90000, 'CanlÄ± tarama');
    const [rawLiveScan] = await Promise.all([liveScanPromise, wait(MIN_LIVE_SCAN_MS)]);
    const liveScan = sanitizePayload(rawLiveScan);
    const displayLiveScan = applyDisplayFiltersToLiveScan(liveScan);
    stopThinking();
    renderLiveScan(displayLiveScan);
    setStatus(
      liveBestOnlyToggle?.checked
        ? 'CanlÄ± maÃ§ taramasÄ± hazÄ±r. En gÃ¼Ã§lÃ¼ tek canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.'
        : 'CanlÄ± maÃ§ taramasÄ± hazÄ±r. ' + (displayLiveScan.analyzedCount ?? 0) + ' maÃ§ yorumlandÄ±.',
      'ok'
    );
  } catch (error) {
    stopThinking();
    console.error(error);
    setStatus(`CanlÄ± maÃ§ taramasÄ± baÅŸarÄ±sÄ±z: ${normalizeErrorMessage(error, 'CanlÄ± tarama hatasÄ±')}`, 'error');
  } finally {
    setBusy(false);
  }
}
function buildAiPayload(mode = 'analyze') {
  void mode;
  return {
    enabled: false,
    provider: providerSelect.value,
    apiKey: apiKeyInput.value.trim(),
    model: modelInput.value.trim() || defaultModelForProvider(providerSelect.value),
    baseUrl: baseUrlInput.value.trim() || defaultBaseUrlForProvider(providerSelect.value)
  };
}
function buildDataPayload(url = '') {
  void url;
  const footballDataToken = footballDataTokenInput?.value?.trim() || '';
  const apiFootballKey = apiFootballKeyInput?.value?.trim() || '';
  const apiFootballBaseUrl = apiFootballBaseUrlInput?.value?.trim() || '';
  const payload = {};

  if (footballDataToken) {
    payload.footballDataToken = footballDataToken;
  }
  if (apiFootballKey) {
    payload.apiFootballKey = apiFootballKey;
    if (apiFootballBaseUrl) {
      payload.apiFootballBaseUrl = apiFootballBaseUrl;
    }
  }

  return Object.keys(payload).length ? payload : null;
}

function buildOptionsPayload() {
  return {
    sharpMode: !!sharpModeToggle?.checked,
    autoTrackScan: !!autoTrackScanToggle?.checked
  };
}

function todayLocalIso() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

function parseLeaguePolicyInput(value) {
  return String(value || '')
    .split(',')
    .map((item) => normalizeTurkishText(item).trim())
    .filter(Boolean);
}


function normalizePresetName(value) {
  return normalizeTurkishText(value || '').trim();
}

function loadScanPresets() {
  const raw = localStorage.getItem(STORAGE_KEYS.scanPresets);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((item) => item && typeof item.name === 'string' && item.name.trim().length)
      : [];
  } catch (error) {
    return [];
  }
}

function persistScanPresets(presets) {
  localStorage.setItem(STORAGE_KEYS.scanPresets, JSON.stringify(presets));
}

function renderScanPresetOptions() {
  if (!scanPresetSelect) {
    return;
  }
  const presets = loadScanPresets();
  const lastPreset = localStorage.getItem(STORAGE_KEYS.scanPresetLast) ?? '';
  scanPresetSelect.innerHTML = [
    '<option value="">Bir ÅŸablon seÃ§</option>',
    ...presets.map((preset) => `<option value="${escapeHtml(preset.name)}">${escapeHtml(preset.name)}</option>`)
  ].join('');

  if (lastPreset && presets.some((preset) => preset.name === lastPreset)) {
    scanPresetSelect.value = lastPreset;
    if (scanPresetName && !scanPresetName.value) {
      scanPresetName.value = lastPreset;
    }
  }
}

function applyScanPreset(name) {
  const normalizedName = normalizePresetName(name);
  if (!normalizedName) {
    return;
  }
  const presets = loadScanPresets();
  const preset = presets.find((item) => normalizePresetName(item.name) === normalizedName);
  if (!preset) {
    return;
  }
  if (scanLeagueWhitelist) {
    scanLeagueWhitelist.value = preset.whitelist ?? '';
  }
  if (scanLeagueBlacklist) {
    scanLeagueBlacklist.value = preset.blacklist ?? '';
  }
  if (scanPresetName) {
    scanPresetName.value = preset.name;
  }
  localStorage.setItem(STORAGE_KEYS.scanPresetLast, preset.name);
  persistSettings();
  setStatus(`Åablon uygulandÄ±: ${preset.name}`, 'ok');
}
function handlePresetSelection() {
  if (!scanPresetSelect) {
    return;
  }
  applyScanPreset(scanPresetSelect.value);
}

function handleSavePreset() {
  if (!scanPresetName) {
    return;
  }
  const name = normalizePresetName(scanPresetName.value);
  if (!name) {
    setStatus('Åablon adÄ± gir.', 'warn');
    return;
  }
  const whitelist = scanLeagueWhitelist?.value.trim() ?? '';
  const blacklist = scanLeagueBlacklist?.value.trim() ?? '';
  const presets = loadScanPresets();
  const index = presets.findIndex((item) => normalizePresetName(item.name).toLowerCase() === name.toLowerCase());
  const nextPreset = { name, whitelist, blacklist, updatedAt: new Date().toISOString() };

  if (index >= 0) {
    presets[index] = { ...presets[index], ...nextPreset };
  } else {
    presets.push(nextPreset);
  }

  persistScanPresets(presets);
  localStorage.setItem(STORAGE_KEYS.scanPresetLast, name);
  if (scanPresetSelect) {
    scanPresetSelect.value = name;
  }
  renderScanPresetOptions();
  setStatus(`Åablon kaydedildi: ${name}`, 'ok');
}

function handleDeletePreset() {
  const name = normalizePresetName(scanPresetSelect?.value || scanPresetName?.value || '');
  if (!name) {
    setStatus('Silmek iÃ§in ÅŸablon seÃ§.', 'warn');
    return;
  }
  const presets = loadScanPresets();
  const nextPresets = presets.filter((item) => normalizePresetName(item.name).toLowerCase() !== name.toLowerCase());
  if (nextPresets.length === presets.length) {
    setStatus('Bu isimde ÅŸablon bulunamadÄ±.', 'warn');
    return;
  }
  persistScanPresets(nextPresets);
  localStorage.removeItem(STORAGE_KEYS.scanPresetLast);
  if (scanPresetSelect) {
    scanPresetSelect.value = '';
  }
  if (scanPresetName) {
    scanPresetName.value = '';
  }
  renderScanPresetOptions();
  setStatus(`Åablon silindi: ${name}`, 'ok');
}
function buildScanPayload() {
  const minConfidence = Number.parseInt(scanMinConfidence.value, 10);
  const normalizedMinConfidence = Number.isInteger(minConfidence)
    ? Math.max(42, Math.min(96, minConfidence))
    : 74;
  scanMinConfidence.value = String(normalizedMinConfidence);

  return {
    selectedDate: scanDateInput.value || todayLocalIso(),
    leagueFilters: parseLeaguePolicyInput(scanLeagueFilter.value),
    leagueWhitelist: parseLeaguePolicyInput(scanLeagueWhitelist?.value),
    leagueBlacklist: parseLeaguePolicyInput(scanLeagueBlacklist?.value),
    minConfidence: normalizedMinConfidence
  };
}

function restoreSettings() {
  aiEnabled.checked = localStorage.getItem(STORAGE_KEYS.aiEnabled) === 'true';
  providerSelect.value = localStorage.getItem(STORAGE_KEYS.provider) ?? 'ollama';
  apiKeyInput.value = localStorage.getItem(STORAGE_KEYS.apiKey) ?? '';
  modelInput.value = localStorage.getItem(STORAGE_KEYS.model) ?? defaultModelForProvider(providerSelect.value);
  baseUrlInput.value = localStorage.getItem(STORAGE_KEYS.baseUrl) ?? defaultBaseUrlForProvider(providerSelect.value);
  scanDateInput.value = todayLocalIso();
  localStorage.setItem(STORAGE_KEYS.scanDate, scanDateInput.value);
  scanLeagueFilter.value = localStorage.getItem(STORAGE_KEYS.scanLeagueFilter) ?? '';
  if (scanLeagueWhitelist) {
    scanLeagueWhitelist.value = localStorage.getItem(STORAGE_KEYS.scanLeagueWhitelist) ?? '';
  }
  if (scanLeagueBlacklist) {
    scanLeagueBlacklist.value = localStorage.getItem(STORAGE_KEYS.scanLeagueBlacklist) ?? '';
  }
  if (scanPresetName) {
    scanPresetName.value = localStorage.getItem(STORAGE_KEYS.scanPresetLast) ?? '';
  }
  scanMinConfidence.value = localStorage.getItem(STORAGE_KEYS.scanMinConfidence) ?? '74';
  sharpModeToggle.checked = localStorage.getItem(STORAGE_KEYS.sharpMode) !== 'false';
  autoTrackScanToggle.checked = localStorage.getItem(STORAGE_KEYS.autoTrackScan) === 'true';
  if (scanTopOnlyToggle) { scanTopOnlyToggle.checked = localStorage.getItem(STORAGE_KEYS.scanTopOnly) === 'true'; }
  if (liveBestOnlyToggle) { liveBestOnlyToggle.checked = localStorage.getItem(STORAGE_KEYS.liveBestOnly) === 'true'; }
  footballDataTokenInput.value = localStorage.getItem(STORAGE_KEYS.footballDataToken) ?? '';
  if (apiFootballKeyInput) {
    apiFootballKeyInput.value = localStorage.getItem(STORAGE_KEYS.apiFootballKey) ?? '';
  }
  if (apiFootballBaseUrlInput) {
    apiFootballBaseUrlInput.value = localStorage.getItem(STORAGE_KEYS.apiFootballBaseUrl) ?? 'https://v3.football.api-sports.io';
  }
}
function persistSettings() {
  localStorage.setItem(STORAGE_KEYS.aiEnabled, String(aiEnabled.checked));
  localStorage.setItem(STORAGE_KEYS.provider, providerSelect.value);
  localStorage.setItem(STORAGE_KEYS.apiKey, apiKeyInput.value);
  localStorage.setItem(STORAGE_KEYS.model, modelInput.value || defaultModelForProvider(providerSelect.value));
  localStorage.setItem(STORAGE_KEYS.baseUrl, baseUrlInput.value || defaultBaseUrlForProvider(providerSelect.value));
  localStorage.setItem(STORAGE_KEYS.scanDate, scanDateInput.value || todayLocalIso());
  localStorage.setItem(STORAGE_KEYS.scanLeagueFilter, scanLeagueFilter.value);
  if (scanLeagueWhitelist) {
    localStorage.setItem(STORAGE_KEYS.scanLeagueWhitelist, scanLeagueWhitelist.value);
  }
  if (scanLeagueBlacklist) {
    localStorage.setItem(STORAGE_KEYS.scanLeagueBlacklist, scanLeagueBlacklist.value);
  }
  localStorage.setItem(STORAGE_KEYS.scanMinConfidence, scanMinConfidence.value || '74');
  localStorage.setItem(STORAGE_KEYS.sharpMode, String(!!sharpModeToggle.checked));
  localStorage.setItem(STORAGE_KEYS.autoTrackScan, String(!!autoTrackScanToggle.checked));
  if (scanTopOnlyToggle) { localStorage.setItem(STORAGE_KEYS.scanTopOnly, String(!!scanTopOnlyToggle.checked)); }
  if (liveBestOnlyToggle) { localStorage.setItem(STORAGE_KEYS.liveBestOnly, String(!!liveBestOnlyToggle.checked)); }
  localStorage.setItem(STORAGE_KEYS.footballDataToken, footballDataTokenInput.value);
  if (apiFootballKeyInput) {
    localStorage.setItem(STORAGE_KEYS.apiFootballKey, apiFootballKeyInput.value);
  }
  if (apiFootballBaseUrlInput) {
    localStorage.setItem(STORAGE_KEYS.apiFootballBaseUrl, apiFootballBaseUrlInput.value || 'https://v3.football.api-sports.io');
  }
}
function defaultModelForProvider(provider) {
  return provider === 'openai' ? 'gpt-5-mini' : 'qwen2.5:7b';
}

function defaultBaseUrlForProvider(provider) {
  return provider === 'openai' ? 'https://api.openai.com/v1' : 'http://localhost:11434';
}

function updateProviderUI() {
  const provider = providerSelect.value;
  const showApiKey = provider === 'openai';

  apiKeyField.classList.toggle('hidden', !showApiKey);
  providerNote.innerHTML = normalizeTurkishText(
    showApiKey
      ? 'OpenAI iÃ§in geÃ§erli bir API anahtarÄ± gerekir. Kota veya bakiye yoksa ikinci katman Ã§alÄ±ÅŸmaz.'
      : 'Ollama iÃ§in en az bir modelin gerÃ§ekten kurulmuÅŸ olmasÄ± gerekir. Uygulama <code>/api/tags</code> ile kurulu modelleri okur; yalnÄ±zca indirilebilir listeyi gÃ¶rmek yetmez. Ã–rnek: <code>ollama pull gemma3:4b</code>'
  );

  if (!baseUrlInput.value.trim() || baseUrlInput.value.trim() === 'https://api.openai.com/v1' || baseUrlInput.value.trim() === 'http://localhost:11434' || baseUrlInput.value.trim() === 'http://localhost:11434/api' || baseUrlInput.value.trim() === 'http://localhost:11434/api/tags') {
    baseUrlInput.value = defaultBaseUrlForProvider(provider);
  }

  if (!modelInput.value.trim() || modelInput.value.trim() === 'gpt-5-mini' || modelInput.value.trim() === 'qwen2.5:7b') {
    modelInput.value = defaultModelForProvider(provider);
  }

  normalizeDomContent(settingsPanel);
}

function loadThemePreference() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem(STORAGE_KEYS.theme, theme);
  themeToggle.textContent = theme === 'light' ? 'Koyu Mod' : 'AÃ§Ä±k Mod';
}


function getBusyTitle(mode = 'analyze') {
  if (mode === 'scan') return 'MaÃ§lar sorgulanÄ±yor';
  if (mode === 'live') return 'CanlÄ± maÃ§lar sorgulanÄ±yor';
  return 'MaÃ§ sorgulanÄ±yor';
}
function updateBusyOverlayStep(message) {
  if (!busyStep) return;
  busyStep.textContent = cleanText(message, 'Veri iÅŸleniyor...');
}

function setBusyOverlay(isBusy, mode = 'analyze') {
  if (!busyOverlay) return;
  if (!isBusy) {
    if (activeThinkingStop) {
      activeThinkingStop();
      activeThinkingStop = null;
    }
    busyOverlay.classList.add('hidden');
    busyOverlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('busy-open');
    updateBusyOverlayStep('Veri iÅŸleniyor...');
    return;
  }
  if (busyTitle) busyTitle.textContent = getBusyTitle(mode);
  if (busyText) {
    busyText.textContent = mode === 'analyze'
      ? 'Tek maÃ§ verisi sorgulanÄ±yor, lÃ¼tfen bekleyin.'
      : mode === 'scan'
        ? 'GÃ¼nlÃ¼k programdaki maÃ§lar sorgulanÄ±yor, lÃ¼tfen bekleyin.'
        : 'CanlÄ± listedeki maÃ§lar sorgulanÄ±yor, lÃ¼tfen bekleyin.';
  }
  busyOverlay.classList.remove('hidden');
  busyOverlay.setAttribute('aria-hidden', 'false');
  document.body.classList.add('busy-open');
}
function startThinking(steps = THINKING_STEPS) {
  if (activeThinkingStop) {
    activeThinkingStop();
    activeThinkingStop = null;
  }
  let stepIndex = 0;
  const firstStep = cleanText(steps[stepIndex], 'Veri iÅŸleniyor...');
  updateBusyOverlayStep(firstStep);
  setStatus(firstStep, 'normal');
  const timer = window.setInterval(() => {
    stepIndex = (stepIndex + 1) % steps.length;
    const currentStep = cleanText(steps[stepIndex], 'Veri iÅŸleniyor...');
    updateBusyOverlayStep(currentStep);
    setStatus(currentStep, 'normal');
  }, 1000);
  const stop = () => {
    window.clearInterval(timer);
    if (activeThinkingStop === stop) activeThinkingStop = null;
  };
  activeThinkingStop = stop;
  return stop;
}
function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function invokeWithTimeout(command, payload, timeoutMs = 70000, label = 'Ä°ÅŸlem') {
  return Promise.race([
    invoke(command, payload),
    new Promise((_, reject) => {
      window.setTimeout(() => {
        reject(new Error(`${label} zaman aÅŸÄ±mÄ±na uÄŸradÄ±. AÄŸ baÄŸlantÄ±sÄ±nÄ± ve veri kaynaÄŸÄ±nÄ± kontrol et.`));
      }, timeoutMs);
    })
  ]);
}
function setBusy(isBusy, mode = 'analyze') {
  analyzeBtn.disabled = isBusy;
  scanBtn.disabled = isBusy;
  if (liveScanBtn) liveScanBtn.disabled = isBusy;
  analyzeBtn.textContent = isBusy && mode === 'analyze' ? 'Analiz yapÄ±lÄ±yor...' : 'Analiz Et';
  scanBtn.textContent = 'MaÃ§larÄ± Tara';
  if (liveScanBtn) liveScanBtn.textContent = 'CanlÄ± MaÃ§larÄ± Sorgula';

  if (busyFailsafeTimer) {
    window.clearTimeout(busyFailsafeTimer);
    busyFailsafeTimer = null;
  }

  if (isBusy) {
    busyFailsafeTimer = window.setTimeout(() => {
      if (activeThinkingStop) {
        activeThinkingStop();
        activeThinkingStop = null;
      }
      analyzeBtn.disabled = false;
      scanBtn.disabled = false;
      analyzeBtn.textContent = 'Analiz Et';
      scanBtn.textContent = 'MaÃ§larÄ± Tara';
      if (liveScanBtn) {
        liveScanBtn.disabled = false;
        liveScanBtn.textContent = 'CanlÄ± MaÃ§larÄ± Sorgula';
      }
      setBusyOverlay(false, mode);
      setStatus('Ä°ÅŸlem zaman aÅŸÄ±mÄ±na uÄŸradÄ±. Veri kaynaÄŸÄ± yanÄ±t vermediÄŸi iÃ§in bekleme sonlandÄ±rÄ±ldÄ±.', 'error');
    }, mode === 'scan' ? 100000 : 80000);
  } else if (activeThinkingStop) {
    activeThinkingStop();
    activeThinkingStop = null;
  }
  setBusyOverlay(isBusy, mode);
}
function setStatus(message, level) {
  statusText.textContent = cleanText(message, 'HazÄ±r.');
  statusText.style.color =
    level === 'error'
      ? 'var(--danger)'
      : level === 'warn'
        ? 'var(--warning)'
        : level === 'ok'
          ? 'var(--accent)'
          : 'var(--muted)';
}

function updateAiState(message) {
  aiState.textContent = cleanText(message, 'Yerel analiz motoru hazÄ±r.');
}

function renderDailyScan(data) {
  latestScanData = data;
  emptyState.classList.add('hidden');
  summaryContent.classList.remove('hidden');
  modeTag.textContent = 'Istatistik taramasi';
  updateAiState(
    data.displayMode === 'top3'
      ? `${cleanText(data.scanDate, '-')} programÄ± tarandÄ± â€¢ en gÃ¼Ã§lÃ¼ 3 maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±`
      : `${cleanText(data.scanDate, '-')} programÄ± tarandÄ± â€¢ ${data.qualifiedCount} eÅŸik Ã¼stÃ¼ maÃ§ kaldÄ± â€¢ ${data.avoidPicks.length} uzak dur sinyali Ã¼retildi`
  );

  const filterPills = [];
  if (Array.isArray(data.leagueFilters) && data.leagueFilters.length) {
    filterPills.push(
      ...data.leagueFilters.map((item) => `<span class="source-pill strong">${safeText(item)}</span>`)
    );
  }
  if (Array.isArray(data.leagueWhitelist) && data.leagueWhitelist.length) {
    filterPills.push(
      ...data.leagueWhitelist.map((item) => `<span class="source-pill strong">Beyaz: ${safeText(item)}</span>`)
    );
  }
  if (Array.isArray(data.leagueBlacklist) && data.leagueBlacklist.length) {
    filterPills.push(
      ...data.leagueBlacklist.map((item) => `<span class="source-pill limited">Kara: ${safeText(item)}</span>`)
    );
  }
  const filters = filterPills.length
    ? filterPills.join('')
    : `<span class="source-pill limited">TÃ¼m ligler</span>`;
  const selectedDateLabel = safeText(data.scanDate || (scanDateInput.value || todayLocalIso()));
  const scanSummary = buildDailyScanHeadline(data);
  const couponPackages = Array.isArray(data.couponPackages) ? data.couponPackages : [];

  summaryContent.innerHTML = `
    <div class="analysis-stack">
      <section class="match-shell">
        <div class="match-headline">
          <div>
            <div class="headline-pills">
              <span class="source-pill strong">${safeText(cleanSourceLabel(data.sourceLabel))}</span>
              <span class="source-pill strong">${selectedDateLabel}</span>
              <span class="source-pill strong">Minimum gÃ¼ven %${data.minConfidence}</span>
              ${filters}
            </div>
            <h3>SeÃ§ili gÃ¼n tarama Ã¶zeti</h3>
            <p>${safeText(scanSummary)}</p>
          </div>
          <div class="meta-block">
            <div>Aday maÃ§: ${data.candidateCount}</div>
            <div>Taranan maÃ§: ${data.scannedCount}</div>
            <div>BaÅŸarÄ±lÄ± analiz: ${data.analyzedCount}</div>
          </div>
        </div>

        <div class="metric-strip">
          ${renderMetricCard('Aday', data.candidateCount, 'GÃ¼nÃ¼n programÄ±ndaki maÃ§lar', { suffix: '' })}
          ${renderMetricCard('Taranan', data.scannedCount, 'DetaylÄ± incelenen maÃ§lar', { suffix: '' })}
          ${renderMetricCard('Lig uyumu', data.matchedCount, 'Lig politikasÄ±na uyan maÃ§lar', { suffix: '' })}
          ${renderMetricCard('EÅŸik ÃœstÃ¼', data.qualifiedCount, 'Minimum gÃ¼veni geÃ§en maÃ§lar', { suffix: '' })}
        </div>
      </section>

      ${renderCouponPackages(couponPackages, data.autoTrackScan)}

      ${renderScanSection(
        data.displayMode === 'top3' ? 'SeÃ§ilen gÃ¼nÃ¼n en gÃ¼Ã§lÃ¼ 3 maÃ§Ä±' : 'SeÃ§ilen gÃ¼nÃ¼n en gÃ¼venilir 5 maÃ§Ä±',
        data.displayMode === 'top3'
          ? 'Filtre aÃ§Ä±k olduÄŸu iÃ§in yalnÄ±zca en yÃ¼ksek gÃ¼venli 3 maÃ§ gÃ¶steriliyor.'
          : `EÅŸik ÃœstÃ¼nde kalan ${data.qualifiedCount} maÃ§ iÃ§inden en saÄŸlam 5 seÃ§im listelendi.`,
        data.topPicks,
        'top',
        data.minConfidence
      )}

      ${data.displayMode === 'top3' ? '' : renderScanSection(
        'Uzak durulacak 3 maÃ§',
        'Risk dengesi, dÃ¼ÅŸÃ¼k gÃ¼ven ve kÄ±rÄ±lgan pazar yapÄ±sÄ± nedeniyle uzak durulmasÄ± gereken maÃ§lar.',
        data.avoidPicks,
        'avoid',
        data.minConfidence
      )}
    </div>
  `;

  normalizeDomContent(summaryContent);
}

function renderLiveScan(data) {
  latestLiveScanData = data;
  emptyState.classList.add('hidden');
  summaryContent.classList.remove('hidden');
  modeTag.textContent = 'CanlÄ± maÃ§ akÄ±ÅŸÄ±';
  updateAiState(
    data.displayMode === 'best1'
      ? 'CanlÄ± program tarandÄ± â€¢ en gÃ¼Ã§lÃ¼ tek canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.'
      : `CanlÄ± programdan ${data.analyzedCount} maÃ§ yorumlandÄ±. Ä°lk yarÄ±, ikinci yarÄ± ve maÃ§ sonucu pazarlarÄ± canlÄ± akÄ±ÅŸa gÃ¶re gÃ¼ncellendi.`
  );

  summaryContent.innerHTML = `
    <div class="analysis-stack">
      <section class="match-shell live-shell">
        <div class="match-headline">
          <div>
            <div class="headline-pills">
              <span class="source-pill strong">${safeText(cleanSourceLabel(data.sourceLabel))}</span>
              <span class="source-pill strong">CanlÄ± futbol</span>
            </div>
            <h3 class="live-title"><span class="live-dot" aria-hidden="true"></span>${safeText(data.displayMode === 'best1' ? 'En gÃ¼Ã§lÃ¼ canlÄ± maÃ§ seÃ§ildi' : 'CanlÄ± maÃ§lar yorumlandÄ±')}</h3>
            <p>${safeText(data.displayMode === 'best1' ? 'Filtre aÃ§Ä±k olduÄŸu iÃ§in gÃ¼veni en yÃ¼ksek canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.' : (data.summaryNote || `${data.analyzedCount} canlÄ± maÃ§ dakika ve skor bilgisiyle yorumlandÄ±.`))}</p>
          </div>
          <div class="meta-block">
            <div>CanlÄ± maÃ§: ${data.liveCount}</div>
            <div>Yorumlanan: ${data.analyzedCount}</div>
          </div>
        </div>
      </section>

      <section class="scan-section live-section">
        <div class="scan-section-head">
          <div>
            <h3>${safeText(data.displayMode === 'best1' ? 'Ã–ne Ã§Ä±kan canlÄ± maÃ§' : 'CanlÄ± futbol masasÄ±')}</h3>
            <p>${safeText(data.displayMode === 'best1' ? 'Filtre aÃ§Ä±k. Åu anda en gÃ¼venilir canlÄ± senaryo tek kartta gÃ¶steriliyor.' : 'Dakika, skor ve oyun ritmine gÃ¶re ilk yarÄ±, ikinci yarÄ± ve maÃ§ sonucu pazarlarÄ± birlikte okunur.')}</p>
          </div>
          <span class="source-pill strong"><span class="live-dot inline-live-dot" aria-hidden="true"></span>${data.picks?.length ?? 0} canlÄ± maÃ§</span>
        </div>
        <div class="live-picks-grid">
          ${(data.picks ?? []).map((item, index) => renderLivePickCard(item, index)).join('')}
        </div>
      </section>
    </div>
  `;

  normalizeDomContent(summaryContent);
}

function normalizeDisplayMarketLabel(label) {
  const raw = normalizeTurkishText(String(label ?? ''));
  const cleaned = cleanText(raw, 'Belirsiz')
    .replace(/[|]+/g, ' ')
    .replace(/[?]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || scoreTextCorruption(cleaned) >= 3 || cleaned.length > 90) {
    return 'Belirsiz';
  }

  const lineMatch = cleaned.match(/(\d+)\.5/);
  const side = /\balt\b/i.test(cleaned)
    ? 'Alt'
    : /\b(?:Ã¼st|Ã¼st|st)\b/i.test(cleaned)
      ? 'Ãœst'
      : '';

  if (/\bkg\b/i.test(cleaned) && /\bvar\b/i.test(cleaned)) return 'KG Var';
  if (/\bkg\b/i.test(cleaned) && /\byok\b/i.test(cleaned)) return 'KG Yok';
  if (/\buzak\b/i.test(cleaned) && /\bdur\b/i.test(cleaned)) return 'Uzak Dur';
  if (/\bberaber/i.test(cleaned)) return 'Beraberlik';
  if (/\b1x\b/i.test(cleaned)) return '1X';
  if (/\bx2\b/i.test(cleaned)) return 'X2';
  if (/\b2y\b/i.test(cleaned) && lineMatch && side) return `2Y ${lineMatch[1]}.5 ${side}`;
  if (/\b(?:ilk|iy|yarÄ±|yarÄ±|yar)\b/i.test(cleaned) && lineMatch && side) return `Ä°lk YarÄ± ${lineMatch[1]}.5 ${side}`;
  if (/\b(?:maÃ§|maÃ§|ma|ms)\b/i.test(cleaned) && /\bsonu\b/i.test(cleaned) && lineMatch && side) return `MaÃ§ Sonu ${lineMatch[1]}.5 ${side}`;
  if (/^1$/.test(cleaned.trim())) return '1';
  if (/^2$/.test(cleaned.trim())) return '2';
  if (/^(?:pazar|market|secim|seÃ§im|unknown|belirsiz)$/i.test(cleaned.trim())) return 'Belirsiz';

  return cleaned
    .replace(/\bMa\?\s*Sonu\b/gi, 'MaÃ§ Sonu')
    .replace(/\bMaÃ§\?\s*Sonu\b/gi, 'MaÃ§ Sonu')
    .replace(/\bMa Sonu\b/gi, 'MaÃ§ Sonu')
    .replace(/\bÃœst\b/g, 'Ãœst')
    .replace(/\bÃœST\b/g, 'ÃœST')
    .replace(/\bÃ¼st\b/g, 'Ã¼st')
    .replace(/\?\s*st\b/gi, 'Ãœst')
    .replace(/\bCanli\b/gi, 'CanlÄ±')
    .replace(/\bCanl\?\b/gi, 'CanlÄ±')
    .replace(/\bIlk YarÄ±\b/gi, 'Ä°lk YarÄ±')
    .replace(/\bIlk Yar\?\b/gi, 'Ä°lk YarÄ±')
    .replace(/\b\Ä°lk Yar\?\b/gi, 'Ä°lk YarÄ±')
    .replace(/\bIlk Yar\b/gi, 'Ä°lk YarÄ±')
    .replace(/\bYari\b/gi, 'YarÄ±')
    .replace(/\bYar\?\b/gi, 'YarÄ±')
    .replace(/\bUzakDur\b/g, 'Uzak Dur')
    .replace(/\bUzak\s+Dur\b/gi, 'Uzak Dur')
    .replace(/\s+/g, ' ')
    .trim() || 'Belirsiz';
}

function isGenericMarketLabel(label) {
  const normalized = normalizeDisplayMarketLabel(label).toLocaleLowerCase('tr-TR');
  return (
    !normalized ||
    normalized === 'belirsiz' ||
    normalized === 'pazar' ||
    normalized === 'market' ||
    normalized === 'seÃ§im'
  );
}
function parseLiveScoreTuple(value) {
  const match = String(value || '').match(/(\d+)\s*[-:]\s*(\d+)/);
  if (!match) {
    return { homeGoals: 0, awayGoals: 0, totalGoals: 0 };
  }
  const homeGoals = Number.parseInt(match[1], 10) || 0;
  const awayGoals = Number.parseInt(match[2], 10) || 0;
  return { homeGoals, awayGoals, totalGoals: homeGoals + awayGoals };
}

function resolveLiveMarketView(label, probability, item) {
  const marketLabel = normalizeDisplayMarketLabel(label);
  const minute = cleanText(item.minuteLabel || item.trackedStatus?.statusLabel || 'CanlÄ±', 'CanlÄ±');
  const minuteValue = parseTrackedMinuteLabel(item.minuteLabel || item.trackedStatus?.statusLabel || '');
  const score = cleanText(item.liveScore || 'Skor bekleniyor', 'Skor bekleniyor');
  const percent = Math.max(0, Math.min(100, Number(probability) || 0));
  const { totalGoals } = parseLiveScoreTuple(score);
  const halftimeRaw = cleanText(item.halftimeScore || item.trackedStatus?.halftimeScore || '', '');
  const halftimeTuple = parseLiveScoreTuple(halftimeRaw);
  const hasHalftimeScore = /(\d+)\s*[-:]\s*(\d+)/.test(halftimeRaw);
  const secondHalfGoals = hasHalftimeScore ? Math.max(0, totalGoals - halftimeTuple.totalGoals) : null;
  const isHalftime = item.trackedStatus?.state === 'halftime' || /Ä°Y|Devre|HT/i.test(minute);
  const isFirstHalf = minuteValue > 0 && minuteValue < 45 && !isHalftime;
  const isSecondHalfWindow = minuteValue >= 45 || isHalftime;

  if (isFirstHalf) {
    if (/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 Alt/i.test(marketLabel) && totalGoals >= 1) {
      return { label: 'Ä°lk YarÄ± 0.5 Ãœst', probability: 100, note: `Skor ${score}. Ä°lk yarÄ±da gol Ã§Ä±ktÄ±; bu Ã§izgi artÄ±k kapandÄ±.` };
    }
    if (/(?:Ä°lk YarÄ±|Ä°Y) 1\.5 Alt/i.test(marketLabel) && totalGoals >= 2) {
      return { label: 'Ä°lk YarÄ± 1.5 Ãœst', probability: 100, note: `Skor ${score}. Ä°lk yarÄ± 2 gole ulaÅŸtÄ±; bu Ã§izgi artÄ±k aÅŸÄ±ldÄ±.` };
    }
    if (/(?:Ä°lk YarÄ±|Ä°Y) 2\.5 Alt/i.test(marketLabel) && totalGoals >= 3) {
      return { label: 'Ä°lk YarÄ± 2.5 Ãœst', probability: 100, note: `Skor ${score}. Ä°lk yarÄ± 3 gole Ã§Ä±ktÄ±; alt tarafÄ± artÄ±k bitti.` };
    }
    if (/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 Ãœst/i.test(marketLabel) && totalGoals >= 1) {
      return { label: marketLabel, probability: 100, note: `Skor ${score}. Ä°lk yarÄ± 0.5 Ãœst zaten gerÃ§ekleÅŸti.` };
    }
    if (/(?:Ä°lk YarÄ±|Ä°Y) 1\.5 Ãœst/i.test(marketLabel) && totalGoals >= 2) {
      return { label: marketLabel, probability: 100, note: `Skor ${score}. Ä°lk yarÄ± 1.5 Ãœst zaten gerÃ§ekleÅŸti.` };
    }
    if (/(?:Ä°lk YarÄ±|Ä°Y) 2\.5 Ãœst/i.test(marketLabel) && totalGoals >= 3) {
      return { label: marketLabel, probability: 100, note: `Skor ${score}. Ä°lk yarÄ± 2.5 Ãœst zaten gerÃ§ekleÅŸti.` };
    }
  }

  if (isSecondHalfWindow) {
    const secondHalfLine = marketLabel.match(/^2Y\s*(\d+)\.5\s*(Ãœst|Alt)$/i);
    if (secondHalfLine && secondHalfGoals !== null) {
      const threshold = (Number(secondHalfLine[1]) || 0) + 1;
      const wantsOver = /Ãœst/i.test(secondHalfLine[2]);
      if (secondHalfGoals >= threshold) {
        return {
          label: `2Y ${secondHalfLine[1]}.5 Ãœst`,
          probability: 100,
          note: `Ä°kinci yarÄ±da ${secondHalfGoals} gol Ã§Ä±ktÄ±. Bu Ã§izgi artÄ±k gerÃ§ekleÅŸti.`
        };
      }
      if (!wantsOver) {
        return {
          label: marketLabel,
          probability: percent,
          note: `Ä°kinci yarÄ±da ÅŸu ana kadar ${secondHalfGoals} gol var. ${marketLabel} hÃ¢lÃ¢ oyunda.`
        };
      }
    }

    if (/^2Y\s*0\.5\s*(Ãœst|Alt)$/i.test(marketLabel) && secondHalfGoals === null && totalGoals >= 4) {
      const direction = /Alt/i.test(marketLabel) ? 'Alt' : 'Ãœst';
      const replacementLine = Math.max(2, totalGoals);
      return {
        label: `MaÃ§ Sonu ${replacementLine}.5 ${direction}`,
        probability: percent,
        note: `Skor ${score}. Bu aÅŸamada ikinci yarÄ± Ã§izgisi yerine toplam gol Ã§izgisi daha anlamlÄ±.`
      };
    }
  }

  const fullTimeLine = marketLabel.match(/^MaÃ§ Sonu\s*(\d+)\.5\s*(Ãœst|Alt)$/i);
  if (fullTimeLine) {
    const threshold = (Number(fullTimeLine[1]) || 0) + 1;
    const wantsOver = /Ãœst/i.test(fullTimeLine[2]);
    if (totalGoals >= threshold) {
      return {
        label: `MaÃ§ Sonu ${fullTimeLine[1]}.5 Ãœst`,
        probability: 100,
        note: `Skor ${score}. MaÃ§ sonu ${fullTimeLine[1]}.5 Ãœst Ã§izgisi zaten aÅŸÄ±ldÄ±.`
      };
    }
    if (!wantsOver) {
      return { label: marketLabel, probability: percent, note: '', minute, score };
    }
  }

  return { label: marketLabel, probability: percent, note: '', minute, score };
}

function buildReadableLiveMarketNote(label, probability, item) {
  const resolved = resolveLiveMarketView(label, probability, item);
  if (resolved.note) {
    return resolved.note;
  }
  const marketLabel = resolved.label;
  const minute = resolved.minute || cleanText(item.minuteLabel || item.trackedStatus?.statusLabel || 'CanlÄ±', 'CanlÄ±');
  const score = resolved.score || cleanText(item.liveScore || 'Skor bekleniyor', 'Skor bekleniyor');
  const percent = resolved.probability;
  const scoreTuple = parseLiveScoreTuple(score);

  if (/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 (?:Ãœst|Ãœst)/i.test(marketLabel)) {
    return `${minute} ve skor ${score}. Devreye kadar en az bir gol daha Ã§Ä±kma ihtimali %${percent}.`;
  }
  if (/(?:Ä°lk YarÄ±|Ä°Y) 1\.5 (?:Ãœst|Ãœst)/i.test(marketLabel)) {
    return `${minute} ve skor ${score}. Devreye kadar toplam 2 gole Ã§Ä±kma ihtimali %${percent}.`;
  }
  if (/(?:Ä°lk YarÄ±|Ä°Y) 0\.5 Alt/i.test(marketLabel)) {
    return `${minute} ve skor ${score}. Devreye kadar yeni gol Ã§Ä±kmama ihtimali %${percent}.`;
  }
  if (/(?:Ä°lk YarÄ±|Ä°Y) 2\.5 Alt/i.test(marketLabel)) {
    return `${minute} ve skor ${score}. Ä°lk yarÄ±nÄ±n bu Ã§izginin altÄ±nda kalma ihtimali %${percent}.`;
  }
  if (/^MaÃ§ Sonu\s*(\d+)\.5\s*Ãœst/i.test(marketLabel)) {
    const line = Number(/^MaÃ§ Sonu\s*(\d+)\.5\s*Ãœst/i.exec(marketLabel)?.[1] || 0);
    const goalsNeeded = Math.max(1, line + 1 - scoreTuple.totalGoals);
    return `${minute} ve skor ${score}. Bu Ã§izginin gelmesi iÃ§in ${goalsNeeded} gol daha gerekiyor. Model bu ihtimali %${percent} gÃ¶rÃ¼yor.`;
  }
  if (/^MaÃ§ Sonu\s*(\d+)\.5\s*Alt/i.test(marketLabel)) {
    const line = Number(/^MaÃ§ Sonu\s*(\d+)\.5\s*Alt/i.exec(marketLabel)?.[1] || 0);
    const room = Math.max(0, line - scoreTuple.totalGoals);
    return `${minute} ve skor ${score}. Bu Ã§izgide en fazla ${room} gol daha alan var. Model alt tarafÄ± %${percent} ile Ã¶nde tutuyor.`;
  }
  if (/^2Y\s*(\d+)\.5\s*(Ãœst|Alt)/i.test(marketLabel)) {
    return `${minute} ve skor ${score}. Ä°kinci yarÄ± Ã¶zel Ã§izgisinde ${marketLabel} olasÄ±lÄ±ÄŸÄ± %${percent}.`;
  }
  if (/Uzak Dur/i.test(marketLabel)) {
    return `${minute} ve skor ${score}. Åu an net bir fiyat Ã¼stÃ¼nlÃ¼ÄŸÃ¼ yok; beklemek daha doÄŸru. GÃ¼ven %${percent}.`;
  }
  return `${minute} ve skor ${score}. ${marketLabel} ihtimali %${percent}.`;
}

function buildReadableLiveComment(item, liveMarkets) {
  const minute = cleanText(item.minuteLabel || item.trackedStatus?.statusLabel || 'CanlÄ±', 'CanlÄ±');
  const score = cleanText(item.liveScore || 'Skor bekleniyor', 'Skor bekleniyor');
  const primary = liveMarkets[0];
  const marketLabel = normalizeDisplayMarketLabel(primary.label);
  const note = cleanText(primary.note || '', '');
  return cleanText(`${minute} itibarÄ±yla skor ${score}. Bu anda en net canlÄ± seÃ§enek ${marketLabel} (%${primary.probability}). ${note}`, 'CanlÄ± yorum Ã¼retilemedi.');
}

function renderLivePickCard(item, index) {
  const status = item.trackedStatus ?? {};
  const analysis = item.analysis ?? {};
  const isHalftime = status.state === 'halftime' || /Ä°Y|Devre|HT/i.test(status.statusLabel || '');
  const halftimeScore = item.halftimeScore || status.halftimeScore || (isHalftime ? (item.liveScore || 'Skor bekleniyor') : null);
  const primaryView = resolveLiveMarketView(item.firstHalfMarketLabel || 'Birincil canlÄ± pazar', item.firstHalfOver05Probability ?? 0, item);
  const secondaryView = resolveLiveMarketView(item.secondaryMarketLabel || 'Ä°kinci pazar', item.secondaryMarketProbability ?? 0, item);
  const resultView = resolveLiveMarketView(item.resultMarketLabel || 'MaÃ§ yÃ¶nÃ¼', item.resultMarketProbability ?? (analysis.confidenceScore ?? 0), item);
  const liveMarkets = [
    {
      label: primaryView.label,
      probability: primaryView.probability,
      note: primaryView.note || buildReadableLiveMarketNote(primaryView.label, primaryView.probability, item),
      tone: 'primary-live-market'
    },
    {
      label: secondaryView.label,
      probability: secondaryView.probability,
      note: secondaryView.note || buildReadableLiveMarketNote(secondaryView.label, secondaryView.probability, item),
      tone: 'secondary-live-market'
    },
    {
      label: resultView.label,
      probability: resultView.probability,
      note: resultView.note || buildReadableLiveMarketNote(resultView.label, resultView.probability, item),
      tone: 'result-live-market'
    }
  ];
  const primaryMarket = liveMarkets[0];
  const aiSummaryCards = analysis.aiSummaryCards ?? [];
  const aiNote = aiSummaryCards[0] ?? null;
  const aiReason = aiSummaryCards[1]?.detail ?? '';
  const compactComment = cleanText(item.liveComment || buildReadableLiveComment(item, liveMarkets) || primaryMarket.note || [aiNote?.detail, aiReason].filter(Boolean).join(' '), 'KÄ±sa yorum Ã¼retilemedi.');
  const noteTitle = 'KÄ±sa yorum';
  const liveMetaLine = joinMeta([
    'CanlÄ± futbol',
    item.minuteLabel || status.statusLabel || 'CanlÄ±',
    item.liveScore || 'Skor bekleniyor'
  ]);

  return `
    <article class="block-card live-pick-card ${status.state === 'live' ? 'active-live-card' : ''}">
      <div class="mini-top">
        <div>
          <div class="headline-pills">
            <span class="source-pill strong">#${index + 1}</span>
            <span class="source-pill ${status.state === 'live' ? 'strong' : 'limited'}">${safeText(status.statusLabel || item.minuteLabel || 'CanlÄ±')}</span>
          </div>
          <h3>${safeText(analysis.matchInfo?.homeTeam)} vs ${safeText(analysis.matchInfo?.awayTeam)}</h3>
          <p class="section-copy">${safeText(liveMetaLine)}</p>
        </div>
        <span class="source-pill strong">GÃ¼ven %${analysis.confidenceScore ?? 0}</span>
      </div>

      <div class="live-score-strip compact-live-strip">
        <div>
          <span>Skor</span>
          <strong>${safeText(item.liveScore || 'Skor bekleniyor')}</strong>
        </div>
        ${halftimeScore ? `<div><span>Ä°Y skoru</span><strong>${safeText(halftimeScore)}</strong></div>` : ''}
        <div class="live-status-cell">
          <span>CanlÄ± durum</span>
          <strong class="live-status-value">${safeText(item.minuteLabel || status.statusLabel || 'CanlÄ±')}</strong>
        </div>
      </div>

      <div class="live-market-grid single-live-market-grid">
        ${renderLiveMarketCard(primaryMarket)}
      </div>

      <article class="mini-card scan-copy-card live-comment-card compact-live-comment-card">
        <h4>${safeText(noteTitle)}</h4>
        <p>${safeText(compactComment)}</p>
      </article>

      <div class="live-chip-row">
        <span class="history-chip">Ana Ã¶neri: ${safeText(normalizeDisplayMarketLabel(primaryMarket.label))} (%${safeText(String(primaryMarket.probability))})</span>
      </div>

      <div class="history-actions live-card-actions">
        <button class="ghost-btn" type="button" data-action="track-live-match" data-live-index="${index}">Takibe Al</button>
        <button class="ghost-btn" type="button" data-action="analyze-live-match" data-live-index="${index}">Detay Analiz Et</button>
      </div>
    </article>
  `;
}

function renderLiveMarketCard(item) {
  const probability = Number.isFinite(item.probability)
    ? Math.max(0, Math.min(100, Number(item.probability)))
    : 0;

  return `
    <article class="mini-card scan-copy-card live-market-card ${item.tone}">
      <div class="live-market-head">
        <h4>${safeText(normalizeDisplayMarketLabel(item.label))}</h4>
        <span class="prob-chip">%${safeText(String(probability))}</span>
      </div>
      <p>${safeText(item.note)}</p>
      <span class="confidence-band-meta">Pazar gÃ¼ven bandÄ±</span>
      <div class="confidence-band" aria-hidden="true">
        <span class="confidence-fill" style="width:${probability}%"></span>
      </div>
    </article>
  `;
}

function renderAnalysis(data) {
  latestAnalysisData = data;
  emptyState.classList.add('hidden');
  summaryContent.classList.remove('hidden');
  const matchInfo = data.matchInfo ?? {};

  const sourceStatus = data.sourceStatus ?? {
    label: 'Kaynak bilgisi yok',
    detail: 'Kaynak modu belirlenemedi.',
    health: 'limited',
    fallbackUsed: false
  };
  const primarySourceLabel = cleanSourceLabel(data.sourceLabel, sourceStatus, data.demoMode);
  const sourceModeLabel = cleanSourceLabel(sourceStatus.label, sourceStatus, data.demoMode);
  const metaLine = resolveMetaLine(data.matchInfo?.locationType, sourceStatus);
  const historyEntry = findHistoryEntryForAnalysis(data);
  const kickoffLabel = formatMatchKickoff(matchInfo.matchDate, matchInfo.matchTime);

  modeTag.textContent = normalizeTurkishText(data.demoMode ? 'Demo veri' : sourceStatus.fallbackUsed ? 'Yedek akÄ±ÅŸ' : 'CanlÄ± veri');
  updateAiState(data.aiStatusMessage || 'Yerel analiz motoru hazÄ±r.');

  const probabilities = data.probabilities ?? {};
  const markets = data.markets ?? {};
  const over25 = Number.isFinite(markets.over25) ? markets.over25 : 50;
  const over35 = Number.isFinite(markets.over35) ? markets.over35 : 50;
  const projectedGoals = markets.projectedGoals ?? '-';
  const under25 = Math.max(0, Math.min(100, 100 - over25));
  const under25Note = buildUnder25Note(over25, projectedGoals);
  const recommendations = data.recommendations ?? [];
  const recentMatches = data.recentMatches ?? [];
  const h2hMatches = data.h2hMatches ?? [];
  const standingsRows = data.leagueStandings ?? [];
  const aiSummaryCards = data.aiSummaryCards ?? [];
  const specialists = data.marketSpecialists ?? [];
  const modelExplainCards = data.modelExplainCards ?? [];
  const netKpis = data.netKpis ?? [];
  const lineupVerification = data.lineupVerification ?? null;
  const leagueProfile = data.leagueProfile ?? null;
  const hardFilter = data.hardFilter ?? null;
  const detailModules = data.detailModules ?? [];
  const detailEngineSummary = buildReadableDetailEngineSummary(data, 'MaÃ§ detay motoru ana verileri birlikte okudu.');
  const oddsMovement = strengthenOddsMovement(data.oddsMovement ?? null, historyEntry?.oddsSnapshots ?? []);
  const uiCopy = buildProfessionalCopy(data);
  const knockoutTie = buildKnockoutTieInsight(data);
  const verdictSteps = [
    { title: 'KÄ±sa karar', detail: uiCopy.verdict },
    { title: 'Neden bu Ã§Ä±ktÄ±?', detail: uiCopy.reason },
    { title: 'Hangi durumda bozulur?', detail: uiCopy.risk }
  ];
  if (knockoutTie?.detail) {
    verdictSteps[1].detail = cleanText(`${verdictSteps[1].detail} ${knockoutTie.detail}`, verdictSteps[1].detail);
  }
  const signalCards = buildSignalCards(data, sourceStatus);
  const formIntro = buildFormIntro(data);
  const h2hIntro = buildH2HIntro(data);
  const standingsIntro = buildStandingsIntro(data);
  const recommendationMarkup = recommendations.length
    ? recommendations.map(renderRecommendationCard).join('')
    : '<div class="scan-empty">Bu eÅŸleÅŸme iÃ§in gÃ¼venli Ã¶neri Ã§Ä±kmadÄ±.</div>';
  const specialistMarkup = specialists.length
    ? specialists.map(renderMarketSpecialistCard).join('')
    : '<div class="scan-empty">Pazar uzmanlÄ±ÄŸÄ± iÃ§in ek veri Ã¼retilmedi.</div>';

  summaryContent.innerHTML = `
    <div class="analysis-stack">
      <section class="match-shell">
        <div class="match-headline">
          <div>
            <div class="headline-pills">
              <span class="source-pill ${escapeHtml(sourceStatus.health)}">${safeText(primarySourceLabel)}</span>
              <span class="source-pill ${escapeHtml(sourceStatus.health)}">${safeText(sourceModeLabel)}</span>
            </div>
            <h3>${safeText(matchInfo.homeTeam)} vs ${safeText(matchInfo.awayTeam)}</h3>
            <p>${safeText(matchInfo.league)}</p>
          </div>
          <div class="meta-block">
            <div>${safeText(kickoffLabel)}</div>
            <div>${safeText(metaLine)}</div>
            <div class="analysis-head-actions">${historyEntry?.tracked ? '<span class="source-pill strong">Takipte</span>' : '<button class="ghost-btn analysis-track-btn" type="button" data-action="track-analysis">Takibe Al</button>'}</div>
            <div>GÃ¼ven skoru: ${data.confidenceScore}%</div>
          </div>
        </div>

        <div class="metric-strip">
          ${renderMetricCard('1', probabilities.homeWin ?? 0, 'Ev sahibi kazanÄ±r')}
          ${renderMetricCard('X', probabilities.draw ?? 0, 'Beraberlik')}
          ${renderMetricCard('2', probabilities.awayWin ?? 0, 'Deplasman kazanÄ±r')}
          ${renderMetricCard('KG Var', probabilities.bttsYes ?? 0, 'Ä°ki takÄ±m da gol bulur')}
        </div>
        ${renderOddsQuoteStrip(probabilities)}
      </section>

      <section class="verdict-grid">
        ${verdictSteps.map(renderVerdictStep).join('')}
      </section>

      <section class="strategy-grid">
        ${hardFilter ? renderHardFilterCard(hardFilter) : ''}
        ${leagueProfile ? renderLeagueProfileCard(leagueProfile) : ''}
        ${oddsMovement ? renderOddsMovementCard(oddsMovement) : ''}
      </section>

      <section class="detail-engine-card block-card">
        <div class="section-head compact-section-head">
          <h3>MaÃ§ detay motoru</h3>
          <span class="source-pill limited">${safeText(data.sharpMode ? 'Keskin filtre aktif' : 'Standart filtre')}</span>
        </div>
        <p class="section-copy">${safeText(detailEngineSummary)}</p>
        <div class="detail-modules-grid">
          ${detailModules.length ? detailModules.map((item) => renderDetailModuleCard(item, data)).join('') : '<div class="scan-empty">Detay modÃ¼lleri Ã¼retilmedi.</div>'}
        </div>
      </section>

      <section class="dual-grid">
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Model aÃ§Ä±klama kartlarÄ±</h3>
          </div>
          <div class="stack-list">
            ${modelExplainCards.length
              ? modelExplainCards.map(renderExplainCard).join('')
              : '<div class="scan-empty">Model aÃ§Ä±klama kartÄ± bu analizde Ã¼retilmedi.</div>'}
          </div>
        </article>
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Net KPI</h3>
          </div>
          ${renderLineupVerificationCard(lineupVerification)}
          ${renderInlineNetKpiRows(netKpis)}
        </article>
      </section>

      <section class="analysis-meta-grid">
        ${renderSourceStatusCard(sourceStatus)}
        ${signalCards.map(renderConfidenceFactorCard).join('')}
      </section>

      ${renderAiLayer(data.aiLayerUsed, data.aiModelLabel, aiSummaryCards)}

      <section class="dual-grid">
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Ana Ã¶neriler</h3>
          </div>
          <div class="stack-list">
            ${recommendationMarkup}
          </div>
        </article>

        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Pazar uzmanlÄ±ÄŸÄ±</h3>
          </div>
          <div class="market-specialists-grid">
            ${specialistMarkup}
          </div>
          <div class="fact-row compact-fact-row">
            ${renderMarketCard('2.5 Ãœst', `${over25}%`, markets.over25Note, over25 >= 58 ? 'emerald' : 'neutral')}
            ${renderMarketCard('2.5 Alt', `${under25}%`, under25Note, under25 >= 58 ? 'calm' : 'neutral')}
            ${renderMarketCard('3.5 Ãœst', `${over35}%`, markets.over35Note, over35 >= 52 ? 'warm' : 'neutral')}
            ${renderFactCard('Gol beklentisi', projectedGoals, 'Tempo, savunma kÄ±rÄ±lganlÄ±ÄŸÄ± ve skor sÃ¼rekliliÄŸi birlikte iÅŸlendi.')}
          </div>
        </article>
      </section>

      <section class="triple-grid simplified-grid">
        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Form tablosu</h3>
          </div>
          <p class="section-copy">${safeText(formIntro)}</p>
          ${renderRecentTable(recentMatches)}
        </article>

        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>H2H tablosu</h3>
          </div>
          <p class="section-copy">${safeText(h2hIntro)}</p>
          ${renderH2HTable(h2hMatches)}
        </article>

        <article class="block-card">
          <div class="section-head compact-section-head">
            <h3>Puan tablosu</h3>
          </div>
          <p class="section-copy">${safeText(standingsIntro)}</p>
          ${renderStandingsTable(standingsRows)}
        </article>
      </section>

      <p class="footer-note">Bu Ã§Ä±ktÄ±, linkte bulunan skor verilerini aÄŸÄ±rlÄ±klÄ± form modeliyle yorumlar. JS ile sonradan yÃ¼klenen veya eksik sayfalarda doÄŸruluk dÃ¼ÅŸer. Ã‡Ä±ktÄ± olasÄ±lÄ±ksaldÄ±r; kesin sonuÃ§ ya da bahis garantisi vermez.</p>
    </div>
  `;
}
function renderAiLayer(aiLayerUsed, aiModelLabel, cards) {
  if (!cards.length) {
    return '';
  }

  return `
    <section class="ai-layer-card">
      <div class="section-head">
        <h3>Ä°kinci AI katmanÄ±</h3>
        <span class="ai-chip ${aiLayerUsed ? 'active' : 'idle'}">${safeText(aiLayerUsed ? aiModelLabel || 'AI aktif' : 'AI beklemede')}</span>
      </div>
      <div class="ai-card-grid">
        ${cards.map(renderAiCard).join('')}
      </div>
    </section>
  `;
}

function renderScanSection(title, detail, picks, variant, minConfidence) {
  const countLabel = variant === 'avoid' ? 'Risk havuzu' : 'GÃ¼ven havuzu';
  return `
    <section class="scan-section">
      <div class="scan-section-head">
        <div>
          <h3>${safeText(title)}</h3>
          <p>${safeText(detail)}</p>
        </div>
        <span class="source-pill ${variant === 'avoid' ? 'fallback' : 'strong'}">${safeText(countLabel)} â€¢ ${picks.length}</span>
      </div>
      ${picks?.length
        ? `<div class="scan-picks-grid">${picks.map((item) => renderScanPickCard(item, variant, minConfidence)).join('')}</div>`
        : `<div class="scan-empty">${safeText(variant === 'avoid' ? 'Uzak dur havuzuna dÃ¼ÅŸen maÃ§ Ã§Ä±kmadÄ±.' : 'Minimum gÃ¼ven eÅŸiÄŸini geÃ§en maÃ§ Ã§Ä±kmadÄ±.')}</div>`}
    </section>
  `;
}

function renderScanPickCard(pick, variant = 'top', minConfidence = 74) {
  const analysis = pick.analysis;
  const sourceStatus = analysis.sourceStatus ?? { label: 'Kaynak yok', health: 'limited' };
  const isAvoid = variant === 'avoid';
  const aiNote = analysis.aiLayerUsed ? ((analysis.aiSummaryCards ?? [])[0] ?? null) : null;
  const uiCopy = buildProfessionalCopy(analysis, isAvoid ? 'avoid' : 'scan');
  const verdictText = compactText(uiCopy.verdict, 120);
  const reasonText = compactText(uiCopy.reason, 120);
  const riskText = compactText(uiCopy.risk, 120);
  const directionLabel = buildScanDirectionLabel(pick, analysis);

  return `
    <article class="block-card scan-pick-card ${isAvoid ? 'avoid-card' : ''} rank-${pick.rank}">
      <div class="mini-top">
        <span class="scan-rank">#${pick.rank}</span>
        <span class="source-pill ${escapeHtml(sourceStatus.health || 'limited')}">${safeText(isAvoid ? `GÃ¼ven %${pick.reliabilityScore}` : `Tarama skoru %${pick.reliabilityScore}`)}</span>
      </div>

      <div class="scan-headline">
        <h3>${safeText(analysis.matchInfo.homeTeam)} vs ${safeText(analysis.matchInfo.awayTeam)}</h3>
        <p class="section-copy">${safeText(joinMeta([analysis.matchInfo.league, formatMatchKickoff(analysis.matchInfo.matchDate, analysis.matchInfo.matchTime)]))}</p>
      </div>

      ${renderOddsQuoteStrip(analysis.probabilities ?? {})}

      <div class="scan-badges">
        <span class="history-chip">${safeText(isAvoid ? 'KÄ±rÄ±lgan market' : 'Ana Ã¶neri')}: ${safeText(pick.safeMarket)} (%${pick.safeMarketProbability})</span>
        <span class="history-chip">${safeText(isAvoid ? 'Risk yÃ¶nÃ¼' : 'SonuÃ§ yÃ¶nÃ¼')}: ${safeText(directionLabel)} (%${pick.resultProbability})</span>
        <span class="history-chip">${safeText(`Model gÃ¼veni: %${analysis.confidenceScore}`)}</span>
        ${isAvoid && pick.reliabilityScore < minConfidence ? `<span class="history-chip">${safeText(`EÅŸik altÄ±: %${minConfidence}`)}</span>` : ''}
      </div>

      <div class="scan-summary-stack">
        <article class="mini-card scan-copy-card">
          <h4>${safeText(isAvoid ? 'Uzak dur kararÄ±' : 'KÄ±sa karar')}</h4>
          <p>${safeText(verdictText)}</p>
        </article>
        <article class="mini-card scan-copy-card">
          <h4>${safeText(isAvoid ? 'Neden riskli?' : 'Neden bu maÃ§?')}</h4>
          <p>${safeText(reasonText)}</p>
        </article>
        <article class="mini-card scan-copy-card">
          <h4>Risk notu</h4>
          <p>${safeText(riskText)}</p>
        </article>
      </div>

      ${aiNote
        ? `
          <div class="scan-ai-callout">
            <strong>${safeText(aiNote.title || 'AI notu')}</strong>
            <p>${safeText(compactText(aiNote.detail, 135))}</p>
          </div>
        `
        : ''}

        <div class="scan-card-actions">
          <button class="ghost-btn analysis-track-btn" type="button" data-action="track-scan-pick" data-variant="${escapeHtml(variant)}" data-rank="${pick.rank}">
            Takibe Al
          </button>
        </div>
    </article>
  `;
}

function buildScanDirectionLabel(pick, analysis) {
  const market = normalizeTurkishText(pick.safeMarket || '');
  const homeTeam = analysis.matchInfo?.homeTeam || 'Ev sahibi';
  const awayTeam = analysis.matchInfo?.awayTeam || 'Deplasman';

  if (market === '1X') {
    return `${homeTeam} yenilmez`;
  }
  if (market === 'X2') {
    return `${awayTeam} yenilmez`;
  }
  if (market === 'Beraberlik') {
    return 'Beraberlik senaryosu';
  }
  if (market.startsWith('1 (') || market.startsWith('2 (')) {
    return pick.resultLabel;
  }
  if (pick.resultCode === '1') {
    return `${homeTeam} tarafÄ± Ã¶nde`;
  }
  if (pick.resultCode === '2') {
    return `${awayTeam} tarafÄ± Ã¶nde`;
  }
  return 'Denge yÃ¼ksek';
}

function isLiveProgramUrl(url) {
  if (!url) {
    return false;
  }
  let probe = String(url);
  try {
    probe = decodeURIComponent(new URL(url).pathname);
  } catch (_) {
    // Kullanıcı bazen tam URL yerine path yapıştırabiliyor.
  }
  return /\/program\/canl(?:i|\u0131)\//i.test(probe);
}

function isProgramUrl(url) {
  if (!url) {
    return false;
  }
  let probe = String(url);
  try {
    probe = decodeURIComponent(new URL(url).pathname);
  } catch (_) {
    // Path veya ham metin geldiyse regex ile devam et.
  }
  return /\/program\//i.test(probe)
    && !isLiveProgramUrl(url)
    && !/\/ma(?:c|\u00e7)-detay\//i.test(probe);
}

function renderMetricCard(label, value, subvalue, options = {}) {
  const suffix = options.suffix ?? '';
  return `
    <article class="metric-card">
      <span>${escapeHtml(label)}</span>
      <strong>${safeText(`${value}${suffix}`)}</strong>
      <small>${safeText(subvalue)}</small>
    </article>
  `;
}

function probabilityToDecimalOdds(probability) {
  const numeric = Number(probability);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '-';
  }
  const bounded = Math.min(95, Math.max(1, numeric));
  return (100 / bounded).toFixed(2);
}

function renderOddsQuoteStrip(probabilities) {
  const home = clampUiScore(probabilities?.homeWin, 0);
  const draw = clampUiScore(probabilities?.draw, 0);
  const away = clampUiScore(probabilities?.awayWin, 0);
  return `
    <div class="metric-strip odds-strip">
      ${renderMetricCard('1 Oran', probabilityToDecimalOdds(home), `OlasÄ±lÄ±k %${home}`)}
      ${renderMetricCard('X Oran', probabilityToDecimalOdds(draw), `OlasÄ±lÄ±k %${draw}`)}
      ${renderMetricCard('2 Oran', probabilityToDecimalOdds(away), `OlasÄ±lÄ±k %${away}`)}
    </div>
  `;
}

function renderVerdictStep(item) {
  return `
    <article class="mini-card verdict-card">
      <h4>${safeText(item.title)}</h4>
      <p>${safeText(item.detail)}</p>
    </article>
  `;
}

function kpiStatusLabel(status, value) {
  const numericValue = clampUiScore(value, 0);
  if (status === 'hit') {
    return `Hedefte %${numericValue}`;
  }
  if (status === 'risk') {
    return `Risk %${numericValue}`;
  }
  return `Beklemede %${numericValue}`;
}

function renderInlineNetKpiRows(items) {
  if (!items?.length) {
    return `<p class="panel-subtext backtest-empty">Net KPI verisi bu analizde oluÅŸmadÄ±.</p>`;
  }
  return `
    <div class="backtest-list">
      ${items.map((item) => `
        <div class="backtest-row">
          <span>${safeText(item.label || item.key || 'KPI')}</span>
          <div>
            <strong class="kpi-status ${safeText(item.status || 'waiting')}">${safeText(kpiStatusLabel(item.status || 'waiting', item.value))}</strong>
            <small>${safeText(`${item.detail || ''} â€¢ hedef ${item.target || '-'} â€¢ Ã¶rneklem ${item.sampleSize ?? 0}`)}</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLineupVerificationCard(item) {
  if (!item) {
    return `<p class="panel-subtext backtest-empty">Kadro doÄŸrulama verisi bu analizde bulunmadÄ±.</p>`;
  }
  const consistencyLabel = normalizeTurkishText(item.consistency || 'single_source');
  const confidence = clampUiScore(item.confidence, 0);
  const tone = confidence >= 75 ? 'strong' : confidence >= 60 ? 'limited' : 'fallback';
  return `
    <article class="mini-card source-status-card ${escapeHtml(tone)}">
      <div class="mini-top">
        <h4>Kadro doÄŸrulama</h4>
        <span class="pill status-pill ${escapeHtml(tone)}">%${safeText(String(confidence))}</span>
      </div>
      <strong>${safeText(`TutarlÄ±lÄ±k: ${consistencyLabel}`)}</strong>
      <p>${safeText(item.detail || 'Kadro doÄŸrulamasÄ± tamamlandÄ±.')}</p>
      <small class="panel-subtext">${safeText(`Kaynaklar: ${item.primarySource || '-'} + ${item.secondarySource || '-'}`)}</small>
    </article>
  `;
}

function renderExplainCard(item) {
  const toneClass = item?.tone || 'medium';
  return `
    <article class="mini-card scan-copy-card ${escapeHtml(toneClass)}">
      <div class="mini-top">
        <h4>${safeText(item?.title || 'Model kartÄ±')}</h4>
        <span class="history-chip">${safeText(item?.impact || '-')}</span>
      </div>
      <p>${safeText(item?.detail || 'AÃ§Ä±klama bulunamadÄ±.')}</p>
    </article>
  `;
}



function renderSourceStatusCard(sourceStatus) {
  const sourceLabel = cleanSourceLabel(sourceStatus.label, sourceStatus);
  const sourceDetail = sourceStatus.fallbackUsed
    ? 'Ä°statistik servisi yerine HTML yedek akÄ±ÅŸ kullanÄ±ldÄ±.'
    : sourceLabel === 'Ä°statistik API'
      ? 'Birincil istatistik akÄ±ÅŸÄ±yla son maÃ§ ve H2H verisi alÄ±ndÄ±.'
      : sourceLabel === 'HTML Ã§Ã¶zÃ¼mleme'
        ? 'MaÃ§ verisi sayfa HTML iÃ§eriÄŸinden doÄŸrudan okundu.'
        : cleanText(sourceStatus.detail);

  return `
    <article class="mini-card source-status-card ${escapeHtml(sourceStatus.health)}">
      <div class="mini-top">
        <h4>Kaynak dayanÄ±klÄ±lÄ±ÄŸÄ±</h4>
        <span class="pill status-pill ${escapeHtml(sourceStatus.health)}">${safeText(sourceLabel)}</span>
      </div>
      <strong>${safeText(sourceStatus.fallbackUsed ? 'Yedek akÄ±ÅŸ aktif' : 'Birincil akÄ±ÅŸ aktif')}</strong>
      <p>${safeText(sourceDetail)}</p>
    </article>
  `;
}

function clampUiScore(value, fallback = 0) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }
  return Math.max(0, Math.min(99, Math.round(numeric)));
}

function buildReadableDetailEngineSummary(data, fallback = 'MaÃ§ detay motoru ana verileri birlikte okudu.') {
  const copy = buildProfessionalCopy(data);
  const modeLabel = data.sharpMode ? 'Keskin mod aÃ§Ä±k.' : 'Standart mod aÃ§Ä±k.';
  const marketLine = copy.marketLabel ? 'Bu maÃ§ta Ã¶ne Ã§Ä±kan yÃ¶n ' + normalizeDisplayMarketLabel(copy.marketLabel) + '.' : '';
  return cleanText(modeLabel + ' Form, saha dengesi, puan tablosu ve gol ritmi birlikte deÄŸerlendirildi. ' + marketLine + ' Genel gÃ¼ven %' + clampUiScore(data.confidenceScore) + '.', fallback);
}

function buildReadableDetailModule(item, data = null) {
  const label = cleanText(item?.label, 'Detay kartÄ±');
  const lowered = normalizeTurkishText(label).toLocaleLowerCase('tr-TR');
  const recentCopy = data ? buildRecentCopy(data) : { formLine: '', goalLine: '' };
  const standings = data ? buildStandingsContext(data) : { shortLine: '', reasonLine: '' };
  const probabilities = data?.probabilities ?? {};
  const markets = data?.markets ?? {};
  const over25 = clampUiScore(markets.over25, 50);
  const projectedGoals = parseMetricValue(markets.projectedGoals, 2.6);
  const homeWin = clampUiScore(probabilities.homeWin, 0);
  const draw = clampUiScore(probabilities.draw, 0);
  const awayWin = clampUiScore(probabilities.awayWin, 0);
  const h2hCount = Array.isArray(data?.h2hMatches) ? data.h2hMatches.length : 0;
  let summary = cleanText(item?.summary, 'Detay bulunamadÄ±.');

  if (lowered.includes('form')) {
    summary = recentCopy.formLine ? recentCopy.formLine.replace(/^Son maÃ§ formu:\s*/u, '') : 'Son maÃ§ formu bu tarafÄ± destekliyor.';
  } else if (lowered.includes('iÃ§ dÄ±ÅŸ') || lowered.includes('ic dis') || lowered.includes('saha deng')) {
    summary = 'Ä°Ã§ saha ve deplasman verisi maÃ§Ä±n hangi tarafa kayabileceÄŸini gÃ¶steriyor.';
  } else if (lowered.includes('puan')) {
    summary = standings.reasonLine || standings.shortLine || 'Puan tablosu taraf seÃ§imini destekliyor.';
  } else if (lowered.includes('gol ritmi') || lowered.includes('gol profili')) {
    summary = `Beklenen gol ${projectedGoals.toFixed(2)} seviyesinde. 2.5 Ãœst tarafÄ± %${over25} ile Ã¶nde.`;
  } else if (lowered.includes('h2h')) {
    summary = h2hCount ? `Ä°ki takÄ±m arasÄ±nda ${h2hCount} maÃ§lÄ±k geÃ§miÅŸ var; bu veri sadece destek sinyali veriyor.` : 'Ä°ki takÄ±m geÃ§miÅŸi sÄ±nÄ±rlÄ±; bu baÅŸlÄ±k tek baÅŸÄ±na karar Ã¼retmez.';
  } else if (lowered.includes('taraf ayr')) {
    const spread = Math.max(homeWin, awayWin) - Math.min(homeWin, awayWin);
    summary = `1 %${homeWin} â€¢ X %${draw} â€¢ 2 %${awayWin}. Taraf farkÄ± ${spread >= 20 ? 'net' : 'temkinli'} gÃ¶rÃ¼nÃ¼yor.`;
  } else if (lowered.includes('kaynak')) {
    summary = data?.sourceStatus?.fallbackUsed ? 'Yedek veri akÄ±ÅŸÄ± kullanÄ±ldÄ±; bu yÃ¼zden yorum daha dikkatli okunmalÄ±.' : 'Birincil veri akÄ±ÅŸÄ± aktif; veri kalitesi yeterli gÃ¶rÃ¼nÃ¼yor.';
  } else if (lowered.includes('gÃ¼ven') || lowered.includes('gÃ¼ven')) {
    summary = `Model gÃ¼veni %${clampUiScore(data?.confidenceScore, 0)}. Kaynak ve teyit katmanÄ± birlikte okundu.`;
  }

  return {
    label,
    score: clampUiScore(item?.score, 0),
    summary: compactText(summary, 110)
  };
}

function renderConfidenceFactorCard(item) {
  return `
    <article class="mini-card confidence-card">
      <div class="mini-top">
        <h4>${safeText(item.label)}</h4>
        <span class="prob-chip">${clampUiScore(item.score)}</span>
      </div>
      <p>${safeText(compactText(item.detail, 130))}</p>
    </article>
  `;
}

function renderTextCard(title, detail) {
  return `
    <article class="text-card">
      <h3>${escapeHtml(title)}</h3>
      <p>${safeText(detail)}</p>
    </article>
  `;
}

function renderAiCard(item) {
  return `
    <article class="mini-card ai-mini-card">
      <h4>${safeText(item.title)}</h4>
      <p>${safeText(item.detail)}</p>
    </article>
  `;
}

function renderMarketInsightCard(item) {
  return `
    <article class="mini-card market-insight-card ${escapeHtml(item.tone || 'neutral')}">
      <div class="mini-top">
        <h4>${safeText(item.market)}</h4>
        <span class="pill market-angle ${escapeHtml(item.tone || 'neutral')}">${safeText(item.angle)}</span>
      </div>
      <strong>${item.probability}%</strong>
      <p>${safeText(item.detail)}</p>
    </article>
  `;
}

function renderRecommendationCard(item) {
  return `
    <article class="mini-card recommendation-card ${recommendationTone(item)}">
      <div class="mini-top">
        <h4>${safeText(item.market)}</h4>
        <span class="pill ${escapeHtml(item.riskClass)}">${safeText(item.riskLabel)}</span>
      </div>
      <strong>${item.probability}%</strong>
      <p>${safeText(buildRecommendationSummary(item))}</p>
    </article>
  `;
}

function renderCouponPackages(packages, autoTrackScan = false) {
  if (!packages.length) {
    return '';
  }

  return `
    <section class="scan-section">
      <div class="scan-section-head">
        <div>
          <h3>Kupon modu</h3>
          <p>Tarama havuzundan otomatik oluÅŸturulan gÃ¼venli, dengeli ve deÄŸer odaklÄ± kupon paketleri.</p>
        </div>
        <span class="source-pill strong">Kupon ${packages.length}</span>
      </div>
      <div class="coupon-grid">
        ${packages.map((item, index) => renderCouponCard(item, index, autoTrackScan)).join('')}
      </div>
    </section>
  `;
}

function renderCouponCard(item, index, autoTrackScan = false) {
  return `
    <article class="block-card coupon-card">
      <div class="mini-top">
        <div>
          <h4>${safeText(item.title)}</h4>
          <p class="section-copy">${safeText(item.strategy)}</p>
        </div>
        <span class="source-pill strong">${safeText(item.riskLabel)} â€¢ %${item.combinedConfidence}</span>
      </div>
      <p class="section-copy">${safeText(item.autoTrackHint || (autoTrackScan ? 'Tarama sonrasÄ± bu paket otomatik takibe alÄ±nÄ±r.' : 'Bu paket tek tÄ±kla takibe alÄ±nabilir.'))}</p>
      <button class="ghost-btn coupon-track-btn" type="button" data-action="track-coupon" data-coupon-index="${index}">Kuponu Takibe Al</button>
      <div class="coupon-legs">
        ${(item.legs ?? []).map((leg) => `
          <div class="coupon-leg">
            <strong>${safeText(leg.matchLabel)}</strong>
            <span>${safeText(leg.market)} â€¢ %${leg.probability}</span>
            <p>${safeText(compactText(makeCouponLegSummaryReadable(leg), 120))}</p>
          </div>
        `).join('')}
      </div>
    </article>
  `;
}

function makeCouponLegSummaryReadable(leg) {
  const market = cleanText(leg?.market || '', 'Ã¶neri');
  const summary = cleanText(leg?.summary || '', '');
  if (!summary) {
    return `${market} tarafÄ± bu kupon iÃ§in daha gÃ¼venli bulundu.`;
  }

  const lowerMarket = market.toLocaleLowerCase('tr-TR');
  if (lowerMarket === '1x' || lowerMarket === 'x2') {
    return `${market} tarafÄ±, doÄŸrudan sonuca gÃ¶re daha gÃ¼venli bulundu.`;
  }
  if (lowerMarket.includes('Ãœst')) {
    return `${market} seÃ§imi, maÃ§Ä±n gollÃ¼ geÃ§me ihtimali daha yÃ¼ksek gÃ¶rÃ¼ldÃ¼ÄŸÃ¼ iÃ§in Ã¶ne Ã§Ä±ktÄ±.`;
  }
  if (lowerMarket.includes('alt')) {
    return `${market} seÃ§imi, maÃ§ temposunun daha kontrollÃ¼ kalma ihtimali nedeniyle Ã¶ne Ã§Ä±ktÄ±.`;
  }
  if (lowerMarket.includes('kg var')) {
    return 'Ä°ki takÄ±mÄ±n da skor bulma ihtimali yÃ¼ksek gÃ¶rÃ¼ndÃ¼.';
  }
  if (lowerMarket.includes('kg yok')) {
    return 'Taraflardan birinin skor Ã¼retememe ihtimali daha yÃ¼ksek gÃ¶rÃ¼ndÃ¼.';
  }
  return summary;
}

function renderOddsMovementCard(item) {
  return `
    <article class="block-card strategy-card odds-movement-card ${escapeHtml(item.direction || 'neutral')}">
      <div class="mini-top">
        <div>
          <h4>${safeText(item.label || 'Oran akÄ±ÅŸÄ±')}</h4>
          <p class="section-copy">${safeText(item.source || '')}</p>
        </div>
        <span class="source-pill strong">%${item.score}</span>
      </div>
      <p>${safeText(item.detail)}</p>
    </article>
  `;
}

function renderDetailModuleCard(item, data = null) {
  const readable = buildReadableDetailModule(item, data);
  return `
    <article class="mini-card detail-module-card ${escapeHtml(item.tone || 'neutral')}">
      <div class="mini-top">
        <h4>${safeText(readable.label)}</h4>
        <span class="prob-chip">${readable.score}</span>
      </div>
      <p>${safeText(readable.summary)}</p>
    </article>
  `;
}


function renderHardFilterCard(item) {
  const tone = item.allow ? 'strong' : 'fallback';
  const title = item.allow ? item.title || 'Filtre onayÄ±' : item.title || 'Sert filtre aktif';
  return `
    <article class="block-card strategy-card ${item.allow ? 'filter-pass' : 'filter-block'}">
      <div class="mini-top">
        <h4>${safeText(title)}</h4>
        <span class="source-pill ${tone}">${safeText(item.allow ? 'AÃ§Ä±k' : 'Bloklu')}</span>
      </div>
      <p>${safeText(item.reason)}</p>
    </article>
  `;
}

function renderLeagueProfileCard(item) {
  return `
    <article class="block-card strategy-card league-profile-card">
      <div class="mini-top">
        <h4>${safeText(item.title || 'Lig profili')}</h4>
        <span class="source-pill limited">${safeText(item.style || 'Dengeli oyun')}</span>
      </div>
      <p>${safeText(item.summary)}</p>
      <div class="strategy-subline">
        <span>${safeText(`Bias: ${item.biasMarket || '-'}`)}</span>
        <span>${safeText(item.caution || '')}</span>
      </div>
    </article>
  `;
}

function renderMarketSpecialistCard(item) {
  return `
    <article class="mini-card market-insight-card market-specialist-card ${escapeHtml(item.tone || 'neutral')}">
      <div class="market-specialist-head">
        <div>
          <h4>${safeText(item.slot)}</h4>
          <div class="market-specialist-market">${safeText(item.market)}</div>
        </div>
        <strong class="market-specialist-prob">%${item.probability}</strong>
      </div>
      <p>${safeText(compactText(item.summary, 120))}</p>
    </article>
  `;
}

function buildRecommendationSummary(item) {
  const market = normalizeTurkishText(item.market || '');
  const probability = Number(item.probability) || 0;
  if (market === 'Uzak Dur') {
    return `Bu eÅŸleÅŸmede fiyat kovalamak yerine disiplinli ÅŸekilde pas geÃ§mek daha doÄŸru. GÃ¼ven %${probability}.`;
  }
  if (market === '1X' || market === 'X2') {
    return `Taraf pazarÄ± tam kopmadÄ±ÄŸÄ± iÃ§in korumalÄ± Ã§izgi tercih edildi. GÃ¼ven %${probability}.`;
  }
  if (market.includes('Ãœst') || market.includes('Ãœst')) {
    return `Gol ritmi aÃ§Ä±k oyunu destekliyor. Ana gol pazarÄ± %${probability} bandÄ±nda.`;
  }
  if (market.includes('Alt')) {
    return `Tempo kontrollÃ¼ kaldÄ±ÄŸÄ± iÃ§in alt senaryosu Ã¶ne Ã§Ä±kÄ±yor. GÃ¼ven %${probability}.`;
  }
  if (market.includes('KG')) {
    return `Ä°ki takÄ±mÄ±n skor Ã¼retim eÅŸiÄŸine gÃ¶re KG pazarÄ± %${probability} bandÄ±nda deÄŸerlendirildi.`;
  }
  return `Ana Ã¶neri ${market}. Model bu pazarÄ± %${probability} bandÄ±nda tutuyor.`;
}

function renderScenarioCard(item) {
  return `
    <article class="mini-card scenario-card">
      <div class="mini-top">
        <h4>${safeText(item.label)}</h4>
        <span class="prob-chip">${item.probability}%</span>
      </div>
      <p>${safeText(item.summary)}</p>
    </article>
  `;
}

function renderDecisionCard(item) {
  return `
    <article class="mini-card decision-card">
      <h4>${safeText(item.title)}</h4>
      <strong>${safeText(item.value)}</strong>
      <p>${safeText(item.detail)}</p>
    </article>
  `;
}

function renderPillarCard(item) {
  return `
    <article class="mini-card pillar-card">
      <div class="pillar-score">${item.score}</div>
      <div>
        <h4>${safeText(item.title)}</h4>
        <p>${safeText(item.summary)}</p>
      </div>
    </article>
  `;
}

function renderMarketCard(title, value, detail, tone = 'neutral') {
  return `
    <article class="fact-card ${tone}">
      <h4>${escapeHtml(title)}</h4>
      <strong>${safeText(value)}</strong>
      <p>${safeText(detail)}</p>
    </article>
  `;
}

function renderFactCard(title, value, detail) {
  return `
    <article class="fact-card">
      <h4>${escapeHtml(title)}</h4>
      <strong>${safeText(value)}</strong>
      <p>${safeText(detail)}</p>
    </article>
  `;
}

function renderInsightNote(item) {
  return `
    <article class="mini-card note-card">
      <h4>${safeText(item.title)}</h4>
      <p>${safeText(item.detail)}</p>
    </article>
  `;
}

function renderRecentTable(items) {
  return `
    <table class="list-table compact-list-table recent-table">
      <thead>
        <tr>
          <th>TakÄ±m</th>
          <th>Form</th>
          <th>Gol / momentum</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => renderRecentTableRow(item)).join('')}
      </tbody>
    </table>
  `;
}

function renderRecentTableRow(item) {
  const row = buildRecentSummaryRow(item);
  return `
    <tr>
      <td>
        <div class="table-cell-title">${safeText(row.team)}</div>
      </td>
      <td>
        <div class="table-cell-title">${safeText(row.formLine)}</div>
        <div class="table-cell-sub">${safeText(row.pointsLine)}</div>
      </td>
      <td>
        <div class="table-cell-title">${safeText(row.goalLine)}</div>
        <div class="table-cell-sub">${safeText(row.momentumLine)}</div>
      </td>
    </tr>
  `;
}

function renderH2HTable(items) {
  if (!items.length || (items.length === 1 && cleanText(items[0]?.score, '-') === 'Veri yok')) {
    return '<div class="scan-empty">Bu eÅŸleÅŸme iÃ§in H2H verisi bulunamadÄ±.</div>';
  }

  return `
    <table class="list-table compact-list-table h2h-table">
      <thead>
        <tr>
          <th>Tarih</th>
          <th>Skor</th>
          <th>SonuÃ§</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => renderH2HTableRow(item)).join('')}
      </tbody>
    </table>
  `;
}

function renderH2HTableRow(item) {
  const row = buildH2HDisplayRow(item);
  return `
    <tr>
      <td>
        <div class="table-cell-title">${safeText(row.date)}</div>
      </td>
      <td>
        <div class="table-cell-title">${safeText(row.scoreLine)}</div>
        <div class="table-cell-sub">${safeText(row.fixtureLine)}</div>
      </td>
      <td>
        <div class="table-cell-title">${safeText(row.outcome)}</div>
      </td>
    </tr>
  `;
}

function renderStandingsTable(items) {
  if (!items.length) {
    return '<div class="scan-empty">Okunabilir puan tablosu verisi Ã§Ä±kmadÄ±.</div>';
  }

  return `
    <table class="list-table standings-table">
      <thead>
        <tr>
          <th>#</th>
          <th>TakÄ±m</th>
          <th>O</th>
          <th>P</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item) => renderStandingsTableRow(item)).join('')}
      </tbody>
    </table>
  `;
}

function renderStandingsTableRow(item) {
  const rowClass = item.highlight ? 'standings-highlight' : '';
  return `
    <tr class="${rowClass}">
      <td><div class="table-cell-title">${safeText(item.position)}</div></td>
      <td>
        <div class="table-cell-title">${safeText(item.team)}</div>
        <div class="table-cell-sub">${safeText(`${item.won}G ${item.draw}B ${item.lost}M â€¢ Av ${item.goalDiff >= 0 ? `+${item.goalDiff}` : item.goalDiff} â€¢ Form ${item.form}`)}</div>
      </td>
      <td><div class="table-cell-title">${safeText(item.played)}</div></td>
      <td><div class="table-cell-title">${safeText(item.points)}</div></td>
    </tr>
  `;
}

function extractNumericTokens(value) {
  return (cleanText(value, '').match(/-?\d+(?:[.,]\d+)?/g) ?? []).map((token) => Number.parseFloat(token.replace(',', '.')));
}

function buildRecentSummaryRow(item) {
  const team = cleanText(item.team, 'TakÄ±m');
  const formNumbers = extractNumericTokens(item.form);
  const goalNumbers = extractNumericTokens(item.goalAverage);
  const wins = Number.isFinite(formNumbers[0]) ? Math.round(formNumbers[0]) : 0;
  const draws = Number.isFinite(formNumbers[1]) ? Math.round(formNumbers[1]) : 0;
  const losses = Number.isFinite(formNumbers[2]) ? Math.round(formNumbers[2]) : 0;
  const weighted = Number.isFinite(formNumbers.at(-1)) ? formNumbers.at(-1) : null;
  const scored = Number.isFinite(goalNumbers[0]) ? goalNumbers[0] : null;
  const conceded = Number.isFinite(goalNumbers[1]) ? goalNumbers[1] : null;
  const momentum = Number.isFinite(goalNumbers.at(-1)) ? Math.round(goalNumbers.at(-1)) : null;

  return {
    team,
    formLine: `${wins}G ${draws}B ${losses}M`,
    pointsLine: weighted !== null ? `${weighted.toFixed(2)} puan` : cleanText(item.form, '-'),
    goalLine: scored !== null && conceded !== null ? `${scored.toFixed(2)} atÄ±yor â€¢ ${conceded.toFixed(2)} yiyor` : cleanText(item.goalAverage, '-'),
    momentumLine: momentum !== null ? `Momentum ${momentum}` : 'Momentum verisi yok'
  };
}

function buildH2HDisplayRow(item) {
  const date = cleanText(item.date, '-');
  const scoreText = cleanText(item.score, '-');
  const rawOutcome = cleanText(item.outcome, '-');
  const outcomeText = isUnreadableText(rawOutcome) || rawOutcome === '-' ? 'SonuÃ§ bilgisi sÄ±nÄ±rlÄ±.' : rawOutcome;
  const missingH2H = scoreText === 'Veri yok' || /h2h/i.test(rawOutcome) || /bulunamad/i.test(rawOutcome);
  const scoreMatch = scoreText.match(/(.+?)\s+(\d+)\s*[-:]\s*(\d+)\s+(.+)/);

  if (missingH2H) {
    return {
      date: '-',
      scoreLine: 'Veri yok',
      fixtureLine: '-',
      outcome: 'Bu eÅŸleÅŸme iÃ§in H2H verisi bulunamadÄ±.'
    };
  }

  if (!scoreMatch) {
    return {
      date,
      scoreLine: scoreText,
      fixtureLine: '-',
      outcome: outcomeText
    };
  }

  const homeTeam = cleanText(scoreMatch[1], 'Ev sahibi');
  const homeGoals = Number.parseInt(scoreMatch[2], 10);
  const awayGoals = Number.parseInt(scoreMatch[3], 10);
  const awayTeam = cleanText(scoreMatch[4], 'Deplasman');

  let outcome = 'Beraberlik';
  if (homeGoals > awayGoals) {
    outcome = `${homeTeam} kazandÄ±`;
  } else if (awayGoals > homeGoals) {
    outcome = `${awayTeam} kazandÄ±`;
  }

  return {
    date,
    scoreLine: `${homeGoals}-${awayGoals}`,
    fixtureLine: `${homeTeam} â€¢ ${awayTeam}`,
    outcome
  };
}
function buildUnder25Note(over25Probability, projectedGoalsText) {
  const projected = Number.parseFloat(String(projectedGoalsText).replace(',', '.'));
  if ((100 - over25Probability) >= 58 || (!Number.isNaN(projected) && projected <= 2.45)) {
    return '2.5 alt tarafÄ± daha dengeli. MaÃ§Ä±n kontrollÃ¼ akma ihtimali canlÄ±.';
  }
  if ((100 - over25Probability) >= 50) {
    return '2.5 alt senaryosu masada. Ã–zellikle ilk bÃ¶lÃ¼m yavaÅŸ geÃ§erse deÄŸer kazanÄ±r.';
  }
  return '2.5 alt tarafÄ± ikinci planda kalÄ±yor; erken gol Ã¼st ihtimalini bÃ¼yÃ¼tÃ¼r.';
}

function recommendationTone(item) {
  const market = cleanText(item.market, '');
  if (market.includes('2.5 Ãœst') && item.probability >= 58) {
    return 'emerald-signal';
  }
  if (market.includes('2.5 Alt') && item.probability >= 56) {
    return 'calm-signal';
  }
  return '';
}


function buildCalibrationPayload(entries) {
  const report = buildBacktestReport(Array.isArray(entries) ? entries : []);
  if (!report?.calibrationReady || !report.resolvedCount) {
    return null;
  }

  const marketProfiles = (report.markets || [])
    .filter((item) => item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE)
    .map((item) => ({
      marketGroup: item.key,
      sampleSize: item.sampleSize,
      hitRate: item.hitRate
    }));

  const leagueProfiles = (report.leagues || [])
    .filter((item) => item.sampleSize >= MIN_LEAGUE_CALIBRATION_SAMPLE)
    .map((item) => {
      const marketProfilesForLeague = (item.marketStats || [])
        .filter((marketStat) => marketStat.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE)
        .map((marketStat) => ({
          marketGroup: marketStat.key,
          sampleSize: marketStat.sampleSize,
          hitRate: marketStat.hitRate
        }));

      return {
        league: normalizeLeagueLabel(item.league),
        sampleSize: item.sampleSize,
        topHitRate: item.hitRate,
        marketProfiles: marketProfilesForLeague.length ? marketProfilesForLeague : null
      };
    });

  if (!marketProfiles.length && !leagueProfiles.length) {
    return null;
  }

  return {
    sampleSize: report.resolvedCount,
    overallTopHitRate: report.topHitRate,
    marketProfiles: marketProfiles.length ? marketProfiles : null,
    leagueProfiles: leagueProfiles.length ? leagueProfiles : null
  };
}
function buildBacktestReport(entries) {
  const resolvedEntries = [...entries]
    .filter((entry) => entry?.result && entry?.topRecommendation?.market)
    .sort((left, right) => new Date(right.result?.savedAt || right.analyzedAt || 0) - new Date(left.result?.savedAt || left.analyzedAt || 0))
    .slice(0, BACKTEST_LIMIT);

  const marketBuckets = new Map();
  const leagueBuckets = new Map();
  const modeBuckets = new Map();
  const hourBuckets = new Map();
  const missReasonBuckets = new Map();
  const liveScenarioBuckets = new Map();
  const liveScenarioMarketBuckets = new Map();
  let resolvedCount = 0;
  let topHits = 0;
  let playedResolvedCount = 0;
  let playedHits = 0;
  let confidenceTotal = 0;

  for (const entry of resolvedEntries) {
    const topGrade = gradeRecommendation(entry.topRecommendation?.market, entry.result, entry);
    if (!topGrade) {
      continue;
    }

    const modeKey = inferAnalysisMode(entry);
    const modeLabel = modeKey === 'live' ? 'CanlÄ±' : 'Prematch';
    const hourKey = resolveBacktestHourBand(entry.matchTime);
    const hourLabel = hourBandLabel(hourKey);

    resolvedCount += 1;
    confidenceTotal += Number(entry.confidenceScore) || 0;
    if (topGrade.hit) {
      topHits += 1;
    } else {
      const missReason = classifyMissReason(entry, topGrade);
      recordNamedBacktestBucket(missReasonBuckets, missReason.key, missReason.label, entry.confidenceScore);
    }

    const playedGrade = gradeRecommendation(entry.playedMarket, entry.result, entry);
    if (playedGrade) {
      playedResolvedCount += 1;
      if (playedGrade.hit) {
        playedHits += 1;
      }
    }

    const marketKey = recommendationMarketGroup(entry.topRecommendation?.market);
    const marketLabel = marketGroupLabel(marketKey);
    recordBacktestBucket(marketBuckets, marketKey, marketLabel, topGrade.hit, entry.confidenceScore);
    recordBacktestBucket(modeBuckets, modeKey, modeLabel, topGrade.hit, entry.confidenceScore);
    recordBacktestBucket(hourBuckets, hourKey, hourLabel, topGrade.hit, entry.confidenceScore);

    if (modeKey === 'live') {
      const scenarioMeta = extractLiveScenarioMeta(entry.capturedScore || entry.liveScore, entry.capturedMinuteLabel || entry.liveStatusLabel || '', entry.halftimeScore || '');
      if (scenarioMeta.key) {
        recordBacktestBucket(liveScenarioBuckets, scenarioMeta.key, scenarioMeta.label, topGrade.hit, entry.confidenceScore);
        recordBacktestBucket(liveScenarioMarketBuckets, `${scenarioMeta.key}::${marketKey}`, `${scenarioMeta.label} â€¢ ${marketLabel}`, topGrade.hit, entry.confidenceScore);
      }
    }

    const leagueLabel = normalizeLeagueLabel(entry.league);
    if (!leagueBuckets.has(leagueLabel)) {
      leagueBuckets.set(leagueLabel, {
        key: leagueLabel,
        league: leagueLabel,
        sampleSize: 0,
        hits: 0,
        playedSampleSize: 0,
        playedHits: 0,
        confidenceTotal: 0,
        marketBuckets: new Map()
      });
    }

    const leagueBucket = leagueBuckets.get(leagueLabel);
    leagueBucket.sampleSize += 1;
    leagueBucket.confidenceTotal += Number(entry.confidenceScore) || 0;
    if (topGrade.hit) {
      leagueBucket.hits += 1;
    }
    if (playedGrade) {
      leagueBucket.playedSampleSize += 1;
      if (playedGrade.hit) {
        leagueBucket.playedHits += 1;
      }
    }
    recordBacktestBucket(leagueBucket.marketBuckets, marketKey, marketLabel, topGrade.hit, entry.confidenceScore);
  }

  const markets = finalizeBacktestBuckets(marketBuckets);
  const leagues = [...leagueBuckets.values()]
    .map((bucket) => ({
      league: bucket.league,
      sampleSize: bucket.sampleSize,
      hits: bucket.hits,
      hitRate: calculateHitRate(bucket.hits, bucket.sampleSize),
      playedSampleSize: bucket.playedSampleSize,
      playedHits: bucket.playedHits,
      playedHitRate: calculateHitRate(bucket.playedHits, bucket.playedSampleSize),
      avgConfidence: bucket.sampleSize ? Math.round(bucket.confidenceTotal / bucket.sampleSize) : 0,
      marketStats: finalizeBacktestBuckets(bucket.marketBuckets)
    }))
    .sort((left, right) => {
      if (right.hitRate !== left.hitRate) {
        return right.hitRate - left.hitRate;
      }
      return right.sampleSize - left.sampleSize;
    });

  return {
    resolvedCount,
    topHits,
    topHitRate: calculateHitRate(topHits, resolvedCount),
    playedResolvedCount,
    playedHits,
    playedHitRate: calculateHitRate(playedHits, playedResolvedCount),
    avgConfidence: resolvedCount ? Math.round(confidenceTotal / resolvedCount) : 0,
    calibrationReady: resolvedCount >= MIN_BACKTEST_SAMPLE,
    markets,
    leagues,
    modeStats: finalizeBacktestBuckets(modeBuckets),
    hourBands: finalizeBacktestBuckets(hourBuckets),
    liveScenarios: finalizeBacktestBuckets(liveScenarioBuckets),
    liveScenarioMarkets: finalizeBacktestBuckets(liveScenarioMarketBuckets),
    missReasons: finalizeMissReasonBuckets(missReasonBuckets)
  };
}

function recordBacktestBucket(map, key, label, hit, confidenceScore) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      label,
      sampleSize: 0,
      hits: 0,
      confidenceTotal: 0
    });
  }

  const bucket = map.get(key);
  bucket.sampleSize += 1;
  bucket.confidenceTotal += Number(confidenceScore) || 0;
  if (hit) {
    bucket.hits += 1;
  }
}

function recordNamedBacktestBucket(map, key, label, confidenceScore = 0) {
  if (!map.has(key)) {
    map.set(key, {
      key,
      label,
      sampleSize: 0,
      hits: 0,
      confidenceTotal: 0
    });
  }
  const bucket = map.get(key);
  bucket.sampleSize += 1;
  bucket.confidenceTotal += Number(confidenceScore) || 0;
}

function finalizeBacktestBuckets(map) {
  return [...map.values()]
    .map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      sampleSize: bucket.sampleSize,
      hits: bucket.hits,
      hitRate: calculateHitRate(bucket.hits, bucket.sampleSize),
      avgConfidence: bucket.sampleSize ? Math.round(bucket.confidenceTotal / bucket.sampleSize) : 0
    }))
    .sort((left, right) => {
      if (right.hitRate !== left.hitRate) {
        return right.hitRate - left.hitRate;
      }
      return right.sampleSize - left.sampleSize;
    });
}

function finalizeMissReasonBuckets(map) {
  return [...map.values()]
    .map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      sampleSize: bucket.sampleSize,
      avgConfidence: bucket.sampleSize ? Math.round(bucket.confidenceTotal / bucket.sampleSize) : 0
    }))
    .sort((left, right) => right.sampleSize - left.sampleSize);
}

function inferAnalysisMode(entry) {
  const probe = normalizeTurkishText(`${entry?.analysisMode || ''} ${entry?.trackingSource || ''} ${entry?.sourceStatus?.label || ''} ${entry?.sourceStatus?.mode || ''} ${entry?.sourceLabel || ''}`).toLowerCase();
  return probe.includes('canlÄ±') || probe.includes('canlÄ±') ? 'live' : 'prematch';
}

function resolveBacktestHourBand(matchTime = '') {
  return resolveHourBandKey(matchTime || '');
}

function buildLiveScenarioKey(minute = 0, totalGoals = 0, goalDiff = 0, hasHalftimeScore = false) {
  if (minute < 15) {
    return totalGoals === 0 ? 'fh_early_cagey' : 'fh_early_open';
  }
  if (minute < 45) {
    if (totalGoals === 0) {
      return 'fh_cagey';
    }
    if (totalGoals === 1) {
      return 'fh_single_goal';
    }
    if (totalGoals === 2) {
      return 'fh_two_goal';
    }
    return 'fh_open_trade';
  }
  if (!hasHalftimeScore) {
    return totalGoals >= 3 ? 'live_total_focus' : 'live_result_focus';
  }
  if (minute < 60) {
    if (totalGoals >= 4) {
      return 'sh_open_trade';
    }
    if (goalDiff >= 2) {
      return 'sh_one_side';
    }
    return 'sh_balanced';
  }
  if (minute < 78) {
    if (totalGoals >= 4 && goalDiff <= 1) {
      return 'late_goal_trade';
    }
    if (goalDiff >= 2) {
      return 'late_lead_control';
    }
    if (totalGoals <= 2) {
      return 'late_tight';
    }
    return 'late_balanced';
  }
  return goalDiff >= 2 ? 'closing_lead' : 'closing_total';
}

function buildLiveScenarioLabel(key) {
  switch (key) {
    case 'fh_early_cagey':
      return 'Erken ilk yarÄ± - kapalÄ± akÄ±ÅŸ';
    case 'fh_early_open':
      return 'Erken ilk yarÄ± - aÃ§Ä±k giriÅŸ';
    case 'fh_cagey':
      return 'Ä°lk yarÄ± - dÃ¼ÅŸÃ¼k tempo';
    case 'fh_single_goal':
      return 'Ä°lk yarÄ± - tek gollÃ¼ denge';
    case 'fh_two_goal':
      return 'Ä°lk yarÄ± - iki gollÃ¼ Ã§izgi';
    case 'fh_open_trade':
      return 'Ä°lk yarÄ± - aÃ§Ä±k gol trafiÄŸi';
    case 'sh_one_side':
      return 'Ä°kinci yarÄ± - tek taraflÄ± baskÄ±';
    case 'sh_balanced':
      return 'Ä°kinci yarÄ± - dengeli tempo';
    case 'sh_open_trade':
      return 'Ä°kinci yarÄ± - aÃ§Ä±k gol trafiÄŸi';
    case 'late_goal_trade':
      return 'Son bÃ¶lÃ¼m - gol trafiÄŸi';
    case 'late_lead_control':
      return 'Son bÃ¶lÃ¼m - skor koruma';
    case 'late_tight':
      return 'Son bÃ¶lÃ¼m - dÃ¼ÅŸÃ¼k tempo';
    case 'late_balanced':
      return 'Son bÃ¶lÃ¼m - dengeli akÄ±ÅŸ';
    case 'closing_lead':
      return 'KapanÄ±ÅŸ - tek taraflÄ± skor';
    case 'closing_total':
      return 'KapanÄ±ÅŸ - toplam Ã§izgisi';
    case 'live_total_focus':
      return 'CanlÄ± - toplam Ã§izgisi';
    case 'live_result_focus':
      return 'CanlÄ± - sonuÃ§ Ã§izgisi';
    default:
      return 'CanlÄ± senaryo';
  }
}

function extractLiveScenarioMeta(scoreValue, minuteLabel, halftimeScore = '') {
  const minute = parseTrackedMinuteLabel(minuteLabel || '');
  const scoreText = typeof scoreValue === 'string'
    ? scoreValue
    : Number.isInteger(scoreValue?.homeGoals) && Number.isInteger(scoreValue?.awayGoals)
      ? `${scoreValue.homeGoals}-${scoreValue.awayGoals}`
      : '';
  const tuple = parseLiveScoreTuple(scoreText);
  const halftimeText = cleanText(halftimeScore || '', '');
  const hasHalftimeScore = /(\d+)\s*[-:]\s*(\d+)/.test(halftimeText);
  const key = buildLiveScenarioKey(minute, tuple.totalGoals, Math.abs(tuple.homeGoals - tuple.awayGoals), hasHalftimeScore);
  return {
    key,
    label: buildLiveScenarioLabel(key),
    minute,
    totalGoals: tuple.totalGoals,
    goalDiff: Math.abs(tuple.homeGoals - tuple.awayGoals),
    hasHalftimeScore
  };
}

function hourBandLabel(key) {
  switch (key) {
    case 'morning':
      return 'Sabah-Ã¶ÄŸle';
    case 'afternoon':
      return 'Ã–ÄŸleden sonra';
    case 'prime':
      return 'AkÅŸam prime';
    case 'late':
      return 'GeÃ§ saat';
    default:
      return 'Saat belirsiz';
  }
}

function classifyMissReason(entry, topGrade) {
  const market = normalizeDisplayMarketLabel(entry?.topRecommendation?.market || '');
  const result = entry?.result || {};
  const totalGoals = (Number(result.homeGoals) || 0) + (Number(result.awayGoals) || 0);
  const isLive = inferAnalysisMode(entry) === 'live';
  const group = recommendationMarketGroup(market);
  const confidence = Number(entry?.confidenceScore) || 0;

  if (entry?.sourceStatus?.fallbackUsed || /not found|eÅŸleÅŸmedi|doÄŸrulanamadÄ±|dogrulanamadi/i.test(String(entry?.liveNote || ''))) {
    return { key: 'source_drift', label: 'CanlÄ± veri sapmasÄ±' };
  }
  if (group === 'totals_over' && !topGrade.hit) {
    return totalGoals <= 1 ? { key: 'tempo_drop', label: 'Tempo dÃ¼ÅŸtÃ¼' } : { key: 'line_high', label: 'Ã‡izgi fazla yukarÄ±daydÄ±' };
  }
  if (group === 'totals_under' && !topGrade.hit) {
    return totalGoals >= 4 ? { key: 'early_goal', label: 'Erken gol maÃ§Ä± aÃ§tÄ±' } : { key: 'late_break', label: 'GeÃ§ kÄ±rÄ±lma geldi' };
  }
  if ((group === 'hard_side' || group === 'double_chance' || group === 'draw') && !topGrade.hit) {
    return confidence >= 72 ? { key: 'wrong_side', label: 'YanlÄ±ÅŸ market seÃ§imi' } : { key: 'weak_edge', label: 'Taraf ayrÄ±ÅŸmasÄ± zayÄ±ftÄ±' };
  }
  if ((group === 'btts_yes' || group === 'btts_no') && !topGrade.hit) {
    return { key: 'goal_profile', label: 'Gol profili ters aktÄ±' };
  }
  if (isLive) {
    return { key: 'live_shift', label: 'CanlÄ± akÄ±ÅŸ yÃ¶n deÄŸiÅŸtirdi' };
  }
  return { key: 'other', label: 'DiÄŸer' };
}

function calculateHitRate(hits, sampleSize) {
  if (!sampleSize) {
    return 0;
  }
  return Math.round((hits / sampleSize) * 100);
}

function recommendationMarketGroup(market) {
  const normalizedMarket = normalizeTurkishText(String(market || ''));

  if (normalizedMarket.startsWith('1X') || normalizedMarket.startsWith('X2')) {
    return 'double_chance';
  }
  if (normalizedMarket.startsWith('1 (') || normalizedMarket.startsWith('2 (') || normalizedMarket === '1' || normalizedMarket === '2') {
    return 'hard_side';
  }
  if (normalizedMarket === 'Beraberlik') {
    return 'draw';
  }
  if (normalizedMarket.includes('Ãœst') || normalizedMarket.includes('Ãœst')) {
    return 'totals_over';
  }
  if (normalizedMarket.includes('Alt')) {
    return 'totals_under';
  }
  if (normalizedMarket === 'KG Var') {
    return 'btts_yes';
  }
  if (normalizedMarket === 'KG Yok') {
    return 'btts_no';
  }
  if (normalizedMarket === 'Uzak Dur') {
    return 'avoid';
  }
  return 'other';
}

function marketGroupLabel(group) {
  switch (group) {
    case 'hard_side':
      return 'Direkt taraf';
    case 'double_chance':
      return 'Ã‡ifte ÅŸans';
    case 'draw':
      return 'Beraberlik';
    case 'totals_over':
      return 'Ãœst pazarlarÄ±';
    case 'totals_under':
      return 'Alt pazarlarÄ±';
    case 'btts_yes':
      return 'KG Var';
    case 'btts_no':
      return 'KG Yok';
    case 'avoid':
      return 'Uzak Dur';
    default:
      return 'DiÄŸer';
  }
}

function normalizeLeagueLabel(value) {
  const cleaned = cleanText(value, 'Bilinmeyen lig');
  return cleaned || 'Bilinmeyen lig';
}

function findHistoryEntryForAnalysis(analysis, entries = null) {
  const history = Array.isArray(entries) ? entries : loadHistory();
  const analysisId = analysis?.analysisId || buildHistoryFallbackId(analysis?.matchInfo || {});
  return history.find((entry) => entry.id === analysisId) ?? null;
}

function buildOddsSnapshotFromMovement(item, sampledAt = new Date().toISOString()) {
  if (!item) {
    return null;
  }

  return {
    sampledAt,
    score: Number(item.score) || 0,
    direction: cleanText(item.direction, 'stabil'),
    source: cleanText(item.source, 'iddaa sportsbook'),
    marketDepth: Number(item.marketDepth) || 0,
    oddsChannels: Number(item.oddsChannels) || 0,
    liveOdds: Boolean(item.liveOdds)
  };
}

function mergeOddsSnapshots(previousSnapshots = [], currentSnapshot = null) {
  const list = Array.isArray(previousSnapshots) ? previousSnapshots.filter(Boolean) : [];
  if (!currentSnapshot) {
    return list.slice(-8);
  }

  const last = list.at(-1);
  const sameAsLast = last
    && last.marketDepth === currentSnapshot.marketDepth
    && last.oddsChannels === currentSnapshot.oddsChannels
    && Boolean(last.liveOdds) === Boolean(currentSnapshot.liveOdds)
    && cleanText(last.direction, '') === cleanText(currentSnapshot.direction, '');

  if (sameAsLast) {
    return list.slice(-8);
  }

  return [...list, currentSnapshot].slice(-8);
}

function strengthenOddsMovement(item, previousSnapshots = []) {
  if (!item) {
    return null;
  }

  const current = buildOddsSnapshotFromMovement(item);
  const history = Array.isArray(previousSnapshots) ? previousSnapshots.filter(Boolean) : [];
  const previous = history.at(-1) ?? null;
  const base = { ...item };

  if (!previous || !current) {
    return {
      ...base,
      detail: cleanText(base.detail),
      source: cleanText(base.source)
    };
  }

  const depthDelta = current.marketDepth - (Number(previous.marketDepth) || 0);
  const channelDelta = current.oddsChannels - (Number(previous.oddsChannels) || 0);
  const liveShift = Boolean(current.liveOdds) !== Boolean(previous.liveOdds);
  const movingHarder = depthDelta >= 1 || channelDelta >= 2 || (liveShift && current.liveOdds);
  const shrinking = depthDelta <= -1 || channelDelta <= -2 || (liveShift && !current.liveOdds);

  let direction = cleanText(base.direction, 'stabil');
  if (movingHarder) {
    direction = current.liveOdds ? 'sert' : 'yukari';
  } else if (shrinking) {
    direction = 'daralan';
  }

  const deltaParts = [];
  if (depthDelta !== 0) {
    deltaParts.push(`market derinligi ${previous.marketDepth} -> ${current.marketDepth}`);
  }
  if (channelDelta !== 0) {
    deltaParts.push(`oran kanali ${previous.oddsChannels} -> ${current.oddsChannels}`);
  }
  if (liveShift) {
    deltaParts.push(current.liveOdds ? 'canlÄ± oran akÄ±ÅŸÄ± aÃ§Ä±ldÄ±' : 'canlÄ± oran akÄ±ÅŸÄ± kapandÄ±');
  }

  const scoreBoost = movingHarder ? 5 : shrinking ? -4 : 0;
  const score = Math.max(34, Math.min(95, (Number(base.score) || 0) + scoreBoost));
  const historyNote = deltaParts.length
    ? `Snapshot farki: ${deltaParts.join(', ')}.`
    : 'Son snapshot ile ayni pazar derinligi korunuyor.';

  return {
    ...base,
    score,
    direction,
    detail: cleanText(`${base.detail} ${historyNote}`),
    source: cleanText(`${base.source} â€¢ ${history.length + 1} snapshot`)
  };
}
function renderBacktestSummary(report, entries = []) {
  if (!report.resolvedCount) {
    return `
      <article class="history-card backtest-card compact-backtest-card">
        <div class="mini-top">
          <div>
            <h4>Backtest Ã¶zeti</h4>
            <p class="history-meta">HenÃ¼z sonuÃ§ girilmiÅŸ kayÄ±t yok. Final skor geldikÃ§e lig, market ve canlÄ±/prematch performansÄ± burada Ã¶lÃ§Ã¼lecek.</p>
          </div>
          <span class="pill calm">Beklemede</span>
        </div>
      </article>
    `;
  }

  const strongMarkets = report.markets.filter((item) => item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE).slice(0, 3);
  const strongLeagues = report.leagues.filter((item) => item.sampleSize >= MIN_LEAGUE_CALIBRATION_SAMPLE).slice(0, 3);
  const weakLeagues = report.leagues.filter((item) => item.sampleSize >= MIN_LEAGUE_CALIBRATION_SAMPLE && item.hitRate <= 50).slice(0, 3);
  const stateLabel = report.calibrationReady ? 'Kalibrasyon aktif' : 'Veri birikiyor';
  const stateClass = report.calibrationReady ? 'safe' : 'medium';
  const sampleLabel = report.resolvedCount >= BACKTEST_LIMIT ? `Son ${BACKTEST_LIMIT} sonuÃ§ kullanÄ±ldÄ±` : 'Mevcut tÃ¼m sonuÃ§lar kullanÄ±ldÄ±';
  const calibrationLine = report.calibrationReady
    ? 'Lig, market, saat bandÄ± ve canlÄ±/prematch ayrÄ±mÄ± artÄ±k skora etkili ÅŸekilde kalibre ediliyor.'
    : `Kalibrasyon iÃ§in en az ${MIN_BACKTEST_SAMPLE} sonuÃ§ gerekiyor.`;
  const playedLabel = report.playedResolvedCount
    ? `${report.playedHits}/${report.playedResolvedCount} kupon marketi tuttu`
    : 'HenÃ¼z kaydedilmiÅŸ kupon marketi yok';
  const liveDiagnostics = buildLiveDiagnosticsReport();
  const benchmark = buildBenchmarkReport(entries);
  const couponReport = buildCouponPerformanceReport(entries);
  const oddsReport = buildOddsSnapshotReport(entries);
  const kpiReport = buildNetKpiReport(report, liveDiagnostics, benchmark);
  const criticalRoadmap = buildCriticalRoadmapItems(report, liveDiagnostics, benchmark, kpiReport);

  return `
    <article class="history-card backtest-card compact-backtest-card">
      <div class="mini-top">
        <div>
          <h4>Backtest Ã¶zeti</h4>
          <p class="history-meta">SonuÃ§ girilmiÅŸ ${report.resolvedCount} kayÄ±t Ã¶lÃ§Ã¼ldÃ¼. Ana Ã¶neri, kupon tercihi ve canlÄ±/prematch ayrÄ±mÄ± birlikte izleniyor.</p>
        </div>
        <span class="pill ${stateClass}">${stateLabel}</span>
      </div>

      <div class="history-tags backtest-roadmap">
        ${criticalRoadmap.map((item) => `<span class="history-chip ${item.done ? 'hit' : ''}">${safeText(item.label)}: ${safeText(item.status)}</span>`).join('')}
      </div>

      <div class="backtest-stat-grid compact-backtest-stats backtest-stat-grid-4">
        ${renderBacktestStat('Ã–rneklem', report.resolvedCount, sampleLabel)}
        ${renderBacktestStat('Ana isabet', `%${report.topHitRate}`, `${report.topHits}/${report.resolvedCount} ana Ã–neri tuttu`)}
        ${renderBacktestStat('Kupon isabeti', report.playedResolvedCount ? `%${report.playedHitRate}` : '-', playedLabel)}
        ${renderBacktestStat('Ortalama gÃ¼ven', `%${report.avgConfidence}`, 'Kaydedilen analiz gÃ¼ven ortalamasÄ±')}
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>Net KPI panosu</strong>
          <p>${safeText(kpiReport.summary)}</p>
          ${renderNetKpiRows(kpiReport.items)}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Kalibrasyon omurgasÄ±</strong>
          <p>${safeText(calibrationLine)}</p>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>GÃ¼Ã§lÃ¼ marketler</strong>
          ${renderBacktestRows(strongMarkets, 'HenÃ¼z yeterli market Ã¶rneklemi yok.')}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>GÃ¼Ã§lÃ¼ ligler</strong>
          ${renderBacktestRows(strongLeagues.map((item) => ({ ...item, label: item.league })), 'HenÃ¼z yeterli lig Ã¶rneklemi yok.')}
        </div>
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>CanlÄ± / prematch</strong>
          ${renderBacktestRows(report.modeStats, 'CanlÄ± ve prematch ayrÄ±mÄ± iÃ§in veri yok.')}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Saat aralÄ±klarÄ±</strong>
          ${renderBacktestRows(report.hourBands, 'Saat bandÄ± verisi oluÅŸmadÄ±.')}
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Neden kaÃ§tÄ±?</strong>
          ${renderBacktestReasonRows(report.missReasons, 'Belirgin kaÃ§Ä±ÅŸ nedeni oluÅŸmadÄ±.')}
        </div>
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>CanlÄ± doÄŸruluk turu</strong>
          <p>${safeText(`Son ${liveDiagnostics.sample} sorguda baÅŸarÄ± %${liveDiagnostics.successRate}, bulunamayan veri %${liveDiagnostics.notFoundRate}.`)}</p>
          <small class="panel-subtext">${safeText(liveDiagnostics.topReasons.length ? liveDiagnostics.topReasons.map((item) => `${item.label} (${item.count})`).join(' â€¢ ') : 'Belirgin hata nedeni yok.')}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Sabit test seti</strong>
          <p>${safeText(`Set: ${benchmark.size}/${BENCHMARK_SET_SIZE} â€¢ Ã§Ã¶zÃ¼len ${benchmark.resolved} â€¢ isabet %${benchmark.hitRate}`)}</p>
          <small class="panel-subtext">${safeText(benchmark.pending ? `${benchmark.pending} maÃ§ sonucu bekleniyor.` : 'Set dolu ve aktif.')}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Lig kalite skoru</strong>
          <p>${safeText(weakLeagues.length ? `DÃ¼ÅŸÃ¼k kalite uyarÄ±sÄ±: ${weakLeagues.map((item) => `${item.league} %${item.hitRate}`).join(' â€¢ ')}` : 'Otomatik kara listeye girecek lig sinyali oluÅŸmadÄ±.')}</p>
        </div>
      </div>

      <div class="backtest-inline-grid">
        <div class="mini-card backtest-inline-card">
          <strong>Kupon performansÄ±</strong>
          <p>${safeText(couponReport.summary)}</p>
          <small class="panel-subtext">${safeText(couponReport.detail)}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>Oran akÄ±ÅŸÄ± snapshot</strong>
          <p>${safeText(oddsReport.summary)}</p>
          <small class="panel-subtext">${safeText(oddsReport.detail)}</small>
        </div>
        <div class="mini-card backtest-inline-card">
          <strong>CanlÄ± olay akÄ±ÅŸÄ±</strong>
          <p>${safeText(`Gol bildirimi, devre, maÃ§ sonu ve senaryo kÄ±rÄ±lmasÄ± takibe iÅŸlendi. Aktif olay sayÄ±sÄ± ${oddsReport.liveTracked}.`)}</p>
          <small class="panel-subtext">${safeText('Bir sonraki turda kÄ±rmÄ±zÄ± kart ve ana Ã¶neri bozuldu alarmÄ± ayrÄ± olay tÃ¼rÃ¼ olarak sertleÅŸtirilecek.')}</small>
        </div>
      </div>
    </article>
  `;
}

function buildCriticalRoadmapItems(report, liveDiagnostics, benchmark, kpiReport = null) {
  const presets = loadScanPresets();
  const presetCount = Object.keys(presets || {}).length;
  const liveSampleReady = liveDiagnostics.sample >= 8;
  const liveQualityReady = liveDiagnostics.sample >= 8 && liveDiagnostics.successRate >= 65;
  const benchmarkReady = benchmark.size >= Math.min(10, BENCHMARK_SET_SIZE);
  const kpi = kpiReport || buildNetKpiReport(report, liveDiagnostics, benchmark);
  const kpiReady = kpi.readyCount >= 3;
  const kpiDone = kpiReady && kpi.passRate >= 75;

  return [
    {
      label: '1) Kalibrasyon',
      done: report.calibrationReady,
      status: report.calibrationReady ? 'aktif' : `beklemede (${report.resolvedCount}/${MIN_BACKTEST_SAMPLE})`
    },
    {
      label: '2) CanlÄ± doÄŸruluk',
      done: liveQualityReady,
      status: liveSampleReady ? `%${liveDiagnostics.successRate}` : `veri toplanÄ±yor (${liveDiagnostics.sample})`
    },
    {
      label: '3) Lig ÅŸablonu',
      done: presetCount > 0,
      status: presetCount > 0 ? `${presetCount} kayÄ±tlÄ±` : 'yok'
    },
    {
      label: '4) Net KPI',
      done: kpiDone,
      status: kpiReady ? `${kpi.passCount}/${kpi.readyCount} hedefte` : 'Ã¶rneklem bekleniyor'
    },
    {
      label: '5) Test seti',
      done: benchmarkReady,
      status: `${benchmark.size}/${BENCHMARK_SET_SIZE}`
    }
  ];
}
function renderBacktestStat(label, value, detail) {
  return `
    <article class="mini-card backtest-stat-card">
      <span>${safeText(label)}</span>
      <strong>${safeText(String(value))}</strong>
      <p>${safeText(detail)}</p>
    </article>
  `;
}

function renderBacktestRows(items, emptyLabel) {
  if (!items.length) {
    return `<p class="panel-subtext backtest-empty">${safeText(emptyLabel)}</p>`;
  }

  return `
    <div class="backtest-list">
      ${items.map((item) => `
        <div class="backtest-row">
          <span>${safeText(item.label)}</span>
          <div>
            <strong>%${item.hitRate}</strong>
            <small>${item.hits}/${item.sampleSize}</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderBacktestReasonRows(items, emptyLabel) {
  if (!items.length) {
    return `<p class="panel-subtext backtest-empty">${safeText(emptyLabel)}</p>`;
  }

  return `
    <div class="backtest-list">
      ${items.map((item) => `
        <div class="backtest-row">
          <span>${safeText(item.label)}</span>
          <div>
            <strong>${item.sampleSize}</strong>
            <small>kaÃ§Ä±ÅŸ</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function evaluateNetKpiMetric(key, value, sample, hitCount = null, totalCount = null) {
  const target = NET_KPI_TARGETS[key];
  if (!target) {
    return null;
  }
  const numericValue = Number(value) || 0;
  const numericSample = Number(sample) || 0;
  const waiting = numericSample < target.minSample;
  const pass = waiting
    ? false
    : target.comparator === 'max'
      ? numericValue <= target.target
      : numericValue >= target.target;

  let status = 'waiting';
  if (!waiting) {
    status = pass ? 'hit' : 'risk';
  }

  const targetText = target.comparator === 'max'
    ? `â‰¤%${target.target}`
    : `â‰¥%${target.target}`;
  const sampleText = `${numericSample}/${target.minSample}`;
  const scoreText = `%${Math.round(numericValue)}`;
  const ratioText = Number.isInteger(hitCount) && Number.isInteger(totalCount)
    ? `${hitCount}/${totalCount}`
    : null;

  return {
    key,
    label: target.label,
    status,
    pass,
    waiting,
    value: Math.round(numericValue),
    sample: numericSample,
    minSample: target.minSample,
    statusText: waiting
      ? `Beklemede ${scoreText}`
      : pass
        ? `Hedefte ${scoreText}`
        : `Risk ${scoreText}`,
    detail: ratioText
      ? `${ratioText} â€¢ hedef ${targetText} â€¢ Ã¶rneklem ${sampleText}`
      : `hedef ${targetText} â€¢ Ã¶rneklem ${sampleText}`
  };
}

function buildNetKpiReport(report, liveDiagnostics, benchmark) {
  const items = [
    evaluateNetKpiMetric('topHitRate', report.topHitRate, report.resolvedCount, report.topHits, report.resolvedCount),
    evaluateNetKpiMetric('playedHitRate', report.playedHitRate, report.playedResolvedCount, report.playedHits, report.playedResolvedCount),
    evaluateNetKpiMetric('liveSuccessRate', liveDiagnostics.successRate, liveDiagnostics.sample),
    evaluateNetKpiMetric('liveNotFoundRate', liveDiagnostics.notFoundRate, liveDiagnostics.sample),
    evaluateNetKpiMetric('benchmarkHitRate', benchmark.hitRate, benchmark.resolved)
  ].filter(Boolean);

  const readyItems = items.filter((item) => !item.waiting);
  const passedItems = readyItems.filter((item) => item.pass);
  const waitingCount = items.length - readyItems.length;
  const passRate = readyItems.length ? Math.round((passedItems.length / readyItems.length) * 100) : 0;
  const allReadyAndPassing = readyItems.length > 0 && passedItems.length === readyItems.length;

  const summary = allReadyAndPassing
    ? `Net KPI gÃ¼Ã§lÃ¼: ${passedItems.length}/${readyItems.length} hedefte.`
    : readyItems.length
      ? `Net KPI dengede: ${passedItems.length}/${readyItems.length} hedefte, ${readyItems.length - passedItems.length} riskte, ${waitingCount} beklemede.`
      : `Net KPI iÃ§in Ã¶rneklem toplanÄ±yor (${waitingCount} metrik beklemede).`;

  const status = allReadyAndPassing ? 'hit' : readyItems.length ? 'risk' : 'waiting';

  return {
    items,
    summary,
    status,
    readyCount: readyItems.length,
    passCount: passedItems.length,
    waitingCount,
    passRate
  };
}

function renderNetKpiRows(items) {
  if (!items?.length) {
    return `<p class="panel-subtext backtest-empty">KPI verisi henÃ¼z oluÅŸmadÄ±.</p>`;
  }
  return `
    <div class="backtest-list">
      ${items.map((item) => `
        <div class="backtest-row">
          <span>${safeText(item.label)}</span>
          <div>
            <strong class="kpi-status ${safeText(item.status)}">${safeText(item.statusText)}</strong>
            <small>${safeText(item.detail)}</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function buildCouponPerformanceReport(entries = []) {
  const playedEntries = (entries || []).filter((entry) => entry?.result && entry?.playedMarket);
  if (!playedEntries.length) {
    return {
      summary: 'HenÃ¼z kupon performans verisi yok.',
      detail: 'Benim oynadÄ±ÄŸÄ±m market kaydedildikÃ§e ayrÄ± isabet raporu Ã¼retilecek.'
    };
  }

  const hits = playedEntries.reduce((total, entry) => total + (gradeRecommendation(entry.playedMarket, entry.result, entry)?.hit ? 1 : 0), 0);
  const hitRate = calculateHitRate(hits, playedEntries.length);

  return {
    summary: `${playedEntries.length} kupon kaydÄ±nda isabet %${hitRate}.`,
    detail: `${hits}/${playedEntries.length} kayÄ±t tuttu. Program ana Ã¶nerisi ile senin pazarÄ±n artÄ±k ayrÄ± takip ediliyor.`
  };
}

function buildOddsSnapshotReport(entries = []) {
  const snapshots = (entries || [])
    .flatMap((entry) => (entry?.oddsSnapshots || []).map((snapshot) => ({ ...snapshot, tracked: Boolean(entry?.tracked) })));
  if (!snapshots.length) {
    return {
      summary: 'HenÃ¼z oran snapshot geÃ§miÅŸi yok.',
      detail: 'Program analiz Ã¼retirken alÄ±nan oran akÄ±ÅŸÄ± burada snapshot geÃ§miÅŸi olarak birikecek.',
      liveTracked: 0
    };
  }

  const directionMap = new Map();
  let liveTracked = 0;
  for (const snapshot of snapshots) {
    const direction = cleanText(snapshot.direction, 'stabil');
    directionMap.set(direction, (directionMap.get(direction) || 0) + 1);
    if (snapshot.tracked) {
      liveTracked += 1;
    }
  }

  const topDirections = [...directionMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([direction, count]) => `${direction} (${count})`)
    .join(' â€¢ ');

  return {
    summary: `${snapshots.length} snapshot kaydÄ± var. BaskÄ±n akÄ±ÅŸ: ${topDirections || 'stabil'}.`,
    detail: 'Steam move, fake move ve late drift katmanÄ± bu birikim Ã¼stÃ¼ne sertleÅŸtirilecek.',
    liveTracked
  };
}

function loadJsonStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function saveJsonStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota issues in UI thread
  }
}

function loadBenchmarkSet() {
  const list = loadJsonStorage(STORAGE_KEYS.benchmarkSet, []);
  return Array.isArray(list) ? list.filter((item) => typeof item === 'string' && item.trim()) : [];
}

function saveBenchmarkSet(ids) {
  const unique = [...new Set((ids || []).filter((item) => typeof item === 'string' && item.trim()))].slice(0, BENCHMARK_SET_SIZE);
  saveJsonStorage(STORAGE_KEYS.benchmarkSet, unique);
  return unique;
}

function ensureBenchmarkSet(entries) {
  const current = loadBenchmarkSet();
  const resolved = (entries || [])
    .filter((entry) => entry?.result && entry?.topRecommendation?.market)
    .sort((left, right) => new Date(right.result?.savedAt || right.analyzedAt || 0) - new Date(left.result?.savedAt || left.analyzedAt || 0))
    .map((entry) => entry.id);

  if (current.length >= BENCHMARK_SET_SIZE) {
    return current;
  }

  const next = [...current];
  for (const id of resolved) {
    if (!next.includes(id)) {
      next.push(id);
    }
    if (next.length >= BENCHMARK_SET_SIZE) {
      break;
    }
  }
  return saveBenchmarkSet(next);
}

function buildBenchmarkReport(entries) {
  const benchmarkIds = ensureBenchmarkSet(entries);
  const selected = (entries || []).filter((entry) => benchmarkIds.includes(entry.id) && entry?.result && entry?.topRecommendation?.market);
  if (!selected.length) {
    return {
      size: benchmarkIds.length,
      resolved: 0,
      hitRate: 0,
      hitCount: 0,
      pending: Math.max(0, benchmarkIds.length)
    };
  }

  let hitCount = 0;
  for (const entry of selected) {
    const grade = gradeRecommendation(entry.topRecommendation?.market, entry.result);
    if (grade?.hit) {
      hitCount += 1;
    }
  }

  return {
    size: benchmarkIds.length,
    resolved: selected.length,
    hitRate: calculateHitRate(hitCount, selected.length),
    hitCount,
    pending: Math.max(0, benchmarkIds.length - selected.length)
  };
}

function loadLiveDiagnostics() {
  const list = loadJsonStorage(STORAGE_KEYS.liveDiagnostics, []);
  return Array.isArray(list) ? list : [];
}

function saveLiveDiagnostics(records) {
  const trimmed = (records || []).slice(-LIVE_DIAGNOSTIC_LIMIT);
  saveJsonStorage(STORAGE_KEYS.liveDiagnostics, trimmed);
  return trimmed;
}

function inferLiveFailureReason(note) {
  const text = cleanText(note || '', '').toLocaleLowerCase('tr-TR');
  if (!text) {
    return 'not_belirsiz';
  }
  if (text.includes('eÅŸleÅŸ') || text.includes('esles')) {
    return 'not_eslesme';
  }
  if (text.includes('saat') || text.includes('tarih')) {
    return 'not_saat_tarih';
  }
  if (text.includes('lig')) {
    return 'not_lig';
  }
  if (text.includes('kaynak') || text.includes('api')) {
    return 'not_kaynak';
  }
  return 'not_diger';
}

function updateLiveDiagnostics(statuses, trackedEntries) {
  const records = loadLiveDiagnostics();
  const leagueMap = new Map((trackedEntries || []).map((entry) => [entry.id, normalizeLeagueLabel(entry.league)]));
  const now = new Date().toISOString();

  for (const status of statuses || []) {
    const state = cleanText(status?.state || '', 'unknown');
    const hasScore = Number.isInteger(status?.homeGoals) && Number.isInteger(status?.awayGoals);
    const reason = state === 'not_found'
      ? inferLiveFailureReason(status?.note)
      : hasScore
        ? 'ok'
        : 'score_missing';

    records.push({
      id: String(status?.id || ''),
      at: now,
      league: leagueMap.get(status?.id) || 'Bilinmeyen lig',
      source: cleanText(status?.source || '', 'bilinmeyen'),
      state,
      reason
    });
  }

  saveLiveDiagnostics(records);
}

function buildLiveDiagnosticsReport() {
  const rows = loadLiveDiagnostics();
  const recent = rows.slice(-LIVE_DIAGNOSTIC_LIMIT);
  if (!recent.length) {
    return {
      sample: 0,
      successRate: 0,
      notFoundRate: 0,
      topReasons: []
    };
  }

  const notFoundCount = recent.filter((item) => item.reason.startsWith('not_')).length;
  const successCount = recent.filter((item) => item.reason === 'ok').length;
  const reasonMap = new Map();

  for (const item of recent) {
    const key = item.reason;
    reasonMap.set(key, (reasonMap.get(key) || 0) + 1);
  }

  const topReasons = [...reasonMap.entries()]
    .filter(([key]) => key !== 'ok')
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, count]) => ({
      key,
      count,
      label: key
        .replace('not_eslesme', 'EÅŸleÅŸme kaÃ§Ä±rtma')
        .replace('not_saat_tarih', 'Saat/Tarih uyuÅŸmazlÄ±ÄŸÄ±')
        .replace('not_lig', 'Lig adÄ± farklÄ±lÄ±ÄŸÄ±')
        .replace('not_kaynak', 'Kaynak yanÄ±tÄ± zayÄ±f')
        .replace('score_missing', 'Skor eksik')
        .replace('not_diger', 'DiÄŸer')
        .replace('not_belirsiz', 'Belirsiz')
    }));

  return {
    sample: recent.length,
    successRate: calculateHitRate(successCount, recent.length),
    notFoundRate: calculateHitRate(notFoundCount, recent.length),
    topReasons
  };
}

function buildCalibrationContext(entries) {
  const report = buildBacktestReport(entries || []);
  if (!report.resolvedCount) {
    return null;
  }

  const marketMap = new Map();
  for (const item of report.markets || []) {
    if (item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE) {
      marketMap.set(item.key, item.hitRate);
    }
  }

  const leagueMap = new Map();
  for (const item of report.leagues || []) {
    if (item.sampleSize >= MIN_LEAGUE_CALIBRATION_SAMPLE) {
      leagueMap.set(normalizeLeagueLabel(item.league), item.hitRate);
    }
  }

  const hourMap = new Map();
  for (const item of report.hourBands || []) {
    if (item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE) {
      hourMap.set(item.key, item.hitRate);
    }
  }

  const modeMap = new Map();
  for (const item of report.modeStats || []) {
    if (item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE) {
      modeMap.set(item.key, item.hitRate);
    }
  }

  const liveScenarioMap = new Map();
  for (const item of report.liveScenarios || []) {
    if (item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE) {
      liveScenarioMap.set(item.key, item.hitRate);
    }
  }

  const liveScenarioMarketMap = new Map();
  for (const item of report.liveScenarioMarkets || []) {
    if (item.sampleSize >= MIN_MARKET_CALIBRATION_SAMPLE) {
      liveScenarioMarketMap.set(item.key, item.hitRate);
    }
  }

  return {
    overall: report.topHitRate,
    markets: marketMap,
    leagues: leagueMap,
    hours: hourMap,
    modes: modeMap,
    liveScenarios: liveScenarioMap,
    liveScenarioMarkets: liveScenarioMarketMap,
    leagueQuality: buildLeagueQualityMap(report)
  };
}

function clampPercent(value) {
  return Math.max(1, Math.min(99, Math.round(Number(value) || 0)));
}

function resolveHourBandKey(matchTime = '') {
  const raw = String(matchTime || '').trim();
  const hour = Number.parseInt(raw.split(':')[0], 10);
  if (!Number.isInteger(hour)) {
    return 'unknown';
  }
  if (hour < 15) {
    return 'morning';
  }
  if (hour < 19) {
    return 'afternoon';
  }
  if (hour < 22) {
    return 'prime';
  }
  return 'late';
}

function resolveAnalysisMode(meta = {}) {
  return meta.liveMode ? 'live' : 'prematch';
}

function buildLeagueQualityMap(report) {
  const map = new Map();
  for (const item of report.leagues || []) {
    const sample = Number(item.sampleSize) || 0;
    const hitRate = Number(item.hitRate) || 0;
    if (sample < MIN_LEAGUE_CALIBRATION_SAMPLE) {
      continue;
    }
    if (hitRate >= 63 && sample >= 5) {
      map.set(normalizeLeagueLabel(item.league), 'white');
    } else if (hitRate <= 44 && sample >= 4) {
      map.set(normalizeLeagueLabel(item.league), 'black');
    } else if (hitRate <= 50) {
      map.set(normalizeLeagueLabel(item.league), 'gray');
    }
  }
  return map;
}

function isLiveAnalysisPayload(analysis) {
  const label = normalizeTurkishText(`${analysis?.sourceLabel || ''} ${analysis?.sourceStatus?.label || ''}`);
  return label.toLowerCase().includes('canlÄ±') || label.toLowerCase().includes('canlÄ±') || label.toLowerCase().includes('live');
}

function calibrateProbability(baseProbability, marketGroup, leagueLabel, context, meta = {}) {
  if (!context) {
    return clampPercent(baseProbability);
  }

  const base = Number(baseProbability) || 0;
  const overall = Number(context.overall) || 50;
  const marketRate = context.markets.get(marketGroup);
  const leagueRate = context.leagues.get(normalizeLeagueLabel(leagueLabel));
  const hourRate = context.hours?.get(resolveHourBandKey(meta.matchTime));
  const modeRate = context.modes?.get(resolveAnalysisMode(meta));
  const leagueQuality = context.leagueQuality?.get(normalizeLeagueLabel(leagueLabel));

  let adjustment = 0;
  if (Number.isFinite(marketRate)) {
    adjustment += (marketRate - overall) * 0.28;
  }
  if (Number.isFinite(leagueRate)) {
    adjustment += (leagueRate - overall) * 0.22;
  }
  if (Number.isFinite(hourRate)) {
    adjustment += (hourRate - overall) * 0.14;
  }
  if (Number.isFinite(modeRate)) {
    adjustment += (modeRate - overall) * 0.18;
  }
  if (leagueQuality === 'black') {
    adjustment -= 7;
  } else if (leagueQuality === 'gray') {
    adjustment -= 3;
  } else if (leagueQuality === 'white') {
    adjustment += 3;
  }

  adjustment = Math.max(-12, Math.min(12, adjustment));
  return clampPercent(base + adjustment);
}

function calibrateLiveMarketProbability(pick, marketLabel, probability, context) {
  const analysis = pick?.analysis || {};
  const leagueLabel = analysis.matchInfo?.league || '';
  const minute = parseTrackedMinuteLabel(pick?.minuteLabel || pick?.trackedStatus?.statusLabel || '');
  const { totalGoals, homeGoals, awayGoals } = parseLiveScoreTuple(pick?.liveScore || '0-0');
  const normalizedMarket = normalizeDisplayMarketLabel(marketLabel || '');
  const scenarioMeta = extractLiveScenarioMeta(
    pick?.liveScore || '0-0',
    pick?.minuteLabel || pick?.trackedStatus?.statusLabel || '',
    pick?.halftimeScore || pick?.trackedStatus?.halftimeScore || ''
  );
  const meta = {
    matchTime: analysis.matchInfo?.matchTime || '',
    liveMode: true
  };
  const group = recommendationMarketGroup(normalizedMarket);
  let calibrated = calibrateProbability(probability, group, leagueLabel, context, meta);

  const scenarioRate = context.liveScenarios?.get(scenarioMeta.key);
  const scenarioMarketRate = context.liveScenarioMarkets?.get(`${scenarioMeta.key}::${group}`);
  if (Number.isFinite(scenarioRate)) {
    calibrated += (scenarioRate - (Number(context.overall) || 50)) * 0.16;
  }
  if (Number.isFinite(scenarioMarketRate)) {
    calibrated += (scenarioMarketRate - (Number(context.overall) || 50)) * 0.24;
  }

  if (minute >= 55 && totalGoals >= 4 && /0\.5\s*(Ãœst|Alt)/i.test(normalizedMarket)) {
    calibrated -= 14;
  }
  if (minute >= 65 && totalGoals >= 5 && /^2Y/i.test(normalizedMarket)) {
    calibrated -= 18;
  }
  if (/^MaÃ§ Sonu\s*\d+\.5\s*Ãœst/i.test(normalizedMarket) && totalGoals >= 3) {
    calibrated += 4;
  }
  if (/^MaÃ§ Sonu\s*\d+\.5\s*Alt/i.test(normalizedMarket) && Math.abs(homeGoals - awayGoals) >= 2 && minute >= 65) {
    calibrated += 3;
  }
  if (/Uzak Dur/i.test(normalizedMarket)) {
    if (totalGoals >= 3 && minute < 76) {
      calibrated -= 10;
    } else if (Math.abs(homeGoals - awayGoals) >= 2 && minute >= 74) {
      calibrated = Math.max(calibrated, 64);
    }
  }
  return clampPercent(calibrated);
}

function promoteBestLiveMarket(pick) {
  const scoreTuple = parseLiveScoreTuple(pick?.liveScore || '0-0');
  const minute = parseTrackedMinuteLabel(pick?.minuteLabel || pick?.trackedStatus?.statusLabel || '');
  const goalDiff = Math.abs(scoreTuple.homeGoals - scoreTuple.awayGoals);
  const candidates = [
    {
      key: 'primary',
      label: normalizeDisplayMarketLabel(pick?.firstHalfMarketLabel || ''),
      probability: Number(pick?.firstHalfOver05Probability) || 0,
      note: pick?.firstHalfNote || ''
    },
    {
      key: 'secondary',
      label: normalizeDisplayMarketLabel(pick?.secondaryMarketLabel || ''),
      probability: Number(pick?.secondaryMarketProbability) || 0,
      note: pick?.secondaryMarketNote || ''
    },
    {
      key: 'result',
      label: normalizeDisplayMarketLabel(pick?.resultMarketLabel || ''),
      probability: Number(pick?.resultMarketProbability) || 0,
      note: pick?.resultMarketNote || ''
    }
  ].filter((item) => item.label);

  const scored = candidates.map((item) => {
    let score = item.probability;
    if (/Uzak Dur/i.test(item.label)) {
      score -= scoreTuple.totalGoals >= 3 && minute < 76 ? 14 : 4;
    }
    if (/^2Y/i.test(item.label) && scoreTuple.totalGoals >= 4) {
      score -= 16;
    }
    if (/^MaÃ§ Sonu/i.test(item.label) && scoreTuple.totalGoals >= 3) {
      score += 8;
    }
    if (/^(1X|X2|1|2|Beraberlik)/i.test(item.label) && goalDiff >= 2) {
      score += 6;
    }
    return { ...item, score };
  }).sort((a, b) => b.score - a.score);

  const best = scored[0];
  if (!best || best.key === 'primary') {
    return pick;
  }

  const next = { ...pick };
  const currentPrimary = {
    label: next.firstHalfMarketLabel,
    probability: next.firstHalfOver05Probability,
    note: next.firstHalfNote
  };

  if (best.key === 'secondary') {
    next.firstHalfMarketLabel = next.secondaryMarketLabel;
    next.firstHalfOver05Probability = next.secondaryMarketProbability;
    next.firstHalfNote = next.secondaryMarketNote;
    next.secondaryMarketLabel = currentPrimary.label;
    next.secondaryMarketProbability = currentPrimary.probability;
    next.secondaryMarketNote = currentPrimary.note;
  } else if (best.key === 'result') {
    next.firstHalfMarketLabel = next.resultMarketLabel;
    next.firstHalfOver05Probability = next.resultMarketProbability;
    next.firstHalfNote = next.resultMarketNote;
    next.resultMarketLabel = currentPrimary.label;
    next.resultMarketProbability = currentPrimary.probability;
    next.resultMarketNote = currentPrimary.note;
  }

  if (next.analysis?.recommendations?.length) {
    next.analysis = {
      ...next.analysis,
      recommendations: [
        {
          ...next.analysis.recommendations[0],
          market: next.firstHalfMarketLabel,
          probability: next.firstHalfOver05Probability,
          reason: cleanText(next.firstHalfNote || next.analysis.recommendations[0]?.reason || '', next.analysis.recommendations[0]?.reason || '')
        },
        ...next.analysis.recommendations.slice(1)
      ]
    };
  }

  return next;
}

function applyCalibrationToAnalysis(analysis, context) {
  if (!analysis || !context) {
    return analysis;
  }

  const leagueLabel = analysis.matchInfo?.league || '';
  const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
  const calibrationMeta = {
    matchTime: analysis.matchInfo?.matchTime || '',
    liveMode: isLiveAnalysisPayload(analysis)
  };

  const adjusted = recommendations
    .map((item) => ({
      ...item,
      probability: calibrateProbability(item.probability, recommendationMarketGroup(item.market), leagueLabel, context, calibrationMeta)
    }))
    .sort((a, b) => b.probability - a.probability);

  analysis.recommendations = adjusted;
  if (adjusted.length) {
    const top = adjusted[0];
    analysis.confidenceScore = calibrateProbability(
      analysis.confidenceScore || top.probability,
      recommendationMarketGroup(top.market),
      leagueLabel,
      context,
      calibrationMeta
    );
  }

  return analysis;
}

function applyCalibrationToScan(scan, context) {
  if (!scan || !context) {
    return scan;
  }

  const patchPick = (pick) => {
    if (!pick?.analysis) {
      return pick;
    }
    applyCalibrationToAnalysis(pick.analysis, context);
    pick.reliabilityScore = clampPercent((Number(pick.reliabilityScore) + Number(pick.analysis.confidenceScore)) / 2);
    return pick;
  };

  scan.topPicks = (scan.topPicks || []).map(patchPick).sort((a, b) => (b.reliabilityScore || 0) - (a.reliabilityScore || 0));
  scan.avoidPicks = (scan.avoidPicks || []).map(patchPick).sort((a, b) => (b.reliabilityScore || 0) - (a.reliabilityScore || 0));
  return scan;
}

function applyCalibrationToLiveScan(scan, context) {
  if (!scan || !context) {
    return scan;
  }

  scan.picks = (scan.picks || []).map((pick) => {
    if (!pick?.analysis) {
      return pick;
    }

    applyCalibrationToAnalysis(pick.analysis, context);

    if (Number.isFinite(pick.resultMarketProbability)) {
      pick.resultMarketProbability = calibrateProbability(
        pick.resultMarketProbability,
        recommendationMarketGroup(pick.resultMarketLabel || pick.analysis.recommendations?.[0]?.market || ''),
        pick.analysis.matchInfo?.league,
        context,
        {
          matchTime: pick.analysis.matchInfo?.matchTime || '',
          liveMode: true
        }
      );
    }
    if (Number.isFinite(pick.firstHalfOver05Probability)) {
      pick.firstHalfOver05Probability = calibrateLiveMarketProbability(pick, pick.firstHalfMarketLabel, pick.firstHalfOver05Probability, context);
    }
    if (Number.isFinite(pick.secondaryMarketProbability)) {
      pick.secondaryMarketProbability = calibrateLiveMarketProbability(pick, pick.secondaryMarketLabel, pick.secondaryMarketProbability, context);
    }
    return promoteBestLiveMarket(pick);
  });

  return scan;
}

function applyDisplayFiltersToScan(scan) {
  if (!scan) {
    return scan;
  }

  const filtered = {
    ...scan,
    topPicks: Array.isArray(scan.topPicks) ? [...scan.topPicks] : [],
    avoidPicks: Array.isArray(scan.avoidPicks) ? [...scan.avoidPicks] : []
  };

  if (scanTopOnlyToggle?.checked) {
    filtered.topPicks = filtered.topPicks.slice(0, 3);
    filtered.avoidPicks = [];
    filtered.displayMode = 'top3';
  }

  return filtered;
}

function applyDisplayFiltersToLiveScan(scan) {
  if (!scan) {
    return scan;
  }

  const filtered = {
    ...scan,
    picks: Array.isArray(scan.picks) ? [...scan.picks] : []
  };

  filtered.picks = filtered.picks.filter((pick) => {
    const state = String(pick?.trackedStatus?.state || '').toLowerCase();
    const minute = parseTrackedMinuteLabel(pick?.minuteLabel || pick?.trackedStatus?.statusLabel || '');
    if (state === 'halftime') {
      return true;
    }
    if (state === 'live') {
      return minute > 0 && minute <= 77;
    }
    return false;
  });

  filtered.picks.sort((a, b) => {
    const aMinute = parseTrackedMinuteLabel(a?.minuteLabel || a?.trackedStatus?.statusLabel || '');
    const bMinute = parseTrackedMinuteLabel(b?.minuteLabel || b?.trackedStatus?.statusLabel || '');
    return (b.analysis?.confidenceScore || 0) - (a.analysis?.confidenceScore || 0)
      || aMinute - bMinute;
  });

  if (liveBestOnlyToggle?.checked) {
    filtered.picks = filtered.picks.slice(0, 1);
    filtered.displayMode = 'best1';
  }

  filtered.analyzedCount = filtered.picks.length;
  filtered.liveCount = filtered.picks.length;
  filtered.summaryNote = filtered.picks.length
    ? filtered.displayMode === 'best1'
      ? 'Filtre aktif. En gÃ¼venilir canlÄ± maÃ§ Ã¶ne Ã§Ä±karÄ±ldÄ±.'
      : 'Sadece aktif canlÄ± veya devre arasÄ±ndaki maÃ§lar gÃ¶steriliyor.'
    : 'Filtreyi geÃ§en aktif canlÄ± maÃ§ bulunamadÄ±.';

  return filtered;
}
function loadHistoryFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    const parsed = JSON.parse(raw ?? '[]');
    const list = Array.isArray(parsed) ? parsed : [];
    const sanitized = sanitizePayload(list);

    if (JSON.stringify(list) !== JSON.stringify(sanitized)) {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(sanitized.slice(0, HISTORY_LIMIT)));
    }

    return sanitized;
  } catch {
    return [];
  }
}

async function loadHistoryFromFile() {
  return null;
}


async function saveHistoryToFile(entries) {
  void entries;
  return false;
}

async function clearHistoryFile() {
  return false;
}

function loadHistory() {
  if (historyCache !== null) {
    return historyCache;
  }
  const localEntries = loadHistoryFromLocalStorage();
  historyCache = localEntries;
  return localEntries;
}

async function hydrateHistory() {
  if (historyLoadPromise) {
    return historyLoadPromise;
  }

  historyLoadPromise = (async () => {
    const filePayload = await loadHistoryFromFile();
    if (filePayload && filePayload.exists) {
      const sanitized = sanitizePayload(filePayload.entries);
      historyCache = sanitized;
      renderHistory(sanitized);
      return sanitized;
    }

    const localEntries = loadHistoryFromLocalStorage();
    historyCache = localEntries;
    renderHistory(localEntries);

    if (localEntries.length) {
      const saved = await saveHistoryToFile(localEntries.slice(0, HISTORY_LIMIT));
      if (saved) {
        localStorage.removeItem(STORAGE_KEYS.history);
      }
    }

    return historyCache;
  })();

  return historyLoadPromise;
}

function persistHistory(entries) {
  const limited = entries.slice(0, HISTORY_LIMIT);
  historyCache = limited;

  saveHistoryToFile(limited)
    .then((saved) => {
      if (saved) {
        localStorage.removeItem(STORAGE_KEYS.history);
      } else {
        localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(limited));
      }
    })
    .catch(() => {
      localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(limited));
    });
}

function clearHistory() {
  localStorage.removeItem(STORAGE_KEYS.history);
  historyCache = [];
  clearHistoryFile();
  if (trackedRefreshTimer) {
    window.clearInterval(trackedRefreshTimer);
    trackedRefreshTimer = null;
  }
  renderHistory([]);
  setStatus('MaÃ§ takibi ve analiz geÃ§miÅŸi temizlendi.', 'ok');
}

function saveAnalysisToHistory(url, analysis, overrides = {}) {
  const entries = loadHistory();
  const analysisId = analysis.analysisId || buildHistoryFallbackId(analysis.matchInfo);
  const previous = entries.find((item) => item.id === analysisId) ?? null;
  const uiCopy = buildProfessionalCopy(analysis);
  const analyzedAt = new Date().toISOString();
  const nextSnapshot = buildOddsSnapshotFromMovement(analysis.oddsMovement, analyzedAt);
  const derivedLiveScore = parseLiveScoreTuple(overrides.capturedScore || previous?.capturedScore || '');
  const fallbackLiveScore = derivedLiveScore.totalGoals > 0
    ? { homeGoals: derivedLiveScore.homeGoals, awayGoals: derivedLiveScore.awayGoals }
    : null;

  const nextEntry = {
    id: analysisId,
    analyzedAt,
    url,
    homeTeam: analysis.matchInfo.homeTeam,
    awayTeam: analysis.matchInfo.awayTeam,
    homeTeamId: previous?.homeTeamId ?? null,
    awayTeamId: previous?.awayTeamId ?? null,
    homeLogoUrl: previous?.homeLogoUrl ?? cleanText(analysis.matchInfo?.homeLogoUrl || '', ''),
    awayLogoUrl: previous?.awayLogoUrl ?? cleanText(analysis.matchInfo?.awayLogoUrl || '', ''),
    league: analysis.matchInfo.league,
    matchDate: analysis.matchInfo.matchDate,
    matchTime: analysis.matchInfo.matchTime || '',
    confidenceScore: analysis.confidenceScore,
    sourceLabel: cleanText(analysis.sourceLabel || previous?.sourceLabel || '', previous?.sourceLabel || ''),
    sourceStatus: analysis.sourceStatus ?? previous?.sourceStatus ?? null,
    topRecommendation: analysis.recommendations?.[0] ?? null,
    recommendations: (analysis.recommendations ?? []).map((item) => ({
      market: item.market,
      probability: item.probability
    })),
    verdict: uiCopy.verdict,
    analysisMode: overrides.analysisMode ?? previous?.analysisMode ?? (isLiveAnalysisPayload(analysis) ? 'live' : 'prematch'),
    tracked: overrides.tracked ?? previous?.tracked ?? false,
    liveState: previous?.liveState ?? null,
    liveStatusLabel: previous?.liveStatusLabel ?? '',
    liveNote: previous?.liveNote ?? '',
    liveSource: previous?.liveSource ?? '',
    liveScore: previous?.liveScore ?? fallbackLiveScore ?? null,
    capturedMinuteLabel: cleanText(overrides.capturedMinuteLabel || previous?.capturedMinuteLabel || '', previous?.capturedMinuteLabel || ''),
    capturedScore: cleanText(overrides.capturedScore || previous?.capturedScore || '', previous?.capturedScore || ''),
    halftimeScore: cleanText(overrides.halftimeScore || previous?.halftimeScore || '', previous?.halftimeScore || ''),
    lastSyncedAt: previous?.lastSyncedAt ?? null,
    trackingSource: overrides.trackingSource ?? previous?.trackingSource ?? '',
    playedMarket: overrides.playedMarket ?? previous?.playedMarket ?? null,
    oddsSnapshots: mergeOddsSnapshots(previous?.oddsSnapshots ?? [], nextSnapshot),
    goalEvents: Array.isArray(previous?.goalEvents) ? previous.goalEvents.slice(-24) : [],
    autoClosedAt: previous?.autoClosedAt ?? null,
    result: previous?.result ?? null
  };

  const merged = [nextEntry, ...entries.filter((item) => item.id !== analysisId)].slice(0, HISTORY_LIMIT);
  persistHistory(merged);
  renderHistory(merged);
}

function renderHistory(entries) {
  const trackedEntries = entries.filter((entry) => entry.tracked);
  const archiveEntries = entries.filter((entry) => !entry.tracked);

  if (refreshTrackedBtn) {
    refreshTrackedBtn.disabled = !trackedEntries.length;
  }

  if (!entries.length) {
    historyContent.innerHTML = `
      <div class="empty-state compact-empty">
        <p>HenÃ¼z kayÄ±t yok. Bir maÃ§Ä± analiz edip Takibe Al dediÄŸinde burada gÃ¶rÃ¼nÃ¼r.</p>
      </div>
    `;
    scheduleTrackedRefresh([]);
    renderLiveHub([]);
    normalizeDomContent(historyContent);
    syncLiveMatchCenter([]);
    return;
  }

  const backtestReport = buildBacktestReport(entries);
  const sections = [
    renderHistorySection(
      'Takipteki maÃ§lar',
      trackedEntries.length
        ? 'CanlÄ± skor ve maÃ§ sonu sonucu Mackolik akÄ±ÅŸÄ±yla yenilenir.'
        : 'HenÃ¼z takibe alÄ±nan maÃ§ yok. Bir karttaki Takibe Al butonunu kullan.',
      trackedEntries,
      'tracked'
    )
  ];

  if (backtestReport.resolvedCount) {
    sections.push(renderBacktestSummary(backtestReport, entries));
  }

  if (archiveEntries.length) {
    sections.push(
      renderHistorySection(
        'Son analizler',
        'Takipte olmayan kayÄ±tlar burada saklanÄ±r.',
        archiveEntries.slice(0, 6),
        'archive'
      )
    );
  }

  setNormalizedHtml(historyContent, sections.join(''));
  scheduleTrackedRefresh(entries);
  renderLiveHub(entries);
  normalizeDomContent(historyContent);
  syncLiveMatchCenter(entries);
}

function setLiveHubOpen(isOpen) {
  if (!liveHubDrawer) {
    return;
  }
  liveHubDrawer.classList.toggle('hidden', !isOpen);
  document.body.classList.toggle('live-hub-open', isOpen);
}

async function openExternalUrl(url) {
  const cleanUrl = cleanText(url, '').trim();
  if (!cleanUrl) {
    return false;
  }
  try {
    await invoke('open_external_url', { url: cleanUrl });
    return true;
  } catch {
    try {
      const popup = window.open(cleanUrl, '_blank', 'noopener,noreferrer');
      return Boolean(popup);
    } catch {
      return false;
    }
  }
}

async function handleLiveMatchCenterActions(event) {
  const openTrigger = event.target.closest('[data-open-url]');
  if (!openTrigger) {
    return;
  }
  event.preventDefault();
  const targetUrl = cleanText(openTrigger.getAttribute('data-open-url') || '', '').trim();
  if (!targetUrl) {
    setStatus('Mackolik baÄŸlantÄ±sÄ± bu maÃ§ iÃ§in henÃ¼z hazÄ±r deÄŸil.', 'warn');
    return;
  }
  const opened = await openExternalUrl(targetUrl);
  if (!opened) {
    setStatus('Mackolik baÄŸlantÄ±sÄ± aÃ§Ä±lamadÄ±.', 'error');
  }
}

async function setLiveMatchCenterOpen(entry) {
  if (!liveMatchCenterDrawer || !liveMatchCenterContent) {
    return;
  }
  const isOpen = !!entry;
  liveMatchCenterDrawer.classList.toggle('hidden', !isOpen);
  document.body.classList.toggle('live-center-open', isOpen);
  if (!isOpen) {
    liveMatchCenterEntryId = null;
    liveMatchCenterContent.innerHTML = '<div class="empty-state compact-empty"><p>Bir canlÄ± maÃ§ seÃ§.</p></div>';
    return;
  }

  liveMatchCenterEntryId = entry.id;
  const cachedMatchcastUrl = liveMatchcastCache.get(entry.id) || cleanText(entry.matchcastUrl || '', '');
  const initialEntry = cachedMatchcastUrl ? { ...entry, matchcastUrl: cachedMatchcastUrl } : entry;
  setNormalizedHtml(liveMatchCenterContent, renderLiveMatchCenter(initialEntry));
  normalizeDomContent(liveMatchCenterContent);
  wireLiveHubLogos(liveMatchCenterContent);
  await hydrateLiveMatchCenterMatchcast(entry);
}

async function hydrateLiveMatchCenterMatchcast(entry) {
  if (!entry || !entry.id || !liveMatchCenterContent || liveMatchCenterEntryId !== entry.id) {
    return;
  }
  const cachedUrl = liveMatchcastCache.get(entry.id) || cleanText(entry.matchcastUrl || '', '');
  if (cachedUrl) {
    if (liveMatchCenterEntryId === entry.id) {
      setNormalizedHtml(liveMatchCenterContent, renderLiveMatchCenter({ ...entry, matchcastUrl: cachedUrl }));
      normalizeDomContent(liveMatchCenterContent);
      wireLiveHubLogos(liveMatchCenterContent);
    }
    return;
  }
  if (!Number.isInteger(entry.mackolikMatchPageId) || !Number.isInteger(entry.matchcastId)) {
    return;
  }

  try {
    const url = await invoke('resolve_matchcast_url', {
      matchPageId: entry.mackolikMatchPageId,
      matchcastId: entry.matchcastId,
      homeTeam: entry.homeTeam,
      awayTeam: entry.awayTeam,
      width: 760
    });
    const cleanUrl = cleanText(url, '').trim();
    if (!cleanUrl || liveMatchCenterEntryId !== entry.id) {
      return;
    }
    liveMatchcastCache.set(entry.id, cleanUrl);
    setNormalizedHtml(liveMatchCenterContent, renderLiveMatchCenter({ ...entry, matchcastUrl: cleanUrl }));
    normalizeDomContent(liveMatchCenterContent);
    wireLiveHubLogos(liveMatchCenterContent);
  } catch {
    // Yerel saha fallback'i korunur.
  }
}

function buildLiveCenterBallPosition(entry) {
  const score = resolveDisplayedScore(entry);
  const minute = parseTrackedMinuteLabel(entry?.liveStatusLabel || '');
  const homeGoals = Number.isInteger(score?.homeGoals) ? score.homeGoals : 0;
  const awayGoals = Number.isInteger(score?.awayGoals) ? score.awayGoals : 0;
  const diff = homeGoals - awayGoals;
  const total = homeGoals + awayGoals;
  const note = cleanText(entry?.goalAlertMessage || entry?.liveNote || '', '').toLocaleLowerCase('tr-TR');
  const homeName = cleanText(entry?.homeTeam, '').toLocaleLowerCase('tr-TR');
  const awayName = cleanText(entry?.awayTeam, '').toLocaleLowerCase('tr-TR');

  let bias = 50;
  if (note && homeName && note.includes(homeName)) {
    bias = 26;
  } else if (note && awayName && note.includes(awayName)) {
    bias = 74;
  } else if (diff !== 0) {
    bias = diff > 0 ? 36 : 64;
  }

  if (total >= 4) {
    bias += diff > 0 ? -4 : diff < 0 ? 4 : 0;
  }
  if (minute >= 70) {
    bias += diff > 0 ? -6 : diff < 0 ? 6 : 0;
  }

  return Math.max(14, Math.min(86, bias));
}

function buildLiveCenterEvent(entry, note) {
  const goalText = cleanText(entry.goalAlertMessage || '', '');
  const home = cleanText(entry.homeTeam, 'Ev sahibi');
  const away = cleanText(entry.awayTeam, 'Deplasman');
  const effectiveState = getEffectiveLiveState(entry);
  if (effectiveState === 'finished') {
    const finalScore = resolveDisplayedScore(entry);
    const scoreLine = finalScore ? `${finalScore.homeGoals}-${finalScore.awayGoals}` : '-';
    return { team: 'MaÃ§ sonu', note: `Final skor ${scoreLine}.`, side: 'neutral' };
  }
  if (goalText) {
    const lower = goalText.toLocaleLowerCase('tr-TR');
    if (lower.includes(home.toLocaleLowerCase('tr-TR'))) {
      return { team: home, note: goalText, side: 'home' };
    }
    if (lower.includes(away.toLocaleLowerCase('tr-TR'))) {
      return { team: away, note: goalText, side: 'away' };
    }
  }
  const score = resolveDisplayedScore(entry);
  if (Number.isInteger(score?.homeGoals) && Number.isInteger(score?.awayGoals)) {
    if (score.homeGoals > score.awayGoals) {
      return { team: home, note: `${home} ÅŸu anda oyunun yÃ¶nÃ¼nÃ¼ belirliyor.`, side: 'home' };
    }
    if (score.awayGoals > score.homeGoals) {
      return { team: away, note: `${away} ÅŸu anda oyunun yÃ¶nÃ¼nÃ¼ belirliyor.`, side: 'away' };
    }
  }
  return { team: 'CanlÄ± akÄ±ÅŸ', note, side: 'neutral' };
}


function parseEventMinuteValue(label) {
  const raw = cleanText(label || '', '');
  const extra = raw.match(/(\d+)\s*\+\s*(\d+)/);
  if (extra) {
    return (Number.parseInt(extra[1], 10) || 0) + (Number.parseInt(extra[2], 10) || 0);
  }
  const minute = raw.match(/(\d+)/);
  if (minute) {
    return Number.parseInt(minute[1], 10) || 0;
  }
  if (/MS/i.test(raw)) {
    return 95;
  }
  return 0;
}

function classifyLiveEventType(note) {
  const lowered = cleanText(note || '', '').toLocaleLowerCase('tr-TR');
  if (!lowered) {
    return 'update';
  }
  if (
    lowered.includes('penaltÄ±') ||
    lowered.includes('penalti') ||
    lowered.includes('penalty') ||
    lowered.includes('seri penalt')
  ) { return 'penalty'; }
  if (lowered.includes('gol')) { return 'goal'; }
  if (lowered.includes('sarÄ± kart') || lowered.includes('sari kart')) { return 'yellow'; }
  if (lowered.includes('kÄ±rmÄ±zÄ± kart') || lowered.includes('kirmizi kart')) { return 'red'; }
  if (lowered.includes('deÄŸiÅŸiklik') || lowered.includes('degisiklik')) { return 'sub'; }
  if (lowered.includes('korner') || lowered.includes('corner')) { return 'corner'; }
  if (lowered.includes('devre') || lowered.includes('half time')) { return 'halftime'; }
  if (lowered.includes('maÃ§ sonu') || lowered.includes('mac sonu') || lowered.includes('final skor') || lowered.includes('full time')) { return 'fulltime'; }
  return 'update';
}

function normalizeLiveEventType(rawType) {
  const normalized = cleanText(rawType || '', '').toLowerCase();
  if (!normalized) {
    return '';
  }
  if (['goal', 'gol'].includes(normalized)) { return 'goal'; }
  if (['yellow', 'yellow_card', 'card_yellow', 'sari', 'sarÄ±'].includes(normalized)) { return 'yellow'; }
  if (['red', 'red_card', 'card_red', 'kirmizi', 'kÄ±rmÄ±zÄ±'].includes(normalized)) { return 'red'; }
  if (['sub', 'substitution', 'degisiklik', 'deÄŸiÅŸiklik', 'change'].includes(normalized)) { return 'sub'; }
  if (['corner', 'corner_kick', 'korner'].includes(normalized)) { return 'corner'; }
  if (['penalty', 'pen', 'penalti', 'penaltÄ±', 'penalty_goal', 'penalty_missed'].includes(normalized)) { return 'penalty'; }
  if (['halftime', 'half_time', 'ht', 'iy', 'ilk_yari'].includes(normalized)) { return 'halftime'; }
  if (['fulltime', 'full_time', 'ft', 'ms', 'final'].includes(normalized)) { return 'fulltime'; }
  if (['update', 'status'].includes(normalized)) { return 'update'; }
  return normalized;
}

function resolveLiveEventSide(entry, note, preferred = 'neutral') {
  const lowered = cleanText(note || '', '').toLocaleLowerCase('tr-TR');
  const home = cleanText(entry.homeTeam, '').toLocaleLowerCase('tr-TR');
  const away = cleanText(entry.awayTeam, '').toLocaleLowerCase('tr-TR');
  if (lowered && home && lowered.includes(home)) {
    return 'home';
  }
  if (lowered && away && lowered.includes(away)) {
    return 'away';
  }
  return preferred;
}

function buildLiveCenterEventLabel(type) {
  switch (type) {
    case 'goal': return 'Gol';
    case 'yellow': return 'SarÄ± kart';
    case 'red': return 'KÄ±rmÄ±zÄ± kart';
    case 'sub': return 'Oyuncu deÄŸiÅŸikliÄŸi';
    case 'corner': return 'Korner';
    case 'penalty': return 'PenaltÄ±';
    case 'halftime': return 'Ä°lk yarÄ±';
    case 'fulltime': return 'MaÃ§ sonu';
    default: return 'CanlÄ± olay';
  }
}

function buildLiveCenterEventIcon(type) {
  switch (type) {
    case 'goal': return 'âš½';
    case 'yellow': return 'YC';
    case 'red': return 'RC';
    case 'sub': return 'â†”';
    case 'corner': return 'âš‘';
    case 'penalty': return 'PEN';
    case 'halftime': return 'HT';
    case 'fulltime': return 'MS';
    default: return 'â€¢';
  }
}

function buildLiveCenterEvents(entry) {
  const sourceEvents = Array.isArray(entry?.timelineEvents) && entry.timelineEvents.length
    ? entry.timelineEvents.slice(-24)
    : Array.isArray(entry?.goalEvents)
      ? entry.goalEvents.slice(-12)
      : [];
  const items = sourceEvents.map((item, index) => {
    const note = cleanText(item?.note || item?.message || '', 'CanlÄ± olay');
    const rawType = normalizeLiveEventType(item?.type || item?.eventType || '');
    const type = ['goal', 'yellow', 'red', 'sub', 'corner', 'penalty', 'halftime', 'fulltime', 'update'].includes(rawType)
      ? rawType
      : classifyLiveEventType(note);
    const minute = cleanText(item?.minute || '-', '-');
    const rawSide = cleanText(item?.side || '', '').toLowerCase();
    return {
      id: cleanText(item?.at || "", `event-${index}-${minute}`),
      type,
      label: buildLiveCenterEventLabel(type),
      icon: buildLiveCenterEventIcon(type),
      minute,
      minuteValue: parseEventMinuteValue(minute),
      score: cleanText(item?.score || entry?.liveScore || '-', '-'),
      note,
      side: ['home', 'away', 'neutral'].includes(rawSide)
        ? rawSide
        : resolveLiveEventSide(entry, note, type === 'goal' ? 'neutral' : 'neutral')
    };
  });

  const halftimeScore = cleanText(entry?.halftimeScore || '', '');
  if (halftimeScore && !items.some((item) => item.type === 'halftime')) {
    items.push({
      id: 'halftime',
      type: 'halftime',
      label: 'Ä°lk yarÄ±',
      icon: 'HT',
      minute: '45+',
      minuteValue: 45,
      score: halftimeScore,
      note: `Ä°lk yarÄ± ${halftimeScore} skoruyla kapandÄ±.`,
      side: 'neutral'
    });
  }

  if (getEffectiveLiveState(entry) === 'finished') {
    const finalScore = resolveDisplayedScore(entry);
    if (finalScore && !items.some((item) => item.type === 'fulltime')) {
      items.push({
        id: 'fulltime',
        type: 'fulltime',
        label: 'MaÃ§ sonu',
        icon: 'MS',
        minute: '90+',
        minuteValue: 95,
        score: `${finalScore.homeGoals}-${finalScore.awayGoals}`,
        note: `MaÃ§ ${finalScore.homeGoals}-${finalScore.awayGoals} skoruyla bitti.`,
        side: 'neutral'
      });
    }
  }

  items.sort((a, b) => a.minuteValue - b.minuteValue);
  return items;
}

function buildLiveCenterStats(entry, events) {
  const score = resolveDisplayedScore(entry);
  const totalGoals = Number(score?.homeGoals || 0) + Number(score?.awayGoals || 0);
  const yellowCards = events.filter((item) => item.type === 'yellow').length;
  const redCards = events.filter((item) => item.type === 'red').length;
  const corners = events.filter((item) => item.type === 'corner').length;
  const penalties = events.filter((item) => item.type === 'penalty').length;
  const substitutions = events.filter((item) => item.type === 'sub').length;
  const lastEvent = events.at(-1);
  return [
    {
      label: 'Goller',
      value: String(totalGoals),
      note: totalGoals ? `${totalGoals} gol iÅŸlendi.` : 'HenÃ¼z gol yok.',
      tone: 'goal'
    },
    {
      label: 'Kartlar',
      value: `${yellowCards}/${redCards}`,
      note: yellowCards || redCards ? `SarÄ± ${yellowCards} â€¢ KÄ±rmÄ±zÄ± ${redCards}` : 'Kart olayÄ± henÃ¼z yok.',
      tone: 'card'
    },
    {
      label: 'Korner',
      value: String(corners),
      note: corners ? `${corners} korner olayÄ± iÅŸlendi.` : 'Korner verisi henÃ¼z yok.',
      tone: 'corner'
    },
    {
      label: 'PenaltÄ±',
      value: String(penalties),
      note: penalties ? `${penalties} penaltÄ± olayÄ± iÅŸlendi.` : 'PenaltÄ± olayÄ± henÃ¼z yok.',
      tone: 'penalty'
    },
    {
      label: 'DeÄŸiÅŸiklik',
      value: String(substitutions),
      note: substitutions ? `${substitutions} oyuncu deÄŸiÅŸikliÄŸi iÅŸlendi.` : 'DeÄŸiÅŸiklik verisi henÃ¼z yok.',
      tone: 'sub'
    },
    {
      label: 'Son olay',
      value: lastEvent ? lastEvent.minute : '-',
      note: lastEvent ? `${lastEvent.label}: ${lastEvent.note}` : 'HenÃ¼z olay akÄ±ÅŸÄ± oluÅŸmadÄ±.',
      tone: 'summary'
    }
  ];
}

function renderLiveCenterEventBoard(entry) {
  const events = buildLiveCenterEvents(entry);
  const cards = buildLiveCenterStats(entry, events);
  const items = events.length
    ? [...events].reverse().map((item) => `
        <li class="live-center-event-item ${safeText(item.side)} ${safeText(item.type)}">
          <div class="live-center-event-minute">${safeText(item.minute)}</div>
          <div class="live-center-event-icon ${safeText(item.type)}">${safeText(item.icon)}</div>
          <div class="live-center-event-copy">
            <strong>${safeText(item.label)}</strong>
            <p>${safeText(item.note)}</p>
          </div>
          <div class="live-center-event-score">${safeText(item.score)}</div>
        </li>
      `).join('')
    : `
      <li class="live-center-event-item neutral empty">
        <div class="live-center-event-minute">-</div>
        <div class="live-center-event-icon update">â€¢</div>
        <div class="live-center-event-copy">
          <strong>Olay akÄ±ÅŸÄ± bekleniyor</strong>
          <p>Bu maÃ§ iÃ§in henÃ¼z zaman damgalÄ± olay verisi yakalanmadÄ±.</p>
        </div>
        <div class="live-center-event-score">-</div>
      </li>
    `;

  const markers = events.map((item) => {
    const left = Math.max(2, Math.min(98, item.minuteValue || 0));
    return `
      <span class="live-center-event-marker ${safeText(item.type)} ${safeText(item.side)}" style="left:${left}%">
        <i>${safeText(item.icon)}</i>
      </span>
    `;
  }).join('');

  return `
    <section class="live-center-event-board">
      <div class="live-center-event-strip">
        <div class="live-center-event-strip-head">
          <h4>Goller, kartlar ve kritik olaylar</h4>
          <span>${safeText(events.length ? `${events.length} olay iÅŸlendi` : 'HenÃ¼z olay yok')}</span>
        </div>
        <div class="live-center-event-strip-track">
          <span class="live-center-event-strip-mid"></span>
          ${markers}
        </div>
        <div class="live-center-event-strip-scale">
          <span>0'</span><span>15'</span><span>30'</span><span>45'</span><span>60'</span><span>75'</span><span>90'</span>
        </div>
      </div>

      <div class="live-center-summary-grid">
        ${cards.map((card) => `
          <article class="live-center-summary-card ${safeText(card.tone)}">
            <span>${safeText(card.label)}</span>
            <strong>${safeText(card.value)}</strong>
            <p>${safeText(card.note)}</p>
          </article>
        `).join('')}
      </div>

      <div class="live-center-event-feed">
        <div class="live-center-event-feed-head">
          <h4>Etkinlikler</h4>
          <span>CanlÄ± akÄ±ÅŸ</span>
        </div>
        <ul class="live-center-event-list">${items}</ul>
      </div>
    </section>
  `;
}
function buildLiveCenterStatusNote(entry) {
  if (getEffectiveLiveState(entry) === 'finished') {
    const finalScore = resolveDisplayedScore(entry);
    return finalScore
      ? `MaÃ§ sonu skoru ${finalScore.homeGoals}-${finalScore.awayGoals}.`
      : 'MaÃ§ sonucu iÅŸlendi.';
  }
  const halftime = cleanText(entry.halftimeScore || '', '');
  if (halftime) {
    return `Ä°lk yarÄ± skoru ${halftime}.`;
  }
  return 'Ä°lk yarÄ± skoru henÃ¼z oluÅŸmadÄ±.';
}

function renderLiveMatchCenter(entry) {
  const score = resolveDisplayedScore(entry);
  const homeScore = Number.isInteger(score?.homeGoals) ? score.homeGoals : '-';
  const awayScore = Number.isInteger(score?.awayGoals) ? score.awayGoals : '-';
  const effectiveState = getEffectiveLiveState(entry);
  const minuteLabel = effectiveState === 'finished' ? 'MS' : formatLiveHubMinute(entry);
  const statusLabel = effectiveState === 'finished' ? 'MaÃ§ sonu' : cleanText(buildTrackedStateLabel(entry), 'Takipte');
  const halftime = cleanText(entry.halftimeScore || '', '');
  const note = cleanText(entry.goalAlertMessage || entry.liveNote || entry.verdict || '', 'CanlÄ± akÄ±ÅŸ burada gÃ¶rselleÅŸtirilir.');
  const market = normalizeDisplayMarketLabel(entry.topRecommendation?.market || 'CanlÄ± izleme');
 const confidence = Number.isInteger(entry.confidenceScore) ? entry.confidenceScore : 0;
 const kickoffLine = joinMeta([entry.league, formatMatchKickoff(entry.matchDate, entry.matchTime), formatDateTime(entry.lastSyncedAt || entry.analyzedAt)]);
  const timelineMinute = effectiveState === 'finished' ? 90 : Math.max(0, Math.min(parseTrackedMinuteLabel(entry?.liveStatusLabel || ''), 90));
  return `
    <section class="live-center-card">
      <div class="live-center-hero">
        <div class="live-center-scoreboard">
          <div class="live-center-side home">
            ${renderTeamLogo(entry, 'home')}
            <strong>${safeText(entry.homeTeam)}</strong>
            <small>Ev sahibi</small>
          </div>
          <div class="live-center-middle">
            <span class="live-center-minute">${safeText(minuteLabel)}</span>
            <div class="live-center-score"><strong>${safeText(String(homeScore))}</strong><span>-</span><strong>${safeText(String(awayScore))}</strong></div>
            <div class="live-center-meta">
              <span class="history-chip">${safeText(statusLabel)}</span>
              <span class="history-chip">Ana Ã¶neri: ${safeText(market)}</span>
              <span class="history-chip">GÃ¼ven %${safeText(String(confidence))}</span>
              ${halftime ? `<span class="history-chip">Ä°Y ${safeText(halftime)}</span>` : ''}
            </div>
          </div>
          <div class="live-center-side away">
            ${renderTeamLogo(entry, 'away')}
            <strong>${safeText(entry.awayTeam)}</strong>
            <small>Deplasman</small>
          </div>
        </div>

        <div class="live-center-timeline">
          <div class="live-center-timeline-scale">
            <span>0</span><span>15</span><span>30</span><span>45</span><span>60</span><span>75</span><span>90</span>
          </div>
          <div class="live-center-timeline-track">
            <span class="live-center-timeline-progress" style="width:${timelineMinute}%"></span>
            <span class="live-center-timeline-dot" style="left:${timelineMinute}%"></span>
          </div>
        </div>
      </div>

      

      ${renderLiveCenterEventBoard(entry)}
      <div class="live-center-insights">
        <article class="live-center-metric">
          <span>AnlÄ±k okuma</span>
          <strong>${safeText(market)}</strong>
          <p>${safeText(note)}</p>
        </article>
        <article class="live-center-metric">
          <span>GÃ¼ncelleme</span>
          <strong>${safeText(kickoffLine)}</strong>
          <p>${safeText(buildLiveCenterStatusNote(entry))}</p>
        </article>
      </div>
    </section>
  `;
}

function formatLiveHubMinute(entry) {
  const state = String(getEffectiveLiveState(entry) || '').toLowerCase();
  const statusLabel = cleanText(entry?.liveStatusLabel || '', '');
  if (state === 'live') {
    return statusLabel || 'CanlÄ±';
  }
  if (state === 'halftime') {
    return 'Devre';
  }
  if (state === 'finished') {
    return 'MS';
  }
  if (state === 'scheduled') {
    return entry?.matchTime || statusLabel || '-';
  }
  return statusLabel || '-';
}

function buildTeamInitials(teamName) {
  const words = String(teamName || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) {
    return 'TA';
  }
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return `${words[0][0] || ''}${words[1][0] || ''}`.toUpperCase();
}

function buildMackolikLogoUrl(teamId, size = 'buyuk') {
  if (!Number.isInteger(teamId) || teamId <= 0) {
    return '';
  }
  const folder = size === 'kucuk' ? 'kucuk' : 'buyuk';
  return `https://im.mackolik.com/img/logo/${folder}/${teamId}.gif`;
}

function normalizeTeamLookupKey(value) {
  return normalizeTurkishText(value || '')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function findCachedTeamLogoUrl(teamName, side = 'home') {
  const target = normalizeTeamLookupKey(teamName);
  if (!target) {
    return '';
  }
  const entries = loadHistory();
  for (const entry of entries) {
    const homeKey = normalizeTeamLookupKey(entry.homeTeam);
    const awayKey = normalizeTeamLookupKey(entry.awayTeam);
    if (side === 'home' && homeKey === target && entry.homeLogoUrl) {
      return cleanText(entry.homeLogoUrl, '');
    }
    if (side === 'away' && awayKey === target && entry.awayLogoUrl) {
      return cleanText(entry.awayLogoUrl, '');
    }
    if (homeKey === target && entry.homeLogoUrl) {
      return cleanText(entry.homeLogoUrl, '');
    }
    if (awayKey === target && entry.awayLogoUrl) {
      return cleanText(entry.awayLogoUrl, '');
    }
  }
  return '';
}

function resolveTeamLogo(entry, side) {
  const teamName = side === 'home' ? entry.homeTeam : entry.awayTeam;
  const teamId = side === 'home' ? entry.homeTeamId : entry.awayTeamId;
  const providedUrl = cleanText(side === 'home' ? entry.homeLogoUrl || '' : entry.awayLogoUrl || '', '').trim();
  const cachedUrl = findCachedTeamLogoUrl(teamName, side);
  const mackolikBig = buildMackolikLogoUrl(teamId, 'buyuk');
  const mackolikSmall = buildMackolikLogoUrl(teamId, 'kucuk');
  const primary = mackolikBig || providedUrl || cachedUrl;
  const fallback = mackolikSmall || cachedUrl || providedUrl;
  return { primary, fallback };
}

function renderTeamLogo(entry, side) {
  const teamName = side === 'home' ? entry.homeTeam : entry.awayTeam;
  const initials = buildTeamInitials(teamName);
  const logos = resolveTeamLogo(entry, side);
  if (!logos.primary) {
    return `<span class="live-hub-logo-fallback">${safeText(initials)}</span>`;
  }

  const fallbackAttr = logos.fallback ? ` data-fallback="${escapeHtml(logos.fallback)}"` : '';
  return `
    <span class="live-hub-logo-wrap">
      <img class="live-hub-logo" src="${escapeHtml(logos.primary)}" alt="${safeText(teamName)} logosu"${fallbackAttr} loading="lazy" />
      <span class="live-hub-logo-fallback">${safeText(initials)}</span>
    </span>
  `;
}

function wireLiveHubLogos(container) {
  if (!container) {
    return;
  }
  const images = container.querySelectorAll('.live-hub-logo');
  images.forEach((img) => {
    const showFallback = () => {
      img.classList.add('hidden');
      const placeholder = img.nextElementSibling;
      if (placeholder && placeholder.classList.contains('live-hub-logo-fallback')) {
        placeholder.classList.remove('hidden');
      }
    };

    const hideFallback = () => {
      const placeholder = img.nextElementSibling;
      if (placeholder && placeholder.classList.contains('live-hub-logo-fallback')) {
        placeholder.classList.add('hidden');
      }
      img.classList.remove('hidden');
    };

    img.addEventListener('error', () => {
      const fallback = img.dataset.fallback || '';
      if (!img.dataset.fallbackTried && fallback && img.src !== fallback) {
        img.dataset.fallbackTried = '1';
        img.src = fallback;
        return;
      }
      showFallback();
    });

    img.addEventListener('load', hideFallback);

    if (img.complete) {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        hideFallback();
      } else {
        showFallback();
      }
    } else {
      showFallback();
    }
  });
}
function isRecentGoalAlert(entry) {
  const raw = String(entry?.goalAlertAt || '').trim();
  if (!raw) {
    return false;
  }
  const timestamp = Date.parse(raw);
  if (Number.isNaN(timestamp)) {
    return false;
  }
  return Date.now() - timestamp <= GOAL_ALERT_WINDOW_MS;
}

function renderLiveHubMatchRow(entry) {
  const score = resolveDisplayedScore(entry);
  const homeScore = Number.isInteger(score?.homeGoals) ? score.homeGoals : '-';
  const awayScore = Number.isInteger(score?.awayGoals) ? score.awayGoals : '-';
  const minuteLabel = formatLiveHubMinute(entry);
  const goalAlertActive = isRecentGoalAlert(entry);
  const goalAlertMessage = cleanText(entry.goalAlertMessage || '', '');
  const statusLabel = cleanText(buildTrackedStateLabel(entry), 'Takipte');
  const effectiveState = getEffectiveLiveState(entry);
  const stateClass = effectiveState === 'live'
    ? 'live'
    : effectiveState === 'halftime'
      ? 'halftime'
      : effectiveState === 'finished'
        ? 'finished'
        : 'waiting';
  const halftimeLine = cleanText(entry.halftimeScore || '', '');

  return `
    <article class="live-hub-row ${goalAlertActive ? 'goal' : ''}" data-history-id="${escapeHtml(entry.id)}">
      <div class="live-hub-mainline">
        <div class="live-hub-team home">
          <strong>${safeText(entry.homeTeam)}</strong>
          <small>Ev sahibi</small>
        </div>

        <div class="live-hub-center" aria-label="Skor ve dakika">
          <span class="live-hub-time-badge">${safeText(minuteLabel)}</span>
          <div class="live-hub-logo-row">
            ${renderTeamLogo(entry, 'home')}
            <div class="live-hub-scoreline">
              <strong>${safeText(String(homeScore))}</strong>
              <span>-</span>
              <strong>${safeText(String(awayScore))}</strong>
            </div>
            ${renderTeamLogo(entry, 'away')}
          </div>
          <div class="live-hub-meta-row">
            <span class="live-hub-state ${stateClass}">${safeText(statusLabel)}</span>
            ${halftimeLine ? `<span class="live-hub-half-score">Ä°Y ${safeText(halftimeLine)}</span>` : ''}
          </div>
        </div>

        <div class="live-hub-team away">
          <strong>${safeText(entry.awayTeam)}</strong>
          <small>Deplasman</small>
        </div>

        <div class="live-hub-row-actions">
          <button class="ghost-btn tiny-btn" type="button" data-live-hub-action="focus-match">AÃ§</button>
          <button class="ghost-btn tiny-btn" type="button" data-live-hub-action="refresh-match">Yenile</button>
          <button class="ghost-btn tiny-btn live-remove-btn" type="button" data-live-hub-action="remove-match">Ã‡Ä±kar</button>
        </div>
      </div>
      ${goalAlertActive ? `
        <div class="live-hub-goal-note">
          <span class="goal-alert-dot" aria-hidden="true"></span>
          <span>${safeText(goalAlertMessage || 'Gol bildirimi')}</span>
        </div>
      ` : ''}
    </article>
  `;
}

function renderLiveHub(entries) {
  if (!liveHubContent) {
    return;
  }

  const trackedEntries = (entries || []).filter((entry) => entry.tracked);
  if (!trackedEntries.length) {
    liveHubContent.innerHTML = '<div class="empty-state compact-empty"><p>Takipte maÃ§ yok.</p></div>';
    normalizeDomContent(liveHubContent);
    return;
  }

  const groups = new Map();
  for (const entry of trackedEntries) {
    const league = cleanText(entry.league || '', '').trim() || 'DiÄŸer ligler';
    if (!groups.has(league)) {
      groups.set(league, []);
    }
    groups.get(league).push(entry);
  }

  const sections = Array.from(groups.entries()).map(([league, items]) => {
    const sortedItems = [...items].sort((a, b) => {
      const aLive = a.liveState === 'live' ? 0 : a.liveState === 'halftime' ? 1 : 2;
      const bLive = b.liveState === 'live' ? 0 : b.liveState === 'halftime' ? 1 : 2;
      if (aLive !== bLive) {
        return aLive - bLive;
      }
      return parseTrackedMinuteLabel(b.liveStatusLabel) - parseTrackedMinuteLabel(a.liveStatusLabel);
    });

    return `
      <section class="live-hub-league-block">
        <div class="live-hub-league-head">
          <h4>${safeText(league)}</h4>
          <span class="source-pill strong">${sortedItems.length} maÃ§</span>
        </div>
        <div class="live-hub-match-list">
          ${sortedItems.map(renderLiveHubMatchRow).join('')}
        </div>
      </section>
    `;
  });

  setNormalizedHtml(liveHubContent, sections.join(''));
  normalizeDomContent(liveHubContent);
  wireLiveHubLogos(liveHubContent);
}

function focusHistoryCard(id) {
  if (!id || !historyContent) {
    return;
  }
  const escapedId = typeof CSS !== 'undefined' && CSS.escape ? CSS.escape(String(id)) : String(id).replace(/"/g, '\\"');
  const card = historyContent.querySelector(`[data-history-id="${escapedId}"]`);
  if (!card) {
    return;
  }
  card.classList.add('focus-pulse');
  card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  window.setTimeout(() => card.classList.remove('focus-pulse'), 1600);
}

function handleLiveHubActions(event) {
  const button = event.target.closest('[data-live-hub-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.liveHubAction;
  const row = button.closest('[data-history-id]');
  const id = row?.dataset?.historyId;
  if (!id) {
    return;
  }

  if (action === 'focus-match') {
    const entries = loadHistory();
    const entry = entries.find((item) => item.id === id);
    if (entry) {
      setLiveMatchCenterOpen(entry);
    }
    return;
  }

  if (action === 'refresh-match') {
    refreshTrackedMatches(false, [id]);
    return;
  }

  if (action === 'remove-match') {
    const entries = loadHistory();
    const updated = entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            tracked: false
          }
        : entry
    );
    persistHistory(updated);
    renderHistory(updated);
    setStatus('MaÃ§ canlÄ± takip listesinden Ã§Ä±karÄ±ldÄ±.', 'ok');
  }
}
function buildHistoryMarketOptions(entry) {
  const seen = new Set();
  const options = [];
  const pushMarket = (value) => {
    const label = normalizeDisplayMarketLabel(value || '').trim();
    if (!label || isGenericMarketLabel(label) || /^pazar(?: yok)?$/i.test(label) || /^belirsiz$/i.test(label)) {
      return;
    }
    const key = label.toLocaleLowerCase('tr-TR');
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    options.push(label);
  };

  pushMarket(entry?.topRecommendation?.market);
  for (const item of entry?.recommendations ?? []) {
    pushMarket(item?.market);
  }
  if (entry?.playedMarket) {
    pushMarket(entry.playedMarket);
  }
  return options;
}

function renderHistoryMarketOptions(entry) {
  const options = buildHistoryMarketOptions(entry);
  if (!options.length) {
    return '';
  }

  const current = normalizeTurkishText(entry.playedMarket || '').trim();
  return options.map((market) => `<option value="${escapeHtml(market)}" ${market === current ? 'selected' : ''}>${safeText(market)}</option>`).join('');
}

function renderHistorySection(title, detail, entries, kind) {
  return `
    <section class="history-section history-section-${escapeHtml(kind)}">
      <div class="scan-section-head history-section-head">
        <div>
          <h3>${safeText(title)}</h3>
          <p>${safeText(detail)}</p>
        </div>
        <span class="source-pill ${kind === 'tracked' ? 'strong' : 'limited'}">${safeText(kind === 'tracked' ? `Takipte ${entries.length}` : `KayÄ±t ${entries.length}`)}</span>
      </div>
      ${entries.length ? `<div class="history-list">${entries.map(renderHistoryCard).join('')}</div>` : `<div class="scan-empty">${safeText(kind === 'tracked' ? 'Takip listesi ÅŸu an boÅŸ.' : 'ArÅŸivde gÃ¶sterilecek kayÄ±t yok.')}</div>`}
    </section>
  `;
}

function buildTrackedQuickSummary(entry, evaluation) {
  if (evaluation?.summary) {
    return compactText(evaluation.summary, 88);
  }

  const market = normalizeDisplayMarketLabel(entry.topRecommendation?.market || 'Belirsiz');
  const confidence = Number(entry.confidenceScore) || 0;
  const stateLabel = buildTrackedStateLabel(entry);
  return `${market} â€¢ GÃ¼ven %${confidence} â€¢ ${stateLabel}`;
}

function renderHistoryCard(entry) {
  const evaluation = evaluateHistoryEntry(entry);
  const sourceStatus = entry.sourceStatus ?? { label: 'Kaynak yok', health: 'limited' };
  const manualResult = entry.result;
  const autoScore = getEffectiveLiveState(entry) === 'finished' ? entry.liveScore : null;
  const baseScore = manualResult ?? autoScore ?? null;
  const homeValue = baseScore ? String(baseScore.homeGoals) : '';
  const awayValue = baseScore ? String(baseScore.awayGoals) : '';
  const outcomeClass = historyStateClass(entry, evaluation);
  const outcomeText = evaluation
    ? evaluation.summary
    : entry.tracked
      ? 'Takipte. CanlÄ± skor ve maÃ§ sonu sonucu geldikÃ§e kart otomatik gÃ¼ncellenir.'
      : 'Bu kaydÄ± takibe alÄ±rsan canlÄ± skor ve maÃ§ sonu sonucu otomatik izlenir.';
  const verdictText = buildHistoryVerdict(entry);
  const liveScore = resolveDisplayedScore(entry);
  const scoreLine = liveScore ? `${liveScore.homeGoals}-${liveScore.awayGoals}` : '-';
  const liveLabel = buildHistoryStateLabel(entry);
  const liveMetaRaw = buildHistoryStateMeta(entry, evaluation);
  const liveMeta = entry.tracked ? compactText(liveMetaRaw, 96) : liveMetaRaw;
  const summaryLine = entry.tracked
    ? buildTrackedQuickSummary(entry, evaluation)
    : compactText(evaluation?.summary || verdictText, 110);
  const playedMarket = normalizeDisplayMarketLabel(entry.playedMarket || '').trim();
  const validPlayedMarket = !isGenericMarketLabel(playedMarket) ? playedMarket : '';
  const playedMarketOptions = renderHistoryMarketOptions(entry);
  const goalAlertActive = isRecentGoalAlert(entry);
  const goalAlertMessage = cleanText(entry.goalAlertMessage || '', '');
  const trackedStateLabel = buildTrackedStateLabel(entry);
  const trackedLiveActive = entry.liveState === 'live' || entry.liveState === 'halftime';

  return `
    <article class="history-card ${entry.tracked ? 'tracked-card' : ''} ${goalAlertActive ? 'goal-alert-active' : ''}" data-history-id="${escapeHtml(entry.id)}">
      <div class="mini-top history-card-head">
        <div>
          <h4>${safeText(entry.homeTeam)} vs ${safeText(entry.awayTeam)}</h4>
          <p class="history-meta">${safeText(joinMeta([entry.league, formatMatchKickoff(entry.matchDate, entry.matchTime), formatDateTime(entry.analyzedAt)]))}</p>
        </div>
        <div class="history-head-badges">
          <span class="source-pill ${escapeHtml(sourceStatus.health || 'limited')}">${safeText(cleanSourceLabel(sourceStatus.label, sourceStatus))}</span>
          ${entry.tracked ? '<span class="source-pill strong">Takipte</span>' : ''}
        </div>
      </div>

      <div class="history-tags compact-history-tags">
        <span class="history-chip">Ana Ã¶neri: ${safeText(normalizeDisplayMarketLabel(entry.topRecommendation?.market || 'Yok'))}</span>
        <span class="history-chip">GÃ¼ven: %${entry.confidenceScore}</span>
        ${validPlayedMarket ? `<span class="history-chip">Benim kuponum: ${safeText(validPlayedMarket)}</span>` : ''}
        ${!entry.tracked && entry.liveStatusLabel ? `<span class="history-chip">Durum: ${safeText(entry.liveStatusLabel)}</span>` : ''}
      </div>

      <p class="history-summary">${safeText(summaryLine)}</p>

      <div class="history-live-box ${escapeHtml(outcomeClass)}">
        ${entry.tracked ? `
          <div class="tracked-live-strip">
            <div class="tracked-live-state ${trackedLiveActive ? 'active' : ''}">
              ${trackedLiveActive ? '<span class="live-dot inline-live-dot"></span>' : ''}
              <span>${safeText(trackedStateLabel)}</span>
            </div>
            ${goalAlertActive ? `
              <div class="goal-alert-pill">
                <span class="goal-alert-dot" aria-hidden="true"></span>
                <span>${safeText(goalAlertMessage || 'Gol bildirimi')}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}
        <div class="history-live-copy">
          <span class="history-live-kicker">MaÃ§ durumu</span>
          <strong class="history-live-title">${safeText(liveLabel)}</strong>
          <p>${safeText(liveMeta)}</p>
          ${entry.halftimeScore ? `<p class="history-half-score">Ä°Y skoru: ${safeText(entry.halftimeScore)}</p>` : ''}
        </div>
        <div class="history-live-score compact-live-score">
          <span>${safeText(entry.homeTeam)}</span>
          <strong>${safeText(scoreLine)}</strong>
          <span>${safeText(entry.awayTeam)}</span>
        </div>
      </div>

      <div class="history-actions compact-history-actions">
        <button class="ghost-btn history-action-btn history-track-btn" type="button" data-action="toggle-track">${entry.tracked ? 'Takipten Ã‡Ä±kar' : 'Takibe Al'}</button>
        ${entry.tracked ? '<button class="ghost-btn history-action-btn history-refresh-btn" type="button" data-action="refresh-live">CanlÄ±yÄ± GÃ¼ncelle</button>' : ''}
        <button class="ghost-btn history-action-btn history-delete-btn danger" type="button" data-action="delete-entry">KaydÄ± Sil</button>
      </div>

      <div class="history-market-row">
        <label class="score-input-wrap history-market-wrap">
          <span>Benim oynadÄ±ÄŸÄ±m market</span>
          <select class="text-input select-input history-market-select" data-market-select>
            <option value="">SeÃ§im yap</option>
            ${playedMarketOptions}
          </select>
        </label>
        <label class="score-input-wrap history-market-wrap history-market-custom-wrap">
          <span>Serbest giriÅŸ</span>
          <input class="text-input history-market-custom-input" data-market-custom type="text" value="" placeholder="Ã–rnek: Ä°lk YarÄ± 0.5 Ãœst" />
        </label>
        <button class="ghost-btn history-market-btn" type="button" data-action="save-played-market">Kuponumu Kaydet</button>
      </div>

      <div class="history-score-row compact-history-score-row">
        <label class="score-input-wrap">
          <span>${safeText(entry.homeTeam)}</span>
          <input class="history-score-input" data-score-side="home" type="number" min="0" max="20" value="${escapeHtml(homeValue)}" />
        </label>
        <span class="score-separator">-</span>
        <label class="score-input-wrap">
          <span>${safeText(entry.awayTeam)}</span>
          <input class="history-score-input" data-score-side="away" type="number" min="0" max="20" value="${escapeHtml(awayValue)}" />
        </label>
        <button class="ghost-btn history-save-btn" type="button" data-action="save-result">${manualResult ? 'Sonucu GÃ¼ncelle' : 'Sonucu Kaydet'}</button>
      </div>

      <div class="history-outcome ${outcomeClass}">${safeText(outcomeText)}</div>
    </article>
  `;
}

function autoTrackScanSelections(scan) {
  if (!scan?.couponPackages?.length) {
    return;
  }
  trackCouponPackage(0, scan, true);
}

function handleSummaryActions(event) {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  if (action === 'track-coupon') {
    const index = Number.parseInt(button.dataset.couponIndex, 10);
    if (!Number.isInteger(index)) {
      return;
    }
    trackCouponPackage(index);
    return;
  }

  if (action === 'track-analysis') {
    trackCurrentAnalysis();
    return;
  }

  if (action === 'track-scan-pick') {
    const rank = Number.parseInt(button.dataset.rank, 10);
    const variant = button.dataset.variant || 'top';
    if (!Number.isInteger(rank)) {
      return;
    }
    trackScanPick(rank, variant);
    return;
  }

  if (action === 'track-live-match') {
    const index = Number.parseInt(button.dataset.liveIndex, 10);
    if (!Number.isInteger(index)) {
      return;
    }
    trackLivePick(index);
    return;
  }

  if (action === 'analyze-live-match') {
    const index = Number.parseInt(button.dataset.liveIndex, 10);
    if (!Number.isInteger(index) || !latestLiveScanData?.picks?.[index]) {
      return;
    }
    const pick = latestLiveScanData.picks[index];
    const detailUrl = cleanText(pick.detailUrl || '', '').trim();
    if (!detailUrl || !/^https?:\/\//i.test(detailUrl)) {
      setStatus('Detay analiz baÄŸlantÄ±sÄ± bu maÃ§ iÃ§in bulunamadÄ±.', 'warn');
      return;
    }
    matchUrlInput.value = detailUrl;
    void handleAnalyze();
    return;
  }
}

function trackCurrentAnalysis() {
  if (!latestAnalysisData) {
    setStatus('Analiz kartÄ± bulunamadÄ±.', 'warn');
    return;
  }

  saveAnalysisToHistory(latestAnalysisUrl || matchUrlInput.value.trim(), latestAnalysisData, {
    tracked: true,
    trackingSource: 'Analiz Ã¶zeti'
  });
  const matchInfo = latestAnalysisData.matchInfo ?? {};
  setStatus(`${matchInfo.homeTeam || 'MaÃ§'} - ${matchInfo.awayTeam || ''} takibe alÄ±ndÄ±.`, 'ok');
  renderAnalysis(latestAnalysisData);
}

function trackScanPick(rank, variant = 'top') {
  const pool = variant === 'avoid'
    ? latestScanData?.avoidPicks ?? []
    : latestScanData?.topPicks ?? [];
  const pick = pool.find((item) => item.rank === rank);
  if (!pick?.analysis) {
    setStatus('Tarama kartÄ± bulunamadÄ±.', 'warn');
    return;
  }

  saveAnalysisToHistory(pick.detailUrl, pick.analysis, {
    tracked: true,
    trackingSource: variant === 'avoid' ? 'Tarama Ã¶zeti - uzak dur' : 'Tarama Ã¶zeti'
  });
  const matchInfo = pick.analysis.matchInfo ?? {};
  setStatus(`${matchInfo.homeTeam || 'MaÃ§'} - ${matchInfo.awayTeam || ''} takibe alÄ±ndÄ±.`, 'ok');
  if (latestScanData) {
    renderDailyScan(latestScanData);
  }
}

function trackLivePick(index, liveData = latestLiveScanData) {
  const pick = liveData?.picks?.[index];
  if (!pick?.analysis) {
    setStatus('CanlÄ± maÃ§ kartÄ± bulunamadÄ±.', 'warn');
    return;
  }

  saveAnalysisToHistory(pick.detailUrl, pick.analysis, {
    tracked: true,
    trackingSource: 'CanlÄ± maÃ§ sorgusu',
    analysisMode: 'live',
    capturedMinuteLabel: cleanText(pick.minuteLabel || pick.trackedStatus?.statusLabel || '', ''),
    capturedScore: cleanText(pick.liveScore || '', ''),
    halftimeScore: cleanText(pick.halftimeScore || pick.trackedStatus?.halftimeScore || '', '')
  });
  setStatus(`${pick.analysis.matchInfo?.homeTeam || 'MaÃ§'} - ${pick.analysis.matchInfo?.awayTeam || ''} takibe alÄ±ndÄ±.`, 'ok');
}

function trackCouponPackage(index, scan = latestScanData, silent = false) {
  if (!scan?.couponPackages?.[index]) {
    if (!silent) {
      setStatus('Kupon paketi bulunamadÄ±.', 'warn');
    }
    return;
  }

  const coupon = scan.couponPackages[index];
  const picks = [...(scan.topPicks ?? []), ...(scan.avoidPicks ?? [])];
  let trackedCount = 0;

  for (const leg of coupon.legs ?? []) {
    const normalizedLeg = normalizeTeamKey(leg.matchLabel || '');
    const pick = picks.find((item) => {
      const label = `${item.analysis?.matchInfo?.homeTeam || ''} - ${item.analysis?.matchInfo?.awayTeam || ''}`;
      return normalizeTeamKey(label) === normalizedLeg;
    });

    if (!pick?.analysis) {
      continue;
    }

    saveAnalysisToHistory(pick.detailUrl, pick.analysis, {
      tracked: true,
      trackingSource: coupon.title
    });
    trackedCount += 1;
  }

  if (!silent) {
    setStatus(trackedCount ? `${coupon.title} takibe alÄ±ndÄ±. ${trackedCount} ayak canlÄ± izlenecek.` : 'Kupon iÃ§in izlenecek ayak bulunamadÄ±.', trackedCount ? 'ok' : 'warn');
  }
}

async function handleHistoryActions(event) {
  const button = event.target.closest('[data-action]');
  if (!button) {
    return;
  }

  const action = button.dataset.action;
  const card = button.closest('[data-history-id]');
  if (!card) {
    return;
  }

  const id = card.dataset.historyId;
  const entries = loadHistory();
  const target = entries.find((entry) => entry.id === id);
  if (!target) {
    return;
  }

  if (action === 'delete-entry') {
    const updated = entries.filter((entry) => entry.id !== id);
    persistHistory(updated);
    renderHistory(updated);
    setStatus('KayÄ±t geÃ§miÅŸten kaldÄ±rÄ±ldÄ±.', 'ok');
    return;
  }

  if (action === 'save-played-market') {
    const marketSelect = card.querySelector('[data-market-select]');
    const marketCustomInput = card.querySelector('[data-market-custom]');
    const playedMarketRaw = normalizeTurkishText(marketCustomInput?.value || marketSelect?.value || '').trim();
    const playedMarket = isGenericMarketLabel(playedMarketRaw) ? '' : normalizeDisplayMarketLabel(playedMarketRaw);
    const updated = entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            playedMarket: playedMarket || null
          }
        : entry
    );
    persistHistory(updated);
    renderHistory(updated);
    setStatus(playedMarket ? 'Benim oynadÄ±ÄŸÄ±m market kaydedildi.' : 'KayÄ±tlÄ± kupon marketi temizlendi.', 'ok');
    return;
  }

  if (action === 'toggle-track') {
    const nextTracked = !target.tracked;
    const updated = entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            tracked: nextTracked,
            ...(nextTracked
              ? {
                  autoClosedAt: null,
                  matchcastUrl: '',
                  ...(entry.result?.source !== 'manual' ? { result: null } : {}),
                  ...(entry.liveState === 'finished' ? { liveState: 'scheduled', liveStatusLabel: entry.matchTime || 'BaÅŸlama bekleniyor', liveScore: null, halftimeScore: '' } : {})
                }
              : {})
          }
        : entry
    );
    persistHistory(updated);
    renderHistory(updated);
    setStatus(nextTracked ? 'MaÃ§ takibe alÄ±ndÄ±. CanlÄ± skor ve maÃ§ sonu sonucu gÃ¼ncellenecek.' : 'MaÃ§ takip listesinden Ã§Ä±karÄ±ldÄ±.', 'ok');
    if (nextTracked) {
      await refreshTrackedMatches(true, [id]);
    }
    return;
  }

  if (action === 'refresh-live') {
    await refreshTrackedMatches(false, [id]);
    return;
  }

  if (action !== 'save-result') {
    return;
  }

  const homeInput = card.querySelector('[data-score-side="home"]');
  const awayInput = card.querySelector('[data-score-side="away"]');
  const homeGoals = Number.parseInt(homeInput.value, 10);
  const awayGoals = Number.parseInt(awayInput.value, 10);

  if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
    setStatus('Final skor iÃ§in iki tarafa da geÃ§erli sayÄ± girmelisin.', 'warn');
    return;
  }

  const updated = entries.map((entry) =>
    entry.id === id
      ? {
          ...entry,
          result: {
            homeGoals,
            awayGoals,
            savedAt: new Date().toISOString(),
            source: 'manual'
          }
        }
      : entry
  );

  persistHistory(updated);
  renderHistory(updated);
  setStatus('Final skor kaydedildi. Tahmin isabeti gÃ¼ncellendi.', 'ok');
}

function collectNewGoalAlerts(previousEntries, updatedEntries) {
  const previousMap = new Map((previousEntries || []).map((entry) => [entry.id, entry]));
  return (updatedEntries || [])
    .filter((entry) => {
      if (!entry?.tracked || !entry.goalAlertAt || !isRecentGoalAlert(entry)) {
        return false;
      }
      const previous = previousMap.get(entry.id);
      return previous?.goalAlertAt !== entry.goalAlertAt;
    })
    .map((entry) => ({
      id: entry.id,
      homeTeam: entry.homeTeam,
      awayTeam: entry.awayTeam,
      score: resolveDisplayedScore(entry),
      minuteLabel: cleanText(entry.liveStatusLabel || '', ''),
      message: cleanText(entry.goalAlertMessage || 'Gol bildirimi', 'Gol bildirimi')
    }));
}

function notifyGoalEvents(alerts) {
  if (!alerts?.length) {
    return;
  }

  alerts.forEach((alert, index) => {
    window.setTimeout(() => {
      showGoalToast(alert);
      playGoalNotificationSound();
    }, index * 220);
  });
}

function showGoalToast(alert) {
  if (!goalToastRoot) {
    return;
  }

  const scoreText = Number.isInteger(alert?.score?.homeGoals) && Number.isInteger(alert?.score?.awayGoals)
    ? `${alert.score.homeGoals}-${alert.score.awayGoals}`
    : '-';
  const matchLine = `${cleanText(alert.homeTeam, 'Ev sahibi')} vs ${cleanText(alert.awayTeam, 'Deplasman')}`;
  const rawMessage = cleanText(alert?.message || 'Gol bildirimi', 'Gol bildirimi');
  const titleMatch = rawMessage.match(/^Gol:\s*(.+?)(?:\s*[â€¢\uFFFD]\s*|$)/i);
  const title = titleMatch ? titleMatch[1] : 'Gol oldu';
  const detail = titleMatch ? rawMessage.replace(/^Gol:\s*.+?(?:\s*[â€¢\uFFFD]\s*)?/i, '') : rawMessage;
  const minuteText = cleanText(alert?.minuteLabel || '', '');

  const toast = document.createElement('div');
  toast.className = 'goal-toast';
  toast.innerHTML = `
    <span class="goal-toast-kicker">CANLI GOL</span>
    <strong>${safeText(title)}</strong>
    <p class="goal-toast-match">${safeText(matchLine)}</p>
    <p class="goal-toast-meta">${safeText(detail)}${minuteText ? ` â€¢ ${safeText(minuteText)}` : ''} â€¢ Skor ${safeText(scoreText)}</p>
  `;

  goalToastRoot.appendChild(toast);
  while (goalToastRoot.childElementCount > 5) {
    goalToastRoot.firstElementChild?.remove();
  }
  window.setTimeout(() => toast.classList.add('hide'), 9200);
  window.setTimeout(() => toast.remove(), 10000);
}

function playGoalNotificationSound() {
  if (typeof window === 'undefined') {
    return;
  }

  const Context = window.AudioContext || window.webkitAudioContext;
  if (!Context) {
    return;
  }

  try {
    if (!goalAudioContext) {
      goalAudioContext = new Context();
    }

    if (goalAudioContext.state === 'suspended') {
      goalAudioContext.resume().catch(() => {});
    }

    const now = goalAudioContext.currentTime;
    const gainNode = goalAudioContext.createGain();
    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.connect(goalAudioContext.destination);

    const notes = [740, 988];
    notes.forEach((freq, index) => {
      const osc = goalAudioContext.createOscillator();
      const noteStart = now + index * 0.12;
      const noteEnd = noteStart + 0.1;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);
      osc.connect(gainNode);
      gainNode.gain.setValueAtTime(0.0001, noteStart);
      gainNode.gain.linearRampToValueAtTime(0.14, noteStart + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, noteEnd);
      osc.start(noteStart);
      osc.stop(noteEnd + 0.02);
    });
  } catch (error) {
    console.debug('Sesli gol bildirimi devreye alÄ±namadÄ±:', error);
  }
}

async function refreshTrackedMatches(silent = false, targetIds = null) {
  const entries = loadHistory();
  const trackedEntries = entries.filter((entry) => entry.tracked && (!targetIds || targetIds.includes(entry.id)));
  if (!trackedEntries.length) {
    if (!silent) {
      setStatus('Takipte gÃ¼ncellenecek maÃ§ yok.', 'warn');
    }
    return;
  }

  if (!silent) {
    setStatus('Takipteki maÃ§larÄ±n canlÄ± skoru gÃ¼ncelleniyor...', 'normal');
  }

  try {
    const response = await invoke('refresh_tracked_matches', {
      matches: trackedEntries.map((entry) => ({
        id: entry.id,
        homeTeam: entry.homeTeam,
        awayTeam: entry.awayTeam,
        matchDate: entry.matchDate,
        matchTime: entry.matchTime || '',
        league: entry.league,
        url: entry.url || '',
        mackolikMatchPageId: Number.isInteger(entry.mackolikMatchPageId) ? entry.mackolikMatchPageId : null,
        matchcastId: Number.isInteger(entry.matchcastId) ? entry.matchcastId : null
      })),
      data: buildDataPayload()
    });
    const statuses = sanitizePayload(response);
    updateLiveDiagnostics(statuses, trackedEntries);
    const updated = mergeTrackedStatuses(entries, statuses);
    const freshGoalAlerts = collectNewGoalAlerts(entries, updated);
    persistHistory(updated);
    renderHistory(updated);
    if (freshGoalAlerts.length) {
      notifyGoalEvents(freshGoalAlerts);
    }
    if (!silent) {
      setStatus('Takipteki maÃ§larÄ±n canlÄ± skor bilgisi gÃ¼ncellendi.', 'ok');
    }
  } catch (error) {
    console.error(error);
    if (!silent) {
      setStatus(`CanlÄ± skor gÃ¼ncellenemedi: ${normalizeErrorMessage(error, 'CanlÄ± skor akÄ±ÅŸÄ± yanÄ±t vermedi')}`, 'error');
    }
  }
}

function syncLiveMatchCenter(entries) {
  if (!liveMatchCenterEntryId || !liveMatchCenterDrawer || liveMatchCenterDrawer.classList.contains('hidden')) {
    return;
  }

  const activeEntry = entries.find((entry) => entry.id === liveMatchCenterEntryId);
  if (!activeEntry) {
    void setLiveMatchCenterOpen(null);
    return;
  }

  void setLiveMatchCenterOpen(activeEntry);
}

function parseTrackedMinuteLabel(value) {
  const match = String(value || '').match(/(\d{1,3})/);
  return match ? Number.parseInt(match[1], 10) : 0;
}

function buildTrackedStateLabel(entry) {
  const statusLabel = cleanText(entry?.liveStatusLabel || '', '');
  switch (getEffectiveLiveState(entry)) {
    case 'live':
      return statusLabel ? `CanlÄ± ${statusLabel}` : 'CanlÄ±';
    case 'halftime':
      return statusLabel ? `Devre arasÄ± â€¢ ${statusLabel}` : 'Devre arasÄ±';
    case 'scheduled':
      return statusLabel ? `BaÅŸlama â€¢ ${statusLabel}` : 'BaÅŸlama bekleniyor';
    case 'finished':
      return 'MaÃ§ sonu';
    case 'not_found':
      return resolveDisplayedScore(entry) ? 'Son bilinen veri' : 'CanlÄ± veri bekleniyor';
    default:
      return statusLabel || 'Takip beklemede';
  }
}

function buildGoalAlertMessage(entry, previousScore, nextScore) {
  const homeDelta = nextScore.homeGoals - previousScore.homeGoals;
  const awayDelta = nextScore.awayGoals - previousScore.awayGoals;
  const scoreText = `${nextScore.homeGoals}-${nextScore.awayGoals}`;

  if (homeDelta > 0 && awayDelta > 0) {
    return `Gol: Her iki taraf â€¢ peÅŸ peÅŸe goller geldi â€¢ ${scoreText}`;
  }
  if (homeDelta > 0) {
    return `Gol: ${entry.homeTeam} â€¢ golÃ¼ buldu â€¢ ${scoreText}`;
  }
  if (awayDelta > 0) {
    return `Gol: ${entry.awayTeam} â€¢ golÃ¼ buldu â€¢ ${scoreText}`;
  }
  return `Skor gÃ¼ncellendi â€¢ ${scoreText}`;
}

function buildGoalEventMinuteLabel(statusLabel, statusState) {
  const minute = parseTrackedMinuteLabel(statusLabel);
  if (Number.isInteger(minute) && minute > 0) {
    return `${minute}'`;
  }
  const state = String(statusState || '').toLowerCase();
  if (state === 'halftime') {
    return '45+';
  }
  if (state === 'finished') {
    return '90+';
  }
  return '-';
}

function appendGoalEvent(entry, status, previousScore, nextScore, message) {
  const previousEvents = Array.isArray(entry?.goalEvents) ? entry.goalEvents : [];
  const minuteLabel = buildGoalEventMinuteLabel(status?.statusLabel || entry?.liveStatusLabel || '', status?.state || entry?.liveState || '');
  const nextEvent = {
    at: new Date().toISOString(),
    minute: minuteLabel,
    score: `${nextScore.homeGoals}-${nextScore.awayGoals}`,
    note: cleanText(message || 'Gol bildirimi', 'Gol bildirimi')
  };
  const merged = [...previousEvents, nextEvent];
  return merged.slice(-24);
}

function renderLiveCenterGoalEvents(entry) {
  const timelineGoalEvents = Array.isArray(entry?.timelineEvents)
    ? entry.timelineEvents.filter((item) => cleanText(item?.type || item?.eventType || '', '').toLowerCase() === 'goal').slice(-8).reverse()
    : [];
  const events = timelineGoalEvents.length
    ? timelineGoalEvents
    : Array.isArray(entry?.goalEvents)
      ? entry.goalEvents.slice(-8).reverse()
      : [];
  const score = resolveDisplayedScore(entry);
  const totalGoals = Number(score?.homeGoals || 0) + Number(score?.awayGoals || 0);
  const fallbackMinute = getEffectiveLiveState(entry) === 'finished' ? 'MS' : cleanText(entry?.liveStatusLabel || '-', '-');

  if (!events.length) {
    if (totalGoals > 0) {
      return `
        <div class="live-center-goal-events">
          <span>Gol dakikalarÄ±</span>
          <ul>
            <li>
              <strong>${safeText(fallbackMinute)}</strong>
              <span>${safeText(`${score.homeGoals}-${score.awayGoals}`)}</span>
              <small>Gol dakikasÄ± kaynaktan alÄ±namadÄ±; yakalanan son skor gÃ¶steriliyor.</small>
            </li>
          </ul>
        </div>
      `;
    }

    return `
      <div class="live-center-goal-events empty">
        <span>Gol dakikalarÄ±</span>
        <p>Bu maÃ§ta yakalanan gol dakikasÄ± henÃ¼z yok.</p>
      </div>
    `;
  }

  const items = events
    .map((item) => {
      const minute = cleanText(item?.minute || '-', '-');
      const scoreLine = cleanText(item?.score || '-', '-');
      const note = cleanText(item?.note || '', 'Gol bildirimi');
      return `
        <li>
          <strong>${safeText(minute)}</strong>
          <span>${safeText(scoreLine)}</span>
          <small>${safeText(note)}</small>
        </li>
      `;
    })
    .join('');

  return `
    <div class="live-center-goal-events">
      <span>Gol dakikalarÄ±</span>
      <ul>${items}</ul>
    </div>
  `;
}
function parseMatchKickoffDate(entry) {
  const date = String(entry?.matchDate || '').trim();
  if (!date) {
    return null;
  }
  const time = String(entry?.matchTime || '00:00').trim() || '00:00';
  const [year, month, day] = date.split('-').map((item) => Number.parseInt(item, 10));
  const [hour, minute] = time.split(':').map((item) => Number.parseInt(item, 10));
  if (![year, month, day].every(Number.isInteger)) {
    return null;
  }
  return new Date(year, (month || 1) - 1, day || 1, Number.isInteger(hour) ? hour : 0, Number.isInteger(minute) ? minute : 0, 0, 0);
}

function isReliableFinalStatusSource(source) {
  const normalized = String(source || '').toLowerCase();
  return normalized.includes('mackolik_canli_sonuclar') || normalized.includes('iddaa_statistics_api') || normalized.includes('manual');
}

function canApplyStatusScore(entry, status) {
  const source = String(status?.source || '').toLowerCase();
  if (!source.includes('iddaa_statistics_api')) {
    return true;
  }
  if (status?.state === 'finished') {
    return shouldFreezeFinishedState(entry, status) || hasResolvedFinalResult(entry);
  }
  return false;
}

function isScoreRegression(previousScore, nextScore) {
  if (
    !Number.isInteger(previousScore?.homeGoals) ||
    !Number.isInteger(previousScore?.awayGoals) ||
    !Number.isInteger(nextScore?.homeGoals) ||
    !Number.isInteger(nextScore?.awayGoals)
  ) {
    return false;
  }
  const previousTotal = previousScore.homeGoals + previousScore.awayGoals;
  const nextTotal = nextScore.homeGoals + nextScore.awayGoals;
  if (nextTotal < previousTotal) {
    return true;
  }
  return nextScore.homeGoals < previousScore.homeGoals || nextScore.awayGoals < previousScore.awayGoals;
}

function isTransientMissingState(state) {
  const normalized = String(state || '').toLowerCase();
  return normalized === 'not_found' || normalized === 'missing';
}

function hasStrongLiveEvidence(entry, status = null) {
  const entryState = String(entry?.liveState || '').toLowerCase();
  const statusState = String(status?.state || '').toLowerCase();
  if (entryState === 'live' || entryState === 'halftime' || statusState === 'live' || statusState === 'halftime') {
    return true;
  }

  const minuteLabel = cleanText(status?.statusLabel || entry?.liveStatusLabel || '', '');
  if (parseTrackedMinuteLabel(minuteLabel) >= 45) {
    return true;
  }

  if (cleanText(status?.halftimeScore || entry?.halftimeScore || '', '')) {
    return true;
  }

  const timelineEvents = Array.isArray(status?.timelineEvents)
    ? status.timelineEvents
    : Array.isArray(entry?.timelineEvents)
      ? entry.timelineEvents
      : [];
  const hasGoalTimeline = timelineEvents.some((item) =>
    cleanText(item?.type || item?.eventType || '', '').toLowerCase() === 'goal'
  );
  if (hasGoalTimeline) {
    return true;
  }

  return Array.isArray(entry?.goalEvents) && entry.goalEvents.length > 0;
}

function hasFinalStatusLabel(label) {
  const normalized = cleanText(label || '', '').toLocaleLowerCase('tr-TR');
  if (!normalized) {
    return false;
  }
  return /\b(ms|ft)\b/.test(normalized)
    || normalized.includes('maÃ§ sonu')
    || normalized.includes('mac sonu')
    || normalized.includes('final skor')
    || normalized.includes('full time')
    || normalized.includes('penalt');
}

function hasFinalTimelineSignal(entry, status = null) {
  const timeline = Array.isArray(status?.timelineEvents)
    ? status.timelineEvents
    : Array.isArray(entry?.timelineEvents)
      ? entry.timelineEvents
      : [];
  return timeline.some((item) => {
    const rawType = normalizeLiveEventType(item?.type || item?.eventType || '');
    if (rawType === 'fulltime') {
      return true;
    }
    const note = cleanText(item?.note || item?.message || '', '');
    return hasFinalStatusLabel(note);
  });
}

function getKickoffElapsedMinutes(entry) {
  const kickoff = parseEntryKickoffDate(entry);
  if (!kickoff) {
    return null;
  }
  return (Date.now() - kickoff.getTime()) / (60 * 1000);
}

function shouldTreatScheduledAsTransient(entry, status) {
  const statusState = String(status?.state || '').toLowerCase();
  if (statusState !== 'scheduled' || hasResolvedFinalResult(entry)) {
    return false;
  }

  if (entry?.liveState === 'live' || entry?.liveState === 'halftime') {
    return true;
  }

  const knownScore = resolveDisplayedScore(entry);
  if (Number.isInteger(knownScore?.homeGoals) && Number.isInteger(knownScore?.awayGoals)) {
    return true;
  }

  const elapsedMinutes = getKickoffElapsedMinutes(entry);
  return Number.isFinite(elapsedMinutes) && elapsedMinutes >= 70 && hasStrongLiveEvidence(entry, status);
}

function shouldAllowFinishedAutoClose(entry, status) {
  if (hasResolvedFinalResult(entry)) {
    return true;
  }
  const statusState = String(status?.state || '').toLowerCase();
  if (statusState !== 'finished' || !isReliableFinalStatusSource(status?.source)) {
    return false;
  }
  if (!Number.isInteger(status?.homeGoals) || !Number.isInteger(status?.awayGoals)) {
    return false;
  }
  if (hasFinalStatusLabel(status?.statusLabel) || hasFinalTimelineSignal(entry, status)) {
    return true;
  }
  const elapsedMinutes = getKickoffElapsedMinutes(entry);
  if (!Number.isFinite(elapsedMinutes) || elapsedMinutes < 95) {
    return false;
  }
  return hasStrongLiveEvidence(entry, status)
    || parseTrackedMinuteLabel(status?.statusLabel || entry?.liveStatusLabel || '') >= 85;
}

function mergeTrackedStatuses(entries, statuses) {
  const statusMap = new Map((statuses ?? []).map((item) => [item.id, item]));
  return entries.map((entry) => {
    if (!entry.tracked) {
      return entry;
    }

    const status = statusMap.get(entry.id);
    if (!status) {
      return entry;
    }

    const statusState = String(status.state || '').toLowerCase();
    const shouldFreezeForStale = shouldFreezeFinishedState(entry, status);
    const lockedFinal = hasResolvedFinalResult(entry);
    const scheduledTransient = shouldTreatScheduledAsTransient(entry, status);
    const canAutoCloseFinished = shouldAllowFinishedAutoClose(entry, status);

    if (lockedFinal && statusState !== 'finished') {
      const lockedScore = resolveDisplayedScore(entry);
      return {
        ...entry,
        tracked: false,
        liveState: 'finished',
        liveStatusLabel: 'MS',
        liveScore: lockedScore || entry.liveScore || null,
        lastSyncedAt: new Date().toISOString(),
        liveNote: cleanText('MaÃ§ sonucu sabitlendi; canlÄ± akÄ±ÅŸ bu kartta yeniden aÃ§Ä±lmadÄ±.', 'MaÃ§ sonucu sabitlendi.')
      };
    }

    const transientMiss =
      (isTransientMissingState(statusState) || scheduledTransient) &&
      !shouldFreezeForStale &&
      (entry.liveState === 'live' ||
        entry.liveState === 'halftime' ||
        hasStrongLiveEvidence(entry, status) ||
        (entry.liveScore &&
          Number.isInteger(entry.liveScore.homeGoals) &&
          Number.isInteger(entry.liveScore.awayGoals) &&
          (entry.liveState === 'live' || entry.liveState === 'halftime')));

    if (transientMiss) {
      return {
        ...entry,
        liveState: entry.liveState || 'not_found',
        liveStatusLabel: entry.liveStatusLabel || 'DoÄŸrulanamadÄ±',
        liveNote: cleanText(
          scheduledTransient
            ? 'Kaynak bu turda maÃ§Ä± planlÄ± gÃ¶sterdi; yanlÄ±ÅŸ geri dÃ¶nÃ¼ÅŸÃ¼ Ã¶nlemek iÃ§in son canlÄ± veri korunuyor.'
            : 'Kaynak bu turda eÅŸleÅŸmedi; son bilinen skor korunuyor.',
          'Kaynak bu turda eÅŸleÅŸmedi.'
        ),
        lastSyncedAt: entry.lastSyncedAt || new Date().toISOString(),
        halftimeScore: cleanText(status.halftimeScore || entry.halftimeScore || '', entry.halftimeScore || ''),
        goalEvents: Array.isArray(entry.goalEvents) ? entry.goalEvents.slice(-24) : [],
        timelineEvents: Array.isArray(entry.timelineEvents) ? entry.timelineEvents.slice(-32) : []
    }; 
    }

    const next = {
      ...entry,
      liveState: statusState || entry.liveState || null,
      liveStatusLabel: cleanText(status.statusLabel || entry.liveStatusLabel || '', entry.liveStatusLabel || ''),
      liveNote: cleanText(status.note || entry.liveNote || '', entry.liveNote || ''),
      liveSource: cleanText(status.source || entry.liveSource || '', entry.liveSource || ''),
      homeTeamId: Number.isInteger(status.homeTeamId) ? status.homeTeamId : entry.homeTeamId ?? null,
      awayTeamId: Number.isInteger(status.awayTeamId) ? status.awayTeamId : entry.awayTeamId ?? null,
      homeLogoUrl: cleanText(status.homeLogoUrl || entry.homeLogoUrl || '', entry.homeLogoUrl || ''),
      awayLogoUrl: cleanText(status.awayLogoUrl || entry.awayLogoUrl || '', entry.awayLogoUrl || ''),
      mackolikMatchPageId: Number.isInteger(status.mackolikMatchPageId) ? status.mackolikMatchPageId : entry.mackolikMatchPageId ?? null,
      matchcastId: Number.isInteger(status.matchcastId) ? status.matchcastId : entry.matchcastId ?? null,
      matchcastUrl: cleanText(entry.matchcastUrl || '', ''),
      lastSyncedAt: isTransientMissingState(statusState) ? (entry.lastSyncedAt || new Date().toISOString()) : new Date().toISOString(),
      halftimeScore: cleanText(status.halftimeScore || entry.halftimeScore || '', entry.halftimeScore || ''),
      goalEvents: Array.isArray(entry.goalEvents) ? entry.goalEvents.slice(-24) : [],
      timelineEvents: Array.isArray(status.timelineEvents)
        ? status.timelineEvents.slice(-32)
        : Array.isArray(entry.timelineEvents)
          ? entry.timelineEvents.slice(-32)
          : []
    };

    if (!Number.isInteger(status.homeGoals) || !Number.isInteger(status.awayGoals)) {
      const keepKnownLiveScore =
        (isTransientMissingState(statusState) || scheduledTransient) &&
        !shouldFreezeForStale &&
        (entry.liveState === 'live' || entry.liveState === 'halftime' || hasStrongLiveEvidence(entry, status));
      const shouldClearScore =
        ['scheduled', 'not_found', 'missing', 'unknown', 'suspended'].includes(statusState) &&
        !keepKnownLiveScore &&
        !shouldFreezeForStale;

      if (shouldClearScore) {
        next.liveScore = null;
        next.goalAlertAt = null;
        next.goalAlertMessage = '';
      }
      if (statusState === 'scheduled') {
        next.halftimeScore = '';
      }
    }

    if (Number.isInteger(status.homeGoals) && Number.isInteger(status.awayGoals) && canApplyStatusScore(entry, status)) {
      const previousScore = resolveDisplayedScore(entry);
      const incomingScore = {
        homeGoals: status.homeGoals,
        awayGoals: status.awayGoals
      };
      const allowFinishedOverride = statusState === 'finished' && canAutoCloseFinished;
      const keepPreviousScore =
        previousScore &&
        isScoreRegression(previousScore, incomingScore) &&
        !allowFinishedOverride;

      if (keepPreviousScore) {
        next.liveScore = {
          homeGoals: previousScore.homeGoals,
          awayGoals: previousScore.awayGoals
        };
        next.liveNote = cleanText(
          `${status.note || 'CanlÄ± akÄ±ÅŸ gÃ¼ncellendi.'} â€¢ Skor geriye dÃ¼ÅŸtÃ¼ÄŸÃ¼ iÃ§in son gÃ¼venilir skor korundu.`,
          'Skor geriye dÃ¼ÅŸtÃ¼ÄŸÃ¼ iÃ§in son gÃ¼venilir skor korundu.'
        );
      } else {
        next.liveScore = incomingScore;
        const nextTotalGoals = incomingScore.homeGoals + incomingScore.awayGoals;
        if (
          previousScore &&
          Number.isInteger(previousScore.homeGoals) &&
          Number.isInteger(previousScore.awayGoals)
        ) {
          const previousTotal = previousScore.homeGoals + previousScore.awayGoals;
          if (nextTotalGoals > previousTotal) {
            const goalMessage = cleanText(
              buildGoalAlertMessage(entry, previousScore, next.liveScore),
              'Gol bildirimi'
            );
            next.goalAlertAt = new Date().toISOString();
            next.goalAlertMessage = goalMessage;
            next.goalEvents = appendGoalEvent(entry, status, previousScore, next.liveScore, goalMessage);
          }
        } else if (nextTotalGoals > 0 && (!Array.isArray(next.goalEvents) || !next.goalEvents.length)) {
          const firstSeenMessage = cleanText(
            `Ä°lk yakalanan skor ${incomingScore.homeGoals}-${incomingScore.awayGoals}. Ã–nceki gol dakikalarÄ± kaynaktan alÄ±namadÄ±.`,
            'Ä°lk yakalanan skor.'
          );
          next.goalEvents = appendGoalEvent(
            entry,
            status,
            { homeGoals: 0, awayGoals: 0 },
            next.liveScore,
            firstSeenMessage
          );
        }
      }

      if (statusState === 'halftime' && !next.halftimeScore) {
        const halftimeHome = Number.isInteger(next.liveScore?.homeGoals) ? next.liveScore.homeGoals : status.homeGoals;
        const halftimeAway = Number.isInteger(next.liveScore?.awayGoals) ? next.liveScore.awayGoals : status.awayGoals;
        next.halftimeScore = `${halftimeHome}-${halftimeAway}`;
      }
    }

    if (
      statusState === 'finished' &&
      Number.isInteger(status.homeGoals) &&
      Number.isInteger(status.awayGoals) &&
      (!entry.result || entry.result.source !== 'manual') &&
      canAutoCloseFinished &&
      canApplyStatusScore(entry, status)
    ) {
      const previousScoreBeforeClose = resolveDisplayedScore(entry);
      const incomingFinalScore = {
        homeGoals: status.homeGoals,
        awayGoals: status.awayGoals
      };
      const regressionOnFinished =
        previousScoreBeforeClose &&
        isScoreRegression(previousScoreBeforeClose, incomingFinalScore);

      if (regressionOnFinished) {
        next.liveState = entry.liveState || 'not_found';
        next.liveStatusLabel = cleanText(entry.liveStatusLabel || 'DoÄŸrulanamadÄ±', 'DoÄŸrulanamadÄ±');
        next.liveScore = {
          homeGoals: previousScoreBeforeClose.homeGoals,
          awayGoals: previousScoreBeforeClose.awayGoals
        };
        next.liveNote = cleanText(
          'Final sinyali geldi ama skor geriye dÃ¼ÅŸtÃ¼; yanlÄ±ÅŸ maÃ§ sonu kapanÄ±ÅŸÄ±nÄ± Ã¶nlemek iÃ§in son gÃ¼venilir canlÄ± skor korundu.',
          'Skor geriye dÃ¼ÅŸtÃ¼ÄŸÃ¼ iÃ§in maÃ§ sonu otomatik kapanÄ±ÅŸ uygulanmadÄ±.'
        );
      } else {
        next.result = {
          homeGoals: status.homeGoals,
          awayGoals: status.awayGoals,
          savedAt: new Date().toISOString(),
          source: status.source || 'live_feed'
        };
        next.autoClosedAt = new Date().toISOString();
        next.tracked = false;
        next.liveNote = cleanText(`${status.note || 'MaÃ§ sonucu iÅŸlendi.'} â€¢ Takip otomatik kapatÄ±ldÄ±.`, 'MaÃ§ sonucu iÅŸlendi.');
      }
    } else if (statusState === 'finished' && !canAutoCloseFinished && !hasResolvedFinalResult(entry)) {
      next.liveState = entry.liveState || 'not_found';
      next.liveStatusLabel = cleanText(entry.liveStatusLabel || status.statusLabel || 'DoÄŸrulanamadÄ±', 'DoÄŸrulanamadÄ±');
      next.liveNote = cleanText(
        'Final sinyali alÄ±ndÄ± ancak kapanÄ±ÅŸ iÃ§in ek doÄŸrulama bekleniyor; yanlÄ±ÅŸ maÃ§ sonu kapanÄ±ÅŸÄ±nÄ± Ã¶nlemek iÃ§in takip aÃ§Ä±k tutuldu.',
        'Final kapanÄ±ÅŸÄ± iÃ§in ek doÄŸrulama bekleniyor.'
      );
    }

    if (shouldFreezeForStale) {
      const frozenScore =
        Number.isInteger(status.homeGoals) && Number.isInteger(status.awayGoals)
          ? { homeGoals: status.homeGoals, awayGoals: status.awayGoals }
          : resolveDisplayedScore(entry) || resolveDisplayedScore(next);
      if (frozenScore) {
        next.liveState = 'finished';
        next.liveStatusLabel = 'MS';
        next.liveScore = frozenScore;
        next.result = {
          homeGoals: frozenScore.homeGoals,
          awayGoals: frozenScore.awayGoals,
          savedAt: new Date().toISOString(),
          source: 'stale_live_freeze'
        };
        next.autoClosedAt = new Date().toISOString();
        next.tracked = false;
        next.liveNote = cleanText('CanlÄ± kaynak kapanmadÄ±; son bilinen skor maÃ§ sonu olarak sabitlendi.', 'MaÃ§ sonu sabitlendi.');
      }
    }

    if (!isRecentGoalAlert(next)) {
      delete next.goalAlertAt;
      delete next.goalAlertMessage;
    }

    return next;
  });
}

function getTrackedRefreshInterval(entries) {
  const activeEntries = entries.filter((entry) => entry.tracked && entry.liveState !== 'finished');
  if (!activeEntries.length) {
    return null;
  }

  return activeEntries.reduce((interval, entry) => {
    const nextInterval = entry.liveState === 'live'
      ? TRACKED_REFRESH_LIVE_MS
      : entry.liveState === 'halftime'
        ? TRACKED_REFRESH_HALFTIME_MS
        : TRACKED_REFRESH_SCHEDULED_MS;
    return Math.min(interval, nextInterval);
  }, TRACKED_REFRESH_SCHEDULED_MS);
}

function scheduleTrackedRefresh(entries) {
  if (trackedRefreshTimer) {
    window.clearInterval(trackedRefreshTimer);
    trackedRefreshTimer = null;
  }

  const interval = getTrackedRefreshInterval(entries);
  if (!interval) {
    return;
  }

  trackedRefreshTimer = window.setInterval(() => {
    refreshTrackedMatches(true);
  }, interval);
}

function hasResolvedFinalResult(entry) {
  const hasStructuredResult = Boolean(
    entry?.result && Number.isInteger(entry.result.homeGoals) && Number.isInteger(entry.result.awayGoals)
  );
  if (!entry?.autoClosedAt && !hasStructuredResult) {
    return false;
  }

  if (
    entry?.result?.source === 'manual' &&
    !entry?.autoClosedAt &&
    entry?.tracked &&
    entry?.liveState &&
    entry.liveState !== 'finished'
  ) {
    return false;
  }

  return true;
}

function shouldInferFinishedFromEntry(entry) {
  if (hasResolvedFinalResult(entry)) {
    return true;
  }
  if (entry?.tracked) {
    return false;
  }
  if (!hasStrongLiveEvidence(entry)) {
    return false;
  }
  const kickoff = parseEntryKickoffDate(entry);
  if (!kickoff) {
    return false;
  }
  const knownScore = resolveDisplayedScore({ ...entry, autoClosedAt: null, result: null }) || entry?.result || null;
  if (!knownScore || !Number.isInteger(knownScore.homeGoals) || !Number.isInteger(knownScore.awayGoals)) {
    return false;
  }
  const now = new Date();
  const elapsed = now.getTime() - kickoff.getTime();
  if (elapsed < 180 * 60 * 1000) {
    return false;
  }
  const syncAt = new Date(entry?.lastSyncedAt || 0);
  if (Number.isFinite(syncAt.getTime()) && now.getTime() - syncAt.getTime() < 30 * 60 * 1000) {
    return false;
  }
  const minuteHint = parseTrackedMinuteLabel(entry?.liveStatusLabel || '');
  if (!hasFinalStatusLabel(entry?.liveStatusLabel) && !hasFinalTimelineSignal(entry) && minuteHint < 85) {
    return false;
  }
  return true;
}

function getEffectiveLiveState(entry) {
  if (entry?.tracked && entry?.liveState) {
    return entry.liveState;
  }
  if (hasResolvedFinalResult(entry)) {
    return 'finished';
  }
  if (!entry?.tracked && shouldInferFinishedFromEntry(entry)) {
    return 'finished';
  }
  return entry?.liveState || null;
}

function parseEntryKickoffDate(entry) {
  const dateText = cleanText(entry?.matchDate || '', '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
    return null;
  }
  const [year, month, day] = dateText.split('-').map(Number);
  const timeText = cleanText(entry?.matchTime || '', '00:00');
  const [hour, minute] = timeText.split(':').map(Number);
  const kickoff = new Date(year, (month || 1) - 1, day || 1, hour || 0, minute || 0, 0, 0);
  return Number.isNaN(kickoff.getTime()) ? null : kickoff;
}

function shouldFreezeFinishedState(entry, status) {
  if (hasResolvedFinalResult(entry)) {
    return false;
  }
  const state = String(status?.state || entry?.liveState || '').toLowerCase();
  if (!state || state === 'finished' || state === 'scheduled') {
    return false;
  }
  if (!isTransientMissingState(state) && state !== 'unknown') {
    return false;
  }
  const knownScore =
    Number.isInteger(status?.homeGoals) && Number.isInteger(status?.awayGoals)
      ? { homeGoals: status.homeGoals, awayGoals: status.awayGoals }
      : resolveDisplayedScore(entry);
  if (!knownScore) {
    return false;
  }
  if (!hasStrongLiveEvidence(entry, status)) {
    return false;
  }
  const kickoff = parseEntryKickoffDate(entry);
  if (!kickoff) {
    return false;
  }
  const now = new Date();
  const elapsed = now.getTime() - kickoff.getTime();
  if (elapsed < 165 * 60 * 1000) {
    return false;
  }
  const syncAt = new Date(status?.syncedAt || entry?.lastSyncedAt || 0);
  if (Number.isFinite(syncAt.getTime()) && now.getTime() - syncAt.getTime() < 25 * 60 * 1000) {
    return false;
  }
  return true;
}

function resolveDisplayedScore(entry) {
  if (entry?.tracked && entry?.liveState && entry.liveState !== 'finished') {
    if (entry.liveScore && Number.isInteger(entry.liveScore.homeGoals) && Number.isInteger(entry.liveScore.awayGoals)) {
      return entry.liveScore;
    }
    if (entry.result?.source === 'manual' && Number.isInteger(entry.result.homeGoals) && Number.isInteger(entry.result.awayGoals)) {
      return entry.result;
    }
    return null;
  }
  if (hasResolvedFinalResult(entry)) {
    return entry.result || entry.liveScore || null;
  }
  if (entry.liveScore && Number.isInteger(entry.liveScore.homeGoals) && Number.isInteger(entry.liveScore.awayGoals)) {
    return entry.liveScore;
  }
  if (entry.result && Number.isInteger(entry.result.homeGoals) && Number.isInteger(entry.result.awayGoals)) {
    return entry.result;
  }
  return null;
}

function buildHistoryStateLabel(entry) {
  switch (getEffectiveLiveState(entry)) {
    case 'live':
      return `CanlÄ± â€¢ ${cleanText(entry.liveStatusLabel || '-', '-')}`;
    case 'halftime':
      return 'Devre arasÄ±';
    case 'finished':
      return 'MaÃ§ sonucu kesinleÅŸti';
    case 'scheduled':
      return `BaÅŸlama bilgisi â€¢ ${cleanText(entry.liveStatusLabel || '-', '-')}`;
    case 'suspended':
      return cleanText(entry.liveStatusLabel || 'MaÃ§ askÄ±da', 'MaÃ§ askÄ±da');
    case 'not_found':
      return resolveDisplayedScore(entry) ? 'Son bilinen canlÄ± veri' : 'CanlÄ± veri bulunamadÄ±';
    default:
      return entry.tracked ? 'Takip beklemede' : 'Takibe alÄ±nmadÄ±';
  }
}

function buildHistoryStateMeta(entry, evaluation) {
  const notes = [];
  if (getEffectiveLiveState(entry) === 'finished') {
    notes.push('MaÃ§ sonucu iÅŸlendi ve takip otomatik kapatÄ±ldÄ±.');
  } else if (entry.liveNote) {
    notes.push(cleanText(entry.liveNote, ''));
  }
  if (entry.lastSyncedAt) {
    notes.push(`Son gÃ¼ncelleme ${formatDateTime(entry.lastSyncedAt)}`);
  }
  if (evaluation?.summary && entry.result) {
    notes.push(cleanText(evaluation.summary, ''));
  }
  return notes.join(' â€¢ ') || (entry.liveState === 'not_found' && resolveDisplayedScore(entry)
    ? 'Kaynak bu turda eÅŸleÅŸemedi; son bilinen skor gÃ¶steriliyor.'
    : 'CanlÄ± skor henÃ¼z Ã§ekilemedi.');
}
function historyStateClass(entry, evaluation) {
  if (evaluation?.topHit === true) {
    return 'hit';
  }
  if (evaluation?.topHit === false) {
    return 'miss';
  }
  const effectiveState = getEffectiveLiveState(entry);
  if (effectiveState === 'live' || effectiveState === 'halftime') {
    return 'live';
  }
  if (getEffectiveLiveState(entry) === 'finished') {
    return 'neutral';
  }
  return 'pending';
}

function evaluateHistoryEntry(entry) {
  if (!entry?.result) {
    return null;
  }

  const graded = (entry.recommendations ?? [])
    .map((item) => gradeRecommendation(item.market, entry.result))
    .filter(Boolean);

  if (!graded.length) {
    return {
      topHit: null,
      playedHit: null,
      summary: 'Bu kayÄ±t iÃ§in otomatik karÅŸÄ±laÅŸtÄ±rma yapÄ±lamadÄ±.'
    };
  }

  const hitCount = graded.filter((item) => item.hit).length;
  const topOutcome = gradeRecommendation(entry.topRecommendation?.market, entry.result);
  const playedOutcome = gradeRecommendation(entry.playedMarket, entry.result);
  const topLabel = topOutcome?.hit === true ? 'Ana Ã¶neri tuttu' : topOutcome?.hit === false ? 'Ana Ã¶neri tutmadÄ±' : 'Ana Ã¶neri Ã¶lÃ§Ã¼lemedi';
  const playedLabel = entry.playedMarket
    ? playedOutcome?.hit === true
      ? `Senin kuponun tuttu (${entry.playedMarket})`
      : playedOutcome?.hit === false
        ? `Senin kuponun tutmadÄ± (${entry.playedMarket})`
        : `Senin kuponun Ã¶lÃ§Ã¼lemedi (${entry.playedMarket})`
    : '';

  return {
    topHit: topOutcome?.hit ?? null,
    playedHit: playedOutcome?.hit ?? null,
    summary: `${topLabel}${playedLabel ? ` â€¢ ${playedLabel}` : ''} â€¢ ${hitCount}/${graded.length} Ã¶neri isabetli. Final skor: ${entry.result.homeGoals}-${entry.result.awayGoals}`
  };
}

function gradeRecommendation(market, result, entry = null) {
  if (!market || !result) {
    return null;
  }

  const normalizedMarket = normalizeDisplayMarketLabel(String(market));
  const totalGoals = Number(result.homeGoals || 0) + Number(result.awayGoals || 0);
  const homeWin = Number(result.homeGoals || 0) > Number(result.awayGoals || 0);
  const draw = Number(result.homeGoals || 0) === Number(result.awayGoals || 0);
  const awayWin = Number(result.awayGoals || 0) > Number(result.homeGoals || 0);
  const btts = Number(result.homeGoals || 0) > 0 && Number(result.awayGoals || 0) > 0;
  const halftimeTuple = parseLiveScoreTuple(entry?.halftimeScore || '');
  const firstHalfGoals = halftimeTuple.totalGoals || totalGoals;
  const secondHalfGoals = halftimeTuple.totalGoals ? Math.max(0, totalGoals - halftimeTuple.totalGoals) : null;

  if (normalizedMarket.startsWith('1X')) {
    return { market, hit: homeWin || draw };
  }
  if (normalizedMarket.startsWith('X2')) {
    return { market, hit: awayWin || draw };
  }
  if (normalizedMarket.startsWith('1 (') || normalizedMarket === '1') {
    return { market, hit: homeWin };
  }
  if (normalizedMarket.startsWith('2 (') || normalizedMarket === '2') {
    return { market, hit: awayWin };
  }
  if (normalizedMarket === 'Beraberlik') {
    return { market, hit: draw };
  }
  if (normalizedMarket === '2.5 Ãœst') {
    return { market, hit: totalGoals >= 3 };
  }
  if (normalizedMarket === '2.5 Alt') {
    return { market, hit: totalGoals <= 2 };
  }
  if (normalizedMarket === '3.5 Ãœst') {
    return { market, hit: totalGoals >= 4 };
  }
  if (normalizedMarket === '3.5 Alt') {
    return { market, hit: totalGoals <= 3 };
  }
  if (normalizedMarket === 'KG Var') {
    return { market, hit: btts };
  }
  if (normalizedMarket === 'KG Yok') {
    return { market, hit: !btts };
  }

  const firstHalfMatch = normalizedMarket.match(/^(?:Ä°lk YarÄ±|Ä°Y)\s*(\d+)\.5\s*(Ãœst|Alt)$/i);
  if (firstHalfMatch) {
    const threshold = (Number(firstHalfMatch[1]) || 0) + 1;
    const wantsOver = /Ãœst/i.test(firstHalfMatch[2]);
    return { market, hit: wantsOver ? firstHalfGoals >= threshold : firstHalfGoals < threshold };
  }

  const secondHalfMatch = normalizedMarket.match(/^2Y\s*(\d+)\.5\s*(Ãœst|Alt)$/i);
  if (secondHalfMatch && secondHalfGoals !== null) {
    const threshold = (Number(secondHalfMatch[1]) || 0) + 1;
    const wantsOver = /Ãœst/i.test(secondHalfMatch[2]);
    return { market, hit: wantsOver ? secondHalfGoals >= threshold : secondHalfGoals < threshold };
  }

  const fullTimeMatch = normalizedMarket.match(/^MaÃ§ Sonu\s*(\d+)\.5\s*(Ãœst|Alt)$/i);
  if (fullTimeMatch) {
    const threshold = (Number(fullTimeMatch[1]) || 0) + 1;
    const wantsOver = /Ãœst/i.test(fullTimeMatch[2]);
    return { market, hit: wantsOver ? totalGoals >= threshold : totalGoals < threshold };
  }

  if (normalizedMarket === 'Uzak Dur') {
    return null;
  }

  return null;
}

function buildHistoryFallbackId(matchInfo) {
  const normalize = (value) =>
    String(value ?? '')
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, '-')
      .replaceAll(/^-+|-+$/g, '');

  return [matchInfo.homeTeam, matchInfo.awayTeam, matchInfo.matchDate].map(normalize).join('__');
}

function formatMatchKickoff(matchDate, matchTime = '') {
  const date = cleanText(matchDate, '-');
  const time = cleanText(matchTime, '');
  return time && time !== '-' ? `${date} â€¢ ${time}` : date;
}
function formatDateTime(value) {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) {
    return '-';
  }

  return parsed.toLocaleString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function buildDailyScanHeadline(data) {
  const topCount = Array.isArray(data.topPicks) ? data.topPicks.length : 0;
  const avoidCount = Array.isArray(data.avoidPicks) ? data.avoidPicks.length : 0;
  return `${data.scannedCount} maÃ§ incelendi. EÅŸik Ã¼stÃ¼nde kalan havuzdan en gÃ¼venilir ${topCount} seÃ§im ve uzak durulacak ${avoidCount} maÃ§ ayrÄ±ldÄ±.`;
}

function parseMetricValue(value, fallback = 0) {
  const raw = String(value ?? '')
    .replace(',', '.')
    .replace(/[^\d.+-]/g, '');
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildOutcomeTable(probabilities = {}, matchInfo = {}) {
  return [
    { code: '1', label: `${matchInfo.homeTeam || 'Ev sahibi'} kazanÄ±r`, probability: Number(probabilities.homeWin) || 0, team: matchInfo.homeTeam || 'Ev sahibi' },
    { code: 'X', label: 'Beraberlik', probability: Number(probabilities.draw) || 0, team: null },
    { code: '2', label: `${matchInfo.awayTeam || 'Deplasman'} kazanÄ±r`, probability: Number(probabilities.awayWin) || 0, team: matchInfo.awayTeam || 'Deplasman' }
  ].sort((left, right) => right.probability - left.probability);
}

function buildRecentCopy(data) {
  const rows = Array.isArray(data.recentMatches)
    ? data.recentMatches.map((item) => buildRecentSummaryRow(item)).slice(0, 2)
    : [];

  if (rows.length < 2) {
    return {
      formLine: '',
      goalLine: ''
    };
  }

  const [homeRow, awayRow] = rows;
  return {
    formLine: `Son maÃ§ formu: ${homeRow.team} ${homeRow.formLine}, ${awayRow.team} ${awayRow.formLine}.`,
    goalLine: `Gol ritmi: ${homeRow.team} ${homeRow.goalLine}; ${awayRow.team} ${awayRow.goalLine}.`
  };
}

function normalizeTeamKey(value) {
  return normalizeTurkishText(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, ' ')
    .trim();
}

function buildStandingsContext(data) {
  const rows = Array.isArray(data.leagueStandings) ? data.leagueStandings : [];
  const homeKey = normalizeTeamKey(data.matchInfo?.homeTeam || '');
  const awayKey = normalizeTeamKey(data.matchInfo?.awayTeam || '');
  const findRow = (teamKey) =>
    rows.find((item) => {
      const rowKey = normalizeTeamKey(item.team);
      return rowKey && teamKey && (rowKey.includes(teamKey) || teamKey.includes(rowKey));
    }) ?? null;

  const home = findRow(homeKey);
  const away = findRow(awayKey);
  const summary = cleanText(data.standingsSummary, '');

  if (!home || !away) {
    return {
      score: Math.max(40, Math.min(92, Number(data.confidenceScore) || 0)),
      shortLine: summary,
      reasonLine: summary || 'Puan tablosu verisi sÄ±nÄ±rlÄ± kaldÄ±.'
    };
  }

  const homePoints = Number(home.points) || 0;
  const awayPoints = Number(away.points) || 0;
  const homePosition = Number(home.position) || 0;
  const awayPosition = Number(away.position) || 0;
  const pointGap = Math.abs(homePoints - awayPoints);
  const positionGap = Math.abs(homePosition - awayPosition);
  const leader = homePoints === awayPoints && homePosition === awayPosition
    ? 'denge'
    : homePoints > awayPoints || homePosition < awayPosition
      ? 'home'
      : 'away';
  const leaderName = leader === 'home'
    ? data.matchInfo?.homeTeam || home.team
    : leader === 'away'
      ? data.matchInfo?.awayTeam || away.team
      : 'iki taraf';

  return {
    score: Math.max(42, Math.min(94, 48 + pointGap * 3 + positionGap * 2)),
    shortLine: leader === 'denge'
      ? `Puan tablosu dengede: ${home.team} ${home.position}. sÄ±ra ${home.points} puan, ${away.team} ${away.position}. sÄ±ra ${away.points} puan.`
      : `Puan tablosunda ${leaderName} tarafÄ± Ã¶nde: ${pointGap} puan ve ${positionGap} sÄ±ra farkÄ± var.`,
    reasonLine: summary || (leader === 'denge'
      ? `Puan tablosunda net kopuÅŸ gÃ¶rÃ¼nmÃ¼yor; ${home.team} ${home.points}, ${away.team} ${away.points} puanda.`
      : `${leaderName} puan tablosunda daha saÄŸlam konumda. ${pointGap} puan ve ${positionGap} sÄ±ra farkÄ± karar tarafÄ±nÄ± destekliyor.`)
  };
}

function buildProfessionalCopy(data, variant = 'analysis') {
  const matchInfo = data.matchInfo ?? {};
  const probabilities = data.probabilities ?? {};
  const markets = data.markets ?? {};
  const topRecommendation = data.recommendations?.[0] ?? null;
  const outcomes = buildOutcomeTable(probabilities, matchInfo);
  const primary = outcomes[0] ?? { label: 'taraf pazarÄ±', probability: 0, team: matchInfo.homeTeam || 'Ev sahibi' };
  const secondary = outcomes[1] ?? { probability: 0 };
  const edge = Math.max(0, primary.probability - secondary.probability);
  const over25 = Number.isFinite(markets.over25) ? markets.over25 : 50;
  const under25 = Math.max(0, Math.min(100, 100 - over25));
  const projectedGoals = parseMetricValue(markets.projectedGoals, 2.6);
  const sourceLimited = data.sourceStatus?.fallbackUsed || data.sourceStatus?.health === 'limited';
  const confidence = Number(data.confidenceScore) || 0;
  const drawProbability = Number(probabilities.draw) || 0;
  const bttsYes = Number(probabilities.bttsYes) || 0;
  const marketLabel = normalizeDisplayMarketLabel(topRecommendation?.market || primary.label || '');
  const formValue = cleanText(data.decisionFactors?.[0]?.value, 'veri sÄ±nÄ±rlÄ±');
  const defenseValue = cleanText(data.decisionFactors?.[2]?.value, 'veri sÄ±nÄ±rlÄ±');
  const hardSide = marketLabel.startsWith('1 (') || marketLabel.startsWith('2 (');
  const recentCopy = buildRecentCopy(data);
  const standings = buildStandingsContext(data);

  let verdict = `${normalizeDisplayMarketLabel(primary.label)} tarafÄ± bir adÄ±m Ã¶nde gÃ¶rÃ¼nÃ¼yor.`;
  if (variant === 'avoid' || marketLabel.includes('Uzak Dur')) {
    verdict = 'Bu maÃ§ta net avantaj yok; kupona zorla eklemek doÄŸru gÃ¶rÃ¼nmÃ¼yor.';
  } else if (marketLabel.includes('1X')) {
    verdict = `${matchInfo.homeTeam || primary.team} tarafÄ±nda doÄŸrudan sonuÃ§ yerine yenilmez Ã§izgi daha gÃ¼venli duruyor.`;
  } else if (marketLabel.includes('X2')) {
    verdict = `${matchInfo.awayTeam || primary.team} tarafÄ±nda doÄŸrudan sonuÃ§ yerine yenilmez Ã§izgi daha gÃ¼venli duruyor.`;
  } else if (marketLabel.includes('2.5 Alt')) {
    verdict = 'MaÃ§Ä±n kontrollÃ¼ tempoda kalma ihtimali daha yÃ¼ksek; ana yÃ¶n 2.5 Alt.';
  } else if (marketLabel.includes('3.5 Alt')) {
    verdict = 'Skor yÃ¼kselebilir ama 4 gole Ã§Ä±kacak kadar sert bir tempo gÃ¶rÃ¼nmÃ¼yor.';
  } else if (marketLabel.includes('2.5 Ãœst') || marketLabel.includes('2.5 Ãœst')) {
    verdict = 'MaÃ§ aÃ§Ä±k oyuna daha yakÄ±n; ana yÃ¶n 2.5 Ãœst.';
  } else if (marketLabel.includes('KG Var')) {
    verdict = 'Ä°ki takÄ±mÄ±n da gol bulma ihtimali canlÄ± gÃ¶rÃ¼nÃ¼yor.';
  } else if (marketLabel.includes('KG Yok')) {
    verdict = 'Skor akÄ±ÅŸÄ± tek tarafa sÄ±kÄ±ÅŸabilir; karÅŸÄ±lÄ±klÄ± gol zor gÃ¶rÃ¼nÃ¼yor.';
  } else if (hardSide) {
    verdict = `${primary.team} doÄŸrudan sonuÃ§ tarafÄ±nda bir adÄ±m Ã¶nde.`;
  }

  let reason = `Model ilk senaryoyu %${primary.probability}, ikinci senaryoyu %${secondary.probability} gÃ¶rÃ¼yor.`;
  if (marketLabel.includes('Alt')) {
    reason = `Beklenen gol ${projectedGoals.toFixed(2)} seviyesinde. ${recentCopy.goalLine || ''} ${standings.reasonLine || ''} Alt tarafÄ±nÄ± %${under25} destekliyor.`;
  } else if (marketLabel.includes('Ãœst') || marketLabel.includes('Ãœst') || marketLabel.includes('KG Var')) {
    reason = `Beklenen gol ${projectedGoals.toFixed(2)} seviyesinde. ${recentCopy.goalLine || ''} ${standings.reasonLine || ''} Ãœst tarafÄ±nÄ± %${over25}, KG Var tarafÄ±nÄ± %${bttsYes} destekliyor.`;
  } else if (marketLabel.includes('1X') || marketLabel.includes('X2') || hardSide) {
    reason = `Taraf ayrÄ±ÅŸmasÄ± %${edge} seviyesinde. ${recentCopy.formLine || ''} ${standings.reasonLine || ''} AÄŸÄ±rlÄ±klÄ± form ${formValue}.`;
  } else if (marketLabel.includes('Uzak Dur')) {
    reason = `Taraf ayrÄ±ÅŸmasÄ± yalnÄ±zca %${edge}. ${recentCopy.formLine || ''} ${standings.reasonLine || ''} Temiz fiyat avantajÄ± oluÅŸmuyor.`;
  }

  let risk = `Beraberlik oranÄ± hÃ¢lÃ¢ %${drawProbability}. Erken gol veya kÄ±rmÄ±zÄ± kart mevcut planÄ± hÄ±zlÄ± bozar.`;
  if (sourceLimited) {
    risk = 'Veri yedek akÄ±ÅŸtan geldiÄŸi iÃ§in maÃ§ ritmi deÄŸiÅŸirse bu yorum daha hÄ±zlÄ± bozulabilir.';
  } else if (variant === 'avoid' || marketLabel.includes('Uzak Dur')) {
    risk = `Model gÃ¼veni %${confidence} olsa da maÃ§Ä±n kÄ±rÄ±lma eÅŸiÄŸi dÃ¼ÅŸÃ¼k. Savunma dengesi ${defenseValue}.`;
  } else if (marketLabel.includes('Alt')) {
    risk = 'Erken gol gelirse maÃ§ aÃ§Ä±lÄ±r ve alt senaryosu hÄ±zla deÄŸer kaybeder.';
  } else if (marketLabel.includes('Ãœst') || marketLabel.includes('Ãœst') || marketLabel.includes('KG Var')) {
    risk = 'Taraflardan biri Ã¼retimde kilitlenirse aÃ§Ä±k oyun senaryosu beklenenden erken sÃ¶ner.';
  }

  return {
    verdict: cleanText(verdict),
    reason: cleanText(reason),
    risk: cleanText(risk),
    marketLabel: marketLabel || primary.label,
    primary,
    edge,
    projectedGoals,
    over25,
    under25
  };
}

function buildSignalCards(data, sourceStatus) {
  const summary = buildProfessionalCopy(data);
  const probabilities = data.probabilities ?? {};
  const defenseValue = cleanText(data.decisionFactors?.[2]?.value, '-');
  const tempoValue = cleanText(data.decisionFactors?.[3]?.value, `${summary.projectedGoals.toFixed(2)} gol`);
  const standings = buildStandingsContext(data);
  const sourceDetail = data.aiLayerUsed
    ? `${cleanSourceLabel(sourceStatus.label, sourceStatus)} ve AI teyidi aktif.`
    : `${cleanSourceLabel(sourceStatus.label, sourceStatus)} kullanÄ±ldÄ±. AI teyidi devrede deÄŸil.`;

  return [
    {
      label: 'Kaynak ve gÃ¼ven',
      score: Number(data.confidenceScore) || 0,
      detail: `${sourceDetail} Genel model gÃ¼veni %${data.confidenceScore}.`
    },
    {
      label: 'Taraf ayrÄ±ÅŸmasÄ±',
      score: Math.max(summary.primary.probability, summary.edge + 45),
      detail: `1 %${probabilities.homeWin ?? 0} â€¢ X %${probabilities.draw ?? 0} â€¢ 2 %${probabilities.awayWin ?? 0}.`
    },
    {
      label: 'Gol profili',
      score: Math.max(summary.over25, summary.under25),
      detail: `Gol beklentisi ${summary.projectedGoals.toFixed(2)}. Tempo profili ${tempoValue}. Savunma dengesi ${defenseValue}.`
    },
    {
      label: 'Puan tablosu',
      score: standings.score,
      detail: standings.reasonLine || `Ana Ã¶neri ${summary.marketLabel}. Puan tablosu taraf gÃ¼cÃ¼nÃ¼ destekliyor.`
    }
  ];
}

function buildStandingsIntro(data) {
  const summary = cleanText(data.standingsSummary, '');
  if (summary) {
    return summary;
  }

  return 'Puan tablosu verisi Ã§Ä±kmadÄ±. Bu analiz son maÃ§ formu ve skor ritmi Ã¼zerinden kuruldu.';
}

function buildFormIntro(data) {
  const home = data.matchInfo?.homeTeam || 'Ev sahibi';
  const away = data.matchInfo?.awayTeam || 'Deplasman';
  const formValue = cleanText(data.decisionFactors?.[0]?.value, '');
  return formValue
    ? `${home} ve ${away} iÃ§in son form ritmi ${formValue} bandÄ±nda okunuyor. Tablo, kÄ±sa vade form yÃ¶nÃ¼nÃ¼ gÃ¶sterir.`
    : 'Tablo, iki tarafÄ±n son form ritmini ve skor Ã¼retim dÃ¼zeyini birlikte gÃ¶sterir.';
}

function buildH2HIntro(data) {
  const count = Array.isArray(data.h2hMatches) ? data.h2hMatches.length : 0;
  if (!count) {
    return 'Bu eÅŸleÅŸme iÃ§in okunabilir H2H verisi Ã§Ä±kmadÄ±. Karar yalnÄ±z gÃ¼ncel forma dayanÄ±yor.';
  }
  return `${count} H2H kaydÄ± bulundu. Bu tablo tek baÅŸÄ±na karar vermez; yalnÄ±z eÅŸleÅŸme hafÄ±zasÄ±nÄ± gÃ¶sterir.`;
}

function buildKnockoutTieInsight(data) {
  const league = cleanText(data?.matchInfo?.league, '').toLocaleLowerCase('tr-TR');
  const isKnockout = /(kupa|cup|eleme|play[ -]?off|rÃ¶vanÅŸ|yar[Ä±i] final|Ã§eyrek final|son 16|son 32|tur)/i.test(league);
  if (!isKnockout) {
    return null;
  }
  const homeTeam = cleanText(data?.matchInfo?.homeTeam, '');
  const awayTeam = cleanText(data?.matchInfo?.awayTeam, '');
  const homeNeedle = homeTeam.toLocaleLowerCase('tr-TR');
  const awayNeedle = awayTeam.toLocaleLowerCase('tr-TR');
  const rows = Array.isArray(data?.h2hMatches) ? data.h2hMatches : [];
  for (const row of rows) {
    const scoreText = cleanText(row?.score, '');
    const match = scoreText.match(/(\d+)\s*[-:]\s*(\d+)/);
    if (!match) {
      continue;
    }
    const homeGoals = Number.parseInt(match[1], 10) || 0;
    const awayGoals = Number.parseInt(match[2], 10) || 0;
    const lower = scoreText.toLocaleLowerCase('tr-TR');
    const left = lower.slice(0, match.index).trim();
    const right = lower.slice((match.index || 0) + match[0].length).trim();
    if (!left || !right) {
      continue;
    }
    if (left.includes(homeNeedle) && right.includes(awayNeedle)) {
      const diff = homeGoals - awayGoals;
      return {
        detail: diff === 0
          ? `Ä°lk maÃ§ dengede kapandÄ± (${homeGoals}-${awayGoals}). RÃ¶vanÅŸ senaryosu bu dengeyi doÄŸrudan etkiler.`
          : diff > 0
            ? `Ä°lk maÃ§ta ${homeTeam} ${homeGoals}-${awayGoals} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸta korumalÄ± senaryolar daha deÄŸerli olabilir.`
            : `Ä°lk maÃ§ta ${awayTeam} ${awayGoals}-${homeGoals} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸ baskÄ±sÄ± oyunun yÃ¶nÃ¼nÃ¼ hÄ±zla deÄŸiÅŸtirebilir.`
      };
    }
    if (left.includes(awayNeedle) && right.includes(homeNeedle)) {
      const diff = awayGoals - homeGoals;
      return {
        detail: diff === 0
          ? `Ä°lk maÃ§ dengede kapandÄ± (${awayGoals}-${homeGoals}). RÃ¶vanÅŸ senaryosu bu dengeyi doÄŸrudan etkiler.`
          : diff > 0
            ? `Ä°lk maÃ§ta ${awayTeam} ${awayGoals}-${homeGoals} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸta korumalÄ± senaryolar daha deÄŸerli olabilir.`
            : `Ä°lk maÃ§ta ${homeTeam} ${homeGoals}-${awayGoals} Ã¼stÃ¼nlÃ¼k aldÄ±. RÃ¶vanÅŸ baskÄ±sÄ± oyunun yÃ¶nÃ¼nÃ¼ hÄ±zla deÄŸiÅŸtirebilir.`
      };
    }
  }
  return { detail: 'Bu eÅŸleÅŸme eleme/kupa dinamiÄŸinde. Ä°lk maÃ§ skoru ve tur baskÄ±sÄ± normal lig maÃ§larÄ±na gÃ¶re daha fazla aÄŸÄ±rlÄ±k taÅŸÄ±r.' };
}

function buildHistoryVerdict(entry) {
  const market = normalizeDisplayMarketLabel(entry.topRecommendation?.market || '');
  if (!market) {
    return `Ana Ã¶neri kaydÄ± yok. Model gÃ¼veni %${entry.confidenceScore}.`;
  }
  if (market.includes('1X')) {
    return `${entry.homeTeam} yenilmez Ã§izgisi Ã¶ne Ã§Ä±ktÄ±. Model gÃ¼veni %${entry.confidenceScore}.`;
  }
  if (market.includes('X2')) {
    return `${entry.awayTeam} yenilmez Ã§izgisi Ã¶ne Ã§Ä±ktÄ±. Model gÃ¼veni %${entry.confidenceScore}.`;
  }
  if (market.includes('Uzak Dur')) {
    return `Bu eÅŸleÅŸme iÃ§in uzak dur sinyali Ã¼retildi. Model gÃ¼veni %${entry.confidenceScore}.`;
  }
  return `Ana Ã¶neri ${market}. Model gÃ¼veni %${entry.confidenceScore}.`;
}

function sanitizePayload(value) {
  if (value == null) {
    return value;
  }

  if (typeof value === 'string') {
    return normalizeTurkishText(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item));
  }

  if (typeof value === 'object') {
    const next = {};
    for (const [key, item] of Object.entries(value)) {
      next[key] = sanitizePayload(item);
    }
    return next;
  }

  return value;
}


function isUnreadableText(value) {
  const text = String(value ?? '');
  if (!text.trim()) {
    return false;
  }

  const mojibakeHits = (text.match(/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/g) ?? []).length;
  const replacementHits = (text.match(/\uFFFD/g) ?? []).length;
  const controlHits = (text.match(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g) ?? []).length;
  const questionBurstHits = (text.match(/\?{3,}/g) ?? []).length * 2;
  const score = mojibakeHits + replacementHits + controlHits + questionBurstHits;
  if (mojibakeHits >= 2) {
    return true;
  }
  return score >= 4;
}

function normalizeErrorMessage(error, fallback = 'Beklenmeyen hata') {
  const raw = String(error ?? '').replace(/^Error:\s*/i, '').trim();
  const normalized = cleanText(raw, '');
  if (!normalized || isUnreadableText(normalized)) {
    return fallback;
  }
  return normalized;
}

function cleanText(value, fallback = '-') {
  const normalized = normalizeTurkishText(value ?? '');
  const collapsed = String(normalized)
    .replaceAll('\uFEFF', '')
    .replaceAll('\uFFFD', '')
    .replaceAll('\u00E2\u20AC\u00A2', 'â€¢')
    .replaceAll('\u00C3\u00A2\u201A\u00AC\u00A2', 'â€¢')
    .replaceAll('\u00E2\u20AC\u201C', '-')
    .replaceAll('\u00E2\u20AC\u201D', '-')
    .replaceAll('\u00E2\u20AC\u2122', "'")
    .replaceAll('\u00E2\u20AC\u0153', '"')
    .replaceAll('\u00E2\u20AC\u009D', '"')
    .replace(/\s*â€¢\s*/g, ' â€¢ ')
    .replace(/\s+/g, ' ')
    .trim();

  if (isUnreadableText(collapsed)) {
    return fallback;
  }

  return collapsed || fallback;
}

function compactText(value, maxLength = 170) {
  const text = cleanText(value, '');
  if (text.length <= maxLength) {
    return text;
  }

  const shortened = text.slice(0, maxLength);
  const boundary = Math.max(shortened.lastIndexOf('. '), shortened.lastIndexOf(', '), shortened.lastIndexOf(' '));
  const cutIndex = boundary >= Math.floor(maxLength * 0.55) ? boundary : maxLength;
  return `${shortened.slice(0, cutIndex).trimEnd()}...`;
}

function joinMeta(parts) {
  return parts
    .map((part) => cleanText(part, ''))
    .filter(Boolean)
    .join(' â€¢ ');
}

function cleanSourceLabel(label, sourceStatus = null, demoMode = false) {
  if (demoMode) {
    return 'Demo veri';
  }

  const mode = cleanText(sourceStatus?.mode, '').toLowerCase();
  if (mode === 'statistics_api') {
    return 'Ä°statistik API';
  }
  if (mode === 'html_fallback') {
    return 'HTML yedek akÄ±ÅŸ';
  }
  if (mode === 'html_direct') {
    return 'HTML Ã§Ã¶zÃ¼mleme';
  }
  if (mode === 'html_source') {
    return 'Harici sayfa';
  }

  const labelText = cleanText(label, '');
  const lowered = labelText.toLocaleLowerCase('tr-TR');
  if (lowered.includes('statistics') || lowered.includes('istatistik')) {
    return 'Ä°statistik API';
  }
  if (lowered.includes('gÃ¼nlÃ¼k program') || lowered.includes('gÃ¼nlÃ¼k program')) {
    const sport = labelText.split('-').map((item) => cleanText(item, '')).filter(Boolean).at(-1);
    return sport ? 'Ä°ddaa gÃ¼nlÃ¼k programÄ± â€¢ ' + sport : 'Ä°ddaa gÃ¼nlÃ¼k programÄ±';
  }
  if (lowered.includes('yedek')) {
    return 'HTML yedek akÄ±ÅŸ';
  }
  if (lowered.includes('html')) {
    return 'HTML Ã§Ã¶zÃ¼mleme';
  }
  if (lowered.includes('harici')) {
    return 'Harici sayfa';
  }

  const statusText = cleanText(sourceStatus?.label, '');
  return statusText || labelText || 'Veri kaynaÄŸÄ±';
}

function resolveMetaLine(locationType, sourceStatus) {
  const text = cleanText(locationType, '');
  if (!text) {
    return cleanSourceLabel(sourceStatus?.label, sourceStatus);
  }

  const strippedServicePrefix = text.replace(/^iddaa(?:\.com)?\s+istatistik servisi\s*/i, '').trim();
  if (strippedServicePrefix && strippedServicePrefix !== text && /(stad|stadyum|arena|park)/i.test(strippedServicePrefix)) {
    return strippedServicePrefix;
  }

  const parts = text
    .split(/\s(?:â€¢|-)\s/g)
    .map((part) => cleanText(part, ''))
    .filter(Boolean);
  const venue = parts.find((part) => /(stad|stadyum|arena|park)/i.test(part));
  return venue || parts.at(-1) || text;
}

function safeText(value) {
  return escapeHtml(cleanText(value));
}

function setNormalizedHtml(target, html) {
  if (!target) return;
  target.innerHTML = normalizeTurkishText(String(html ?? ''));
  normalizeDomContent(target);
}

function installNormalizationObserver() {
  // disabled in ascii mode
}

function applyStaticText() {
  settingsToggle.textContent = 'AI AyarlarÄ±';
  clearHistoryBtn.textContent = 'Temizle';
  if (analyzeBtn) {
    analyzeBtn.textContent = 'Analiz Et';
  }
  if (scanBtn) {
    scanBtn.textContent = 'MaÃ§larÄ± Tara';
  }
  if (liveScanBtn) {
    liveScanBtn.textContent = 'CanlÄ± MaÃ§larÄ± Sorgula';
  }

  matchUrlInput.placeholder = 'GeÃ§miÅŸ skor, maÃ§ detay, gÃ¼nlÃ¼k program veya canlÄ± program baÄŸlantÄ±sÄ±nÄ± yapÄ±ÅŸtÄ±r';
  scanLeagueFilter.placeholder = 'Ã–rnek: SÃ¼per Lig, Premier League, Serie A';
  if (scanLeagueWhitelist) {
    scanLeagueWhitelist.placeholder = 'Ã–rnek: Premier League, SÃ¼per Lig';
  }
  if (scanLeagueBlacklist) {
    scanLeagueBlacklist.placeholder = 'Ã–rnek: U19, KadÄ±n, GenÃ§ler';
  }
  if (scanPresetName) {
    scanPresetName.placeholder = 'Ã–rnek: Avrupa Ã¼st ligler';
  }

  const presetSelectLabel = document.querySelector('label[for="scanPresetSelect"] span');
  if (presetSelectLabel) {
    presetSelectLabel.textContent = 'Lig ÅŸablonu';
  }
  const presetNameLabel = document.querySelector('label[for="scanPresetName"] span');
  if (presetNameLabel) {
    presetNameLabel.textContent = 'Åablon adÄ±';
  }
  if (scanPresetSelect) {
    const defaultOption = scanPresetSelect.querySelector('option[value=""]');
    if (defaultOption) {
      defaultOption.textContent = 'Bir ÅŸablon seÃ§';
    }
  }
}

function normalizeDomContent(root) {
  if (!root || typeof document === 'undefined') return;
  const host = root.nodeType === 1 || root.nodeType === 9 ? root : document.body;
  if (!host) return;

  const normalizeInline = (value) =>
    normalizeTurkishText(String(value ?? ''))
      .replaceAll('\uFFFD', ' ')
      .replaceAll('\uFFFD', ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

  const walker = document.createTreeWalker(
    host,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node || !node.nodeValue) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const textUpdates = [];
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const raw = node.nodeValue ?? '';
    const normalized = normalizeInline(raw);
    if (normalized && normalized !== raw) {
      textUpdates.push([node, normalized]);
    }
  }
  textUpdates.forEach(([node, value]) => {
    node.nodeValue = value;
  });

  const attrs = ['placeholder', 'title', 'aria-label', 'aria-description'];
  host.querySelectorAll?.('*')?.forEach((el) => {
    attrs.forEach((attr) => {
      const raw = el.getAttribute?.(attr);
      if (!raw) return;
      const normalized = normalizeInline(raw);
      if (normalized && normalized !== raw) {
        el.setAttribute(attr, normalized);
      }
    });

    if (el instanceof HTMLInputElement) {
      const buttonLike = el.type === 'button' || el.type === 'submit' || el.type === 'reset';
      if (buttonLike && el.value) {
        const normalizedValue = normalizeInline(el.value);
        if (normalizedValue && normalizedValue !== el.value) {
          el.value = normalizedValue;
        }
      }
    }
  });
}
function scoreTextCorruption(value) {
  return (String(value ?? '').match(/[\u00C3\u00C2\u00C5\u00C4\u00E2\uFFFD]/g) ?? []).length;
}

function scoreTurkishLetters(value) {
  return (String(value ?? '').match(/[Ä±Ä°ÅŸÅÄŸÄÃ¼ÃœÃ¶Ã–Ã§Ã‡]/g) ?? []).length;
}

function mojibakeScore(value) {
  return scoreTextCorruption(value);
}

if (typeof globalThis !== 'undefined') {
  globalThis.mojibakeScore = mojibakeScore;
}
if (typeof window !== 'undefined') {
  window.mojibakeScore = mojibakeScore;
}

const CP1252_REVERSE_MAP = Object.freeze({
  0x20ac: 0x80,
  0x201a: 0x82,
  0x0192: 0x83,
  0x201e: 0x84,
  0x2026: 0x85,
  0x2020: 0x86,
  0x2021: 0x87,
  0x02c6: 0x88,
  0x2030: 0x89,
  0x0160: 0x8a,
  0x2039: 0x8b,
  0x0152: 0x8c,
  0x017d: 0x8e,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x2013: 0x96,
  0x2014: 0x97,
  0x02dc: 0x98,
  0x2122: 0x99,
  0x0161: 0x9a,
  0x203a: 0x9b,
  0x0153: 0x9c,
  0x017e: 0x9e,
  0x0178: 0x9f
});

function decodeUtf8FromLegacyBytes(input) {
  const text = String(input ?? '');
  const bytes = [];
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code <= 0xff) {
      bytes.push(code);
      continue;
    }
    const mapped = CP1252_REVERSE_MAP[code];
    if (mapped == null) {
      return text;
    }
    bytes.push(mapped);
  }
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(new Uint8Array(bytes));
  } catch {
    return text;
  }
}

function decodeMojibakeEscape(input) {
  const text = String(input ?? '');
  try {
    return decodeURIComponent(escape(text));
  } catch {
    return text;
  }
}

function decodeMojibakeUtf8(input) {
  return decodeUtf8FromLegacyBytes(input);
}

function repairMojibake(value) {
  let result = String(value ?? '');

  for (let pass = 0; pass < 6; pass += 1) {
    let next = result;

    for (const [source, target] of MOJIBAKE_FIXES) {
      next = next.replaceAll(source, target);
    }

    const decoded = decodeUtf8FromLegacyBytes(next);
    if (decoded && decoded !== next) {
      const currentScore = scoreTextCorruption(next);
      const decodedScore = scoreTextCorruption(decoded);
      if (decodedScore < currentScore || (decodedScore === currentScore && decoded.length >= next.length - 2)) {
        next = decoded;
      }
    }

    if (next === result) {
      break;
    }

    result = next;
  }

  return result.normalize('NFC');
}

function toAsciiText(value) {
  let text = String(value ?? '');
  if (!text) return '';

  text = text
    .replaceAll('Ã¼', 'u')
    .replaceAll('Ãœ', 'U')
    .replaceAll('Ã¶', 'o')
    .replaceAll('Ã–', 'O')
    .replaceAll('Ã§', 'c')
    .replaceAll('Ã‡', 'C')
    .replaceAll('Ã¼', 'u')
    .replaceAll('Ãœ', 'U')
    .replaceAll('Ã¶', 'o')
    .replaceAll('Ã–', 'O')
    .replaceAll('Ã§', 'c')
    .replaceAll('Ã‡', 'C')
    .replaceAll('Ä±', 'i')
    .replaceAll('Ä°', 'I')
    .replaceAll('ÄŸ', 'g')
    .replaceAll('Ä', 'G')
    .replaceAll('ÅŸ', 's')
    .replaceAll('Å', 'S')
    .replaceAll('Ä±', 'i')
    .replaceAll('Ä°', 'I')
    .replaceAll('ÄŸ', 'g')
    .replaceAll('Ä', 'G')
    .replaceAll('ÅŸ', 's')
    .replaceAll('Å', 'S')
    .replaceAll('Ã½', 'i')
    .replaceAll('Ã', 'I')
    .replaceAll('Ã¾', 's')
    .replaceAll('Ã', 'S')
    .replaceAll('Ã°', 'g')
    .replaceAll('Ã', 'G')
    .replaceAll('â€¢', ' - ')
    .replaceAll('â€“', '-')
    .replaceAll('â€”', '-')
    .replaceAll('â€™', "'")
    .replaceAll('â€œ', '"')
    .replaceAll('â€', '"')
    .replaceAll('\uFFFD', ' ')
    .replaceAll('\u00EF\u00BF\u00BD', ' ');

  text = text
    .replaceAll('Ä±', 'i')
    .replaceAll('Ä°', 'I')
    .replaceAll('ÅŸ', 's')
    .replaceAll('Å', 'S')
    .replaceAll('ÄŸ', 'g')
    .replaceAll('Ä', 'G')
    .replaceAll('Ã¼', 'u')
    .replaceAll('Ãœ', 'U')
    .replaceAll('Ã¶', 'o')
    .replaceAll('Ã–', 'O')
    .replaceAll('Ã§', 'c')
    .replaceAll('Ã‡', 'C');

  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\x00-\x08\x0B-\x1F\x7F-\x9F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeTurkishText(value) {
  const original = String(value ?? '');
  if (!original) {
    return '';
  }

  let normalized = original;
  if (MOJIBAKE_MARKER.test(original)) {
    const repaired = repairMojibake(original);
    if (repaired && repaired.length >= Math.max(1, original.length - 4)) {
      normalized = repaired;
    }
  }

  const withFixes = TURKISH_FIXES.reduce((acc, [source, target]) => acc.replaceAll(source, target), normalized);
  return FORCE_ASCII_TEXT ? toAsciiText(withFixes) : withFixes;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}







































































































































































































































