import { Log } from './app/logger'

export class Device {
    id : string
    sizeInch : number  // diagonal
    emulatedDimension : Dimension
    nativeDimension : Dimension
    position: Point
    backgoundImage : string;

    public constructor (id :string, sizeInch : number, heightPx : number, widthPx : number) {
        this.id = id
        this.sizeInch = Number(sizeInch)
        this.nativeDimension = new Dimension(heightPx, widthPx)
        this.emulatedDimension = new Dimension(0,0)
        this.position = new Point(0,0)
        this.backgoundImage = 'none'
    }

    public setEmulatedDimensions(refScreenSize: number, refEmulatedArea: number) {
        let scaleRatio = this.sizeInch/refScreenSize
        let scaledPixelArea = (scaleRatio * scaleRatio) * refEmulatedArea
    
        this.emulatedDimension.heightPx = Math.sqrt(scaledPixelArea/this.nativeDimension.getAspectRatio())
        this.emulatedDimension.widthPx = scaledPixelArea / this.emulatedDimension.heightPx
    }
}

export class Wallpaper {
    id : string
    url : string
    isNativeDimensionSet : Boolean = false
    emulatedDimension : Dimension
    nativeDimension : Dimension
    position: Point

    public constructor (id : string, url : string) {
        this.id = id
        this.url = url
        this.nativeDimension = new Dimension(0, 0)
        this.emulatedDimension = new Dimension(0,0)
        this.position = new Point(0,0)
    }

    public setEmulatedDimensions(scaleRatio: number){
        let scaledPixelArea = scaleRatio * this.nativeDimension.getArea()
        this.emulatedDimension.heightPx = Math.sqrt(scaledPixelArea/this.nativeDimension.getAspectRatio())
        this.emulatedDimension.widthPx = scaledPixelArea / this.emulatedDimension.heightPx
    }

    public setNativeDimension(h : number, w : number) {
        this.nativeDimension.set(h, w)
        this.isNativeDimensionSet = true
    }
}

export class Point {
    x : number
    y : number
    public constructor (x : number, y : number){
        this.x = x,
        this.y = y
    }
}

export class Dimension {
    widthPx : number
    heightPx : number
    public constructor (height : number, width : number){
        this.heightPx = height,
        this.widthPx = width
    }
    public getAspectRatio(){
        return this.widthPx / this.heightPx
    }

    public getArea() {
        return this.widthPx * this.heightPx
    }
    public set(h :number, w : number) {
        this.heightPx = h;
        this.widthPx = w;
    }
}