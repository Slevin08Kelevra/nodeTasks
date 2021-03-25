



const mongoUtils = []

//mongod --auth --dbpath $node_path --port 27026 --bind_ip $my_host --tlsMode requireTLS --tlsCertificateKeyFile $pem_path --tlsCAFile $ca_path --clusterAuthMode x509 --tlsClusterFile $pem_path --replSet rs0 --fork --logpath $log_to

mongoUtils.startAllReplicas = async (mongoInstances) => {
    console.log("testing mongo utils")
    mongoInstances.forEach(instance => {
        
    });
}

mongoUtils.stopAllReplicas = async (mongoInstances) => {

}

mongoUtils.showReplicasStatus = async (mongoInstances) => {

}

module.exports = mongoUtils