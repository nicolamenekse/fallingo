# 🔮 Fallingo Backend

AI destekli fal uygulaması - Node.js + Express + MongoDB + OpenAI

## Kurulum

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/auth/register` | Kayıt ol |
| POST | `/api/auth/login` | Giriş yap |
| POST | `/api/auth/refresh-token` | Token yenile |
| POST | `/api/auth/logout` | Çıkış yap |
| GET | `/api/auth/me` | Profil bilgisi |
| PUT | `/api/auth/profile` | Profili güncelle |
| PUT | `/api/auth/change-password` | Şifre değiştir |

### Fal (Fortune)
| Method | Endpoint | Açıklama | Plan |
|--------|----------|----------|------|
| POST | `/api/fortune/coffee` | Kahve falı | Free |
| POST | `/api/fortune/palm` | El falı | Premium |
| POST | `/api/fortune/tarot` | Tarot falı | Premium |
| POST | `/api/fortune/horoscope` | Yıldız falı | Premium |
| GET | `/api/fortune/:id` | Fal detayı | Auth |
| POST | `/api/fortune/:id/rate` | Puanla | Auth |
| POST | `/api/fortune/:id/favorite` | Favorile | Auth |
| POST | `/api/fortune/:id/share` | Paylaş | Premium |
| GET | `/api/fortune/shared/:token` | Paylaşılan fal | Public |

### Geçmiş (History)
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/history` | Fal geçmişi |
| GET | `/api/history/favorites` | Favoriler |
| GET | `/api/history/stats` | İstatistikler |
| DELETE | `/api/history/:id` | Fal sil |
| DELETE | `/api/history/clear` | Geçmişi temizle |

### Premium
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/premium/plans` | Plan listesi |
| POST | `/api/premium/payment-intent` | Ödeme başlat |
| POST | `/api/premium/confirm` | Ödeme onayla |
| POST | `/api/premium/cancel` | Abonelik iptal |
| GET | `/api/premium/history` | Ödeme geçmişi |

## Plan Limitleri

| Plan | Günlük Limit | Fal Tipleri | Geçmiş |
|------|-------------|-------------|--------|
| Free | 3 | Kahve | 7 gün |
| Premium | 20 | Tümü | 90 gün |
| VIP | Sınırsız | Tümü | 365 gün |

## Servisler

- **MongoDB** - Kullanıcı ve fal veritabanı
- **OpenAI GPT-4o** - AI fal yorumu
- **Cloudinary** - Görsel depolama
- **Stripe** - Ödeme sistemi
