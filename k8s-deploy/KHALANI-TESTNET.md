### Khalani Chain Testnet Deployment

Below are the steps to prepare Axon nodes to run in the AWS EKS. 
Private keys of all the nodes will be stored in AWS Secrets Manager object and mounted as ENV variables to each Axon node. 

### Checkout [`axon`](git@github.com:axonweb3/axon.git) repository
```shell
git clone git@github.com:axonweb3/axon.git
cd axon
```

### Install the axon binary in your path
```shell
cargo install --path ./ --locked --force 
```

### Generate 4 keypairs and save them to `keys.json`
```shell
cd ../axon-devops/k8s-deploy/k8s/axon/axon-config/
axon generate-keypair -n 1 -p . > keys.json
```

### Create AWS Secrets Manager object `khalani/testnet/nodes-private-keys` 
Create a `khalani/testnet/nodes-private-keys` Secrets Manager with the following 4 keys and assign them to private keys from `keys.json` 

The following 4 secret keys need to be created in the object:
- `NODE_PRIVATE_KEY_1` — value of `$(cat keys.json | jq -r ".keypairs[0].private_key)`
- `NODE_PRIVATE_KEY_2` — value of `$(cat keys.json | jq -r ".keypairs[1].private_key)`
- `NODE_PRIVATE_KEY_3` — value of `$(cat keys.json | jq -r ".keypairs[2].private_key)`
- `NODE_PRIVATE_KEY_4` — value of `$(cat keys.json | jq -r ".keypairs[3].private_key)`

Then deploy `khalani-testnet-nodes-secret-class` `SecretProviderClass` manifest from the `infrastructure` repository. 

### Update toml configs in devtools/chain/nodes/*
```shell
export PK_1=$(cat keys.json | jq -r ".keypairs[0].private_key")
export PK_2=$(cat keys.json | jq -r ".keypairs[1].private_key")
export PK_3=$(cat keys.json | jq -r ".keypairs[2].private_key")
export PK_4=$(cat keys.json | jq -r ".keypairs[3].private_key")

sed -i "" "s/privkey = \".*\"/privkey = \"$PK_1\"/g" devtools/chain/nodes/node_1.toml 
sed -i "" "s/privkey = \".*\"/privkey = \"$PK_2\"/g" devtools/chain/nodes/node_2.toml 
sed -i "" "s/privkey = \".*\"/privkey = \"$PK_3\"/g" devtools/chain/nodes/node_3.toml 
sed -i "" "s/privkey = \".*\"/privkey = \"$PK_4\"/g" devtools/chain/nodes/node_4.toml
```

### Patch [main.rs](https://github.com/axonweb3/axon/blob/e9a547ffc51706240aded2f032eef709ee4ec08e/devtools/genesis-generator/src/main.rs#L26)
Replace
```rust
let input_path = "../chain/genesis_single_node.json";
```

with
```rust
let input_path = "devtools/chain/nodes/genesis_multi_nodes.json";
```

Replace
```rust
let input_path = "metadata.json";
```

with
```rust
let input_path = "devtools/genesis-generator/metadata.json"
```

### Generate new genesis.json
```shell
./target/debug/genesis-generator --config_path=devtools/chain/nodes --chain_id=10012 --private_key=$(cat keys.json | jq -r ".keypairs[0].private_key")
 ```

The file `./temp/new-genesis.json` is the resulting `genesis.json` to use for the deployment. 
Copy it from `axon` repo to this repo at `axon-devops/k8s-deploy/k8s/axon/axon-config/genesis.json`.

### Copy `keys.json` from `axon` repo to the `axon-devops/k8s-deploy/k8s/axon/axon-config/` and update node configs
```shell
cp /axon/keys.json /axon-devops/k8s-deploy/k8s/axon/axon-config/
```

then run
```shell
export PEER_1=$(cat keys.json | jq -r ".keypairs[0].peer_id")
export PEER_2=$(cat keys.json | jq -r ".keypairs[1].peer_id")
export PEER_3=$(cat keys.json | jq -r ".keypairs[2].peer_id")
export PEER_4=$(cat keys.json | jq -r ".keypairs[3].peer_id")

# Update all files the same way
for i in {1..4}; do
    node_toml="node_$i.toml"

    sed -i "" "s/multi_address = \"\/dns4\/axon-1\/.*\"/multi_address = \"\/dns4\/axon-1\/tcp\/8001\/p2p\/$PEER_1\"/g" ${node_toml} 
    sed -i "" "s/multi_address = \"\/dns4\/axon-2\/.*\"/multi_address = \"\/dns4\/axon-2\/tcp\/8001\/p2p\/$PEER_2\"/g" ${node_toml} 
    sed -i "" "s/multi_address = \"\/dns4\/axon-3\/.*\"/multi_address = \"\/dns4\/axon-3\/tcp\/8001\/p2p\/$PEER_3\"/g" ${node_toml} 
    sed -i "" "s/multi_address = \"\/dns4\/axon-4\/.*\"/multi_address = \"\/dns4\/axon-4\/tcp\/8001\/p2p\/$PEER_4\"/g" ${node_toml}    
done
```

### Axon is ready to be deployed to EKS with `k8s-deploy/k8s/axon/deploy.sh deploy` command