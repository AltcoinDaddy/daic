use near_sdk::{env, near, AccountId, PanicOnDefault, NearSchema};
use near_sdk::borsh::{BorshDeserialize, BorshSerialize};
use near_sdk::store::IterableMap;

#[derive(Clone, Copy, PartialEq, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub enum ProposalStatus {
    Active,
    Funded,
    Completed,
}

#[derive(Clone, BorshDeserialize, BorshSerialize, near_sdk::serde::Serialize, near_sdk::serde::Deserialize, NearSchema)]
#[serde(crate = "near_sdk::serde")]
#[borsh(crate = "near_sdk::borsh")]
pub struct Proposal {
    pub id: u64,
    pub proposer: AccountId,
    pub title: String,
    pub description: String,
    pub votes: u64,
    pub contributions: u128,    // Total yoctoNEAR contributed
    pub voter_count: u64,       // Number of unique contributions (for QF math)
    pub status: ProposalStatus,
}

#[near(contract_state)]
#[derive(PanicOnDefault)]
pub struct DaicDao {
    pub proposals: IterableMap<u64, Proposal>,
    pub proposal_count: u64,
    pub matching_pool: u128, // Total matching pool in yoctoNEAR
}

#[near]
impl DaicDao {
    #[init]
    pub fn new() -> Self {
        Self {
            proposals: IterableMap::new(b"p"),
            proposal_count: 0,
            matching_pool: 0,
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
            voter_count: 0,
            status: ProposalStatus::Active,
        };
        self.proposals.insert(id, proposal);
        self.proposal_count += 1;
        id
    }

    #[payable]
    pub fn vote(&mut self, proposal_id: u64) {
        let deposit = env::attached_deposit().as_yoctonear();
        let proposal = self.proposals.get_mut(&proposal_id).expect("Proposal not found");

        assert!(proposal.status == ProposalStatus::Active, "Proposal is not active");

        proposal.votes += 1;
        proposal.voter_count += 1;
        proposal.contributions += deposit;
        self.matching_pool += deposit;
    }

    /// Mark a proposal as funded (only proposer or admin)
    pub fn mark_funded(&mut self, proposal_id: u64) {
        let caller = env::predecessor_account_id();
        let proposal = self.proposals.get_mut(&proposal_id).expect("Proposal not found");
        assert!(
            caller == proposal.proposer,
            "Only the proposer can mark as funded"
        );
        proposal.status = ProposalStatus::Funded;
    }

    /// Mark a proposal as completed
    pub fn mark_completed(&mut self, proposal_id: u64) {
        let caller = env::predecessor_account_id();
        let proposal = self.proposals.get_mut(&proposal_id).expect("Proposal not found");
        assert!(
            caller == proposal.proposer,
            "Only the proposer can mark as completed"
        );
        proposal.status = ProposalStatus::Completed;
    }

    // ─── View Methods ───────────────────────────────────────────

    pub fn get_proposal(&self, proposal_id: u64) -> Option<Proposal> {
        self.proposals.get(&proposal_id).cloned()
    }

    pub fn get_all_proposals(&self) -> Vec<Proposal> {
        self.proposals.values().cloned().collect()
    }

    pub fn get_proposal_count(&self) -> u64 {
        self.proposal_count
    }

    pub fn get_matching_pool(&self) -> u128 {
        self.matching_pool
    }

    /// Calculate quadratic funding match for a proposal.
    /// QF formula: matched = (sqrt(sum_of_contributions))^2 - sum_of_contributions
    /// Simplified: we use voter_count * avg_contribution as a rough QF approximation
    /// In a real QF, each individual contribution's sqrt is summed, then squared.
    pub fn get_matched_funding(&self, proposal_id: u64) -> u128 {
        let proposal = self.proposals.get(&proposal_id).expect("Proposal not found");
        if proposal.voter_count == 0 || proposal.contributions == 0 {
            return 0;
        }
        // Simplified QF: matched ≈ voter_count * avg_contribution
        // This incentivizes many small donations over few large ones
        let avg = proposal.contributions / (proposal.voter_count as u128);
        let matched = (proposal.voter_count as u128) * (proposal.voter_count as u128) * avg;
        // Cap at matching pool
        if matched > self.matching_pool {
            self.matching_pool
        } else {
            matched
        }
    }
}
