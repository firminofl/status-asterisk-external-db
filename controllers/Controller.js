const exec = require('child_process').exec;
const pg = require('../db');

const service = require('../services/Controller')

module.exports = {
    async status_sistema(req, res) {
        let registry;
        let peers;
        let command;

        //Executar comando no bash do servidor para obter a info se o asterisk esta registrado via SIP
        command = `sudo asterisk -rx "sip show registry"`;
        registry = await getInfo(command);

        //Executar comando no bash do servidor para obter os peers do asterisk
        command = `sudo asterisk -rx "sip show peers"`;
        peers = await getInfo(command);

        //Executar o comando para verificar a conexão com o bd
        const {
            DBTABLECONTATO,
            HOST,
            dbInfo: {
                dbData,
                dbStatus
            }
        } = await syncBd();

        const statusSystem = {
            registry,
            peers,
            dbHost: HOST,
            dbTable: DBTABLECONTATO,
            dbData,
            dbStatus
        }

        //console.log(statusSystem)
        res.json(statusSystem);
    },
    async dbConnection(req, res) {
        //Executar o comando para verificar a conexão com o bd
        const {
            DBTABLECONTATO,
            HOST,
            dbInfo: {
                dbData,
                dbStatus
            }
        } = await syncBd();

        const statusDB = {
            dbHost: HOST,
            dbTable: DBTABLECONTATO,
            dbData,
            dbStatus
        }

        res.json(statusDB);
    }
}

function getInfo(command) {
    return new Promise((resolve, reject) => {
        //Execução do comando em shell
        execute(command, (error, stdout) => {
            if (error)
                reject(error)
            else
                resolve(stdout);
        });
    });
}

async function syncBd() {
    let db;
    let dbInfo;
    let DBUSER = "postgres";
    let DBNAME = "confirma_aux";
    let DBTABLECONTATO = "contato";
    let HOST = "localhost";
    let command;

    try {
        //Executar o comando de verificar a existencia da base externa
        command = `echo "SELECT * FROM ${DBTABLECONTATO};" | PGPASSWORD="sml3uc0" psql -t -d ${DBNAME} -h ${HOST} -U ${DBUSER} | awk -F '|' '{ print $5 }' | xargs `
        db = getInfo(command);

        if (db == '\n') {
            dbInfo = {
                dbData: "Banco de dados offline\n",
                dbStatus: "0" //0 - offline, 1 - online
            };
        } else {
            let data = await service.status_sistema_service();
            dbInfo = {
                dbData: data,
                dbStatus: "1" //0 - offline, 1 - online
            }
        }

        const info = {
            DBTABLECONTATO: DBTABLECONTATO,
            HOST: HOST,
            dbInfo
        }

        return info
    } catch (error) {
        const infoError = {
            DBTABLECONTATO: DBTABLECONTATO,
            HOST: HOST,
            dbInfo: null,
            message: error
        }
        return infoError
    }
}

function execute(command, callback) {
    exec(command, function (error, stdout, stderr) {
        callback(error, stdout);
    });
};