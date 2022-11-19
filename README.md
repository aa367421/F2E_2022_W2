# [The F2E 2022 W2](https://2022.thef2e.com/news/week2)


### **[UI design from K-T　UI 設計稿來自K-T　(https://2022.thef2e.com/users/12061579703802991521)](https://2022.thef2e.com/users/12061579703802991521)**


## [DEMO（https://aa367421.github.io/F2E_2022_W2/index.html）](https://aa367421.github.io/F2E_2022_W2/index.html)


## Work Description 作品說明


The F2E 2022 第二關的作品，感謝有這個機會讓我接觸到了 PDF 跟 JS 的各種奇妙碰撞……

也再次感謝 [K-T 大大的設計稿](https://2022.thef2e.com/users/12061579703802991521)，這週比較忙所以只完成一部份功能，以及手機瀏覽的流程QQ


## Project Description 系統說明


以 npm 引入 vue 做簡單的訊息回饋、 localstorage 處理，以及簡化一些按鈕的監聽、頁面切換、lottie.js 儲存在本機，其餘均用 cdn 方式引用


## Folder Description 資料夾說明

* img : [K-T](https://2022.thef2e.com/users/12061579703802991521) 提供的圖片們
* js : JavaScript 檔案們
* sass : sass 檔案們
* css : sass 編譯過後的 css 檔案們
* node_modules : npm 引入的檔案們

* 檔案名稱：
  - ./js 中的 lottie.min : 負責讀取 .json 動畫檔


## Technology & Library 使用技術


* Normalize CSS
* SASS
* GSAP 
  - 主要的動態達成、頁面切換
* lottie
  - 讀取 .json 動畫檔
* PDF.js, fabric.js, jsPDF
  - 搭配 canvas 達成簽名與儲存
 

## Other and Features 其他想說的話與記給自己的一些特別花時間的技術點


沒有時間把技術文件吃透徹，邊寫邊補還是痛苦……

### File Reader 

練習中重新摸索的部分，包括上傳的檔案格式、大小限制，以及後續的讀取、取內容、轉成 PDF 貼上 canvas ，滿滿的坑，但至少有完成了匯入 PDF 檔 到成功匯出的部分QQ

### img with fabric.js

圖片部分沒有成功讓他變成可以被貼上簽名的部分，如果時間夠多，可能會想試試先把 img 轉為 fabric canvas 作為底層容器，再接續完成後續的部分


以上！如果有問題、建議、討論都歡迎發 issue 或是 mail : aa367421@gmail.com ～
see you!


### 已知問題

* 只完成手機端 PDF 上傳、匯出部分，不支援圖片作為底層被簽署文件，設想的解決方法如技術點提到的 img with fabric.js
* 未完成歷史記錄部分，設想的解決方法是將做好的 PDF 轉成 base64 存進 localstorage 後再重新轉回 PDF 渲染回網頁上
* 未完成簽名跳窗裡的新增簽名 / 刪除簽名功能，設想的解決方法是直接動 vue 裡面的資料來處理
* 未完成簽名檔的資料結構處理，以 localstorage 處理還是有很多限制，設想的解決方法是好好地開一個資料庫、弄好結構之後接回來QQ
* 下載下來的 PDF 檔案解析度偏低，應該在 PDF.js, fabric.js, jsPDF 中會有辦法能夠解決？


## [DEMO（https://aa367421.github.io/F2E_2022_W2/index.html）](https://aa367421.github.io/F2E_2022_W2/index.html)


### **[UI design from K-T　UI 設計稿來自K-T　(https://2022.thef2e.com/users/12061579703802991521)](https://2022.thef2e.com/users/12061579703802991521)**


from 2022/11/15 - 2022/11/19, about 20 - 24 hours

