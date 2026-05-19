/* ============================================
     КИРИЛЛ ↔ ЛОТИН АЛИФБО ЎЗГАРТИРГИЧИ
     ============================================ */
  
  let currentScript = localStorage.getItem('script') || 'cyrillic';

  // HTML escape (XSS ҳимояси)
  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ============================================
  //   СЕВИМЛИ + КЭШ (localStorage)
  // ============================================

  const FAVORITES_KEY = 'ovqat_favorites';
  const CACHE_KEY = 'ovqat_search_cache';
  const CACHE_MAX = 20;
  const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

  function recipeId(r) {
    return (r && r.name ? String(r.name) : '').toLowerCase().replace(/\s+/g, '-');
  }

  function getFavorites() {
    try { return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []; }
    catch { return []; }
  }
  function setFavorites(list) {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
  }
  function isFavorite(r) {
    const id = recipeId(r);
    return getFavorites().some(f => recipeId(f) === id);
  }
  function toggleFavorite(r) {
    const id = recipeId(r);
    const list = getFavorites();
    const idx = list.findIndex(f => recipeId(f) === id);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(r);
    setFavorites(list);
    updateFavoritesCount();
    return idx < 0;
  }
  function updateFavoritesCount() {
    const el = document.getElementById('favorites-count');
    const n = getFavorites().length;
    el.textContent = n;
    el.setAttribute('data-count', String(n));
  }

  function cacheKey(ingredients, servingsCount) {
    const norm = [...ingredients].map(s => s.trim().toLowerCase()).sort().join(',');
    return norm + '|' + servingsCount;
  }
  function getCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; }
    catch { return []; }
  }
  function setCacheList(list) {
    localStorage.setItem(CACHE_KEY, JSON.stringify(list.slice(-CACHE_MAX)));
  }
  function readCache(key) {
    const list = getCache();
    const entry = list.find(e => e.k === key);
    if (!entry) return null;
    if (Date.now() - entry.t > CACHE_TTL_MS) return null;
    return entry.v;
  }
  function writeCache(key, value) {
    let list = getCache().filter(e => e.k !== key);
    list.push({ k: key, t: Date.now(), v: value });
    setCacheList(list);
  }

  // Кирилл → Лотин таржима жадвали (ўзбек тили)
  const cyrToLat = {
    'А':'A','Б':'B','В':'V','Г':'G','Д':'D','Ё':'Yo','Ж':'J','З':'Z',
    'И':'I','Й':'Y','К':'K','Л':'L','М':'M','Н':'N','О':'O','П':'P','Р':'R',
    'С':'S','Т':'T','У':'U','Ф':'F','Х':'X','Ч':'Ch','Ш':'Sh','Ъ':'ʼ',
    'Э':'E','Ю':'Yu','Я':'Ya','Қ':'Q','Ў':'Oʻ','Ғ':'Gʻ','Ҳ':'H',
    'а':'a','б':'b','в':'v','г':'g','д':'d','ё':'yo','ж':'j','з':'z',
    'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
    'с':'s','т':'t','у':'u','ф':'f','х':'x','ч':'ch','ш':'sh','ъ':'ʼ',
    'э':'e','ю':'yu','я':'ya','қ':'q','ў':'oʻ','ғ':'gʻ','ҳ':'h'
  };

  function toLatin(text) {
    if (!text) return text;
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const prev = text[i - 1] || ' ';
      
      const isWordStart = i === 0 || /[\s\.,!?\-—:;"'(«»\n]/.test(prev);

      // "Е/е" учун: сўз бошида = Ye/ye, ўртасида = e
      if (ch === 'Е') { result += isWordStart ? 'Ye' : 'e'; continue; }
      if (ch === 'е') { result += isWordStart ? 'ye' : 'e'; continue; }

      // "Ц/ц" учун: сўз бошида = S/s, ўртасида = ts
      if (ch === 'Ц') { result += isWordStart ? 'S' : 'Ts'; continue; }
      if (ch === 'ц') { result += isWordStart ? 's' : 'ts'; continue; }
      
      result += cyrToLat[ch] !== undefined ? cyrToLat[ch] : ch;
    }
    return result;
  }

  function tr(cyrillicText) {
    return currentScript === 'latin' ? toLatin(cyrillicText) : cyrillicText;
  }

  // Барча матнлар (кирилл асл)
  const texts = {
    'title': 'Бугун нима тайёрлаймиз?',
    'subtitle': 'Уйингиздаги масаллиқларни айтинг — мен сизга мазали таомлар таклиф қилай',
    'step-title': 'Масаллиқларни киритинг',
    'btn-add': 'Қўшиш',
    'quick-select': 'Тез танлаш учун:',
    'empty-state': 'Ҳозирча бирорта масаллиқ қўшилмаган...',
    'servings-label': 'Неча кишилик?',
    'btn-cook': 'Таомларни топиш',
    'loading': 'Энг мос таомларни танлаяпман...',
    'results-title': 'Сиз учун таклифлар',
    'results-subtitle': 'Таомни тўлиқ рецепти учун босинг',
    'input-placeholder': 'Масалан: гўшт, картошка, пиёз...',
    'title-emphasis': 'тайёрлаймиз',
    'remove': 'Ўчириш',
    'time-label': 'Вақт',
    'difficulty-label': 'Қийинлик',
    'ingredients-label': 'Масаллиқлар',
    'steps-label': 'Тайёрлаш тартиби',
    'count-suffix': 'та',
    'api-error-busy': 'Иловa ҳозир банд. Илтимос, бир оздан кейин қайта уриниб кўринг.',
    'copied-to-clipboard': 'Рецепт нусхаланди ✓',
    'favorites-title': 'Севимли рецептлар',
    'favorites-empty': 'Ҳозирча севимли рецепт йўқ. Рецепт устидаги ❤ тугмасини босиб қўшинг.'
  };

  function switchScript(script) {
    currentScript = script;
    localStorage.setItem('script', script);
    
    document.getElementById('btn-cyrillic').classList.toggle('active', script === 'cyrillic');
    document.getElementById('btn-latin').classList.toggle('active', script === 'latin');
    
    applyScriptToPage();
    renderSuggestions();
    renderIngredients();
    
    if (currentRecipes.length > 0) {
      displayRecipes(currentRecipes);
    }
    
    if (document.getElementById('modal-overlay').classList.contains('active') && currentRecipeIndex !== -1) {
      showRecipe(currentRecipeIndex);
    }
  }

  function applyScriptToPage() {
    // Сарлавҳани махсус ишлаб чиқиш ("тайёрлаймиз" сўзи em ичида)
    const titleEl = document.querySelector('[data-tr="title"]');
    if (titleEl) {
      const before = tr('Бугун нима');
      const emphasis = tr('тайёрлаймиз');
      titleEl.innerHTML = `${before} <em>${emphasis}</em>?`;
    }

    // Қолган элементлар
    document.querySelectorAll('[data-tr]').forEach(el => {
      const key = el.getAttribute('data-tr');
      if (key === 'title') return;
      if (texts[key]) {
        el.textContent = tr(texts[key]);
      }
    });

    document.querySelectorAll('[data-tr-placeholder]').forEach(el => {
      const key = el.getAttribute('data-tr-placeholder');
      if (texts[key]) {
        el.placeholder = tr(texts[key]);
      }
    });

    document.documentElement.lang = currentScript === 'latin' ? 'uz-Latn' : 'uz-Cyrl';
  }

  /* ============================================
     ИЛОВА ФУНКЦИЯЛАРИ
     ============================================ */

  const commonIngredients = [
    'Гўшт', 'Товуқ гўшти', 'Қўй гўшти', 'Картошка', 'Пиёз', 'Сабзи', 
    'Помидор', 'Бодринг', 'Қалампир', 'Саримсоқ', 'Гуруч', 'Макарон',
    'Тухум', 'Сут', 'Қаймоқ', 'Сариёғ', 'Ун', 'Қанд', 'Туз',
    'Лавлаги', 'Карам', 'Қовоқ', 'Бақлажон', 'Лимон', 'Балиқ'
  ];

  let selectedIngredients = [];
  let currentRecipes = [];
  let currentRecipeIndex = -1;
  let servings = 4;
  const SERVINGS_MIN = 1;
  const SERVINGS_MAX = 12;

  function renderSuggestions() {
    const container = document.getElementById('suggestion-chips');
    container.innerHTML = commonIngredients
      .filter(item => !selectedIngredients.includes(item))
      .slice(0, 12)
      .map(item => `<button class="chip-suggest" data-name="${esc(item)}">+ ${esc(tr(item))}</button>`)
      .join('');
    container.querySelectorAll('.chip-suggest').forEach(btn => {
      btn.addEventListener('click', () => addIngredientFromChip(btn.dataset.name));
    });
  }

  function addIngredient() {
    const input = document.getElementById('ingredient-input');
    const value = input.value.trim();
    if (value && !selectedIngredients.includes(value)) {
      selectedIngredients.push(value);
      input.value = '';
      renderIngredients();
      renderSuggestions();
      updateButton();
    }
    input.focus();
  }

  function addIngredientFromChip(name) {
    if (!selectedIngredients.includes(name)) {
      selectedIngredients.push(name);
      renderIngredients();
      renderSuggestions();
      updateButton();
    }
  }

  function removeIngredient(index) {
    selectedIngredients.splice(index, 1);
    renderIngredients();
    renderSuggestions();
    updateButton();
  }

  function renderIngredients() {
    const container = document.getElementById('ingredients-list');
    if (selectedIngredients.length === 0) {
      container.innerHTML = `<div class="empty-state">${esc(tr(texts['empty-state']))}</div>`;
      return;
    }
    container.innerHTML = selectedIngredients.map((item, i) => `
      <div class="ingredient-tag">
        <span>${esc(tr(item))}</span>
        <button class="remove" data-index="${i}" aria-label="${esc(tr(texts['remove']))}">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
    container.querySelectorAll('.ingredient-tag .remove').forEach(btn => {
      btn.addEventListener('click', () => removeIngredient(Number(btn.dataset.index)));
    });
  }

  function updateButton() {
    const btn = document.getElementById('cook-btn');
    btn.disabled = selectedIngredients.length === 0;
  }

  document.getElementById('ingredient-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  });

  function showError(message) {
    const errorBox = document.getElementById('error-box');
    errorBox.innerHTML = `<div class="error">⚠ ${esc(message)}</div>`;
    setTimeout(() => { errorBox.innerHTML = ''; }, 5000);
  }

  // ============================================
  //   AI ҚИДИРУВ
  // ============================================

  // Cloudflare Worker прокси URL — Gemini калити шунинг ичида махфий сақланади
  const PROXY_URL = 'https://ovqat.abu-yahyo-ismoil.workers.dev';

  // Тўлиқ JSON массивни тахмин қилиб, тугаган обектларни ажратиб олиш
  function parsePartialArray(text) {
    const start = text.indexOf('[');
    if (start === -1) return [];

    const out = [];
    let depth = 0;
    let objStart = -1;
    let inString = false;
    let escape = false;

    for (let i = start + 1; i < text.length; i++) {
      const c = text[i];
      if (escape) { escape = false; continue; }
      if (c === '\\') { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (c === '{') {
        if (depth === 0) objStart = i;
        depth++;
      } else if (c === '}') {
        depth--;
        if (depth === 0 && objStart !== -1) {
          const objStr = text.substring(objStart, i + 1);
          try { out.push(JSON.parse(objStr)); } catch {}
          objStart = -1;
        }
      } else if (c === ']' && depth === 0) {
        break;
      }
    }

    return out;
  }

  async function findRecipes() {
    if (selectedIngredients.length === 0) return;

    const ckey = cacheKey(selectedIngredients, servings);
    const cached = readCache(ckey);
    if (cached) {
      displayRecipes(cached);
      return;
    }

    const loadingEl = document.getElementById('loading');
    const errorBox = document.getElementById('error-box');
    loadingEl.classList.add('active');
    errorBox.innerHTML = '';

    const prompt = `Сен ўзбек ошпазсан ва ўзбек тилининг адабий, имлоси аниқ варианти билан ёзасан. Қуйидаги масаллиқлар берилган: ${selectedIngredients.join(', ')}.
Овқат ${servings} кишига тайёрланмоқда — барча масаллиқ миқдорлари шу ${servings} кишилик порциясига ҳисобланган бўлсин.

Шу масаллиқлардан тайёрлаш мумкин бўлган 4-6 та ўзбек ва жаҳон таомларини таклиф қил. Барча таом номлари, тавсифлари, масаллиқлар ва қадамлар АЛБАТТА ўзбек тилида ва КИРИЛЛ алифбосида бўлсин.

МУҲИМ ҚОИДАЛАР:
- Имлоси аниқ, грамматикаси тўғри адабий ўзбек тилидан фойдалан.
- Русча сўзларни сохта ўзбекчага транслитерация қилма. Масалан "лопшо", "блюдо", "вермишелька" — нотўғри. Тўғри атамалар: "лағмон", "таом", "макарон", "вермишел", "шўрва" ва ҳ.к.
- Ҳар бир жумлада тиниш белгиларини тўғри ишлат. Сўз ўртасида ёки охирида сабабсиз бўш жой қолдирма.
- Таом номини миллий атамалари билан ёз: "Палов", "Лағмон", "Манти", "Сомса", "Чучвара", "Бешбармоқ", "Шўрва", "Қовурдоқ", "Мастава", "Угра", "Шавля", "Димлама" ва бошқалар.

Фақат JSON форматида жавоб бер, бошқа ҳеч нарса ёзма. Мисол формат:
[
  {
    "emoji": "🍲",
    "name": "Таом номи",
    "description": "Қисқа тавсиф (15-20 сўз)",
    "time": "30 дақиқа",
    "difficulty": "Осон",
    "ingredients": ["масаллиқ 1 - миқдор", "масаллиқ 2 - миқдор"],
    "steps": ["1-қадам тавсифи", "2-қадам тавсифи", "3-қадам тавсифи"]
  }
]

Қийинлик: "Осон", "Ўртача", "Қийин" дан танла.
Камида 5 та масаллиқ ва 5 та қадам бўлсин ҳар бир таом учун.
Фақат JSON массивни қайтар, ҳеч қандай матн ёки markdown формати йўқ.`;

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 4096,
        responseMimeType: "application/json"
      }
    };

    let recipes = [];
    let renderedCount = 0;

    // 1) Биринчи — стрим режимини синаб кўриш (тезроқ ишлайди)
    try {
      const response = await fetch(PROXY_URL + '?stream=1', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody)
      });

      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        let textAccum = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });

          let sep;
          while ((sep = sseBuffer.indexOf('\n\n')) !== -1) {
            const event = sseBuffer.substring(0, sep);
            sseBuffer = sseBuffer.substring(sep + 2);
            const dataLine = event.split('\n').find(l => l.startsWith('data: '));
            if (!dataLine) continue;
            const json = dataLine.substring(6).trim();
            if (!json) continue;
            try {
              const obj = JSON.parse(json);
              const txt = obj && obj.candidates && obj.candidates[0]
                && obj.candidates[0].content && obj.candidates[0].content.parts
                && obj.candidates[0].content.parts[0] && obj.candidates[0].content.parts[0].text;
              if (typeof txt === 'string') textAccum += txt;
            } catch {}
          }

          const parsed = parsePartialArray(textAccum);
          if (parsed.length > renderedCount) {
            if (renderedCount === 0) {
              loadingEl.classList.remove('active');
              prepareRecipesGrid();
            }
            for (let i = renderedCount; i < parsed.length; i++) {
              appendRecipeCard(parsed[i], i);
            }
            renderedCount = parsed.length;
            recipes = parsed;
          }
        }

        const finalParsed = parsePartialArray(textAccum);
        if (finalParsed.length > renderedCount) {
          if (renderedCount === 0) {
            loadingEl.classList.remove('active');
            prepareRecipesGrid();
          }
          for (let i = renderedCount; i < finalParsed.length; i++) {
            appendRecipeCard(finalParsed[i], i);
          }
          renderedCount = finalParsed.length;
          recipes = finalParsed;
        }
      } else {
        console.warn('Streaming response not OK:', response.status);
      }
    } catch (err) {
      console.warn('Streaming request failed:', err);
    }

    // 2) Стрим муваффақиятсиз — обычный (non-streaming) усулда уриниш
    if (recipes.length === 0) {
      try {
        const response = await fetch(PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody)
        });
        const data = await response.json();
        if (response.ok && !data.error) {
          const part = data && data.candidates && data.candidates[0]
            && data.candidates[0].content && data.candidates[0].content.parts
            && data.candidates[0].content.parts[0];
          if (part && typeof part.text === 'string') {
            let text = part.text.trim().replace(/```json|```/g, '').trim();
            const start = text.indexOf('[');
            const end = text.lastIndexOf(']');
            if (start !== -1 && end !== -1) text = text.substring(start, end + 1);
            try {
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed) && parsed.length > 0) recipes = parsed;
            } catch (e) {
              console.warn('Non-stream parse error:', e);
            }
          }
        } else {
          console.warn('Non-stream HTTP not OK:', response.status, data);
        }
      } catch (err) {
        console.warn('Non-stream request failed:', err);
      }

      // Агар nonstreaming натижа топилса — full displayRecipes (стрим ҳеч нима кўрсатмаган бўлса)
      if (recipes.length > 0 && renderedCount === 0) {
        loadingEl.classList.remove('active');
        displayRecipes(recipes);
      }
    }

    loadingEl.classList.remove('active');

    if (recipes.length > 0) {
      currentRecipes = recipes;
      writeCache(ckey, recipes);
    } else {
      showError(tr(texts['api-error-busy']));
    }
  }

  // Картанинг HTML шаблони
  function recipeCardHtml(r, i) {
    return `
      <article class="recipe-card" data-index="${i}" style="--stagger: ${i * 70}ms">
        <button class="recipe-fav ${isFavorite(r) ? 'active' : ''}" data-fav-index="${i}" aria-label="Sevimli">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
        <span class="recipe-emoji">${esc(r.emoji || '🍽')}</span>
        <h3 class="recipe-name">${esc(tr(r.name || ''))}</h3>
        <p class="recipe-desc">${esc(tr(r.description || ''))}</p>
        <div class="recipe-meta">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            ${esc(tr(r.time || '—'))}
          </span>
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            ${esc(tr(r.difficulty || 'Ўртача'))}
          </span>
        </div>
      </article>
    `;
  }

  function attachCardHandlers(card) {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.recipe-fav')) return;
      showRecipe(Number(card.dataset.index));
    });
    const favBtn = card.querySelector('.recipe-fav');
    if (favBtn) {
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(favBtn.dataset.favIndex);
        const r = currentRecipes[idx];
        const added = toggleFavorite(r);
        favBtn.classList.toggle('active', added);
      });
    }
  }

  function prepareRecipesGrid() {
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = '';
    currentRecipes = [];
    document.getElementById('results').classList.add('active');
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function appendRecipeCard(r, i) {
    const grid = document.getElementById('recipes-grid');
    currentRecipes[i] = r;
    const tmp = document.createElement('div');
    tmp.innerHTML = recipeCardHtml(r, i).trim();
    const card = tmp.firstElementChild;
    grid.appendChild(card);
    attachCardHandlers(card);
  }

  function displayRecipes(recipes) {
    currentRecipes = recipes;
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = recipes.map((r, i) => recipeCardHtml(r, i)).join('');
    grid.querySelectorAll('.recipe-card').forEach(attachCardHandlers);
    document.getElementById('results').classList.add('active');
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function showRecipe(index) {
    currentRecipeIndex = index;
    const r = currentRecipes[index];
    // Show share button only if Web Share API is available
    const shareBtn = document.getElementById('modal-share-btn');
    if (shareBtn) {
      shareBtn.hidden = !(navigator.share || navigator.clipboard);
    }
    const body = document.getElementById('modal-body');
    body.innerHTML = `
      <div class="modal-emoji">${esc(r.emoji || '🍽')}</div>
      <h2>${esc(tr(r.name))}</h2>
      <p class="modal-desc">${esc(tr(r.description))}</p>
      
      <div class="modal-meta">
        <div class="modal-meta-item">
          <div class="label">${esc(tr(texts['time-label']))}</div>
          <div class="value">${esc(tr(r.time || '—'))}</div>
        </div>
        <div class="modal-meta-item">
          <div class="label">${esc(tr(texts['difficulty-label']))}</div>
          <div class="value">${esc(tr(r.difficulty || '—'))}</div>
        </div>
        <div class="modal-meta-item">
          <div class="label">${esc(tr(texts['ingredients-label']))}</div>
          <div class="value">${(r.ingredients || []).length} ${esc(tr(texts['count-suffix']))}</div>
        </div>
      </div>

      <div class="modal-section">
        <h3>${esc(tr(texts['ingredients-label']))}</h3>
        <ul>
          ${(r.ingredients || []).map(i => `<li>${esc(tr(i))}</li>`).join('')}
        </ul>
      </div>

      <div class="modal-section">
        <h3>${esc(tr(texts['steps-label']))}</h3>
        <ol>
          ${(r.steps || []).map(s => `<li>${esc(tr(s))}</li>`).join('')}
        </ol>
      </div>
    `;
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
    currentRecipeIndex = -1;
  }

  async function shareCurrentRecipe() {
    if (currentRecipeIndex === -1) return;
    const r = currentRecipes[currentRecipeIndex];
    if (!r) return;
    const name = tr(r.name || '');
    const desc = tr(r.description || '');
    const ingredients = (r.ingredients || []).map(i => '• ' + tr(i)).join('\n');
    const steps = (r.steps || []).map((s, i) => (i + 1) + '. ' + tr(s)).join('\n');
    const url = window.location.href;
    const text = `${name}\n\n${desc}\n\n${tr(texts['ingredients-label'])}:\n${ingredients}\n\n${tr(texts['steps-label'])}:\n${steps}\n\n${url}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: name, text, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showError(tr(texts['copied-to-clipboard']));
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.warn('Share failed:', err);
      }
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Воқеа тингловчилари
  document.getElementById('btn-cyrillic').addEventListener('click', () => switchScript('cyrillic'));
  document.getElementById('btn-latin').addEventListener('click', () => switchScript('latin'));
  document.getElementById('btn-add-ingredient').addEventListener('click', addIngredient);
  // Servings picker
  const servingsCountEl = document.getElementById('servings-count');
  const servingsMinusBtn = document.getElementById('servings-minus');
  const servingsPlusBtn = document.getElementById('servings-plus');

  function syncServingsButtons() {
    servingsMinusBtn.disabled = servings <= SERVINGS_MIN;
    servingsPlusBtn.disabled = servings >= SERVINGS_MAX;
    servingsCountEl.textContent = servings;
  }

  servingsMinusBtn.addEventListener('click', () => {
    if (servings > SERVINGS_MIN) {
      servings--;
      syncServingsButtons();
    }
  });
  servingsPlusBtn.addEventListener('click', () => {
    if (servings < SERVINGS_MAX) {
      servings++;
      syncServingsButtons();
    }
  });
  syncServingsButtons();

  document.getElementById('cook-btn').addEventListener('click', findRecipes);

  // Favorites
  const favOverlay = document.getElementById('favorites-overlay');
  const favOpenBtn = document.getElementById('favorites-open');
  const favCloseBtn = document.getElementById('favorites-close-btn');
  const favList = document.getElementById('favorites-list');
  const favEmptyMsg = document.getElementById('favorites-empty-msg');

  function renderFavoritesModal() {
    const favs = getFavorites();
    favEmptyMsg.style.display = favs.length === 0 ? 'block' : 'none';
    favList.innerHTML = favs.map((r, i) => `
      <div class="favorite-row" data-fav-modal-index="${i}">
        <span class="emoji">${esc(r.emoji || '🍽')}</span>
        <div class="meta">
          <div class="name">${esc(tr(r.name || ''))}</div>
          <div class="desc">${esc(tr(r.description || ''))}</div>
        </div>
        <button class="remove" data-fav-remove-index="${i}" aria-label="O'chirish">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    `).join('');
    favList.querySelectorAll('.favorite-row').forEach(row => {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.remove')) return;
        const idx = Number(row.dataset.favModalIndex);
        const r = getFavorites()[idx];
        if (!r) return;
        closeFavorites();
        currentRecipes = getFavorites();
        showRecipe(idx);
      });
    });
    favList.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = Number(btn.dataset.favRemoveIndex);
        const list = getFavorites();
        list.splice(idx, 1);
        setFavorites(list);
        updateFavoritesCount();
        renderFavoritesModal();
        document.querySelectorAll('.recipe-fav').forEach(b => {
          const card = b.closest('.recipe-card');
          const cidx = Number(card && card.dataset.index);
          const r = currentRecipes[cidx];
          if (r) b.classList.toggle('active', isFavorite(r));
        });
      });
    });
  }

  function openFavorites() {
    renderFavoritesModal();
    favOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeFavorites() {
    favOverlay.classList.remove('active');
    if (!document.getElementById('modal-overlay').classList.contains('active')) {
      document.body.style.overflow = '';
    }
  }

  favOpenBtn.addEventListener('click', openFavorites);
  favCloseBtn.addEventListener('click', closeFavorites);
  favOverlay.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeFavorites();
  });
  updateFavoritesCount();

  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-share-btn').addEventListener('click', shareCurrentRecipe);
  document.getElementById('modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Эски калитларни тозалаш (агар бўлса — энди ҳеч қандай калит браузерда керак эмас)
  if (localStorage.getItem('anthropic_api_key')) localStorage.removeItem('anthropic_api_key');
  if (localStorage.getItem('gemini_api_key')) localStorage.removeItem('gemini_api_key');

  // Илк юкланиш
  document.getElementById('btn-cyrillic').classList.toggle('active', currentScript === 'cyrillic');
  document.getElementById('btn-latin').classList.toggle('active', currentScript === 'latin');
  applyScriptToPage();
  renderSuggestions();

  // Service Worker — оффлайн ишлаш ва тез юкланиш учун
  // (Network-first стратегияси: ҳар сафар янги версия олинади, кэш фонда)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
    // Янги SW активацияга ўтганда саҳифани автоматик янгилаш
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });
  }
