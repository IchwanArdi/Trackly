import app from './app.js'
import dotenv from 'dotenv'

dotenv.config()

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Server berjalan pada port ${port}`)
})