import { Component, OnInit, Input } from '@angular/core';
import { Device } from 'src/model';

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

}
