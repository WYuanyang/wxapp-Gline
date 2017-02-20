// pages/Gline/index.js
Page({
  data:{
    canvWidth:750,
    canvHeight:750,
    stations:['北京南','天津南','济南西','泰安','滕州东','徐州东','南京南','镇江南','苏州北','上海虹桥','北京南','天津南','济南西','泰安','滕州东','徐州东','南京南','镇江南','苏州北','上海虹桥','北京南','天津南','济南西','泰安','滕州东','徐州东','南京南','镇江南','苏州北','上海虹桥'],
    chooseStation:'',//页面显示选中的车站名字
    prevChooseIdx:null,//上一次选中车站的下标
    // stations:['北京南','天津南','济南西','泰安'],
  },
  onLoad:function(options){
    // 页面初始化 options为页面跳转所带来的参数
    // this.setData({canvHeight:502});
    const ctx = wx.createCanvasContext('map');//路线图绘制的画布上下文对象
    this.ctx = ctx;//将ctx对象绑定到当前页面中
    this.column = 3;//每行显示车站数量
    this.offsetTop = 30;//绘制起始坐标的top值，也就是距离canvas顶部的距离
    this.rect={//圆角矩形对象
      img_b:'/images/rect-b.png',//初始时图片
      img_g:'/images/rect-g.png',//选中时图片
      height:32,
      width:68
    }
    this.line = {//站与站之间的连线对象
      img:'/images/line.png',
      height:6,
      width:30
    },
    this.bendLine = {//站与站之间弯曲的连线
      img_l:'/images/line_l.png',//左侧连线
      img_r:'/images/line_r.png',//右侧连线
      height:70,
      width:20
    },
    this.rectArr=[];//记录所有车站的绘制起始点的坐标的数组
    this.oddRowIndexArr=[];//记录奇数行的车站的下标数组，如[0,1,2,6,.....]
    this.evenRowIndexArr=[];//记录偶数行的车站的下标数组，如[3,4,5,9,.....]
    this.initMap();
  },
  onReady:function(){

  },
  onShow:function(){
    // 页面显示
  },
  onHide:function(){
    // 页面隐藏
  },
  onUnload:function(){
    // 页面关闭
  },
  //对不同设备下图片大小的适配
  adaptiveScreenSize:function(o){
    let ww = this.data.winWidth;
    let zoom = ww/375;//375这里是按iPhone6的宽度做等比缩放
    this.setData({zoom:zoom});
    let rectW = o.width*zoom;
    let rectH = o.height*zoom;
    o.width = rectW;
    o.height = rectH;
  },
  //初始化路线图的方法
  initMap:function(){
    const that = this;
    wx.getSystemInfo({
      success: function(res){
        const ww = res.windowWidth;
        const pr = res.pixelRatio;
        that.setData({ winWidth:ww,pixelRatio:pr});//将设备的信息存入data中，供后面使用
        that.drawMap();
      }
    })
  },
  drawTxtAtPos:function(idx){
    const rectArr = this.rectArr;
    const w = this.rect.width;
    const h = this.rect.height;
    let txt = this.data.stations[idx];
    let len = txt.length;
    //当站点文本文字超过3个字，将缩小字号
    let fontSize = len>3?12:14;
    let x = rectArr[idx].x;
    let y = rectArr[idx].y;
  	//计算文本在圆角矩形中的绘制点，使文字居中显示
    let txt_x = Math.floor((w - len*fontSize)/2)+x;
    let txt_y = Math.floor(h/2+fontSize/2)+y-2;//这里额外-2，文本才能更接近垂直居中
    this.ctx.setFontSize(fontSize);
    this.ctx.setFillStyle('#ffffff')
    this.ctx.fillText(txt, txt_x, txt_y);
  },
  //在下标为idx处绘制圆角矩形
  initRect:function(idx){
    const rectArr = this.rectArr;
    let x = rectArr[idx].x;
    let y = rectArr[idx].y;
    this.ctx.drawImage(this.rect.img_b,x, y, this.rect.width, this.rect.height);
  },
  //动态计算不同屏幕大小canvas的高度
  initCanvHeight:function(){
    let len = this.data.stations.length;
    let pr = this.data.pixelRatio;
    let z = this.data.zoom;
    let row = Math.ceil(len/this.column);
    let h = 0;
    if(row <= 1){
      console.log(this.rect.height);
      h = (this.offsetTop*2 + this.rect.height)*2;
    }else{
       h = this.offsetTop*2+(row-1)*(this.bendLine.height-this.line.height)+this.rect.height;
    }
   this.setData({canvHeight:h});

  },
  //绘制线路这逻辑比较乱，我是把路线分为奇数段和偶数段进行绘制
  drawLine:function(){
    const rectArr = this.rectArr;
    let x=0,y=0; 
    if(rectArr.length==2){//首先当车站数量为2个的时候，只需绘制一条线段
        x = rectArr[0].x+this.rect.width;//计算绘制线段起始点的x坐标
        y = rectArr[0].y+Math.floor((this.rect.height-this.line.height)/2);//计算绘制线段起始点的y坐标
        this.ctx.drawImage(this.line.img, x, y, this.line.width, this.line.height);

    }else{
    	
      const odd = this.oddRowIndexArr;
      const even = this.evenRowIndexArr;
      
      if(odd.length>0){
        for(let i=0;i<odd.length;i++){
          if((odd[i]+1)!=rectArr.length){//判断当前下标绘制点后面是否还有绘制点
            x = rectArr[odd[i]].x+this.rect.width;
            y = rectArr[odd[i]].y+Math.floor((this.rect.height-this.line.height)/2);
            if((odd[i]+1)%this.column!=0){//判断奇数行绘制点的下标如果不是3的整数倍将绘制一条直线，反之绘制右曲线
              this.ctx.drawImage(this.line.img, x, y, this.line.width, this.line.height);
            }else{
              this.ctx.drawImage(this.bendLine.img_r, x, y, this.bendLine.width, this.bendLine.height);
            }
          }
        }
      }
      //下面逻辑同奇数行的逻辑，不同的是绘制直线和弯曲线时x的坐标会有变化
      if(even.length>0){
        for(let i=0;i<even.length;i++){
          if((even[i]+1)!=rectArr.length){
            y = rectArr[even[i]].y+Math.floor((this.rect.height-this.line.height)/2);
            if((even[i]+1)%this.column!=0){
              x = rectArr[even[i]].x-this.line.width;//绘制直线时的计算公式
              this.ctx.drawImage(this.line.img, x, y, this.line.width, this.line.height);
            }else{
              x = rectArr[even[i]].x-this.bendLine.width;//绘制弯曲线时的计算公式
              this.ctx.drawImage(this.bendLine.img_l, x, y, this.bendLine.width, this.bendLine.height);
            }
          }
        }
      }
      
    }
    
  },
  drawMap:function(){
	
    this.adaptiveScreenSize(this.rect);
    this.adaptiveScreenSize(this.line);
    this.adaptiveScreenSize(this.bendLine);
    this.initCanvHeight();
    this.createRectTopPoints();
    // setTimeout(()=>{
      const rectArr = this.rectArr; 
      for(let i=0;i<rectArr.length;i++){
        this.initRect(i);
        this.drawTxtAtPos(i);
      }
      this.ctx.draw(true);
    // },500);
    this.drawLine();
    this.ctx.draw(true);
  },
  //计算后，每行的所有绘制点的起始坐标x值是一个固定数组
  //如：奇数行[10,20,30]，偶数行：[30,20,10]
  getDisXArr:function(){
    let arr = [];
    let ww = this.data.winWidth;
    let disX = Math.floor((ww-(this.column*this.rect.width+(this.column-1)*this.line.width))/2); 
    for(let i=0;i<this.column;i++){
      let x = disX+i%this.column*(this.rect.width+this.line.width);
      arr[i] = x;
    }  
    return arr;
  },
  //根据给出的车站数量，将每个车站的绘制顶点计算出来存入数组rectArr中
  createRectTopPoints:function(){
    let rectArr = [];
    let disXArr = this.getDisXArr();
    let disXArrRev = this.getDisXArr().reverse();
    let disY = this.offsetTop;//绘制初始点距离canvas顶部的高度
    let len = this.data.stations.length;
    let row = Math.ceil(len/this.column);//根据车站数量计算需要绘制的行数
    let n=0,x=0,y=0;
    for(let j = 1;j<=row;j++){
      for(let i=0;i<this.column;i++){
        ++n;
        if(n<=len){
          if(j%2!=0){
            this.oddRowIndexArr.push(n-1);
            //console.log("奇数行："+n);
            x = disXArr[i];
          }else{
            this.evenRowIndexArr.push(n-1);
            //console.log("偶数行："+n);
            x = disXArrRev[i];
          }
          y = disY + (j-1)*(this.bendLine.height-this.line.height);
          this.rectArr[n-1] = {x:x,y:y};
        }
        
      }
    }
    
  },
  //判断手指触摸点是否在圆角矩形中
  pointInRectPolygon : function (point, vs) {
    let x = point[0], y = point[1],inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i][0], yi = vs[i][1];
        let xj = vs[j][0], yj = vs[j][1];
        
        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  },
	//根据某个圆角矩形的绘制点和宽高，计算出圆角矩形4个顶点的坐标值
	//顺序为左上，右上，右下，左下，也就是顺时针方向
  getRectPolygon:function(x,y,w,h){
    let vs = new Array() ;
    vs[0] = [x,y];
    vs[1] = [x+w,y];
    vs[2] = [x+w,y+h];
    vs[3] = [x,y+h];

    return vs;
  } ,
  //点击车站调取的事件，事件中需要处理：
  //1、需要获取到当前点击的车站文本
  //2、判断是否有过选取，如果之前有选取，需要将之前选取过的区块颜色改为默认色
  //3、改变当前区块的颜色
  //4、记录当前点击的下标
  chooseStation:function(currIdx){
    let txt = this.data.stations[currIdx];
    let prevIdx = this.data.prevChooseIdx;
    if(prevIdx!=null){
      let x = this.rectArr[prevIdx].x;
      let y = this.rectArr[prevIdx].y;
      this.ctx.drawImage(this.rect.img_b,x, y, this.rect.width, this.rect.height);
      this.drawTxtAtPos(prevIdx);
    }
    let x = this.rectArr[currIdx].x;
    let y = this.rectArr[currIdx].y;
    this.ctx.drawImage(this.rect.img_g,x, y, this.rect.width, this.rect.height);
    this.drawTxtAtPos(currIdx);
    this.ctx.draw(true);
    this.setData({chooseStation:txt,prevChooseIdx:currIdx});
  },
  //点击事件
  touchS:function(e){
    console.log(e);
    let touch = e.changedTouches;//这里一定要用changedTouches，如果用touches,安卓机会有问题
    if(touch.length==1){
      let tapPoint = [touch[0].x,touch[0].y];
      let rectArr = this.rectArr;
      for(let i=0;i<rectArr.length;i++){
        let vs = this.getRectPolygon(rectArr[i].x,rectArr[i].y,this.rect.width,this.rect.height);
        let inside = this.pointInRectPolygon(tapPoint,vs);
        if(inside){
          this.chooseStation(i);
          break;
        }
      }
      
    }
  }
})