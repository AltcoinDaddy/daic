use near_sdk::{env, near, AccountId, PanicOnDefault, NearSchema};
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::store::IterableMap;

#[derive(Clone, Copy, PartialEq, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub enum CredentialStatus {
    Active,
    Revoked,
}

#[derive(Clone, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct Credential {
    pub id: String,
    pub issuer: AccountId,
    pub subject: AccountId,
    pub credential_type: String,
    pub data_hash: String,
    pub issued_at: u64,
    pub status: CredentialStatus,
}

#[derive(Clone, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct DIDDocument {
    pub id: String,             // did:near:<account_id>
    pub verification_method: String,  // Public Key
    pub controller: AccountId,
    pub created: u64,
    pub updated: u64,
    pub service_endpoints: Vec<String>,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct DaicDidRegistry {
    pub dids: IterableMap<AccountId, DIDDocument>,
    pub credentials: IterableMap<String, Credential>,
    pub credential_count: u64,
}

#[near]
impl DaicDidRegistry {
    #[init]
    pub fn new() -> Self {
        Self {
            dids: IterableMap::new(b"i"),
            credentials: IterableMap::new(b"c"),
            credential_count: 0,
        }
    }

    // ─── DID Management ─────────────────────────────────────────

    pub fn register_did(&mut self, verification_method: String) {
        let account_id = env::predecessor_account_id();
        let did_string = format!("did:near:{}", account_id);

        let doc = DIDDocument {
            id: did_string,
            verification_method,
            controller: account_id.clone(),
            created: env::block_timestamp(),
            updated: env::block_timestamp(),
            service_endpoints: vec![],
        };

        self.dids.insert(account_id, doc);
    }

    pub fn update_did(&mut self, verification_method: Option<String>, service_endpoints: Option<Vec<String>>) {
        let account_id = env::predecessor_account_id();
        let doc = self.dids.get_mut(&account_id).expect("DID not registered");

        if let Some(vm) = verification_method {
            doc.verification_method = vm;
        }
        if let Some(endpoints) = service_endpoints {
            doc.service_endpoints = endpoints;
        }
        doc.updated = env::block_timestamp();
    }

    pub fn resolve_did(&self, account_id: AccountId) -> Option<DIDDocument> {
        self.dids.get(&account_id).cloned()
    }

    pub fn get_all_dids(&self) -> Vec<DIDDocument> {
        self.dids.values().cloned().collect()
    }

    // ─── Credential Management ──────────────────────────────────

    /// Issue a verifiable credential to a subject
    pub fn issue_credential(
        &mut self,
        subject: AccountId,
        credential_type: String,
        data_hash: String,
    ) -> String {
        let issuer = env::predecessor_account_id();
        let id = format!("vc-{}", self.credential_count);

        let credential = Credential {
            id: id.clone(),
            issuer,
            subject,
            credential_type,
            data_hash,
            issued_at: env::block_timestamp(),
            status: CredentialStatus::Active,
        };

        self.credentials.insert(id.clone(), credential);
        self.credential_count += 1;
        id
    }

    /// Revoke a credential (only the original issuer can revoke)
    pub fn revoke_credential(&mut self, credential_id: String) {
        let caller = env::predecessor_account_id();
        let cred = self.credentials.get_mut(&credential_id).expect("Credential not found");
        assert!(caller == cred.issuer, "Only issuer can revoke");
        cred.status = CredentialStatus::Revoked;
    }

    pub fn get_credential(&self, credential_id: String) -> Option<Credential> {
        self.credentials.get(&credential_id).cloned()
    }

    /// Get all credentials issued to a specific subject
    pub fn get_credentials_for(&self, subject: AccountId) -> Vec<Credential> {
        self.credentials.values()
            .filter(|c| c.subject == subject)
            .cloned()
            .collect()
    }

    pub fn get_credential_count(&self) -> u64 {
        self.credential_count
    }
}
