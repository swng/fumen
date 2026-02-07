/**
 * This module provides a safe, extensible pattern for saving and loading
 * application settings from localStorage.
 *
 * Features:
 * - Creates isolated settings handlers bound to a specific localStorage key
 * - New keys added to defaults are automatically picked up
 * - Missing or invalid stored data is handled safely
 * - Internal functions and state are private
 * - Public API is exposed via `window.createSettings` for browser compatibility
 * - Settings cannot get corrupted. If JSON.parse fails to parse a localStorage key, it will be overwritten by default settings.
 *
 * Example usage:
 * --------------------------------
 * // settings.js (this module, loaded via <script>)
 *
 * const defaultSettings = {
 *     language: 'english',
 *     theme: 'dark',
 * };
 *
 * const settings = window.createSettings('app_settings', defaultSettings);
 *
 * // Load settings (merged with defaults)
 * const current = settings.load();
 *
 * // Save partial updates
 * settings.save({ language: 'japanese' });
 *
 * // Reset to defaults
 * settings.reset();
 */

(() => {
    'use strict';

    /**
     * Safely parse JSON from localStorage
     * -----------------------------------
     * Returns an empty object if:
     * - localStorage is unavailable
     * - the key does not exist
     * - the stored value is invalid JSON
     * 
     * Logs warnings to the console when any of the above occur.
     */
    const safeParse = (key) => {
        if (typeof window === 'undefined' || !window.localStorage) {
            console.warn(`localStorage is not available. Cannot read key "${key}".`);
            return {};
        }

        const raw = localStorage.getItem(key);
        if (!raw) {
            console.warn(`No data found in localStorage for key "${key}".`);
            return {};
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn(
                `Failed to parse localStorage key "${key}". The stored value was invalid JSON.`,
                error
            );
            return {};
        }
    };

    /**
     * Creates a settings instance bound to a storage key.
     */
    const createSettings = (storageKey, defaultSettings) => {

        /**
         * Load settings from localStorage
         * --------------------------------
         * - Merges stored values with defaults
         * - Ensures newly added default keys are included
         * - Writes the merged result back to localStorage
         */
        const load = () => {
            const stored = safeParse(storageKey);

            const merged = {
                ...defaultSettings,
                ...stored,
            };

            localStorage.setItem(storageKey, JSON.stringify(merged));

            return merged;
        };

        /**
         * Save settings to localStorage
         * --------------------------------
         * Accepts a partial settings object and merges it
         * with the current stored settings.
         */
        const save = (updates) => {
            const current = load();

            const merged = {
                ...current,
                ...updates,
            };

            localStorage.setItem(storageKey, JSON.stringify(merged));

            return merged;
        };

        /**
         * Reset settings back to defaults
         * --------------------------------
         */
        const reset = () => {
            localStorage.setItem(
                storageKey,
                JSON.stringify(defaultSettings)
            );

            return { ...defaultSettings };
        };

        /**
         * Public API
         */
        return {
            load,
            save,
            reset,
        };
    };

    /**
     * Exposed on the `window` object rather than as a module, to maximize compatibility 
     * with direct file access (file://). This allows users to run the application 
     * locally by simply opening the HTML file in a browser, without requiring a
     * local web server or module bundler.
     */
    window.createSettings = createSettings;
})();