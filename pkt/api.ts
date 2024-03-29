import { InitLogger, InitMeterData } from "./src/pkt-handler"
import WebSocket from "ws"

const meterData = InitMeterData()
const [_, effectsTracker] = InitLogger(meterData, false, 6040, "", {})

/* --------------------------------------------------------------------- */
/* --------------------------------------------------------------------- */
/* --------------------------------------------------------------------- */

const wsUI = new WebSocket.Server({ port: 8081 })

wsUI.on("connection", (ws: WebSocket) => {
    console.log("Received connection to wsUI")

    const interval = setInterval(() => {
        ws.send(JSON.stringify(effectsTracker.effectsTrackerWebSocket()))
    }, 100)

    ws.on("message", (message: string) => {
        console.log(`Received: ${message}`)
        ws.send(`Echo: ${message}`)
    })

    ws.on("close", () => {
        console.log("Client disconnected")
        clearInterval(interval)
    })
})

// ws://localhost:8081
console.log("WebSocket servers running on ports 8081")

process.on("exit", () => {
    wsUI.close(() => {
        console.log("WebSocket server closed.")
    })
})
