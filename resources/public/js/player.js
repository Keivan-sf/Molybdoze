const VPSelector = '#video_p';

const body = document.querySelector('body');
const video = document.querySelector(VPSelector);
const videoPlayer = document.querySelector('.videoPlayer');
const videoOverlay = document.querySelector('.videoOverlay')
const playPause = document.querySelector('.play-button');
const mute = document.querySelector('.volume-button');
const muted_shape = mute.querySelector('div');
const video_volume = document.querySelector('.volume-input');
const timePassed = document.querySelector('.video-time-passed');
const overlayPuaseResume = document.querySelector('.playPauseOverlay');
const timestamp_el = document.querySelector('.video-timestamp');
const juice = document.querySelector('.video-timestamp-juice');
const timestamp_container = document.querySelector('.timestamp-container');
const mdpl_on_duration = document.querySelector('.mdpl-change-preview');
const fullScreenButton = document.querySelector('.full-screen-icon');
const progress_load_bars = document.querySelector('.load-bars');
const preLoad = JSON.parse(video.dataset.set) || JSON.parse(video.getAttribute('data-set'));
const mdpl_ratio = preLoad.resolution.width / preLoad.resolution.height;

const mdpl_ts_info = {

    low: {
        width : Math.round(45 * mdpl_ratio),
        height : 45
    },

    high: {
        width : Math.round(90 * mdpl_ratio),
        height : 90
    },

    element: document.querySelector('.mdpl-ts-preview'),

    prevBg : '',

    currentTsFrame : 0,

    currentObject : null,

    frame_length : 0,

    frames_count : 0,

    highGenerated : [],

    durationChange : null,

}

const vp_standards = ['1080p' , '720p' , '480p' , '360p' , '244p' , '144p'];
let vp_qs = Object.keys(preLoad.qualities);

vp_qs.sort( (a , b) => Number(b.split('p')[0]) - Number(a.split('p')[0]) )

console.log(preLoad);

let renderedData = {

    qualities : {
        selected : 'auto',
        main : '480p',
        sources : ['480p' , '360p' , '240p' , '144p'],
        html : {},
    },
    
}

let mdplSettings = {
    icon: document.querySelector('.mdpl-settings-icon'),
    pannel : document.querySelector('.mdpl-setting-menu-area'),
    scroll : document.querySelector('.mdpl-scroll'),
    container : document.querySelector('.mdpl-setting-menu'),
    menus : {

        currentMenu : '',

        speed : {
            label : document.querySelector('.mdpl-playback-show'),
            input : document.querySelector('.mdpl-playback-input'),
            reset : document.querySelector('.mdpl-playback-reset'),
            current : 1,
            preview : null,
        },

        qualities : {
            selected : 'auto',
            main : vp_qs[0],
            sources : vp_qs,
            html : {},
        },

        subtitle : {
            // to be created 
        }

    }


}

const pointed_preview = {
    el : document.querySelector('.move-along-pointer'),
    time : document.querySelector('.vp-pointed-time'),
}

/**
 * @description Video player needed values
 */

let vp = {
    fullscreen : false,
    savedTime : 0,
    durationStr : "",
    tsOnMouseDown : false,
    videoPrevState : 'none',
    userVol : 0,
    canPlayUnmuted : false,
    tshoverOut : true,
    firstTimeUpdate : true,
    onDurationChange : false,
    progressLoadMade : 0,
    overlay : {
        onmouseOver : false,
        lastMove : new Date(null),
        tsForced : false,
        fullForced : false,
        prevID : '',
        firstHide : true,
    },
   
}

/**
 * Mdpl Progress ustils
 * 
 * Used to choose a quality based on network speed
 */

let mdplProgress = {
    inRow : 0,
    speed : 0,
    time : null,
    network : speed => {
        const networks = {
            0 : 144,
            250 : 240,
            350 : 360,
            512 : 480,
            700 : 720,
            900 : 1080,
        }
        const sutibleQuality = (() => {
            let main = 0;
            Object.keys(networks).map(el => +el).forEach(s => {
                if(s < speed) main = main < s ? s : main;
            })
            return networks[main];
        })();

        return sutibleQuality;
    }
}

console.log(mdplProgress.network(1024))

const El = class{
    
    /**
     * @description creates an HTML element
     * @param {String} element_type element tag name
     * @param {Object} attrs Element attributes with { attrName : attrValue } format
     * @example 
     * const myElement = new El("div" , {id: "menu", style: "color: #fff"})
     */

    constructor(element_type , attrs = {id : "" , "class" : ""}){
        this.type = element_type;
        this.htmlElement = document.createElement(element_type);
        for(const [key , value] of Object.entries(attrs)){
            if(attrs[key] == '' || !attrs[key] || typeof attrs[key] != 'string') continue;
            this.htmlElement.setAttribute(key , value);
        }
    }

    /**
     * @description Appends multiple childs, which must be the type of 'El' class, to the element
     * @example
     * const element_1 = new El("div" , {id: "menu", style: "color: #fff"})
     * const element_2 = new El("p" , {style: "color: #fff"})
     * const finalEl = new El("div")
     * finalEl.setChilds([element_1 , element_2])
     * @description Also the childs can be accessed with 'childs' property like example:
     * @example
     * const childs = finalEl.childs; // Array[El , El ...]
     * const newElement = new El("div")
     * newElement.setChilds(childs)
     * @param {[El]} childs
     */

    setChilds(childs = []){
        this.childs = [];
        for(const key in childs){
            if(typeof childs[key]){
                this.htmlElement.appendChild(childs[key].htmlElement);
                this.childs.push(childs[key]);
            }
        }
        return this;
    }


    /**
     * @description Basicly uses innerHTML on element, Just with the difference of being in a method chain
     * @param {String} content 
     */

    innerHTML(content){
        if(typeof content != 'string') throw new Error('The type of content must be string');
        this.htmlElement.innerHTML = content;
        return this;
    }

}

const htmlRendering = {
    elements : {

        /**
         * @description Creates buttons sutible for molybdoze video player setting
         */

        Button: class{

            attribute = {class: "mdpl-setting-button"};

            title = {
                content : '',
                attributes : {class: "mdpl-setting-btn-title"},
            };

            /**
             * @param {Object} attribute [Optional] Element attributes with { attrName : attrValue } format
             */

            constructor(attribute = {}){

                this.attribute = attribute;

                if(this.attribute.class) {
                    this.attribute.class+= " mdpl-setting-button";
                }else{
                    this.attribute.class = "mdpl-setting-button";
                }

            }


            /**
             * @description Sets title of the button
             * @param {String} title title
             * @param {Object} attributes [Optional] Element attributes with { attrName : attrValue } format
             */

            setTitle(title , attributes={}){
                this.title.content = title;
                if(attributes != {}) this.title.attributes = attributes;
                if(attributes.class){
                    this.title.attributes.class = "mdpl-setting-btn-title" + this.title.attributes.class;
                }else{
                    this.title.attributes.class = "mdpl-setting-btn-title";
                }
                
                return this;
            }

            /**
             * @description Sets a description on the right side of the button
             * @param {String} description Button description / selected item
             * @param {Object} attributes [Optional] Element attributes with { attrName : attrValue } format
             */

            setDescription(description , attributes = {}){
                this.description = {};
                let attrs = attributes;
                attrs.class = attributes.class ? "mdpl-setting-btn-des " + attributes.class : "mdpl-setting-btn-des";
                this.description.attrs = attrs;
                this.description.title = description;
                return this;
            }

            /**
             * @description Sets a secondary description with a lower opacity on the right side of the button
             * @param {String} secondary_des secondary description
             * @param {Object} attributes [Optional] Element attributes with { attrName : attrValue } format
             */

            setSecondary(secondary_des , attributes = {}){
                this.secondary = {};
                let attrs = attributes;
                attrs.class = attributes.class ? "mdpl-setting-btn-des mdpl-setting-btn-secondarydes " + attributes.class : "mdpl-setting-btn-des mdpl-setting-btn-secondarydes";
                this.secondary.attrs = attrs;
                this.secondary.title = secondary_des;
                return this;
            }

             /**
             * @description Sets an arrow on the right side of the button
             */

            setArrow(){
                this.arrow = true;
                return this;
            }

            /**
             * @description Creates a div based on the data given to the object
             * @returns an 'El' object
             */

            create(){

                if(!this.title.content) throw new Error('A title must be provided');

                let childs = [];


                if(this.arrow) childs[0] = new El('div' , {class: "mdpl-setting-btn-arrow"});

                if(this.secondary) childs.push(new El('div' , this.secondary.attrs).innerHTML(this.secondary.title));

                if(this.description) childs.push(new El('div' , this.description.attrs).innerHTML(this.description.title));

                let finishedButton =  new El('div' , this.attribute).setChilds([
                    new El('div', {class : "mdpl-setting-btn-right"})
                    .setChilds(childs),
                    new El('div' , {class: "mdpl-setting-btn-title"}).innerHTML(this.title.content),
                ]);

                return finishedButton;

            }

        },

        /**
         * @description Creates buttons sutible for molybdoze video player quality pannel
         */

        QualityButton: class{

            title = '';
            
            /**
             * @description Sets title of the button
             * @param {String} title title
            */

            setQuality(quality){

                if(quality === 'Auto'){

                    this.quality = '';
                    this.title = 'Auto';

                }else{

                    this.quality = quality;
                    this.title = quality;

                }

                return this;
            }

            /**
             * @description marks the button as the active/selected option
             */

            setCurrent(){
                this.current = true;
                return this;
            }

            /**
             * @description marks the button as the source option
            */

            setSource(){
                this.source = true;
                return this;
            }

            /**
             * @description Creates a div based on the data given to the object
             * @returns an 'El' object
             */

            create(){
                let content = this.title;
                if(this.source) content += ' (source)';
                if(this.current) content += ` &nbsp; <span>✓ Current</span>`;

                let finishedButton = new El('div' , {class: "mdpl-setting-button mdpl-quality-btn" , onclick : `videoControls.settings.menus.quality.userClick('${this.quality}')`, "data-quality" : `${this.quality ? this.quality : 'auto'}`,})
                .innerHTML(content)
                return finishedButton;
            }
        
        },
    }
}

/**
 * @description general document utilities
 */

const utils = {

    /**
     * @description stops the code for a desired time
     * @example await sleep(1000) // stops the running function for 1 second (1000 ms)
     * @param {Number} ms 
     */

    sleep: (ms) => new Promise((resolve) => setTimeout(resolve , ms)),

    /**
     * converts seconds to `HH:MM:SS` format
     * 
     * the returned string will include at least __5__ characters  e.g. `00:01`
     * 
     * the senonds parameter must be less than `86,400` *(24 hours)*
     * @param {Number} seconds 
     * @returns {String} HH:MM:SS
     */

    convertToTime(seconds){

        if(seconds >= 86400) throw new Error("the senonds parameter must be less than 86,400 (24 hours)")

        let date = new Date(null);
        date.setSeconds(seconds);
        let dateValue = date.toISOString().substr(11 , 8);
    
        dateValue = dateValue.split('');
    
        while(dateValue[0] == '0' || dateValue[0] == ':') dateValue.shift();
    
        dateValue = dateValue.join('');
    
        if(dateValue.length < 1) dateValue = "0";
    
        if(dateValue.length < 2) dateValue = "0" + dateValue;
    
        if(dateValue.length < 3){
            dateValue = "00:" + dateValue;
        }
    
        return dateValue;
    },

    async backgroundGenerator(frame1 , highParam = false){
        let high = highParam;

        let frame = frame1 + 1;
        if(mdpl_ts_info.frame_length < frame) frame = frame1;


        const calculatePic = number => frame%(number * number) > 0 ? Math.floor(frame / (number * number)) : (frame/(number * number)) - 1;

        if(!highParam && mdpl_ts_info.highGenerated.includes(calculatePic(5))) high = true;
        
        let calc = high ? 5 : 10;

        const target_pic = calculatePic(calc);

        if(high && !mdpl_ts_info.highGenerated.includes(target_pic)) mdpl_ts_info.highGenerated.push(target_pic);

        const target_frame = frame%(calc * calc) > 0 ? frame%(calc * calc) : (calc * calc);
        let top = target_frame%calc > 0 ? Math.floor(target_frame/calc) : target_frame/calc - 1;
        
        const left = target_frame%calc > 0 ? target_frame%calc - 1 : (calc - 1);
        const bg = preLoad.tsPreview[(high ? 'high' : 'low')][target_pic];

        const config = {
            left : -left * mdpl_ts_info.high.width,
            top : -top * mdpl_ts_info.high.height,
            width : mdpl_ts_info.high.width,
            onDuration : {
                el_width : mdpl_ts_info.durationChange.width,
                el_hight : mdpl_ts_info.durationChange.height,
                bg_width : mdpl_ts_info.durationChange.width * calc,
                left : -left * mdpl_ts_info.durationChange.width,
                top : -top * mdpl_ts_info.durationChange.height,
            },
            high,
        }

        const object = {
            ts : `#0D0D0D url('${bg}') ${config.left}px ${config.top}px / ${config.width * calc}px auto`,
            onDuration : `#0D0D0D url('${bg}') ${config.onDuration.left}px ${config.onDuration.top}px / ${config.onDuration.bg_width}px auto`,
            config,
        }

        mdpl_ts_info.currentObject = object;

        /**
         * Loads the image before showing it on page
         * 
         * This avoids empty backgrounds when loading different quality/frames
         */

        let tbg = document.createElement('img'); 
        tbg.src = bg;

        await new Promise((resolve , reject)=>{
            tbg.onload = () => {
                resolve('loaded')
            }

            tbg.onerror = () => reject('Connection problem');
        }).catch(err => console.error('Conenction problem, Cannot load the image'))

        return object;

    },

    /**
     * Used to update onduration preview demintions
     */

    update_onduration_size(){
        const vpWidth = videoPlayer.clientWidth;
        const vpHeight = videoPlayer.clientHeight;
        const dynamicRatio = vpWidth / vpHeight;
        let demintions;
        if(dynamicRatio < mdpl_ratio){
            demintions = {
                width : vpWidth,
                height : vpWidth / mdpl_ratio,
            }
        }else{
            demintions = {
                width : vpHeight * mdpl_ratio,
                height : vpHeight,
            }
        }

        mdpl_ts_info.durationChange = demintions;

        mdpl_on_duration.style.width = demintions.width + 'px';
        mdpl_on_duration.style.height = demintions.height + 'px';
    },

}

/**
 * @description video player controls' utilities
 */

const videoControls = {

    /**
     * @description unmutes the video
    */

    unmute(){
        if(muted_shape.classList.contains('muted-shape')) muted_shape.classList.remove('muted-shape');
        video_volume.value = Math.floor(video.volume * 100);
        video.muted = false;
    },

    /**
     * @description mutes the video
    */

    mute(){
        muted_shape.classList.add('muted-shape');
        video_volume.value = 0;
        video.muted = true;
    },

    /**
     * @description changes the volume and unmutes the video if it's muted.
     * The volume must be between 0 and 1
     * @param {Number} vol 
     */

    changeVol(vol){
        if(vol < 0 || vol > 1) throw new Error('The volume must be between 0 and 1');
        video.volume = vol;
        if(video.muted) this.unmute();
    },

    /**
     * @description changes the position of the movable circle in timestamp
     */

    async pointer_position(mouseEvent){

        const timestampWidth = timestamp_el.offsetWidth;
        let pos = mouseEvent.clientX - (timestamp_el.offsetLeft + videoPlayer.offsetLeft);
        pos = pos > 0 ? pos : 0;
        pos = pos > timestampWidth ? timestampWidth : pos;
        let percentage = pos * 100 / timestampWidth;
        const pointedTime = percentage * (video.duration / 100);

        let start = 62;
        pos = pos < start ? start : pos;
        pos = pos > timestampWidth - start ? timestampWidth - start : pos;
        pointed_preview.time.innerHTML = utils.convertToTime(pointedTime);
        pointed_preview.el.style.left = `${(pos - start)}px`;
        pointed_preview.el.style.visibility = 'visible';
        mdpl_ts_info.currentTsFrame = Math.floor(percentage * (mdpl_ts_info.frames_count / 100));
        const prevTsPreview = mdpl_ts_info.currentTsFrame;
        const generatedBg = (await utils.backgroundGenerator(mdpl_ts_info.currentTsFrame)).ts;

        if(mdpl_ts_info.prevBg !== generatedBg && prevTsPreview === mdpl_ts_info.currentTsFrame) mdpl_ts_info.element.style.background = generatedBg;
        
        mdpl_ts_info.prevBg = generatedBg;

        setTimeout(async() => {
            if(prevTsPreview === mdpl_ts_info.currentTsFrame){
                const generatedBg = await utils.backgroundGenerator(mdpl_ts_info.currentTsFrame , true);
                if(mdpl_ts_info.prevBg !== generatedBg) mdpl_ts_info.element.style.background = generatedBg.ts;
                mdpl_on_duration.style.background = generatedBg.onDuration;
                mdpl_ts_info.prevBg = generatedBg;
            }
        },300)
        


    },

    /**
     * @description
     * Opens the provided element in full screen.
     * If the document is already on full screen, It'll exit
     * @param {Element} element 
     */

    toggleFullScreen(element){

        if(!document.isFullScreen && !document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement){
            
            if(element.requestFullscreen){
                element.requestFullscreen();
            }else if(element.msRequestFullscreen){
                element.msRequestFullscreen();
            }else if(element.webkitRequestFullscreen){
                element.webkitRequestFullscreen();
            }

            vp.fullscreen = true;

        }else{
            
            if(document.exitFullscreen){
                document.exitFullscreen();
            }else if(document.msExitFullscreen){
                document.msExitFullscreen();
            }else if(document.webkitExitFullscreen){
                document.webkitExitFullscreen();
            }

            vp.fullscreen = false;
        }

    },

    /**
     * @description Toggles between playing and pausing the video
     * @param {"play" | "pause"} [force] Optional , if you want to force play/pause the video
     */

    togglePausePlay(force = null){

        const cl = playPause.classList;

        if(force){
            if(force === 'play') return play();
            if(force === 'pause') return pause();
        }

        if(video.paused){ 
            play();
        }else{
            pause();
        }

        function pause(){
            if(!videoOverlay.classList.contains('mdpl-overlay-paused-shadow')) videoOverlay.classList.add('mdpl-overlay-paused-shadow');
            cl.add('play-button-paused');
            video.pause();
        }

        function play(){
            if(videoOverlay.classList.contains('mdpl-overlay-paused-shadow')) videoOverlay.classList.remove('mdpl-overlay-paused-shadow');
            if(cl.contains('play-button-paused')) cl.remove('play-button-paused');
            video.play();
        }
        
    },

    /**
     * @description Skips the video forward and backward by the desired seconds
     * @example
     * skip(-10); // skips 10 seconds backwards
     * skip(10); // skips 20 seconds forwards
     */

    skip(seconds){

        if(video.currentTime + seconds >= video.duration) video.currentTime = video.duration;
        if(video.currentTime + seconds <= 0) video.currentTime = 0;

        if(video.currentTime + seconds < video.duration &&  video.currentTime + seconds > 0){
            video.currentTime += seconds;
            vp.overlay.lastMove = new Date();
            videoOverlay.classList.add('videoOverlayHover');
            videoControls.hideOverlay()
        }
        
    },

    /**
     * @description video player settings utilities
     */

    settings: {

        elements : {


            main: {

                main_class : null,

                children : [
                    new htmlRendering.elements.Button({onclick : "videoControls.settings.navigate('quality')" , class: "mdpl-mm-clickable-quality"})
                    .setTitle('Qualities')
                    .setDescription('Auto')
                    .setSecondary('1080p')
                    .setArrow()
                    .create()
    
                    ,
    
                    new htmlRendering.elements.Button()
                    .setTitle('Subtitle')
                    .setSecondary('None Available' , {style : "margin-right: 20px" , class: "mdpl-mm-clickable-subtitle"})
                    .create()
    
                    ,
    
                    new htmlRendering.elements.Button({onclick : "videoControls.settings.navigate('playback')" , class: "mdpl-mm-clickable-playback"})
                    .setTitle('Playback Speed')
                    .setDescription(`${mdplSettings.menus.speed.current === 1 ? 'Normal' : (mdplSettings.menus.speed.current + ' x')}`)
                    .setArrow()
                    .create()
                ]

            },

            quality :{

                main_class: 'mdpl-mm-quality' ,

                children: [

                    new El('div' , {class: "mdpl-settings-back" , onclick: "videoControls.settings.navigate('main')"})
                    .setChilds([

                        new El('div' , {class: "mdpl-title-devideline"})
                        ,

                        new El('div' , {class: "mdpl-settings-back-title"}).innerHTML('Qualities')
                        ,

                        new El('div' , {class:"mdpl-settings-back-btn"})

                    ])
                    ,

                ]

            }
            ,

            playback: {

                main_class: 'mdpl-mm-playback' ,

                children : [

                    new El('div' , {class: "mdpl-settings-back" , onclick: "videoControls.settings.navigate('main')"})
                    .setChilds([

                        new El('div' , {class: "mdpl-title-devideline"}),
    

                        new El('div' , {class: "mdpl-settings-back-title"}).innerHTML('Playback'),
                        

                        new El('div' , {class:"mdpl-settings-back-btn"}),

                    ])
                    ,

                    new El('div' , {class: "mdpl-playback-show"}).innerHTML('1x')
                    ,

                    new El('div' , {class: "mdpl-playback-range"})
                    .setChilds([

                        new El('div' , {class: "mdpl-playback-range-container"})
                        .setChilds([

                            new El('input' , {class: "mdpl-playback-input" , type: "range" , oninput: "videoControls.settings.menus.speed.input()" , min: "25" , max: "225" , value: "100"}),

                            new El('div' , {class: "mdpl-playback-reset" , onclick: "videoControls.settings.menus.speed.reset()"}).innerHTML('Reset'),

                        ])

                    ]),


                ]

            },

        },

        /**
         * @description toggles between showing and hiding the settings
         */

        toggle(){
            let cl = mdplSettings.pannel.classList;
            
            if(cl.contains('mdpl-setting-menu-show')){

                videoControls.settings.reset();

            }else{

                cl.add('mdpl-setting-menu-show');

                vp.overlay.fullForced = true;

            }

        },

        /**
         * @description If the setting is shown, hides it
         */

        hide(){
            let cl = mdplSettings.pannel.classList;
            if(cl.contains('mdpl-setting-menu-show')) cl.remove('mdpl-setting-menu-show');
            this.reset();
        },

        reset(showMenu = false){
            let cl = mdplSettings.pannel.classList;
            if(cl.contains('mdpl-setting-menu-show')) cl.remove('mdpl-setting-menu-show');
            videoControls.settings.navigate('main' , true);
            vp.overlay.fullForced = false;
            videoControls.hideOverlay();
        },

        /**
         * @description Navigates to a specefic menu based on navID
         * @param {String} navID the intended menu id
         * @param {Boolean} hidden Dosen't show the menu even after navigating. defult = false
        */

        navigate(navID , hidden = false){

            if(navID === mdplSettings.menus.currentMenu) return;

            const sizes = {
                main:{
                    width: 250,
                    height: 150,
                    left: -250,
                },
                quality: {
                    width: 200,
                    height: 45 * (mdplSettings.menus.qualities.sources.length + 1) + 70,
                    left: -200,
                },
                playback: {
                    width: 220,
                    height: 170,
                    left: -220,
                },
            }

            if(!this.elements[navID]) throw new Error(`Wrong navID, ID shoud be on of the following strings : [ ${Object.keys(this.elements).join(' , ')} ]`);

            let target = this.elements[navID];

            let classSet = ['mdpl-setting-menu-area' , 'mdpl-main-menu-setting'];

            if(!hidden) classSet.push('mdpl-setting-menu-show');

            if(target.main_class) classSet.push(target.main_class);

            let cl = mdplSettings.pannel.classList;

            cl.forEach(prevClass => {
                let elFound = false;
                classSet.forEach(currentClass => {
                    if(prevClass === currentClass){
                        elFound = true;
                        delete currentClass;
                    }
                })
                if(!elFound) cl.remove(prevClass);
            })

            classSet.forEach(currentClass =>{
                cl.add(currentClass);
            })

           
            let newMenu = document.createElement('div');
            newMenu.setAttribute('class' , 'mdpl-setting-menu');

            this.elements[navID].children.forEach(ch => newMenu.appendChild(ch.htmlElement));

            mdplSettings.pannel.style.height = sizes[navID].height + 'px';
            mdplSettings.pannel.style.width = sizes[navID].width + 'px';


            mdplSettings.scroll.appendChild(newMenu);

            mdplSettings.container.style.marginLeft = sizes[navID].left + 'px';
            utils.sleep(200).then(() => {
            //    mdplSettings.container.style.marginLeft = '0px';
                mdplSettings.scroll.removeChild(mdplSettings.container);
                mdplSettings.container = newMenu;
            })
            
            if(navID === 'main')
            {

                if(!mdplSettings.menus.speed.preview) mdplSettings.menus.speed.preview = document.querySelector('.mdpl-mm-clickable-playback .mdpl-setting-btn-des');
                mdplSettings.menus.speed.preview.innerHTML = (mdplSettings.menus.speed.current === 1 ? 'Normal' : mdplSettings.menus.speed.current + ' x');


                const selectedQuality = mdplSettings.menus.qualities.selected;

                const mdplQQ = document.querySelector('.mdpl-mm-clickable-quality .mdpl-setting-btn-secondarydes');
                const mdplAuto = document.querySelectorAll('.mdpl-mm-clickable-quality .mdpl-setting-btn-des')[1];

                if(selectedQuality != 'auto'){
                    mdplAuto.innerHTML = '';
                    mdplQQ.innerHTML = selectedQuality;
                }else{
                    mdplAuto.innerHTML = 'Auto';
                    mdplQQ.innerHTML = '144p';
                }
                
            }

            mdplSettings.menus.currentMenu = navID;

        },

        menus : {

            speed : { 

                /**
                 * @description changes video speed based on user input
                 */

                input(){

                    if(!mdplSettings.menus.speed.input) mdplSettings.menus.speed.input = document.querySelector('.mdpl-playback-input');
                    if(!mdplSettings.menus.speed.label) mdplSettings.menus.speed.label = document.querySelector('.mdpl-playback-show');

                    let val = mdplSettings.menus.speed.input.value;
                    if(val < 25 || val > 255) return console.log('The value of playback speed cannot be less tan 25 or more than 255');
                    val = Math.floor(val / 10) / 10;
                    mdplSettings.menus.speed.current = val;
                    video.playbackRate = val;
                    mdplSettings.menus.speed.label.innerHTML = val + ' x';

                },

                
                /**
                 * @description changes video speed to 1
                 */

                reset(){

                    video.playbackRate = 1;

                    if(!mdplSettings.menus.speed.input) mdplSettings.menus.speed.input = document.querySelector('.mdpl-playback-input');
                    if(!mdplSettings.menus.speed.label) mdplSettings.menus.speed.label = document.querySelector('.mdpl-playback-show');
                    mdplSettings.menus.speed.input.value = 100;
                    mdplSettings.menus.speed.current = 1;
                    mdplSettings.menus.speed.label.innerHTML = '1 x';

                }

            },


            quality : {

                /**
                 * @description Triggers when user clicks on a specefic quality in video player & changes the quality based on the button clicked
                 * @param {String} source the target quality the user clicked on
                 */

                userClick(source){
                    
                    if(source === mdplSettings.menus.qualities.selected) return;

                    if(!source){

                        this.autoSelect();


                    }else if(mdplSettings.menus.qualities.sources.some( sc => sc === source )){
                        this.changeSource(source);
                    }

                }, 

                /**
                 * @description Changes the source of the video and switches current quality in video settings
                 * @param {String} source the target quality
                 * @param {Boolean} auto either the source is being changed automatically or not. defult : false
                 */

                changeSource(source , auto = false){

                    let Qualities = mdplSettings.menus.qualities;

                    let currentTime = video.currentTime;

                    const pausedStatus = video.paused;

                    video.src = preLoad.qualities[source];
                    
                    const cl = playPause.classList;
                    if(cl.contains('play-button-paused')) cl.remove('play-button-paused');

                    video.currentTime = currentTime;
                    videoControls.togglePausePlay(pausedStatus ? 'pause' : 'play');

                    if(!Qualities.html.length) {

                        const Els = document.querySelectorAll('.mdpl-setting-button.mdpl-quality-btn');

                        for(const element of Els){
                            let attr = element.getAttribute('data-quality');
                            Qualities.html[attr] = element;
                        }

                    }

                    Qualities.html[Qualities.selected].innerHTML = Qualities.selected === Qualities.main ? Qualities.selected + ' (source)' : Qualities.selected;

                    if(!auto){
                        Qualities.selected = source;
                        Qualities.html[source].innerHTML = (source === Qualities.main ? source + ' (source)' : source) + ' &nbsp; <span>✓ Current</span>';
                    }else{
                        Qualities.selected = 'auto';
                        Qualities.html['auto'].innerHTML = 'Auto &nbsp; <span>✓ Current</span>';
                    }
                    
                    
                },

                autoSelect(){

                    this.changeSource('144p' , true)

                },

                setSources(sources){

                },



            }






        }

    },

    /**
     * @description Hides the video controls
     */

    async hideOverlay(withoutTimer = false){

        if(vp.overlay.fullForced) return;

        if(video.paused) return;

        if(withoutTimer) return hideNow();

        await utils.sleep(3000).then(hideNow);

        function hideNow(){
            if(vp.overlay.fullForced) return;
            const difference = new Date().getTime() - vp.overlay.lastMove.getTime();
            if(difference >= 2999){
                vp.overlay.tsForced = false , vp.overlay.fullForced = false;
                const classList = videoOverlay.classList;
                if(classList.contains('videoOverlayHover')) classList.remove('videoOverlayHover');
                videoControls.settings.hide();
            }
        }

    },

}


/**
 * @description Event handlers
 */

const events = {
    
    /**
     * Shows __mutltiple__ loaded time ranges on the loading progress bar , everytime a chunk is downloaded
     * 
     * Will be called whenever `progress` event is triggered in video element
     */

    multipleProgress(){
        // quality chase based o nthe time spent (speed) -- need to be developed
        progress_load_bars.innerHTML = '';
        const duration = video.duration;
        const timePercente = duration / 100;
        for(let count = 0; count < video.buffered.length; count++){
            let start = video.buffered.start(count);
            let end = video.buffered.end(count);
        //    const timestamp_width = timestamp_el.offsetWidth;
            const left_margin = start / timePercente;
            const bar_width = (end - start) / timePercente;

            const load_bar = document.createElement('div');
            load_bar.setAttribute('class' , 'load-progress');
            load_bar.setAttribute('style' , `margin-left: ${left_margin}%; width: ${bar_width}%;`);
            progress_load_bars.appendChild(load_bar);

        }
    },

    /**
     * Shows __only one__ loaded time range on the loading progress bar , everytime a chunk is downloaded
     * 
     * Will be called whenever `progress` event is triggered in video element
     */

    progress(){
        

        // quality chase based o nthe time spent (speed) -- need to be developed
      //  console.log('quality chase based o nthe time spent (speed) -- need to be developed')
        mdplProgress.inRow++;
        if(mdplProgress.inRow == 1) mdplProgress.time = new Date();
        if(mdplProgress.inRow == 6){
            let time = new Date().getTime() - mdplProgress.time.getTime();
            time = (time / 1000) - (2*5/10);
            const speed = (5 * 250 / time);
            const source = mdplProgress.network(speed);
            console.log(`Size:${5 * 250}\nTime: ${time}\nSpeed: ${speed}KBs\nSource: ${source}`);
            mdplProgress.inRow = 0;
        }

        progress_load_bars.innerHTML = '';
        const duration = video.duration;
        const timePercente = duration / 100;
        if(video.buffered.length > 0) {
            vp.progressLoadMade++;
            console.log('here1')
            const start = 0;
            const end = video.buffered.end(video.buffered.length-1);
            const left_margin = start / timePercente;
            const bar_width = (end - start) / timePercente;
            console.log(end)
            const load_bar = document.createElement('div');
            load_bar.setAttribute('class' , 'load-progress');
            load_bar.setAttribute('style' , `margin-left: ${left_margin}%; width: ${bar_width}%;`);
            progress_load_bars.appendChild(load_bar);

        }

    },

    /**
     * - will be called whenever video.on('timeupdate') is triggered
     * - updates timestamp and juice position
     */

    timeUpdate(){
        if(vp.firstTimeUpdate){
            videoControls.hideOverlay();
            vp.firstTimeUpdate = false;
           // if(vp.progressLoadMade < 1) events.
        }
    
        let newTime = `${utils.convertToTime(video.currentTime)} / ${vp.durationStr}`;
    
        if(newTime != vp.savedTime) timePassed.innerHTML = newTime;
    
        vp.savedTime = newTime;
    
        var juicePosition = video.currentTime * 100 / video.duration;
        juice.style.width = juicePosition +  '%';
        
        if(video.ended) {
            console.log('ended');
            videoControls.togglePausePlay("pause");
            video.pause();
        }
    }

    // ...

}

/**
 * @description video loading needed utilities
 */

const videoPlayerLoadingUtils = {

    /**
     * @description displays provided qualities in html elements on mdpl quality setting
     * @param {Object} qualities The qualities to be displayed with the main quality being specefied
     * @param {String} qualities.main Main quality,  Example : '1080p'
     * @param {Array} qualities.sources All qualities,  Example : ['360p' , '240p' , '144p']
     * @example
     * setSources({ main : "360p" , sources : ['360p' , '240p' , '144p'] })
     */

    setSources(qualities = {main , sources}){
        qualities.sources.sort()
        let children = videoControls.settings.elements.quality.children;
        for(const quality of qualities.sources){
            const htmlElement = new htmlRendering.elements.QualityButton().setQuality(quality);

            if(quality === qualities.main) htmlElement.setSource();
            
            children.push(htmlElement.create())
        }

        children.push(
            new htmlRendering.elements.QualityButton()
            .setQuality('Auto')
            .setCurrent()
            .create()
        );

    },

    setSubttitles(subtitle){

    },


}

videoPlayerLoadingUtils.setSources(mdplSettings.menus.qualities); // rendering the video qualities buttons in html


mdplSettings.icon.onclick = videoControls.settings.toggle;

videoControls.hideOverlay();

overlayPuaseResume.onclick = function(){

    if(vp.overlay.fullForced){

        vp.overlay.fullForced = false;

        videoControls.settings.hide();
        
        return;
    }

    videoControls.togglePausePlay();

}

playPause.onclick = videoControls.togglePausePlay;

mute.onclick = () => {

    vp.overlay.lastMove = new Date();
    videoControls.hideOverlay()

    if(video.muted){
        videoControls.unmute();
    }else{
        videoControls.mute();
    }
    
}

videoPlayer.onmousemove = () =>{
    vp.overlay.lastMove = new Date();
    vp.overlay.onmouseOver = true;
    vp.overlay.tsForced = false;
}

videoPlayer.onmouseout = () => {
    vp.overlay.onmouseOver = false;
    videoControls.hideOverlay(true);
}

// Timestamp

timestamp_el.onclick = (mouseEvent) =>{
    let leftOffset = mouseEvent.clientX - (timestamp_el.offsetLeft + videoPlayer.offsetLeft);
    let percentage = leftOffset * 100 / timestamp_el.offsetWidth;
    
    juice.style.width = percentage + '%';
    const selectedTime = percentage * (video.duration / 100);

    video.currentTime = selectedTime; 
}

timestamp_el.onmouseout = () =>{
    vp.tshoverOut = true;
    if(vp.tsOnMouseDown) return;
    timestamp_el.classList.remove('timeStamp-height');
    pointed_preview.el.style.visibility = 'hidden';
}

timestamp_el.onmouseover = () =>{
    vp.tshoverOut = false;
    timestamp_el.classList.add('timeStamp-height');
}

timestamp_el.onmousemove = (mouseEvent) =>{
    videoControls.pointer_position(mouseEvent);
}

timestamp_el.onmousedown = () =>{

    if(vp.overlay.fullForced){
        vp.overlay.fullForced = false;
        videoControls.settings.hide();
    }

    vp.tsOnMouseDown = true;
    if(vp.videoPrevState == 'none') vp.videoPrevState = video.paused ? 'paused' : 'playing';
    video.pause();
    pointed_preview.el.style.visibility = 'hidden';
}

body.onmousemove = (mouseEvent) =>{

    const timestampWidth = timestamp_el.offsetWidth;
    let pos = mouseEvent.clientX - (timestamp_el.offsetLeft + videoPlayer.offsetLeft);
    pos = pos > 0 ? pos : 0;
    pos = pos > timestampWidth ? timestampWidth : pos;
    let percentage = pos * 100 / timestampWidth;
    const pointedTime = percentage * (video.duration / 100);
    if(vp.tsOnMouseDown){
        utils.update_onduration_size();
        videoOverlay.classList.add('videoOverlayHover');
        juice.style.width = percentage + '%';
        videoControls.pointer_position(mouseEvent);
        videoOverlay.classList.add('mdpl-overlay-full-shadow');
        video.classList.add('mdpl-no-opacity');
        mdpl_on_duration.style.opacity = 1;
        vp.onDurationChange = true;
        mdpl_on_duration.style.background = mdpl_ts_info.currentObject.onDuration;
        

    }else{

        if(!vp.firstTimeUpdate && vp.onDurationChange){
            if(videoOverlay.classList.contains('mdpl-overlay-full-shadow')) videoOverlay.classList.remove('mdpl-overlay-full-shadow');
            if(video.classList.contains('mdpl-no-opacity')) video.classList.remove('mdpl-no-opacity')
            video.currentTime = pointedTime;
            vp.onDurationChange = false;
        }

        mdpl_on_duration.style.opacity = 0;
        if(vp.overlay.onmouseOver){
            vp.overlay.firstHide = false;
            videoOverlay.classList.add('videoOverlayHover');
            if(!vp.tshoverOut){
                videoControls.pointer_position(mouseEvent);
            }else{
                pointed_preview.el.style.visibility = 'hidden';
            }
            videoControls.hideOverlay()
        }else if(!vp.overlay.tsForced && !vp.overlay.fullForced && !vp.overlay.firstHide){
            pointed_preview.el.style.visibility = 'hidden';
            videoControls.hideOverlay(true);
        }else{
            pointed_preview.el.style.visibility = 'hidden';
        }

    }

}

body.onmouseup = () =>{

    if(vp.tsOnMouseDown){

        vp.tsOnMouseDown = false;

        if(vp.videoPrevState != 'paused'){
            video.play();
        }
        vp.videoPrevState = 'none';

        if(vp.tshoverOut){
            timestamp_el.classList.remove('timeStamp-height');
        }

        vp.overlay.tsForced = true;
        videoControls.hideOverlay()
        
    }
}


video_volume.oninput = () => videoControls.changeVol(video_volume.value / 100);


video.addEventListener('timeupdate' , events.timeUpdate)

fullScreenButton.onclick = () => videoControls.toggleFullScreen(videoPlayer);

const fulScreenTrigger = (event) =>{
    if(!document.isFullScreen && !document.fullscreenElement && !document.webkitFullscreenElement && !document.mozFullScreenElement && !document.msFullscreenElement){
        if(fullScreenButton.classList.contains('full-screen-after')) fullScreenButton.classList.remove('full-screen-after');
    }else{
        fullScreenButton.classList.add('full-screen-after');
    }
}

video.addEventListener('progress' , events.progress)

document.addEventListener('fullscreenchange' , fulScreenTrigger);
document.addEventListener('webkitfullscreenchange' , fulScreenTrigger);


const firstTimeLoads = (function(){
    vp.durationStr = utils.convertToTime(preLoad.duration);
    mdpl_ts_info.frame_length = preLoad.duration < 2000 ? (preLoad.duration > 200 ? Math.floor(preLoad.duration/200) : 1) : 10;
    mdpl_ts_info.frames_count = Math.floor(preLoad.duration / mdpl_ts_info.frame_length);
    mdpl_ts_info.element.style.width = mdpl_ts_info.high.width + 'px';
    utils.update_onduration_size();
})();


// Key Controls :

document.addEventListener('keydown' , function(event){

  //  console.log(event.key)

    switch(event.key){

        case ' ':
        case 'k':
            videoControls.togglePausePlay();
            if(video.paused){
                vp.overlay.lastMove = new Date();
                videoOverlay.classList.add('videoOverlayHover');
                videoControls.hideOverlay()
            } 
            break;

        case 'ArrowLeft':
        case '[' :
            videoControls.skip(-10);

            break;

        case 'ArrowRight':
        case ']' :

            videoControls.skip(20);

            break;

        case 'm' : 

            if(video.muted){
                videoControls.unmute();
                
            }else{
                videoControls.mute();
            }
            
            vp.overlay.lastMove = new Date();
            videoOverlay.classList.add('videoOverlayHover');
            videoControls.hideOverlay()

            break;

    }
})