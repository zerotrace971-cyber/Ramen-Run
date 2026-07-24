#![cfg(test)]

extern crate std;
use soroban_sdk::{symbol_short, testutils::Address as _, Address, Env};
use stamp_shelf::{StampShelf, StampShelfClient};
use crate::{RamenVault, RamenVaultClient};

fn setup<'a>(env: &'a Env) -> (RamenVaultClient<'a>, StampShelfClient<'a>, Address) {
    env.mock_all_auths();
    let admin = Address::generate(env);
    let sponsor = Address::generate(env);
    let stamp_id = env.register(StampShelf, ());
    let vault_id = env.register(RamenVault, ());
    let stamps = StampShelfClient::new(env, &stamp_id);
    let vault = RamenVaultClient::new(env, &vault_id);
    stamps.init(&admin);
    stamps.set_minter(&vault_id);
    vault.init(&admin, &stamp_id);
    (vault, stamps, sponsor)
}

#[test]
fn funding_records_route_and_total() {
    let env = Env::default();
    let (vault, _stamps, sponsor) = setup(&env);
    let route = vault.fund_route(&sponsor, &11, &180_000_000);
    assert_eq!(route.amount, 180_000_000);
    assert_eq!(vault.total_sponsored(), 180_000_000);
    assert_eq!(vault.get_route(&11).unwrap().state, symbol_short!("funded"));
}

#[test]
fn completing_route_mints_inter_contract_stamp() {
    let env = Env::default();
    let (vault, stamps, sponsor) = setup(&env);
    vault.fund_route(&sponsor, &12, &420_000_000);
    vault.complete_route(&12, &symbol_short!("rare"));
    let stamp = stamps.get_stamp(&sponsor, &12).unwrap();
    assert_eq!(stamp.owner, sponsor);
    assert_eq!(stamp.rarity, symbol_short!("rare"));
    assert_eq!(stamps.owner_count(&stamp.owner), 1);
    assert_eq!(vault.get_route(&12).unwrap().state, symbol_short!("done"));
}

#[test]
#[should_panic(expected = "amount must be positive")]
fn route_cannot_be_funded_with_zero_xlm() {
    let env = Env::default();
    let (vault, _stamps, sponsor) = setup(&env);
    vault.fund_route(&sponsor, &13, &0);
}
