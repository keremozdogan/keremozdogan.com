# keremozdogan.com

Kerem Özdoğan'ın oynanabilir 8-bit platform oyunu şeklindeki portfolyo sitesi. React + Vite, oyun motoru yok;
level, sprite'lar ve chiptune müzik tamamen kodda. Tüm site içeriği `src/data/content.ts` dosyasında.

## Lokal geliştirme

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ — push'tan önce derlemenin geçtiğini kontrol et
npm run typecheck
```

## Canlı ortam

- Adres: https://keremozdogan.com (`www` ve `http` → `https://keremozdogan.com` yönlendirilir).
- Sunucuda proje dizini: `/opt/keremozdogan.com` (yalnızca root ve `keremozdogan` kullanıcısı erişebilir).
- Docker: `Dockerfile` siteyi derleyip nginx ile sunar; `docker-compose.yml` container'ı `127.0.0.1:8780`'e bağlar.
- Önündeki Caddy HTTPS sertifikasını otomatik alır/yeniler. Site bloğu: `deploy/Caddyfile`.
- `.env` yok: site tamamen statik, gizli bilgi gerektirmez.
- Sunucu adresi ve erişim bilgileri bu repoda tutulmaz; proje sahibinde.

## Güncelleme akışı (push → pull → deploy)

1. Lokalde değişikliği yap, `npm run build` ile kontrol et, `main`'e commit + push et.
2. Sunucuya **agent forwarding ile** bağlan (sunucu GitHub'dan senin SSH anahtarınla çeker):
   ```bash
   ssh -A keremozdogan@<sunucu>
   ```
3. Kodu çek ve canlıya al:
   ```bash
   cd /opt/keremozdogan.com
   git pull --ff-only
   sudo projctl keremozdogan deploy --no-pull   # docker build → up → sağlık kontrolü (web: 200)
   ```
4. Diğer komutlar:
   ```bash
   sudo projctl keremozdogan ps              # container durumu
   sudo projctl keremozdogan logs web 200    # son 200 satır log
   sudo projctl keremozdogan restart web
   ```

Notlar:
- Doğrudan `docker` komutu yetkisi yok; container işlemleri `sudo projctl keremozdogan ...` üzerinden.
- `deploy/Caddyfile` değiştiyse Caddy güncellemesi root yetkisi ister; proje sahibine haber ver.
- Sunucuda dosya düzenleme yapma; her değişiklik GitHub üzerinden gelsin.
