use near_sdk::{env, near, AccountId, PanicOnDefault, NearSchema};
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::store::IterableMap;

#[derive(Clone, Copy, PartialEq, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub enum AccessLevel {
    Public,
    Restricted,
    Private,
}

#[derive(Clone, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct Dataset {
    pub id: String,             // IPFS CID or unique ID
    pub owner: AccountId,
    pub title: String,
    pub description: String,
    pub lineage: Vec<String>,   // List of parent IDs if derived
    pub timestamp: u64,
    pub updated: u64,
    pub integrity_hash: String, // ZK proof hash
    pub access_level: AccessLevel,
    pub version: u32,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct DaicProvenance {
    pub datasets: IterableMap<String, Dataset>,
    pub dataset_count: u64,
}

#[near]
impl DaicProvenance {
    #[init]
    pub fn new() -> Self {
        Self {
            datasets: IterableMap::new(b"d"),
            dataset_count: 0,
        }
    }

    pub fn register_dataset(
        &mut self,
        id: String,
        title: String,
        description: String,
        lineage: Vec<String>,
    ) {
        let owner = env::predecessor_account_id();
        let now = env::block_timestamp();
        let dataset = Dataset {
            id: id.clone(),
            owner,
            title,
            description,
            lineage,
            timestamp: now,
            updated: now,
            integrity_hash: String::new(),
            access_level: AccessLevel::Public,
            version: 1,
        };
        self.datasets.insert(id, dataset);
        self.dataset_count += 1;
    }

    /// Update dataset metadata (only owner)
    pub fn update_dataset(
        &mut self,
        id: String,
        title: Option<String>,
        description: Option<String>,
        integrity_hash: Option<String>,
        access_level: Option<AccessLevel>,
    ) {
        let caller = env::predecessor_account_id();
        let ds = self.datasets.get_mut(&id).expect("Dataset not found");
        assert!(caller == ds.owner, "Only owner can update");

        if let Some(t) = title { ds.title = t; }
        if let Some(d) = description { ds.description = d; }
        if let Some(h) = integrity_hash { ds.integrity_hash = h; }
        if let Some(a) = access_level { ds.access_level = a; }
        ds.updated = env::block_timestamp();
        ds.version += 1;
    }

    /// Transfer dataset ownership
    pub fn transfer_ownership(&mut self, id: String, new_owner: AccountId) {
        let caller = env::predecessor_account_id();
        let ds = self.datasets.get_mut(&id).expect("Dataset not found");
        assert!(caller == ds.owner, "Only owner can transfer");
        ds.owner = new_owner;
        ds.updated = env::block_timestamp();
    }

    // ─── View Methods ───────────────────────────────────────────

    pub fn get_dataset(&self, id: String) -> Option<Dataset> {
        self.datasets.get(&id).cloned()
    }

    pub fn get_all_datasets(&self) -> Vec<Dataset> {
        self.datasets.values().cloned().collect()
    }

    pub fn get_datasets_by_owner(&self, owner: AccountId) -> Vec<Dataset> {
        self.datasets.values()
            .filter(|d| d.owner == owner)
            .cloned()
            .collect()
    }

    pub fn get_dataset_count(&self) -> u64 {
        self.dataset_count
    }
}
