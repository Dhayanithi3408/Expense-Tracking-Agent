require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')
const cors     = require('cors')

const app  = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json())

// Routes
app.use('/api/auth',         require('./routes/auth'))
app.use('/api/accounts',     require('./routes/accounts'))
app.use('/api/transactions', require('./routes/transactions'))

// FX Rates
const FX_RATES = {
  INR:1, USD:0.012, EUR:0.011, GBP:0.0095, CAD:0.016,
  AUD:0.018, JPY:1.89, CHF:0.011, SGD:0.016, AED:0.044
}
app.get('/api/currencies', (req, res) => {
  const meta = {
    INR:{ symbol:'Rs ',  name:'Indian Rupee',      flag:'🇮🇳' },
    USD:{ symbol:'$',    name:'US Dollar',          flag:'🇺🇸' },
    EUR:{ symbol:'€',    name:'Euro',               flag:'🇪🇺' },
    GBP:{ symbol:'£',    name:'British Pound',      flag:'🇬🇧' },
    CAD:{ symbol:'C$',   name:'Canadian Dollar',    flag:'🇨🇦' },
    AUD:{ symbol:'A$',   name:'Australian Dollar',  flag:'🇦🇺' },
    JPY:{ symbol:'¥',    name:'Japanese Yen',       flag:'🇯🇵' },
    CHF:{ symbol:'Fr',   name:'Swiss Franc',        flag:'🇨🇭' },
    SGD:{ symbol:'S$',   name:'Singapore Dollar',   flag:'🇸🇬' },
    AED:{ symbol:'AED ', name:'UAE Dirham',         flag:'🇦🇪' },
  }
  res.json({
    base: 'INR',
    rates: FX_RATES,
    currencies: Object.entries(FX_RATES).map(([code, rate]) => ({
      code, rate, ...meta[code]
    }))
  })
})

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }))

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected:', process.env.MONGO_URI)
    app.listen(PORT, () => {
      console.log(`\nExpenseAI API running  →  http://localhost:${PORT}`)
      console.log('Routes: /api/auth  /api/accounts  /api/transactions  /api/currencies\n')
    })
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message)
    process.exit(1)
  })
