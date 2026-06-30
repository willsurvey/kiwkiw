# Development Guideline

## Rules

-   Jangan bikin fitur di luar PRD
-   Tidak boleh proxy streaming
-   Tidak boleh manipulasi header request
-   Harus Vercel-compatible

## Stream Rules

-   HLS pakai hls.js
-   iframe untuk embed
-   mp4 pakai HTML5 video

## Auto Detect

youtube -\> youtube .m3u8 -\> hls .mp4 -\> video lainnya -\> iframe

## Error Handling

Jika stream gagal tampilkan fallback UI

## AI Rules

Jangan halu API atau fitur
