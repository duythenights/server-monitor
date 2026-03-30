# Example Remote Server

A dummy log generator and Express API for testing server monitoring tools. Uses **Winston** for structured logging and produces realistic log output at random intervals.

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the server (default port 4000)
node index.js

# Or with a custom port
PORT=5000 node index.js
```

## Features

- **Background log generator** — continuously produces `info`, `warn`, `error`, and `debug` logs at random intervals (0.5s–5s)
- **Weighted log levels** — info 40%, warn 25%, error 20%, debug 15%
- **Realistic log content** — templated messages with random values, service names, request IDs, and simulated stack traces
- **Winston transports** — logs to console + `logs/error.log` + `logs/combined.log`

## API Endpoints

| Method | Endpoint             | Description                                          |
| ------ | -------------------- | ---------------------------------------------------- |
| GET    | `/`                  | Health check — returns uptime and generator status   |
| POST   | `/errors`            | Trigger a burst of error logs                        |
| GET    | `/errors/crash`      | Simulate a critical crash (two error log entries)    |
| GET    | `/errors/cascade`    | Simulate cascading service degradation (7 staggered logs) |
| POST   | `/generator/toggle`  | Pause or resume the background log generator         |

### Examples

**Trigger an error burst** (default 5 errors):

```bash
curl -X POST http://localhost:4000/errors
```

**Trigger 20 errors at once:**

```bash
curl -X POST http://localhost:4000/errors \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'
```

**Simulate a crash:**

```bash
curl http://localhost:4000/errors/crash
```

**Simulate cascading degradation:**

```bash
curl http://localhost:4000/errors/cascade
```

**Toggle background generator on/off:**

```bash
curl -X POST http://localhost:4000/generator/toggle
```

## Log Output

Logs are written to:

| File                | Contents              |
| ------------------- | --------------------- |
| `logs/combined.log` | All log levels        |
| `logs/error.log`    | Error-level logs only |
| Console (stdout)    | All log levels        |

### Sample log format

```
2026-03-30 14:02:31 [ERROR]: Failed to connect to database: connection timeout after 742ms
Error: ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)
    at Protocol._enqueue (node_modules/pg/lib/protocol.js:350:14)
 {"service":"payment-gateway","requestId":"req-38291","pid":12345}
```

## Dependencies

- [express](https://expressjs.com/) — Web framework
- [winston](https://github.com/winstonjs/winston) — Logging library
