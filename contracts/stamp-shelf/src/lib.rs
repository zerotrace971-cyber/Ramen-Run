#![no_std]

use soroban_sdk::{contract, contractevent, contractimpl, contracttype, Address, Env, Symbol, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Stamp {
    pub owner: Address,
    pub route_id: u32,
    pub serial: u32,
    pub rarity: Symbol,
    pub minted_at: u64,
}

#[contractevent(topics = ["ramen", "stamp_minted"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct StampMinted {
    #[topic]
    pub owner: Address,
    #[topic]
    pub route_id: u32,
    pub serial: u32,
}

#[contracttype]
#[derive(Clone)]
enum DataKey {
    Admin,
    Minter,
    NextSerial,
    Stamp(Address, u32),
    OwnerCount(Address),
}

#[contract]
pub struct StampShelf;

#[contractimpl]
impl StampShelf {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) { panic!("already initialized"); }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextSerial, &1u32);
    }

    pub fn set_minter(env: Env, minter: Address) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        env.storage().instance().set(&DataKey::Minter, &minter);
    }

    /// Can only be invoked by the configured Ramen Vault contract.
    pub fn mint(env: Env, owner: Address, route_id: u32, rarity: Symbol) -> Stamp {
        let minter: Address = env.storage().instance().get(&DataKey::Minter).unwrap();
        minter.require_auth();
        let stamp_key = DataKey::Stamp(owner.clone(), route_id);
        if env.storage().persistent().has(&stamp_key) { panic!("stamp already minted for route"); }
        let serial: u32 = env.storage().instance().get(&DataKey::NextSerial).unwrap_or(1);
        let stamp = Stamp { owner: owner.clone(), route_id, serial, rarity, minted_at: env.ledger().timestamp() };
        env.storage().persistent().set(&stamp_key, &stamp);
        let count_key = DataKey::OwnerCount(owner.clone());
        let count: u32 = env.storage().persistent().get(&count_key).unwrap_or(0);
        env.storage().persistent().set(&count_key, &(count + 1));
        env.storage().instance().set(&DataKey::NextSerial, &(serial + 1));
        StampMinted { owner, route_id, serial }.publish(&env);
        stamp
    }

    pub fn get_stamp(env: Env, owner: Address, route_id: u32) -> Option<Stamp> {
        env.storage().persistent().get(&DataKey::Stamp(owner, route_id))
    }

    pub fn owner_count(env: Env, owner: Address) -> u32 {
        env.storage().persistent().get(&DataKey::OwnerCount(owner)).unwrap_or(0)
    }

    pub fn all_stamps(env: Env, owner: Address, route_ids: Vec<u32>) -> Vec<Stamp> {
        let mut stamps = Vec::new(&env);
        for route_id in route_ids.iter() {
            if let Some(stamp) = Self::get_stamp(env.clone(), owner.clone(), route_id) { stamps.push_back(stamp); }
        }
        stamps
    }
}
