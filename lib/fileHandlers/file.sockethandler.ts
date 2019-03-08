import { statSync, open, write, createReadStream, createWriteStream, unlink } from 'fs';

/** SocketUpload class demands socket object created by Socket.IO at the creation of instance if class */

class SocketUpload{
    private socket:any;             /**Socket object - Provide at new Instance creation of SocketUpload */
    private files: Object = {};
    public uploadPath: string ;     /**Path for saving Files */
    public thumbPath: string;       /**Path for saving Thumbnails */

    /**
     * Initialize SocketUpload
     * @param socket Socket instance
     */
    constructor(socket:any){
        this.socket = socket;

        /**On START event to init a uploading of File, Emitted by client- Requires: { name: FileName ,size: FileSize} */
        this.socket.on('START', (file: any) => {
            var fileName = file.name;
            this.files[fileName] = {
                fileSize : file.size,
                data : '',
                downloaded: 0           /**Successfully Uploaded bytes of file */
            }
            let place: number = 0;      /**Place- address from uploading is left */
            try{
                let stat = statSync(`${this.uploadPath}/${fileName}`);  /**Checking same file already exists or not */
                if(stat.isFile()){
                    this.files[fileName]['downloaded'] = stat.size;
                    place = stat.size / 524288;
                }
            }
            catch(err){  console.log('New file arrived') }

            /**Generation of a File Descriptor */
            open(`${this.uploadPath}/${fileName}`, 'a', 0o755, (err, fd) => {
                if(err) return console.log(err);
                this.files[fileName]['handler'] = fd;
                socket.emit('MORE_DATA', { place, percent: 0});     /**emit MORE_DATA event with { place: last uploaded data Address, percent: uploading progress} */
            });
        });

        /**Client emits UPLOAD event with FileName and Chunk Size Buffer data from last Place */
        this.socket.on('UPLOAD', (file: any) => {
            let fileName = file.name;
            this.files[fileName]['downloaded'] += file.data.length; /**calculates uploaded data from sum of all received chunks at the moment */
            this.files[fileName]['data'] += file.data;              /**Appends received chunk data with all previously received chunks */

            //file fully uploaded
            if(this.files[fileName]['downloaded'] == this.files[fileName]['fileSize']){

                /**Writes the file to destination Path */
                write(this.files[fileName]['handler'], this.files[fileName]['data'], null, 'Binary', (err, written) => {
                    //Thumbnail
                    //generateThumb(`${this.uploadPath}/${fileName}`, `${this.thumbPath}/`)
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
                    socket.emit('DONE', { thumb: 0 });      //succecss response sends thumbnail
                });
            }
            //If the Data Buffer reaches 10MB
            else if(this.files[fileName]['data'].length > 10485760){

                /**Writes 10mb buffer to memory */
                write(this.files[fileName]['handler'], this.files[fileName]['data'], null, 'Binary', (err, written) => {
                    this.files[fileName]['data'] = '';      //Resets buffer to 0
                    
                    let place = this.files[fileName]['downloaded'] / 524288;
                    let percent = (this.files[fileName]['downloaded'] / this.files[fileName]['fileSize']) * 100;
                    socket.emit('MORE_DATA', {place, percent});
                })
            }
            /**Request MORE_DATA from client but buffer not reached at 10mb */
            else{
                let place = this.files[fileName]['downloaded'] / 524288;
                let percent = (this.files[fileName]['downloaded'] / this.files[fileName]['fileSize']) * 100;
                socket.emit('MORE_DATA', {place, percent});
            }
        })

        /**Client emits cancel events to cancel uploading
         * Demands: fileNames array which are uploading
         *  { files: [fileName1, Filename2, ....]}
         */
        this.socket.on('cancel', async (data: any)=> {
            let count:number = 0 ;                              /**count: no. of files deleted from server */
            try{
                let filesArr = data.files;
                for (let i = 0; i< filesArr.length; i++){
                    let stat = statSync(`${this.uploadPath}/${filesArr[i]}`);   /**read file from memory if not available- throws error */
                    if (stat.isFile()){
                        await new Promise((resolve, reject) => {
                            /**Delets file from memory */
                            unlink(`${this.uploadPath}/${filesArr[i]}`, () => {
                                count = count + 1;           /**Deleted files count increase */
                                console.log('Delete ', count)
                                resolve()
                            })
                        }).catch(() => console.log('deletion err'))
                    }
                    /**when For loops ends iterations */
                    if(i === filesArr.length-1){
                        console.log('All files cancel done');
                        socket.emit('cancel-done', {count}); /**emits cancel-done event to client with deleted files count */
                    }
                }
            }
            catch(e){
                console.log('No such file');
                socket.emit('cancel-done', {count});         /**if file not available- emits cancel-done event */
            }
        })

        this.socket.on('disconnect', ()=>{
            console.log('user disconnected');
        })
    }
}

export { SocketUpload }