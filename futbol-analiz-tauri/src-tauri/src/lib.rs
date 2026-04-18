mod commands;
pub mod engine;
pub mod models;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::analyze_match,
            commands::scan_daily_program,
            commands::refresh_tracked_matches,
            commands::scan_live_matches,
            commands::resolve_matchcast_url,
            commands::open_external_url,
            commands::load_history,
            commands::save_history,
            commands::clear_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
