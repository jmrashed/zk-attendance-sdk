# Contributing to zk-attendance-sdk

Thank you for your interest in contributing to zk-attendance-sdk!

## How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Requirements

- Node.js (see `package.json` for the supported version)
- pnpm

## Development Setup

```bash
git clone https://github.com/jmrashed/zk-attendance-sdk.git
cd zk-attendance-sdk
pnpm install
pnpm build
```

## Testing

```bash
pnpm test
```

### Test Configuration (.env)

Jest loads environment variables from `.env` automatically for tests.

- Create or edit `.env` in the project root.
- Optionally create `.env.test` (it takes precedence over `.env`).
- Values already set in your shell/CI are not overridden.

#### Device Integration Tests

Device tests are skipped unless enabled.

```bash
# required
ZK_DEVICE_IP=
```

Optional:

```bash
ZK_DEVICE_PORT=
ZK_DEVICE_TIMEOUT=
ZK_DEVICE_INBOUND_PORT=
```

#### User Checks

```bash
# Smoke-check GET_USERS (no printing)
ZK_DEVICE_TEST_USERS=1

# Print enrolled users
ZK_DEVICE_LIST_USERS=1
```

Optional (empty/0 prints all):

```bash
ZK_DEVICE_LIST_USERS_LIMIT=
```

## Code Style

- Use consistent indentation (2 spaces)
- Follow existing code patterns
- Add comments for complex logic

## Reporting Issues

Please use the GitHub issue tracker to report bugs or request features.
