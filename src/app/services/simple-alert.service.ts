import { Injectable } from '@angular/core';
import { AlertController } from "@ionic/angular";

@Injectable({
  providedIn: 'root'
})
export class SimpleAlertService {

  constructor(private alertCtrl: AlertController) { }

  CreateAlert(title: string, message: string): Promise<any>{
    return this.alertCtrl.create({
      header: title,
      message: message,
      buttons: [
        {
          text: "Ok"
        }
      ]
    })
  }
}
