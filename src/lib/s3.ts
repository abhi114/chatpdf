import AWS from 'aws-sdk'

//The File interface provides information about files and allows JavaScript in a web page to access their content.
//File objects are generally retrieved from a FileList object returned as a result of a user selecting files using the <input> element, or from a drag and drop operation's DataTransfer object.
export async function uploadToS3(file: File) {
    try{
        AWS.config.update({
            accessKeyId:process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID,
            secretAccessKey:process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY,
        });
        const s3 = new AWS.S3({
            params:{
                Bucket:process.env.NEXT_PUBLIC_S3_BUCKET_NAME
            },
            region:'ap-south-1'
        })
        const file_key = 'uploads/' + Date.now().toString() + file.name.replace(' ','-')
        const params = {
            Bucket:process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
            Key:file_key,
            Body:file
        }
        const upload = s3.putObject(params).on('httpUploadProgress',evt => {
            console.log('uploading to s3...' ,parseInt(((evt.loaded*100/evt.total).toString()))+ '%');
        }).promise();

        await upload.then(data => {
            console.log("successfully uploaded to s3 !",file_key);

        })
        return Promise.resolve({
            file_key,
            file_name:file.name
        })
    }catch(err){

    }
}

//to retrieve the file object back so that we can show it in the chats screen
export function getS3Url(file_key: String){
    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.ap-south-1.amazonaws.com/${file_key}`;
    return url
}