// import { dates } from './utils/dates.js'
// import OpenAI from 'openai'

// // let Configuration, OpenAIApi

// // async function loadOpenAI() {
// //   const openaiModule = await import('openai')
// //   Configuration = openaiModule.Configuration
// //   OpenAIApi = openaiModule.OpenAI
// // }

// // await loadOpenAI()

const polygonApiKey = import.meta.env.VITE_POLYGON_API_KEY
const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY

// // const configuration = new Configuration({
// //   apiKey: openaiApiKey
// // })
// const openai = new OpenAI({
//   apiKey: openaiApiKey,
//   dangerouslyAllowBrowser: 'True'
// })

// const tickersArr = []

// const generateReportBtn = document.querySelector('.generate-report-btn')
// const loadingArea = document.querySelector('.loading-panel')
// const apiMessage = document.getElementById('api-message')

// generateReportBtn.addEventListener('click', fetchStockData)

// document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
//   console.log("yo");
  
//   e.preventDefault()
//   const tickerInput = document.getElementById('ticker-input')
//   if (tickerInput.value.length > 2) {
//     generateReportBtn.disabled = false
//     const newTickerStr = tickerInput.value
//     tickersArr.push(newTickerStr.toUpperCase())
//     tickerInput.value = ''
//     renderTickers()
//   } else {
//     const label = document.getElementsByTagName('label')[0]
//     label.style.color = 'red'
//     label.textContent =
//       'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA.'
//   }
// })

// function renderTickers() {
//   const tickersDiv = document.querySelector('.ticker-choice-display')
//   tickersDiv.innerHTML = ''
//   tickersArr.forEach((ticker) => {
//     const newTickerSpan = document.createElement('span')
//     newTickerSpan.textContent = ticker
//     newTickerSpan.classList.add('ticker')
//     tickersDiv.appendChild(newTickerSpan)
//   })
// }

// async function fetchStockData() {
//   document.querySelector('.action-panel').style.display = 'none'
//   loadingArea.style.display = 'flex'
//   apiMessage.innerText = ''

//   try {
//     const stockData = await Promise.all(
//       tickersArr.map(async (ticker) => {
//         const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${polygonApiKey}`
//         const response = await fetch(url)
//         const status = response.status
//         if (status === 200) {
//           const data = await response.json()
//           apiMessage.innerText = 'Creating report...'
//           console.log(data)
//           return JSON.stringify(data)
//         } else {
//           throw new Error(`Error fetching stock data for ${ticker}. (status: ${status})`)
//         }
//       })
//     )

//     fetchReport(stockData.join('\n'))
//   } catch (err) {
//     loadingArea.innerText = 'There was an error fetching stock data.'
//     console.error('Error:', err)
//     loadingArea.style.display = 'none'
//   }
// }

// async function fetchReport(data) {
//   try {
//     const response = await openai.chat.completions.create({
//       model: 'gpt-4',
//       messages: [
//         {
//           role: 'system',
//           content:
//             'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell.'
//         },
//         {
//           role: 'user',
//           content: data
//         }
//       ],
//       max_tokens: 150
//     })

//     const aiText = response.data?.choices?.[0]?.message?.content
//     console.log(aiText)
//     renderReport(aiText || 'No valid response from OpenAI.')
//   } catch (err) {
//     console.error('OpenAI error:', err)
//     loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
//     loadingArea.style.display = 'none'
//   }
// }

// function renderReport(output) {
//   loadingArea.style.display = 'none'
//   const outputArea = document.querySelector('.output-panel')
//   outputArea.innerHTML = ''
//   const report = document.createElement('p')
//   outputArea.appendChild(report)
//   report.textContent = output
// }

import { dates } from './utils/dates.js'
import OpenAI from "openai"

const tickersArr = []

const generateReportBtn = document.querySelector('.generate-report-btn')

generateReportBtn.addEventListener('click', fetchStockData)

document.getElementById('ticker-input-form').addEventListener('submit', (e) => {
    e.preventDefault()
    const tickerInput = document.getElementById('ticker-input')
    if (tickerInput.value.length > 2) {
        generateReportBtn.disabled = false
        const newTickerStr = tickerInput.value
        tickersArr.push(newTickerStr.toUpperCase())
        tickerInput.value = ''
        renderTickers()
    } else {
        const label = document.getElementsByTagName('label')[0]
        label.style.color = 'red'
        label.textContent = 'You must add at least one ticker. A ticker is a 3 letter or more code for a stock. E.g TSLA for Tesla.'
    }
})

function renderTickers() {
    const tickersDiv = document.querySelector('.ticker-choice-display')
    tickersDiv.innerHTML = ''
    tickersArr.forEach((ticker) => {
        const newTickerSpan = document.createElement('span')
        newTickerSpan.textContent = ticker
        newTickerSpan.classList.add('ticker')
        tickersDiv.appendChild(newTickerSpan)
    })
}

const loadingArea = document.querySelector('.loading-panel')
const apiMessage = document.getElementById('api-message')

async function fetchStockData() {
    document.querySelector('.action-panel').style.display = 'none'
    loadingArea.style.display = 'flex'
    try {
        const stockData = await Promise.all(tickersArr.map(async (ticker) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${polygonApiKey}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                apiMessage.innerText = 'Creating report...'
                return data
            } else {
                loadingArea.innerText = 'There was an error fetching stock data.'
            }
        }))
        fetchReport(stockData.join(''))
    } catch (err) {
        loadingArea.innerText = 'There was an error fetching stock data.'
        console.error('error: ', err)
    }
}

async function fetchReport(data) {
    const messages = [
        {
            role: 'system',
            content: 'You are a trading guru. Given data on share prices over the past 3 days, write a report of no more than 150 words describing the stocks performance and recommending whether to buy, hold or sell.'
        },
        {
            role: 'user',
            content: data
        }
    ]

    try {
        const openai = new OpenAI({
            dangerouslyAllowBrowser: true,
            apiKey: openaiApiKey
        })
        const response = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages
        })
        renderReport(response.choices[0].message.content)

    } catch (err) {
        console.log('Error:', err)
        loadingArea.innerText = 'Unable to access AI. Please refresh and try again'
    }
    /** 
     * Challenge:
     * 1. Use the OpenAI API to generate a report advising 
     * on whether to buy or sell the shares based on the data 
     * that comes in as a parameter.
     * 
     * 🎁 See hint.md for help!
     * 
     * 🏆 Bonus points: use a try catch to handle errors.
     * **/
}

function renderReport(output) {
    loadingArea.style.display = 'none'
    const outputArea = document.querySelector('.output-panel')
    const report = document.createElement('p')
    outputArea.appendChild(report)
    report.textContent = output
    outputArea.style.display = 'flex'
}