#!/usr/bin/env bash

function clean() {
    set +e
    echo "DEBUG" "Cleanup all resources from 'axon' namespace"
    kubectl delete statefulset,pvc,pv,cm --all -n axon
}

function create_local_node_persistent_volumes() {
    echo "DEBUG" "create local node persistent volumes..."
    mkdir -p /Users/serejke/.axon/node-1a
    mkdir -p /Users/serejke/.axon/node-2a
    mkdir -p /Users/serejke/.axon/node-3a
    mkdir -p /Users/serejke/.axon/node-4a
    mkdir -p /Users/serejke/.axon/logs
    kubectl apply -f ./local-pvs -n axon
}

function create_configmap() {
    echo "DEBUG" "create configmap for axons, please wait..."
    kubectl create namespace axon --dry-run=client -o yaml | kubectl apply -f -
    kubectl create configmap node1-toml --from-file=./axon-config/node_1.toml -n axon
    kubectl create configmap node2-toml --from-file=./axon-config/node_2.toml -n axon
    kubectl create configmap node3-toml --from-file=./axon-config/node_3.toml -n axon
    kubectl create configmap node4-toml --from-file=./axon-config/node_4.toml -n axon
    kubectl create configmap genesis --from-file=./axon-config/genesis.json -n axon
    kubectl create configmap db-options --from-file=./axon-config/default.db-options -n axon
}
function deploy_axon(){
    echo "DEBUG" "deploy axons, please wait..."
    kubectl apply -f ./axon1-statefulset.yaml
    kubectl apply -f ./axon2-statefulset.yaml
    kubectl apply -f ./axon3-statefulset.yaml
    kubectl apply -f ./axon4-statefulset.yaml
    kubectl apply -f ./axon-chain.yaml
#    kubectl apply -f ../ingress/axon-ingress.yaml
    kubectl apply -f ../pv/axon-logs-pv.yaml
    kubectl apply -f ../pv/axon-logs-pvc.yaml
    echo "DEBUG" "waiting for axons running..."
    sleep 120
    axon_running_num=`kubectl get pod -n axon | grep -i "axon" |grep -ci "running"`
    if [[ $axon_running_num -lt 4 ]]; then
        echo "axons not stable,please have a check"
    else
        echo "axons running"
    fi
}


function main() {
    case $1 in
        "deploy")
            create_local_node_persistent_volumes
            create_configmap
            deploy_axon
        ;;
        "deploy_axon")
            deploy_axon
        ;;
        "create_configmap")
            create_configmap
        ;;
        "clean")
            clean
        ;;
    esac
}

main $*

