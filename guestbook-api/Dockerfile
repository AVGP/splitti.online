# syntax=docker/dockerfile:1

FROM golang:1.26-alpine AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY main.go ./

RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/guestbook .

FROM alpine:3.21

RUN addgroup -S guestbook && adduser -S -G guestbook guestbook \
    && mkdir -p /data \
    && chown -R guestbook:guestbook /data

COPY --from=builder /out/guestbook /usr/local/bin/guestbook

ENV PORT=8080 \
    DB_PATH=/data/guestbook.db \
    ALLOWED_ORIGINS=https://splitti.online,https://www.splitti.online

VOLUME ["/data"]
EXPOSE 8080

USER guestbook

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD ["/usr/local/bin/guestbook", "-healthcheck"]

ENTRYPOINT ["/usr/local/bin/guestbook"]
