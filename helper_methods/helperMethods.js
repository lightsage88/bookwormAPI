const axios = require('axios');
module.exports = {
    marvelImageHelper: function(imagePath, desiredPath) {
        console.log('the image path');
        console.log(imagePath)
return axios({
    url: imagePath,
    responseType: 'stream',
})
.then(response => {
    return new Promise((resolve, reject) => {
      let marvelousImage = response.data.pipe(fs.createWriteStream(desiredPath));
      marvelousImage.on('error', reject).on('close', resolve);
    })
})
.catch(err => {
    console.error(err);
})

}

}