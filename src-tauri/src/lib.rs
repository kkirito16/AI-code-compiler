// 导入所需模块
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::{fs, io};
use serde_json::Value;
use tauri::{AppHandle};
use reqwest::Client;
use serde_json::json;

// 定义 FileOrDir 结构体
#[derive(Debug, Serialize, Deserialize)]
struct FileOrDir {
    name: String,
    path: String,
    is_directory: bool,
    children: Vec<FileOrDir>, 
}

#[tauri::command]
/// 递归地列出目录下的所有文件和子目录，并返回一个包含文件和目录信息的向量
fn list_files_and_directories_internal<P: AsRef<Path>>(dir: P) -> io::Result<FileOrDir> {
    let path = dir.as_ref();
    let name = path
        .file_name()
        .unwrap_or_default()
        .to_string_lossy()
        .into_owned();
    let is_directory = path.is_dir();
    let mut children = Vec::new();

    if is_directory {
        for entry in fs::read_dir(path)? {
            let entry = entry?;
            let entry_path = entry.path();
            children.push(list_files_and_directories_internal(entry_path)?);
        }
    }

    Ok(FileOrDir {
        name,
        path: path.to_string_lossy().into_owned(),
        is_directory,
        children,
    })
}

#[tauri::command]
fn list_files_and_directories(dir_path: &str) -> Result<FileOrDir, String> {
    list_files_and_directories_internal(dir_path).map_err(|e| e.to_string())
}

#[tauri::command]
async fn call_llm(
    _app: AppHandle,  // 保留AppHandle参数但不使用
    prompt: String,
    model_name: String
) -> Result<Value, String> {
    let client = Client::new();
    // 直接替换API地址（固定路径）
    let api_url = "https://api.zmone.me/v1/chat/completions"; 
    // 硬编码API密钥
    let api_key = "sk-9QHFuVqUIHrQZFo_we-YKX27qpNWhdv04QJ_nSaz7gHCFvsdm7vOQVMD8Mc";

    // 构造符合规范的请求体（参考网页3的模型参数规范）
    let request_body = json!({
        "model": model_name,  // 模型名称作为请求体参数
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.7,
        "max_tokens": 1000
    });

    // 发送请求（简化错误处理）
    client.post(api_url)
        .header("Authorization", format!("Bearer {}", api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?
        .json::<Value>()
        .await
        .map_err(|e| format!("JSON解析失败: {}", e))
}

// 注册命令并运行 Tauri 应用
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            list_files_and_directories,  
            call_llm                     
        ])
        .run(tauri::generate_context!())
        .expect("应用启动失败");
}
