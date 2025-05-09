use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub api_url: String,
    pub api_key: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            api_url: "https://api.zmone.me/v1/chat/completions".to_string(),
            api_key: "sk-9QHFuVqUIHrQZFo_we-YKX27qpNWhdv04QJ_nSaz7gHCFvsdm7vOQVMD8Mc".to_string(),
        }
    }
} 