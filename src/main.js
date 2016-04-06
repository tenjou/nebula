"use strict";

var editor = null;

meta.onDomLoad(function() {
	meta.classLoaded();
	editor = new Editor();
	editor.prepare();
});



// function openFile () {
//  dialog.showOpenDialog({ properties: [ 'openDirectory' ]}, function (fileNames) {
//  	console.log(fileNames);
//   // if (fileNames === undefined) return;
//   // var fileName = fileNames[0];
//   // fs.readDirectory(fileName, 'utf-8', function (err, data) {
//   //   	console.log(data);
//   // });
//  }); 
// }

// openFile();
