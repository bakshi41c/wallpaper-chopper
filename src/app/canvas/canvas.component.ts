import { Component, OnInit } from '@angular/core';
import { Device } from 'src/model';

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

  devices = []
  wallpapers = []

  refSizeInch = 32
  refDisplayArea = 60000

  ngOnInit() {
  }

  addDevice() {
    let newDevice = new Device(this.sizeInput, this.heightInput, this.widthInput)

    if (this.devices.length == 0) {
      this.refSizeInch = newDevice.sizeInch
    }

    let scaleRatio = newDevice.sizeInch/this.refSizeInch
    let scaledDisplayArea = (scaleRatio * scaleRatio) * this.refDisplayArea

    let displayRatio = newDevice.resolutionHeightPx /  newDevice.resolutionWidthPx
    newDevice.emulationWidthPx = Math.sqrt(scaledDisplayArea/displayRatio)
    newDevice.emulationHeightPx = scaledDisplayArea / newDevice.emulationWidthPx

    console.dir(newDevice)
    this.devices.push(newDevice)
  }

  addWallPaper() {
  }


}
