import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/model';
import { Point, DragRef } from '@angular/cdk/drag-drop/typings/drag-ref';
import { Log } from '../logger';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-device',
  templateUrl: './device.component.html',
  styleUrls: ['./device.component.css']
})
export class DeviceComponent implements OnInit {

  constructor() { }
  @Input() device: Device

  ngOnInit() {
  }

  startPosition = {x: 0, y: 0};

  public onDragEnded(event: CdkDragEnd): void {
    let parentPos = document.getElementById('wallpaperCanvas').getBoundingClientRect();
    let childPos = document.getElementById(this.device.id).getBoundingClientRect();
    this.device.position.y = childPos.top - parentPos.top;
    this.device.position.x = childPos.left - parentPos.left;
  }
}
