export class Device {
    sizeInch : number  // diagonal

    emulationHeightPx : number
    emulationWidthPx : number

    resolutionHeightPx : number
    resolutionWidthPx : number

    public constructor (sizeInch : number, resolutionHeightPx : number, resolutionWidthPx : number) {
        this.sizeInch = sizeInch
        this.resolutionHeightPx = resolutionHeightPx
        this.resolutionWidthPx = resolutionWidthPx

    }
}