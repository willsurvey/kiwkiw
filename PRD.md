# IPTV Live Streaming Web App

## 1. Overview

Aplikasi web untuk menampilkan daftar channel live streaming IPTV yang
dapat dikelola melalui admin dashboard. Setiap channel menyimpan URL
stream yang bisa berupa HLS (.m3u8), iframe embed, atau direct video
link.

Frontend ditujukan untuk pengguna umum, sementara admin dashboard
digunakan untuk mengelola channel tanpa perlu redeploy aplikasi.

Aplikasi di-deploy di Vercel dengan backend ringan (API routes +
database eksternal).

## 2. Goals

-   Menyediakan platform live streaming IPTV berbasis web.
-   Admin dapat menambah, mengedit, dan menghapus channel tanpa coding.
-   Mendukung berbagai tipe stream:
    -   HLS (.m3u8)
    -   iframe embed
    -   direct video (mp4)
    -   YouTube embed (opsional)
-   UI cepat, ringan, dan mobile-friendly.
-   Deployable di Vercel tanpa server tambahan berat.

## 3. Non-Goals

-   Tidak proxy streaming
-   Tidak scraping IPTV
-   Tidak modifikasi header stream
-   Tidak hosting video

## 4. User Roles

-   Guest: lihat & play channel
-   Admin: CRUD channel

## 5. Core Features

-   Channel management CRUD
-   Live player (HLS/iframe/mp4/youtube)
-   Category & search
-   Auto-detect stream type

## 6. Data Model

Channel: id, name, category, stream_url, stream_type, logo_url, status,
created_at

## 7. Tech Stack

Next.js, Vercel, Supabase, HLS.js

## 8. Success Criteria

Admin bisa tambah channel tanpa code change
