import express from 'express'
import cors from 'cors'

import authRoutes       from './src/routes/auth.js'
import categoriesRoutes from './src/routes/categories.js'
import entriesRoutes    from './src/routes/entries.js'

const app = express()

// 1. Middleware Global untuk CORS
app.use(cors({
    origin: 'http://localhost:5173'
}))

// 2. Middleware untuk parsing JSON
app.use(express.json())

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'Trackly Backend Berjalan' })
})

// 3. API Routes
app.use('/api/auth',       authRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/entries',    entriesRoutes)

export default app