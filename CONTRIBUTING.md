# Contributing

Thanks for helping. A few ground rules keep this project safe for everyone to use freely.

## Originality and licensing

This library is **inspired by** modern mobile design. It is not affiliated with, endorsed by, or derived from any
company's proprietary software or assets. When you contribute:

- **Do not add** fonts, icons, images, screenshots, wallpapers, view dumps or any other files copied or exported
  from Apple (or any other vendor's) operating systems, SDKs, simulators, apps or design kits.
- **Do not add** text copied from vendor design guidelines or documentation. Write your own words.
- **Do not add** code or values obtained by inspecting private or undocumented APIs.
- Icons must come from an open set whose licence allows redistribution (the built-in set is Lucide, ISC) or be
  drawn by you from scratch.
- Only contribute work you have the right to license under the MIT licence of this project.
- Avoid third-party trademarks in names, prose and examples (use "phone", "glass", "system font" etc.).

By opening a pull request you agree that your contribution is licensed under the project's MIT licence.

## Development

```bash
npm install
npm run dev          # playground
npm run typecheck
npm run validate
npm run catalog      # regenerate catalog.json from docs/catalog-parts
```

Components follow the rules in [docs/CONVENTIONS.md](docs/CONVENTIONS.md): props only, scoped CSS, logical properties, tokens, accessibility.
