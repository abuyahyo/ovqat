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
    'step-title': 'Масаллиқларни киритинг',
    'btn-add': 'Қўшиш',
    'quick-select': 'Тез танлаш учун:',
    'empty-state': 'Ҳозирча бирорта масаллиқ қўшилмаган...',
    'servings-label': 'Неча кишилик?',
    'btn-cook': 'Таомларни топиш',
    'loading': 'Энг мос таомларни танлаяпман...',
    'generating': 'Рецепт тайёрланмоқда...',
    'generate-recipe': 'Рецептни яратиш',
    'results-title': 'Сиз учун таклифлар',
    'results-subtitle': 'Таомни танланг — рецептини тайёрлаб бераман',
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
    'favorites-empty': 'Ҳозирча севимли рецепт йўқ. Рецепт устидаги ❤ тугмасини босиб қўшинг.',
    'insufficient-default': 'Сиз белгилаган маҳсулотлар мазали таом тайёрлашга етарли эмас. Қуйидагилардан ҳам борми?',
    'show-all': 'Барчасини кўрсатиш',
    'show-less': 'Камроқ кўрсатиш',
    'regenerate': 'Бошқа таклифлар',
    'install-app': 'Иловани ўрнатиш',
    'install-prompt': 'Ушбу иловани телефонингизга ўрнатинг — оффлайн ҳам ишлайди.'
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
    // Энг кўп ишлатиладиганлар — биринчи навбатда кўринади
    'Гўшт', 'Товуқ гўшти', 'Картошка', 'Пиёз', 'Сабзи',
    'Помидор', 'Бодринг', 'Гуруч', 'Тухум', 'Саримсоқ',
    'Қалампир', 'Зира', 'Сариёғ', 'Сут', 'Ун',
    'Қатиқ', 'Қаймоқ', 'Туз', 'Қанд', 'Макарон',
    // Гўшт ва балиқ
    'Қўй гўшти', 'Мол гўшти', 'Балиқ', 'Қазиҳона',
    // Сабзавотлар
    'Лавлаги', 'Карам', 'Қовоқ', 'Бақлажон', 'Болгар қалампири',
    'Кўк пиёз', 'Турп', 'Маккажўҳори', 'Қўзиқорин',
    // Дуккаклилар ва ёрмалар
    'Нўхат', 'Мош', 'Ловия',
    // Кўкатлар
    'Кашнич', 'Райҳон', 'Шивит', 'Жамбил',
    // Сут маҳсулотлари
    'Пишлоқ', 'Сузма', 'Қурут', 'Айрон',
    // Меваллар
    'Лимон', 'Олма', 'Беҳи', 'Узум', 'Хурмо',
    // Ёнғоқлар ва қуруқ меваллар
    'Бодом', 'Ёнғоқ', 'Майиз', 'Ўрик қоқи',
    // Зираворлар
    'Зирк', 'Қора мурч', 'Аччиқ қалампир', 'Лавр япроғи'
  ];

  let selectedIngredients = [];
  let currentRecipes = [];
  let currentRecipeIndex = -1;
  let servings = 4;
  let showAllSuggestions = false;
  const SUGGESTIONS_COLLAPSED = 18;
  const SERVINGS_MIN = 1;
  const SERVINGS_MAX = 12;

  function renderSuggestions() {
    const container = document.getElementById('suggestion-chips');
    const available = commonIngredients.filter(item => !selectedIngredients.includes(item));
    const visible = showAllSuggestions ? available : available.slice(0, SUGGESTIONS_COLLAPSED);
    const chips = visible
      .map(item => `<button class="chip-suggest" data-name="${esc(item)}">+ ${esc(tr(item))}</button>`)
      .join('');
    const hasMore = available.length > SUGGESTIONS_COLLAPSED;
    const toggleLabel = showAllSuggestions ? texts['show-less'] : texts['show-all'];
    const toggle = hasMore
      ? `<button class="chip-toggle-all" type="button">${esc(tr(toggleLabel))}</button>`
      : '';
    container.innerHTML = chips + toggle;
    container.querySelectorAll('.chip-suggest').forEach(btn => {
      btn.addEventListener('click', () => addIngredientFromChip(btn.dataset.name));
    });
    const toggleBtn = container.querySelector('.chip-toggle-all');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        showAllSuggestions = !showAllSuggestions;
        renderSuggestions();
      });
    }
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

  function isInsufficientResponse(arr) {
    return Array.isArray(arr) && arr.length > 0 && arr[0] && arr[0].insufficient === true;
  }

  function renderInsufficient(info) {
    const grid = document.getElementById('recipes-grid');
    const msg = tr(info.message || texts['insufficient-default']);
    const suggestions = Array.isArray(info.suggestions) ? info.suggestions : [];
    const chips = suggestions
      .filter(s => s && !selectedIngredients.includes(s))
      .map(s => `<button class="chip-suggest" data-name="${esc(s)}">+ ${esc(tr(s))}</button>`)
      .join('');
    grid.innerHTML = `
      <div class="insufficient-card">
        <span class="insufficient-emoji">🥄</span>
        <p class="insufficient-message">${esc(msg)}</p>
        ${chips ? `<div class="insufficient-suggestions">${chips}</div>` : ''}
      </div>
    `;
    grid.querySelectorAll('.chip-suggest').forEach(btn => {
      btn.addEventListener('click', () => addIngredientFromChip(btn.dataset.name));
    });
    document.getElementById('results').classList.add('active');
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // Ҳар икки промпт учун умумий тил/ном қоидалари.
  const LANG_RULES = `ТИЛ ВА ИМЛО
- Адабий ўзбек тили, КИРИЛЛ алифбоси.
- Имлоси аниқ, тиниш белгилари жойида. Сўз ўртасида ёки охирида сабабсиз бўш жой йўқ.
- Русча сўзларни сохта ўзбекчага транслитерация қилма ("лопшо", "блюдо", "вермишелька" — нотўғри). Тўғри атамалар: "лағмон", "таом", "макарон", "вермишел", "шўрва", "пишириш", "қовуриш", "димлаш".

ТАОМ НОМЛАРИ — МАЖБУРИЙ ЎЗБЕКЧА
- Таом номи ("name" майдони) ФАҚАТ ўзбек тилида, КИРИЛЛ алифбосида бўлсин. Русча, инглизча ёки бошқа тилдаги номларни ҲЕЧ ҚАЧОН ёзма.
- Иложи борича миллий ўзбек/ўрта осиё таомларини таклиф қил: Ош, Лағмон, Манти, Сомса, Чучвара, Бешбармоқ, Шўрва, Мастава, Угра, Шавля, Димлама, Қовурдоқ, Норин, Хонум, Кабоб, Тухум барак, Қатлама, Патир, Куксумалак, Гўжа, Нарханги, Кўкатли чучвара, Жиз-биз, Тандир гўшт, Бўғирсоқ, Чалпак, Қуймоқ, Кулча, Оби-нон, Ширгуруч, Ҳалва, Сумалак, Холвайтар, Чакчак.
- МУҲИМ: ўзбеклар "палов" эмас, "ОШ" дейди. Шунинг учун "Палов" сўзини ҲЕЧ ҚАЧОН ишлатма — ҳамиша "Ош" ёз ("Тошкент оши", "Қовурма ош", "Сабзавотли ош", "Девзира ош" каби).
- Хорижий таом номларини ўзбекчалаштир: "пюре" → "эзма"; "суп" → "шўрва"; "блинчики" → "қуймоқ"/"чалпак"; "пельмени" → "чучвара"; "плов" → "Ош"; "лапша" → "угра"/"лағмон".
- Умумий/мавҳум номлар ишлатма ("Гўштли таом" — нотўғри). Ҳар таомга АНИҚ ном бер: "Қозон кабоб", "Сабзавотли димлама", "Товуқли шавля".
- Биринчи ҳарфи бош ҳарф билан ёзилсин.`;

  // 1-БОСҚИЧ: фақат 10 та таом ғоясини таклиф қилиш (рецептсиз — тез ва енгил).
  function buildSuggestionsPrompt(ingredients, excludeNames) {
    return `Сен — тажрибали ўзбек ошпазсан. Адабий ўзбек тилида, имлоси аниқ ёзасан.

КИРИТИЛГАН МАСАЛЛИҚЛАР: ${ingredients.join(', ')}

ВАЗИФА
Шу масаллиқлардан тайёрлаш мумкин бўлган АНИҚ 10 та хилма-хил таомни таклиф қил. Фақат таом ҒОЯСИНИ бер — батафсил рецепт, масаллиқ миқдори ёки тайёрлаш қадамлари ЁЗМА (улар кейинроқ алоҳида сўралади). Бир хил турни такрорлама. Турли йўналишларни қамраб ол: асосий таом, шўрва, салат, нонушта, ширинлик — масаллиқларга мос ҳолда.

ИЖОЗАТ БЕРИЛГАН ҚЎШИМЧАЛАР
Кириш масаллиқлардан ташқари оддий ошхона буюмлари ҳам ишлатилиши мумкин: туз, қалампир, шакар, ўсимлик ёғи, сариёғ, сув, сирка, лимон шарбати, асосий ўзбек зираворлари.

${LANG_RULES}

ВАҚТ ВА ҚИЙИНЛИК
- "time" — тахминий бутун тайёрлаш вақти. Реалистик: тез нонушта 10–15 дақиқа, ош 60–90 дақиқа.
- "difficulty": "Осон" (30 дақиқагача), "Ўртача" (30–90 дақиқа), "Қийин" (90+ дақиқа ёки махсус малака).

ТАВСИФ
"description" — 12–18 сўз. Таомнинг таъми, текстураси ва қачон яхши ейилиши ҳақида қизиқарли ёзинг.

МАСАЛЛИҚЛАР ЕТАРЛИ ЭМАС ҲОЛАТИ
Агар берилган масаллиқлардан чинакам мазали таом тайёрлашни ҲЕЧ ҚАНДАЙ ИЛОЖИ БЎЛМАСА (фақат битта таркиб; фақат туз/сув; мутлақо мос келмайдиганлар) — сохта таомлар ҚИЛМА. Бунинг ўрнига ФАҚАТ битта элементли массив қайтар:
[{ "insufficient": true, "message": "Сиз белгилаган маҳсулотлар мазали таом тайёрлашга етарли эмас. Қуйидагилардан ҳам борми?", "suggestions": ["Гўшт", "Пиёз", "Картошка", "Сабзи", "Гуруч"] }]
Агар камида 2 та ўзаро мос масаллиқ бўлса — оддий таомлар таклиф қил, "insufficient" бермa.

ФОРМАТ
Фақат JSON массивни қайтар, бошқа ҳеч нарса ёзма:
[
  {
    "emoji": "🍲",
    "name": "Таом номи",
    "description": "Таъм/текстура (12-18 сўз)",
    "time": "X дақиқа",
    "difficulty": "Осон|Ўртача|Қийин"
  }
]`
+ (excludeNames.length > 0
    ? `\n\nОЛДИНГИ ТАКЛИФЛАР (бу таомларни ҚАЙТАРМА — янги, бошқача вариантлар бер):\n${excludeNames.map(n => `- ${n}`).join('\n')}`
    : '');
  }

  // 2-БОСҚИЧ: танланган битта таомнинг тўлиқ рецептини N кишига генерация қилиш.
  function buildRecipePrompt(dish, ingredients, servingsCount) {
    return `Сен — тажрибали ўзбек ошпазсан. Адабий ўзбек тилида, имлоси аниқ ёзасан.

КИРИТИЛГАН МАСАЛЛИҚЛАР: ${ingredients.join(', ')}
ТАНЛАНГАН ТАОМ: ${dish.name}${dish.description ? ` (${dish.description})` : ''}
ПОРЦИЯ: ${servingsCount} киши учун

ВАЗИФА
Айнан "${dish.name}" таоми учун ${servingsCount} кишилик тўлиқ, сифатли рецепт ёз — масъулият билан, реалистик, ҳақиқатан тайёрлаш мумкин бўлсин.

ИЖОЗАТ БЕРИЛГАН ҚЎШИМЧАЛАР
Кириш масаллиқлардан ташқари оддий ошхона буюмлари ишлатилиши мумкин: туз, қалампир, шакар, ўсимлик ёғи, сариёғ, сув, сирка, лимон шарбати, асосий ўзбек зираворлари.

${LANG_RULES}

МАСАЛЛИҚЛАР МИҚДОРИ
- Ҳар бир масаллиқ учун АНИҚ миқдор: г, кг, мл, л, дона, ч.қ., о.қ., пиёла, чимдим.
- Миқдорлар АЙНАН ${servingsCount} кишилик порция учун ҳисобланган бўлсин. Реалистик.
- Формат: "Гўшт — 400 г", "Пиёз — 2 та (ўртача)", "Туз — 1 ч.қ.".
- Камида 5 та масаллиқ.

ТАЙЁРЛАШ ҚАДАМЛАРИ
- Ҳар бир қадам — битта аниқ ҳаракат + натижани англатувчи аломат. Мисол: "Пиёзни ёғда сариққа айлангунча 5–7 дақиқа қовуринг".
- Камида 5 та қадам, охиргиси — дастурхонга тортиш ёки безаш.
- Содда, лекин керакли деталлар (вақт, олов даражаси, аломатлар) билан.

ВАҚТ ВА ҚИЙИНЛИК
- "time" — бутун тайёрлаш вақти. "difficulty": "Осон"|"Ўртача"|"Қийин".

ФОРМАТ
Фақат битта JSON ОБЪЕКТНИ қайтар (массив эмас), бошқа ҳеч нарса ёзма:
{
  "emoji": "${dish.emoji || '🍲'}",
  "name": "${dish.name}",
  "description": "Таъм/текстура (15-20 сўз)",
  "time": "X дақиқа ёки X соат Y дақиқа",
  "difficulty": "Осон|Ўртача|Қийин",
  "ingredients": ["Гўшт — 400 г", "Пиёз — 2 та"],
  "steps": ["1-қадам аниқ ҳаракат + аломат", "2-қадам", "..."]
}`;
  }

  async function findRecipes(opts) {
    if (selectedIngredients.length === 0) return;
    const bypassCache = !!(opts && opts.bypassCache);
    const excludeNames = (opts && Array.isArray(opts.excludeNames)) ? opts.excludeNames : [];

    const ckey = cacheKey(selectedIngredients, 'dishes');
    if (!bypassCache) {
      const cached = readCache(ckey);
      if (cached) {
        displayRecipes(cached);
        return;
      }
    }

    const loadingEl = document.getElementById('loading');
    const errorBox = document.getElementById('error-box');
    loadingEl.classList.add('active');
    errorBox.innerHTML = '';
    hideRegenerateButton();
    // Эски карталарни тозалаб, loading индикаторини кўринадиган жойга
    // суриб қўямиз — "Бошқа таклифлар"да юклаш аниқ билиниши учун.
    document.getElementById('recipes-grid').innerHTML = '';
    currentRecipes = [];
    loadingEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const prompt = buildSuggestionsPrompt(selectedIngredients, excludeNames);

    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        // Gemini 2.5 "thinking" режимини ўчириш — JSON генерацияси
        // учун ўйлаш керак эмас, тезлик сезиларли ошади (2.0 моделлар
        // бу майдонни инкор қилади, ҳеч муаммосиз).
        thinkingConfig: { thinkingBudget: 0 }
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
          if (isInsufficientResponse(parsed)) {
            if (renderedCount === 0) {
              loadingEl.classList.remove('active');
              renderInsufficient(parsed[0]);
            }
            recipes = parsed;
            renderedCount = parsed.length;
            continue;
          }
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
        if (isInsufficientResponse(finalParsed)) {
          if (renderedCount === 0) {
            loadingEl.classList.remove('active');
            renderInsufficient(finalParsed[0]);
          }
          recipes = finalParsed;
          renderedCount = finalParsed.length;
        } else if (finalParsed.length > renderedCount) {
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

    if (isInsufficientResponse(recipes)) {
      currentRecipes = [];
      hideRegenerateButton();
    } else if (recipes.length > 0) {
      currentRecipes = recipes;
      writeCache(ckey, recipes);
      showRegenerateButton();
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
    hideRegenerateButton();
    document.getElementById('results').classList.add('active');
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function showRegenerateButton() {
    const row = document.getElementById('regenerate-row');
    if (row) row.hidden = false;
  }

  function hideRegenerateButton() {
    const row = document.getElementById('regenerate-row');
    if (row) row.hidden = true;
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
    if (isInsufficientResponse(recipes)) {
      currentRecipes = [];
      const grid = document.getElementById('recipes-grid');
      grid.innerHTML = '';
      hideRegenerateButton();
      renderInsufficient(recipes[0]);
      return;
    }
    currentRecipes = recipes;
    const grid = document.getElementById('recipes-grid');
    grid.innerHTML = recipes.map((r, i) => recipeCardHtml(r, i)).join('');
    grid.querySelectorAll('.recipe-card').forEach(attachCardHandlers);
    showRegenerateButton();
    document.getElementById('results').classList.add('active');
    setTimeout(() => {
      document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }

  function hasFullRecipe(r) {
    return r && Array.isArray(r.steps) && r.steps.length > 0;
  }

  function showRecipe(index) {
    currentRecipeIndex = index;
    const r = currentRecipes[index];
    if (!r) return;
    if (hasFullRecipe(r)) {
      renderFullRecipe(r);
    } else {
      renderDishIntro(r);
    }
    document.getElementById('modal-overlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  // Тўлиқ рецепт кўриниши (масаллиқ миқдори + қадамлар)
  function renderFullRecipe(r) {
    const shareBtn = document.getElementById('modal-share-btn');
    if (shareBtn) shareBtn.hidden = !(navigator.share || navigator.clipboard);
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
  }

  // Таом ғояси кўриниши — порция танлаш + "Рецептни яратиш" тугмаси
  function renderDishIntro(r, errorMsg) {
    const shareBtn = document.getElementById('modal-share-btn');
    if (shareBtn) shareBtn.hidden = true; // рецепт ҳали йўқ — улашиш кераксиз
    const body = document.getElementById('modal-body');
    body.innerHTML = `
      <div class="modal-emoji">${esc(r.emoji || '🍽')}</div>
      <h2>${esc(tr(r.name))}</h2>
      <p class="modal-desc">${esc(tr(r.description))}</p>
      ${errorMsg ? `<div class="modal-error">⚠ ${esc(errorMsg)}</div>` : ''}

      <div class="modal-meta">
        <div class="modal-meta-item">
          <div class="label">${esc(tr(texts['time-label']))}</div>
          <div class="value">${esc(tr(r.time || '—'))}</div>
        </div>
        <div class="modal-meta-item">
          <div class="label">${esc(tr(texts['difficulty-label']))}</div>
          <div class="value">${esc(tr(r.difficulty || '—'))}</div>
        </div>
      </div>

      <div class="modal-servings">
        <span class="modal-servings-label">${esc(tr(texts['servings-label']))}</span>
        <div class="servings-control">
          <button class="servings-btn" id="modal-servings-minus" aria-label="-">−</button>
          <span class="servings-count" id="modal-servings-count">${servings}</span>
          <button class="servings-btn" id="modal-servings-plus" aria-label="+">+</button>
        </div>
      </div>

      <button class="btn-generate" id="modal-generate-btn" type="button">
        <span>${esc(tr(texts['generate-recipe']))}</span>
      </button>
    `;

    const minusBtn = document.getElementById('modal-servings-minus');
    const plusBtn = document.getElementById('modal-servings-plus');
    const countEl = document.getElementById('modal-servings-count');
    function syncModalServings() {
      minusBtn.disabled = servings <= SERVINGS_MIN;
      plusBtn.disabled = servings >= SERVINGS_MAX;
      countEl.textContent = servings;
    }
    minusBtn.addEventListener('click', () => {
      if (servings > SERVINGS_MIN) { servings--; syncModalServings(); }
    });
    plusBtn.addEventListener('click', () => {
      if (servings < SERVINGS_MAX) { servings++; syncModalServings(); }
    });
    syncModalServings();

    document.getElementById('modal-generate-btn')
      .addEventListener('click', () => generateRecipeForDish(currentRecipeIndex));
  }

  function renderModalLoading() {
    const body = document.getElementById('modal-body');
    body.innerHTML = `
      <div class="modal-generating">
        <div class="loading-progress" aria-hidden="true"></div>
        <p>${esc(tr(texts['generating']))}</p>
      </div>
    `;
  }

  // 2-БОСҚИЧ: танланган таомнинг тўлиқ рецептини сўраш ва кўрсатиш
  async function generateRecipeForDish(index) {
    const dish = currentRecipes[index];
    if (!dish) return;

    const rkey = cacheKey(selectedIngredients, 'recipe|' + recipeId(dish) + '|' + servings);
    const cached = readCache(rkey);
    if (cached) {
      currentRecipes[index] = cached;
      renderFullRecipe(cached);
      return;
    }

    renderModalLoading();

    const prompt = buildRecipePrompt(dish, selectedIngredients, servings);
    const requestBody = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }
      }
    };

    let recipe = null;
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
          const start = text.indexOf('{');
          const end = text.lastIndexOf('}');
          if (start !== -1 && end !== -1) text = text.substring(start, end + 1);
          try {
            const parsed = JSON.parse(text);
            if (parsed && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
              recipe = { ...dish, ...parsed };
            }
          } catch (e) {
            console.warn('Recipe parse error:', e);
          }
        }
      } else {
        console.warn('Recipe HTTP not OK:', response.status, data);
      }
    } catch (err) {
      console.warn('Recipe request failed:', err);
    }

    if (recipe) {
      currentRecipes[index] = recipe;
      writeCache(rkey, recipe);
      renderFullRecipe(recipe);
    } else {
      // Хато — таом ғояси кўринишига қайтариб, модал ичида хабар берамиз
      renderDishIntro(dish, tr(texts['api-error-busy']));
    }
  }

  function closeModal() {
    document.getElementById('modal-overlay').classList.remove('active');
    document.body.style.overflow = '';
    currentRecipeIndex = -1;
  }

  async function shareCurrentRecipe() {
    if (currentRecipeIndex === -1) return;
    const r = currentRecipes[currentRecipeIndex];
    if (!r || !hasFullRecipe(r)) return;
    const emoji = r.emoji || '🍽';
    const name = tr(r.name || '');
    const url = buildRecipeUrl(r);
    // Қисқа матн: эмоджи + ном. Тўлиқ рецептни оладиган одам
    // ҳаволани очиб кўради — Telegram'да узун матн чиқмайди.
    const shortText = `${emoji} ${name}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: name, text: shortText, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${shortText}\n${url}`);
        showError(tr(texts['copied-to-clipboard']));
      }
    } catch (err) {
      if (err && err.name !== 'AbortError') {
        console.warn('Share failed:', err);
      }
    }
  }

  // Рецептни URL hash'ига кодлаб солиш — фойдаланувчи ҳаволани улашганда,
  // ҳаволани очган одам худди ўша рецептни кўради.
  function encodeRecipe(recipe) {
    const minimal = {
      emoji: recipe.emoji,
      name: recipe.name,
      description: recipe.description,
      time: recipe.time,
      difficulty: recipe.difficulty,
      ingredients: recipe.ingredients,
      steps: recipe.steps
    };
    const json = JSON.stringify(minimal);
    const bytes = new TextEncoder().encode(json);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function decodeRecipe(encoded) {
    let str = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  }

  function buildRecipeUrl(recipe) {
    const base = window.location.origin + window.location.pathname + window.location.search;
    return base + '#r=' + encodeRecipe(recipe);
  }

  function openSharedRecipeFromHash() {
    const hash = window.location.hash || '';
    if (!hash.startsWith('#r=')) return;
    try {
      const recipe = decodeRecipe(hash.substring(3));
      if (!recipe || !recipe.name) return;
      currentRecipes = [recipe];
      showRecipe(0);
    } catch (err) {
      console.warn('Shared recipe decode failed:', err);
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Воқеа тингловчилари
  document.getElementById('btn-cyrillic').addEventListener('click', () => switchScript('cyrillic'));
  document.getElementById('btn-latin').addEventListener('click', () => switchScript('latin'));
  document.getElementById('btn-add-ingredient').addEventListener('click', addIngredient);

  document.getElementById('cook-btn').addEventListener('click', () => findRecipes());

  // "Бошқа таклифлар" — бир хил масаллиқлардан янги вариантлар сўраш.
  document.getElementById('regenerate-btn').addEventListener('click', () => {
    const previous = (currentRecipes || []).map(r => r && r.name).filter(Boolean);
    hideRegenerateButton();
    findRecipes({ bypassCache: true, excludeNames: previous });
  });

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

  // Улашилган рецепт ҳаволаси орқали очилган бўлса — дарҳол кўрсатиш
  openSharedRecipeFromHash();
  window.addEventListener('hashchange', openSharedRecipeFromHash);

  // PWA install promp'и — Chrome/Edge'нинг beforeinstallprompt ивенти тутилади,
  // фойдаланувчи "Кейинроқ"ни босса 14 кунгача яширилади.
  const INSTALL_DISMISS_KEY = 'ovqat_install_dismissed_at';
  const INSTALL_DISMISS_TTL = 14 * 24 * 60 * 60 * 1000;
  let deferredInstallPrompt = null;
  const installBanner = document.getElementById('install-banner');
  const installAction = document.getElementById('install-banner-action');
  const installClose = document.getElementById('install-banner-close');

  function isInstallDismissed() {
    const t = Number(localStorage.getItem(INSTALL_DISMISS_KEY) || 0);
    return t && (Date.now() - t < INSTALL_DISMISS_TTL);
  }

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
  }

  function showInstallBanner() {
    if (!installBanner) return;
    if (isStandalone()) return;
    if (isInstallDismissed()) return;
    installBanner.hidden = false;
  }

  function hideInstallBanner() {
    if (installBanner) installBanner.hidden = true;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    hideInstallBanner();
  });

  if (installAction) {
    installAction.addEventListener('click', async () => {
      if (!deferredInstallPrompt) {
        hideInstallBanner();
        return;
      }
      hideInstallBanner();
      try {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
      } catch (err) {
        console.warn('Install prompt failed:', err);
      }
      deferredInstallPrompt = null;
    });
  }

  if (installClose) {
    installClose.addEventListener('click', () => {
      localStorage.setItem(INSTALL_DISMISS_KEY, String(Date.now()));
      hideInstallBanner();
    });
  }

  // iOS Safari'да viewport user-scalable=no эътиборга олинмайди —
  // pinch ва double-tap zoom'ни JS орқали тўхтатамиз.
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });

  // Service Worker — оффлайн ишлаш ва тез юкланиш учун
  // (Network-first стратегияси: ҳар сафар янги версия олинади, кэш фонда)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // updateViaCache: 'none' — sw.js HTTP кэшни четлаб ўтиб ҳар сафар
      // янгидан текширилади (GitHub Pages'нинг 10 дақиқалик кэши таъсир қилмасин).
      navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
        .then((reg) => {
          // Саҳифа кўринувчи бўлганда (фойдаланувчи табга қайтганда) —
          // янги SW борлигини текшириш. Бу узоқ очиқ турган табларда
          // ҳам янгилашни тезлаштиради.
          const checkForUpdate = () => {
            if (document.visibilityState === 'visible') {
              reg.update().catch(() => {});
            }
          };
          document.addEventListener('visibilitychange', checkForUpdate);
          window.addEventListener('focus', checkForUpdate);
          // Узоқ очиқ турган таб учун соатига бир марта текшириш
          setInterval(checkForUpdate, 60 * 60 * 1000);
        })
        .catch((err) => {
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
