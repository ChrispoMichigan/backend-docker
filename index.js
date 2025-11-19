import express from 'express'
import cors from 'cors';
import dotenv from 'dotenv';
import pkg from 'pg';

const { Pool } = pkg;

dotenv.config({ quiet: true });

const app = express()
const port = process.env.PORT || 3000

// Configurar conexión a PostgreSQL
const pool = new Pool({
  connectionString: process.env.CONNECTION_DB_URL,
})

// Probar conexión
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error conectando a la base de datos:', err);
  } else {
    console.log('Conectado a PostgreSQL');
    release();
  }
});

app.use(express.json());

app.use(cors({
  origin: function(origin, callback) {

      if (!origin) return callback(null, true);
      
      if(origin === process.env.FRONTEND_URL) {
        callback(null, true)
      } else {
        callback(new Error('Error de CORS'));
      }
  },
  credentials: true,
}));

app.get('/', async (req, res) => {
    res.status(200).json({
        "status": true,
        "mensaje": "Backend Conectado"
    });
})

app.post('/form', async (req, res) => {
    try {
        const { nombre, numero, email } = req.body;
        
        if (!nombre || !numero || !email){
            res.status(400).json({
                "status": false,
                "mensaje": "Datos incompletos"
            });
        }

        // Verificar si el usuario ya existe
        const found_user = 'SELECT * FROM users WHERE email = $1'
        const found_user_data = await pool.query(found_user, [email]);

        if (found_user_data.rows.length > 0) {
            return res.status(409).json({
                "status": false,
                "mensaje": "El email ya está registrado"
            });
        }

        const query = 'INSERT INTO users (name, phone, email) VALUES ($1, $2, $3) RETURNING *';
        const values = [nombre, numero, email];
        
        const result = await pool.query(query, values);
        
        console.log('Datos insertados:', result.rows[0]);
        
        res.status(200).json({
            "status": true,
            "mensaje": "Registrado correctamente",
            "data": result.rows[0]
        });
    } catch (error) {
        console.error('Error al insertar datos:', error);
        res.status(500).json({
            "status": false,
            "mensaje": "Error al registrar datos"
        });
    }
})

app.listen(port, () => {
  console.log(`Servidor iniciado en: http://localhost:${port}`)
})