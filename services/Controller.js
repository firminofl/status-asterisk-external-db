const pg = require('../db');

module.exports = {
    async status_sistema_service(obj) {
        let query = `SELECT * FROM contato;`
        let { rows } = await pg.queryAsync(query)
        return rows
    }
}