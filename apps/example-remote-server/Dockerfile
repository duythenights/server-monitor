# ─── Stage: Node.js + Fluent Bit ──────────────────────────────────────────────
FROM node:20-bookworm-slim

# Install dependencies for Fluent Bit
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      curl \
      ca-certificates \
      gnupg \
    && rm -rf /var/lib/apt/lists/*

# Install Fluent Bit from official repo
RUN curl https://raw.githubusercontent.com/fluent/fluent-bit/master/install.sh | sh

# Set working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package.json ./
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate && pnpm install --no-frozen-lockfile --prod

# Copy application code
COPY index.js ./

# Copy Fluent Bit configuration
COPY fluent-bit/fluent-bit.conf /fluent-bit/etc/fluent-bit.conf
COPY fluent-bit/parsers.conf /fluent-bit/etc/parsers.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create logs directory
RUN mkdir -p /app/logs

# Expose the Express server port
EXPOSE 4000

ENTRYPOINT ["/entrypoint.sh"]
