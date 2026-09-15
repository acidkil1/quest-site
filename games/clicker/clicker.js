let money = 0;
let mpc = 1;
let mpcCost = 10;
let mpcCount = 0; 
let mps = 0;
let mpsCount = 0; 
let mpsCost = 50;

let clickBonus = 1;        // Бонус к клику (пассивное улучшение)
let clickBonusCost = 1;   // Цена улучшения клика
let clickBonusCount = 0;   // Количество купленных улучшений

// Новые улучшения за рыб
let mpsBonusPercent = 0;      // Бонус % к MPS
let mpsBonusCost = 1;         // Цена в рыбах
let mpsBonusCount = 0;        // Количество покупок

let fishPerLevelBonus = 0;    // Бонус рыб за уровень
let fishPerLevelCost = 1;     // Цена в рыбах
let fishPerLevelCount = 0;    // Количество покупок

let xpBonusPercent = 0;       // Бонус % к получению XP
let xpBonusCost = 1;          // Цена в рыбах
let xpBonusCount = 0;         // Количество покупок

let critChanceBonus = 0;      // Бонус % к шансу крита
let critChanceCost = 1;       // Цена в рыбах
let critChanceCount = 0;      // Количество покупок

let placeholderUpgradeCost = 1;  // Заглушка
let placeholderUpgradeCount = 0; // Заглушка

let level = 1;
let xp = 0;
let xpToNextLevel = 100;
let fish = 0;  

const XP_PER_CLICK = 1;          // Опыт за один клик
const XP_PER_PURCHASE_PERCENT = 0.05; // 5% от стоимости улучшения идет в опыт
const FISH_REWARD_BASE = 1;      // Базовая награда рыбами за уровень

// Критический клик
let critChance = 0.01;           // 5% шанс крита (0.05 = 5%)
let critMultiplier = 2;          // Множитель крита (2x)

// Переменные для новых улучшений mps
let upgrade1Count = 0;
let upgrade1Cost = 200;
let upgrade1Bonus = 5;
let upgrade2Count = 0;
let upgrade2Cost = 1000;
let upgrade2Bonus = 25;
let upgrade3Count = 0;
let upgrade3Cost = 5000;
let upgrade3Bonus = 100;

let mpsInterval = null;

// --- ЗОЛОТАЯ КОШКА ---
let goldenCatInterval = null; // Таймер до следующего появления
let goldenCatTimeout = null;  // Таймер исчезновения
let goldenCatActive = false;  // Флаг, активна ли кошка сейчас
let clickMultiplier = 1;      // Множитель клика (для бонуса)
let mpsMultiplier = 1;        // Множитель пассивного дохода (для бонуса)
let bonusTimeout = null;      // Таймер окончания бонуса
let bonusStartTime = 0;       // Время начала бонуса
let bonusDuration = 0;        // Длительность бонуса в мс
let bonusUpdateInterval = null; // Интервал обновления виджета

const goldenCatElement = document.getElementById("goldenCat");
const bonusTimerWidget = document.getElementById("bonusTimerWidget");
const bonusProgressCircle = bonusTimerWidget?.querySelector("#bonusProgressCircle");
// Длина окружности для r=36: 2 * π * 36 ≈ 226
const CIRCLE_CIRCUMFERENCE = 226;

// --- ПРЕСТИЖ ---
let souls = 0; 

// Массив порогов для каждого уровня престижа (после 5-го цена фиксированная)
const PRESTIGE_THRESHOLDS = [
    50000, 
    100000,    
    250000,    
    500000,    
    1000000      
];
const SOUL_BONUS_PERCENT = 0.1; 

function getPrestigeThreshold() {
    // Если престижей больше или равно количеству порогов, используем последний порог
    if (souls >= PRESTIGE_THRESHOLDS.length) {
        return PRESTIGE_THRESHOLDS[PRESTIGE_THRESHOLDS.length - 1];
    }
    return PRESTIGE_THRESHOLDS[souls];
}

function formatNumber(num) {
    num = Math.round(num);
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    }
    return num.toString();
}

// Элементы интерфейса
const moneyDisplay = document.getElementById("money");
const mpcDisplay = document.getElementById("mpc");
const mpcCostDisplay = document.getElementById("mpcCost");
const mpsDisplay = document.getElementById("mps");
const mpsCostDisplay = document.getElementById("mpsCost");

const upgrade1CountDisplay = document.getElementById("upgrade1Count");
const upgrade1CostDisplay = document.getElementById("upgrade1Cost");
const upgrade2CountDisplay = document.getElementById("upgrade2Count");
const upgrade2CostDisplay = document.getElementById("upgrade2Cost");
const upgrade3CountDisplay = document.getElementById("upgrade3Count");
const upgrade3CostDisplay = document.getElementById("upgrade3Cost");

const mpcCountDisplay = document.getElementById("mpcCount");
const mpsCountDisplay = document.getElementById("mpsCount");

const clickAudio1 = document.getElementById("clickAudio1");
const clickAudio2 = document.getElementById("clickAudio2");
const clickAudio3 = document.getElementById("clickAudio3");
const shopAudioSource = document.getElementById("shopAudio");
const muteButton = document.getElementById("muteButton");
const goldenCatAudio = document.getElementById("goldenCatAudio"); 
const xpAudio = document.getElementById("xpAudio");
const backgroundMusic = document.getElementById("backgroundMusic");

// Настройка громкости
if(clickAudio1) clickAudio1.volume = 0.3;
if(clickAudio2) clickAudio2.volume = 0.3;
if(clickAudio3) clickAudio3.volume = 0.8;
if(shopAudioSource) shopAudioSource.volume = 0.5;
if(xpAudio) xpAudio.volume = 0.5;
if(backgroundMusic) backgroundMusic.volume = 0.3;

let isMuted = false;
const clickSounds = [clickAudio1, clickAudio2, clickAudio3];

// Запуск фоновой музыки
if (backgroundMusic) {
    backgroundMusic.loop = true;
    backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
}

function playRandomClickSound() {
    if (isMuted || !clickSounds[0]) return;
    const randomSound = clickSounds[Math.floor(Math.random() * clickSounds.length)];
    const audio = randomSound.cloneNode();
    audio.volume = randomSound.volume;
    audio.play().catch(e => console.log("Audio play failed:", e));
}

function playSound(audioSource) {
    if (isMuted || !audioSource) return;
    const audio = audioSource.cloneNode();
    audio.volume = audioSource.volume;
    audio.play().catch(e => console.log("Audio play failed:", e));
}

function toggleMute() {
    isMuted = !isMuted;
    
    // Включаем/выключаем фоновую музыку
    if (backgroundMusic) {
        if (isMuted) {
            backgroundMusic.pause();
        } else {
            backgroundMusic.play().catch(e => console.log("Background music play failed:", e));
        }
    }
    
    if (muteButton) {
        if (isMuted) {
            muteButton.textContent = "🔇";
            muteButton.title = "Включить звук";
        } else {
            muteButton.textContent = "🔊";
            muteButton.title = "Выключить звук";
        }
    }
}

if(muteButton) muteButton.addEventListener("click", toggleMute);

function getPrestigeMultiplier() {
    return 1 + (souls * SOUL_BONUS_PERCENT);
}

function addXP(amount) {
    // Учёт бонуса к XP
    const actualAmount = amount * (1 + xpBonusPercent / 100);
    xp += actualAmount;
    
    // Проверяем, не пора ли повышать уровень
    while (xp >= xpToNextLevel) {
        levelUp();
    }
    
    updateDisplay(); // Обновляем интерфейс, чтобы показать новый XP/Level
}

function levelUp() {
    xp -= xpToNextLevel; // Вычитаем потраченный опыт
    level++;             // Повышаем уровень
    
    // Рассчитываем, сколько нужно для следующего уровня (формула роста сложности)
    // Пример: каждый уровень требует на 50 XP больше предыдущего
    xpToNextLevel = Math.round(xpToNextLevel * 1.25); 
    
    // Награда рыбами: чем выше уровень, тем больше рыб
    const fishReward = (FISH_REWARD_BASE + fishPerLevelBonus); 
    fish += fishReward;
    
    // Визуальный эффект - цветные конфетти сверху
    fireRainbowConfetti();
    
    // Звук повышения уровня
    if (!isMuted && xpAudio) {
        const audio = xpAudio.cloneNode();
        audio.volume = xpAudio.volume;
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
    
    console.log(`Уровень повышен! Теперь уровень ${level}. Получено ${fishReward} рыб.`);
}

function getXPProgressPercent() {
    if (xpToNextLevel === 0) return 100;
    return Math.min(100, Math.round((xp / xpToNextLevel) * 100));
}


function updateDisplay() {
    if(!moneyDisplay) return;

    // Отображаю доход с учетом всех бонусов
    const actualMPC = (mpc * clickBonus) * getPrestigeMultiplier() * clickMultiplier;
    const actualMPS = mps * (1 + mpsBonusPercent / 100) * getPrestigeMultiplier() * mpsMultiplier;
    const levelDisplay = document.getElementById("levelDisplay");
    const xpDisplay = document.getElementById("xpDisplay");
    const xpNextDisplay = document.getElementById("xpNextDisplay");
    const fishDisplay = document.getElementById("fishDisplay");
    const xpBarFill = document.getElementById("xpBarFill");
    const critChanceDisplay = document.getElementById("critChance");

    // Мобильные счетчики
    const moneyMobileShop = document.getElementById("moneyMobileShop");
    const mpsMobileShop = document.getElementById("mpsMobileShop");
    const moneyMobileCenter = document.getElementById("moneyMobileCenter");
    const mpsMobileCenter = document.getElementById("mpsMobileCenter");

    if (levelDisplay) levelDisplay.textContent = level;
    if (xpDisplay) xpDisplay.textContent = formatNumber(xp);
    if (xpNextDisplay) xpNextDisplay.textContent = formatNumber(xpToNextLevel);
    if (fishDisplay) fishDisplay.textContent = formatNumber(fish);
    if (critChanceDisplay) critChanceDisplay.textContent = Math.round(critChance * 100) + '%';

    if (xpBarFill) {
        const percent = getXPProgressPercent();
        xpBarFill.style.width = `${percent}%`;
    }    

    moneyDisplay.textContent = formatNumber(money);
    mpcDisplay.textContent = formatNumber(actualMPC); // Показываю реальный клик с бонусами
    mpcCostDisplay.textContent = formatNumber(mpcCost);
    mpsDisplay.textContent = formatNumber(actualMPS); // Показываю реальный пассив с бонусами
    mpsCostDisplay.textContent = formatNumber(mpsCost);

    // Обновление мобильных счетчиков
    if (moneyMobileShop) moneyMobileShop.textContent = formatNumber(money);
    if (mpsMobileShop) mpsMobileShop.textContent = formatNumber(actualMPS);
    if (moneyMobileCenter) moneyMobileCenter.textContent = formatNumber(money);
    if (mpsMobileCenter) mpsMobileCenter.textContent = formatNumber(actualMPS);

    if (mpcCountDisplay) mpcCountDisplay.textContent = mpcCount;
    if (mpsCountDisplay) mpsCountDisplay.textContent = mpsCount;

    // Обновление общего бонуса от шариков
    const mpsTotalBonusDisplay = document.getElementById("mpsTotalBonus");
    if (mpsTotalBonusDisplay) {
        const totalBonus = mpsCount * 1; // Каждый шарик дает +1 Мяу/сек
        mpsTotalBonusDisplay.textContent = `+${totalBonus} Мяу`;
    }

    // Обновление общего бонуса от улучшений клика (Мышь)
    const mpcTotalBonusDisplay = document.getElementById("mpcTotalBonus");
    if (mpcTotalBonusDisplay) {
        const totalBonus = mpcCount * 1; // Каждый уровень дает +1 Мяу на клик
        mpcTotalBonusDisplay.textContent = `+${totalBonus} Мяу`;
    }

    // Обновление общих бонусов от улучшений за Мяу
    const upgrade1TotalBonusDisplay = document.getElementById("upgrade1TotalBonus");
    if (upgrade1TotalBonusDisplay) {
        const totalBonus = upgrade1Count * upgrade1Bonus;
        upgrade1TotalBonusDisplay.textContent = `+${totalBonus} Мяу`;
    }

    const upgrade2TotalBonusDisplay = document.getElementById("upgrade2TotalBonus");
    if (upgrade2TotalBonusDisplay) {
        const totalBonus = upgrade2Count * upgrade2Bonus;
        upgrade2TotalBonusDisplay.textContent = `+${totalBonus} Мяу`;
    }

    const upgrade3TotalBonusDisplay = document.getElementById("upgrade3TotalBonus");
    if (upgrade3TotalBonusDisplay) {
        const totalBonus = upgrade3Count * upgrade3Bonus;
        upgrade3TotalBonusDisplay.textContent = `+${formatNumber(totalBonus)} Мяу`;
    }

    if (upgrade1CountDisplay) upgrade1CountDisplay.textContent = upgrade1Count;
    if (upgrade1CostDisplay) upgrade1CostDisplay.textContent = formatNumber(upgrade1Cost);
    if (upgrade2CountDisplay) upgrade2CountDisplay.textContent = upgrade2Count;
    if (upgrade2CostDisplay) upgrade2CostDisplay.textContent = formatNumber(upgrade2Cost);
    if (upgrade3CountDisplay) upgrade3CountDisplay.textContent = upgrade3Count;
    if (upgrade3CostDisplay) upgrade3CostDisplay.textContent = formatNumber(upgrade3Cost);

    // Обновление улучшения клика
    const clickBonusCostDisplay = document.getElementById("clickBonusCost");
    const clickBonusCountDisplay = document.getElementById("clickBonusCount");

    if (clickBonusCostDisplay) clickBonusCostDisplay.textContent = formatNumber(clickBonusCost);
    if (clickBonusCountDisplay) clickBonusCountDisplay.textContent = clickBonusCount;

    // Обновление новых улучшений за рыб
    const mpsBonusCostDisplay = document.getElementById("mpsBonusCost");
    const mpsBonusCountDisplay = document.getElementById("mpsBonusCount");
    const fishPerLevelCostDisplay = document.getElementById("fishPerLevelCost");
    const fishPerLevelCountDisplay = document.getElementById("fishPerLevelCount");
    const xpBonusCostDisplay = document.getElementById("xpBonusCost");
    const xpBonusCountDisplay = document.getElementById("xpBonusCount");
    const critChanceCostDisplay = document.getElementById("critChanceCost");
    const critChanceCountDisplay = document.getElementById("critChanceCount");
    const placeholderCostDisplay = document.getElementById("placeholderCost");
    const placeholderCountDisplay = document.getElementById("placeholderCount");

    if (mpsBonusCostDisplay) mpsBonusCostDisplay.textContent = mpsBonusCost;
    if (mpsBonusCountDisplay) mpsBonusCountDisplay.textContent = mpsBonusCount;
    if (fishPerLevelCostDisplay) fishPerLevelCostDisplay.textContent = fishPerLevelCost;
    if (fishPerLevelCountDisplay) fishPerLevelCountDisplay.textContent = fishPerLevelCount;
    if (xpBonusCostDisplay) xpBonusCostDisplay.textContent = xpBonusCost;
    if (xpBonusCountDisplay) xpBonusCountDisplay.textContent = xpBonusCount;
    if (critChanceCostDisplay) critChanceCostDisplay.textContent = formatNumber(critChanceCost);
    if (critChanceCountDisplay) critChanceCountDisplay.textContent = critChanceCount;
    if (placeholderCostDisplay) placeholderCostDisplay.textContent = placeholderUpgradeCost;
    if (placeholderCountDisplay) placeholderCountDisplay.textContent = placeholderUpgradeCount;

    // Обновление общих бонусов улучшений за рыб
    const fishPerLevelTotalBonusDisplay = document.getElementById("fishPerLevelTotalBonus");
    if (fishPerLevelTotalBonusDisplay) {
        const totalBonus = fishPerLevelCount * 1;
        fishPerLevelTotalBonusDisplay.textContent = `+${totalBonus}🐟`;
    }

    const clickBonusTotalBonusDisplay = document.getElementById("clickBonusTotalBonus");
    if (clickBonusTotalBonusDisplay) {
        const totalPercent = Math.round(clickBonusCount * 5);
        clickBonusTotalBonusDisplay.textContent = `+${totalPercent}%`;
    }

    const mpsBonusTotalBonusDisplay = document.getElementById("mpsBonusTotalBonus");
    if (mpsBonusTotalBonusDisplay) {
        const totalPercent = mpsBonusCount * 5;
        mpsBonusTotalBonusDisplay.textContent = `+${totalPercent}%`;
    }

    const xpBonusTotalBonusDisplay = document.getElementById("xpBonusTotalBonus");
    if (xpBonusTotalBonusDisplay) {
        const totalPercent = xpBonusCount * 5;
        xpBonusTotalBonusDisplay.textContent = `+${totalPercent}%`;
    }

    const critChanceTotalBonusDisplay = document.getElementById("critChanceTotalBonus");
    if (critChanceTotalBonusDisplay) {
        const totalPercent = Math.round(critChanceCount * 1);
        critChanceTotalBonusDisplay.textContent = `+${totalPercent}%`;
    }

    // Обновление престижа
    const soulsDisplay = document.getElementById("soulsDisplay");
    const soulsBonusDisplay = document.getElementById("soulsBonusDisplay");
    const prestigeBtn = document.getElementById("prestigeBtn");

    if (soulsDisplay) {
        soulsDisplay.textContent = souls;
    }

    if (soulsBonusDisplay) {
        const soulBonusPercent = Math.round(souls * SOUL_BONUS_PERCENT * 100);
        soulsBonusDisplay.textContent = `(+${soulBonusPercent}%)`;
    }

    if (prestigeBtn) {
        const currentThreshold = getPrestigeThreshold();
        if (money >= currentThreshold) {
            prestigeBtn.classList.remove("hidden");
            prestigeBtn.innerHTML = `<span style="font-size: 24px;">🌀</span> <span style="color: #e0f2ff;"> Перерождение <br> (+1 Душа)</span>`;
        } else {
            prestigeBtn.classList.add("hidden");
        }
    }
}

// --- ЛОГИКА ИГРЫ ---

// Функция для создания конфетти при покупках
function fireConfetti(intensity = 1, color = '#ffffff', startX = null, startY = null, duration = 250) {
    const particleCount = Math.floor(50 * intensity);
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Если координаты не переданы, используем центр экрана
    const originX = startX !== null ? startX : canvas.width / 2;
    const originY = startY !== null ? startY : canvas.height / 2;
    
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        // Случайный угол и расстояние для разлета
        const angle = Math.random() * Math.PI * 2;
        const distance = 30 + Math.random() * 80; // Уменьшил разброс
        const speedX = Math.cos(angle) * (distance / 20);
        const speedY = Math.sin(angle) * (distance / 20) - 3; // Чуть меньше вверх
        
        particles.push({
            x: originX,
            y: originY,
            color: color,
            size: Math.random() * 6 + 3, // Чуть меньше
            speedX: speedX,
            speedY: speedY,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 8,
            gravity: 0.15,
            life: 1.0 // Жизненный цикл
        });
    }
    
    let animationId;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeParticles = 0;
        
        particles.forEach(particle => {
            particle.life -= 0.015; // Скорость исчезновения
            
            if (particle.life > 0 && particle.y < canvas.height + particle.size && particle.x > -particle.size && particle.x < canvas.width + particle.size) {
                activeParticles++;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;
                ctx.globalAlpha = particle.life;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                particle.x += particle.speedX;
                particle.y += particle.speedY;
                particle.speedY += particle.gravity;
                particle.rotation += particle.rotationSpeed;
            }
        });
        
        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                canvas.remove();
            }, duration);
        }
    }

    animate();
}

// Функция для цветных конфетти сверху (уровень, престиж)
function fireRainbowConfetti() {
    const colors = ['#6fb8df', '#2a8a7a', '#c34f7b', '#f0faff', '#ffd700'];
    const particleCount = 100;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            speedY: Math.random() * 3 + 2,
            speedX: (Math.random() - 0.5) * 2,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 10
        });
    }
    
    let animationId;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeParticles = 0;
        
        particles.forEach(particle => {
            if (particle.y < canvas.height + particle.size) {
                activeParticles++;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                particle.y += particle.speedY;
                particle.x += particle.speedX;
                particle.rotation += particle.rotationSpeed;
            }
        });
        
        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                canvas.remove();
            }, 2500);
        }
    }

    animate();
}

// Функция для золотых конфетти сверху (золотая кошка)
function fireGoldenConfetti() {
    const colors = ['#ffd700', '#ffea00', '#ff8c00', '#ffa500'];
    const particleCount = 150;
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 10 + 5,
            speedY: Math.random() * 4 + 3,
            speedX: (Math.random() - 0.5) * 3,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15
        });
    }
    
    let animationId;
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let activeParticles = 0;
        
        particles.forEach(particle => {
            if (particle.y < canvas.height + particle.size) {
                activeParticles++;
                
                ctx.save();
                ctx.translate(particle.x, particle.y);
                ctx.rotate((particle.rotation * Math.PI) / 180);
                ctx.fillStyle = particle.color;
                ctx.shadowColor = particle.color;
                ctx.shadowBlur = 10;
                ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
                ctx.restore();
                
                particle.y += particle.speedY;
                particle.x += particle.speedX;
                particle.rotation += particle.rotationSpeed;
            }
        });
        
        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            setTimeout(() => {
                canvas.remove();
            }, 3000);
        }
    }
    
    animate();
}

function createHeartEffect(x, y, amount, isCritical = false) {
    // Уменьшаем количество партиклов при крите
    const heartCount = isCritical ? Math.min(1, Math.max(3, Math.floor(amount / 20) + 2)) : Math.min(1, Math.max(2, Math.floor(amount / 10) + 1));
    
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart-particle';
            
            if (isCritical) {
                heart.classList.add('heart-particle-critical');
            }
            
            // Случайный смещение по X
            const offsetX = (Math.random() - 0.5) * (isCritical ? 80 : 60);
            
            heart.style.left = (x + offsetX) + 'px';
            heart.style.top = y + 'px';
            
            // Разные цвета для сердечек
            let colors;
            if (isCritical) {
                colors = ['#ffd700', '#ffea00', '#ff8c00', '#ffa500', '#ffd700'];
            } else {
                colors = ['white'];
            }
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            const size = isCritical ? 32 + Math.random() * 16 : 24 + Math.random() * 12;
            
            // Убираем надпись КРИТ, оставляем только число урона
            heart.innerHTML = `
                <span class="heart-symbol" style="color: ${randomColor}; font-size: ${size}px;">${isCritical ? '💥' : '❤️'}</span>
                ${i === 0 ? `<span class="heart-count" style="color: ${randomColor};">+${formatNumber(amount)}</span>` : ''}
            `;
            
            document.body.appendChild(heart);
            
            // Удаляем элемент после анимации
            setTimeout(() => {
                heart.remove();
            }, 1500);
        }, i * 80);
    }
}

function createCriticalEffect(x, y, amount) {
    // Создаем взрывной эффект для крита
    const particleCount = 3;
    const colors = ['#ffd700', '#ff8c00', '#ff4500', '#ffea00'];
    
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'heart-particle critical-explosion';
            
            // Случайное направление взрыва
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 1 + Math.random() * 100;
            const offsetX = Math.cos(angle) * distance;
            const offsetY = Math.sin(angle) * distance;
            
            particle.style.left = (x + offsetX) + 'px';
            particle.style.top = (y + offsetY) + 'px';
            
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            particle.innerHTML = `
                <span class="heart-symbol" style="color: ${randomColor}; font-size: ${20 + Math.random() * 20}px;">⚡</span>
            `;
            
            document.body.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }, i * 30);
    }
    
    // Показываем всплывающий текст КРИТ
    const critText = document.createElement('div');
    critText.className = 'crit-float-text';
    critText.style.left = x + 'px';
    critText.style.top = (y - 30) + 'px';
    critText.innerHTML = `<span style="color: #ffd700; font-size: 36px; font-weight: bold; text-shadow: 0 0 20px #ff8c00;">💥 КРИТ +${formatNumber(amount)}!</span>`;
    document.body.appendChild(critText);
    
    setTimeout(() => {
        critText.remove();
    }, 1200);
}

function clickCookie() {
    const baseMPC = (mpc * clickBonus) * getPrestigeMultiplier() * clickMultiplier;
    
    // Проверка критического клика
    const isCritical = Math.random() < (critChance + critChanceBonus);
    const actualMPC = isCritical ? baseMPC * critMultiplier : baseMPC;
    
    money += actualMPC;

    // Учёт бонуса к XP (крит дает в 2 раза больше опыта)
    const xpGain = XP_PER_CLICK * (1 + xpBonusPercent / 100) * (isCritical ? 2 : 1);
    addXP(xpGain); 

    // Эффект сердечек при клике
    const clickButton = document.querySelector('.click-button');
    if (clickButton) {
        const rect = clickButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        if (isCritical) {
            createCriticalEffect(centerX, centerY, actualMPC);
            createHeartEffect(centerX, centerY, actualMPC, true);
        } else {
            createHeartEffect(centerX, centerY, actualMPC, false);
        }
    }

    playRandomClickSound();
    updateDisplay();
    saveGame();
    
    // Звук для крита
    if (isCritical && !isMuted && goldenCatAudio) {
        const audio = goldenCatAudio.cloneNode();
        audio.volume = 0.5;
        audio.play().catch(e => console.log("Audio play failed:", e));
    }
}

function upgradeMPC() {
    if (money >= mpcCost) {
        money -= mpcCost;
        mpc++;
        mpcCost *= 1.5;
        mpcCount++;

        const xpGain = Math.round(mpcCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyMPS() {
    if (money >= mpsCost) {
        money -= mpsCost;
        mps++;
        mpsCost = Math.round(mpsCost * 1.15);
        mpsCount++;

        const xpGain = Math.round(mpsCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        if(shopAudioSource) playSound(shopAudioSource);

        if (!mpsInterval) {
            mpsInterval = setInterval(function() {
                const actualMPS = mps * getPrestigeMultiplier() * mpsMultiplier;
                money += actualMPS;
                updateDisplay();
                saveGame(); 
            }, 1000);
        }
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyUpgrade1() {
    if (money >= upgrade1Cost) {
        money -= upgrade1Cost;
        mps += upgrade1Bonus;
        upgrade1Count++;

        const xpGain = Math.round(upgrade1Cost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        upgrade1Cost = Math.round(upgrade1Cost * 1.15);
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyUpgrade2() {
    if (money >= upgrade2Cost) {
        money -= upgrade2Cost;
        mps += upgrade2Bonus;
        upgrade2Count++;

        const xpGain = Math.round(upgrade2Cost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        upgrade2Cost = Math.round(upgrade2Cost * 1.15);
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyUpgrade3() {
    if (money >= upgrade3Cost) {
        money -= upgrade3Cost;
        mps += upgrade3Bonus;
        upgrade3Count++;

        const xpGain = Math.round(upgrade3Cost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        upgrade3Cost = Math.round(upgrade3Cost * 1.15);
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function upgradeClickBonus() {
    if (fish >= clickBonusCost) {
        fish -= clickBonusCost;
        clickBonus += 0.05;
        clickBonusCount++;

        const xpGain = Math.round(clickBonusCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        clickBonusCost = Math.round(clickBonusCost + 1);
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyMpsBonus() {
    if (fish >= mpsBonusCost) {
        fish -= mpsBonusCost;
        mpsBonusPercent += 5;
        mpsBonusCount++;

        const xpGain = Math.round(mpsBonusCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        mpsBonusCost = mpsBonusCost + 1;
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyFishPerLevelBonus() {
    if (fish >= fishPerLevelCost) {
        fish -= fishPerLevelCost;
        fishPerLevelBonus += 1;
        fishPerLevelCount++;

        const xpGain = Math.round(fishPerLevelCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        fishPerLevelCost = fishPerLevelCost + 1;
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyXpBonus() {
    if (fish >= xpBonusCost) {
        fish -= xpBonusCost;
        xpBonusPercent += 5;
        xpBonusCount++;

        const xpGain = Math.round(xpBonusCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        xpBonusCost = xpBonusCost + 1;
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyCritChanceBonus() {
    if (fish >= critChanceCost) {
        fish -= critChanceCost;
        critChanceBonus += 0.01;
        critChanceCount++;

        const xpGain = Math.round(critChanceCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        critChanceCost = critChanceCost + 1;
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function buyPlaceholderUpgrade() {
    if (fish >= placeholderUpgradeCost) {
        fish -= placeholderUpgradeCost;
        placeholderUpgradeCount++;

        const xpGain = Math.round(placeholderUpgradeCost * XP_PER_PURCHASE_PERCENT);
        addXP(xpGain);

        // Эффект конфетти при покупке из центра кнопки
        const btn = event.currentTarget;
        if (btn) {
            const rect = btn.getBoundingClientRect();
            fireConfetti(0.5, '#ffffff', rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        
        placeholderUpgradeCost = placeholderUpgradeCost + 1;
        if(shopAudioSource) playSound(shopAudioSource);
        updateDisplay();
        saveGame();
    } else {
        showNotEnoughMoney(event.currentTarget);
    }
}

function showNotEnoughMoney(button) {
    if (button) {
        button.classList.add('not-enough-money');
        setTimeout(() => {
            button.classList.remove('not-enough-money');
        }, 400);
    }
}

let bar1 = document.getElementById('progress-upg1');
let bar2 = document.getElementById('progress-upg2');
let bar3 = document.getElementById('progress-upg3');
let bar4 = document.getElementById('progress-upg4');
let bar5 = document.getElementById('progress-upg5');
let val1 = 0;
let val2 = 0;
let val3 = 0;
let val4 = 0;
let val5 = 0;
    setInterval(() => {
        if (val1 < 100) {
            val1 = money / mpcCost * 100;
            bar1.value = val1;
            updateDisplay();
        }

        if (val2 < 100) {
            val2 = money / mpsCost * 100;
            bar2.value = val2;
            updateDisplay();
        }

        if (val3 < 100) {
            val3 = money / upgrade1Cost * 100;
            bar3.value = val3;
            updateDisplay();
        }

        if (val4 < 100) {
            val4 = money / upgrade2Cost * 100;
            bar4.value = val4;
            updateDisplay();
        }

        if (val5 < 100) {
            val5 = money / upgrade3Cost * 100;
            bar5.value = val5;
            updateDisplay();
        }
    }, 1000);

    // Обновление прогресс-баров
function updateProgressBars() {
    const bar1 = document.getElementById('progress-upg1');
    const bar2 = document.getElementById('progress-upg2');
    const bar3 = document.getElementById('progress-upg3');
    const bar4 = document.getElementById('progress-upg4');
    const bar5 = document.getElementById('progress-upg5');
    
    if (!bar1 || !bar2 || !bar3 || !bar4 || !bar5) return;
    
    bar1.value = Math.min(100, Math.max(0, money / mpcCost * 100));
    bar2.value = Math.min(100, Math.max(0, money / mpsCost * 100));
    bar3.value = Math.min(100, Math.max(0, money / upgrade1Cost * 100));
    bar4.value = Math.min(100, Math.max(0, money / upgrade2Cost * 100));
    bar5.value = Math.min(100, Math.max(0, money / upgrade3Cost * 100));
}

setInterval(updateProgressBars, 100);

// --- ЛОГИКА ЗОЛОТОЙ КОШКИ ---

function spawnGoldenCat() {
    if (goldenCatActive) return; // Если уже есть, не спавним новую

    goldenCatActive = true;
    
    // Случайная позиция на экране (с отступами от краев)
    const maxX = window.innerWidth - 100;
    const maxY = window.innerHeight - 100;
    const randomX = Math.floor(Math.random() * maxX) + 20;
    const randomY = Math.floor(Math.random() * maxY) + 20;

    goldenCatElement.style.left = `${randomX}px`;
    goldenCatElement.style.top = `${randomY}px`;
    
    goldenCatElement.classList.remove('hidden');

    // Кошка исчезнет через 6 секунд, если не кликнуть
    goldenCatTimeout = setTimeout(() => {
        hideGoldenCat();
    }, 6000);
}

function hideGoldenCat() {
    goldenCatActive = false;
    goldenCatElement.classList.add('hidden');
    if (goldenCatTimeout) clearTimeout(goldenCatTimeout);
    
    // Запускаем таймер до следующего появления (от 30 до 90 секунд)
    scheduleNextGoldenCat();
}

function scheduleNextGoldenCat() {
    // Случайное время от 30000 мс (30 сек) до 90000 мс (90 сек)
    const nextTime = Math.floor(Math.random() * (90000 - 30000 + 1)) + 30000;
    
    if (goldenCatInterval) clearInterval(goldenCatInterval);
    
    goldenCatInterval = setTimeout(() => {
        spawnGoldenCat();
    }, nextTime);
}

// Обработчик клика по золотой кошке
if (goldenCatElement) {
    goldenCatElement.addEventListener('click', () => {
        if (!goldenCatActive) return;

        // 1. Скрываем кошку
        hideGoldenCat();

        // 2. Даем бонус: x7 к доходу на 15 секунд
        activateBonus(7, 15000);

        // 3. Эффект золотых конфетти сверху и звук
        fireGoldenConfetti();
        playSound(goldenCatAudio);
        
        // Можно показать всплывающий текст "БОНУС!"
        showFloatingText("x7 БОНУС!", event.clientX, event.clientY);
    });
}

// Функция активации бонуса
function activateBonus(multiplier, duration) {
    clickMultiplier = multiplier;
    mpsMultiplier = multiplier;
    
    bonusStartTime = Date.now();
    bonusDuration = duration;
    
    updateDisplay(); // Обновить цифры, чтобы показать рост

    // Показываем виджет таймера
    showBonusWidget();
    
    // Запускаем интервал обновления прогресса виджета
    if (bonusUpdateInterval) clearInterval(bonusUpdateInterval);
    bonusUpdateInterval = setInterval(updateBonusWidget, 100);

    // Таймер окончания бонуса
    if (bonusTimeout) clearTimeout(bonusTimeout);
    bonusTimeout = setTimeout(() => {
        clickMultiplier = 1;
        mpsMultiplier = 1;
        updateDisplay();
        hideBonusWidget();
        console.log("Бонус закончился");
    }, duration);
}

// Функция показа виджета бонуса
function showBonusWidget() {
    if (!bonusTimerWidget) return;
    
    // Позиционируем виджет по центру сверху со смещением 30px вправо
    const centerX = (window.innerWidth / 2) - 40 + 128; // 40 = половина ширины виджета (80px/2)
    bonusTimerWidget.style.left = `${centerX}px`;
    bonusTimerWidget.style.top = `${50}px`;
    bonusTimerWidget.style.bottom = 'auto';
    bonusTimerWidget.style.right = 'auto';
    
    bonusTimerWidget.classList.add('active');
}

// Функция скрытия виджета бонуса
function hideBonusWidget() {
    if (!bonusTimerWidget) return;
    
    bonusTimerWidget.classList.remove('active');
    
    if (bonusUpdateInterval) {
        clearInterval(bonusUpdateInterval);
        bonusUpdateInterval = null;
    }
}

// Функция обновления прогресса виджета
function updateBonusWidget() {
    if (!bonusProgressCircle) return;
    
    const elapsed = Date.now() - bonusStartTime;
    const remaining = Math.max(0, bonusDuration - elapsed);
    const progressPercent = remaining / bonusDuration;
    
    // stroke-dashoffset: 0 = полный круг, 226 = пустой круг
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progressPercent);
    bonusProgressCircle.style.strokeDashoffset = offset;
}

// Вспомогательная функция для всплывающего текста (опционально)
function showFloatingText(text, x, y) {
    const el = document.createElement('div');
    el.textContent = text;
    el.style.position = 'fixed';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.color = '#ffd700';
    el.style.fontWeight = 'bold';
    el.style.fontSize = '24px';
    el.style.pointerEvents = 'none';
    el.style.zIndex = '10000';
    el.style.transition = 'all 1s ease';
    document.body.appendChild(el);

    // Анимация вверх и исчезновение
    requestAnimationFrame(() => {
        el.style.transform = 'translateY(-50px)';
        el.style.opacity = '0';
    });

    setTimeout(() => {
        document.body.removeChild(el);
    }, 1000);
}

// --- СИСТЕМА СОХРАНЕНИЙ ---

const SAVE_KEY = 'catClickerSave_v1'; 

function saveGame() {
    const gameState = {
        money: money,
        mpc: mpc,
        mpcCost: mpcCost,
        mpcCount: mpcCount,
        mps: mps,
        mpsCost: mpsCost,
        mpsCount: mpsCount,
        upgrade1Count: upgrade1Count,
        upgrade1Cost: upgrade1Cost,
        upgrade2Count: upgrade2Count,
        upgrade2Cost: upgrade2Cost,
        upgrade3Count: upgrade3Count,
        upgrade3Cost: upgrade3Cost,
        clickBonus: clickBonus,
        clickBonusCost: clickBonusCost,
        clickBonusCount: clickBonusCount,
        mpsBonusPercent: mpsBonusPercent,
        mpsBonusCost: mpsBonusCost,
        mpsBonusCount: mpsBonusCount,
        fishPerLevelBonus: fishPerLevelBonus,
        fishPerLevelCost: fishPerLevelCost,
        fishPerLevelCount: fishPerLevelCount,
        xpBonusPercent: xpBonusPercent,
        xpBonusCost: xpBonusCost,
        xpBonusCount: xpBonusCount,
        critChanceBonus: critChanceBonus,
        critChanceCost: critChanceCost,
        critChanceCount: critChanceCount,
        placeholderUpgradeCost: placeholderUpgradeCost,
        placeholderUpgradeCount: placeholderUpgradeCount,
        souls: souls,
        level: level,    
        xp: xp,       
        xpToNextLevel: xpToNextLevel, 
        fish: fish,             
        lastSaveTime: Date.now()
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
}

function loadGame() {
    const savedData = localStorage.getItem(SAVE_KEY);
    if (!savedData) return;

    try {
        const data = JSON.parse(savedData);
        
        if (data.money !== undefined) money = data.money;
        if (data.mpc !== undefined) mpc = data.mpc;
        if (data.mpcCost !== undefined) mpcCost = data.mpcCost;
        if (data.mpcCount !== undefined) mpcCount = data.mpcCount;
        if (data.mps !== undefined) mps = data.mps;
        if (data.mpsCost !== undefined) mpsCost = data.mpsCost;
        if (data.mpsCount !== undefined) mpsCount = data.mpsCount;
        if (data.upgrade1Count !== undefined) upgrade1Count = data.upgrade1Count;
        if (data.upgrade1Cost !== undefined) upgrade1Cost = data.upgrade1Cost;
        if (data.upgrade2Count !== undefined) upgrade2Count = data.upgrade2Count;
        if (data.upgrade2Cost !== undefined) upgrade2Cost = data.upgrade2Cost;
        if (data.upgrade3Count !== undefined) upgrade3Count = data.upgrade3Count;
        if (data.upgrade3Cost !== undefined) upgrade3Cost = data.upgrade3Cost;
        if (data.clickBonus !== undefined) clickBonus = data.clickBonus;
        if (data.clickBonusCost !== undefined) clickBonusCost = data.clickBonusCost;
        if (data.clickBonusCount !== undefined) clickBonusCount = data.clickBonusCount;
        if (data.mpsBonusPercent !== undefined) mpsBonusPercent = data.mpsBonusPercent;
        if (data.mpsBonusCost !== undefined) mpsBonusCost = data.mpsBonusCost;
        if (data.mpsBonusCount !== undefined) mpsBonusCount = data.mpsBonusCount;
        if (data.fishPerLevelBonus !== undefined) fishPerLevelBonus = data.fishPerLevelBonus;
        if (data.fishPerLevelCost !== undefined) fishPerLevelCost = data.fishPerLevelCost;
        if (data.fishPerLevelCount !== undefined) fishPerLevelCount = data.fishPerLevelCount;
        if (data.xpBonusPercent !== undefined) xpBonusPercent = data.xpBonusPercent;
        if (data.xpBonusCost !== undefined) xpBonusCost = data.xpBonusCost;
        if (data.xpBonusCount !== undefined) xpBonusCount = data.xpBonusCount;
        if (data.critChanceBonus !== undefined) critChanceBonus = data.critChanceBonus;
        if (data.critChanceCost !== undefined) critChanceCost = data.critChanceCost;
        if (data.critChanceCount !== undefined) critChanceCount = data.critChanceCount;
        if (data.placeholderUpgradeCost !== undefined) placeholderUpgradeCost = data.placeholderUpgradeCost;
        if (data.placeholderUpgradeCount !== undefined) placeholderUpgradeCount = data.placeholderUpgradeCount;
        if (data.souls !== undefined) souls = data.souls;
        if (data.souls !== undefined) souls = data.souls;
        if (data.level !== undefined) level = data.level;     
        if (data.xp !== undefined) xp = data.xp;                  
        if (data.xpToNextLevel !== undefined) xpToNextLevel = data.xpToNextLevel; 
        if (data.fish !== undefined) fish = data.fish;      

        // Запуск интервала если был пассивный доход
        if (mps > 0 && !mpsInterval) {
             mpsInterval = setInterval(function() {
                const actualMPS = mps * getPrestigeMultiplier() * mpsMultiplier;
                money += actualMPS;
                updateDisplay();
                saveGame(); 
            }, 1000);
        }
        
        updateDisplay();
    } catch (e) {
        console.error('Ошибка загрузки сохранения:', e);
    }
}

// --- МОДАЛЬНЫЕ ОКНА ---

// 1. Окно СБРОСА (Reset)
const resetModal = document.getElementById('resetModal');
const confirmYesBtn = document.getElementById('confirmYesBtn');
const confirmNoBtn = document.getElementById('confirmNoBtn');
let resetCallback = null;

function showResetModal(callback) {
    if (!resetModal) return;
    resetCallback = callback;
    resetModal.classList.add('active');
    resetModal.classList.remove('hidden');
}

function hideResetModal() {
    if (!resetModal) return;
    resetModal.classList.remove('active');
    setTimeout(() => {
        resetModal.classList.add('hidden');
    }, 300);
    resetCallback = null;
}

if (confirmYesBtn) {
    confirmYesBtn.addEventListener('click', () => {
        if (resetCallback) resetCallback();
        hideResetModal();
    });
}

if (confirmNoBtn) {
    confirmNoBtn.addEventListener('click', () => {
        hideResetModal();
    });
}

if (resetModal) {
    resetModal.addEventListener('click', (e) => {
        if (e.target === resetModal) hideResetModal();
    });
}

// 2. Окно ПРЕСТИЖА (Prestige)
const prestigeModal = document.getElementById('prestigeModal');
const prestigeYesBtn = document.getElementById('prestigeYesBtn');
const prestigeNoBtn = document.getElementById('prestigeNoBtn');

function showPrestigeModal() {
    if (!prestigeModal) return;
    
    // Обновляем текст бонусов перед показом
    const currentBonusEl = document.getElementById("currentBonusDisplay");
    const newBonusEl = document.getElementById("newBonusDisplay");
    const thresholdEl = document.getElementById("prestigeThresholdDisplay");
    
    if (currentBonusEl && newBonusEl) {
        const currentPercent = Math.round(souls * SOUL_BONUS_PERCENT * 100);
        const newPercent = Math.round((souls + 1) * SOUL_BONUS_PERCENT * 100);
        currentBonusEl.textContent = `+${currentPercent}%`;
        newBonusEl.textContent = `+${newPercent}%`;
    }

    // Показываем текущий порог престижа
    if (thresholdEl) {
        const currentThreshold = getPrestigeThreshold();
        thresholdEl.textContent = formatNumber(currentThreshold);
    }

    prestigeModal.classList.add('active');
    prestigeModal.classList.remove('hidden');
}

function hidePrestigeModal() {
    if (!prestigeModal) return;
    prestigeModal.classList.remove('active');
    setTimeout(() => {
        prestigeModal.classList.add('hidden');
    }, 300);
}

if (prestigeYesBtn) {
    prestigeYesBtn.addEventListener('click', () => {
        doPrestige(); 
        hidePrestigeModal();
    });
}

if (prestigeNoBtn) {
    prestigeNoBtn.addEventListener('click', () => {
        hidePrestigeModal();
    });
}

if (prestigeModal) {
    prestigeModal.addEventListener('click', (e) => {
        if (e.target === prestigeModal) hidePrestigeModal();
    });
}

// --- ДЕЙСТВИЯ ---

function resetGameProgress() {
    localStorage.removeItem(SAVE_KEY);
    location.reload();
}

function doPrestige() {
    souls += 1;

    // Сброс прогресса
    money = 0;
    mpc = 1;
    mpcCost = 10;
    mpcCount = 0;
    mps = 0;
    mpsCount = 0;
    mpsCost = 50;
    upgrade1Count = 0;
    upgrade1Cost = 200;
    upgrade2Count = 0;
    upgrade2Cost = 1000;
    upgrade3Count = 0;
    upgrade3Cost = 5000;
    level = 1;
    xp = 0;
    xpToNextLevel = 100;

    if (mpsInterval) {
        clearInterval(mpsInterval);
        mpsInterval = null;
    }

    saveGame();
    updateDisplay();
    
    // Цветные конфетти сверху при перерождении
    fireRainbowConfetti();
    
    // alert("Перерождение завершено! Ты получила 1 Кошачью душу.");
}

// Привязка кнопки сброса в интерфейсе
const resetButton = document.getElementById('resetGameBtn');
if (resetButton) {
    resetButton.addEventListener('click', () => {
        showResetModal(resetGameProgress);
    });
}

// Запуск цикла золотой кошки
scheduleNextGoldenCat();
// Инициализация
loadGame();
updateDisplay();

// Запуск цикла золотой кошки
scheduleNextGoldenCat();
// Инициализация
loadGame();
updateDisplay();

// Запуск цикла золотой кошки
scheduleNextGoldenCat();
// Инициализация
loadGame();
updateDisplay();

// --- МОБИЛЬНАЯ НАВИГАЦИЯ ---
(function initMobileNav() {
  if (window.innerWidth > 768) return;
  
  const navButtons = document.querySelectorAll('.nav-btn');
  const leftPanel = document.querySelector('.left-panel');
  const centerPanel = document.querySelector('.center-panel');
  const rightPanel = document.querySelector('.right-panel');
  
  if (!navButtons.length) return;
  
  // Панели в порядке: Магазин (left), Игра (center), Улучшения (right)
  const panels = [leftPanel, centerPanel, rightPanel];
  
  // Функция переключения панелей
  function switchPanel(panelIndex) {
    // Убираем активный класс со всех кнопок и панелей
    navButtons.forEach(btn => btn.classList.remove('active'));
    panels.forEach(panel => {
      if (panel) panel.classList.remove('active');
    });
    
    // Добавляем активный класс нужной кнопке
    if (navButtons[panelIndex]) {
      navButtons[panelIndex].classList.add('active');
    }
    
    // Показываем нужную панель
    const panelToShow = panels[panelIndex];
    if (panelToShow) {
      panelToShow.classList.add('active');
      
      // Скроллим вверх при переключении
      setTimeout(() => {
        panelToShow.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
    }
  }
  
  // Обработчики кликов
  navButtons.forEach((btn, index) => {
    btn.addEventListener('click', () => {
      switchPanel(index);
    });
  });
  
  // Инициализация - показываем центральную панель (Игра)
  setTimeout(() => {
    switchPanel(1);
  }, 100);
})();