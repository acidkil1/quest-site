const CONFIG = {
  QUIZ_COOKIE_KEY: "gift_quiz_progress_v1",
  COOKIE_DAYS: 30,

  ANIMATION_FADE_OUT: 250,
  ANIMATION_FADE_IN: 300,
  ANIMATION_CONFETTI_CLEANUP: 2500,

  CONFETTI_COUNT: 200,
  CONFETTI_COLORS: ['#6fb8df', '#2a8a7a', '#c34f7b', '#f0faff', '#ffd700'],

  DEBOUNCE_DELAY: 300,
  THEME_STORAGE_KEY: "theme_preference"
};

const questions = [
  {
    id: 1,
    type: "single-choice",
    title: "Подарок #1",
    prompt: "Какой инструмент я подарил тебе год назад?",
    options: ["Канон", "Данон", "Кахон", "Бензопила"],
    answer: "Кахон",
    giftHint: "Ищи: В кахоне.",
    image: "./images/gift-01.jpg",
  },
  {
    id: 2,
    type: "text",
    title: "Подарок #2",
    prompt: "Какой твой любимый цвет?",
    answer: "Голубой",
    answers: ["голубой", "синий", "blue", "йогуртный", "йогуртно-голубой"],
    giftHint: "Ищи: Верхняя полка в шкафу в комнате.",
    image: "./images/gift-02.jpg",
  },
  {
    id: 3,
    type: "single-choice",
    title: "Подарок #3",
    prompt: "Кто самый красивый человек во вселенной?",
    options: ["Эля", "Эля", "Эля", "Эля"],
    answer: "Эля",
    giftHint: "Ищи: В белом столике.",
    image: "./images/gift-03.jpg",
  },
  {
    id: 4,
    type: "single-choice",
    title: "Подарок #4",
    prompt: "Без чего(или кого) я не могу заснуть, даже если очень хочу?",
    options: ["Героин", "Снотворное", "Мелатонин", "Эля"],
    answer: "Эля",
    giftHint: "Ищи: Под кроватью.",
    image: "./images/gift-04.jpg",
  },
  {
    id: 5,
    type: "text",
    title: "Подарок #5",
    prompt: "Что мы чаще всего смотрим вечером?",
    answer: "Сериалы",
    answers: ["сериалы", "сериал", "доктор хаус"],
    giftHint: "Ищи: В сумке ноутбука.",
    image: "./images/gift-05.jpg",
  },
  {
    id: 6,
    type: "single-choice",
    title: "Подарок #6",
    prompt: "Какой наш любимый десерт?",
    options: ["Глаша(нет)", "Синнабоны", "Йогурты", "Печеньки"],
    answer: "Синнабоны",
    giftHint: "Ищи: Сверху шкафа в комнате.",
    image: "./images/gift-06.jpg",
  },
  {
    id: 7,
    type: "text",
    title: "Подарок #7",
    prompt: "Какой сериал на данный момент мы смотрим?",
    answer: "Доктор Хаус",
    answers: ["доктор хаус", "house md", "хаус", "доктор хаос"],
    giftHint: "Ищи: За книгами.",
    image: "./images/gift-07.jpg",
  },
  {
    id: 8,
    type: "text",
    title: "Подарок #8",
    prompt: "Марка твоих любимых сигарет?",
    answer: "Marlboro",
    answers: ["marlboro", "марльборо", "мальборо", "marlboro aroma fresh"],
    giftHint: "Ищи: Где другие палочки.",
    image: "./images/gift-08.jpg",
  },
  {
    id: 9,
    type: "text",
    title: "Подарок #9",
    prompt: "Из-за какого исполнителя мы познакомились?",
    answer: "Lida",
    answers: ["lida", "лида", "delay", "хуесос", "лох", "чмо", "педик"],
    giftHint: "Ищи: Беговая дорожка.",
    image: "./images/gift-09.jpg",
  },
  {
    id: 10,
    type: "single-choice",
    title: "Подарок #10",
    prompt: "Как называлась наша первая совместная игра?",
    options: ["Beyond: Two Souls", "Minecraft", "Untitled Goose Game", "Dubstep Abasralsa"],
    answer: "Beyond: Two Souls",
    giftHint: "Ищи: В коробке с инструментами.",
    image: "./images/gift-10.jpg",
  },
  {
    id: 11,
    type: "multiple-choice",
    title: "Подарок #11",
    prompt: "В какие города мы ездили?",
    options: ["Агидель", "Янаул", "Сарапул", "Чайковский"],
    answer: ["Агидель", "Янаул", "Сарапул", "Чайковский"],
    giftHint: "Ищи: В сумке кошке.",
    image: "./images/gift-11.jpg",
  },
  {
    id: 12,
    type: "text",
    title: "Подарок #12",
    prompt: "Какой напиток тебе нравится больше всего утром?",
    answer: "Чай",
    answers: ["чай", "зеленый чай", "черный чай", "tess", "тэс", "тес", "тесс", "тэсс"],
    giftHint: "Ищи: В ванной сверху на полке.",
    image: "./images/gift-12.jpg",
  },
  {
    id: 13,
    type: "single-choice",
    title: "Подарок #13",
    prompt: "Твой любимый диснеевский мультик?",
    options: ["Рататуй", "Рапунцель", "ВАЛЛ-И", "Моана"],
    answer: "Рапунцель",
    giftHint: "Ищи: За стиралкой.",
    image: "./images/gift-13.jpg",
  },
  {
    id: 14,
    type: "multiple-choice",
    title: "Подарок #14",
    prompt: "В какие игры мы с тобой играли?",
    options: ["Subnautica 2", "Minecraft", "Raft", "Roblox"],
    answer: ["Minecraft", "Raft", "Roblox"],
    giftHint: "Ищи: Сверху шкафа в прихожей.",
    image: "./images/gift-14.jpg",
  },
  {
    id: 15,
    type: "text",
    title: "Подарок #15",
    prompt: "Что я говорю тебе перед сном почти каждую ночь?",
    answer: "Спокойной ночи, люблю тебя",
    textIncludesAny: ["спокойной", "люблю", "доброй ночи"],
    giftHint: "Ищи: В прихожей над гардеробом.",
    image: "./images/gift-15.jpg",
  },
  {
    id: 16,
    type: "date",
    title: "Подарок #16",
    prompt: "Когда мы начали встречаться?",
    answer: "14-09-2024",
    giftHint: "Ищи: В прихожей в холодильнике.",
    image: "./images/gift-16.jpg",
  },
  {
    id: 17,
    type: "single-choice",
    title: "Подарок #17",
    prompt: "Кто изображен на фото?",
    options: ["Глаша", "Хлебобулочное изделие", "Аллерген", "Бог"],
    answer: ["Глаша", "Хлебобулочное изделие", "Аллерген", "Бог"],
    giftHint: "Ищи: Сверху шкафа на кухне.",
    image: "./images/gift-17.jpg",
    questionImage: "./images/question-17.jpg",
  },
  {
    id: 18,
    type: "multiple-choice",
    title: "Подарок #18",
    prompt: "Какое моё любимое занятие, когда я рядом с тобой?",
    options: ["ругаться", "Обниматься", "Целоваться", "читать молитву"],
    answer: ["Обниматься", "Целоваться"],
    giftHint: "Ищи: На кухне в шкафчике за крупами.",
    image: "./images/gift-18.jpg",
  },
  {
    id: 19,
    type: "text",
    title: "Подарок #19",
    prompt: "Как ты ласково называешь меня?",
    answer: "котенок",
    answers: ["котенок", "котик", "саня", "пидор", "кот", "педик"],
    giftHint: "Ищи: На балконе.",
    image: "./images/gift-19.jpg",
  },
];

const state = {
  currentIndex: 0,
  solved: Array(questions.length).fill(false),
  hintShownForCurrentQuestion: false,
  lastNavigationTime: 0
};

let elements = {};

function cacheDOMElements() {
  elements = {
    progressText: document.getElementById("progressText"),
    solvedText: document.getElementById("solvedText"),
    progressBarFill: document.getElementById("progressBarFill"),
    questionTitle: document.getElementById("questionTitle"),
    questionPrompt: document.getElementById("questionPrompt"),
    questionImage: document.getElementById("questionImage"),
    answerForm: document.getElementById("answerForm"),
    statusMessage: document.getElementById("statusMessage"),
    questionHint: document.getElementById("questionHint"),
    questionCard: document.querySelector(".question-card"),
    giftCard: document.getElementById("giftCard"),
    giftImage: document.getElementById("giftImage"),
    giftHint: document.getElementById("giftHint"),
    finalCard: document.getElementById("finalCard"),
    jumpButtons: document.getElementById("jumpButtons"),
    prevButton: document.getElementById("prevButton"),
    nextButton: document.getElementById("nextButton"),
  };
}

function normalizeText(value) {
  return String(value).trim().toLowerCase();
}

function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

function isTextAnswerCorrect(question, userAnswer) {
  const u = normalizeText(userAnswer);
  
  if (Array.isArray(question.textIncludesAny) && question.textIncludesAny.length > 0) {
    return question.textIncludesAny.some((frag) => u.includes(normalizeText(frag)));
  }
  
  const candidates = [];
  if (question.answer != null && String(question.answer).trim() !== "") {
    candidates.push(String(question.answer));
  }
  if (Array.isArray(question.answers)) {
    candidates.push(...question.answers);
  }
  
  if (candidates.length === 0) return false;
  return candidates.some((c) => normalizeText(c) === u);
}

function setsEqual(a, b) {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

function formatDateToDDMMYYYY(dateString) {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

function isCorrectAnswer(question, userAnswer) {
  switch (question.type) {
    case "text":
      return isTextAnswerCorrect(question, userAnswer);
    case "date":
      const formattedUserAnswer = formatDateToDDMMYYYY(userAnswer);
      return formattedUserAnswer === String(question.answer);
    case "single-choice": {
      const accepted = Array.isArray(question.answer)
        ? question.answer
        : [question.answer];
      return accepted.some((a) => normalizeText(userAnswer) === normalizeText(a));
    }
    case "multiple-choice": {
      const selected = Array.isArray(userAnswer) ? userAnswer : [];
      return setsEqual(new Set(selected), new Set(question.answer));
    }
    default:
      return false;
  }
}

function setCookie(name, value, days) {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/;SameSite=Lax`;
}

function getCookie(name) {
  const nameEq = `${name}=`;
  const list = document.cookie.split(";");
  for (const item of list) {
    const trimmed = item.trim();
    if (trimmed.startsWith(nameEq)) {
      return decodeURIComponent(trimmed.substring(nameEq.length));
    }
  }
  return null;
}

function loadProgressFromCookie() {
  const raw = getCookie(CONFIG.QUIZ_COOKIE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.solved) || typeof parsed.currentIndex !== "number") {
      return;
    }

    state.solved = questions.map((_, i) => Boolean(parsed.solved[i]));
    const maxUnlocked = getMaxUnlockedIndex();
    state.currentIndex = Math.min(Math.max(parsed.currentIndex, 0), maxUnlocked);
  } catch (_error) {

  }
}

function saveProgressToCookie() {
  const payload = JSON.stringify({
    solved: state.solved,
    currentIndex: state.currentIndex,
  });
  setCookie(CONFIG.QUIZ_COOKIE_KEY, payload, CONFIG.COOKIE_DAYS);
}

function getSolvedCount() {
  return state.solved.filter(Boolean).length;
}

function getMaxUnlockedIndex() {
  let unlocked = 0;
  for (let i = 0; i < state.solved.length; i++) {
    if (state.solved[i]) {
      unlocked = i + 1;
    } else {
      break;
    }
  }
  if (unlocked >= questions.length) {
    return questions.length;
  }
  return Math.min(unlocked, questions.length - 1);
}

function isFinalScreen() {
  return state.currentIndex === questions.length;
}

function showStatus(text, type) {
  elements.statusMessage.textContent = text;
  elements.statusMessage.className = "status-message";
  if (type) {
    elements.statusMessage.classList.add(type);
  }
}

function getQuestionHint(question) {
  switch (question.type) {
    case "single-choice": {
      const accepted = Array.isArray(question.answer) ? question.answer : [question.answer];
      const answerText = accepted[0] ? String(accepted[0]) : "";
      if (answerText) {
        return `Подсказка: правильный вариант начинается на "${answerText.charAt(0)}".`;
      }
      return "Подсказка: присмотрись к вариантам внимательнее.";
    }
    case "multiple-choice": {
      const count = Array.isArray(question.answer) ? question.answer.length : 0;
      if (count > 0) {
        const forms = count === 1 ? "ый вариант" : count < 5 ? "ых варианта" : "ых вариантов";
        return `Подсказка: здесь ${count} правильн${forms}.`;
      }
      return "Подсказка: отметь несколько вариантов и проверь еще раз.";
    }
    case "date":
      return "Подсказка: это была середина сентября).";
    default: {
      const candidates = [];
      if (question.answer != null && String(question.answer).trim() !== "") {
        candidates.push(String(question.answer));
      }
      if (Array.isArray(question.answers)) {
        candidates.push(...question.answers.map((item) => String(item)));
      }
      const base = candidates[0] || "";
      if (base) {
        return `Подсказка: ответ начинается на "${base.charAt(0)}" и содержит примерно ${base.length} символов.`;
      }
      return "Подсказка: подумай о самых теплых и личных моментах.";
    }
  }
}

function resetQuestionHint() {
  elements.questionHint.textContent = "";
  elements.questionHint.classList.add("hidden");
  state.hintShownForCurrentQuestion = false;
}

function showHintForCurrentQuestion() {
  if (state.hintShownForCurrentQuestion || isFinalScreen()) return;
  const question = questions[state.currentIndex];
  elements.questionHint.textContent = getQuestionHint(question);
  elements.questionHint.classList.remove("hidden");
  state.hintShownForCurrentQuestion = true;
}

function renderGiftHint() {
  if (isFinalScreen() || !state.solved[state.currentIndex]) {
    elements.giftCard.classList.add("hidden");
    return;
  }

  const question = questions[state.currentIndex];
  elements.giftImage.src = question.image;
  elements.giftHint.textContent = question.giftHint;
  elements.giftCard.classList.remove("hidden");
}

function renderForm() {
  if (isFinalScreen()) {
    elements.answerForm.innerHTML = "";
    return;
  }

  const question = questions[state.currentIndex];
  elements.answerForm.innerHTML = "";

  const field = document.createElement("div");
  field.className = "field";

  switch (question.type) {
    case "text": {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "answer";
      input.placeholder = "Введи ответ";
      input.autocomplete = "off";
      input.required = true;
      field.appendChild(input);
      break;
    }
    case "date": {
      const input = document.createElement("input");
      input.type = "date";
      input.name = "answer";
      input.required = true;
      field.appendChild(input);
      break;
    }
    case "single-choice": {
      const optionsWrap = document.createElement("div");
      optionsWrap.className = "options";
      question.options.forEach((option, index) => {
        const id = `option-${question.id}-${index}`;
        const label = document.createElement("label");
        label.className = "option";
        label.htmlFor = id;
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "answer";
        radio.id = id;
        radio.value = option;
        radio.required = true;
        const text = document.createElement("span");
        text.textContent = option;
        label.append(radio, text);
        optionsWrap.appendChild(label);
      });
      field.appendChild(optionsWrap);
      break;
    }
    case "multiple-choice": {
      const optionsWrap = document.createElement("div");
      optionsWrap.className = "options";
      question.options.forEach((option, index) => {
        const id = `option-${question.id}-${index}`;
        const label = document.createElement("label");
        label.className = "option";
        label.htmlFor = id;
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "answer";
        checkbox.id = id;
        checkbox.value = option;
        const text = document.createElement("span");
        text.textContent = option;
        label.append(checkbox, text);
        optionsWrap.appendChild(label);
      });
      field.appendChild(optionsWrap);
      break;
    }
  }

  const submitBtn = document.createElement("button");
  submitBtn.type = "submit";
  submitBtn.className = "submit-btn";
  submitBtn.textContent = state.solved[state.currentIndex]
    ? "Уже решено"
    : "Проверить ответ";
  submitBtn.disabled = state.solved[state.currentIndex];

  elements.answerForm.append(field, submitBtn);
}

function updateNavButtons() {
  const maxUnlocked = getMaxUnlockedIndex();
  elements.prevButton.disabled = state.currentIndex <= 0;
  elements.nextButton.disabled = state.currentIndex >= maxUnlocked;
}

function updateProgressUI() {
  const solved = getSolvedCount();
  const total = questions.length;
  const percent = Math.round((solved / total) * 100);

  if (isFinalScreen()) {
    elements.progressText.textContent = "Финальный экран";
  } else {
    const current = state.currentIndex + 1;
    elements.progressText.textContent = `Вопрос ${current} из ${total}`;
  }
  elements.solvedText.textContent = `Решено: ${solved}`;
  elements.progressBarFill.style.width = `${percent}%`;
}

function renderJumpButtons() {
  elements.jumpButtons.innerHTML = "";
  const maxUnlocked = getMaxUnlockedIndex();

  questions.forEach((question, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = String(question.id);
    button.className = "jump-buttons__item";
    button.dataset.index = index;
    button.disabled = index > maxUnlocked;
    button.classList.toggle("is-current", state.currentIndex === index);
    button.classList.toggle("is-solved", state.solved[index]);
    elements.jumpButtons.appendChild(button);
  });
}

function renderScreen() {
  const final = isFinalScreen();

  elements.finalCard.classList.toggle("hidden", !final);
  elements.answerForm.classList.toggle("hidden", final);

  if (final) {
    elements.questionTitle.textContent = "Поздравляю! Все вопросы решены ✨";
    elements.questionPrompt.textContent =
      "Ты можешь вернуться к любому вопросу через быстрый переход ниже.";
    elements.questionImage.classList.add("hidden");
    elements.questionImage.removeAttribute("src");
    showStatus("", null);
    resetQuestionHint();
  } else {
    const question = questions[state.currentIndex];
    elements.questionTitle.textContent = question.title;
    elements.questionPrompt.textContent = question.prompt;
    if (question.questionImage) {
      elements.questionImage.src = question.questionImage;
      elements.questionImage.classList.remove("hidden");
    } else {
      elements.questionImage.classList.add("hidden");
      elements.questionImage.removeAttribute("src");
    }
    showStatus("", null);
    resetQuestionHint();
  }

  renderForm();
  renderGiftHint();
  renderJumpButtons();
  updateNavButtons();
  updateProgressUI();
}

function moveToQuestion(index) {
  const now = Date.now();
  if (now - state.lastNavigationTime < CONFIG.DEBOUNCE_DELAY) {
    return;
  }
  state.lastNavigationTime = now;

  const maxUnlocked = getMaxUnlockedIndex();
  const safeIndex = Math.min(Math.max(index, 0), maxUnlocked);
  
  if (safeIndex === state.currentIndex) return;
  
  const questionCard = elements.questionCard;
  questionCard.classList.add('fade-out');
  
  setTimeout(() => {
    state.currentIndex = safeIndex;
    saveProgressToCookie();
    renderScreen();
    questionCard.classList.remove('fade-out');
    questionCard.classList.add('fade-in');
    setTimeout(() => questionCard.classList.remove('fade-in'), CONFIG.ANIMATION_FADE_IN);
  }, CONFIG.ANIMATION_FADE_OUT);
}

class ConfettiEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isActive = false;
  }

  init() {
    this.canvas = document.createElement('canvas');
    this.canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    document.body.appendChild(this.canvas);
  }

  createParticles(count, particleRatio) {
    const totalParticles = Math.floor(count * particleRatio);
    for (let i = 0; i < totalParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height - this.canvas.height,
        color: CONFIG.CONFETTI_COLORS[Math.floor(Math.random() * CONFIG.CONFETTI_COLORS.length)],
        size: Math.random() * 5 + 2,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }
  }

  animate() {
    if (!this.isActive) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let activeParticles = false;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.rotationSpeed;

      if (p.y < this.canvas.height) {
        activeParticles = true;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate((p.rotation * Math.PI) / 180);
        this.ctx.fillStyle = p.color;
        this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        this.ctx.restore();
      } else {
        this.particles.splice(i, 1);
      }
    }

    if (activeParticles) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.cleanup();
    }
  }

  fire() {
    if (!this.canvas || !document.body.contains(this.canvas)) {
      this.init();
    }

    this.isActive = true;
    this.particles = [];

    const waves = [
      { ratio: 0.25 },
      { ratio: 0.2 },
      { ratio: 0.35 },
      { ratio: 0.1 },
      { ratio: 0.1 }
    ];

    waves.forEach(wave => {
      this.createParticles(CONFIG.CONFETTI_COUNT, wave.ratio);
    });

    this.animate();

    setTimeout(() => {
      if (this.isActive) {
        this.cleanup();
      }
    }, CONFIG.ANIMATION_CONFETTI_CLEANUP);
  }

  cleanup() {
    this.isActive = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    if (this.canvas && document.body.contains(this.canvas)) {
      document.body.removeChild(this.canvas);
    }
    this.particles = [];
  }
}

const confetti = new ConfettiEngine();

function fireConfetti() {
  confetti.fire();
}

function playSound(soundFile) {
  try {
    const audio = new Audio(soundFile);
    audio.play().catch(error => {
      console.warn('Sound playback failed:', error);
    });
  } catch (error) {
    console.warn('Sound file not found:', soundFile, error);
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  if (isFinalScreen()) return;

  const question = questions[state.currentIndex];
  if (state.solved[state.currentIndex]) return;

  const formData = new FormData(elements.answerForm);
  const userAnswer = question.type === "multiple-choice"
    ? formData.getAll("answer")
    : formData.get("answer");

  if (question.type === "multiple-choice") {
    if (!userAnswer || userAnswer.length === 0) {
      showStatus("Пожалуйста, отметь хотя бы один вариант.", "error");
      return;
    }
  } else if (userAnswer === null || String(userAnswer).trim() === "") {
    showStatus("Пожалуйста, введи/выбери ответ.", "error");
    return;
  }

  if (!isCorrectAnswer(question, userAnswer)) {
    showStatus("Пока неверно. Попробуй еще раз 💛", "error");
    playSound("./sounds/error.mp3");
    showHintForCurrentQuestion();
    return;
  }

  fireConfetti();
  playSound("./sounds/success.mp3");
  state.solved[state.currentIndex] = true;
  showStatus("Верно! Подсказка к подарку открыта ✨", "success");

  saveProgressToCookie();
  renderScreen();
}

function handlePrevClick() {
  moveToQuestion(state.currentIndex - 1);
}

function handleNextClick() {
  moveToQuestion(state.currentIndex + 1);
}

function handleJumpButtonClick(event) {
  const button = event.target.closest('.jump-buttons__item');
  if (button && !button.disabled) {
    const index = parseInt(button.dataset.index, 10);
    if (!isNaN(index)) {
      moveToQuestion(index);
    }
  }
}

function initTheme() {
  const savedTheme = localStorage.getItem(CONFIG.THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
    const themeCheckbox = document.getElementById('theme-switch');
    if (themeCheckbox) {
      themeCheckbox.checked = true;
    }
  } else {
    document.documentElement.setAttribute('data-theme', 'light');
    const themeCheckbox = document.getElementById('theme-switch');
    if (themeCheckbox) {
      themeCheckbox.checked = false;
    }
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(CONFIG.THEME_STORAGE_KEY, newTheme);

  const themeCheckbox = document.getElementById('theme-switch');
  if (themeCheckbox) {
    themeCheckbox.checked = newTheme === 'dark';
  }
}

function initThemeSystem() {
  // Initialize theme
  initTheme();

  // Add theme toggle event listener
  const themeToggle = document.getElementById('theme-switch');
  if (themeToggle) {
    themeToggle.addEventListener('change', toggleTheme);
  }
}

function init() {
  if (!questions.length) {
    elements.questionTitle.textContent = "Добавь вопросы в script.js";
    elements.questionPrompt.textContent = "";
    elements.answerForm.innerHTML = "";
    return;
  }

  cacheDOMElements();
  loadProgressFromCookie();
  renderScreen();

  elements.answerForm.addEventListener("submit", handleFormSubmit);
  elements.prevButton.addEventListener("click", handlePrevClick);
  elements.nextButton.addEventListener("click", handleNextClick);
  elements.jumpButtons.addEventListener("click", handleJumpButtonClick);
}

// Initialize theme system - this should run on all pages
initThemeSystem();

init();
