# Stage 1: Install dependencies
FROM python:3.12-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Runtime image
FROM python:3.12-slim AS runtime

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy bot source
COPY bot/ ./bot/
COPY config/ ./config/

# Run as non-root
RUN useradd -m -u 1000 botuser && chown -R botuser /app
USER botuser

ENTRYPOINT ["python", "-m", "bot.main"]
