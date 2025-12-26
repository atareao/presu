import { defineConfig } from 'i18next-cli';

export default defineConfig({
  locales: [
    "es",
    "va"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/assets/locales/{{language}}/{{namespace}}.json",
  }
});

