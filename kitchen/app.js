/* ============================================================
   Наша кухня — домашнее меню
   ============================================================ */

/* ---------- Состояние ---------- */

const state = {
  userData: {
    elya: { favorites: [], ratings: {}, reviews: {} },
    sanya: { favorites: [], ratings: {}, reviews: {} }
  },
  customDishes: [],    // блюда, добавленные через интерфейс
  editedDishes: {},    // id -> обновлённый объект блюда (изменения)
  deletedDishIds: [],  // id удалённых блюд
  dishNotes: {}        // заметки к блюдам (общие для обоих)
};

let currentUser = null;   // "elya" | "sanya" | "guest"
let cartIds = [];         // id блюд в корзине покупок
let pendingLogin = null;  // аккаунт, ожидающий ввод пароля
let editingDishId = null; // id редактируемого блюда (null — новое)
let editingIngredientCount = 3;
let randomState = {
  category: "",
  garnish: "",
  status: "",
  maxTime: 0,
  difficulty: ""
};

/* ---------- Авторизация ---------- */

function getRole() {
  return currentUser && USERS[currentUser] ? USERS[currentUser].role : "viewer";
}

function isGuest() {
  return getRole() === "viewer";
}

function canInteract() {
  return !isGuest(); // избранное, оценки, заметки, корзина
}

function canCreate() {
  return ["creator", "admin"].includes(getRole());
}

function canEdit() {
  return getRole() === "admin";
}

function canDelete() {
  return getRole() === "admin";
}

function getUser(key) {
  return USERS[key] || USERS.guest;
}

function meUser() {
  return getUser(currentUser);
}

// HTML аватара: если есть картинка — <img> с откатом на букву при ошибке
function avatarHtml(user, className) {
  const letter = escapeHtml(user.avatar || "?");
  const style = `background:${user.color || "#888"}`;
  if (user.avatarImg) {
    return `<span class="${className}" style="${style}">` +
           `<img src="${user.avatarImg}" alt="${letter}" ` +
           `onerror="this.style.display='none';this.nextElementSibling.style.display=''" ` +
           `loading="lazy" />` +
           `<span style="display:none">${letter}</span></span>`;
  }
  return `<span class="${className}" style="${style}">${letter}</span>`;
}

function otherUserKey() {
  if (isGuest()) return "elya";
  return currentUser === "elya" ? "sanya" : "elya";
}

/* ---------- Хранение ---------- */

const API_URL = KITCHEN_CONFIG.API_URL;

// Флаг "оффлайн": если сервер недоступен, работаем с локальным кэшем
let apiAvailable = null;

// Токен авторизации — хранится в localStorage, отправляется с каждым запросом
function getToken() {
  return localStorage.getItem(KITCHEN_CONFIG.TOKEN_KEY) || "";
}

function setToken(token) {
  if (token) localStorage.setItem(KITCHEN_CONFIG.TOKEN_KEY, token);
  else localStorage.removeItem(KITCHEN_CONFIG.TOKEN_KEY);
}

// URL с токеном (токен в query-параметре — работает на любом сервере)
function apiUrl(action) {
  const token = getToken();
  let url = API_URL + "?action=" + action;
  if (token) url += "&auth=" + encodeURIComponent(token);
  return url;
}

// Заголовки для POST-запросов
function postHeaders(extra) {
  return Object.assign({ "Content-Type": "application/json" }, extra || {});
}

async function loadState() {
  let serverConfirmed = false;
  try {
    const res = await fetch(apiUrl("init"), {
      credentials: "same-origin"
    });
    if (!res.ok) throw new Error("init failed: " + res.status);
    const json = await res.json();
    apiAvailable = true;
    applyServerData(json.data);
    // Сессия с сервера (определяется по токену)
    if (json.session && json.session.user && USERS[json.session.user]) {
      currentUser = json.session.user;
      serverConfirmed = true;
      // Сервер подтвердил — синхронизируем локальное сохранение
      localStorage.setItem(KITCHEN_CONFIG.USER_KEY, currentUser);
    }
    // Кэшируем последнее состояние локально (на случай недоступности сервера)
    localStorage.setItem(KITCHEN_CONFIG.STORAGE_KEY, JSON.stringify(state));
  } catch (_e) {
    apiAvailable = false;
    loadStateFromStorage();
  }

  // Если сервер НЕ подтвердил вход (guest или ошибка) — пробуем восстановить локально
  if (!serverConfirmed) {
    const savedUser = localStorage.getItem(KITCHEN_CONFIG.USER_KEY);
    if (savedUser && USERS[savedUser] && savedUser !== "guest") {
      currentUser = savedUser;
      // Если сервер недоступен — работаем офлайн; если доступен, но не подтвердил —
      // всё равно работаем локально (синхронизация возобновится при повторном логине)
      if (apiAvailable) {
        // Сервер ответил, но токен не валиден — сбрасываем токен, чтобы при следующем
        // логине получить свежий
        setToken("");
      }
    } else {
      currentUser = "guest";
    }
  }
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem(KITCHEN_CONFIG.STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    applyServerData(parsed);
  } catch (_e) {
    /* ignore */
  }
}

// Применяет данные с сервера/кэша к текущему state
function applyServerData(data) {
  if (!data) return;
  if (data.userData) {
    Object.keys(state.userData).forEach(key => {
      if (data.userData[key]) {
        const ud = data.userData[key];
        state.userData[key] = {
          favorites: Array.isArray(ud.favorites) ? ud.favorites : [],
          // ratings и reviews — объекты (маппинги), не массивы
          ratings: Array.isArray(ud.ratings) && ud.ratings.length === 0 ? {} : (ud.ratings || {}),
          reviews: Array.isArray(ud.reviews) && ud.reviews.length === 0 ? {} : (ud.reviews || {})
        };
      }
    });
  }
  if (Array.isArray(data.customDishes)) state.customDishes = data.customDishes.map(withNormalizedStatus);
  // editedDishes и dishNotes — объекты (маппинги), не массивы
  state.editedDishes = normalizeEditedDishes(data.editedDishes);
  state.dishNotes = Array.isArray(data.dishNotes) && data.dishNotes.length === 0 ? {} : (data.dishNotes || {});
  if (Array.isArray(data.deletedDishIds)) state.deletedDishIds = data.deletedDishIds;
}

// Приводит статусы в отредактированных блюдах к актуальному списку
function normalizeEditedDishes(data) {
  const map = Array.isArray(data) && data.length === 0 ? {} : (data || {});
  const out = {};
  Object.keys(map).forEach(k => {
    out[k] = withNormalizedStatus(map[k]);
  });
  return out;
}

function serverStateForStorage() {
  return JSON.parse(JSON.stringify(state));
}

// Сохранение: пишем в локальный кэш всегда, на сервер — если доступен
function saveState() {
  localStorage.setItem(KITCHEN_CONFIG.STORAGE_KEY, JSON.stringify(state));
  markSaved();
  if (apiAvailable && canInteract()) {
    saveStateToServer();
  }
}

function saveStateToServer() {
  const payload = JSON.stringify({ data: serverStateForStorage() });
  fetch(apiUrl("save"), {
    method: "POST",
    headers: postHeaders(),
    credentials: "same-origin",
    body: payload
  }).catch(err => {
    console.warn("Save to server failed:", err);
    apiAvailable = false;
  });
}

// Периодическое обновление данных с сервера (видно изменения другого пользователя)
let lastSaveTime = 0;

function markSaved() {
  lastSaveTime = Date.now();
}

async function refreshFromServer() {
  if (document.querySelector(".modal-overlay.active")) return; // не мешаем при открытых модалках
  if (Date.now() - lastSaveTime < 4000) return;               // не мешаем сразу после сохранения
  if (!apiAvailable) return;
  try {
    const res = await fetch(apiUrl("poll"), {
      credentials: "same-origin"
    });
    if (!res.ok) return;
    const json = await res.json();
    if (json.data) {
      applyServerData(json.data);
      renderGrid();
    }
  } catch (_e) {
    /* ignore */
  }
}

let pollTimer = null;
function startPolling() {
  if (pollTimer) return;
  pollTimer = setInterval(refreshFromServer, 30000);
  window.addEventListener("focus", refreshFromServer);
}

function loadCart() {
  try {
    const raw = localStorage.getItem(KITCHEN_CONFIG.CART_KEY);
    if (raw) cartIds = JSON.parse(raw);
  } catch (_e) {
    cartIds = [];
  }
}

function saveCart() {
  localStorage.setItem(KITCHEN_CONFIG.CART_KEY, JSON.stringify(cartIds));
}

/* ---------- Данные о блюдах ---------- */

// Миграция старых статусов: "Любимое" и "На каждый день" → "Ежедневное"
function normalizeStatus(status) {
  if (status === "Любимое" || status === "На каждый день") return "Ежедневное";
  return status || STATUSES[1];
}

function withNormalizedStatus(dish) {
  if (!dish) return dish;
  return Object.assign({}, dish, { status: normalizeStatus(dish.status) });
}

function getAllDishes() {
  const deleted = new Set(state.deletedDishIds);
  const result = [];
  DISHES.forEach(d => {
    if (deleted.has(d.id)) return;
    result.push(withNormalizedStatus(state.editedDishes[d.id] ? Object.assign({}, d, state.editedDishes[d.id]) : d));
  });
  state.customDishes.forEach(d => {
    if (deleted.has(d.id)) return;
    result.push(withNormalizedStatus(state.editedDishes[d.id] ? Object.assign({}, d, state.editedDishes[d.id]) : d));
  });
  return result;
}

function getDish(id) {
  return getAllDishes().find(d => d.id === Number(id));
}

function getUserData() {
  if (isGuest()) return { favorites: [], ratings: {}, reviews: {} };
  return state.userData[currentUser] || state.userData.elya;
}

function isFavorite(dishId) {
  return getUserData().favorites.includes(Number(dishId));
}

function getRating(dishId) {
  return getUserData().ratings[Number(dishId)] || 0;
}

function getReview(dishId) {
  return getUserData().reviews[Number(dishId)] || "";
}

function getNotes(dishId) {
  return state.dishNotes[Number(dishId)] || "";
}

function getDishRatingFor(dishId, userKey) {
  const ud = state.userData[userKey];
  return ud && ud.ratings ? (ud.ratings[Number(dishId)] || 0) : 0;
}

function getDishReviewFor(dishId, userKey) {
  const ud = state.userData[userKey];
  return ud && ud.reviews ? (ud.reviews[Number(dishId)] || "") : "";
}

/* ---------- Утилиты ---------- */

function formatTime(minutes) {
  if (!minutes) return "—";
  if (minutes < 60) return `${minutes} мин`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

function starString(value) {
  const filled = "★".repeat(value || 0);
  const empty = "☆".repeat(5 - (value || 0));
  return filled + empty;
}

function starsHtml(value, readonly) {
  let html = '<span class="rating-stars' + (readonly ? ' readonly' : '') + '" data-value="' + (value || 0) + '">';
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star${i <= (value || 0) ? " filled" : ""}" data-star="${i}">★</span>`;
  }
  html += "</span>";
  return html;
}

// Компактные звёзды для карточек (★ закрашенные + ☆ пустые)
function starsSpan(value) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="${i <= (value || 0) ? "on" : "off"}">★</span>`;
  }
  return html;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

function difficultyClass(difficulty) {
  if (difficulty === "Легко") return "chip--difficulty-easy";
  if (difficulty === "Средне") return "chip--difficulty-medium";
  return "chip--difficulty-hard";
}

/* ---------- Ссылки на DOM ---------- */

const dom = {};

function cacheDOM() {
  dom.loginOverlay = document.getElementById("loginOverlay");
  dom.loginAccounts = document.getElementById("loginAccounts");
  dom.loginPasswordBlock = document.getElementById("loginPasswordBlock");
  dom.loginUserName = document.getElementById("loginUserName");
  dom.loginPassword = document.getElementById("loginPassword");
  dom.loginSubmit = document.getElementById("loginSubmit");
  dom.loginBack = document.getElementById("loginBack");
  dom.loginError = document.getElementById("loginError");

  dom.sessionUser = document.getElementById("sessionUser");
  dom.searchInput = document.getElementById("searchInput");
  dom.filtersBtn = document.getElementById("filtersBtn");
  dom.filtersRow = document.getElementById("filtersRow");
  dom.randomBtn = document.getElementById("randomBtn");
  dom.addDishBtn = document.getElementById("addDishBtn");
  dom.filterCategory = document.getElementById("filterCategory");
  dom.filterGarnish = document.getElementById("filterGarnish");
  dom.filterStatus = document.getElementById("filterStatus");
  dom.filterDifficulty = document.getElementById("filterDifficulty");
  dom.filterTime = document.getElementById("filterTime");
  dom.resetFiltersBtn = document.getElementById("resetFiltersBtn");
  dom.dishCount = document.getElementById("dishCount");
  dom.dishGrid = document.getElementById("dishGrid");
  dom.emptyState = document.getElementById("emptyState");

  dom.cartFloating = document.getElementById("cartFloating");
  dom.cartBadge = document.getElementById("cartBadge");

  dom.favoritesBtn = document.getElementById("favoritesBtn");
  dom.favoritesCount = document.getElementById("favoritesCount");

  dom.dishModal = document.getElementById("dishModal");
  dom.randomModal = document.getElementById("randomModal");
  dom.shoppingModal = document.getElementById("shoppingModal");
  dom.favoritesModal = document.getElementById("favoritesModal");
  dom.editModal = document.getElementById("editModal");
  dom.dishModalContent = document.getElementById("dishModalContent");
  dom.randomModalContent = document.getElementById("randomModalContent");
  dom.shoppingModalContent = document.getElementById("shoppingModalContent");
  dom.favoritesModalContent = document.getElementById("favoritesModalContent");
  dom.editModalContent = document.getElementById("editModalContent");
}

/* ---------- Модалки ---------- */

function openModal(id) {
  document.getElementById(id).classList.add("active");
}

function closeModal(id) {
  document.getElementById(id).classList.remove("active");
}

/* ---------- Авторизация: UI ---------- */

function showLogin() {
  dom.loginOverlay.classList.remove("hidden");
  resetLoginForm();
}

function hideLogin() {
  dom.loginOverlay.classList.add("hidden");
}

function resetLoginForm() {
  pendingLogin = null;
  dom.loginPasswordBlock.classList.add("hidden");
  dom.loginError.classList.add("hidden");
  dom.loginPassword.value = "";
}

async function doLogin(key) {
  if (key === "guest") {
    currentUser = "guest";
    setToken("");
    localStorage.removeItem(KITCHEN_CONFIG.USER_KEY);
    hideLogin();
    applyUserUI();
    renderGrid();
    startPolling();
    return;
  }

  if (!pendingLogin) return;

  const password = dom.loginPassword.value.trim();
  dom.loginSubmit.textContent = "Входим...";
  dom.loginSubmit.disabled = true;
  dom.loginError.classList.add("hidden");

  try {
    const res = await fetch(API_URL + "?action=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ user: key, password: password })
    });
    let json = null;
    try { json = await res.json(); } catch (_pj) { /* не JSON — сервер вернул ошибку */ }
    if (json && json.ok && json.token) {
      currentUser = key;
      setToken(json.token);
      localStorage.setItem(KITCHEN_CONFIG.USER_KEY, key);
      apiAvailable = true;
      hideLogin();
      resetLoginForm();
      applyUserUI();
      renderGrid();
      startPolling();
    } else if (json && json.message) {
      // Сервер вернул понятную ошибку (напр. нет прав на запись)
      dom.loginError.textContent = "Ошибка: " + json.message;
      dom.loginError.classList.remove("hidden");
    } else if (json && json.ok === false) {
      dom.loginError.textContent = "Неверный пароль 🙈";
      dom.loginError.classList.remove("hidden");
    } else {
      // Ответ не JSON — скорее всего PHP-ошибка или файл не найден
      dom.loginError.textContent = "Сервер вернул ошибку (HTTP " + res.status + "). Проверьте, что api.php доступен.";
      dom.loginError.classList.remove("hidden");
    }
  } catch (_e) {
    dom.loginError.textContent = "Нет связи с сервером 😢 (адрес: " + API_URL + ")";
    dom.loginError.classList.remove("hidden");
  }

  dom.loginSubmit.textContent = "Войти";
  dom.loginSubmit.disabled = false;
}

async function logout() {
  currentUser = "guest";
  const token = getToken();
  setToken("");
  localStorage.removeItem(KITCHEN_CONFIG.USER_KEY);
  if (token) {
    try {
      await fetch(API_URL + "?action=logout&auth=" + encodeURIComponent(token), {
        credentials: "same-origin"
      });
    } catch (_e) {
      /* ignore */
    }
  }
  renderGrid();
  applyUserUI();
  showLogin();
}

function renderSessionUser() {
  const u = meUser();
  const roleLabel = isGuest() ? "просмотр" : "";
  dom.sessionUser.innerHTML = `
    ${avatarHtml(u, "session-user__avatar")}
    <span class="session-user__name">${escapeHtml(u.name)}${roleLabel ? " · " + escapeHtml(roleLabel) : ""}</span>
    <button type="button" class="session-user__logout" id="logoutBtn" title="Выйти">⏻</button>
  `;
  const logoutBtn = dom.sessionUser.querySelector("#logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
}

function applyUserUI() {
  renderSessionUser();
  dom.addDishBtn.classList.toggle("hidden", !canCreate());
  updateCartUI();
  updateFavoritesUI();
}

function updateCartUI() {
  const count = cartIds.length;
  dom.cartBadge.textContent = count;
  dom.cartBadge.style.display = count > 0 ? "" : "none";
  dom.cartFloating.classList.toggle("hidden", !canInteract());
}

function updateFavoritesUI() {
  const favs = canInteract() ? getUserData().favorites : [];
  dom.favoritesBtn.classList.toggle("hidden", !canInteract());
  dom.favoritesCount.textContent = favs.length;
}

/* ---------- Фильтры ---------- */

function fillSelect(select, options, allLabel) {
  select.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = allLabel;
  select.appendChild(all);
  options.forEach(opt => {
    const o = document.createElement("option");
    o.value = opt;
    o.textContent = opt;
    select.appendChild(o);
  });
}

function initFilters() {
  fillSelect(dom.filterCategory, CATEGORIES, "Все категории");
  fillSelect(dom.filterStatus, STATUSES, "Все статусы");
  fillSelect(dom.filterDifficulty, DIFFICULTIES, "Любая сложность");
  refreshGarnishFilter();
  // Время заполнено в HTML
}

// Список гарниров строится из актуальных блюд (в т.ч. добавленных позже)
function refreshGarnishFilter() {
  const garnishes = getAllGarnishes();
  const current = dom.filterGarnish.value;
  fillSelect(dom.filterGarnish, garnishes, "Любой гарнир");
  if (garnishes.includes(current)) dom.filterGarnish.value = current;
}

function toggleFilters() {
  const open = dom.filtersRow.classList.toggle("open");
  dom.filtersBtn.textContent = open ? "⚙️ Фильтры ▲" : "⚙️ Фильтры";
}

function getCurrentFilters() {
  return {
    search: dom.searchInput.value.trim().toLowerCase(),
    category: dom.filterCategory.value,
    garnish: dom.filterGarnish.value,
    status: dom.filterStatus.value,
    difficulty: dom.filterDifficulty.value,
    time: Number(dom.filterTime.value) || 0
  };
}

function filterDishes() {
  const f = getCurrentFilters();
  return getAllDishes().filter(d => {
    if (f.search) {
      const haystack = (d.name + " " + (d.garnish || "") + " " + (d.recipe ? d.recipe.join(" ") : "")).toLowerCase();
      if (!haystack.includes(f.search)) return false;
    }
    if (f.category && d.category !== f.category) return false;
    if (f.garnish && (d.garnish || "") !== f.garnish) return false;
    if (f.status && d.status !== f.status) return false;
    if (f.difficulty && d.difficulty !== f.difficulty) return false;
    if (f.time && (Number(d.cookTime) || 0) > f.time) return false;
    return true;
  });
}

/* ---------- Сетка блюд ---------- */

function renderDishCard(dish) {
  const card = document.createElement("article");
  card.className = "dish-card";
  card.dataset.dishId = dish.id;

  const users = isGuest() ? ["elya", "sanya"] : [currentUser, otherUserKey()];

  let imageHtml = "";
  if (dish.image) {
    imageHtml = `<img class="dish-card__image" src="${escapeHtml(dish.image)}" alt="${escapeHtml(dish.name)}" loading="lazy" />`;
  } else {
    imageHtml = `<div class="dish-card__placeholder">🍲</div>`;
  }

  const anyRating = users.some(k => getDishRatingFor(dish.id, k) > 0);
  const anyFav = users.some(k => state.userData[k].favorites.includes(dish.id));
  let ratingRow = "";
  if (anyRating || anyFav) {
    ratingRow = `
      <div class="dish-card__rating-row">
        <div class="rating-users">
          ${users.map(k => {
            const u = getUser(k);
            return `
              <span class="rating-user">
                ${avatarHtml(u, "rating-user__avatar")}
                <span class="rating-user__stars">${starsSpan(getDishRatingFor(dish.id, k))}</span>
              </span>
            `;
          }).join("")}
        </div>
      </div>
    `;
  }

  card.innerHTML = `
    ${imageHtml}
    <div class="dish-card__top">
      <h3 class="dish-card__name">${escapeHtml(dish.name)}</h3>
    </div>
    <div class="dish-card__badges">
      <span class="chip chip--category">${escapeHtml(dish.category)}</span>
      <span class="chip chip--time">⏱ ${formatTime(dish.cookTime)}</span>
      <span class="chip ${difficultyClass(dish.difficulty)}">${escapeHtml(dish.difficulty)}</span>
    </div>
    ${ratingRow}
  `;

  return card;
}

function renderGrid() {
  refreshGarnishFilter();
  const dishes = filterDishes();
  dom.dishGrid.innerHTML = "";
  dom.dishCount.textContent = `Найдено блюд: ${dishes.length}`;
  updateFavoritesUI();

  if (dishes.length === 0) {
    dom.emptyState.classList.remove("hidden");
    return;
  }
  dom.emptyState.classList.add("hidden");

  dishes.forEach(dish => {
    dom.dishGrid.appendChild(renderDishCard(dish));
  });
}

/* ---------- Детали блюда ---------- */

function renderDishDetail(dish) {
  const myRating = canInteract() ? getRating(dish.id) : 0;
  const myReview = canInteract() ? getReview(dish.id) : "";
  const notes = getNotes(dish.id);
  const fav = canInteract() && isFavorite(dish.id);
  const inCart = canInteract() && cartIds.includes(dish.id);

  let imageHtml = "";
  if (dish.image) {
    imageHtml = `<img class="dish-detail__image" src="${escapeHtml(dish.image)}" alt="${escapeHtml(dish.name)}" />`;
  } else {
    imageHtml = `<div class="dish-detail__placeholder">🍲</div>`;
  }

  const ingredientsHtml = (dish.ingredients && dish.ingredients.length)
    ? `<ul class="ingredients-list">
         ${dish.ingredients.map(i => `<li><span>${escapeHtml(i.name)}</span><span>${escapeHtml(i.amount)}</span></li>`).join("")}
       </ul>`
    : `<p>Ингредиенты не указаны.</p>`;

  const recipeHtml = (dish.recipe && dish.recipe.length)
    ? `<ol class="recipe-steps">${dish.recipe.map(s => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
    : `<p class="recipe-placeholder">Рецепт пока не добавлен.</p>`;

  // Блок моей оценки (только для авторизованных)
  let mySection = "";
  if (canInteract()) {
    mySection = `
      <div class="dish-detail__section">
        <h3>⭐ Моя оценка и отзыв (${meUser().name})</h3>
        <div class="rating-block">
          <span class="rating-block__label">Оценка:</span>
          ${starsHtml(myRating, false)}
        </div>
        <textarea class="rating-review-input" id="myReviewInput" placeholder="Напиши отзыв о блюде...">${escapeHtml(myReview)}</textarea>
      </div>
    `;
  }

  // Отзывы обоих пользователей
  const reviewsHtml = ["elya", "sanya"].map(key => {
    const u = getUser(key);
    const r = getDishRatingFor(dish.id, key);
    const rev = getDishReviewFor(dish.id, key);
    return `
      <div class="user-review">
        ${avatarHtml(u, "user-review__avatar")}
        <div class="user-review__body">
          <div class="user-review__head">
            <span class="user-review__name">${u.name}</span>
            <span class="user-review__stars" style="color:${r ? "var(--star-fill)" : "var(--star-empty)"}">${starString(r)}</span>
          </div>
          ${rev ? `<p class="user-review__text">${escapeHtml(rev)}</p>` : `<p class="user-review__text" style="color:var(--muted)">Пока без отзыва</p>`}
        </div>
      </div>
    `;
  }).join("");

  // Заметки: редактирование или чтение
  let notesSection = "";
  if (canInteract()) {
    notesSection = `
      <div class="dish-detail__section">
        <h3>📝 Заметки</h3>
        <textarea class="notes-textarea" id="notesTextarea" placeholder="Заметки к блюду (можно добавить позже)...">${escapeHtml(notes)}</textarea>
      </div>
    `;
  } else {
    notesSection = `
      <div class="dish-detail__section">
        <h3>📝 Заметки</h3>
        ${notes ? `<p>${escapeHtml(notes)}</p>` : `<p class="recipe-placeholder">Заметок пока нет.</p>`}
      </div>
    `;
  }

  // Кнопки действий по ролям
  let actionsHtml = "";
  if (canEdit()) {
    actionsHtml += `<button type="button" class="kitchen-btn" data-edit-dish="${dish.id}">✏️ Редактировать</button>`;
  }
  if (canDelete()) {
    actionsHtml += `<button type="button" class="kitchen-btn kitchen-btn--danger" data-delete-dish="${dish.id}">🗑 Удалить</button>`;
  }

  dom.dishModal.querySelector(".kitchen-modal__card").scrollTop = 0;
  dom.dishModalContent.innerHTML = `
    ${imageHtml}
    <div class="dish-detail__title">
      <h2>${escapeHtml(dish.name)}</h2>
      ${canInteract() ? `<button type="button" class="dish-detail__fav-big ${fav ? "is-favorite" : ""}" data-fav-big="${dish.id}" title="В избранное">❤️</button>` : ""}
    </div>
    <div class="dish-detail__cart-actions">
      ${canInteract() ? `<button type="button" class="kitchen-btn kitchen-btn--success kitchen-btn--small dish-detail__cart-btn" data-add-to-list="${dish.id}">🛒 ${inCart ? "В корзине" : "В список покупок"}</button>` : ""}
      ${canInteract() && inCart ? `<button type="button" class="kitchen-btn kitchen-btn--small dish-detail__open-cart" data-open-cart="${dish.id}">📋 Открыть корзину</button>` : ""}
    </div>
    <div class="dish-detail__info">
      <span class="chip chip--category">${escapeHtml(dish.category)}</span>
      <span class="chip">📌 ${escapeHtml(dish.status)}</span>
      <span class="chip chip--time">⏱ ${formatTime(dish.cookTime)}</span>
      <span class="chip ${difficultyClass(dish.difficulty)}">${escapeHtml(dish.difficulty)}</span>
      ${dish.garnish ? `<span class="chip">🍚 Гарнир: ${escapeHtml(dish.garnish)}</span>` : ""}
    </div>

    <div class="dish-detail__section">
      <h3>🧺 Ингредиенты</h3>
      ${ingredientsHtml}
    </div>

    <div class="dish-detail__section">
      <h3>👩‍🍳 Рецепт</h3>
      ${recipeHtml}
    </div>

    ${mySection}

    <div class="dish-detail__section">
      <h3>💬 Оценки и отзывы</h3>
      ${reviewsHtml}
    </div>

    ${notesSection}

    ${actionsHtml ? `<div class="dish-detail__section dish-detail__actions">${actionsHtml}</div>` : ""}
    <div class="msg" id="dishModalMsg"></div>
  `;

  bindDishDetailEvents(dish);
}

function bindDishDetailEvents(dish) {
  const card = dom.dishModalContent;

  const favBtn = card.querySelector("[data-fav-big]");
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      toggleFavorite(dish.id);
      favBtn.classList.toggle("is-favorite");
      renderGrid();
    });
  }

  const stars = card.querySelector(".rating-stars");
  if (stars) {
    stars.addEventListener("click", event => {
      const star = event.target.closest(".star");
      if (!star) return;
      const value = Number(star.dataset.star);
      const current = getRating(dish.id);
      const next = current === value ? 0 : value; // повторный клик — сброс
      getUserData().ratings[dish.id] = next;
      saveState();
      stars.querySelectorAll(".star").forEach(s => {
        s.classList.toggle("filled", Number(s.dataset.star) <= next);
      });
      renderGrid();
    });
  }

  const reviewInput = card.querySelector("#myReviewInput");
  if (reviewInput) {
    reviewInput.addEventListener("change", () => {
      const value = reviewInput.value.trim();
      if (value) {
        getUserData().reviews[dish.id] = value;
      } else {
        delete getUserData().reviews[dish.id];
      }
      saveState();
      showDishModalMsg("Отзыв сохранён ✅", "success");
      renderGrid();
    });
  }

  const notesInput = card.querySelector("#notesTextarea");
  if (notesInput) {
    notesInput.addEventListener("change", () => {
      const value = notesInput.value.trim();
      if (value) {
        state.dishNotes[dish.id] = value;
      } else {
        delete state.dishNotes[dish.id];
      }
      saveState();
      showDishModalMsg("Заметки сохранены ✅", "success");
    });
  }

  const addBtn = card.querySelector("[data-add-to-list]");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      toggleCartDish(dish.id);
      const inCart = cartIds.includes(dish.id);
      addBtn.textContent = inCart ? "🛒 В корзине" : "🛒 В список покупок";
      addBtn.title = inCart ? "Убрать из корзины" : "Добавить в корзину";
      // Показать/скрыть кнопку "Открыть корзину"
      let openCart = card.querySelector("[data-open-cart]");
      if (inCart && !openCart) {
        openCart = document.createElement("button");
        openCart.type = "button";
        openCart.className = "kitchen-btn kitchen-btn--small dish-detail__open-cart";
        openCart.dataset.openCart = dish.id;
        openCart.textContent = "📋 Открыть корзину";
        openCart.addEventListener("click", () => openShoppingModal());
        addBtn.parentNode.insertBefore(openCart, addBtn.nextSibling);
      } else if (!inCart && openCart) {
        openCart.remove();
      }
      showDishModalMsg(inCart ? "Добавлено в корзину 🛒" : "Убрано из корзины", inCart ? "success" : "error");
    });
  }

  const editBtn = card.querySelector("[data-edit-dish]");
  if (editBtn) {
    editBtn.addEventListener("click", () => {
      closeModal("dishModal");
      openEditModal(dish.id);
    });
  }

  const delBtn = card.querySelector("[data-delete-dish]");
  if (delBtn) {
    delBtn.addEventListener("click", () => {
      if (!confirm(`Удалить блюдо «${dish.name}»?`)) return;
      deleteDish(dish.id);
      closeModal("dishModal");
      renderGrid();
    });
  }

  const openCartBtn = card.querySelector("[data-open-cart]");
  if (openCartBtn) {
    openCartBtn.addEventListener("click", () => {
      openShoppingModal();
    });
  }
}

function showDishModalMsg(text, type) {
  const msg = dom.dishModalContent.querySelector("#dishModalMsg");
  if (msg) {
    msg.textContent = text;
    msg.className = "msg" + (type ? " " + type : "");
    setTimeout(() => { msg.textContent = ""; }, 3000);
  }
}

function toggleFavorite(dishId) {
  const data = getUserData();
  const idx = data.favorites.indexOf(Number(dishId));
  if (idx >= 0) {
    data.favorites.splice(idx, 1);
  } else {
    data.favorites.push(Number(dishId));
  }
  saveState();
}

function deleteDish(dishId) {
  const id = Number(dishId);
  if (!state.deletedDishIds.includes(id)) state.deletedDishIds.push(id);
  state.customDishes = state.customDishes.filter(d => d.id !== id);
  delete state.editedDishes[id];
  delete state.dishNotes[id];
  saveState();
}

/* ---------- Корзина покупок ---------- */

function toggleCartDish(dishId) {
  const id = Number(dishId);
  const idx = cartIds.indexOf(id);
  if (idx >= 0) {
    cartIds.splice(idx, 1);
  } else {
    cartIds.push(id);
  }
  saveCart();
  updateCartUI();
}

function removeFromCart(dishId) {
  cartIds = cartIds.filter(id => id !== Number(dishId));
  saveCart();
  updateCartUI();
}

function getCartDishes() {
  return getAllDishes().filter(d => cartIds.includes(d.id));
}

function renderShoppingModal() {
  const dishes = getCartDishes();

  const itemsHtml = dishes.map(d => `
    <div class="cart-dish">
      <span class="cart-dish__name">${escapeHtml(d.name)}</span>
      <span class="cart-dish__meta">${escapeHtml(d.category)} · ⏱ ${formatTime(d.cookTime)}</span>
      <button type="button" class="cart-dish__remove" data-cart-remove="${d.id}" title="Убрать">✕</button>
    </div>
  `).join("");

  const emptyHtml = `<div class="cart-empty">Корзина пуста — добавь блюда через 🛒 в карточке блюда</div>`;

  dom.shoppingModalContent.innerHTML = `
    <h2 style="margin-top:0">🛒 Список покупок</h2>
    <p class="shopping-summary">Открой карточку блюда и нажми 🛒 — список продуктов сформируется сам</p>
    <div class="cart-items">${dishes.length ? itemsHtml : emptyHtml}</div>
    <div class="shopping-result hidden" id="shoppingResult">
      <pre id="shoppingResultText"></pre>
    </div>
    <div class="shopping-actions">
      <button type="button" class="kitchen-btn kitchen-btn--accent" id="generateListBtn">📋 Собрать список</button>
      <button type="button" class="kitchen-btn kitchen-btn--success" id="shareTgBtn">✈️ Отправить в Telegram</button>
      <button type="button" class="kitchen-btn" id="copyListBtn">📄 Скопировать</button>
      ${cartIds.length ? `<button type="button" class="kitchen-btn kitchen-btn--danger" id="clearCartBtn">🧹 Очистить</button>` : ""}
    </div>
    <div class="msg" id="shoppingMsg"></div>
  `;

  dom.shoppingModalContent.querySelectorAll("[data-cart-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      removeFromCart(Number(btn.dataset.cartRemove));
      renderShoppingModal();
      renderGrid();
    });
  });

  const clearBtn = dom.shoppingModalContent.querySelector("#clearCartBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      cartIds = [];
      saveCart();
      updateCartUI();
      renderShoppingModal();
      renderGrid();
    });
  }

  dom.shoppingModalContent.querySelector("#generateListBtn").addEventListener("click", generateShoppingList);
  dom.shoppingModalContent.querySelector("#shareTgBtn").addEventListener("click", shareTelegram);
  dom.shoppingModalContent.querySelector("#copyListBtn").addEventListener("click", copyShoppingList);
}

function generateShoppingList() {
  const resultEl = dom.shoppingModalContent.querySelector("#shoppingResult");
  const textEl = dom.shoppingModalContent.querySelector("#shoppingResultText");
  const msg = dom.shoppingModalContent.querySelector("#shoppingMsg");

  const selected = getCartDishes();
  if (selected.length === 0) {
    msg.textContent = "Сначала добавь блюда в корзину 🛒";
    msg.className = "msg error";
    return;
  }

  const grouped = {};
  INGREDIENT_CATEGORIES.forEach(c => grouped[c] = []);
  const seen = new Set();

  selected.forEach(dish => {
    (dish.ingredients || []).forEach(ing => {
      const key = ing.name + "|" + ing.amount;
      if (seen.has(key)) return;
      seen.add(key);
      const cat = ing.category || "Другое";
      if (!grouped[cat]) grouped[cat] = [];
      grouped[cat].push(`— ${ing.name}${ing.amount ? " — " + ing.amount : ""}`);
    });
  });

  const lines = [];
  lines.push("🛒 Список покупок");
  lines.push("");
  INGREDIENT_CATEGORIES.forEach(cat => {
    if (grouped[cat] && grouped[cat].length > 0) {
      lines.push("◆ " + cat + ":");
      lines.push(...grouped[cat]);
      lines.push("");
    }
  });
  lines.push("Блюда: " + selected.map(d => d.name).join(", "));

  const text = lines.join("\n");
  textEl.textContent = text;
  resultEl.classList.remove("hidden");
  msg.textContent = "";
}

function shareTelegram() {
  const textEl = dom.shoppingModalContent.querySelector("#shoppingResultText");
  if (!textEl || !textEl.textContent) {
    generateShoppingList();
    const again = dom.shoppingModalContent.querySelector("#shoppingResultText");
    if (!again || !again.textContent) return;
  }
  const text = dom.shoppingModalContent.querySelector("#shoppingResultText").textContent;
  const url = "https://t.me/share/url?url=&text=" + encodeURIComponent(text);
  window.open(url, "_blank", "noopener");
}

function copyShoppingList() {
  const textEl = dom.shoppingModalContent.querySelector("#shoppingResultText");
  if (!textEl || !textEl.textContent) {
    generateShoppingList();
  }
  const text = dom.shoppingModalContent.querySelector("#shoppingResultText").textContent;
  if (!text) return;
  const msg = dom.shoppingModalContent.querySelector("#shoppingMsg");
  navigator.clipboard.writeText(text).then(() => {
    msg.textContent = "Список скопирован ✅";
    msg.className = "msg success";
  }).catch(() => {
    msg.textContent = "Не удалось скопировать 😢";
    msg.className = "msg error";
  });
}

/* ---------- Избранное ---------- */

function getFavoriteDishes() {
  const favIds = canInteract() ? getUserData().favorites : [];
  return getAllDishes().filter(d => favIds.includes(d.id));
}

function renderFavoritesModal() {
  const dishes = getFavoriteDishes();

  const itemsHtml = dishes.map(d => `
    <div class="fav-dish" data-fav-open="${d.id}">
      ${d.image
        ? `<img class="fav-dish__img" src="${escapeHtml(d.image)}" alt="${escapeHtml(d.name)}" loading="lazy" />`
        : `<div class="fav-dish__img fav-dish__img--placeholder">🍲</div>`}
      <div class="fav-dish__info">
        <div class="fav-dish__name">${escapeHtml(d.name)}</div>
        <div class="fav-dish__meta">${escapeHtml(d.category)} · ⏱ ${formatTime(d.cookTime)}</div>
      </div>
      <button type="button" class="cart-dish__remove" data-fav-remove="${d.id}" title="Убрать из избранного">✕</button>
    </div>
  `).join("");

  const emptyHtml = `<div class="cart-empty">В избранном пока пусто — открой карточку блюда и нажми ❤️</div>`;

  dom.favoritesModalContent.innerHTML = `
    <h2 style="margin-top:0">❤️ Избранное</h2>
    <p class="shopping-summary">Здесь собраны блюда, которые ты отметил(а) сердечком</p>
    <div class="cart-items">${dishes.length ? itemsHtml : emptyHtml}</div>
    <div class="msg" id="favoritesMsg"></div>
  `;

  dom.favoritesModalContent.querySelectorAll("[data-fav-remove]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const dishId = Number(btn.dataset.favRemove);
      const data = getUserData();
      data.favorites = data.favorites.filter(id => id !== dishId);
      saveState();
      renderFavoritesModal();
      renderGrid();
    });
  });

  dom.favoritesModalContent.querySelectorAll("[data-fav-open]").forEach(item => {
    item.addEventListener("click", () => {
      closeModal("favoritesModal");
      openDishModal(Number(item.dataset.favOpen));
    });
  });
}

function openFavoritesModal() {
  renderFavoritesModal();
  openModal("favoritesModal");
}

/* ---------- Случайное блюдо ---------- */

function getAllGarnishes() {
  const set = new Set();
  getAllDishes().forEach(d => {
    if (d.garnish) set.add(d.garnish);
  });
  return Array.from(set).sort();
}

function renderRandomModal() {
  const garnishes = getAllGarnishes();

  dom.randomModalContent.innerHTML = `
    <h2 style="margin-top:0">🎲 Случайное блюдо</h2>
    <div class="random-filters">
      <div class="random-filters__row">
        <span class="random-filters__label">Категория:</span>
        <select class="kitchen-select" id="randomCategory">
          <option value="">Любая</option>
          ${CATEGORIES.map(c => `<option value="${c}" ${randomState.category === c ? "selected" : ""}>${c}</option>`).join("")}
        </select>
      </div>
      <div class="random-filters__row">
        <span class="random-filters__label">Гарнир:</span>
        <select class="kitchen-select" id="randomGarnish">
          <option value="">Любой</option>
          ${garnishes.map(g => `<option value="${escapeHtml(g)}" ${randomState.garnish === g ? "selected" : ""}>${escapeHtml(g)}</option>`).join("")}
        </select>
      </div>
      <div class="random-filters__row">
        <span class="random-filters__label">Время до:</span>
        <select class="kitchen-select" id="randomTime">
          <option value="0">Любое</option>
          <option value="15" ${randomState.maxTime === 15 ? "selected" : ""}>15 мин</option>
          <option value="30" ${randomState.maxTime === 30 ? "selected" : ""}>30 мин</option>
          <option value="60" ${randomState.maxTime === 60 ? "selected" : ""}>1 час</option>
          <option value="120" ${randomState.maxTime === 120 ? "selected" : ""}>2 часа</option>
        </select>
      </div>
      <div class="random-filters__row">
        <span class="random-filters__label">Сложность:</span>
        <select class="kitchen-select" id="randomDifficulty">
          <option value="">Любая</option>
          ${DIFFICULTIES.map(d => `<option value="${d}" ${randomState.difficulty === d ? "selected" : ""}>${d}</option>`).join("")}
        </select>
      </div>
      <div class="random-filters__row">
        <button type="button" class="kitchen-btn kitchen-btn--accent" id="pickRandomBtn">🎲 Выбрать блюдо</button>
      </div>
      <p class="random-filters__error hidden" id="randomError">Не нашлось блюда под такие фильтры 😢</p>
    </div>
    <div id="randomResult"></div>
  `;

  dom.randomModalContent.querySelector("#randomCategory").addEventListener("change", e => {
    randomState.category = e.target.value;
  });
  dom.randomModalContent.querySelector("#randomGarnish").addEventListener("change", e => {
    randomState.garnish = e.target.value;
  });
  dom.randomModalContent.querySelector("#randomTime").addEventListener("change", e => {
    randomState.maxTime = Number(e.target.value);
  });
  dom.randomModalContent.querySelector("#randomDifficulty").addEventListener("change", e => {
    randomState.difficulty = e.target.value;
  });
  dom.randomModalContent.querySelector("#pickRandomBtn").addEventListener("click", pickRandom);
}

function pickRandom() {
  const errorEl = dom.randomModalContent.querySelector("#randomError");
  const resultEl = dom.randomModalContent.querySelector("#randomResult");
  errorEl.classList.add("hidden");

  let pool = getAllDishes();
  if (randomState.category) pool = pool.filter(d => d.category === randomState.category);
  if (randomState.garnish) pool = pool.filter(d => (d.garnish || "") === randomState.garnish);
  if (randomState.difficulty) pool = pool.filter(d => d.difficulty === randomState.difficulty);
  if (randomState.maxTime) pool = pool.filter(d => (Number(d.cookTime) || 0) <= randomState.maxTime);

  if (pool.length === 0) {
    errorEl.classList.remove("hidden");
    resultEl.innerHTML = "";
    return;
  }

  const dish = pool[Math.floor(Math.random() * pool.length)];
  const users = isGuest() ? ["elya", "sanya"] : [currentUser, otherUserKey()];
  const ratingHtml = users.map(k => {
    const u = getUser(k);
    const r = getDishRatingFor(dish.id, k);
    return `<span style="font-size:13px;color:var(--muted)">${u.name}: ${r ? starString(r) : "не оценено"}</span>`;
  }).join("");

  resultEl.innerHTML = `
    <div class="random-result">
      <h3 class="random-result__name">${escapeHtml(dish.name)}</h3>
      <div class="dish-card__badges">
        <span class="chip chip--category">${escapeHtml(dish.category)}</span>
        <span class="chip">📌 ${escapeHtml(dish.status)}</span>
        <span class="chip chip--time">⏱ ${formatTime(dish.cookTime)}</span>
        <span class="chip ${difficultyClass(dish.difficulty)}">${escapeHtml(dish.difficulty)}</span>
        ${dish.garnish ? `<span class="chip">🍚 ${escapeHtml(dish.garnish)}</span>` : ""}
      </div>
      <div style="display:flex;gap:10px;align-items:center;margin-top:12px;flex-wrap:wrap">
        ${ratingHtml}
        <div class="random-status-select" style="margin-left:auto">
          <label style="font-size:12px;color:var(--muted);display:block">Статус:</label>
          <select class="kitchen-select" data-random-status="${dish.id}" style="font-size:13px;padding:4px 8px">
            ${STATUSES.map(s => `<option value="${s}" ${dish.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <button type="button" class="kitchen-btn kitchen-btn--small" data-random-open="${dish.id}">Подробнее</button>
        <button type="button" class="kitchen-btn kitchen-btn--accent kitchen-btn--small" data-random-repick>🎲 Ещё</button>
      </div>
    </div>
  `;

  // Обработчик изменения статуса
  const statusSelect = resultEl.querySelector("[data-random-status]");
  if (statusSelect) {
    statusSelect.addEventListener("change", () => {
      const newStatus = statusSelect.value;
      state.editedDishes[dish.id] = Object.assign({}, state.editedDishes[dish.id] || {}, { status: newStatus });
      saveState();
      // Обновить отображение статуса
      resultEl.querySelector(".dish-card__badges .chip:nth-child(2)").textContent = "📌 " + newStatus;
      renderGrid();
    });
  }

  // Обработчик "Подробнее"
  resultEl.querySelector("[data-random-open]").addEventListener("click", () => {
    closeModal("randomModal");
    openDishModal(dish.id);
  });

  // Обработчик "Ещё"
  resultEl.querySelector("[data-random-repick]").addEventListener("click", pickRandom);
}

/* ---------- Добавление / редактирование блюда ---------- */

function openEditModal(dishId) {
  const dish = dishId != null ? getDish(dishId) : null;
  if (dishId != null && !dish) return;
  editingDishId = dishId != null ? Number(dishId) : null;
  renderEditForm(dish);
  openModal("editModal");
}

function renderEditForm(dish) {
  const isEdit = !!dish;
  const recipeText = dish && dish.recipe ? dish.recipe.join("\n") : "";

  dom.editModalContent.innerHTML = `
    <h2 style="margin-top:0">${isEdit ? "✏️ Редактировать блюдо" : "➕ Новое блюдо"}</h2>
    <form class="edit-form" id="editForm">
      <div class="edit-form__row">
        <label>Название *
          <input type="text" id="editName" required placeholder="Например: Борщ" value="${dish ? escapeHtml(dish.name) : ""}" />
        </label>
        <label>Категория *
          <select id="editCategory" required>
            ${CATEGORIES.map(c => `<option value="${c}" ${dish && dish.category === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </label>
      </div>
      <div class="edit-form__row">
        <label>Статус
          <select id="editStatus">
            ${STATUSES.map(s => `<option value="${s}" ${dish && dish.status === s ? "selected" : ""}>${s}</option>`).join("")}
          </select>
        </label>
        <label>Время готовки (мин)
          <input type="number" id="editCookTime" min="1" max="600" placeholder="30" value="${dish && dish.cookTime ? dish.cookTime : ""}" />
        </label>
      </div>
      <div class="edit-form__row">
        <label>Сложность
          <select id="editDifficulty">
            ${DIFFICULTIES.map(d => `<option value="${d}" ${dish && dish.difficulty === d ? "selected" : ""}>${d}</option>`).join("")}
          </select>
        </label>
        <label>Гарнир
          <input type="text" id="editGarnish" placeholder="Рис, картошка, без гарнира..." value="${dish && dish.garnish ? escapeHtml(dish.garnish) : ""}" />
        </label>
      </div>
      <div class="edit-form__row">
        <label>Фото (ссылка на картинку)
          <input type="text" id="editImage" placeholder="https://... (необязательно)" value="${dish && dish.image ? escapeHtml(dish.image) : ""}" />
        </label>
        <label>&nbsp;</label>
      </div>

      <div>
        <h3 style="margin:0 0 8px;font-size:15px">🧺 Ингредиенты</h3>
        <div id="ingredientsRows"></div>
        <button type="button" class="kitchen-btn kitchen-btn--small" id="addIngredientBtn" style="margin-top:8px">+ Ингредиент</button>
      </div>

      <div>
        <h3 style="margin:0 0 8px;font-size:15px">👩‍🍳 Рецепт</h3>
        <textarea class="edit-form__recipe" id="editRecipe" rows="6" placeholder="Опиши рецепт по шагам — каждый шаг с новой строки">${escapeHtml(recipeText)}</textarea>
      </div>

      <div class="edit-form__btn-row">
        <button type="submit" class="kitchen-btn kitchen-btn--accent">💾 Сохранить блюдо</button>
        <button type="button" class="kitchen-btn" data-close="editModal">Отмена</button>
      </div>
      <div class="msg" id="editMsg"></div>
    </form>
  `;

  renderIngredientRows(dish);

  dom.editModalContent.querySelector("#addIngredientBtn").addEventListener("click", () => {
    addIngredientRow();
  });

  dom.editModalContent.querySelector("#editForm").addEventListener("submit", saveDishForm);
}

function renderIngredientRows(dish) {
  const container = dom.editModalContent.querySelector("#ingredientsRows");
  container.innerHTML = "";
  const list = (dish && dish.ingredients && dish.ingredients.length) ? dish.ingredients : [];
  if (list.length === 0) {
    for (let i = 0; i < 3; i++) addIngredientRow();
    return;
  }
  list.forEach(ing => addIngredientRow(ing));
}

function addIngredientRow(ing) {
  const container = dom.editModalContent.querySelector("#ingredientsRows");
  const row = document.createElement("div");
  row.className = "edit-form__ingredient-row";
  row.innerHTML = `
    <input type="text" class="ing-name" placeholder="Продукт" value="${ing && ing.name ? escapeHtml(ing.name) : ""}" />
    <input type="text" class="ing-amount" placeholder="Количество" value="${ing && ing.amount ? escapeHtml(ing.amount) : ""}" />
    <select class="ing-category">
      ${INGREDIENT_CATEGORIES.map(c => `<option value="${c}" ${ing && ing.category === c ? "selected" : ""}>${c}</option>`).join("")}
    </select>
    <button type="button" class="edit-form__remove-ing" title="Удалить">✕</button>
  `;
  row.querySelector(".edit-form__remove-ing").addEventListener("click", () => {
    if (container.children.length <= 1) return;
    row.remove();
  });
  container.appendChild(row);
}

function saveDishForm(event) {
  event.preventDefault();
  const msg = dom.editModalContent.querySelector("#editMsg");
  const name = dom.editModalContent.querySelector("#editName").value.trim();
  if (!name) {
    msg.textContent = "Укажи название блюда";
    msg.className = "msg error";
    return;
  }

  const ingredients = [];
  dom.editModalContent.querySelectorAll("#ingredientsRows .edit-form__ingredient-row").forEach(row => {
    const n = row.querySelector(".ing-name").value.trim();
    if (!n) return;
    ingredients.push({
      name: n,
      amount: row.querySelector(".ing-amount").value.trim(),
      category: row.querySelector(".ing-category").value
    });
  });

  const recipeRaw = dom.editModalContent.querySelector("#editRecipe").value.trim();
  const recipe = recipeRaw ? recipeRaw.split("\n").map(s => s.trim()).filter(Boolean) : [];

  const id = editingDishId !== null
    ? editingDishId
    : getAllDishes().reduce((max, d) => Math.max(max, d.id), 0) + 1;

  const dishData = {
    id: id,
    name: name,
    category: dom.editModalContent.querySelector("#editCategory").value,
    status: dom.editModalContent.querySelector("#editStatus").value,
    cookTime: Number(dom.editModalContent.querySelector("#editCookTime").value) || 30,
    difficulty: dom.editModalContent.querySelector("#editDifficulty").value,
    garnish: dom.editModalContent.querySelector("#editGarnish").value.trim() || null,
    image: dom.editModalContent.querySelector("#editImage").value.trim() || null,
    ingredients: ingredients,
    recipe: recipe
  };

  if (editingDishId !== null) {
    state.editedDishes[id] = dishData;
  } else {
    state.customDishes.push(dishData);
  }

  saveState();
  closeModal("editModal");
  editingDishId = null;
  renderGrid();
}

/* ---------- Открытие модалок ---------- */

function openDishModal(dishId) {
  const dish = getDish(dishId);
  if (!dish) return;
  renderDishDetail(dish);
  openModal("dishModal");
}

function openRandomModal() {
  renderRandomModal();
  openModal("randomModal");
}

function openShoppingModal() {
  renderShoppingModal();
  openModal("shoppingModal");
}

/* ---------- Тема ---------- */

function initTheme() {
  const savedTheme = localStorage.getItem(KITCHEN_CONFIG.THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = savedTheme === "dark" || (!savedTheme && prefersDark);
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  const checkbox = document.getElementById("theme-switch");
  if (checkbox) checkbox.checked = dark;
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem(KITCHEN_CONFIG.THEME_KEY, next);
}

/* ---------- Обработчики событий ---------- */

function bindEvents() {
  // Авторизация
  dom.loginAccounts.addEventListener("click", e => {
    const btn = e.target.closest("[data-login]");
    if (!btn) return;
    const key = btn.dataset.login;
    if (key === "guest") {
      doLogin("guest");
      return;
    }
    pendingLogin = key;
    dom.loginUserName.textContent = getUser(key).name;
    dom.loginPasswordBlock.classList.remove("hidden");
    dom.loginError.classList.add("hidden");
    dom.loginPassword.value = "";
    dom.loginPassword.focus();
  });

  dom.loginSubmit.addEventListener("click", () => {
    if (!pendingLogin || !USERS[pendingLogin]) return;
    doLogin(pendingLogin);
  });

  dom.loginBack.addEventListener("click", resetLoginForm);

  dom.loginPassword.addEventListener("keydown", e => {
    if (e.key === "Enter") dom.loginSubmit.click();
  });

  // Фильтры и поиск
  dom.filtersBtn.addEventListener("click", toggleFilters);
  dom.searchInput.addEventListener("input", renderGrid);
  dom.filterCategory.addEventListener("change", renderGrid);
  dom.filterGarnish.addEventListener("change", renderGrid);
  dom.filterStatus.addEventListener("change", renderGrid);
  dom.filterDifficulty.addEventListener("change", renderGrid);
  dom.filterTime.addEventListener("change", renderGrid);
  dom.resetFiltersBtn.addEventListener("click", () => {
    dom.searchInput.value = "";
    dom.filterCategory.value = "";
    dom.filterGarnish.value = "";
    dom.filterStatus.value = "";
    dom.filterDifficulty.value = "";
    dom.filterTime.value = "";
    renderGrid();
  });

  // Кнопки
  dom.randomBtn.addEventListener("click", openRandomModal);
  dom.addDishBtn.addEventListener("click", () => openEditModal(null));

  // Плавающая корзина
  dom.cartFloating.addEventListener("click", openShoppingModal);

  // Избранное
  dom.favoritesBtn.addEventListener("click", openFavoritesModal);

  // Клики по сетке
  dom.dishGrid.addEventListener("click", e => {
    const card = e.target.closest(".dish-card");
    if (card) {
      openDishModal(Number(card.dataset.dishId));
    }
  });

  // Закрытие модалок
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });
  document.addEventListener("click", e => {
    const closer = e.target.closest("[data-close]");
    if (closer) {
      closeModal(closer.dataset.close);
    }
  });

  // Тема
  const themeToggle = document.getElementById("theme-switch");
  if (themeToggle) themeToggle.addEventListener("change", toggleTheme);
}

/* ---------- Инициализация ---------- */

async function init() {
  cacheDOM();
  initFilters();
  bindEvents();
  initTheme();
  loadCart();
  await loadState();

  if (currentUser && currentUser !== "guest") {
    hideLogin();
    applyUserUI();
    renderGrid();
    startPolling();
  } else {
    currentUser = "guest";
    applyUserUI();
    renderGrid();
    showLogin();
  }
}

document.addEventListener("DOMContentLoaded", init);

