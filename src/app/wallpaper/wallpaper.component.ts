import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Wallpaper } from 'src/model';
import { Log } from '../logger';

@Component({
  selector: 'app-wallpaper',
  templateUrl: './wallpaper.component.html',
  styleUrls: ['./wallpaper.component.css']
})
export class WallpaperComponent implements OnInit, AfterViewInit {

  @Input() wallpaper : Wallpaper
  constructor() { }

  ngAfterViewInit() {
    let img = document.getElementById(this.wallpaper.id);
    img.onload = () => {
        var width  = Number(img["naturalWidth"]);
        var height = Number(img["naturalHeight"]);
        this.wallpaper.setNativeDimension(height, width)
    }
  }
  ngOnInit() {
  }
}
