import { Injectable } from '@angular/core';
import { DataService } from "./data.service";
import { Platform } from '@ionic/angular';
import {
  Plugins,
  Capacitor,
  CameraResultType,
  CameraSource,
  FilesystemDirectory
} from '@capacitor/core';

interface Photo {
  name: string;
  path: string;
  dateTaken: Date;
}

const { Camera, Filesystem } = Plugins;


@Injectable({
  providedIn: 'root'
})
export class PhotoService {

  public photos: Photo[] = [];
  public loaded: boolean = false;

  public photoTaken: boolean = false;

  constructor(private dataService: DataService, private platform: Platform) {}

  Load(): void{
    /*this.photos = [
       { name: 'test', path: 'https://placehold.it/100x100', dateTaken: new Date(2018,5,5) },
       { name: 'test', path: 'https://placehold.it/100x100', dateTaken: new Date(2018,5,6) },
       { name: 'test', path: 'https://placehold.it/100x100', dateTaken: new Date(2018,5,8) },
       { name: 'test', path: 'https://placehold.it/100x100', dateTaken: new Date(2018,5,10) },
    ]
    */
      
      this.platform.resume.subscribe(() => {
        if(this.photos.length > 0){
          let today = new Date();
          let lastDate = new Date(this.photos[0].dateTaken);

          if(lastDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)){
            this.photoTaken = true;
          }else{
            this.photoTaken = false;
          }
        }
      });

      this.dataService.GetData().then(photos => {
        console.log(photos);

        if(photos != null){
          this.photos = photos;
        }

        if(this.photos.length > 0){
          let today = new Date();
          let lastDate = new Date(this.photos[0].dateTaken);

          if(lastDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)){
            this.photoTaken = true;
            this.photoTaken = false //DEBUG TESTING TO TAKE MULTI PHOTOS PER TAKE
          }
        }

        this.loaded = true;
      })
  }

  TakePhoto(): Promise<any>{
    return new Promise((resolve, reject) =>{
      if(!this.loaded || this.photoTaken){
        reject("Not allowed to take photo");
      }

      let options = {
        quality: 50,
        width: 600,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      };

      Camera.getPhoto(options).then(
        photo => {
          Filesystem.readFile({
            path: photo.path
          }).then(
            result => {
              let date = new Date(), time = date.getTime(), fileName = time + ".jpeg";

              Filesystem.writeFile({
                data: result.data,
                path: fileName,
                directory: FilesystemDirectory.Data
              }).then(
                result => {
                  Filesystem.getUri({
                    directory: FilesystemDirectory.Data,
                    path: fileName
                  }).then(
                    result => {
                      console.log(result);
                      let filePath = Capacitor.convertFileSrc(result.uri);
                      this.CreatePhoto(fileName, filePath);
                      resolve(result.uri);
                    },err => {
                      console.log(err);
                      reject("Could not find photo in storage");
                    }
                  );
                }, err => {
                  console.log(err);
                  reject("Could not write photo to storage");
                }
              );
            }, err => {
              console.log(err);
              reject("Could not read photo data");
            }
          );
        }, err => {
          console.log(err);
          reject("Could not take photo");
        }
      );
    });
  }

  CreatePhoto(name, path): void {
    this.photos.unshift({
      name: name,
      path: path,
      dateTaken: new Date()
    });
    this.Save();
  }

  DeletePhoto(photo): void {
    //Remove data from storage
    let index = this.photos.indexOf(photo);

    if(index > -1){
      this.photos.splice(index, 1);
      this.Save();
    }

    //If the deleted photo was taken today, allow user to take a new photo
    let today = new Date();

    if(photo.dateTaken.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)){
      this.photoTaken = false;
    }

    // Remove from filesystem.
    Filesystem.deleteFile({
      path: photo.name,
      directory: FilesystemDirectory.Data
    }).then(
      result => {
        console.log(result);
      },
      err => {
        console.log(err);
      }
    );
  }

  Save(): void {
    this.dataService.Save(this.photos);
  }
}
