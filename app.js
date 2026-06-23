const STORAGE_KEY = "life-wall-private-prototype-v1";

const themes = [
  {
    id: "emerald",
    name: "深绿",
    note: "默认主视觉",
    primary: "#17382f",
    secondary: "#2f6656",
    accent: "#c3d978",
    warm: "#df7b42"
  },
  {
    id: "mist",
    name: "雾蓝",
    note: "安静清爽",
    primary: "#24394a",
    secondary: "#6b8d9a",
    accent: "#c8dad8",
    warm: "#d58b65"
  },
  {
    id: "cream",
    name: "奶油白",
    note: "柔和明亮",
    primary: "#75684d",
    secondary: "#c7b68d",
    accent: "#f1dfac",
    warm: "#c9784d"
  },
  {
    id: "amber",
    name: "暖橙",
    note: "温暖生活感",
    primary: "#593624",
    secondary: "#b96d42",
    accent: "#f0c27b",
    warm: "#d85b35"
  },
  {
    id: "violet",
    name: "灰紫",
    note: "克制浪漫",
    primary: "#373146",
    secondary: "#7d718f",
    accent: "#d9c8e7",
    warm: "#c77a64"
  },
  {
    id: "ink",
    name: "墨黑",
    note: "更沉稳",
    primary: "#111917",
    secondary: "#44504a",
    accent: "#aeb9a2",
    warm: "#c56f3d"
  }
];

const defaultEntries = [
  {
    id: "entry-letter-1",
    type: "letter",
    title: "写给TA",
    body: "有些话，放在心里很久了。今天想慢慢写给你，不急着你看完，也不需要立刻回应。",
    date: "2026-05-16",
    author: "我",
    words: 1283,
    important: true
  },
  {
    id: "entry-photo-1",
    type: "photo",
    title: "第一次一起旅行的日子",
    body: "那天的海风很温柔，阳光刚刚好。我们在陌生的城市，却有了熟悉的感觉。",
    date: "2026-05-12",
    author: "TA",
    important: true
  },
  {
    id: "entry-plan-1",
    type: "plan",
    title: "周末一起做早餐",
    body: "买新鲜的食材；尝试一个新食谱",
    date: "2026-05-11",
    author: "我",
    done: 1,
    total: 2
  },
  {
    id: "entry-message-1",
    type: "message",
    title: "关于我们的100件小事",
    body: "想到一起去看一场展览，一起养一盆植物，一起把普通日子过得更有记忆点。",
    date: "2026-05-06",
    author: "TA"
  },
  {
    id: "entry-message-2",
    type: "message",
    title: "今天想记录一句",
    body: "刚睡醒的时候突然想到你。天气有点阴，但心里不是。",
    date: "2026-06-22",
    author: "我"
  }
];

const defaultState = {
  activeScreen: "home",
  activeFilter: "all",
  themeId: "emerald",
  intensity: 0,
  angle: 135,
  entries: defaultEntries,
  weather: {
    city: "杭州",
    temperature: 22,
    condition: "小雨",
    suggestion: "出门记得带伞",
    tags: ["午后有雨", "紫外线偏强"]
  }
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function loadState() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...defaultState,
      ...stored,
      weather: { ...defaultState.weather, ...(stored.weather || {}) },
      entries: Array.isArray(stored.entries) ? stored.entries : defaultEntries
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function themeById(id = state.themeId) {
  return themes.find((theme) => theme.id === id) || themes[0];
}

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255
  };
}

function rgbToHex({ r, g, b }) {
  const toHex = (number) => Math.round(Math.max(0, Math.min(255, number))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mix(hex, amount) {
  const rgb = hexToRgb(hex);
  const target = amount >= 0 ? { r: 255, g: 255, b: 255 } : { r: 0, g: 0, b: 0 };
  const weight = Math.abs(amount);
  return rgbToHex({
    r: rgb.r + (target.r - rgb.r) * weight,
    g: rgb.g + (target.g - rgb.g) * weight,
    b: rgb.b + (target.b - rgb.b) * weight
  });
}

function applyTheme() {
  const theme = themeById();
  const tone = Number(state.intensity || 0) / 100;
  const primary = mix(theme.primary, tone);
  const secondary = mix(theme.secondary, tone * .7);
  const root = document.documentElement;
  root.style.setProperty("--primary", primary);
  root.style.setProperty("--secondary", secondary);
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--warm", theme.warm);
  root.style.setProperty("--gradient-angle", `${state.angle || 135}deg`);
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", primary);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function weekdayFor(dateString) {
  const day = new Date(`${dateString}T00:00:00`).getDay();
  return ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][day];
}

function shortDate(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return `${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

function typeMeta(type) {
  return {
    letter: { label: "长信", icon: "▧", color: "orange" },
    message: { label: "留言", icon: "▤", color: "" },
    plan: { label: "计划", icon: "☑", color: "orange" },
    photo: { label: "照片", icon: "▣", color: "orange" }
  }[type] || { label: "记录", icon: "•", color: "" };
}

function sortedEntries() {
  return [...state.entries].sort((a, b) => b.date.localeCompare(a.date));
}

function countByType(type) {
  if (type === "message") return state.entries.filter((entry) => entry.type === "message").length;
  if (type === "letter") return state.entries.filter((entry) => entry.type === "letter").length;
  if (type === "plan") return state.entries.filter((entry) => entry.type === "plan").length;
  return state.entries.length;
}

function entryBody(entry) {
  if (entry.type !== "plan") return `<p class="entry-body">${entry.body}</p>`;
  const items = entry.body.split(/[;；\n]/).filter(Boolean);
  return `
    <div class="plan-preview">
      ${items.map((item, index) => `
        <div class="plan-row ${index < (entry.done || 0) ? "done" : ""}">
          <span class="check-box">${index < (entry.done || 0) ? "✓" : ""}</span>
          <span>${item.trim()}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function renderEntry(entry, options = {}) {
  const meta = typeMeta(entry.type);
  const footer = entry.type === "letter"
    ? `共 ${entry.words || Math.max(120, entry.body.length * 2)} 字`
    : entry.type === "plan"
      ? `已完成 ${entry.done || 0}/${entry.total || Math.max(1, entry.body.split(/[;；\n]/).filter(Boolean).length)}`
      : `${entry.author || "我"} 添加`;
  return `
    <article class="timeline-item">
      <div class="timeline-date">
        <div class="date-pill">
          <b>${shortDate(entry.date)}</b>
          <small>${weekdayFor(entry.date)}</small>
        </div>
        <span class="date-dot ${meta.color}"></span>
      </div>
      <div class="entry-card">
        <div class="entry-top">
          <div class="entry-icon">${meta.icon}</div>
          <div class="entry-title">
            <h3>${entry.title}</h3>
            ${options.showDate ? `<small>${entry.date}</small>` : ""}
          </div>
          <span class="tag ${meta.color}">${meta.label}</span>
        </div>
        ${entryBody(entry)}
        <div class="entry-footer">
          <small>${footer}</small>
          ${entry.type === "photo" ? `<div class="thumbnail" aria-hidden="true"></div>` : `<span class="muted">›</span>`}
        </div>
      </div>
    </article>
  `;
}

function renderWeatherBar() {
  const weather = state.weather;
  return `
    <aside class="weather-bar" aria-label="今日天气">
      <div class="weather-main">
        <div class="weather-title">
          <div class="weather-icon">☔</div>
          <div>
            <b>今日天气</b>
            <small>${weather.city} · ${weather.condition}</small>
          </div>
        </div>
        <div class="temperature">${weather.temperature}°</div>
      </div>
      <div class="weather-chips">
        <span class="chip">${weather.suggestion}</span>
        ${weather.tags.map((tag, index) => `<span class="chip ${index ? "warn" : ""}">${tag}</span>`).join("")}
      </div>
    </aside>
  `;
}

function renderHome() {
  const entries = sortedEntries().slice(0, 4);
  $("#homeScreen").innerHTML = `
    ${renderWeatherBar()}
    <section class="summary-card">
      <h2>我们的生活墙</h2>
      <p>把日常的点滴，留在只属于我们的时光里。</p>
      <div class="metrics-row">
        <div class="metric"><b>${countByType("message")}</b><small>条留言</small></div>
        <div class="metric"><b>${countByType("letter")}</b><small>封长信</small></div>
        <div class="metric"><b>${countByType("plan")}</b><small>个计划</small></div>
      </div>
    </section>
    <div class="section-heading">
      <div>
        <h3>最近更新</h3>
        <p>不做聊天，只留值得回看的片段</p>
      </div>
      <span class="status-pill">我和TA</span>
    </div>
    <div class="timeline-list">${entries.map((entry) => renderEntry(entry)).join("")}</div>
  `;
}

function renderFilter(active) {
  const filters = [
    ["all", "全部"],
    ["letter", "长信"],
    ["message", "留言"],
    ["plan", "计划"],
    ["photo", "照片"]
  ];
  return `
    <div class="timeline-filter">
      ${filters.map(([id, label]) => `
        <button class="filter-button ${active === id ? "active" : ""}" data-filter="${id}">${label}</button>
      `).join("")}
    </div>
  `;
}

function renderTimeline() {
  const active = state.activeFilter || "all";
  const entries = sortedEntries().filter((entry) => active === "all" || entry.type === active);
  $("#timelineScreen").innerHTML = `
    <section class="summary-card">
      <h2>本月记录</h2>
      <p>长信、留言、计划和照片都会在这里慢慢沉淀。</p>
      <div class="metrics-row">
        <div class="metric"><b>${state.entries.length}</b><small>条记录</small></div>
        <div class="metric"><b>${countByType("letter")}</b><small>封长信</small></div>
        <div class="metric"><b>${countByType("plan")}</b><small>个计划</small></div>
      </div>
    </section>
    ${renderFilter(active)}
    <div class="timeline-list">
      ${entries.length ? entries.map((entry) => renderEntry(entry, { showDate: true })).join("") : `<div class="empty-state">这里还没有对应记录</div>`}
    </div>
  `;
  $$(".filter-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeFilter = button.dataset.filter;
      saveState();
      renderTimeline();
    });
  });
}

function renderThemeScreen() {
  const activeTheme = themeById();
  $("#themeScreen").innerHTML = `
    <section class="theme-card">
      <h3>主题色</h3>
      <div class="theme-grid">
        ${themes.map((theme) => `
          <button class="theme-option ${theme.id === state.themeId ? "active" : ""}" data-theme="${theme.id}">
            <div class="swatch" style="--swatch-gradient: linear-gradient(135deg, ${theme.primary}, ${theme.secondary})"></div>
            <div class="theme-row">
              <div><b>${theme.name}</b><small>${theme.note}</small></div>
              <span class="theme-icon">✓</span>
            </div>
          </button>
        `).join("")}
      </div>
    </section>
    <section class="settings-card">
      <h3>渐变微调</h3>
      <div class="slider-row">
        <label for="intensityRange">深浅</label>
        <input id="intensityRange" type="range" min="-20" max="18" value="${state.intensity || 0}">
      </div>
      <p class="setting-copy">只允许在预设主题内微调，避免自由配色带来的廉价感。</p>
      <div class="direction-buttons">
        ${[
          [135, "↘"],
          [90, "↓"],
          [45, "↙"],
          [180, "→"]
        ].map(([angle, label]) => `
          <button class="direction-button ${Number(state.angle) === angle ? "active" : ""}" data-angle="${angle}">${label}</button>
        `).join("")}
      </div>
    </section>
    <section class="settings-card">
      <h3>首页预览</h3>
      <div class="preview-stack">
        <div class="mini-preview">
          <b>${activeTheme.name} · 生活墙</b>
          <p>顶部渐变、按钮、标签和导航会一起变化。</p>
        </div>
        <div class="mini-card"><b>今日天气</b><p class="muted">杭州 22° 小雨 · 出门记得带伞</p></div>
        <div class="mini-card"><b>留言墙</b><p class="muted">卡片内容保持白色，减少视觉噪音。</p></div>
      </div>
    </section>
    <section class="settings-card">
      <div class="profile-pair">
        <div>
          <h3>共享设置</h3>
          <p class="setting-copy">两人空间，内容只在这个原型本地保存。</p>
        </div>
        <div class="avatar-pair" aria-label="我和TA">
          <span class="avatar">我</span>
          <span class="avatar">TA</span>
        </div>
      </div>
    </section>
  `;

  $$(".theme-option").forEach((button) => {
    button.addEventListener("click", () => {
      state.themeId = button.dataset.theme;
      saveState();
      renderAll();
      showToast(`已切换到${themeById().name}主题`);
    });
  });

  $("#intensityRange").addEventListener("input", (event) => {
    state.intensity = Number(event.target.value);
    applyTheme();
    saveState();
  });

  $$(".direction-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.angle = Number(button.dataset.angle);
      saveState();
      renderAll();
    });
  });
}

function setScreen(screen) {
  state.activeScreen = screen;
  saveState();
  $$(".screen").forEach((section) => section.classList.remove("active"));
  $$(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.screen === screen));
  $("#homeScreen").classList.toggle("active", screen === "home");
  $("#timelineScreen").classList.toggle("active", screen === "timeline");
  $("#themeScreen").classList.toggle("active", screen === "theme");
  const titles = {
    home: ["SHARED WALL", "生活墙"],
    timeline: ["TIMELINE", "时间线"],
    theme: ["STYLE", "个性化"]
  };
  $("#screenEyebrow").textContent = titles[screen][0];
  $("#screenTitle").textContent = titles[screen][1];
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderAll() {
  applyTheme();
  renderHome();
  renderTimeline();
  renderThemeScreen();
  setScreen(state.activeScreen || "home");
}

function addEntry(event) {
  event.preventDefault();
  const type = $("#entryType").value;
  const title = $("#entryTitle").value.trim();
  const body = $("#entryBody").value.trim();
  if (!title || !body) {
    showToast("标题和内容都要写一点");
    return;
  }
  const today = new Date();
  const entry = {
    id: `${type}-${Date.now()}`,
    type,
    title,
    body,
    date: today.toISOString().slice(0, 10),
    author: "我"
  };
  if (type === "letter") entry.words = Math.max(120, body.length * 2);
  if (type === "plan") {
    const count = Math.max(1, body.split(/[;；\n]/).filter(Boolean).length);
    entry.total = count;
    entry.done = 0;
  }
  state.entries.unshift(entry);
  state.activeScreen = type === "letter" || type === "photo" ? "timeline" : "home";
  state.activeFilter = "all";
  saveState();
  $("#composerDialog").close();
  $("#composerForm").reset();
  renderAll();
  showToast("已添加到生活墙");
}

function bindEvents() {
  $$(".nav-item").forEach((item) => {
    item.addEventListener("click", () => setScreen(item.dataset.screen));
  });

  $("#openComposer").addEventListener("click", () => {
    $("#composerDialog").showModal();
    setTimeout(() => $("#entryTitle").focus(), 50);
  });

  $("#cancelComposer").addEventListener("click", () => {
    $("#composerDialog").close();
  });

  $("#closeComposer").addEventListener("click", () => {
    $("#composerDialog").close();
  });

  $("#composerForm").addEventListener("submit", addEntry);

  $("#searchBtn").addEventListener("click", () => showToast("搜索会在下一版接入"));
  $("#moreBtn").addEventListener("click", () => showToast("这里会放配对和隐私设置"));
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

bindEvents();
renderAll();
