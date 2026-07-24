#![no_std]

use soroban_sdk::{
    auth::{ContractContext, InvokerContractAuthEntry, SubContractInvocation},
    contract, contractevent, contractimpl, contracttype, symbol_short, vec, Address, Env, IntoVal, Symbol,
};
use stamp_shelf::StampShelfClient;

const FUNDED: Symbol = symbol_short!("funded");
const COMPLETED: Symbol = symbol_short!("done");

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Route { pub sponsor: Address, pub amount: i128, pub state: Symbol, pub created_at: u64 }

#[contractevent(topics = ["ramen", "route_funded"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RouteFunded {
    #[topic]
    pub route_id: u32,
    #[topic]
    pub sponsor: Address,
    pub amount: i128,
}

#[contractevent(topics = ["ramen", "route_done"])]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct RouteCompleted {
    #[topic]
    pub route_id: u32,
    #[topic]
    pub sponsor: Address,
    pub rarity: Symbol,
}

#[contracttype]
#[derive(Clone)]
enum DataKey { Admin, StampShelf, Route(u32), TotalSponsored }

#[contract]
pub struct RamenVault;

#[contractimpl]
impl RamenVault {
    pub fn init(env: Env, admin: Address, stamp_shelf: Address) {
        if env.storage().instance().has(&DataKey::Admin) { panic!("already initialized"); }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::StampShelf, &stamp_shelf);
        env.storage().instance().set(&DataKey::TotalSponsored, &0i128);
    }

    /// Sponsor a route. The UI builds this request with Freighter and simulates it before signing.
    pub fn fund_route(env: Env, sponsor: Address, route_id: u32, amount: i128) -> Route {
        sponsor.require_auth();
        if amount <= 0 { panic!("amount must be positive"); }
        let route_key = DataKey::Route(route_id);
        if env.storage().persistent().has(&route_key) { panic!("route already funded"); }
        let route = Route { sponsor: sponsor.clone(), amount, state: FUNDED, created_at: env.ledger().timestamp() };
        env.storage().persistent().set(&route_key, &route);
        let total: i128 = env.storage().instance().get(&DataKey::TotalSponsored).unwrap_or(0);
        env.storage().instance().set(&DataKey::TotalSponsored, &(total + amount));
        RouteFunded { route_id, sponsor, amount }.publish(&env);
        route
    }

    /// Completion mints the sponsor's stamp via the Stamp Shelf contract.
    pub fn complete_route(env: Env, route_id: u32, rarity: Symbol) {
        let admin: Address = env.storage().instance().get(&DataKey::Admin).unwrap();
        admin.require_auth();
        let route_key = DataKey::Route(route_id);
        let mut route: Route = env.storage().persistent().get(&route_key).unwrap_or_else(|| panic!("route not found"));
        if route.state != FUNDED { panic!("route cannot be completed"); }
        let stamp_shelf: Address = env.storage().instance().get(&DataKey::StampShelf).unwrap();
        let vault = env.current_contract_address();
        // Grant this contract the narrow authority it needs for the nested mint call.
        env.authorize_as_current_contract(vec![
            &env,
            InvokerContractAuthEntry::Contract(SubContractInvocation {
                context: ContractContext {
                    contract: stamp_shelf.clone(),
                    fn_name: Symbol::new(&env, "mint"),
                    args: vec![
                        &env,
                        vault.into_val(&env),
                        route.sponsor.clone().into_val(&env),
                        route_id.into_val(&env),
                        rarity.clone().into_val(&env),
                    ],
                },
                sub_invocations: vec![&env],
            }),
        ]);
        StampShelfClient::new(&env, &stamp_shelf).mint(&route.sponsor, &route_id, &rarity);
        route.state = COMPLETED;
        env.storage().persistent().set(&route_key, &route);
        RouteCompleted { route_id, sponsor: route.sponsor, rarity }.publish(&env);
    }

    pub fn get_route(env: Env, route_id: u32) -> Option<Route> { env.storage().persistent().get(&DataKey::Route(route_id)) }
    pub fn total_sponsored(env: Env) -> i128 { env.storage().instance().get(&DataKey::TotalSponsored).unwrap_or(0) }
}

#[cfg(test)]
mod test;
