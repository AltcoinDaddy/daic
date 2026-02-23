use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, PanicOnDefault, Promise};
use near_sdk::store::UnorderedMap;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct Proposal {
    pub id: u64,
    pub proposer: AccountId,
    pub title: String,
    pub description: String,
    pub votes: u64,
    pub contributions: u128, // In yoctoNEAR
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
#[borsh(crate = "near_sdk::borsh")]
pub struct DaicDao {
    pub proposals: UnorderedMap<u64, Proposal>,
    pub proposal_count: u64,
}

#[near_bindgen]
impl DaicDao {
    #[init]
    pub fn new() -> Self {
        Self {
            proposals: UnorderedMap::new(b"p"),
            proposal_count: 0,
        }
    }

    pub fn create_proposal(&mut self, title: String, description: String) -> u64 {
        let proposer = env::predecessor_account_id();
        let id = self.proposal_count;
        let proposal = Proposal {
            id,
            proposer,
            title,
            description,
            votes: 0,
            contributions: 0,
        };
        self.proposals.insert(id, proposal);
        self.proposal_count += 1;
        id
    }

    #[payable]
    pub fn vote(&mut self, proposal_id: u64) {
        let deposit = env::attached_deposit();
        let proposal = self.proposals.get_mut(&proposal_id).expect("Proposal not found");
        
        // Simple quadratic funding sim: contribution adds to raw amount, votes increment
        proposal.votes += 1;
        proposal.contributions += deposit.as_yoctonear();
    }

    pub fn get_proposal(&self, proposal_id: u64) -> Option<Proposal> {
        self.proposals.get(&proposal_id).cloned()
    }

    pub fn get_all_proposals(&self) -> Vec<Proposal> {
        self.proposals.values().cloned().collect()
    }
}
