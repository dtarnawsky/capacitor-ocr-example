import { Component } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Ocr, TextDetections } from 'capacitor-ocr';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  imgSrc: SafeUrl | undefined;
  lines: string[] = [];
  message: string = '';
  busy = false;

  constructor(private sanitizer: DomSanitizer) { }

  async takePic() {
    try {
      this.busy = true;
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera        
      });
      const imageUrl = photo.webPath;
      if (!imageUrl) return;
      this.imgSrc = this.sanitizer.bypassSecurityTrustUrl(imageUrl);
      const path = photo.path;
      if (!path) return;
      this.lines = await this.processImage(path);
    } catch (err) {
      alert(err);
    } finally {
      this.busy = false;
    }
  }

  async processImage(filename: string): Promise<string[]> {
    const data: TextDetections = await Ocr.detectText({ filename });
    // or with orientation -
    // const textDetections = await td.detectText({ filename, orientation: ImageOrientation.Up })

    console.log(data);
    const result: string[] = [];
    for (let detection of data.textDetections) {
      result.push(detection.text); 
      //`${detection.text} (${detection.bottomLeft},${detection.bottomRight},${detection.topLeft},${detection.topRight})`);
    }
    this.message = result.length === 0 ? 'No text was detected' : '';
    return result;
  }

}
