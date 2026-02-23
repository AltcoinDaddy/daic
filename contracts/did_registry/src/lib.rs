use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault};
use near_sdk::collections::UnorderedMap;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct DIDDocument {
    pub id: String, // did:near:<account_id>
    pub verification_method: String, // Public Key
    pub controller: AccountId,
    pub created: u64,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct DaicDidRegistry {
    pub dids: UnorderedMap<AccountId, DIDDocument>,
}

#[near_bindgen]
impl DaicDidRegistry {
    #[init]
    pub fn new() -> Self {
        Self {
            dids: UnorderedMap::new(b"i"),
        }
    }

    pub fn register_did(&mut self, verification_method: String) {
        let account_id = env::predecessor_account_id();
        let did_string = format!("did:near:{}", account_id);
        
        let doc = DIDDocument {
            id: did_string,
            verification_method,
            controller: account_id.clone(),
            created: env::block_timestamp(),
        };
        
        self.dids.insert(&account_id, &doc);
    }

    pub fn resolve_did(&self, account_id: AccountId) -> Option<DIDDocument> {
        self.dids.get(&account_id)
    }
}
