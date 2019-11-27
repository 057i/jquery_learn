     // 面试笔试要点：
     //js加载时间线!!!
        //window.onload方法是当页面中所有资源加载完成后才触发的
        //DOM内容加载完成后才会执行window.onload,因为domcontented属于资源加载的一部分
        //下面先Dom contentLoaded，然后才是window.onload

        // window.onload=function(){
        //         console.log("window.onload")
        //     }
        //     //写法一
        //     // $(function(){
        //     //     console.log("Dom contentLoaded");//
        //     // })

        //     //写法二
        //     $(document).ready(function(){//完整的jQ写法
        //         console.log('Dom contentLoaded');
        //     })

        //封装jquery函数的核心，必须会！！！
        (function () {
            // jquery初始化方法
            function jQuery(selector) {
                return new jQuery.prototype.init(selector)
            }
            jQuery.prototype.init = function (selector) {
                this.length = 0;    //因为jquery对象都是用jQuery.prototype.init构造出来的，所以这里的this指向构造出来的那个对象
               //防止没有传参的时候或者.方式的时候还可以调用自身
                if(selector==null){
                    return this
                }
                if (typeof(selector)=='string' && selector.indexOf('#') != -1) {
                    var dom = document.getElementById(selector.slice(1));
                } else if (typeof(selector)=='string'&&selector.indexOf('.') != -1) {
                    var dom = document.getElementsByClassName(selector.slice(1));
                }
                // console.log(dom.length)
                if (selector instanceof Element||dom.length == undefined) {//为了防止参数传进来时候是dom对象或者其他的什么东西
                    this[0] = dom ||selector;
                    this.length++;
                } else {
                    for (var i = 0; i < dom.length; i++) {
                        this[i] = dom[i];
                        this.length++;
                    }
                }
            }
                    

            //封装Jquery上css方法
            jQuery.prototype.css = function (config) {
                for (var i = 0; i < this.length; i++) {//这里注意，选出来的元素不知道是一个还是一组，但是这个元素有length，所以可以按照length循环赋值属性
                    for (var prop in config) {//这里的config传进来的是一个对象，所以要对这个对象进行遍历处理
                        this[i].style[prop] = config[prop];
                    }
                }
                return this //为了链式操作做铺垫
            }


            // //封装Jquery上的get()方法，
            // //思路：括号里可以传参或者不传参，如果传参数的话只能是数字的下标，为了预防用户的错误传参，要做容错；如果不传参的话：返回的是一组原生dom对象
            jQuery.prototype.get=function(index){
                if(index==undefined||null || ''){     //如果传参为null和undefined做兼容性处理，等于不传参
                    return [].slice.call(this)//this为类数组，所以要是用call
                }else{
                    return index==-1?this[this.length-1]:this[index]  //用三木运算符预防传-1位置的情况
                }            
            }



            // // //封装get方法更牛逼的写法
            // // jQuery.prototype.get=function(index){
            // //     return index!=null?(index>=0?this[index]:this[this.length-1]):[].slice.call(this);
            // // }



            // //集中操作（重点！！！）
            // //思路：add操作是在已经使用jQ的$()方法筛选为基础上来再进行的操作；首先形参传入一个selector，再次调用选择器方法，
            // //      将它包转成一个jq对象，然后再原本选择器已经筛选出来的，在进行交操作，然后传入一个新的JQ对象，然后返回
            jQuery.prototype.add=function(selector){
                var curObj=jQuery(selector);
                var baseObj=this;
                var tarObj=jQuery();
                // console.log(curObj,baseObj)
                for(var i=0;i<curObj.length;i++){
                    tarObj[tarObj.length++]=curObj[i];
                }
                for(var j=0;j<baseObj.length;j++){
                    tarObj[tarObj.length++]=baseObj[j]
                }
                    console.log(tarObj)
                    this.pushStack(tarObj)
                    return tarObj
            }


        //eq()方法返回的带有被选元素的指定索引号的元素,通俗点就是选出一组元素然后按照索引号返回一个jq元素，
        //不会往子集去找，只会同级找，如果是find会往下一层去寻找,示例$(selector).eq(0)
            jQuery.prototype.eq=function(index){
                var eqTar = index !=null? (index>=0 ? this[index] : this[this.length+index]) : null;
                return this.pushStack(eqTar)
            }
         




            //jquery的一个精髓就是压栈出栈来进行链式操作，先进后出，
            // 当每执行一个操作时，将此次操作要执行的对象压入栈，
            //这样做的好处是顺序执行完还能按层级进行回退操作
            jQuery.prototype.pushStack=function(dom){
                if(dom.constructor!=jQuery){ //判断传入的对象是否是jq对象
                    dom=jQuery(dom)   
                }
                dom.prevObject=this  //将每次操作时对象依次入栈
                return dom
            }


            jQuery.prototype.end=function(){
                // console.log(this.prevObject)
                return this.prevObject     //返回上一个要操作传入栈空间的元素
            }
            

            //封装简易版on,将处理函数定义成一个对象，利用对象的特性来进行数组的去重，然后往对象里的数组塞处理函数
            jQuery.prototype.m
            yOn=function(type,handle){
                for(var i=0;i<this.length;i++){
                    if(!this[i].catchEvent){
                        this[i].catchEvent={}
                    }
                    if(!this[i].catchEvent[type]){
                        this[i].catchEvent[type]=[handle];
                    }else{
                        this[i].catchEvent[type].push(handle)
                    }
                }
            }


            //封装简易版trigger
            jQuery.prototype.myTrigger=function(type){
                var self=this;
                var parme=arguments.length>=1?[].slice.call(arguments,1):[];//判断参数是否大于1，大于1的话从1开始截取
                // console.log(parme)
                for(var i=0;i<this.length;i++){
                    this[i].catchEvent[type].forEach(function(ele,index){  //一个事件可以有多个处理函数，这里就是把多个循环出来，然后匹配执行
                        ele.apply(self,parme)
                    })
                }
            }

            //封装简易版queue
            jQuery.prototype.myQueue=function(){
                var queueObj=this;
                var queueName=arguments[0] || 'fx';//fx是animate作为参数传递时候预留的接口
                var addFunc=arguments[1] || null;//处理queue的第二个参数,保存要存在该队列中的元素
                var len=arguments.length;

                if(len==1){    //判断如果没传第二个参数，就是返回这个queue整个队列
                    return queueObj[0][queueName];
                }

                //判断剩下两种不等于1的情况，一个是这个队列数组不存在时，一个是这个队列数组存在时，往这个队列里面加就好了
                queueObj[0][queueName] == undefined ? queueObj[0][queueName] = [addFunc] : queueObj[0][queueName].push(addFunc);
                    return this;
            }

            jQuery.prototype.myDequeue=function(type){
                var self=this;
                var queueName=arguments[0] || 'fx';
                var queueArr=this.myQueue(queueName);
                var currFunc=queueArr.shift()
                if(currFunc==undefined){
                    return 
                }
                //这一步的next是为后面做伏笔，上面queueArr.shift()会把函数中的next()截出来，然后下面这个next就是执行
                //下一步的参数，然后传回调用的地方，只要next()执行，执行的却是这里的next 
                var next=function(){
                    self.myDequeue(queueName)
                }
                currFunc(next);
                return this
            }
            jQuery.prototype.myDelay=function(duration){
                var queueArr=this[0]['fx'];
                queueArr.push(function(next){
                    setTimeout(function(){
                        next()
                    },duration)
                });
                return this
            }

            jQuery.prototype.myAnimate=function(json,callback){
                var len=this.length;
                var self=this;
                var baseFunc=function(next){
                    var times=0;
                    for(var i=0;i<len;i++){
                        startMove(self[i],json,function(){
                            times++;
                            if(times==len){
                                callback &&callback();
                                next();
                            }
                        });
                    }
                }
                
                this.myQueue('fx',baseFunc);
                if(this.myQueue('fx').length==1){
                    this.myDequeue('fx');
                }
                function getStyle(obj,attr){
                    if(obj.currentStyle){
                        return obj.currentStyle[attr]
                    }else{
                        return window.getComputedStyle(obj,null)[attr]
                    }
                }
                function startMove(obj,json,callback){
                    clearInterval(obj,timer);
                    var iSpeed;
                    var iCur;
                    var name;
                    obj.timer=setInterval(function(){
                        var bStop=true;
                        for(var attr in json){
                            if(attr==='opacity'){
                                name=attr;
                                iCur=parseFloat(getStyle(obj,attr))*100;
                            }else{
                                iCur=parseInt(getStyle(obj,attr));
                            }
                            iSpeed=(json[attr]-iCur)/7;
                            if(iSpeed>0){
                                iSpeed=Math.ceil(iSpeed);
                            }else{
                                iSpeed=Math.floor(iSpeed);
                            }
                            if(attr==='opacity'){
                                obj.style.opacity=(iCur+iSpeed)/100
                            }else{
                                obj.style[attr]=iCur+iSpeed+'px'
                            }
                            if(json[attr]-iCur!==0){
                                bStop=false;
                            }
                            if(bStop){
                                clearInterval(obj.timer);
                                callback();
                            }

                        }
                    },100)

                }

                return this
            }

            //封装简易版的工具方法myCallBacks
            jQuery.myCallBacks=function(){
                //记录下传进来的参数是memory,once,还是其他什么
                var options=arguments[0] || '';
                //记录要回调的函数
                var list=[];
                //保存一个作为全局参数的为了给memory准备
                var arg;
                //创建一个记录执行到的回调函数的游标
                var fireIndex=0;
                //记录是否被回调的状态
                var fired=false;
                var fire=function(){
                    for(;fireIndex<list.length;fireIndex++){
                    list[fireIndex].apply(window,arg);
                    }
                    if(options.indexOf('once')!=-1){
                        list=[];
                        fireIndex=0;
                    }
                }
                return {
                    add:function(x){
                        list.push(x);
                        //因为是memory的话肯定是在add后会自动调用的，所以在add里面写
                        if(options.indexOf('memory')!=-1 &&fired){
                            fire();
                        }
                        return this
                    },
                    fire:function(){
                        arg=arguments;
                        //归零操作，如果不归零的话，只能执行一次，因为fireIndex加到满了
                        fireIndex=0;
                        fired=true;
                        fire();
                    }
                }
            }

        
            jQuery.myDeferred=function(){
                //创建一个对象管理数组
                var arr=[
                    [$.myCallBacks('once memory'),'done','resolve'],
                    [$.myCallBacks('once memory'),'fail','reject'],
                    [$.myCallBacks('memory'),'progress','notify']
                ];
                var deferredObj={};
                var pendding=true;
                
                for(var i=0;i<arr.length;i++){
                    // 这里是会闭包，等循环结束后i等于length了，从外部拿不到里面的了，所以要用立即执行函数然后加上一个返回
                    deferredObj[arr[i][1]]=(function(index){
                        return function(func){
                            arr[index][0].add(func)
                        }
                    })(i);
                        
                    deferredObj[arr[i][2]]=(function(index){
                        return function(){
                            var arg=arguments;
                            if(pendding){
                                arr[index][2]=='resolve' || arr[index][2]=='reject'? pendding=false:'';
                                arr[index][0].fire.apply(window,arg)
                            }
                        }
                    })(i)
                }
                //最后一定要返回延迟
                return deferredObj

            }




            

           jQuery.prototype.init.prototype = jQuery.prototype;//把这个原型链方法看成一个构造函数，然后这个构造函数可以使用jQuery.prototype上面的方法
            window.$ = window.jQuery = jQuery;//让jQuery变成全局变量以及可以用$()方式来引用
        })()