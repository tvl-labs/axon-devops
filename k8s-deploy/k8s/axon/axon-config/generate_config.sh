#!/bin/bash
set -ex

# generate keys.json
axon generate-keypair -n 4 -p . > keys.json

# Update chain-spec.toml
# Replace bls_pub_key, pub_key, and address with values from keys.json
# Replace verifier_list with the updated values
for ((i=0; i<4; i++)); do
    bls_pub_key=$(jq -r ".keypairs[$i].bls_public_key" keys.json)
    pub_key=$(jq -r ".keypairs[$i].public_key" keys.json)
    address=$(jq -r ".keypairs[$i].address" keys.json)
    sed -i "s/bls_pub_key = \"null\"/bls_pub_key = \"$bls_pub_key\"/g" chain-spec.toml
    sed -i "s/pub_key = \"null\"/pub_key = \"$pub_key\"/g" chain-spec.toml
    sed -i "s/address = \"null\"/address = \"$address\"/g" chain-spec.toml
done



# Update multi_address in node_n.toml files
# Replace multi_address with peer ids from keys.json
# Use keys at index 0 for the first occurrence, index 1 for the second occurrence, and so on
for ((i=1; i<=4; i++)); do
    for ((j=0; j<4; j++)); do
        peer_id=$(jq -r ".keypairs[$j].peer_id" keys.json)
        sed -i "s|multi_address = \"/dns4/axon-$i/tcp/8001/p2p/[^\\\"]*\"|multi_address = \"/dns4/axon-$i/tcp/8001/p2p/$peer_id\"|g" node_$i.toml
    done
done