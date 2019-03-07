import  { thumb } from 'node-thumbnail';

export const generateThumb = (source: string, destination: string) => {
    thumb({
        source,
        destination,
        concurrency: 4,
        width: 200
    }, (files: any, err: any, stdout: any, stderr: any) => {
        console.log(files);
    })
}