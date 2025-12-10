# Changelog

## 0.2.0 (2025-12-10)

### ✨ Features

- **website:** build official ZenJS website with complete feature showcase ([f274fa7](https://github.com/SylphxAI/zenjs/commit/f274fa7277622256272fccf71b3ec882311b130c))
- integrate @sylphx/zen as reactive core ([2428136](https://github.com/SylphxAI/zenjs/commit/24281361203d5e509ba7474e44b3e5817583144e))
- ZenJS reactive framework with performance optimizations ([fb8def6](https://github.com/SylphxAI/zenjs/commit/fb8def6be0fdd910f53f6c692663334f35ddb855))

### 🐛 Bug Fixes

- **router:** defer effect with queueMicrotask for proper DOM insertion ([7b5ddc5](https://github.com/SylphxAI/zenjs/commit/7b5ddc5a29610db1d963a09e7c52f7adb954c6bc))
- **router:** use effect for reactive route rendering ([3f14bf2](https://github.com/SylphxAI/zenjs/commit/3f14bf2e81a9c076e7df5047bfd2cfa894be7f37))
- **router:** add SSR/test compatibility with window checks ([0e3d17d](https://github.com/SylphxAI/zenjs/commit/0e3d17d65da7103500428a4b6fc084bc35757cf9))
- correct isReactive check for @sylphx/zen signals ([f5c1312](https://github.com/SylphxAI/zenjs/commit/f5c1312ddbc52fc918101d2637612d368dc98e57))
- update components to import from @sylphx/zen ([60c87f5](https://github.com/SylphxAI/zenjs/commit/60c87f5332294f33e3dc2b04f9494db7be811c3b))
- change stats() to stats.value in demo app ([fd546b7](https://github.com/SylphxAI/zenjs/commit/fd546b7692104548ffc8c8cd7ad8a1c163a75d92))
- remove unverified framework comparisons ([c29588f](https://github.com/SylphxAI/zenjs/commit/c29588f57156f0bc0a407ae253742b38e0f0df35))

### ♻️ Refactoring

- 💥 change to .value API (Vue 3 / Preact style) ([0292bbd](https://github.com/SylphxAI/zenjs/commit/0292bbd5fef0036ee0920c33ba6523b95c416716))

### 📚 Documentation

- update README to reflect @sylphx/zen integration ([f63c35a](https://github.com/SylphxAI/zenjs/commit/f63c35a9a499f9c060e0990e2e19f67775197815))
- add optimization completion report ([69fe29c](https://github.com/SylphxAI/zenjs/commit/69fe29ce2e349a813def85f4c0c32a7f3e670059))
- update README with real benchmark results ([d171785](https://github.com/SylphxAI/zenjs/commit/d17178519961d54731221e4e7e524bfa38a22717))
- add comprehensive performance benchmarks ([fd6e783](https://github.com/SylphxAI/zenjs/commit/fd6e783e74f78af6084f6ff67bf526f0b795262d))

### 🔧 Chores

- **ci:** add unified release.yml workflow ([2de5646](https://github.com/SylphxAI/zenjs/commit/2de5646786a3190d9675d5eb404c8d13bfb46317))
- update to @sylphx/zen v3.49.2 ([27197e1](https://github.com/SylphxAI/zenjs/commit/27197e198d7d084c20c807b5e308ce8b85f2b632))

### 💥 Breaking Changes

- change to .value API (Vue 3 / Preact style) ([0292bbd](https://github.com/SylphxAI/zenjs/commit/0292bbd5fef0036ee0920c33ba6523b95c416716))
  Signal 和 Computed API 改變
