import ReactDOM from 'react-dom';
import React, { Component } from 'react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
export default class ImageResizer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            src: props.src,
            crop: {
                unit: '%',
                width: 50,
                aspect: this.props.aspect
            },
        };

        this.onSelectFile = e => {
            if (e.target.files && e.target.files.length > 0) {
              const reader = new FileReader();
              reader.addEventListener('load', () =>
                this.setState({ src: reader.result })
              );
              reader.readAsDataURL(e.target.files[0]);
            }
          };
        
          this.onImageLoaded = image => {
            this.imageRef = image;
          };
        
          this.onCropComplete = crop => {
            this.makeClientCrop(crop);
          };
        
          this.onCropChange = (crop, percentCrop) => {
            // You could also use percentCrop:
            // this.setState({ crop: percentCrop });
            this.setState({ crop });
          };
        
        this.makeClientCrop = async (crop) => {
            if (this.imageRef && crop.width && crop.height) {
                this.getCroppedImg(
                    this.imageRef,
                    crop,
                    'newFile.jpeg'
                );
            }
          }
        
          this.getCroppedImg = (image, crop, fileName) => {
            const canvas = document.createElement('canvas');
            const pixelRatio = window.devicePixelRatio;
            const scaleX = image.naturalWidth / image.width;
            const scaleY = image.naturalHeight / image.height;
            const ctx = canvas.getContext('2d');

            canvas.width = crop.width * pixelRatio * scaleX;
            canvas.height = crop.height * pixelRatio * scaleY;

            ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(
              image,
              crop.x * scaleX,
              crop.y * scaleY,
              crop.width * scaleX,
              crop.height * scaleY,
              0,
              0,
              crop.width * scaleX,
              crop.height * scaleY
            );
        
            return new Promise((resolve, reject) => {
              canvas.toBlob(blob => {
                if (!blob) {
                  //reject(new Error('Canvas is empty'));
                  console.error('Canvas is empty');
                  return;
                }
                blob.name = fileName;
                
                props.onChange(blob)
                window.URL.revokeObjectURL(this.fileUrl);
                this.fileUrl = window.URL.createObjectURL(blob);
                resolve(this.fileUrl);
              }, 'image/png');
            });
          }
    }
  

  

  render() {
    const { crop, croppedImageUrl, src } = this.state;

    return (
      <div>
        {src && (
          <ReactCrop
            src={src}
            crop={crop}
            ruleOfThirds
            onImageLoaded={this.onImageLoaded}
            onComplete={this.onCropComplete}
            onChange={this.onCropChange}
            circularCrop={this.props.circularCrop}
          />
        )}
        {croppedImageUrl && (
          <img alt="Crop" style={{ maxWidth: '100%' }} src={croppedImageUrl} />
        )}
      </div>
    );
  }
}
