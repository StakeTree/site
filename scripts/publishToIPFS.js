const fs = require('fs');
const path = require('path');
const ipfsAPI = require('ipfs-api');
const ipfs = ipfsAPI({host: 'ipfs.infura.io', port: '5001', protocol: 'https'});

fs.readFile(path.resolve('./src/creators.json'), (err, res)=>{
	ipfs.files.add([{path: 'creators.json', content: res}], function (err, files) {
	  console.log(err, files);
	  // 'files' will be an array of objects containing paths and the multihashes of the files added
	});
});