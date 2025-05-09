use reqwest::Client;
use serde_json::{json, Value};
use crate::config::Config;

pub async fn call_llm(prompt: String, model_name: String) -> Result<Value, String> {
    let config = Config::default();
    let client = Client::new();

    let request_body = json!({
        "model": model_name,
        "messages": [{
            "role": "user",
            "content": prompt
        }],
        "temperature": 0.7,
        "max_tokens": 1000
    });

    let response = client.post(&config.api_url)
        .header("Authorization", format!("Bearer {}", config.api_key))
        .json(&request_body)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    // 检查响应状态
    let status = response.status();
    if !status.is_success() {
        let error_text = response.text().await
            .unwrap_or_else(|_| "Unknown error".to_string());
        return Err(format!("API请求失败 ({}): {}", status, error_text));
    }

    // 解析响应
    let result = response.json::<Value>().await
        .map_err(|e| format!("JSON解析失败: {}", e))?;

    // 验证响应格式
    if !result.is_object() {
        return Err("Invalid API response: not an object".to_string());
    }

    if !result.get("choices").and_then(|c| c.as_array()).is_some() {
        return Err("Invalid API response: missing or invalid choices array".to_string());
    }

    Ok(result)
} 