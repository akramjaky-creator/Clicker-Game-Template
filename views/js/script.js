/**
 * **************************************************************************
 * Author: Awiones
 * Project: Clicker Game Template
 * Description: JavaScript code for clicker game with leaderboard, upgrades and sound effects
 * Watermark: This code is a proprietary creation by Awiones.
 * Give me credit by not remove this.
 * **************************************************************************
 */

// Game state variables
let clickCount = 0;
let clickPower = 1;
let userLocation = null;
let autoClickerCount = 0;
let autoClickerInterval = null;
let achievements = [];

// DOM elements
const clickButton = document.getElementById('clickButton');
const clickEffect = document.getElementById('clickEffect');
const clickAnimation = document.getElementById('clickAnimation');
const leaderboardList = document.getElementById('leaderboardList');
const playerClickCountElem = document.getElementById('playerClickCount');
const clickPowerElem = document.getElementById('clickPower');
const clickSound = document.getElementById('clickSound');
const upgradeSound = document.getElementById('upgradeSound');
const achievementSound = document.getElementById('achievementSound');
const achievementPopup = document.getElementById('achievementPopup');
const achievementText = document.getElementById('achievementText');
const clickPowerUpgrade = document.getElementById('clickPowerUpgrade');
const autoClickerUpgrade = document.getElementById('autoClickerUpgrade');
const dogeEyes = document.querySelectorAll('.doge-eye');
const dogeContainer = document.querySelector('.doge-container');
const clickRipple = document.querySelector('.click-ripple');
const clickParticles = document.querySelector('.click-particles');
const clickGlow = document.querySelector('.click-glow');
const clickShadow = document.querySelector('.click-shadow');
const multiplyUpgrade = document.getElementById('multiplyUpgrade');
const criticalUpgrade = document.getElementById('criticalUpgrade');

// Game settings
const CLICK_LIMIT = 10; // Maximum allowed clicks in the interval
const BAN_TIME = 60000; // 1 minute ban time
const CLICK_INTERVAL = 1000; // Time interval for click limit check in milliseconds

// Upgrade settings
const UPGRADES = {
    clickPower: {
        basePrice: 50,
        priceMultiplier: 1.5,
        level: 1,
        maxLevel: 100
    },
    autoClicker: {
        basePrice: 100,
        priceMultiplier: 1.8,
        level: 0,
        maxLevel: 50
    },
    multiplier: {
        basePrice: 500,
        priceMultiplier: 2,
        level: 0,
        maxLevel: 10
    },
    critical: {
        basePrice: 1000,
        priceMultiplier: 2.5,
        level: 0,
        maxLevel: 5
    }
};

let clickTimestamps = [];
let banned = false;

// Achievement definitions
const ACHIEVEMENT_LIST = [
    { id: 'first_click', name: 'First Click!', description: 'Make your first click', threshold: 1 },
    { id: 'click_10', name: 'Getting Started', description: 'Reach 10 clicks', threshold: 10 },
    { id: 'click_100', name: 'Click Master', description: 'Reach 100 clicks', threshold: 100 },
    { id: 'click_1000', name: 'Click Addict', description: 'Reach 1,000 clicks', threshold: 1000 },
    { id: 'first_upgrade', name: 'Upgrader', description: 'Purchase your first upgrade', isSpecial: true },
    { id: 'auto_clicker', name: 'Automation Begins', description: 'Purchase an auto clicker', isSpecial: true }
];

// Function to calculate upgrade cost
function calculateUpgradeCost(type) {
    const upgrade = UPGRADES[type];
    return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, upgrade.level));
}

// Function to update all upgrade costs and levels
function updateUpgradeDisplays() {
    document.getElementById('clickPowerLevel').textContent = UPGRADES.clickPower.level;
    document.getElementById('clickPowerCost').textContent = `${calculateUpgradeCost('clickPower')} clicks`;
    
    document.getElementById('autoClickerLevel').textContent = UPGRADES.autoClicker.level;
    document.getElementById('autoClickerCost').textContent = `${calculateUpgradeCost('autoClicker')} clicks`;
    
    document.getElementById('multiplierLevel').textContent = UPGRADES.multiplier.level;
    document.getElementById('multiplierCost').textContent = `${calculateUpgradeCost('multiplier')} clicks`;
    
    document.getElementById('criticalLevel').textContent = UPGRADES.critical.level;
    document.getElementById('criticalCost').textContent = `${calculateUpgradeCost('critical')} clicks`;
}

// Function to show the click effect and play sound
function showClickEffect(e) {
    // Calculate click value with multiplier and critical
    let clickValue = clickPower;
    if (UPGRADES.multiplier.level > 0) {
        clickValue *= (1 + UPGRADES.multiplier.level);
    }
    
    // Check for critical hit
    if (UPGRADES.critical.level > 0) {
        const criticalChance = 0.1 * UPGRADES.critical.level; // 10% per level
        if (Math.random() < criticalChance) {
            clickValue *= 3;
            showCriticalEffect();
        }
    }
    
    // Update click count
    clickCount += clickValue;
    
    // Update UI
    playerClickCountElem.textContent = clickCount;
    
    // Save click count in cookie
    saveClickCount();

    // Update leaderboard with user location
    updateLeaderboard(userLocation);

    // Check for achievements
    checkAchievements();

    // Update upgrade buttons
    updateUpgradeButtons();

    const rect = clickButton.getBoundingClientRect();
    const x = e.clientX - rect.left - window.pageXOffset;
    const y = e.clientY - rect.top - window.pageYOffset;
    
    // Create ripple effect
    createRippleEffect(x, y);
    
    // Animate the doge
    animateDoge();
    
    // Glow effect
    animateGlow();

    // Play the click sound
    if (clickSound) {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => {
            console.error("Failed to play the sound:", error);
        });
    }
}

// Function to show critical hit effect
function showCriticalEffect() {
    const criticalText = document.createElement('div');
    criticalText.className = 'critical-hit';
    criticalText.textContent = 'CRITICAL!';
    clickEffect.appendChild(criticalText);
    
    setTimeout(() => criticalText.remove(), 1000);
}

// Function to create ripple effect
function createRippleEffect(x, y) {
    // Remove any existing ripples
    while (clickRipple.firstChild) {
        clickRipple.removeChild(clickRipple.firstChild);
    }
    
    // Create new ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    clickRipple.appendChild(ripple);
    
    // Remove ripple after animation completes
    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

// Function to animate the doge
function animateDoge() {
    // Add bounce animation
    dogeContainer.classList.add('bounce');
    
    // Remove class after animation completes
    setTimeout(() => {
        dogeContainer.classList.remove('bounce');
    }, 300);
    
    // Add shadow animation
    clickShadow.classList.add('shadow-animate');
    
    // Remove class after animation completes
    setTimeout(() => {
        clickShadow.classList.remove('shadow-animate');
    }, 300);
}

// Function to animate the glow
function animateGlow() {
    clickGlow.classList.add('glow-animate');
    
    // Remove class after animation completes
    setTimeout(() => {
        clickGlow.classList.remove('glow-animate');
    }, 700);
}

// Function to track mouse movement for eye animation
function trackMouse(e) {
    const dogeRect = dogeContainer.getBoundingClientRect();
    const dogeCenterX = dogeRect.left + dogeRect.width / 2;
    const dogeCenterY = dogeRect.top + dogeRect.height / 2;
    
    // Calculate angle between mouse and doge center
    const angle = Math.atan2(e.clientY - dogeCenterY, e.clientX - dogeCenterX);
    
    // Maximum eye movement in pixels
    const maxEyeMove = 3;
    
    // Calculate eye position
    const eyeX = Math.cos(angle) * maxEyeMove;
    const eyeY = Math.sin(angle) * maxEyeMove;
    
    // Apply to both eyes
    dogeEyes.forEach(eye => {
        eye.style.transform = `translate(${eyeX}px, ${eyeY}px)`;
    });
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to save the game state in cookies
function saveClickCount() {
    setCookie('clickCount', clickCount, 30);  // Save for 30 days
    setCookie('clickPower', clickPower, 30);
    setCookie('autoClickerCount', autoClickerCount, 30);
    
    // Save achievements
    setCookie('achievements', JSON.stringify(achievements), 30);
    
    // Save upgrades
    setCookie('upgrades', JSON.stringify(UPGRADES), 30);
}

// Function to load the game state from cookies
function loadClickCount() {
    const savedCount = getCookie('clickCount');
    const savedPower = getCookie('clickPower');
    const savedAutoClickers = getCookie('autoClickerCount');
    const savedAchievements = getCookie('achievements');
    const savedUpgrades = getCookie('upgrades');
    
    if (savedCount) {
        clickCount = parseInt(savedCount);
        playerClickCountElem.textContent = clickCount;
    }
    
    if (savedPower) {
        clickPower = parseInt(savedPower);
        clickPowerElem.textContent = clickPower;
    }
    
    if (savedAutoClickers) {
        autoClickerCount = parseInt(savedAutoClickers);
        setupAutoClickers();
    }
    
    if (savedAchievements) {
        try {
            achievements = JSON.parse(savedAchievements);
        } catch (e) {
            achievements = [];
        }
    }
    
    if (savedUpgrades) {
        try {
            const parsed = JSON.parse(savedUpgrades);
            UPGRADES.clickPower.level = parsed.clickPower.level;
            UPGRADES.autoClicker.level = parsed.autoClicker.level;
            UPGRADES.multiplier.level = parsed.multiplier.level;
            UPGRADES.critical.level = parsed.critical.level;
            updateUpgradeDisplays();
        } catch (e) {
            console.error('Failed to load upgrades:', e);
        }
    }
    
    // Update UI elements
    updateUpgradeButtons();
    
    // Ensure the leaderboard reflects the saved count
    updateLeaderboard(userLocation);
}

// Function to update the leaderboard
function updateLeaderboard(location) {
    if (!location || clickCount === undefined) return; // Prevent updates if location or clickCount is invalid

    // Check if the location already exists
    const existingEntry = leaderboardList.querySelector(`[data-location="${location}"]`);

    if (existingEntry) {
        // Update existing entry
        const clickCountElem = existingEntry.querySelector('.click-count');
        clickCountElem.textContent = `${clickCount} clicks`;

        // Add squeeze animation
        clickCountElem.classList.remove('squeezed');
        void clickCountElem.offsetWidth; // Trigger reflow to restart animation
        clickCountElem.classList.add('squeezed');
    } else {
        // Create a new list item
        const listItem = document.createElement('li');
        listItem.classList.add('swipe-up');
        listItem.innerHTML = `
            <span class="country-name">${getFlagEmoji(location)} ${location}</span>
            <span class="click-count squeezed">${clickCount} clicks</span>
        `;
        listItem.dataset.location = location;

        // Add new entry to the list
        leaderboardList.prepend(listItem); // Add new items to the top
        setTimeout(() => {
            listItem.classList.add('show');
        }, 10); // Small delay to trigger the animation
    }
}

// Function to get flag emoji based on country
function getFlagEmoji(country) {
    const countryCodes = {
        'United States': '🇺🇸',
        'Canada': '🇨🇦',
        'United Kingdom': '🇬🇧',
        'Germany': '🇩🇪',
        'France': '🇫🇷',
        'Japan': '🇯🇵',
        'Australia': '🇦🇺',
        'India': '🇮🇳',
        'Brazil': '🇧🇷',
        'China': '🇨🇳',
        // Add more countries as needed
    };
    return countryCodes[country] || '🌍'; // Default flag if country not found
}

// Function to fetch user's location
function fetchUserLocation() {
    fetch('https://ipapi.co/json/')
        .then(response => response.json())
        .then(data => {
            userLocation = data.country_name || 'Unknown';
            updateLeaderboard(userLocation);
        })
        .catch(() => {
            userLocation = 'Unknown';
            updateLeaderboard(userLocation);
        });
}

// Function to check for achievements
function checkAchievements() {
    ACHIEVEMENT_LIST.forEach(achievement => {
        // Skip if already achieved or is a special achievement
        if (achievements.includes(achievement.id) || achievement.isSpecial) return;
        
        // Check if threshold is met
        if (clickCount >= achievement.threshold) {
            unlockAchievement(achievement);
        }
    });
}

// Function to unlock an achievement
function unlockAchievement(achievement) {
    // Add to achieved list
    achievements.push(achievement.id);
    
    // Save to cookies
    saveClickCount();
    
    // Show achievement popup
    showAchievementPopup(achievement.name);
    
    // Play achievement sound
    if (achievementSound) {
        achievementSound.currentTime = 0;
        achievementSound.play().catch(error => {
            console.error("Failed to play achievement sound:", error);
        });
    }
}

// Function to show achievement popup
function showAchievementPopup(achievementName) {
    achievementText.textContent = `Achievement Unlocked: ${achievementName}`;
    achievementPopup.classList.add('show');
    
    setTimeout(() => {
        achievementPopup.classList.remove('show');
    }, 3000);
}

// Function to update upgrade buttons
function updateUpgradeButtons() {
    // Update click power upgrade button
    if (clickCount >= calculateUpgradeCost('clickPower')) {
        clickPowerUpgrade.classList.remove('disabled');
    } else {
        clickPowerUpgrade.classList.add('disabled');
    }
    
    // Update auto clicker upgrade button
    if (clickCount >= calculateUpgradeCost('autoClicker')) {
        autoClickerUpgrade.classList.remove('disabled');
    } else {
        autoClickerUpgrade.classList.add('disabled');
    }
    
    // Update multiplier upgrade button
    if (clickCount >= calculateUpgradeCost('multiplier')) {
        multiplyUpgrade.classList.remove('disabled');
    } else {
        multiplyUpgrade.classList.add('disabled');
    }
    
    // Update critical upgrade button
    if (clickCount >= calculateUpgradeCost('critical')) {
        criticalUpgrade.classList.remove('disabled');
    } else {
        criticalUpgrade.classList.add('disabled');
    }
}

// Function to purchase click power upgrade
function purchaseClickPowerUpgrade() {
    const cost = calculateUpgradeCost('clickPower');
    if (clickCount >= cost && UPGRADES.clickPower.level < UPGRADES.clickPower.maxLevel) {
        // Add squeeze animation
        clickPowerUpgrade.classList.add('squeezed');
        
        // Remove animation class after it completes
        setTimeout(() => {
            clickPowerUpgrade.classList.remove('squeezed');
        }, 300);

        // Deduct cost
        clickCount -= cost;
        
        // Increase level and power
        UPGRADES.clickPower.level++;
        clickPower += 1;
        
        // Update displays
        updateUpgradeDisplays();
        
        // Play upgrade sound
        if (upgradeSound) {
            upgradeSound.currentTime = 0;
            upgradeSound.play().catch(error => {
                console.error("Failed to play upgrade sound:", error);
            });
        }
        
        // Save game state
        saveClickCount();
        
        // Update leaderboard
        updateLeaderboard(userLocation);
        
        // Update upgrade buttons
        updateUpgradeButtons();
        
        // Check for first upgrade achievement
        if (!achievements.includes('first_upgrade')) {
            unlockAchievement(ACHIEVEMENT_LIST.find(a => a.id === 'first_upgrade'));
        }
    }
}

// Function to purchase auto clicker upgrade
function purchaseAutoClickerUpgrade() {
    const cost = calculateUpgradeCost('autoClicker');
    if (clickCount >= cost && UPGRADES.autoClicker.level < UPGRADES.autoClicker.maxLevel) {
        // Add squeeze animation
        autoClickerUpgrade.classList.add('squeezed');
        
        // Remove animation class after it completes
        setTimeout(() => {
            autoClickerUpgrade.classList.remove('squeezed');
        }, 300);

        // Deduct cost
        clickCount -= cost;
        
        // Increase auto clicker count
        UPGRADES.autoClicker.level++;
        autoClickerCount += 1;
        
        // Update displays
        updateUpgradeDisplays();
        
        // Setup auto clicker
        setupAutoClickers();
        
        // Play upgrade sound
        if (upgradeSound) {
            upgradeSound.currentTime = 0;
            upgradeSound.play().catch(error => {
                console.error("Failed to play upgrade sound:", error);
            });
        }
        
        // Save game state
        saveClickCount();
        
        // Update leaderboard
        updateLeaderboard(userLocation);
        
        // Update upgrade buttons
        updateUpgradeButtons();
        
        // Check for auto clicker achievement
        if (!achievements.includes('auto_clicker')) {
            unlockAchievement(ACHIEVEMENT_LIST.find(a => a.id === 'auto_clicker'));
        }
    }
}

// Function to purchase multiplier upgrade
function purchaseMultiplierUpgrade() {
    const cost = calculateUpgradeCost('multiplier');
    if (clickCount >= cost && UPGRADES.multiplier.level < UPGRADES.multiplier.maxLevel) {
        clickCount -= cost;
        UPGRADES.multiplier.level++;
        updateUpgradeDisplays();
        playUpgradeEffect(multiplyUpgrade);
        saveClickCount();
        updateLeaderboard(userLocation);
        updateUpgradeButtons();
    }
}

// Function to purchase critical upgrade
function purchaseCriticalUpgrade() {
    const cost = calculateUpgradeCost('critical');
    if (clickCount >= cost && UPGRADES.critical.level < UPGRADES.critical.maxLevel) {
        clickCount -= cost;
        UPGRADES.critical.level++;
        updateUpgradeDisplays();
        playUpgradeEffect(criticalUpgrade);
        saveClickCount();
        updateLeaderboard(userLocation);
        updateUpgradeButtons();
    }
}

// Function to setup auto clickers
function setupAutoClickers() {
    // Clear existing interval
    if (autoClickerInterval) {
        clearInterval(autoClickerInterval);
    }
    
    // Setup new interval if we have auto clickers
    if (autoClickerCount > 0) {
        autoClickerInterval = setInterval(() => {
            // Add clicks based on auto clicker count
            clickCount += autoClickerCount;
            
            // Update UI
            playerClickCountElem.textContent = clickCount;
            
            // Save game state
            saveClickCount();
            
            // Update leaderboard
            updateLeaderboard(userLocation);
            
            // Check for achievements
            checkAchievements();
            
            // Update upgrade buttons
            updateUpgradeButtons();
            
            // Show auto-click visual feedback
            const randomX = Math.random() * clickButton.offsetWidth;
            const randomY = Math.random() * clickButton.offsetHeight;
            
            // Create a subtle visual effect for auto clicks
            createAutoClickEffect(randomX, randomY);
        }, 1000);
    }
}

// Function to create auto-click visual effect
function createAutoClickEffect(x, y) {
    // Create a subtle ripple for auto clicks
    const autoRipple = document.createElement('span');
    autoRipple.className = 'auto-ripple';
    autoRipple.style.left = `${x}px`;
    autoRipple.style.top = `${y}px`;
    clickRipple.appendChild(autoRipple);
    
    // Remove after animation completes
    setTimeout(() => {
        autoRipple.remove();
    }, 800);
    
    // Animate the doge slightly
    dogeContainer.classList.add('auto-bounce');
    
    // Remove class after animation completes
    setTimeout(() => {
        dogeContainer.classList.remove('auto-bounce');
    }, 200);
}

// Function to share game progress
function shareGame() {
    const shareText = `I've made ${clickCount} clicks in Doge Clicker! Can you beat my score?`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Doge Clicker',
            text: shareText,
            url: window.location.href
        })
        .catch(error => console.error('Error sharing:', error));
    } else {
        // Fallback for browsers that don't support Web Share API
        prompt('Copy this link to share:', `${shareText} ${window.location.href}`);
    }
}

// Function to manually save game
function saveGame() {
    saveClickCount();
    
    // Show a temporary save confirmation
    const saveConfirm = document.createElement('div');
    saveConfirm.textContent = 'Game saved!';
    saveConfirm.style.position = 'fixed';
    saveConfirm.style.bottom = '80px';
    saveConfirm.style.left = '50%';
    saveConfirm.style.transform = 'translateX(-50%)';
    saveConfirm.style.backgroundColor = 'var(--success-color)';
    saveConfirm.style.color = 'white';
    saveConfirm.style.padding = '10px 20px';
    saveConfirm.style.borderRadius = 'var(--border-radius)';
    saveConfirm.style.zIndex = '1000';
    
    document.body.appendChild(saveConfirm);
    
    setTimeout(() => {
        document.body.removeChild(saveConfirm);
    }, 2000);
}

// Event Listeners
clickButton.addEventListener('click', (e) => {
    if (!banned) {
        // Anti-cheat: Check if user is clicking too fast
        const now = Date.now();
        clickTimestamps.push(now);
        
        // Remove timestamps older than the interval
        clickTimestamps = clickTimestamps.filter(timestamp => now - timestamp < CLICK_INTERVAL);
        
        // If too many clicks in the interval, ban the user temporarily
        if (clickTimestamps.length > CLICK_LIMIT) {
            banned = true;
            alert('Clicking too fast! Please wait a moment before clicking again.');
            
            setTimeout(() => {
                banned = false;
                clickTimestamps = [];
            }, BAN_TIME);
            
            return;
        }
        
        showClickEffect(e);
    }
});

// Track mouse movement for eye animation
document.addEventListener('mousemove', trackMouse);

// Upgrade button event listeners
clickPowerUpgrade.addEventListener('click', purchaseClickPowerUpgrade);
autoClickerUpgrade.addEventListener('click', purchaseAutoClickerUpgrade);
multiplyUpgrade.addEventListener('click', purchaseMultiplierUpgrade);
criticalUpgrade.addEventListener('click', purchaseCriticalUpgrade);

// Social button event listeners
document.getElementById('shareBtn').addEventListener('click', shareGame);
document.getElementById('saveBtn').addEventListener('click', saveGame);

// Load click count on page load
window.onload = () => {
    loadClickCount();
    fetchUserLocation();
    updateUpgradeButtons();
    
    // Initial animation for doge
    setTimeout(() => {
        dogeContainer.classList.add('intro-animation');
        setTimeout(() => {
            dogeContainer.classList.remove('intro-animation');
        }, 1000);
    }, 500);
};