/** SocketUpload class demands socket object created by Socket.IO at the creation of instance if class */
declare class SocketUpload {
    private socket; /**Socket object - Provide at new Instance creation of SocketUpload */
    private files;
    uploadPath: string; /**Path for saving Files */
    thumbPath: string; /**Path for saving Thumbnails */
    constructor(socket: any);
}
export { SocketUpload };
