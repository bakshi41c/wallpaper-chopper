import { Component, OnInit } from '@angular/core';
import { Wallpaper, Device, Dimension, Point } from 'src/model';
import { Log } from '../logger';
import Cropper from 'cropperjs';
import { Observable } from 'rxjs';
import { FormControl } from '@angular/forms';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {

  constructor() { }


  devices : Device[] = []
  wallpapers : Wallpaper[] = []

  deviceCounter = 0
  wallpaperCounter = 0

  maxCanvasDimension = new Dimension(500, 1000)

  deviceRefArea = 60000

  deviceFormControl = new FormControl();
  options: string[] = [
    '4096x2160 27" (4K 27inch)',
    '4096x2160 23" (4K 23inch)',

    '1920x1080 27" (FHD 27inch)',
    '1920x1080 23" (FHD 23inch)',

    '6016x3384 32" (Pro Retina XDR)',
    '5120x2880 27" (iMac 5K 27)',
    '4096x2304 21.5" (iMac 4K 21.5)',
    '2880x1800 15.4" (Macbook Pro 15 3rd Gen)',
    '2560x1600 13.3" (Macbook Pro 13 3rd Gen)',
    '2732x2048 12.9" (iPad Pro 1/2/3 Gen)',
    '2388x1668 11" (iPad Pro 11 inch)',
    '2304x1440 12" (Macbook 12inch)',
    '2224x1668 10.5" (iPad Air 3rd Gen)',
    '2160x1620 10.2" (iPad 7th Gen)',
]
  filteredOptions: Observable<string[]>;

  deviceDescPattern = /([0-9]+)x([0-9]+) ([0-9]+.?[0-9]?)"( [(](.*)[)])?/g; 

  deviceInputInvalid = false

  ngOnInit() {
    this.filteredOptions = this.deviceFormControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    Log.d(this, filterValue)
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  OnDeiveSelected(option) {
    this.addDevice(option)
    this.deviceFormControl.setValue("")
  }

  OnAddDeviceBtnClicked(){
    this.addDevice(this.deviceFormControl.value)
    this.deviceFormControl.setValue("")
  }

  addDevice(deviceDescStr : string) {
    this.deviceInputInvalid = false
    let deviceDesc = this.deviceDescPattern.exec(deviceDescStr)
    if (deviceDesc && deviceDesc.length >= 6) {
      let id = "device_"+ (++this.deviceCounter)
      let width = Number(deviceDesc[1])
      let height = Number(deviceDesc[2])
      let screenSize = Number(deviceDesc[3])
      let name = deviceDesc[5] ? String(deviceDesc[5]) : ""
      let newDevice = new Device(id, name, screenSize, height, width)
      this.devices.push(newDevice)
      this.draw()
    } else {
      this.deviceInputInvalid = true
      Log.d(this, "invalid device: " + deviceDescStr)
    }
    this.deviceDescPattern.lastIndex = 0;
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
    this.devices.forEach(device => {
      let wallpaper = this.wallpapers[0]
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
      var sourceWidth = device.emulatedDimension.widthPx * wScale;
      var sourceHeight = device.emulatedDimension.heightPx * hScale;
      
      if (sourceHeight !== device.nativeDimension.heightPx) {
        Log.d(this, "wallpaper " + device.id + " resolution not native")
      }

      canvas.width = device.nativeDimension.widthPx;
      canvas.height = device.nativeDimension.heightPx;
      context.drawImage(imageObj, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, device.nativeDimension.widthPx, device.nativeDimension.heightPx);
  
      var link = document.createElement("a");
      link.download = "image_" + device.id + ".png";
  
      device.backgoundImage = canvas.toDataURL('image/png', 1.0);
      canvas.toBlob(function(blob){
        link.href = URL.createObjectURL(blob);
        console.log(blob);
        console.log(link.href);
        link.click()
      },'image/png', 1);
    
    });
  }
}
