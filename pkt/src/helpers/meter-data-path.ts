import fs from "fs"

const filePaths = [
    "./meter-data",
    "../meter-data",
    "./ui/meter-data",
    "../ui/meter-data",
    "../../ui/meter-data",
    "./resources/meter-data",
    "./resources/app/meter-data",
]

export const getMeterDataPath = () => {
    let meterDataPath = "."

    for (let p of filePaths) {
        if (fs.existsSync(p)) {
            meterDataPath = p
            // console.log(`The folder '${p}' exists.`);
            break
        } else {
            // console.log(`The folder '${p}' does not exist.`);
        }
    }

    // console.log(meterDataPath)
    return meterDataPath
}
