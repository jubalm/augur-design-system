import { useSyncExternalStore } from "react";

/**
 * Theme selection control for the docs shell (issue #7).
 *
 * Honors the `@augur/design-system` theme contract exactly
 * (`packages/design-system/src/styles/theme.css`):
 *
 *   - no `data-theme` attribute -> system preference governs via the
 *     package's `prefers-color-scheme` fallback scope (default state);
 *   - `[data-theme="light"]` pins light, even under a dark system;
 *   - `[data-theme="dark"]` selects dark for the whole document;
 *   - the attribute works on any container subtree (demonstrated on the
 *     Theming page), and this control only ever writes to `<html>`.
 *
 * The choice persists in localStorage under "augur-theme". A tiny inline
 * script in `BaseLayout.astro` re-applies it before first paint. The
 * persisted value is read through `useSyncExternalStore`, so the server
 * render and first client render agree (no hydration mismatch) and the
 * pressed state syncs from the external store after hydration without an
 * effect-driven render pass.
 */

type ThemeChoice = "system" | "light" | "dark";

const STORAGE_KEY = "augur-theme";
const CHANGE_EVENT = "augur-theme-change";

const CHOICES: readonly { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
] as const;

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  // Cross-tab synchronization: another tab writing localStorage re-syncs here.
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function readChoice(): ThemeChoice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    return "system";
  }
}

function getServerChoice(): ThemeChoice {
  return "system";
}

function applyChoice(choice: ThemeChoice): void {
  if (choice === "system") {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = choice;
  }
}

export function ThemeToggle() {
  const choice = useSyncExternalStore(subscribe, readChoice, getServerChoice);

  const select = (next: ThemeChoice) => {
    applyChoice(next);
    try {
      if (next === "system") {
        window.localStorage.removeItem(STORAGE_KEY);
      } else {
        window.localStorage.setItem(STORAGE_KEY, next);
      }
    } catch {
      // Storage unavailable (e.g. restrictive settings): the choice still
      // applies for this page view; persistence is best-effort.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <fieldset className="theme-toggle">
      <legend className="visually-hidden">Color theme</legend>
      {CHOICES.map((option) => (
        <button
          key={option.value}
          type="button"
          className="theme-toggle-option"
          aria-pressed={choice === option.value}
          onClick={() => select(option.value)}
        >
          {option.label}
        </button>
      ))}
    </fieldset>
  );
}

/** Astro islands consume the default export. */
export default ThemeToggle;
