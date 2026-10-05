const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

async function conectarDB() {
    try {
        const connection = await oracledb.getConnection({
            user: "SYSTEM",
            password: "12345",
            connectionString: "localhost:1521/FREE"
        });
        return connection;
    } catch (error) {
        console.error("Error al conectar a la base de datos:", error);
        throw error;
    }
}

module.exports = conectarDB;
