#!/bin/bash
set -ex

# Update chain-spec.toml
# Replace bls_pub_key, pub_key, and address with values from keys.json
# Replace verifier_list with the updated values

# Update verifier_list in chain-spec.toml
# Example: Replace verifier_list with new values
# Loop through each index and replace the values
for ((i=0; i<4; i++)); do
    bls_pub_key=$(jq -r ".keypairs[$i].bls_public_key" keys.json)
    pub_key=$(jq -r ".keypairs[$i].public_key" keys.json)
    address=$(jq -r ".keypairs[$i].address" keys.json)
    sed -i "s/bls_pub_key = \"null\"/bls_pub_key = \"$bls_pub_key\"/g" chain-spec.toml
    sed -i "s/pub_key = \"null\"/pub_key = \"$pub_key\"/g" chain-spec.toml
    sed -i "s/address = \"null\"/address = \"$address\"/g" chain-spec.toml
done

# Update multi address in node_n.toml files
# Example: Replace multi_address with peer ids from keys.json
# Use keys at index 0 for node 1, index 1 for node 2, and so on
for ((i=1; i<=4; i++)); do
    peer_id=$(jq -r ".keypairs[$((i-1))].peer_id" keys.json)
    sed -i "s/multi_address = \"\/dns4\/axon-$i\/tcp\/8001\/p2p\/[^\"]*\"/multi_address = \"\/dns4\/axon-$i\/tcp\/8001\/p2p\/$peer_id\"/g" node_$i.toml
done