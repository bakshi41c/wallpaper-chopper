import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { Wallpaper } from 'src/model';
import { Log } from '../logger';
import { Point, DragRef } from '@angular/cdk/drag-drop/typings/drag-ref';
import { CdkDragEnd } from '@angular/cdk/drag-drop';

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

  public onDragEnded(event: CdkDragEnd): void {
    let parentPos = document.getElementById('wallpaperCanvas').getBoundingClientRect();
    let childPos = document.getElementById(this.wallpaper.id + "_box").getBoundingClientRect();
    this.wallpaper.position.y = childPos.top - parentPos.top;
    this.wallpaper.position.x = childPos.left - parentPos.left;  }
}
