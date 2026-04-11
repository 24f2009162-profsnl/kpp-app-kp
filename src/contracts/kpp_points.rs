// Soroban Smart Contract for KPP Points
// This contract tracks on-chain points for students.

#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, Symbol, symbol_short};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Balance(Address),
    Admin,
    TokenContract,
}

#[contract]
pub struct KppPointsContract;

#[contractimpl]
impl KppPointsContract {
    // Initialize the contract with an admin
    pub fn init(e: Env, admin: Address, token_contract: Address) {
        if e.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        e.storage().instance().set(&DataKey::Admin, &admin);
        e.storage().instance().set(&DataKey::TokenContract, &token_contract);
    }

    // Award points to a student (Admin only)
    pub fn award(e: Env, student: Address, amount: i128) {
        let admin: Address = e.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();

        let key = DataKey::Balance(student.clone());
        let current_balance: i128 = e.storage().persistent().get(&key).unwrap_or(0);
        e.storage().persistent().set(&key, &(current_balance + amount));

        // Emit event for real-time tracking
        e.events().publish((symbol_short!("award"), student), amount);
    }

    // Get balance of a student
    pub fn balance(e: Env, student: Address) -> i128 {
        let key = DataKey::Balance(student);
        e.storage().persistent().get(&key).unwrap_or(0)
    }

    // Convert points to KPP Tokens (Inter-contract call)
    pub fn convert_to_tokens(e: Env, student: Address, points: i128) {
        student.require_auth();

        let key = DataKey::Balance(student.clone());
        let current_balance: i128 = e.storage().persistent().get(&key).unwrap_or(0);
        
        if current_balance < points {
            panic!("insufficient points");
        }

        // Deduct points
        e.storage().persistent().set(&key, &(current_balance - points));

        // Inter-contract call to the Token Contract
        let token_contract: Address = e.storage().instance().get(&DataKey::TokenContract).unwrap();
        
        // Assuming the token contract has a 'mint' function
        // This is the "Inter-contract call" required for Level 4
        e.invoke_contract::<()>(
            &token_contract,
            &Symbol::new(&e, "mint"),
            (student.clone(), points / 10).into(), // 10 points = 1 token
        );

        e.events().publish((symbol_short!("convert"), student), points);
    }
}
