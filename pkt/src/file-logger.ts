import fs from "fs"
import { getTimeNow } from "./effects-tracker"

const logPath = "./logs"

function getCurrentTimestamp(): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0") // Month starts from 0
    const day = String(now.getDate()).padStart(2, "0")
    const hours = String(now.getHours()).padStart(2, "0")
    const minutes = String(now.getMinutes()).padStart(2, "0")
    const seconds = String(now.getSeconds()).padStart(2, "0")

    return `${year}${month}${day}_${hours}${minutes}${seconds}`
}

export class FileLogger {
    private logToConsole: boolean
    private filename: string

    constructor(logToConsole: boolean = false) {
        this.logToConsole = logToConsole
        this.filename = `${logPath}/${getCurrentTimestamp()}.txt`
        this.writeLine("init")
    }

    writePKT(pktName: string, pkt: object | undefined) {
        if (this.logToConsole) {
            console.log(`${getTimeNow()}\t\t${pktName}`)
            console.log(pkt)
        }
        this.writeLine(`${pktName}\t${JSON.stringify(pkt)}`)
    }

    writeLine(line: string): void {
        line = `${getTimeNow()}\t\t${line}\n`

        fs.appendFile(this.filename, line, (err) => {
            if (err) {
                console.error("Error writing to file:", err)
                return
            }
        })
    }
}
