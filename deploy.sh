#!/usr/bin/env bash
# keremozdogan.com deploy — sunucuda: git pull -> docker build -> up -> caddy site -> doğrula
# Kullanım: ./deploy.sh              (pull + build + up)
#           ./deploy.sh --no-pull    (pull yapmadan)
set -euo pipefail
cd "$(dirname "$0")"
PULL=1
for a in "$@"; do
  case "$a" in
    --no-pull) PULL=0 ;;
    *) echo "bilinmeyen arg: $a"; exit 1 ;;
  esac
done
[ "$PULL" = 1 ] && git pull --ff-only

docker compose build
docker compose up -d --remove-orphans
docker image prune -f >/dev/null

# Caddy site bloğu değiştiyse paylaşılan Caddy'ye kopyala + reload (root gerekir)
SITE=/etc/caddy/sites/keremozdogan.com.caddy
if ! cmp -s deploy/Caddyfile "$SITE" 2>/dev/null; then
  if [ "$(id -u)" != 0 ]; then echo "deploy/Caddyfile değişmiş; caddy güncellemesi için root ile çalıştırın (site yine de güncellendi)"; exit 0; fi
  install -m 640 -o root -g caddy deploy/Caddyfile "$SITE"
  caddy validate --config /etc/caddy/Caddyfile >/dev/null 2>&1 || { caddy validate --config /etc/caddy/Caddyfile; exit 1; }
  chown -R caddy:caddy /var/log/caddy   # validate root olarak log dosyasını root:root açabiliyor
  systemctl reload caddy
  echo "caddy site güncellendi"
fi

sleep 2
curl -s -o /dev/null -w "web:  %{http_code}\n" http://127.0.0.1:8780/
curl -sk --resolve keremozdogan.com:443:127.0.0.1 -o /dev/null -w "site: %{http_code}\n" https://keremozdogan.com/ || true
