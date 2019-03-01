import { statSync, open, write, createReadStream, createWriteStream, unlink, fstat } from 'fs';
import { generateThumb } from './file.thumbnail';

// let tempPath = join(__dirname, '../public/files/temp');
// let uploadPath = join(__dirname, '../public/files')

export class SocketUpload{
    private io:any;
    private files: Object = {};
    public uploadPath: string ;
    public thumbPath: string;

    constructor(io:any){
        this.io = io;

        this.io.on('connection', (socket) => {
            console.log('User connected');
    
            socket.on('START', (file: any) => {
                var fileName = file.name;
                this.files[fileName] = {
                    fileSize : file.size,
                    data : '',
                    downloaded: 0
                }
                let place: number = 0;
                try{
                    let stat = statSync(`${this.uploadPath}/${fileName}`);
                    if(stat.isFile()){
                        this.files[fileName]['downloaded'] = stat.size;
                        place = stat.size / 524288;
                    }
                }
                catch(err){ }
                open(`${this.uploadPath}/${fileName}`, 'a', 0o755, (err, fd) => {
                    if(err) return console.log(err);
                    this.files[fileName]['handler'] = fd;
                    socket.emit('MORE_DATA', { place, percent: 0});
                });
            });

            socket.on('UPLOAD', (file: any) => {
                let fileName = file.name;
                this.files[fileName]['downloaded'] += file.data.length;
                this.files[fileName]['data'] += file.data;

                if(this.files[fileName]['downloaded'] == this.files[fileName]['fileSize']){ //file fully uploaded
                    write(this.files[fileName]['handler'], this.files[fileName]['data'], null, 'Binary', (err, written) => {
                        //Thumbnail
                        generateThumb(`${this.uploadPath}/${fileName}`, `${this.thumbPath}/`)
                        // let inStream = createReadStream(`${tempPath}/${fileName}`);
                        // let outStream = createWriteStream(`${this.uploadPath}/${fileName}`);
                        // inStream.pipe(outStream);
                        // inStream.on('end', ()=> {
                        //     console.log('file copied');
                        //     unlink(`${tempPath}/${fileName}`, ()=>{
                        //         console.log('file Moved');
                        //         socket.emit('DONE', { thumb: 0 }); //succecss response
                        //     })
                        // })
                        socket.emit('DONE', { thumb: 0 }); //succecss response
                    });
                }
                else if(this.files[fileName]['data'].length > 10485760){ //If the Data Buffer reaches 10MB
                    write(this.files[fileName]['handler'], this.files[fileName]['data'], null, 'Binary', (err, written) => {
                        this.files[fileName]['data'] = ''; //resetting buffer
                        
                        let place = this.files[fileName]['downloaded'] / 524288;
                        let percent = (this.files[fileName]['downloaded'] / this.files[fileName]['fileSize']) * 100;
                        socket.emit('MORE_DATA', {place, percent});
                    })
                }
                else{
                    let place = this.files[fileName]['downloaded'] / 524288;
                    let percent = (this.files[fileName]['downloaded'] / this.files[fileName]['fileSize']) * 100;
                    socket.emit('MORE_DATA', {place, percent});
                }
            })

            socket.on('cancel', async (data: any)=> {
                console.log(data);
                let count:number = 0 ;
                try{
                    await data.files.forEach((fileName: string) => {
                        let stat = statSync(`${this.uploadPath}/${fileName}`);
                        if(stat.isFile()){
                            unlink(`${this.uploadPath}/${fileName}`, () => {
                                console.log('in --',count);
                                count = count + 1;
                            })
                        }
                    });

                    console.log('cancel done', count);
                }
                catch(e){console.log(e)}
                
                socket.emit('cancel-done', { count });
            })
    
            socket.on('disconnect', ()=>{
                console.log('user disconnected');
            })
        })
    }
}