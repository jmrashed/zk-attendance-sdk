# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - 2026-07-26
### Fixed
- Fixed a bug where UDP real-time attendance events truncated the user ID
  to 1 byte, reporting the wrong user for any device UID above 255.
- `executeCmd` (and everything built on it — `setUser`, `deleteUser`,
  `restart`, `powerOff`, `clearAttendanceLog`, `enableDevice`,
  `disableDevice`, `setTime`, `connect`) now rejects with a `ZKError` when
  the device responds with an ACK-error code (`CMD_ACK_ERROR`,
  `CMD_ACK_UNAUTH`, etc.) instead of silently resolving.
  **Behavior change:** if your code relied on these calls always
  resolving, a rejected device command will now surface as a rejected
  promise. This was always a device-level error; it is no longer swallowed.

### Added
- Added an `exports`/`module` field to `package.json` so the existing
  ESM build (`dist/index.mjs`) is properly resolved by bundlers and
  native ESM.
- Added an injectable logger: pass a 5th constructor argument
  (`new ZKAttendanceClient(ip, port, timeout, inboundPort, logger)`) to
  route internal warnings/errors anywhere you like. The default is now a
  no-op — the SDK no longer writes `.err.log` files to the working
  directory unless you explicitly opt in with the exported `fileLogger`.
- Exported `ZKUserTcp`, `ZKUserUdp`, `ZKAttendanceRecordTcp`,
  `ZKAttendanceRecordUdp`, `ZKRealTimeLogTcp`, `ZKRealTimeLogUdp`, and
  `ZKDeviceInfo` types for use in consuming TypeScript code.

### Changed
- Corrected `engines.node` from `>=12.0.0` to `>=18.0.0` to match the
  package's actual runtime requirements (`node:net`/`node:dgram` imports).

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
