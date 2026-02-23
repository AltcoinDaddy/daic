use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault};
use near_sdk::collections::UnorderedMap;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct Dataset {
    pub id: String, // IPFS CID or unique ID
    pub owner: AccountId,
    pub title: String,
    pub description: String,
    pub lineage: Vec<String>, // List of parent IDs if derived
    pub timestamp: u64,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct DaicProvenance {
    pub datasets: UnorderedMap<String, Dataset>,
}

#[near_bindgen]
impl DaicProvenance {
    #[init]
    pub fn new() -> Self {
        Self {
            datasets: UnorderedMap::new(b"d"),
        }
    }

    pub fn register_dataset(&mut self, id: String, title: String, description: String, lineage: Vec<String>) {
        let owner = env::predecessor_account_id();
        let dataset = Dataset {
            id: id.clone(),
            owner,
            title,
            description,
            lineage,
            timestamp: env::block_timestamp(),
        };
        self.datasets.insert(&id, &dataset);
    }

    pub fn get_dataset(&self, id: String) -> Option<Dataset> {
        self.datasets.get(&id)
    }
}
