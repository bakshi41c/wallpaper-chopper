import { Component, OnInit } from '@angular/core';
import { Wallpaper, Device, Dimension, Point } from 'src/model';
import { Log } from '../logger';
import Cropper from 'cropperjs';


@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  constructor() { }

  widthInput : number
  heightInput : number
  sizeInput : number

  devices : Device[] = []
  wallpapers : Wallpaper[] = []

  deviceCounter = 0
  wallpaperCounter = 0

  maxCanvasDimension = new Dimension(500, 1000)

  deviceRefArea = 60000

  ngOnInit() {
  }

  addDevice() {
    let id = "device_"+ (++this.deviceCounter)
    let newDevice = new Device(id, Number(this.sizeInput), Number(this.heightInput), Number(this.widthInput))
    this.devices.push(newDevice)
    this.draw()
  }

  getLargestScreen() {
    let largestScreen : number = 0
    this.devices.forEach(device => {
      largestScreen = device.sizeInch > largestScreen ? device.sizeInch : largestScreen
    });
    return largestScreen
  }

  getHighestResDevice() {
    let largestRes : number = 0
    let largestResDevice : Device;
    this.devices.forEach(device => {
      if (device.nativeDimension.getArea() > largestRes) {
        largestRes =  device.nativeDimension.getArea()
        largestResDevice = device
      } 
    });
    return largestResDevice
  }

  getLargestWallpaper(){
    let largestRes : number = 0
    let largestWallpaper : Wallpaper;
    this.wallpapers.forEach(wallpaper => {
      if (wallpaper.nativeDimension.getArea() > largestRes) {
        largestRes =  wallpaper.nativeDimension.getArea()
        largestWallpaper = wallpaper
      } 
    });
    return largestWallpaper
  }

  draw() {
    this.drawDevices()
    this.drawWallpapers()
    this.adjustScaling()
  }

  drawDevices() {
    let refScreenSize = this.getLargestScreen()
    let refEmulatedArea = this.deviceRefArea
    this.devices.forEach(device => {
      device.setEmulatedDimensions(Number(refScreenSize), Number(refEmulatedArea))
    })
  }

  drawWallpapers(){
    let highestResDevice : Device = this.getHighestResDevice() 
    let scaleRatio = 1;
    if (highestResDevice) {
      scaleRatio = highestResDevice.emulatedDimension.getArea()/ highestResDevice.nativeDimension.getArea()
    }

    this.wallpapers.forEach(wallpaper => {
      wallpaper.setEmulatedDimensions(Number(scaleRatio))
    })
  }

  adjustScaling(){
    let largestWallpaper = this.getLargestWallpaper()
    if (!largestWallpaper) {
      return
    }

    if (largestWallpaper.emulatedDimension.getArea() > this.maxCanvasDimension.getArea()) {
      let adjustedScaleRatio = 1
      if (largestWallpaper.emulatedDimension.heightPx > this.maxCanvasDimension.heightPx) { // adjust based on height
        adjustedScaleRatio = this.maxCanvasDimension.heightPx/largestWallpaper.emulatedDimension.heightPx
      } else if (largestWallpaper.emulatedDimension.widthPx > this.maxCanvasDimension.widthPx)  { // adjust based on width
        adjustedScaleRatio = this.maxCanvasDimension.widthPx/largestWallpaper.emulatedDimension.widthPx
      }

      this.wallpapers.forEach(wallpaper => {
        wallpaper.emulatedDimension.heightPx = wallpaper.emulatedDimension.heightPx * adjustedScaleRatio
        wallpaper.emulatedDimension.widthPx = wallpaper.emulatedDimension.widthPx * adjustedScaleRatio
      });

      this.devices.forEach(device => {
        device.emulatedDimension.heightPx = device.emulatedDimension.heightPx * adjustedScaleRatio
        device.emulatedDimension.widthPx = device.emulatedDimension.widthPx * adjustedScaleRatio
      });
    }
  }

  addWallpaper(event) {
    Log.d(this, "adding wallpaper")
    if (event.target.files && event.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]); // read file as data url

      reader.onload = (event) => { 
        let url = String(event.target["result"]);
        let id = "wallpaper_"+ (++this.wallpaperCounter)
        let newWallpaper = new Wallpaper(id, url)
        this.wallpapers[0]=newWallpaper // change this for multi wallpaper this.wallpaper.push(newWallpaper)

        setTimeout(() => {
          while (newWallpaper.isNativeDimensionSet === false) {}
          this.draw()
        }, 0)
      }
    }
  }

  deleteDevice(idx: number) {
    this.devices.splice(idx, 1);
    this.draw()
  }

  computeRelativePosition(base : Point, target : Point) {
    Log.dr(this, base)
    Log.dr(this, target)
    return new Point(target.x - base.x, target.y - base.y)
  }

  crop(){

    let wallpaper = this.wallpapers[0]
    let device = this.devices[0]
    let relativePoint = this.computeRelativePosition(wallpaper.position, device.position)
    // Log.ds(this, this.wallpapers[0].position)
    // Log.ds(this, this.devices[0].position)
    // Log.ds(this, relativePoint)

    var canvas = document.getElementById('croppedImageCanvas') as HTMLCanvasElement;
    var context = canvas.getContext('2d') ;
    var imageObj = document.getElementById(this.wallpapers[0].id) as HTMLImageElement ;

    let wScale = wallpaper.nativeDimension.heightPx / wallpaper.emulatedDimension.heightPx
    let hScale = wallpaper.nativeDimension.widthPx / wallpaper.emulatedDimension.widthPx

    // draw cropped image
    var sourceX = relativePoint.x * wScale;
    var sourceY = relativePoint.y * hScale;
    var sourceWidth = device.nativeDimension.widthPx;
    var sourceHeight = device.nativeDimension.heightPx;

    let obj = {
      "relativePoint" : relativePoint,
      "wScale" : wScale,
      "hScale" : hScale,
      "sourceX" : sourceX,
      "sourceY" : sourceY,
      "sourceWidth" : sourceWidth,
      "sourceHeight" : sourceHeight
    }
    Log.dr(this, obj)

    canvas.width = sourceWidth;
    canvas.height = sourceHeight;
    context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, sourceWidth, sourceHeight);

    // var link = document.createElement("a");
    // link.download = "image.png";

    this.devices[0].backgoundImage = canvas.toDataURL('image/png', 1.0);
    // canvas.toBlob(function(blob){
    //   link.href = URL.createObjectURL(blob);
    //   console.log(blob);
    //   console.log(link.href);
    //   link.click()
    // },'image/png', 1);
  }
}
