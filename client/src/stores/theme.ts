import { computed, ref, watch } from 'vue';
import { defineStore } from 'pinia';

type ThemePreference = 'light' | 'dark' | 'system';
type ThemeValue = 'light' | 'dark';

const STORAGE_KEY = 'heartbeat-theme-preference';

const isWindow = typeof window !== 'undefined';
const isDocument = typeof document !== 'undefined';

function readStoredPreference(): ThemePreference {
  if (!isWindow) {
    return 'system';
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

function setupSystemThemeListener(callback: (value: ThemeValue) => void) {
  if (!isWindow || typeof window.matchMedia !== 'function') {
    return;
  }
  const query = window.matchMedia('(prefers-color-scheme: dark)');
  const update = (value: boolean) => {
    callback(value ? 'dark' : 'light');
  };
  update(query.matches);

  const listener = (event: MediaQueryListEvent) => {
    update(event.matches);
  };

  if (typeof query.addEventListener === 'function') {
    query.addEventListener('change', listener);
  } else if (typeof (query as MediaQueryList).addListener === 'function') {
    (query as MediaQueryList).addListener(listener);
  }
}

export const useThemeStore = defineStore('theme', () => {
  const preference = ref<ThemePreference>(readStoredPreference());
  const systemTheme = ref<ThemeValue>('light');

  setupSystemThemeListener((value) => {
    systemTheme.value = value;
  });

  const currentTheme = computed<ThemeValue>(() =>
    preference.value === 'system' ? systemTheme.value : preference.value
  );

  watch(
    preference,
    (value) => {
      if (isWindow) {
        window.localStorage.setItem(STORAGE_KEY, value);
      }
    },
    { immediate: true }
  );

  watch(
    currentTheme,
    (value) => {
      if (!isDocument) return;
      document.documentElement.dataset.theme = value;
      document.documentElement.style.colorScheme = value;
    },
    { immediate: true }
  );

  const preferenceLabel = computed(() => {
    if (preference.value === 'system') return '跟随系统';
    return preference.value === 'dark' ? '深色模式' : '浅色模式';
  });

  const preferenceIcon = computed(() => {
    if (preference.value === 'system') {
      return currentTheme.value === 'dark' ? '🌓' : '🌗';
    }
    return preference.value === 'dark' ? '🌙' : '☀️';
  });

  function setPreference(value: ThemePreference) {
    preference.value = value;
  }

  function cyclePreference() {
    const next: ThemePreference =
      preference.value === 'light'
        ? 'dark'
        : preference.value === 'dark'
        ? 'system'
        : 'light';
    setPreference(next);
  }

  return {
    preference,
    currentTheme,
    preferenceLabel,
    preferenceIcon,
    setPreference,
    cyclePreference
  };
});
