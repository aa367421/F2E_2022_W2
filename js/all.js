const vm = Vue.createApp({
    data(){
        return {
            alertMsg: '',
            loadingMsg: '',
            signSectionMsg: '在此書寫你的簽名',
            downloadResultMsg: '',
            pdfLocalStorage: [],
            signLocalStorage: [null, null, null],
            nowPageInEdit: 1,
            pdfPagesInEdit: 1,
        }
    },
    methods:{
        confirmAlert(){
            document.querySelectorAll('.alert-section > div').forEach(el => {
                gsap.to(el, {
                    display: 'none',
                    opacity: 0,
                    duration: 0.2
                })
            })
            gsap.to('.alert-section', {
                display: 'none',
                opacity: 0,
                duration: 0.2
            })
        },
        prevPageInEdit(e){
          if (e.target.closest('button').classList.contains('disabled') == true){
            return
          }
          document.querySelector('.edit-pdf-section .page-btn-group .next-page-btn').classList.remove('disabled');
          let nowPage = vm.$data.nowPageInEdit;
          let prevCavasContainer = document.querySelector(`canvas[data-page="${nowPage - 1}"]`).parentElement
          prevCavasContainer.style.display = 'block';
          vm.$data.nowPageInEdit -= 1;
          if (vm.$data.nowPageInEdit == 1){
            document.querySelector('.edit-pdf-section .page-btn-group .prev-page-btn').classList.add('disabled');
          }
        },
        nextPageInEdit(e){
          if (e.target.closest('button').classList.contains('disabled') == true){
            return
          }
          document.querySelector('.edit-pdf-section .page-btn-group .prev-page-btn').classList.remove('disabled');
          let nowPage = vm.$data.nowPageInEdit;
          let nowCavasContainer = document.querySelector(`canvas[data-page="${nowPage}"]`).parentElement
          nowCavasContainer.style.display = 'none';
          vm.$data.nowPageInEdit += 1;
          if (vm.$data.nowPageInEdit == vm.$data.pdfPagesInEdit){
            document.querySelector('.edit-pdf-section .page-btn-group .next-page-btn').classList.add('disabled');
          }
        },
        toHomePage(){
          this.$options.methods.confirmAlert.bind(this);
          document.querySelectorAll('.container > section').forEach(el => {
            gsap.to(el, {
                display: 'none',
                opacity: 0,
                duration: 0.2
            })
          })
          gsap.to('.cover-section', {
            display: 'block',
            opacity: 1,
            delay: 0.2
          })
          this.alertMsg = '';
          this.loadingMsg = '';
          this.signSectionMsg = '在此書寫你的簽名';
          this.downloadResultMsg = '';
        }
    }
}).mount('#app')

for (let i=0; i<3; i++){
  let item = localStorage.getItem(`sign-img-${i}`)
  if (item !== null){
    vm.$data.signLocalStorage[i] = item;
  }
}

const coverPage = document.querySelector('.cover-section');
const toRecordBtn = document.querySelector('.to-record-btn');
const recordPage = document.querySelector('.record-section');
toRecordBtn.addEventListener('click', () => {
  coverPage.style.display = 'none';
  recordPage.style.display = 'block';
  recordPage.style.opacity = '1';
})
const loadingDiv = document.querySelector('.loading-ani');
lottie.loadAnimation({
    container: loadingDiv, // the dom element that will contain the animation
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: './img/json/GNsign_loading.json' // the path to the animation json
});

const Base64Prefix = "data:application/pdf;base64,";
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

// 使用原生 FileReader 轉檔
function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(blob);
  });
}

async function printPDF(pdfData) {
  // 將檔案處理成 base64
  pdfData = await readBlob(pdfData);
  // 將 base64 中的前綴刪去，並進行解碼
  const data = atob(pdfData.substring(Base64Prefix.length));

  // 利用解碼的檔案，載入 PDF 檔及每一頁
  const pdfDoc = await pdfjsLib.getDocument({ data }).promise;
  let numPages = pdfDoc._pdfInfo.numPages;
  let canvasAry = [];
  for(let i=1; i<=numPages; i++){
    let pdfPage = await pdfDoc.getPage(i);
    let viewport = pdfPage.getViewport({ scale: window.devicePixelRatio });
    let canvas = document.createElement("canvas");
    let context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    let renderContext = {
      canvasContext: context,
      viewport,
    };
    let renderTask = pdfPage.render(renderContext);
    renderTask.promise.then(() => canvas);
    canvasAry.push(canvas);
  }
  return canvasAry;
}

async function pdfToImage(pdfData) {

  // 設定 PDF 轉為圖片時的比例
  const scale = 1 / window.devicePixelRatio;

  // 回傳圖片
  return new fabric.Image(pdfData, {
    id: "renderPDF",
    scaleX: scale,
    scaleY: scale,
  });
}


const fabricAry = []
// 此處 canvas 套用 fabric.js
const fileInput = document.querySelector('input#file-upload');
fileInput.addEventListener('change', async (e) => {
    let file = e.target.files[0];
    let reg = /\.(pdf|jpg|jpeg)$/i;
    let imgReg = /\.(|jpg|jpeg)$/i;
    if (file.size > 10485760){ // 10 mb
      gsap.to('.alert-section', {
          display: 'flex',
          opacity: 1,
          duration: 0.2
      })
      gsap.to('.file-alert-block', {
          display: 'flex',
          opacity: 1,
          duration: 0.2
      })
      vm.$data.alertMsg = '檔案超過10MB，請重新選擇';
      fileInput.value = '';
      return
    }
    if (!reg.test(file.name)){
        gsap.to('.alert-section', {
            display: 'flex',
            opacity: 1,
            duration: 0.2
        })
        gsap.to('.file-alert-block', {
            display: 'flex',
            opacity: 1,
            duration: 0.2
        })
        vm.$data.alertMsg = '檔案格式錯誤，請重新選擇';
        fileInput.value = '';
        return
    }
    vm.$data.loadingMsg = '上傳中...';
    gsap.to('.loading-section', {
        display: 'flex',
        opacity: 1
    })
    if (imgReg.test(file.name)){
      let imgReader = new FileReader();
      imgReader.onload = function(event){
        let img = new Image();
        img.onload = () => {
            const canvasNew = document.createElement("canvas");
            document.querySelector('.edit-pdf-canvas').appendChild(canvasNew);
            const ctx = canvasNew.getContext("2d");
            canvasNew.width = img.width;
            canvasNew.height = img.height;
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
      }
      imgReader.readAsDataURL(e.target.files[0]);   
    } else {
      const pdfData = await printPDF(file);
      vm.$data.pdfPagesInEdit = pdfData.length;
      for(let i=0; i<pdfData.length; i++){
        const canvasNew = document.createElement("canvas");
        canvasNew.dataset.page = i + 1;
        document.querySelector('.edit-pdf-canvas').appendChild(canvasNew);
        fabricAry[i] = new fabric.Canvas(canvasNew);
        fabricAry[i].requestRenderAll();
        let pdfImage = await pdfToImage(pdfData[i]);
        fabricAry[i].setWidth(pdfImage.width / window.devicePixelRatio);
        fabricAry[i].setHeight(pdfImage.height / window.devicePixelRatio);
        fabricAry[i].setBackgroundImage(pdfImage, fabricAry[i].renderAll.bind(fabricAry[i]));
        let img = new Image();
        fabric.Image.fromURL(img.src, (img) => {
          // 沒先貼一張圖的話會最後兩頁都無法顯示，dunno why
          // 目前最後一頁也仍然不顯示，但簽名後會顯示，或儲存後也正常，dunno why
          // 設定簽名出現的位置及大小，後續可調整
          img.top = -1;
          img.scaleX = 0;
          img.scaleY = 0;
          fabricAry[i].add(img);

        });
      }
    }
    if (vm.$data.pdfPagesInEdit == 1){
      document.querySelector('.edit-pdf-section .next-page-btn').classList.add('.disabled');
    }
    gsap.to('.loading-section', {
        display: 'none',
        opacity: 0,
        duration: 1
    })
    gsap.to('.cover-section', {
        display: 'none',
        opacity: 0,
        duration: 0
    })
    gsap.to('.sign-section', {
        display: 'flex',
        opacity: 1
    })
    vm.$data.loadingMsg = '';
    e.target.value = '';
});

const signTopBtnGroup = document.querySelector('.sign-section .top-btn-group');
const signCanvas = document.querySelector('#sign-canvas');
const ctx = signCanvas.getContext('2d');
const clearBtn = document.querySelector('.sign-section .clean-btn');
const createBtn = document.querySelector('.sign-section .create-btn')
const changeColorBtnGroup = document.querySelector('.stroke-color-btn-group');
const changeColorBtn = document.querySelectorAll('.stroke-color-btn-group button')
const canvasSignHint = document.querySelector('.sign-canvas-div .canvas-bg-hint')
signTopBtnGroup.addEventListener('click', (e) => {
  if (e.target.nodeName !== 'BUTTON'){
    return
  }
  signTopBtnGroup.childNodes.forEach(button => {
    button.classList.remove('active');
  })
  e.target.classList.add('active');
  if (e.target.dataset.type == 'hand'){
    document.querySelector('.sign-section .stroke-color-btn-group').style.display = 'flex';
    document.querySelector('.sign-section .sign-upload').classList.remove('active');
    vm.$data.signSectionMsg = '在此書寫你的簽名';
  } else {
    document.querySelector('.sign-section .stroke-color-btn-group').style.display = 'none';
    document.querySelector('.sign-section .sign-upload').classList.add('active');
    vm.$data.signSectionMsg = '請選擇檔案';
  }
})
changeColorBtnGroup.addEventListener('click', (e) => {
    let colorMap = ['#000000', '#0014C7', '#CA0000']
    let id = e.target.dataset.id;
    if (e.target.nodeName === 'BUTTON'){
        changeColorBtn.forEach(el => {
            el.classList.remove('active');
        })
        e.target.classList.add('active');
        ctx.strokeStyle = colorMap[id];
    }
})
// 設定線條的相關數值
ctx.lineWidth = 4;
ctx.lineCap = 'round';

// 設置狀態來確認滑鼠 / 手指是否按下或在畫布範圍中
let isPainting = false;

// 取得滑鼠 / 手指在畫布上的位置
function getPaintPosition(e) {
  const canvasSize = signCanvas.getBoundingClientRect();

  if (e.type === "mousemove") {
    return {
      x: e.clientX - canvasSize.left,
      y: e.clientY - canvasSize.top,
    };
  } else {
    return {
      x: e.touches[0].clientX - canvasSize.left,
      y: e.touches[0].clientY - canvasSize.top,
    };
  }
}

// 開始繪圖時，將狀態開啟
function startPosition(e) {
  e.preventDefault();
  isPainting = true;
}

// 結束繪圖時，將狀態關閉，並產生新路徑
function finishedPosition() {
  isPainting = false;
  ctx.beginPath();
}

// 繪圖過程
function draw(e) {
  // 滑鼠移動過程中，若非繪圖狀態，則跳出
  if (!isPainting) return;
  // 取得滑鼠 / 手指在畫布上的 x, y 軸位置位置
  canvasSignHint.classList.remove('active');
  const paintPosition = getPaintPosition(e);
  // 移動滑鼠位置並產生圖案
  // 手機繪圖不知道為什麼位置有偏差，稍微加上一個調整值讓他合理一點點
  ctx.lineTo(paintPosition.x/1.2, paintPosition.y/1.7);
  ctx.stroke();
}

// 重新設定畫布
function reset() {
    canvasSignHint.classList.add('active');
    ctx.clearRect(0, 0, signCanvas.width, signCanvas.height);
}

// event listener 電腦板
signCanvas.addEventListener("mousedown", startPosition);
signCanvas.addEventListener("mouseup", finishedPosition);
signCanvas.addEventListener("mouseleave", finishedPosition);
signCanvas.addEventListener("mousemove", draw);

// event listener 手機板
signCanvas.addEventListener("touchstart", startPosition);
signCanvas.addEventListener("touchend", finishedPosition);
signCanvas.addEventListener("touchcancel", finishedPosition);
signCanvas.addEventListener("touchmove", draw);

clearBtn.addEventListener('click', reset);
createBtn.addEventListener('click', () => {
  vm.$data.loadingMsg = '簽名優化中...';
  gsap.to('.loading-section', {
    display: 'flex',
    opacity: 1,
    duration: 1
  })
  gsap.to('.sign-section', {
    display: 'none',
    opacity: 0,
    duration: 1
  })

  let id = vm.$data.signLocalStorage.findIndex(item => item == null);
  if (id == -1){
    id = 0
  }
  const newImgUrl = signCanvas.toDataURL("image/png");
  localStorage.setItem(`sign-img-${id}`, newImgUrl);
  for (let i=0; i<3; i++){
    let item = localStorage.getItem(`sign-img-${i}`)
    if (item !== null){
      vm.$data.signLocalStorage[i] = item;
    }
  }

  gsap.to('.loading-section', {
    display: 'none',
    opacity: 0,
    duration: 1,
    delay: 1
  })
  gsap.to('.edit-pdf-section', {
    display: 'flex',
    opacity: 1,
    duration: 1,
    delay: 1
  })

  reset();
})

const signUploadInput = document.querySelector('#sign-upload');
signUploadInput.addEventListener('change', async (e) => {
  let file = e.target.files[0];
  let imgReg = /\.(|jpg|jpeg)$/i;
  if (file.size > 10485760){ // 10 mb
    gsap.to('.alert-section', {
        display: 'flex',
        opacity: 1,
        duration: 0.2
    })
    gsap.to('.file-alert-block', {
        display: 'flex',
        opacity: 1,
        duration: 0.2
    })
    vm.$data.alertMsg = '檔案超過10MB，請重新選擇';
    signUploadInput.value = '';
    return
  }
  if (!imgReg.test(file.name)){
    gsap.to('.alert-section', {
        display: 'flex',
        opacity: 1,
        duration: 0.2
    })
    gsap.to('.file-alert-block', {
        display: 'flex',
        opacity: 1,
        duration: 0.2
    })
    vm.$data.alertMsg = '檔案格式錯誤，請重新選擇';
    signUploadInput.value = '';
    return
  }
  let imgReader = new FileReader();
  imgReader.onload = function(event){
    let img = new Image();
    img.onload = () => {
        const ctx = signCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
    }
    img.src = event.target.result;
  }
  imgReader.readAsDataURL(file);
  vm.$data.signSectionMsg = '';
})

const editBtnGroup = document.querySelector('.edit-pdf-section .bottom-btn-group')
const toHomeBtn = document.querySelector('.edit-pdf-section .to-home-page-btn');
const finishBtn = document.querySelector('.edit-pdf-section .finish-btn');
const saveBtn = document.querySelector('.edit-pdf-section .save-btn');
finishBtn.addEventListener('click', () => {
  document.querySelector('.edit-pdf-section .save-btn').classList.add('active');
  finishBtn.classList.remove('active');
  toHomeBtn.classList.add('active');
  document.querySelector('.edit-pdf-section .bottom-btn-group').style.display = 'none';
})
toHomeBtn.addEventListener('click', () => {
  // 這部分沒有處理，有時間應該去查一下 jsPDF 有沒有相關的事件監聽 QQ
  /*********
  if ('還沒儲存'){
    gsap.to('.alert-section', {
      display: 'flex',
      opacity: 1,
      duration: 0.2
  })
  gsap.to('.file-load-block', {
      display: 'flex',
      opacity: 1,
      duration: 0.2
  })
  vm.$data.alertMsg = '尚未儲存文件，確定要離開且刪除？';
  return;
  *********/
})
saveBtn.addEventListener('click', () => {
  const pdf = new jsPDF();
  fabricAry.forEach((canvas, index, ary) => {
    const image = canvas.toDataURL("image/png");
  
    // 設定背景在 PDF 中的位置及大小
    const width = pdf.internal.pageSize.width;
    const height = pdf.internal.pageSize.height;
    pdf.addImage(image, "png", 0, 0, width, height);
    if (index < ary.length -1){
      pdf.addPage();
    }
  })
  // 將檔案取名並下載
  pdf.save("download.pdf");
  const resultDiv = document.querySelector('.result-ani');
  lottie.loadAnimation({
    container: resultDiv, // the dom element that will contain the animation
    renderer: 'svg',
    loop: false,
    autoplay: true,
    path: './img/json/ok.json' // the path to the animation json
  });
  gsap.to('.download-result-section', {
    display: 'block'
  })
  vm.$data.downloadResultMsg = '下載成功';
})
editBtnGroup.addEventListener('click', (e) => {
  if (e.target.nodeName !== 'BUTTON'){
    return
  }
  editBtnGroup.childNodes.forEach(btn => {
    btn.classList.remove('active');
  })
  e.target.closest('button').classList.add('active');
  gsap.to('.alert-section', {
    display: 'flex',
    opacity: 1
  })
  let action = e.target.dataset.type;
  let nowPage = vm.$data.nowPageInEdit;
  let canvas =  fabricAry[nowPage - 1];
  if (action == 'sign'){
    gsap.to('.sign-block', {
      display: 'flex',
      opacity: 1
    })
    let signList = document.querySelectorAll('.alert-section .sign-block .sign-div img');
    signList.forEach(img => {
      img.addEventListener('click', () => {
        fabric.Image.fromURL(img.src, (img) => {

          // 設定簽名出現的位置及大小，後續可調整
          img.top = 400;
          img.scaleX = 0.5;
          img.scaleY = 0.5;
          canvas.add(img);
        })
        gsap.to('.alert-section', {
          display: 'none',
          opacity: 0
        })
        gsap.to('.sign-block', {
          display: 'none',
          opacity: 0
        })
      })
    })
  }
  if (action == 'check'){
    let img = new Image();
    img.src = './img/icon/check.png'
    fabric.Image.fromURL(img.src, (img) => {

      // 設定簽名出現的位置及大小，後續可調整
      img.top = 400;
      img.scaleX = 2;
      img.scaleY = 2;
      canvas.add(img);
    })
    gsap.to('.alert-section', {
      display: 'none',
      opacity: 0,
      delay: 0.5
    })
  }
  if (action == 'date'){
    gsap.to('.alert-section', {
      display: 'none',
      opacity: 0,
      delay: 0.5
    })
    let dateObject = new Date();
    let yy = dateObject.getFullYear();
    let mm = dateObject.getMonth() + 1 > 10 ? dateObject.getMonth() + 1 : '0' + (dateObject.getMonth() + 1);
    let dd = dateObject.getDate() > 10 ? dateObject.getDate() : '0' + dateObject.getDate();
    const text = new fabric.Text(`${yy}/${mm}/${dd}`, {
      fontFamily: 'Roboto',
      fontWeight: 400
    });
    canvas.add(text);
  }
  if (action =='text'){
    gsap.to('.text-block', {
      display: 'flex',
      opacity: 1
    })
    let input = document.querySelector('.text-block .text-area');
    let cancelBtn = document.querySelector('.text-block .cancel-btn');
    let confirmTextBtn = document.querySelector('.text-block .confirm-btn');
    cancelBtn.addEventListener('click', () => {
      input.value = '';
      vm.$options.methods.confirmAlert();
    })
    confirmTextBtn.addEventListener('click', () => {
      const text = new fabric.Text(input.value, {
        fontFamily: 'Noto Sans TC',
        fontWeight: 400
      });
      canvas.add(text);
      gsap.to('.alert-section', {
        display: 'none',
        opacity: 0,
      })
      input.value = '';
    })
  }
})

document.querySelector('.alert-section').addEventListener('click', () => {
  vm.$options.methods.confirmAlert();
})