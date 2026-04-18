use crate::engine;
use crate::models::{
    AiRequest, AnalysisOptionsRequest, AnalysisResponse, CalibrationProfileRequest,
    DailyScanRequest, DailyScanResponse, DataSourceRequest, LiveScanResponse, TrackedMatchRequest,
    TrackedMatchStatus,
};
use serde::de::DeserializeOwned;
use serde::Serialize;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

fn history_path(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| error.to_string())?;
    fs::create_dir_all(&dir).map_err(|error| error.to_string())?;
    Ok(dir.join("analysis-history.json"))
}

#[derive(Serialize)]
pub struct HistoryPayload {
    pub exists: bool,
    pub entries: Vec<Value>,
}

fn cp1252_reverse_byte(ch: char) -> Option<u8> {
    match ch as u32 {
        0x20AC => Some(0x80),
        0x201A => Some(0x82),
        0x0192 => Some(0x83),
        0x201E => Some(0x84),
        0x2026 => Some(0x85),
        0x2020 => Some(0x86),
        0x2021 => Some(0x87),
        0x02C6 => Some(0x88),
        0x2030 => Some(0x89),
        0x0160 => Some(0x8A),
        0x2039 => Some(0x8B),
        0x0152 => Some(0x8C),
        0x017D => Some(0x8E),
        0x2018 => Some(0x91),
        0x2019 => Some(0x92),
        0x201C => Some(0x93),
        0x201D => Some(0x94),
        0x2022 => Some(0x95),
        0x2013 => Some(0x96),
        0x2014 => Some(0x97),
        0x02DC => Some(0x98),
        0x2122 => Some(0x99),
        0x0161 => Some(0x9A),
        0x203A => Some(0x9B),
        0x0153 => Some(0x9C),
        0x017E => Some(0x9E),
        0x0178 => Some(0x9F),
        _ => None,
    }
}

fn corruption_score(text: &str) -> usize {
    text.chars()
        .filter(|ch| {
            matches!(
                *ch,
                '\u{00C3}' | '\u{00C2}' | '\u{00C5}' | '\u{00C4}' | '\u{00E2}' | '\u{FFFD}'
            )
        })
        .count()
}

fn decode_utf8_from_legacy_bytes(input: &str) -> Option<String> {
    let mut bytes = Vec::with_capacity(input.len());
    for ch in input.chars() {
        let code = ch as u32;
        if code <= 0xFF {
            bytes.push(code as u8);
            continue;
        }
        if let Some(mapped) = cp1252_reverse_byte(ch) {
            bytes.push(mapped);
            continue;
        }
        return None;
    }
    Some(String::from_utf8_lossy(&bytes).into_owned())
}

fn normalize_text<S: Into<String>>(value: S) -> String {
    let mut text = value.into();
    if text.is_empty() {
        return text;
    }

    let replacements = [
        ("\u{00C3}\u{00BC}", "ü"),
        ("\u{00C3}\u{0153}", "Ü"),
        ("\u{00C3}\u{00B6}", "ö"),
        ("\u{00C3}\u{2013}", "Ö"),
        ("\u{00C3}\u{00A7}", "ç"),
        ("\u{00C3}\u{2021}", "Ç"),
        ("\u{00C4}\u{00B1}", "ı"),
        ("\u{00C4}\u{00B0}", "İ"),
        ("\u{00C4}\u{0178}", "ğ"),
        ("\u{00C4}\u{017E}", "Ğ"),
        ("\u{00C5}\u{0178}", "ş"),
        ("\u{00C5}\u{017E}", "Ş"),
        ("\u{00C3}\u{00A2}\u{201A}\u{00AC}\u{00A2}", "•"),
        (
            "\u{00C3}\u{00A2}\u{201A}\u{00AC}\u{00E2}\u{20AC}\u{0153}",
            "-",
        ),
        (
            "\u{00C3}\u{00A2}\u{201A}\u{00AC}\u{00E2}\u{20AC}\u{009D}",
            "-",
        ),
        (
            "\u{00C3}\u{00A2}\u{201A}\u{00AC}\u{00E2}\u{201E}\u{00A2}",
            "'",
        ),
        ("\u{00C3}\u{00A2}\u{201A}\u{00AC}\u{00C5}\u{201C}", "\""),
        ("Istatistik", "İstatistik"),
        ("Icerik", "İçerik"),
        ("Mac", "Maç"),
        ("Canli", "Canlı"),
        ("canli", "canlı"),
        ("Ust", "Üst"),
        ("Ilk", "İlk"),
    ];

    for _ in 0..6 {
        let before = text.clone();
        for (from, to) in replacements {
            text = text.replace(from, to);
        }
        if let Some(decoded) = decode_utf8_from_legacy_bytes(&text) {
            let current_score = corruption_score(&text);
            let decoded_score = corruption_score(&decoded);
            if decoded_score < current_score
                || (decoded_score == current_score && decoded.len() >= text.len().saturating_sub(2))
            {
                text = decoded;
            }
        }
        if text == before {
            break;
        }
    }

    text = text
        .replace('\u{00C2}', "")
        .replace('\u{00A0}', " ")
        .replace('\u{FFFD}', "")
        .replace("  ", " ");

    text.trim().to_string()
}

fn normalize_json_value(value: &mut Value) {
    match value {
        Value::String(text) => {
            *text = normalize_text(text.clone());
        }
        Value::Array(items) => {
            for item in items.iter_mut() {
                normalize_json_value(item);
            }
        }
        Value::Object(map) => {
            for (_, item) in map.iter_mut() {
                normalize_json_value(item);
            }
        }
        _ => {}
    }
}

fn normalize_payload<T>(payload: T) -> Result<T, String>
where
    T: Serialize + DeserializeOwned,
{
    let mut value =
        serde_json::to_value(payload).map_err(|error| normalize_text(error.to_string()))?;
    normalize_json_value(&mut value);
    serde_json::from_value(value).map_err(|error| normalize_text(error.to_string()))
}

#[tauri::command]
pub async fn analyze_match(
    url: String,
    ai: Option<AiRequest>,
    data: Option<DataSourceRequest>,
    options: Option<AnalysisOptionsRequest>,
    calibration: Option<CalibrationProfileRequest>,
) -> Result<AnalysisResponse, String> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        engine::analyze_match_url(&url, ai, data, options, calibration)
    })
    .await
    .map_err(|error| normalize_text(format!("Analiz görevi çalıştırılamadı: {error}")))?;

    let payload = result.map_err(normalize_text)?;
    normalize_payload(payload)
}

#[tauri::command]
pub async fn scan_daily_program(
    url: String,
    ai: Option<AiRequest>,
    data: Option<DataSourceRequest>,
    scan: Option<DailyScanRequest>,
    options: Option<AnalysisOptionsRequest>,
    calibration: Option<CalibrationProfileRequest>,
) -> Result<DailyScanResponse, String> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        engine::scan_daily_program_url(&url, ai, data, scan, options, calibration)
    })
    .await
    .map_err(|error| normalize_text(format!("Günlük tarama görevi çalıştırılamadı: {error}")))?;

    let payload = result.map_err(normalize_text)?;
    normalize_payload(payload)
}

#[tauri::command]
pub async fn refresh_tracked_matches(
    matches: Vec<TrackedMatchRequest>,
    data: Option<DataSourceRequest>,
) -> Result<Vec<TrackedMatchStatus>, String> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        engine::refresh_tracked_matches(matches, data)
    })
    .await
    .map_err(|error| normalize_text(format!("Takip yenileme görevi çalıştırılamadı: {error}")))?;

    let payload = result.map_err(normalize_text)?;
    normalize_payload(payload)
}

#[tauri::command]
pub async fn scan_live_matches(
    url: String,
    ai: Option<AiRequest>,
    data: Option<DataSourceRequest>,
    options: Option<AnalysisOptionsRequest>,
    calibration: Option<CalibrationProfileRequest>,
) -> Result<LiveScanResponse, String> {
    let result = tauri::async_runtime::spawn_blocking(move || {
        engine::scan_live_matches_url(&url, ai, data, options, calibration)
    })
    .await
    .map_err(|error| normalize_text(format!("Canlı tarama görevi çalıştırılamadı: {error}")))?;

    let payload = result.map_err(normalize_text)?;
    normalize_payload(payload)
}

#[tauri::command]
pub fn resolve_matchcast_url(
    match_page_id: u64,
    matchcast_id: u64,
    home_team: String,
    away_team: String,
    width: Option<u16>,
) -> Result<String, String> {
    engine::resolve_mackolik_matchcast_url(
        match_page_id,
        matchcast_id,
        &home_team,
        &away_team,
        width,
    )
}

#[tauri::command]
pub fn open_external_url(url: String) -> Result<(), String> {
    engine::open_external_url(&url)
}

#[tauri::command]
pub fn load_history(app: AppHandle) -> Result<HistoryPayload, String> {
    let path = history_path(&app)?;
    if !path.exists() {
        return Ok(HistoryPayload {
            exists: false,
            entries: Vec::new(),
        });
    }
    let raw = fs::read_to_string(&path).map_err(|error| error.to_string())?;
    let parsed: Value = serde_json::from_str(&raw).map_err(|error| error.to_string())?;
    let mut entries = match parsed {
        Value::Array(items) => items,
        _ => Vec::new(),
    };
    for entry in entries.iter_mut() {
        normalize_json_value(entry);
    }
    Ok(HistoryPayload {
        exists: true,
        entries,
    })
}

#[tauri::command]
pub fn save_history(app: AppHandle, entries: Value) -> Result<(), String> {
    let path = history_path(&app)?;
    let mut payload = if entries.is_array() {
        entries
    } else {
        Value::Array(Vec::new())
    };
    normalize_json_value(&mut payload);
    let json = serde_json::to_string_pretty(&payload).map_err(|error| error.to_string())?;
    let temp_path = path.with_extension("json.tmp");
    fs::write(&temp_path, json).map_err(|error| error.to_string())?;
    if let Err(error) = fs::rename(&temp_path, &path) {
        let _ = fs::remove_file(&path);
        fs::rename(&temp_path, &path).map_err(|_| error.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn clear_history(app: AppHandle) -> Result<(), String> {
    let path = history_path(&app)?;
    if path.exists() {
        fs::remove_file(&path).map_err(|error| error.to_string())?;
    }
    Ok(())
}
