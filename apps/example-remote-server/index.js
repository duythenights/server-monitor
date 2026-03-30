const express = require("express");
const winston = require("winston");
const path = require("path");

// ─── Winston Logger Setup ────────────────────────────────────────────────────

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      if (stack) {
        return `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}${metaStr}`;
      }
      return `${timestamp} [${level.toUpperCase()}]: ${message}${metaStr}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, "logs", "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "logs", "combined.log"),
    }),
  ],
});

// ─── Dummy Log Data Pools ────────────────────────────────────────────────────

const LOG_TEMPLATES = {
  info: [
    "User login successful",
    "Database connection established",
    "Cache refreshed successfully",
    "Health check passed",
    "Background job completed",
    "File upload processed",
    "Email notification sent",
    "Session token renewed",
    "API rate limit reset",
    "Scheduled backup completed",
  ],
  warn: [
    "High memory usage detected: {{value}}% utilized",
    "API response time exceeded threshold: {{value}}ms",
    "Disk space running low: {{value}}% remaining",
    "Database connection pool nearly exhausted: {{value}}/100 active",
    "Retry attempt {{value}} for external service call",
    "Deprecated API endpoint accessed: /api/v1/legacy",
    "SSL certificate expiring in {{value}} days",
    "Request queue depth growing: {{value}} pending",
    "Rate limit approaching: {{value}}% of quota used",
    "Stale cache entry detected for key: user_{{value}}",
  ],
  error: [
    "Failed to connect to database: connection timeout after {{value}}ms",
    "Unhandled exception in request handler",
    "Payment processing failed: gateway returned status {{value}}",
    "Authentication token validation failed for user_{{value}}",
    "File system write error: permission denied on /var/data",
    "External API returned unexpected status: {{value}}",
    "Memory allocation failure: heap out of memory",
    "Message queue consumer crashed unexpectedly",
    "DNS resolution failed for service endpoint",
    "TLS handshake failed: certificate mismatch",
  ],
  debug: [
    "Processing request: GET /api/users/{{value}}",
    "Cache lookup for key: session_{{value}}",
    "Query execution time: {{value}}ms",
    "Parsing config from environment variables",
    "WebSocket connection opened: client_{{value}}",
    "Middleware chain executed in {{value}}ms",
    "Serializing response payload: {{value}} bytes",
    "Garbage collection triggered: freed {{value}}MB",
  ],
};

const SERVICE_NAMES = [
  "auth-service",
  "payment-gateway",
  "user-service",
  "notification-engine",
  "file-processor",
  "analytics-worker",
  "cache-manager",
  "api-gateway",
];

const ERROR_STACKS = [
  `Error: ECONNREFUSED 127.0.0.1:5432
    at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1141:16)
    at Protocol._enqueue (node_modules/pg/lib/protocol.js:350:14)
    at Client.query (node_modules/pg/lib/client.js:225:25)
    at DatabaseService.executeQuery (src/services/database.js:42:18)`,

  `TypeError: Cannot read properties of undefined (reading 'id')
    at UserController.getProfile (src/controllers/user.js:28:32)
    at Layer.handle [as handle_request] (node_modules/express/lib/router/layer.js:95:5)
    at next (node_modules/express/lib/router/route.js:144:13)
    at Route.dispatch (node_modules/express/lib/router/route.js:114:3)`,

  `RangeError: Maximum call stack size exceeded
    at JSON.stringify (<anonymous>)
    at Serializer.serialize (src/utils/serializer.js:15:22)
    at Serializer.serialize (src/utils/serializer.js:18:14)
    at ResponseHandler.format (src/middleware/response.js:33:28)`,

  `Error: ENOMEM: not enough memory, cannot allocate 1073741824 bytes
    at Buffer.allocUnsafe (buffer.js:282:3)
    at FileProcessor.loadIntoMemory (src/services/file.js:67:20)
    at async FileController.upload (src/controllers/file.js:44:12)`,

  `Error: Request timeout after 30000ms
    at ClientRequest.<anonymous> (node_modules/axios/lib/adapters/http.js:292:14)
    at ClientRequest.emit (events.js:400:28)
    at Socket.emitRequestTimeout (internal/http/client.js:780:9)
    at ExternalAPIService.fetch (src/services/external-api.js:55:18)`,
];

// ─── Utility Functions ───────────────────────────────────────────────────────

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template) {
  return template.replace(/\{\{value\}\}/g, () => randomInt(1, 999));
}

function generateLogEntry() {
  // Weighted random level selection: info=40%, warn=25%, error=20%, debug=15%
  const roll = Math.random();
  let level;
  if (roll < 0.4) level = "info";
  else if (roll < 0.65) level = "warn";
  else if (roll < 0.85) level = "error";
  else level = "debug";

  const template = randomChoice(LOG_TEMPLATES[level]);
  const message = fillTemplate(template);
  const service = randomChoice(SERVICE_NAMES);

  const meta = {
    service,
    requestId: `req-${randomInt(10000, 99999)}`,
    pid: process.pid,
  };

  if (level === "error" && Math.random() > 0.4) {
    // Simulate an error with stack trace
    const fakeError = new Error(message);
    fakeError.stack = randomChoice(ERROR_STACKS);
    logger.error(message, { ...meta, stack: fakeError.stack });
  } else {
    logger[level](message, meta);
  }
}

// ─── Dummy Log Generator (Random Intervals) ─────────────────────────────────

let generatorRunning = true;

function scheduleNextLog() {
  if (!generatorRunning) return;

  const delayMs = randomInt(500, 5000); // random interval between 0.5s and 5s
  setTimeout(() => {
    generateLogEntry();
    scheduleNextLog();
  }, delayMs);
}

// ─── Express Application ────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// Home / health check
app.get("/", (req, res) => {
  logger.info("Health check endpoint hit", { service: "api-gateway" });
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    generatorRunning,
  });
});

// Trigger a burst of erroneous logs
app.post("/errors", (req, res) => {
  const count = Math.min(req.body?.count || 5, 50); // default 5, max 50

  logger.warn(`Error burst requested: generating ${count} error logs`, {
    service: "api-gateway",
    requestId: `req-${randomInt(10000, 99999)}`,
  });

  for (let i = 0; i < count; i++) {
    const template = randomChoice(LOG_TEMPLATES.error);
    const message = fillTemplate(template);
    const service = randomChoice(SERVICE_NAMES);
    const fakeError = new Error(message);
    fakeError.stack = randomChoice(ERROR_STACKS);

    logger.error(message, {
      service,
      requestId: `req-${randomInt(10000, 99999)}`,
      pid: process.pid,
      stack: fakeError.stack,
      burst: true,
      burstIndex: i + 1,
      burstTotal: count,
    });
  }

  res.json({
    message: `Generated ${count} error log entries`,
    timestamp: new Date().toISOString(),
  });
});

// Trigger a single specific error type
app.get("/errors/crash", (req, res) => {
  logger.error("CRITICAL: Application crash simulation triggered", {
    service: "api-gateway",
    requestId: `req-${randomInt(10000, 99999)}`,
    pid: process.pid,
    stack: randomChoice(ERROR_STACKS),
    severity: "CRITICAL",
  });

  logger.error("Uncaught exception: process exiting with code 1", {
    service: "api-gateway",
    pid: process.pid,
    exitCode: 1,
  });

  res.status(500).json({
    error: "Simulated crash logged",
    timestamp: new Date().toISOString(),
  });
});

// Trigger a cascade of mixed warnings and errors (simulates degradation)
app.get("/errors/cascade", (req, res) => {
  const stages = [
    { level: "warn", msg: "Elevated latency detected on primary database" },
    { level: "warn", msg: "Connection pool usage at 85%" },
    { level: "error", msg: "Database query timeout after 30000ms" },
    { level: "error", msg: "Failover initiated to replica database" },
    { level: "warn", msg: "Running on degraded database — read-only mode" },
    { level: "error", msg: "Write operation rejected: database is read-only" },
    { level: "error", msg: "Multiple user requests failed — 503 returned" },
  ];

  stages.forEach((stage, index) => {
    setTimeout(() => {
      logger[stage.level](stage.msg, {
        service: "database-service",
        requestId: `req-${randomInt(10000, 99999)}`,
        cascadeStep: index + 1,
        cascadeTotal: stages.length,
      });
    }, index * 800); // stagger logs 800ms apart
  });

  res.json({
    message: `Cascade of ${stages.length} degradation logs started (will complete in ~${stages.length * 0.8}s)`,
    timestamp: new Date().toISOString(),
  });
});

// Toggle the background log generator on/off
app.post("/generator/toggle", (req, res) => {
  generatorRunning = !generatorRunning;
  if (generatorRunning) {
    scheduleNextLog();
    logger.info("Dummy log generator RESUMED");
  } else {
    logger.info("Dummy log generator PAUSED");
  }

  res.json({
    generatorRunning,
    message: generatorRunning ? "Generator resumed" : "Generator paused",
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  logger.info(`🚀 Remote server started on port ${PORT}`, {
    service: "api-gateway",
    pid: process.pid,
  });

  // Start the background dummy log generator
  logger.info("Starting dummy log generator...");
  scheduleNextLog();
});
