mod config;
mod services;

use services::file_system::list_files_and_directories_internal;
use services::ai::call_llm;
use tauri::AppHandle;

#[tauri::command]
fn list_files_and_directories(dir_path: &str) -> Result<services::file_system::FileOrDir, String> {
    list_files_and_directories_internal(dir_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn call_llm_command(
    _app: AppHandle,
    prompt: String,
    model_name: String
) -> Result<serde_json::Value, String> {
    call_llm(prompt, model_name).await
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            list_files_and_directories,
            call_llm_command
        ])
        .run(tauri::generate_context!())
        .expect("应用启动失败");
}
