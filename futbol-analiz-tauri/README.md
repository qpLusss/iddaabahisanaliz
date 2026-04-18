# Kaptan Futbol Analiz - Stabil Temiz Sürüm v2

Bu paket, bozuk Türkçe metinleri temizlenmiş ve canlı filtre akışı sertleştirilmiş sürümdür.

## Bu pakette düzeltilenler
- `main.js` mojibake/bozuk Türkçe kalıntılarından temizlendi.
- ASCII zorlaması kaldırıldı; Türkçe karakterler normal gösterilir.
- `Canlı Maçları Sorgula` ekranı artık sadece gerçekten aktif canlı veya devre arası maçları gösterir.
- `refresh_tracked_matches` içinde Mackolik kimliği bilinen maçlarda Flashscore önceliği kapatıldı; kaynak çakışması azaltıldı.
- Proje yapısı `index.html` dosyasının beklediği şekilde `src/` ve `src-tauri/src/` klasörlerine yerleştirildi.

## Klasör yapısı
- `src/main.js`
- `src/styles.css`
- `src-tauri/src/engine.rs`
- `src-tauri/src/commands.rs`

## Not
Bu yüklemede `models.rs` ve tam Tauri iskeleti olmadığı için burada tam Rust derlemesi yapılmadı. Frontend dosyası sentaks kontrolünden geçirildi.
