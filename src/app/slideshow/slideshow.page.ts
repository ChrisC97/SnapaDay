import { Component, OnInit } from '@angular/core';
import { SafeResourceUrl, DomSanitizer } from "@angular/platform-browser";
import { ModalController } from "@ionic/angular";
import { PhotoService } from "../services/photo.service";

@Component({
  selector: 'app-slideshow',
  templateUrl: './slideshow.page.html',
  styleUrls: ['./slideshow.page.scss'],
})
export class SlideshowPage implements OnInit {

  private imagePlayerInterval: any;
  public imageSrc: SafeResourceUrl;

  constructor(private photoService: PhotoService, private modalCtrl: ModalController, private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.PlayPhotos();
  }

  PlayPhotos(): void{
    let i = 0;

    //Clear any interval already set
    clearInterval(this.imagePlayerInterval);

    //Restart
    this.imagePlayerInterval = setInterval(() => {
      if(i < this.photoService.photos.length){
          this.imageSrc = this.sanitizer.bypassSecurityTrustUrl(this.photoService.photos[i].path);
          i++;
        }else{
          clearInterval(this.imagePlayerInterval);
        }
    }, 500);
  }

  Close(): void {
    this.modalCtrl.dismiss();
  }
}
