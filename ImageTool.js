import EXIF from "exif-js";
let loadExif = (file)=>{
    return new Promise((resolve,reject)=>{
        EXIF.getData(file, ()=> {
            EXIF.getAllTags(file);
            resolve(file)
        });
    })
}
let exifRotateAngle = (file)=>{
    return new Promise((resolve,reject)=>{
        let angle = 0
        loadExif(file).then(f=>{
            if(f.exifdata && f.exifdata.Orientation){
                let orientation = f.exifdata.Orientation
                if(6 === orientation){
                    angle = 90
                }else if(8 === orientation){
                    angle = -90
                }else if(3 === orientation){
                    angle = 180
                }
            }
            f['angle'] = angle
            resolve(f)
        })
    })
}
let base64ToBlob = (base64,type)=>{
    let arr = base64.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let bytes = atob(arr[1])
    let bytesLength = bytes.length
    let u8arr = new Uint8Array(bytesLength)
    for (let i = 0; i < bytes.length; i++) {
        u8arr[i] = bytes.charCodeAt(i)
    }
    let blob = new Blob([u8arr], { type: type })
    return blob
}
let imgWidthHeightCompress = (width,height,config)=>{
    if('undefined' === typeof config){
        config = {w:800,h:800}
    }
    let compress = {}
    let scale = width/height
    if(width > config.w || height > config.h){
        if(width>height){
            compress.width = config.w
            compress.height = parseInt(config.w/scale)
        }else{
            compress.height = config.h
            compress.width = parseInt(scale*config.h)
        }
    }else{
        compress.width = width
        compress.height = height
    }
    return compress
}
let imgWidthHeightRotateCanvas = (width,height,degress)=>{
    degress = degress % 180
    let w = width*Math.abs(Math.cos(degress*Math.PI/180))+height*Math.sin(degress*Math.PI/180)
    let h = width*Math.sin(degress*Math.PI/180)+height*Math.abs(Math.cos(degress*Math.PI/180))
    return {
        width:parseInt(w),
        height:parseInt(h)
    }
}
let imgCompressAndOrientationAdjust = (file,compressConfig)=>{
    return new Promise((resolve)=>{
        exifRotateAngle(file).then(file=>{
            let reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = ()=>{
                let img = new Image()
                img.src = reader.result
                img.onload = ()=>{
                    console.log('img',img)
                    let canvas = document.createElement("canvas");
                    let ctx = canvas.getContext("2d");
                    if(file.exifdata && file.exifdata.ImageWidth){
                        let compress = imgWidthHeightCompress(file.exifdata.ImageWidth,file.exifdata.ImageHeight,compressConfig)
                        let angle = file.angle
                        let rotateCanvas = imgWidthHeightRotateCanvas(compress.width,compress.height,angle)
                        canvas.width =rotateCanvas.width
                        canvas.height = rotateCanvas.height
                        ctx.translate(canvas.width/2,canvas.height/2)
                        ctx.rotate(angle*Math.PI/180)
                        ctx.drawImage(img,-compress.width/2,-compress.height/2,compress.width,compress.height)
                    }else{
                        let compress = imgWidthHeightCompress(img.width,img.height,compressConfig)
                        canvas.width =compress.width
                        canvas.height = compress.height
                        ctx.drawImage(img,0,0,compress.width,compress.height)
                    }

                    let base64 = canvas.toDataURL(file.type, 1);
                    resolve(base64)
                }
            }
        })
    })
}
let imgCompressAndOrientationAdjust2Blob = (file,compressConfig)=>{
    return new Promise((resolve,reject)=>{
        imgCompressAndOrientationAdjust(file,compressConfig).then(base64=>{
            resolve(base64ToBlob(base64,file.type))
        })
    })
}
export const ImageTool = {
    imgCompressAndOrientationAdjust:imgCompressAndOrientationAdjust,
    imgCompressAndOrientationAdjust2Blob:imgCompressAndOrientationAdjust2Blob
}