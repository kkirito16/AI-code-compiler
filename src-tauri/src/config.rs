use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Config {
    pub api_url: String,
    pub api_key: String,
}

impl Default for Config {
    fn default() -> Self {
        Self {
            api_url: "YOUR_API_URL".to_string(),
            api_key: "YOUR_API_KEY".to_string(),
        }
    }
} 
