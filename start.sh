#!/bin/sh

# 1. Jalankan cloudflared tunnel di latar belakang (background)
echo "Menyalakan Cloudflared Tunnel TCP..."
cloudflared access tcp --hostname db.walldev.my.id --url 127.0.0.1:3307 &

# 2. Beri waktu 3 detik agar tunnel benar-benar terbuka sebelum Next.js nyala
sleep 3

# 3. Nyalakan server Next.js LibrariAI
echo "Menyalakan Next.js..."
exec node server.js