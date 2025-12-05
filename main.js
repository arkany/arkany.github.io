console.log('main.js loaded');

let gameState = {
  currentRoom: "vestibule",
  inventory: [],
  moves: 0,
  scrollsCollected: [],
  scrollsRead: [],
  roomItems: {},
  visitedRooms: [],
  completedGame: false,
  vaultUnlocked: false,
  chestUnlocked: false,
  chestContents: ['scroll_autumn'],
  errorCounts: {},
  cluesShown: {},
  readHints: {},
  pendingEnd: false
};

let settings = {
  fastText: false,
  theme: 'green'
};

let imageViewer;
let imageViewerState = {
  images: [],
  index: 0
};
let currentModalImages = [];
const ASSET_BASE = 'public/';

function prefixAssetPath(path) {
  if (!path || typeof path !== 'string') return path;
  if (path.startsWith('http')) return path;

  // Normalize any leading slash to keep assets relative to the game folder
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  if (normalized.startsWith(ASSET_BASE)) return normalized;

  return `${ASSET_BASE}${normalized}`;
}

function blurInput() {
  const input = document.getElementById('input');
  if (input && document.activeElement === input) {
    input.blur();
  }
}

function isMobileLike() {
  if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(max-width: 768px)').matches;
}

// Input normalization helpers
function normalizeNoun(noun) {
  return (noun || '').toLowerCase().trim().replace(/\s+/g, '_');
}

function buildScrollCandidates(noun) {
  const normalized = normalizeNoun(noun);
  const tokens = normalized.split('_').filter(Boolean);
  const hasScrollWord = tokens.includes('scroll');
  const bareTokens = tokens.filter(t => t !== 'scroll');
  const bare = bareTokens.join('_');

  const variants = new Set();
  if (normalized) variants.add(normalized);
  if (bare) {
    variants.add(bare);
    variants.add(`scroll_${bare}`);
  }
  if (!hasScrollWord && normalized) {
    variants.add(`scroll_${normalized}`);
  }
  return variants;
}

function findMatchingScroll(items, noun) {
  const candidates = buildScrollCandidates(noun);
  return items.find(item => {
    if (!item.startsWith('scroll_')) return false;
    const bare = item.replace(/^scroll_/, '');
    return (
      candidates.has(item) ||
      candidates.has(bare) ||
      [...candidates].some(c => item.includes(c))
    );
  });
}

function normalizeAssetImages() {
  const normalizeImage = (img) => {
    if (!img || typeof img !== 'object') return;
    if (img.src) img.src = prefixAssetPath(img.src);
    if (img.enhancedSrc) img.enhancedSrc = prefixAssetPath(img.enhancedSrc);
  };

  if (Array.isArray(SCROLLS)) {
    SCROLLS.forEach(scroll => {
      if (Array.isArray(scroll.images)) {
        scroll.images.forEach(normalizeImage);
      }
      if (scroll.image) normalizeImage(scroll.image);
    });
  }

  if (Array.isArray(END_IMAGES)) {
    END_IMAGES.forEach(normalizeImage);
  }
}

normalizeAssetImages();

function openFirstModalImage() {
  if (currentModalImages.length) {
    openImageViewer(currentModalImages, 0);
    return true;
  }
  return false;
}

let gameStarted = false;

function ensureStateDefaults() {
  if (!gameState.roomItems) gameState.roomItems = {};
  if (!gameState.errorCounts) gameState.errorCounts = {};
  if (!gameState.cluesShown) gameState.cluesShown = {};
  if (!gameState.readHints) gameState.readHints = {};
  if (!gameState.hasOwnProperty('pendingEnd')) gameState.pendingEnd = false;
  if (!Array.isArray(gameState.scrollsCollected)) gameState.scrollsCollected = [];
  if (!Array.isArray(gameState.scrollsRead)) gameState.scrollsRead = [];
  if (!gameState.hasOwnProperty('vaultUnlocked')) gameState.vaultUnlocked = false;
  if (!gameState.hasOwnProperty('chestUnlocked')) gameState.chestUnlocked = false;
  if (!gameState.chestContents) gameState.chestContents = ['scroll_autumn'];
}

function registerError() {
  const roomId = gameState.currentRoom;
  gameState.errorCounts[roomId] = (gameState.errorCounts[roomId] || 0) + 1;

  if (
    gameState.errorCounts[roomId] >= 3 &&
    !gameState.cluesShown[roomId] &&
    MAP[roomId] &&
    MAP[roomId].clue
  ) {
    gameState.cluesShown[roomId] = true;
    renderOutput(`\nHint: ${MAP[roomId].clue}\n\n`, true);
  }
}

function renderError(text) {
  registerError();
  renderOutput(text);
}

function canSeeScrollInRoom(roomId) {
  if (roomId === 'vault') {
    return gameState.vaultUnlocked;
  }
  return true;
}

let textQueue = [];
let isTyping = false;
let typingState = {
  text: '',
  index: 0,
  currentP: null,
  output: null,
  container: null,
  timeoutId: null
};

function resetTypingState() {
  typingState.text = '';
  typingState.index = 0;
  typingState.currentP = null;
  typingState.output = null;
  typingState.container = null;
  typingState.timeoutId = null;
}

function initGame() {
  console.log('initGame called, checking if MAP exists:', typeof MAP);
  
  if (typeof MAP === 'undefined') {
    console.error('MAP is not defined! content.js may not have loaded');
    setTimeout(initGame, 100);
    return;
  }

  ensureStateDefaults();

  applyTheme(settings.theme || 'green');

  for (const roomId in MAP) {
    gameState.roomItems[roomId] = [...(MAP[roomId].items || [])];
    gameState.errorCounts[roomId] = 0;
  }

  if (!gameState.chestContents) {
    gameState.chestContents = ['scroll_autumn'];
  }

  loadSettings();
  setupEventListeners();
  renderOutput("2025 XMAS LETTER QUEST\nA Holiday Adventure\n");
  renderOutput("Type HELP for instructions, or GLOSSARY for a list of commands.\n\n");
  look();
  updateStatus();
  document.getElementById('input').focus();
}

function setupEventListeners() {
  const input = document.getElementById('input');
  input.addEventListener('keydown', handleInput);

  document.getElementById('glossary-btn').addEventListener('click', toggleGlossary);
  document.getElementById('fast-text-btn').addEventListener('click', toggleFastText);
  document.getElementById('theme-btn').addEventListener('click', cycleTheme);

  const glossaryClose = document.querySelector('#glossary-panel .close-btn');
  glossaryClose.addEventListener('click', toggleGlossary);

  const modalClose = document.querySelector('#modal .close-btn');
  modalClose.addEventListener('click', () => closeModal('close button'));

  document.getElementById('share-btn').addEventListener('click', shareGame);
  document.getElementById('restart-btn').addEventListener('click', restartGame);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'g' || e.key === 'G') {
      if (document.activeElement === document.getElementById('input')) {
        return;
      }
      if (!document.getElementById('modal').classList.contains('hidden') ||
          !document.getElementById('end-sequence').classList.contains('hidden')) {
        return;
      }
      toggleGlossary();
    }

    if (e.altKey) {
      if (e.key === '1') { e.preventDefault(); setTheme('green'); }
      if (e.key === '2') { e.preventDefault(); setTheme('amber'); }
      if (e.key === '3') { e.preventDefault(); setTheme('navy'); }
      if (e.key === '4') { e.preventDefault(); setTheme('bluegray'); }
      if (e.key === '5') { e.preventDefault(); setTheme('highcontrast'); }
    }

    // Only close the modal with Enter when focus isn't in the command input
    if (
      e.key === 'Enter' &&
      e.target !== document.getElementById('input') &&
      !document.getElementById('modal').classList.contains('hidden')
    ) {
      closeModal('enter key');
    }

    if (
      (e.key === 'x' || e.key === 'X') &&
      e.target !== document.getElementById('input') &&
      !document.getElementById('modal').classList.contains('hidden')
    ) {
      closeModal('x key');
    }

    if (e.key === 'Escape') {
      if (imageViewer && !imageViewer.classList.contains('hidden')) {
        return;
      }
      if (!document.getElementById('glossary-panel').classList.contains('hidden')) {
        toggleGlossary();
      }
      if (!document.getElementById('modal').classList.contains('hidden')) {
        closeModal('escape key');
      }
    }

    if ((e.key === 'v' || e.key === 'V') && !document.getElementById('modal').classList.contains('hidden')) {
      if (currentModalImages.length) {
        e.preventDefault();
        openFirstModalImage();
      }
    }

    if (imageViewer && !imageViewer.classList.contains('hidden')) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        stepImageViewer(1);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        stepImageViewer(-1);
      }
    }
  });

  document.getElementById('glossary-panel').addEventListener('click', (e) => {
    if (e.target.id === 'glossary-panel') {
      toggleGlossary();
    }
  });

  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
      closeModal('backdrop click');
    }
  });

  setupImageViewer();
}

function handleInput(e) {
  if (e.key === 'Enter') {
    // Prevent the global key handler from reacting to the same Enter press
    e.stopPropagation();
    const input = e.target;
    const command = input.value.trim().toLowerCase();
    input.value = '';

    if (command) {
      if (isTyping || textQueue.length) {
        flushTextQueue();
      }
      renderOutput(`\n> ${command}\n`, true);
      parseCommand(command);
      gameState.moves++;
      updateStatus();
    }
  }
}

function parseCommand(command) {
  const words = command.split(/\s+/);
  const verb = words[0];
  const noun = words.slice(1).join(' ');

  // Quick handle glossary no matter where it appears in the command
  if (words.some(w => w === 'glossary' || w === 'g')) {
    toggleGlossary();
    return;
  }

  const synonyms = {
    'l': 'look',
    'x': 'examine',
    'inspect': 'examine',
    'i': 'inventory',
    'inv': 'inventory',
    'grab': 'take',
    'pickup': 'take',
    'n': 'north',
    's': 'south',
    'e': 'east',
    'w': 'west',
    'scroll': 'read',
    'scrolls': 'read',
    'g': 'glossary',
    'h': 'help'
  };

  const normalizedVerb = synonyms[verb] || verb;

  // Allow "glossary" (or "g") as a standalone command regardless of position
  if (normalizedVerb === 'glossary') {
    toggleGlossary();
    return;
  }

  const commands = {
    'look': () => look(),
    'examine': () => examine(noun),
    'inventory': () => showInventory(),
    'take': () => take(noun),
    'drop': () => drop(noun),
    'read': () => read(noun),
    'use': () => use(noun),
    'view': () => viewImages(),
    'north': () => move('north'),
    'south': () => move('south'),
    'east': () => move('east'),
    'west': () => move('west'),
    'help': () => showHelp(),
    'glossary': () => toggleGlossary(),
    'save': () => saveState(),
    'load': () => loadState(),
    'quit': () => quit()
  };

  if (commands[normalizedVerb]) {
    commands[normalizedVerb]();
  } else {
    // Fallback: commands that mention "scroll" anywhere should map to READ for a specific scroll
    if (words.length >= 2 && words.some(w => w === 'scroll' || w === 'scrolls')) {
      const scrollWords = words.filter(w => w !== 'scroll' && w !== 'scrolls');
      const scrollNoun = scrollWords.join(' ').trim();
      if (scrollNoun) {
        read(scrollNoun);
        return;
      }
    }
    renderError("I don't understand that command. Type HELP for assistance.\n");
  }
}

function look() {
  const room = MAP[gameState.currentRoom];

  // Initialize per-room error counter when entering
  if (gameState.errorCounts[gameState.currentRoom] == null) {
    gameState.errorCounts[gameState.currentRoom] = 0;
  }

  if (!gameState.visitedRooms.includes(gameState.currentRoom)) {
    gameState.visitedRooms.push(gameState.currentRoom);
  }

  renderOutput(`${room.name}\n${'='.repeat(room.name.length)}\n`);
  const descriptionText = room.dynamicDescription ? room.dynamicDescription(gameState) : room.description;
  renderOutput(`${descriptionText}\n\n`);

  const items = gameState.roomItems[gameState.currentRoom] || [];
  if (items.length > 0) {
    const visibleItems = items.filter(item => {
      if (!item.startsWith('scroll_')) return true;
      return canSeeScrollInRoom(gameState.currentRoom);
    });

    if (visibleItems.length > 0) {
      renderOutput("You can see:\n");
      visibleItems.forEach(item => {
        const displayName = item.startsWith('scroll_')
          ? 'a ' + item.replace(/^scroll_/, 'scroll ').replace(/_/g, ' ')
          : item.replace(/_/g, ' ');
        renderOutput(`  - ${displayName}\n`);
      });
      renderOutput("\n");
    }
  }

  const carriedScrolls = gameState.inventory.filter(item => item.startsWith('scroll_')).length;
  const hasAllScrolls = carriedScrolls === 4;
  const needsReading = gameState.scrollsRead.length < 4 || !gameState.completedGame;
  if (hasAllScrolls && needsReading) {
    if (!gameState.readHints[gameState.currentRoom]) {
      gameState.readHints[gameState.currentRoom] = true;
      renderOutput("The scrolls hum together in your pack—you feel like you could read them now to finish the tale.\n\n");
    }
  }

  if (room.onEnter) {
    const message = room.onEnter(gameState);
    if (message) {
      renderOutput(`${message}\n\n`);
    }
  }
}

function examine(noun) {
  if (!noun) {
    renderError("Examine what?\n");
    return;
  }

  const room = MAP[gameState.currentRoom];
  const items = gameState.roomItems[gameState.currentRoom] || [];

  const normalized = normalizeNoun(noun);
  const scrollInRoom = findMatchingScroll(items, noun);

  const roomItemKey = items.includes(normalized)
    ? normalized
    : scrollInRoom;
  if (roomItemKey && room.examined && room.examined[roomItemKey]) {
    renderOutput(`${room.examined[roomItemKey]}\n\n`);
    return;
  }

  const scrollInInventory = findMatchingScroll(gameState.inventory, noun);
  if (gameState.inventory.includes(normalized) || scrollInInventory) {
    renderOutput(`You're carrying that. Try reading it or using it.\n\n`);
    return;
  }

  if (room.examined && room.examined[noun.replace(/\s+/g, '_')]) {
    renderOutput(`${room.examined[noun.replace(/\s+/g, '_')]}\n\n`);
    return;
  }

  renderError(`You don't see anything special about that.\n\n`);
}

function showInventory() {
  if (gameState.inventory.length === 0) {
    renderOutput("You aren't carrying anything.\n\n");
    return;
  }

  renderOutput("You are carrying:\n");
  gameState.inventory.forEach(item => {
    const displayName = item.replace(/_/g, ' ');
    renderOutput(`  - ${displayName}\n`);
  });
  renderOutput("\n");
}

function take(noun) {
  if (!noun) {
    renderError("Take what?\n");
    return;
  }

  const normalized = normalizeNoun(noun);
  const scrollNormalized = 'scroll_' + normalized;
  const items = gameState.roomItems[gameState.currentRoom] || [];

  let itemToTake = null;
  if (items.includes(normalized)) {
    itemToTake = normalized;
  }
  if (!itemToTake) {
    const scrollMatch = findMatchingScroll(items, noun);
    if (scrollMatch) {
      itemToTake = scrollMatch;
    }
  }
  if (!itemToTake && items.includes(scrollNormalized)) {
    itemToTake = scrollNormalized;
  }
  if (!itemToTake) {
    const found = items.find(item => item.includes(normalized) || item.replace(/_/g, ' ').includes(noun));
    if (found) itemToTake = found;
  }

  if (gameState.currentRoom === 'vault' && !gameState.vaultUnlocked) {
    renderError("The vault is locked. You need to find a way to open it first.\n\n");
    return;
  }

  if (itemToTake) {
    gameState.inventory.push(itemToTake);
    gameState.roomItems[gameState.currentRoom] = items.filter(i => i !== itemToTake);

    if (itemToTake.startsWith('scroll_')) {
      const scrollId = SCROLL_MAP[itemToTake];
      if (scrollId && !gameState.scrollsCollected.includes(scrollId)) {
        gameState.scrollsCollected.push(scrollId);
      }
    }

    const displayName = itemToTake.replace(/_/g, ' ');

    if (itemToTake.startsWith('scroll_')) {
      const remaining = Math.max(0, 4 - gameState.scrollsCollected.length);
      const remainingText = remaining === 0
        ? 'All scrolls collected!'
        : `${remaining} scroll${remaining === 1 ? '' : 's'} remain.`;
      renderOutput(`You take the ${displayName}. ${remainingText}\n\n`);
    } else {
      renderOutput(`You take the ${displayName}.\n\n`);
    }
    updateStatus();
  } else {
    renderError("You don't see that here.\n\n");
  }
}

function drop(noun) {
  if (!noun) {
    renderError("Drop what?\n");
    return;
  }

  const normalized = normalizeNoun(noun);
  const scrollNormalized = 'scroll_' + normalized;

  let itemToDrop = null;
  if (gameState.inventory.includes(normalized)) {
    itemToDrop = normalized;
  }
  if (!itemToDrop) {
    const scrollMatch = findMatchingScroll(gameState.inventory, noun);
    if (scrollMatch) {
      itemToDrop = scrollMatch;
    }
  }
  if (!itemToDrop && gameState.inventory.includes(scrollNormalized)) {
    itemToDrop = scrollNormalized;
  }
  if (!itemToDrop) {
    const found = gameState.inventory.find(item =>
      item.includes(normalized) || item.replace(/_/g, ' ').includes(noun)
    );
    if (found) itemToDrop = found;
  }

  if (itemToDrop) {
    gameState.inventory = gameState.inventory.filter(i => i !== itemToDrop);
    gameState.roomItems[gameState.currentRoom].push(itemToDrop);

    const displayName = itemToDrop.replace(/_/g, ' ');
    renderOutput(`You drop the ${displayName}.\n\n`);
  } else {
    renderError("You aren't carrying that.\n\n");
  }
}

function read(noun) {
  const scrollsInInventory = gameState.inventory.filter(item => item.startsWith('scroll_'));

  const formatScrollNames = () => {
    return scrollsInInventory.map(item =>
      item
        .replace(/^scroll_/, 'scroll ')
        .replace(/_/g, ' ')
    );
  };

  const promptForScrollChoice = () => {
    if (scrollsInInventory.length > 1) {
      const names = formatScrollNames();
      renderOutput(`Which scroll do you want to read? You have: ${names.join(', ')}.\n\n`);
      return true;
    }
    return false;
  };

  const lowerNoun = (noun || '').trim().toLowerCase();
  const isGenericRequest = !noun || lowerNoun === 'scroll' || lowerNoun === 'scrolls' || lowerNoun === 'a scroll' || lowerNoun === 'the scroll' || lowerNoun === 'the scrolls';

  if (!scrollsInInventory.length) {
    renderError("You don't have any scrolls to read.\n\n");
    return;
  }

  if (scrollsInInventory.length > 1 && isGenericRequest) {
    promptForScrollChoice();
    return;
  }

  const normalized = normalizeNoun(noun);

  let scrollToRead = null;

  if (isGenericRequest && scrollsInInventory.length === 1) {
    scrollToRead = scrollsInInventory[0];
  } else {
    scrollToRead = findMatchingScroll(scrollsInInventory, noun);
  }
  if (!scrollToRead) {
    const partialMatch = scrollsInInventory.find(item =>
      item.includes(normalized) || item.replace(/_/g, ' ').includes(noun)
    );
    if (partialMatch) {
      scrollToRead = partialMatch;
    }
  }

  if (!scrollToRead && scrollsInInventory.length > 1) {
    promptForScrollChoice();
    return;
  }

  if (scrollToRead) {
    const scrollId = SCROLL_MAP[scrollToRead];
    if (scrollId) {
      const scroll = SCROLLS.find(s => s.id === scrollId);
      if (scroll) {
        showModal(scroll);
        if (!gameState.scrollsRead.includes(scrollId)) {
          gameState.scrollsRead.push(scrollId);
          updateStatus();
        }

        if (gameState.scrollsRead.length === 4 && !gameState.completedGame) {
          gameState.pendingEnd = true;
        }
      }
    }
  } else {
    renderError("You don't have that scroll.\n\n");
  }
}

function viewImages() {
  const modalHidden = document.getElementById('modal').classList.contains('hidden');
  if (modalHidden) {
    renderError("You can only VIEW while reading a scroll.\n\n");
    return;
  }

  if (!openFirstModalImage()) {
    renderError("No images to view right now.\n\n");
  }
}

function use(noun) {
  if (!noun) {
    renderError("Use what?\n");
    return;
  }

  const normalized = noun.replace(/\s+/g, '_');
  const hasGoldKey = gameState.inventory.includes('gold_key');
  const isGoldKey =
    hasGoldKey &&
    (normalized === 'gold_key' || normalized === 'key' || noun.toLowerCase().includes('gold'));

  if (isGoldKey) {
    if (gameState.currentRoom === 'vestibule') {
      if (gameState.vaultUnlocked) {
        renderOutput("The oak door is already unlocked; snowflakes still cling to the key's teeth.\n\n");
      } else {
        gameState.vaultUnlocked = true;
        renderOutput("You use the golden key on the oak door. It clicks open with a satisfying sound. The vault to the EAST is now accessible.\n\n");
      }
    } else if (gameState.currentRoom === 'vault') {
      if (gameState.chestUnlocked) {
        renderOutput("The chest is already open, its ribbon draped aside.\n\n");
      } else {
        gameState.chestUnlocked = true;
        if (!Array.isArray(gameState.roomItems[gameState.currentRoom])) {
          gameState.roomItems[gameState.currentRoom] = [];
        }
        if (Array.isArray(gameState.chestContents)) {
          gameState.chestContents.forEach(item => {
            if (!gameState.roomItems[gameState.currentRoom].includes(item)) {
              gameState.roomItems[gameState.currentRoom].push(item);
            }
          });
          gameState.chestContents = [];
        }
        renderOutput("You fit the golden key into the delicate lock. The ribbon unfurls and the chest creaks open, revealing a hidden scroll.\n\n");
      }
    } else {
      renderOutput("The golden key glints hopefully, but there is nothing here that seems to match its teeth.\n\n");
    }
  } else {
    renderError("You can't use that here.\n\n");
  }
}

function move(direction) {
  const room = MAP[gameState.currentRoom];

  if (direction === 'east' && gameState.currentRoom === 'vestibule' && !gameState.vaultUnlocked) {
    renderError("The heavy oak door is locked tight. The golden key from the brogmoid in the grotto should do the trick.\n\n");
    return;
  }

  if (room.exits && room.exits[direction]) {
    gameState.currentRoom = room.exits[direction];
    gameState.errorCounts[gameState.currentRoom] = 0;
    renderOutput("\n");
    look();
  } else {
    renderError("You can't go that way.\n\n");
  }
}

function showHelp() {
  const helpText = `2025 XMAS LETTER QUEST - HELP

OBJECTIVE:
Explore the winter realm, collect four magic scrolls, and read them anywhere to reveal a special holiday message.

BASIC COMMANDS:
- LOOK (L): Examine your surroundings
- EXAMINE <object> (X): Look closely at something
- INVENTORY (I): Check what you're carrying
- TAKE <object>: Pick up an item
- READ <scroll>: Read a scroll you're carrying
- N/S/E/W: Move in cardinal directions

HELPFUL TIPS:
- Examine everything - objects may hide clues
- Some doors may be locked
- Press G or type GLOSSARY for a full command list
- SAVE your progress anytime
- Use FAST TEXT button to speed up text display

Good luck, adventurer!

`;
  renderOutput(helpText);
}

function toggleGlossary() {
  const panel = document.getElementById('glossary-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');

  if (!panel.classList.contains('hidden')) {
    const closeBtn = panel.querySelector('.close-btn');
    if (closeBtn) {
      closeBtn.focus();
    }
  } else {
    document.getElementById('input').focus();
  }
}

function toggleFastText() {
  settings.fastText = !settings.fastText;
  const btn = document.getElementById('fast-text-btn');
  btn.textContent = settings.fastText ? 'Normal Text' : 'Fast Text';
  localStorage.setItem('settings', JSON.stringify(settings));
}

const THEMES = ['green', 'amber', 'navy', 'bluegray', 'highcontrast'];

function applyTheme(theme) {
  THEMES.forEach(t => document.body.classList.remove(`theme-${t}`));
  document.body.classList.remove('high-contrast'); // legacy class cleanup
  document.body.classList.add(`theme-${theme}`);
  const btn = document.getElementById('theme-btn');
  if (btn) {
    const label = theme === 'highcontrast'
      ? 'High Contrast'
      : theme.charAt(0).toUpperCase() + theme.slice(1);
    btn.textContent = `Theme: ${label}`;
  }
}

function setTheme(theme) {
  if (!THEMES.includes(theme)) return;
  settings.theme = theme;
  applyTheme(theme);
  localStorage.setItem('settings', JSON.stringify(settings));
}

function cycleTheme() {
  const idx = THEMES.indexOf(settings.theme || 'green');
  const nextTheme = THEMES[(idx + 1) % THEMES.length];
  setTheme(nextTheme);
}

function setupImageViewer() {
  imageViewer = document.getElementById('image-viewer');
  if (!imageViewer) return;

  const closeBtn = document.getElementById('image-viewer-close');
  const viewerImg = imageViewer.querySelector('img');
  const viewerCaption = imageViewer.querySelector('.viewer-caption');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => closeImageViewer('close button'));
  }

  imageViewer.addEventListener('click', (e) => {
    if (e.target.id === 'image-viewer') {
      closeImageViewer('backdrop click');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!imageViewer || imageViewer.classList.contains('hidden')) return;
    if (e.key === 'x' || e.key === 'X' || e.key === 'Escape') {
      closeImageViewer('keyboard');
    }
  });

  // Reset viewer when images fail to load
  if (viewerImg) {
    viewerImg.addEventListener('error', () => {
      viewerCaption.textContent = 'The image flickers and fades. Try another.';
    });

    viewerImg.addEventListener('click', () => {
      if (isMobileLike()) {
        closeImageViewer('image tap');
      }
    });
  }
}

function openImageViewer(imageEntries, startIndex = 0) {
  if (!imageViewer) return;
  const viewerImg = imageViewer.querySelector('img');
  const viewerCaption = imageViewer.querySelector('.viewer-caption');

  const normalized = (Array.isArray(imageEntries) ? imageEntries : [imageEntries])
    .filter(Boolean)
    .map(entry => ({
      src: entry.src,
      alt: entry.alt || 'Enchanted illustration',
      enhancedSrc: entry.enhancedSrc || null
    }));

  if (!normalized.length) return;

  imageViewerState.images = normalized;
  imageViewerState.index = Math.max(0, Math.min(startIndex, normalized.length - 1));

  const renderImage = () => {
    const current = imageViewerState.images[imageViewerState.index];
    if (!viewerImg || !current) return;

    viewerImg.dataset.fallbackTried = 'false';
    viewerImg.onerror = () => {
      if (current.enhancedSrc && viewerImg.dataset.fallbackTried === 'false') {
        viewerImg.dataset.fallbackTried = 'true';
        viewerImg.src = current.src;
        if (viewerCaption) viewerCaption.textContent = current.alt;
      } else if (viewerCaption) {
        viewerCaption.textContent = 'The image flickers and fades. Try another.';
      }
    };

    viewerImg.src = current.enhancedSrc || current.src;
    viewerImg.alt = current.alt;
    if (viewerCaption) viewerCaption.textContent = current.alt;
  };

  imageViewer.dataset.renderFn = 'active';
  imageViewer.renderActiveImage = renderImage;
  renderImage();

  imageViewer.classList.remove('hidden');
  imageViewer.setAttribute('aria-hidden', 'false');
  try {
    imageViewer.focus({ preventScroll: true });
  } catch (e) {
    imageViewer.focus();
  }
}

function stepImageViewer(delta) {
  if (!imageViewer || imageViewer.classList.contains('hidden')) return;
  if (!imageViewerState.images.length) return;
  const len = imageViewerState.images.length;
  imageViewerState.index = (imageViewerState.index + delta + len) % len;
  if (typeof imageViewer.renderActiveImage === 'function') {
    imageViewer.renderActiveImage();
  }
}

function closeImageViewer(reason = 'unknown') {
  if (!imageViewer) return;
  console.log('Closing image viewer (reason):', reason, 'at', new Date().toISOString());
  imageViewer.classList.add('hidden');
  imageViewer.setAttribute('aria-hidden', 'true');
}

function showModal(scroll) {
  const modal = document.getElementById('modal');
  const title = document.getElementById('modal-title');
  const body = document.getElementById('modal-body');
  const imageContainer = document.getElementById('modal-image');

  if (!modal || !title || !body || !imageContainer) {
    console.error('Modal elements missing from the page');
    return;
  }

  blurInput();

  console.log('Opening modal for scroll:', scroll.id, 'before classes:', [...modal.classList]);

  title.textContent = scroll.title;
  body.innerHTML = scroll.body.split('\n\n').map(p => `<p>${p}</p>`).join('');

  imageContainer.innerHTML = '';
  const images = scroll.images || (scroll.image ? [scroll.image] : []);
  currentModalImages = images.filter(imgObj => imgObj && imgObj.visible !== false);
  currentModalImages.forEach((imgObj, idx) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'enhance-wrapper';

    const img = document.createElement('img');
    img.src = imgObj.src;
    img.alt = imgObj.alt;
    img.className = 'pixelate';
    img.addEventListener('click', () => openImageViewer(currentModalImages, idx));

    const enhanceBtn = document.createElement('button');
    enhanceBtn.type = 'button';
    enhanceBtn.className = 'enhance-btn';
    enhanceBtn.textContent = 'ENHANCE!';
    enhanceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openImageViewer(currentModalImages, idx);
    });

    const enhanceContainer = document.createElement('div');
    enhanceContainer.className = 'enhance-container';
    enhanceContainer.appendChild(enhanceBtn);

    wrapper.appendChild(img);
    wrapper.appendChild(enhanceContainer);
    wrapper.addEventListener('click', () => openImageViewer(currentModalImages, idx));
    imageContainer.appendChild(wrapper);
  });

  modal.classList.remove('hidden');
  console.log('Modal classes after removing hidden:', [...modal.classList]);
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(reason = 'unknown') {
  console.log('Closing modal (reason):', reason, 'at', new Date().toISOString());
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
  document.getElementById('input').focus();
  currentModalImages = [];

   // If all scrolls are read, trigger end sequence after closing
  if (
    gameState.pendingEnd &&
    gameState.scrollsRead.length === 4 &&
    !gameState.completedGame
  ) {
    gameState.pendingEnd = false;
    gameState.completedGame = true;
    setTimeout(() => {
      triggerEndSequence();
    }, 200);
  }
}

function saveState() {
  try {
    localStorage.setItem('gameState', JSON.stringify(gameState));
    renderOutput("Game saved successfully.\n\n");
  } catch (e) {
    renderOutput("Error saving game.\n\n");
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('gameState');
    if (saved) {
      gameState = JSON.parse(saved);
      ensureStateDefaults();
      for (const roomId in MAP) {
        if (gameState.errorCounts[roomId] == null) {
          gameState.errorCounts[roomId] = 0;
        }
      }
      document.getElementById('output').innerHTML = '';
      renderOutput("Game loaded successfully.\n\n");
      look();
      updateStatus();
    } else {
      renderOutput("No saved game found.\n\n");
    }
  } catch (e) {
    renderOutput("Error loading game.\n\n");
  }
}

function loadSettings() {
  try {
    const saved = localStorage.getItem('settings');
    if (saved) {
      settings = JSON.parse(saved);
      const parsed = JSON.parse(saved);
      const merged = {
        fastText: !!parsed.fastText,
        theme: parsed.theme || (parsed.highContrast ? 'highcontrast' : 'green')
      };
      settings = merged;
      const btn = document.getElementById('fast-text-btn');
      btn.textContent = settings.fastText ? 'Normal Text' : 'Fast Text';
      applyTheme(settings.theme || 'green');
    } else {
      applyTheme(settings.theme || 'green');
    }
  } catch (e) {
    console.error('Error loading settings');
    applyTheme('green');
  }
}

function quit() {
  if (confirm('Are you sure you want to quit?')) {
    renderOutput("\nThank you for playing 2025 Holiday Letter Quest!\n\n");
    document.getElementById('input').disabled = true;
  }
}

function renderOutput(text, immediate = false) {
  if (immediate || settings.fastText) {
    appendToOutput(text);
  } else {
    textQueue.push(text);
    if (!isTyping) {
      processTextQueue();
    }
  }
}

function appendToOutput(text) {
  const output = document.getElementById('output');
  const lines = text.split('\n');

  lines.forEach((line, index) => {
    if (line) {
      const p = document.createElement('p');
      p.textContent = line;
      output.appendChild(p);
    } else if (index < lines.length - 1) {
      output.appendChild(document.createElement('br'));
    }
  });

  const container = document.getElementById('output-container');
  container.scrollTop = container.scrollHeight;
}

function processTextQueue() {
  // If nothing left to process, mark typing as done
  if (textQueue.length === 0) {
    isTyping = false;
    resetTypingState();
    return;
  }

  isTyping = true;
  typingState.text = textQueue.shift();
  typingState.index = 0;
  typingState.output = document.getElementById('output');
  typingState.container = document.getElementById('output-container');
  typingState.currentP = document.createElement('p');

  if (!typingState.output || !typingState.container) {
    resetTypingState();
    isTyping = false;
    return;
  }

  typingState.output.appendChild(typingState.currentP);

  const typeChar = () => {
    if (typingState.index < typingState.text.length) {
      const char = typingState.text[typingState.index];
      if (char === '\n') {
        const nextP = document.createElement('p');
        typingState.output.appendChild(nextP);
        typingState.currentP = nextP;
      } else {
        const target = typingState.output.lastElementChild || typingState.currentP;
        if (target) {
          target.textContent += char;
        }
      }

      typingState.index++;
      typingState.container.scrollTop = typingState.container.scrollHeight;
      typingState.timeoutId = setTimeout(typeChar, 15);
    } else {
      resetTypingState();
      isTyping = false;
      processTextQueue();
    }
  };

  typeChar();
}

function flushTextQueue() {
  if (!isTyping && textQueue.length === 0) {
    return;
  }

  if (typingState.timeoutId) {
    clearTimeout(typingState.timeoutId);
    typingState.timeoutId = null;
  }

  if (isTyping && typingState.text && typingState.output) {
    const container = typingState.container || document.getElementById('output-container');
    let currentP = typingState.currentP || typingState.output.lastElementChild;

    if (!currentP) {
      currentP = document.createElement('p');
      typingState.output.appendChild(currentP);
    }

    for (let i = typingState.index; i < typingState.text.length; i++) {
      const char = typingState.text[i];
      if (char === '\n') {
        const nextP = document.createElement('p');
        typingState.output.appendChild(nextP);
        currentP = nextP;
      } else {
        currentP.textContent += char;
      }
    }

    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  while (textQueue.length) {
    appendToOutput(textQueue.shift());
  }

  resetTypingState();
  isTyping = false;
}

function updateStatus() {
  document.getElementById('location').textContent = MAP[gameState.currentRoom].name;
  document.getElementById('moves').textContent = `Moves: ${gameState.moves}`;
  document.getElementById('scrolls').textContent = `Scrolls: ${gameState.scrollsCollected.length}/4`;
}

function triggerEndSequence() {
  const endSeq = document.getElementById('end-sequence');
  const asciiArt = document.getElementById('ascii-art');
  const confetti = document.getElementById('confetti');
  const gallery = document.getElementById('image-gallery');

  asciiArt.textContent = HAPPY_HOLIDAYS_ASCII;

  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.textContent = ['*', '+', '•', '◆', '▪'][Math.floor(Math.random() * 5)];
      piece.style.left = Math.random() * 100 + '%';
      piece.style.animationDelay = Math.random() * 0.5 + 's';
      confetti.appendChild(piece);
    }, i * 60);
  }

  setTimeout(() => {
    confetti.innerHTML = '';
  }, 3500);

  gallery.innerHTML = '';
  END_IMAGES.forEach(img => {
    const wrapper = document.createElement('div');
    wrapper.className = 'enhance-wrapper';

    const imgEl = document.createElement('img');
    imgEl.src = img.src;
    imgEl.alt = img.alt;
    imgEl.tabIndex = 0;
    imgEl.addEventListener('click', () => openImageViewer(END_IMAGES, END_IMAGES.indexOf(img)));
    imgEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openImageViewer(END_IMAGES, END_IMAGES.indexOf(img));
      }
    });

    const enhanceBtn = document.createElement('button');
    enhanceBtn.type = 'button';
    enhanceBtn.className = 'enhance-btn';
    enhanceBtn.textContent = 'ENHANCE!';
    enhanceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openImageViewer(END_IMAGES, END_IMAGES.indexOf(img));
    });

    const enhanceContainer = document.createElement('div');
    enhanceContainer.className = 'enhance-container';
    enhanceContainer.appendChild(enhanceBtn);

    wrapper.appendChild(imgEl);
    wrapper.appendChild(enhanceContainer);
    wrapper.addEventListener('click', () => openImageViewer(END_IMAGES, END_IMAGES.indexOf(img)));
    gallery.appendChild(wrapper);
  });

  endSeq.classList.remove('hidden');
}

function shareGame() {
  const url = window.location.href;
  const text = "I just completed the 2025 Xmas Letter Quest! A magical holiday adventure awaits you...";

  if (navigator.share) {
    navigator.share({
      title: "2025 Xmas Letter Quest",
      text: text,
      url: url
    }).catch(() => {
      copyToClipboard(url);
    });
  } else {
    copyToClipboard(url);
  }
}

function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  alert('Game URL copied to clipboard!');
}

function restartGame() {
  gameState = {
    currentRoom: "vestibule",
    inventory: [],
    moves: 0,
    scrollsCollected: [],
    scrollsRead: [],
    roomItems: {},
    visitedRooms: [],
    completedGame: false,
    vaultUnlocked: false,
    chestUnlocked: false,
    errorCounts: {},
    cluesShown: {},
    chestContents: ['scroll_autumn'],
    readHints: {},
    pendingEnd: false
  };

  for (const roomId in MAP) {
    gameState.roomItems[roomId] = [...(MAP[roomId].items || [])];
    gameState.errorCounts[roomId] = 0;
  }

  document.getElementById('end-sequence').classList.add('hidden');
  document.getElementById('output').innerHTML = '';
  document.getElementById('input').disabled = false;

  renderOutput("2025 XMAS LETTER QUEST\nA Holiday Adventure\n");
  renderOutput("Type HELP for instructions, or GLOSSARY for a list of commands.\n\n");
  look();
  updateStatus();
  document.getElementById('input').focus();
}

console.log('Setting up DOMContentLoaded listener');
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOMContentLoaded fired, preparing hero screen');

  const startBtn = document.getElementById('start-btn');
  const heroYear = document.getElementById('hero-year');
  if (heroYear) {
    heroYear.textContent = new Date().getFullYear();
  }

  const startGame = () => {
    if (gameStarted) return;
    gameStarted = true;
    const hero = document.getElementById('hero-screen');
    const terminal = document.getElementById('terminal');
    if (hero) hero.classList.add('hidden');
    if (terminal) terminal.classList.remove('hidden');
    try {
      initGame();
    } catch (error) {
      console.error('Error initializing game:', error);
    }
  };

  if (startBtn) {
    startBtn.addEventListener('click', startGame);
    startBtn.focus();
  }

  document.addEventListener('keydown', (e) => {
    if (gameStarted) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      startGame();
    }
  });

  // For cases where DOM is already ready (e.g., hot reload)
  if (document.readyState !== 'loading' && !gameStarted) {
    console.log('Document already loaded; waiting on hero start');
  }
});
