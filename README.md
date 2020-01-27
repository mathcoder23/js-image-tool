# image-tool
提供上传图片的压缩，exif手机图片的方向矫正

# 使用方法
## 导入
``` js  
 import {ImageTool} from "image-tool";
```
## file转base64
``` js
ImageTool.imgCompressAndOrientationAdjust(file).then(base64=>{
    //base64
})
```
## file转blob
``` js
ImageTool.imgCompressAndOrientationAdjust2Blob(file).then(blob=>{
    //blob
})
```
>默认压缩为800*800,若要配置压缩参数在第二参数传入对象
{w:800,h:800}
