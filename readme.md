# @zujo/Socket-File-Uploader

  

Socket server library for File Upload with Multiple files Resume, Pause, cancel feature, over socket.io.

## Installation

  

```bash

npm install @zujo/socket-file-uploader --save

```

  

## Usage

  

```js

const  uploader = require('@zujo/socket-file-uploader');

io.on("connection", function(socket){

	var  upload = new  uploader(socket);
	upload.uploadPath = __dirname + '/files/';

});

```

### Steps

Import package from node modules.

```javascript

const  uploader = require('@zujo/socket-file-uploader');

```

  

Provide socket to a new instance of a class(uploader) as a arguments.

```javascript

var  upload = new  uploader(socket);

```

  

Provide a destination directory Path, where you want to save the uploaded files.

```javascript

upload.uploadPath = '_path_of_directory_';

```

All set..!

  
  

## Features

- Resumable file uploading

- Multiple file uploading supported

- Cancel uploading

  

## Authors and acknowledgment

[Akhil Ramani](https://github.com/akhilramani),  [Arjun Kava](https://github.com/arjun-kava)

### Thanks and credits
[Mayank Pandav](https://github.com/mayankpandav), [Chintan Rajpara](https://github.com/chintanrajpara)

### Organization

[Zujo](https:www.zujo.io)