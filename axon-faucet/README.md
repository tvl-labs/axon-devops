# Deploy Axon Faucet

Please check your docker-compose version, should be latest.

```
docker-compose --version
docker-compose version 1.29.2, build 5becea4c
```

## Configuration of the deployment

### Step 1
```shell
$ cd axon-devops/axon-faucet
```

### Step 2
```shell
$ vim config.yml
```


```

Editor config.yml

```yml
deploy_path: "/home/ckb/axon-faucet"
faucet_repo: "https://github.com/axonweb3/axon-faucet.git"
faucet_branch: "master"
axon_faucet_rpc_url: http://xxxx.xxx.xxx.xxx:8000
axon_faucet_claim_value: "1000000000000000000"
axon_faucet_server_port: "8502"
mongodb_password: mongodbpassword
mongodb_url: mongodb://root:mongodbpassword@faucet-mongo:27017


                                               
```
`deploy_path`: Axon faucet  deploy path

`faucet_repo`: git address of axon faucet

`faucet_branch`: git brnach of axon faucet

`axon_faucet_rpc_url`: Http address of axon rpc

`axon_faucet_claim_value`: faucet claim value

`axon_faucet_server_port`: faucet server http port

`mongodb_password`: mongo db password

`mongodb_url`: URL address of mongo db




## Instructions for use
### start
```shell
$ make start
```
### Mnemonic initialization, Executed on the first deployment only.
```shell
$ make init
```
### stop
```shell
$ make stop
```
### Visit the faucet website

http://192.168.1.100:8502  # 192.168.1.100 is your server ip , 8502 is your axon_faucet_server_port

http://Your server IP:axon_faucet_server_port

http://192.168.1.100:8502  # 192.168.1.100 is your server ip , 8502 is your axon_faucet_server_port


