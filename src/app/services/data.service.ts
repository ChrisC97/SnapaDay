import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private storage: Storage) { }

  GetData(): Promise<any>{
    return this.storage.get('photos');
  }

  Save(data): void {
    this.storage.set("photos", data);
  }
}
