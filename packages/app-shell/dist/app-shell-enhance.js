/* @achoo254/app-shell 0.5.0 app-shell-enhance.js: theme switch and account menu of server-rendered pages (README, "Trang dựng trên server"). MIT. */
"use strict";
(() => {
  // src/account-menu-behavior.ts
  function wireAccountMenu(menu) {
    const summary = menu.querySelector("summary");
    const close = () => {
      menu.open = false;
    };
    const onPointerDown = (event) => {
      if (menu.open && !menu.contains(event.target)) close();
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape" || !menu.open) return;
      close();
      summary?.focus();
    };
    const onFocusOut = (event) => {
      const next = event.relatedTarget;
      if (next instanceof Node && !menu.contains(next)) close();
    };
    const onClick2 = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest("a.shell-account-item, button.shell-account-item")) {
        if (target.closest('button[type="submit"]')) return;
        close();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    menu.addEventListener("focusout", onFocusOut);
    menu.addEventListener("click", onClick2);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      menu.removeEventListener("focusout", onFocusOut);
      menu.removeEventListener("click", onClick2);
    };
  }

  // ../brand/dist/hosts.js
  var DOMAIN_PATTERN = /^([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;

  // src/locale.ts
  var SHELL_LOCALES = ["vi", "en", "zh-CN"];
  var DEFAULT_SHELL_LOCALES = ["vi", "en"];
  function localeOfPrimary(primary) {
    if (primary === "vi") return "vi";
    if (primary === "en") return "en";
    if (primary === "zh") return "zh-CN";
    return void 0;
  }
  function matchShellLocale(tag, locales = DEFAULT_SHELL_LOCALES) {
    if (typeof tag !== "string") return void 0;
    const locale = localeOfPrimary(tag.trim().toLowerCase().split(/[-_]/)[0]);
    return locale !== void 0 && locales.includes(locale) ? locale : void 0;
  }

  // src/preferences.ts
  var THEME_PREFERENCES = [
    "light",
    "dark",
    "system"
  ];
  var PREFERENCE_KEYS = {
    lang: "hd_lang",
    theme: "hd_theme"
  };
  var MAX_AGE_SECONDS = 365 * 24 * 60 * 60;
  var browser;
  function browserEnvironment() {
    if (typeof document === "undefined" || typeof location === "undefined") {
      return void 0;
    }
    browser ?? (browser = {
      protocol: location.protocol,
      hostname: location.hostname,
      readCookies: () => document.cookie,
      writeCookie: (cookie) => {
        document.cookie = cookie;
      },
      storage: () => {
        try {
          return window.localStorage;
        } catch {
          return void 0;
        }
      },
      memory: /* @__PURE__ */ new Map()
    });
    return browser;
  }
  function isThemePreference(value) {
    return value === "light" || value === "dark" || value === "system";
  }
  var PARSERS = {
    lang: (raw) => matchShellLocale(raw, SHELL_LOCALES),
    theme: (raw) => isThemePreference(raw) ? raw : void 0
  };
  function parse(name, raw) {
    if (raw === null || raw === void 0) return void 0;
    const parser = PARSERS[name];
    return parser(raw);
  }
  function cookieDomainFor(hostname, domain) {
    if (!DOMAIN_PATTERN.test(domain)) return void 0;
    const host = hostname.toLowerCase().replace(/\.$/, "");
    return host === domain || host.endsWith(`.${domain}`) ? domain : void 0;
  }
  function cookiesApply(env) {
    return env.protocol === "https:" || env.protocol === "http:";
  }
  function preferenceCookie(name, value, env, domain) {
    const parts = [
      `${PREFERENCE_KEYS[name]}=${encodeURIComponent(value)}`,
      "Path=/",
      `Max-Age=${MAX_AGE_SECONDS}`,
      "SameSite=Lax"
    ];
    const cookieDomain = cookieDomainFor(env.hostname, domain);
    if (cookieDomain) parts.push(`Domain=${cookieDomain}`);
    if (env.protocol === "https:") parts.push("Secure");
    return parts.join("; ");
  }
  function readCookie(cookies, key) {
    for (const part of cookies.split(";")) {
      const index = part.indexOf("=");
      if (index < 0 || part.slice(0, index).trim() !== key) continue;
      try {
        return decodeURIComponent(part.slice(index + 1).trim());
      } catch {
        return void 0;
      }
    }
    return void 0;
  }
  function readStorage(storage, key) {
    if (!storage || !key) return null;
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }
  function writeStorage(storage, key, value) {
    if (!storage) return false;
    try {
      storage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }
  function readOne(name, accept, env, legacyKey) {
    const key = PREFERENCE_KEYS[name];
    const storage = env.storage();
    return (cookiesApply(env) ? accept(readCookie(env.readCookies(), key)) : void 0) ?? accept(readStorage(storage, key)) ?? accept(env.memory.get(name)) ?? accept(readStorage(storage, legacyKey));
  }
  function readPreferences(options, env = browserEnvironment()) {
    if (!env) return { lang: void 0, theme: "system" };
    const locales = options.locales ?? DEFAULT_SHELL_LOCALES;
    return {
      lang: readOne(
        "lang",
        (raw) => matchShellLocale(raw, locales),
        env,
        options.legacyLangKey
      ),
      theme: readOne(
        "theme",
        (raw) => parse("theme", raw),
        env,
        options.legacyThemeKey
      ) ?? "system"
    };
  }
  var listeners = /* @__PURE__ */ new Set();
  function notify() {
    for (const listener of [...listeners]) listener();
  }
  function writePreference(name, value, options, env = browserEnvironment()) {
    if (parse(name, value) !== value) {
      throw new RangeError(`app-shell: "${String(value)}" is not a ${name}`);
    }
    if (!env) return;
    const key = PREFERENCE_KEYS[name];
    let stored = false;
    if (cookiesApply(env)) {
      env.writeCookie(preferenceCookie(name, value, env, options.domain));
      stored = readCookie(env.readCookies(), key) === value;
    }
    if (!stored) stored = writeStorage(env.storage(), key, value);
    if (stored) env.memory.delete(name);
    else env.memory.set(name, value);
    notify();
  }
  function onVisible() {
    if (document.visibilityState === "visible") notify();
  }
  function subscribePreferences(listener) {
    listeners.add(listener);
    if (listeners.size === 1 && typeof window !== "undefined") {
      window.addEventListener("focus", notify);
      document.addEventListener("visibilitychange", onVisible);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && typeof window !== "undefined") {
        window.removeEventListener("focus", notify);
        document.removeEventListener("visibilitychange", onVisible);
      }
    };
  }
  function applyTheme(theme, root) {
    const element = root ?? (typeof document === "undefined" ? void 0 : document.documentElement);
    if (!element) return;
    if (theme === "system") element.removeAttribute("data-theme");
    else element.setAttribute("data-theme", theme);
  }

  // src/app-shell-enhance.ts
  var SWITCH = '[data-id="theme-switch"]';
  function storedTheme() {
    return readPreferences({ domain: "" }).theme;
  }
  function isTheme(value) {
    return THEME_PREFERENCES.includes(value);
  }
  function syncSwitches(theme) {
    for (const button of document.querySelectorAll(
      `${SWITCH} button[value]`
    )) {
      button.setAttribute("aria-pressed", String(button.value === theme));
    }
  }
  function follow() {
    const theme = storedTheme();
    applyTheme(theme);
    syncSwitches(theme);
  }
  function onClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest(`${SWITCH} button[value]`);
    const fieldset = button?.closest(SWITCH);
    if (!button || !fieldset || !isTheme(button.value)) return;
    try {
      writePreference("theme", button.value, {
        domain: fieldset.dataset.domain ?? ""
      });
    } finally {
      applyTheme(button.value);
      syncSwitches(button.value);
    }
  }
  function wireAccountMenus() {
    for (const menu of document.querySelectorAll(
      'details[data-id="account-menu"]'
    )) {
      wireAccountMenu(menu);
    }
  }
  function start() {
    const root = document.documentElement;
    if (root.hasAttribute("data-shell-enhanced")) return;
    root.setAttribute("data-shell-enhanced", "");
    applyTheme(storedTheme());
    document.addEventListener("click", onClick);
    subscribePreferences(follow);
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          follow();
          wireAccountMenus();
        },
        { once: true }
      );
    } else {
      follow();
      wireAccountMenus();
    }
  }
  start();
})();
