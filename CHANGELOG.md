# Changelog

All notable changes to this project will be documented in this file.

## [2.2.1] - 2026-07-26
### Fixed
- Fixed the release workflow: build `dist/` before publishing and skip
  pnpm's git-branch check, which failed on the detached HEAD checked
  out for release-triggered runs.
- Pinned CI pnpm version to 10 to match the `package.json` engines
  requirement.

## [2.2.0] - 2026-01-23
### Changed
- Improved constructor parameter documentation in the README.
- Removed the standalone `docs/` directory in favor of README documentation.

### Fixed
- Prevented `getUsers` timeouts and noisy disconnects.

### Added
- Additional test coverage for device interactions.

### Chore
- Disabled sourcemaps in the build output.

## [2.1.0] - 2025-11-09
### Added
- Migrated the SDK, helpers, tests, and examples to TypeScript.
- Real-time logging support finalized alongside the TypeScript migration.

### Chore
- Stopped tracking the `dist` folder and updated `.gitignore`.
- Switched the npm publish workflow to pnpm.

## [1.0.0] - 2025-10-02
### Added
- Initial release of the project.
- Core features implemented.
