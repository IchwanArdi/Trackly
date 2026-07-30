import express from 'express'
import cors from 'cors'

import authRoutes from './src/routes/auth.js'

const app = express()

// 1. Middleware Global untuk CORS
// Memungkinkan client dari domain berbeda (http://localhost:5173) untuk mengakses server
app.use(cors({
    origin: 'http://localhost:5173'
}))

// 2. Middleware untuk parsing JSON
app.use(express.json())

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Trackly Backend Berjalan' })
})

// 3. API Route
app.use('/api/auth', authRoutes)

export default app