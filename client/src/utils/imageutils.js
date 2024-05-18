import { v4 as uuidv4 } from 'uuid';
import { changeImage } from '../actions/S3Actions';
export const uploadImage = (file, callback) => {
    if (file) {
        let id;
        switch (file.type) {
          case 'image/png':
              id += '.png';
              break;
          case 'image/x-png':
              id += '.png';
              break;
          case 'image/jpeg':
              id += '.jpg'
              break;
          default: 
              return;
        }
        let imageURL = `spaces/${uuidv4()}/posts/${uuidv4()}/images/${id}`;
        changeImage(imageURL, file).promise().then(e => {
            callback(imageURL);
        });
    }
}

export const modifySvg = (image, url, attrs) => {
    fetch(url).then(function(response) {
        return response.text();
    }).then(function(text){
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, "text/xml");
        const svg = xmlDoc.getElementsByTagName('svg')[0];
       
        if (attrs) {
            for (const [k, v] of Object.entries(attrs)) {
                svg.setAttribute(k, v)
            }
        }
      
        const html = svg.outerHTML
        let blob = new Blob([html], {type: 'image/svg+xml'});
        let url = URL.createObjectURL(blob);
        image.src = url
    })
}