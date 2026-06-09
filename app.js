let themeColors={main:'#EDEDf0',dim:'#8A8A93',accent:'#aa3333'};
function syncThemeColors(){
    const styles=getComputedStyle(document.body);
    themeColors.main=styles.getPropertyValue('--text-main').trim();
    themeColors.dim=styles.getPropertyValue('--text-dim').trim();
    themeColors.accent=styles.getPropertyValue('--accent-color').trim()||'#aa3333';

}
const themeObserver= new MutationObserver(syncThemeColors);
themeObserver.observe(document.body,{attributes:true,attributeFilter:['data-theme']});
syncThemeColors();
let is24hour=true;
const timeToggleBtn=  document.getElementById('time-toggle-btn');
const clockText=document.getElementById('clock-text');
const dateText=document.getElementById('date-text');
const hourHand=document.getElementById('hour-hand');
const minHand=document.getElementById('min-hand');
const secHand=document.getElementById('sec-hand');

timeToggleBtn.addEventListener('click', ()=>{
    is24hour= !is24hour;
    timeToggleBtn.textContent= is24hour ? '24H': '12H';
    updateClock();
});

function updateClock(){
    let now= new Date();

    clockText.textContent=now.toLocaleTimeString('en-US',{
        hour12: !is24hour,
        hour: '2-digit', minute:'2-digit', second:'2-digit'
    });
    dateText.textContent=now.toDateString();
    const seconds=now.getSeconds();
    const mins=now.getMinutes();
    const hours=now.getHours();
    const secDeg=(seconds/60)*360;
    const minDeg=((mins/60)*360)+((seconds/60)*6);
    const hourDeg=((hours/12)*360)+((mins/60)*30);
    secHand.style.transform=`translateX(-50%) rotate(${secDeg}deg)`;
    minHand.style.transform=`translateX(-50%) rotate(${minDeg}deg)`;
    hourHand.style.transform =`translateX(-50%) rotate(${hourDeg}deg)`;
}

setInterval(updateClock,1000);
updateClock();
/* old fucntion for clock*/
/*function runClock(){
    const clock =document.getElementById('clock-text');
    const date=document.getElementById('date-text');
    setInterval(() =>{
        let now =new Date();
        clock.textContent=now.toLocaleTimeString('en-US',{hour12:false});
        date.textContent=now.toDateString();
        },1000);
    }*/



const taskInput=document.getElementById('new-task');
const taskList=document.getElementById('task-list');
let savedTasks=JSON.parse(localStorage.getItem('focus_tasks')) || [];
function renderTasks(){
    taskList.innerHTML='';
    savedTasks.forEach((task,index)=>{
        let li =document.createElement('li');
        li.textContent=task;
        taskList.appendChild(li);
        li.addEventListener('click',()=>{
            li.style.textDecoration='line-through';
            li.style.opacity='0.4';
            setTimeout(()=>{
                savedTasks.splice(index,1);
                localStorage.setItem('focus_tasks',JSON.stringify(savedTasks));
                renderTasks();
            }, 400);
        });
    });
}
renderTasks();
taskInput.addEventListener('keypress',(e)=>{
    if(e.key==="Enter"&& taskInput.value !== ''){
        savedTasks.push('>'+ taskInput.value);
        localStorage.setItem('focus_tasks', JSON.stringify(savedTasks));
        taskInput.value='';
        renderTasks();
    }
});


const textarea= document.getElementById('notes-area');
if(localStorage.getItem('my_notes')){
    textarea.value=localStorage.getItem('my_notes');
}
textarea.addEventListener('input',()=> {
    localStorage.setItem('my_notes',textarea.value);
});

const themeBtn=document.getElementById('theme-btn');
let currentTheme=localStorage.getItem('theme')||'default';
document.body.setAttribute('data-theme',currentTheme);
themeBtn.addEventListener('click',()=>{
    if(currentTheme ==='vanilla'){
        currentTheme='default';
    }else{
        currentTheme='vanilla';

    }
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
});
document.querySelectorAll('.theme-select-btn').forEach(btn=>{
    btn.addEventListener('click',(e)=>{
        currentTheme= e.target.getAttribute('data-theme');
        document.body.setAttribute('data-theme', currentTheme);
        localStorage.setItem('theme', currentTheme);
    });
});


async function fetchWeatherData(lat,lon,cityName) {
    const tempText=document.getElementById('w-temp');
    const descText=document.getElementById('w-desc');
    const locText=document.getElementById('w-loc');
    

    try{
        const res= await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data=await res.json();
        const temp=Math.round(data.current_weather.temperature);
        const code=data. current_weather.weathercode;

        let desc='Clear';
        if(code>0&&code<=3)
             desc='Cloudy';
        if(code>=45&&code<=48)
            desc='Foggy';
        if(code>=51&&code<=67)
            desc='Rain';
        if(code>=71&&code<=77)
            desc='Snow';
        if(code>=95)
            desc="Storms";
        tempText.textContent=`${temp}°C`;
        descText.textContent=desc;
        locText.textContent=cityName;
    } catch(err){
        tempText.textContent= '--°C';
        descText.textContent='Offline';
    }
}
function updateWeather(){
    if("geolocation" in navigator){
        navigator.geolocation.getCurrentPosition(
            async(position)=>{
                const lat=position.coords.latitude;
                const lon=position.coords.longitude;

                try{
                    const geoRes= await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
                    const geoData= await  geoRes.json();
                    const city = geoData.city || geoData.locality || "Local Area";
                    fetchWeatherData(lat,lon,city.toLowerCase());
                } catch{
                    fetchWeatherData(lat,lon,"current location");
                }
            },
            (error)=>{
                fetchWeatherData(8.5241,76.9366, "location denied");
            }
        );
    } else {
        fetchWeatherData(8.5241,76.9366, "unsupported browser");
    }
}

updateWeather();
setInterval(updateWeather,1800000);

const flowDisplay=document.getElementById('flow-time');
const flowPlay=document.getElementById('flow-play');
const flowReset=document.getElementById('flow-reset');
const flowInput=document.getElementById('flow-input');
const stepUpBtn=document.getElementById('step-up');
const stepDownBtn=document.getElementById('step-down');
let flowTimer;
let isFlowing=false;
let customMins=parseInt(flowInput.value)||  25;
let flowTime= customMins*60;

const bgAudio=document.getElementById('bg-audio');
const alarmAudio=document.getElementById('alarm-audio');
const musicToggle=document.getElementById('music-toggle');
const playerStatus=document.getElementById('player-status');
const volumeSlider=document.getElementById('volume-slider');
const localSortSelect=document.getElementById('local-sort');

bgAudio.volume=volumeSlider.value;
alarmAudio.volume=0.8;
volumeSlider.addEventListener('input', (e)=>{
    bgAudio.volume=e.target.value;
});

function updateFlow(){
    const m=String(Math.floor(flowTime/60)).padStart(2,'0');
    const s=String(flowTime%60).padStart(2,'0');
    flowDisplay.textContent=`${m}:${s}`;

    if(isFlowing){
        document.title=`(${m}:${s}) - Focus`;

    }else{
        document.title= `The Console`;
    }

}

flowInput.addEventListener('input',()=>{
    if(!isFlowing){
        customMins=parseInt(flowInput.value)||25;
        flowTime=customMins*60;
        updateFlow();
    }
});
flowInput.addEventListener('change',()=>{
    customMins=parseInt(flowInput.value)|| 25;
    flowTime=customMins*60;
    updateFlow();
});

stepUpBtn.addEventListener('click',()  =>{
    if(!isFlowing){
        flowInput.stepUp();
        customMins=parseInt(flowInput.value)||  25;
        flowTime=customMins*60;
        updateFlow();
    }
});

stepDownBtn.addEventListener('click',()=>{
    if(!isFlowing){
        if(parseInt(flowInput.value)>1){
            flowInput.stepDown();
            customMins=parseInt(flowInput.value)||25;
            flowTime=customMins*60;
            updateFlow();
        }
    }
});

function toggleRadio(forcePlay=false,forcePause=false){
    if(forcePause||(!forcePlay&& !bgAudio.paused)){
        bgAudio.pause();
        musicToggle.textContent='▶';
        playerStatus.textContent='Paused';
    } else{
        initAudioContent();
        bgAudio.play().catch(()=> console.log('Connecting to stream....'));
        musicToggle.textContent="⏸";
        playerStatus.textContent='Live Stream';
    }
}
const eqCanvas=document.getElementById('eq-canvas');
const canvasCtx=eqCanvas.getContext('2d');
let audioCtx, analyser, source, dataArray, bufferLength;
let isAudioInitialized=false;
function initAudioContent(){
    if(isAudioInitialized) return;
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    audioCtx= new AudioContext();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize=64;
    bufferLength=analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);
    source=audioCtx.createMediaElementSource(bgAudio);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    isAudioInitialized=true;
    drawEQ();
}
function drawEQ(){
    requestAnimationFrame(drawEQ);
    if(bgAudio.paused){
        canvasCtx.clearRect(0,0,eqCanvas.width, eqCanvas.height);
        canvasCtx.fillStyle=themeColors.dim;

        for(let i= 1; i<16;i++){
            canvasCtx.fillRect(i*4, eqCanvas.height - 2,2,2);
        }
        return;
    }

    analyser.getByteFrequencyData(dataArray);
    canvasCtx.clearRect(0,0, eqCanvas.width, eqCanvas.height);

    for(let i= 1; i <16; i++){
        let barHeight=(dataArray[i]/255)* eqCanvas.height;
        let x= i*4;
        
        canvasCtx.fillStyle=barHeight>eqCanvas.height*0.7?themeColors.accent:themeColors.main;
        let finalHeight=Math.max(barHeight, 2);
        canvasCtx.fillRect(x, eqCanvas.height -finalHeight, 2,finalHeight);
    }
}
musicToggle.addEventListener('click',()=>{
    toggleRadio();
});

flowPlay.addEventListener('click',()=>{
    document.body.classList.remove('strict-violation');
    alarmAudio.pause();
    alarmAudio.currentTime=0;
    alarmAudio.loop=false;
    isFlowing=!isFlowing;
    if(isFlowing){
        let targetTime=Date.now()+(flowTime*1000);
        flowTimer=setInterval(()=>{
            flowTime= Math.round((targetTime- Date.now())/1000);
            if(flowTime<=0){
                flowTime=0;
                updateFlow();
                clearInterval(flowTimer);
                if(autoPauseRadio) toggleRadio(false,true);
                
                alarmAudio.loop=true;
                alarmAudio.play().catch(()=> console.log('add carchime.wav to your foldere'));
                flowPlay.textContent='Done';
                logDeepWork(customMins);
                isFlowing=false;
                updateFlow();
            }else{
                updateFlow();
            }
        },1000);
        if(autoPlayRadio) toggleRadio(true,false);
        flowPlay.textContent='Pause';

    }else{
        clearInterval(flowTimer);
        if(autoPauseRadio) toggleRadio(false,true);
        flowPlay.textContent='Start';
    }
    updateFlow();
});
flowReset.addEventListener('click',()=>{
    clearInterval(flowTimer);
    isFlowing=false;
    customMins=parseInt(flowInput.value)||25;
    flowTime=customMins*60;
    updateFlow();
    toggleRadio(false,true);
    alarmAudio.pause();
    alarmAudio.currentTime=0;
    flowPlay.textContent='Start';
});

const zenBtn=document.getElementById('zen-btn');
zenBtn.addEventListener('click',()=>{
    document.body.classList.toggle('zen-active');
    if(document.body.classList.contains('zen-active')){
        zenBtn.textContent='EXIT';
        zenBtn.style.color= '#aa3333';
        zenBtn.style.borderColor='#aa3333';
        zenBtn.style.borderColor='#aa3333';

    }else{
        zenBtn.textContent='ZEN';
        zenBtn.style.color='var(--text-dim)';
        zenBtn.style.borderColor='transparent';
    }
});


const rainAudio=document.getElementById('rain-audio');
const rainSlider=document.getElementById('rain-slider');

rainAudio.loop=false;



rainSlider.addEventListener('input',(e)=>{
    rainAudio.volume=e.target.value;
    if(rainAudio.volume>0){
        rainAudio.play().catch(()=> console.log('Drop mixkit-light-rain-loop-1253.wav into your folder'));
    } else{
        rainAudio.pause();
    }
});

setInterval(()=>{
    if(rainAudio.duration){
        if(rainAudio.currentTime>=rainAudio.duration-0.5){
            rainAudio.currentTime=0.1;
            rainAudio.play();
        }
    }
},50);

const crtBtn=document.getElementById('crt-btn');
crtBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('crt-active');
    if(document.body.classList.contains('crt-active')){
        crtBtn.textContent='CRT: ON';
        crtBtn.style.color='var(--text-main)';

    } else{
        crtBtn.textContent='CRT';
        crtBtn.style.color='var(--text-dim)';
    }
});

const strictBtn=document.getElementById('strict-btn');
let isStrict=false;
strictBtn.addEventListener('click',()=>{
    isStrict=!isStrict;
    if(isStrict){
        strictBtn.style.color='#aa3333';
        strictBtn.style.borderColor='#aa3333';
        strictBtn.textContent='Strict';

        
    }else{
        strictBtn.style.color='var(--text-dim)';
        strictBtn.style.borderColor='transparent';
        strictBtn.textContent='Strict';
        document.body.classList.remove('strict-violation');
    }
});

window.addEventListener('blur',()=>{
    if(isStrict && isFlowing){
        document.body.classList.add('strict-violation');
            toggleRadio(false,true);
            alarmAudio.currentTime=0;
            alarmAudio.volume=1.0;
            alarmAudio.loop=true;
            alarmAudio.play().catch(e=> console.log("Browser blocked audio"));
            clearInterval(flowTimer);
            isFlowing=false;
            flowPlay.textContent='Start';
        
    }
});

function logDeepWork(minutes){
    let heatmapData=JSON.parse(localStorage.getItem('deep_work'))||{};
    const today= new Date().toISOString().split('T')[0];
    if(heatmapData[today]){
        heatmapData[today]+=minutes;
    }else{
        heatmapData[today]=minutes;
    }
    localStorage.setItem('deep_work',JSON.stringify(heatmapData));
    renderHeatmap();
}   

function renderHeatmap(){
    const container=document.getElementById('heatmap-container');
    if(!container)return;
    container.innerHTML='';
    let heatmapData=JSON.parse(localStorage.getItem('deep_work'))||{};
    for(let i=6;i>=0; i--){
        let d=new Date();
        d.setDate(d.getDate()-i);
        let dateStr=d.toISOString().split('T')[0];
        let mins= heatmapData[dateStr]||0;
         let square=document.createElement('div');
        square.style.width='16px';
        square.style.height='16px';
        square.style.borderRadius='3px';
        square.title=`${mins} mins on ${dateStr}`;

        if (mins===0){
            square.style.backgroundColor='transparent';
            square.style.border='1px solid var(--text-dim)';
            square.style.opacity='0.3';
        } else if(mins<50){
            square.style.backgroundColor='#4a1515';
            square.style.border='none';
        }else if(mins<100){
            square.style.backgroundColor= '#7a1c1c';
            square.style.border='none';

        }else if(mins<150){
            square.style.backgroundColor='#a32a2a';
            square.style.border='none';
        }else{
            square.style.backgroundColor='#aa3333';
            square.style.border='none';
            square.style.boxShadow='0 0 8px #aa333366';
        }
        container.appendChild(square);
    }
}
renderHeatmap();

const cliContainer=document.getElementById('cli-container');
const cliInput=document.getElementById('cli-input');

document.addEventListener('keydown',(e)=>{
    if(e.altKey && e.key.toLowerCase()==='c'){
        e.preventDefault();
        cliContainer.classList.toggle('cli-visible');
        document.body.classList.toggle('cli-open');
        if(cliContainer.classList.contains('cli-visible')){
            cliInput.value='';
            cliInput.focus();
        }else{
            cliInput.blur();
        }
    }
});

cliInput.addEventListener('keypress',(e)=>{
    if(e.key==='Enter' && cliInput.value.trim()!==''){
        const args= cliInput.value.trim().toLowerCase().split(' ');
        const command=args[0];
        const value=args[1];
        switch(command){
            case 'focus':
                    let mins=parseInt(value);
                    if(!isNaN(mins)&& mins>0){
                        if(isFlowing){flowPlay.click();}
                        flowInput.value=mins;
                        flowInput.dispatchEvent(new Event('change'));
                        flowPlay.click();
                        cliInput.value=`> Focus protocol initiated: ${mins} minutes`;

                    }else{
                        cliInput.value=`> Error: Provide a value number(e.g., focus 67)`;
                    }
                    break;
            case 'rain':
                let vol=parseInt(value);
                if(!isNaN(vol)&& vol>=0 && vol<=100){
                    let mappedVol=vol/100;
                    rainSlider.value=mappedVol;
                    rainSlider.dispatchEvent(new Event('input'));
                    cliInput.value=`> Ambient rain set to ${vol}%`;

                }else{
                    cliInput.value=`> Error: Provide volume 0-100(e.g., rain 67)`;
                }
                break;

            case 'lofi':
                let lofiVol=parseInt(value);
                if(!isNaN(lofiVol)&& lofiVol>=0 && lofiVol<= 100){
                    let mappedLofi=lofiVol/100;
                    volumeSlider.value=mappedLofi;
                    volumeSlider.dispatchEvent(new Event('input'));
                    if(bgAudio.paused && mappedLofi>0){
                        musicToggle.click();

                    }else if (!bgAudio.paused && mappedLofi===0){
                        musicToggle.click();
                    }
                    cliInput.value=`> Lofi radio volume set to ${lofiVol}%`;

                }else{
                    cliInput.value=`> Error: Provide volume 0-100 (e.g., lofi 67)`;

                }
                break;
            case 'zen':
                zenBtn.click();
                cliInput.value='> Zen mode toggled';
                break;
            
            case'theme':
                const validThemes=['default', 'vanilla','gruvbox','nord','midnight','matcha'];
                if(value==='crt'){
                    crtBtn.click();
                    cliInput.value='> CRT filter toggled';

                }else if(validThemes.includes(value)){
                    currentTheme=value;
                    document.body.setAttribute('data-theme', value);
                    localStorage.setItem('theme', value);
                    cliInput.value=`> Theme changed to ${value}`;

                }else{
                    cliInput.value='> Error: Valid themes are crt, default, vanilla, gruvbox, nord, midnight, matcha'
                }
                break;
            case'clear':
                if(value==='scratchpad'){
                    const textarea=document.getElementById('notes-area');
                    textarea.value='';
                    textarea.dispatchEvent(new Event('input'));
                    cliInput.value='> Scratchpad memory wiped';
                }else{
                    cliInput.value='> Error: Did you mean "clear scratchpad"?';

                }
                break;
            case 'strict':
                strictBtn.click();
                cliInput.value=`> Strict Mode toggled`;
                break;
            case 'todo':
                const taskText= args.slice(1).join(' ').trim();
                if(taskText){
                    savedTasks.push('> '+ taskText);
                    localStorage.setItem('focus_tasks', JSON.stringify(savedTasks));
                    renderTasks();
                    cliInput.value='> Task added to Focus list';
                } else{
                    cliInput.value= '> Error: Provide a task (e.g., todo Read chapter 4)';
                }
                break;
            case 'note':
                const noteText= args.slice(1).join(' ').trim();
                if(noteText){
                    const textareaEl= document.getElementById('notes-area');
                    textareaEl.value +=(textareaEl.value ? '\n' :'')+'- '+ noteText;
                    textareaEl.dispatchEvent(new Event('input'));
                    cliInput.value='> Note appended to Scratchpad';
                }else{
                    cliInput.value='> Error: Provide a note (e.g., note Remember to email Elbin)';

                }
                break;
            case 'local':
                if(localTracks.length===0){
                    cliInput.value='> Error: No local tracks loaded';
                    break;
                }        
                if(value==='play'|| value==='pause'){
                    localPlayBtn.click();
                    cliInput.value= `Local player ${localAudioEngine.paused ? 'paused' : 'playing'}`;
                }else if(value==='next'){
                    localNextBtn.click();
                    cliInput.value='> Skipping to next track';

                }else if(value==='prev'){
                    localPrevBtn.click();
                    cliInput.value='> Going to previous track';
                }else{
                    cliInput.value='> Error: Valid args are [play, pause, next, prev]';
                }
                break;
            case 'help':
                    docsModal.classList.add('modal-visible');
                    cliInput.value='> System documentation opened.';
                    break;
                    
            case 'sudo':
                    cliInput.value='> Nice try ;)';
                    break;
            default:
                cliInput.value=`> Command not recognized: ${command}`;

        }
        setTimeout(()=>{
            if(cliContainer.classList.contains('cli-visible')){
                cliContainer.classList.remove('cli-visible');
                document.body.classList.remove('cli-open');
                cliInput.blur();
                cliInput.value='';
            }
        }, 3500); 
    }
});

const docsModal=document.getElementById('docs-modal');
const helpbtn=document.getElementById('help-btn');
const closeDocs=document.getElementById('close-docs');
helpbtn.addEventListener('click',()=> docsModal.classList.add('modal-visible'));
closeDocs.addEventListener('click',()=> docsModal.classList.remove('modal-visible'));

docsModal.addEventListener('click',(e)=>{
    if(e.target=== docsModal){
        docsModal.classList.remove('modal-visible');
    }
});


const settingsModal=document.getElementById('settings-modal');
const settingsBtn=document.getElementById('settings-btn');
const closeSettings= document.getElementById('close-settings');
const autoPlayCheck= document.getElementById('setting-auto-play');
const autoPauseCheck=document.getElementById('setting-auto-pause');
const vibrancyCheck=document.getElementById('setting-vibrancy');
let autoPlayRadio= localStorage.getItem('auto_play_radio')==='true';
let autoPauseRadio= localStorage.getItem('auto_pause_radio')==='true';
let isVibrancyActive=localStorage.getItem('vibrancy_active')==='true';


autoPlayCheck.checked=autoPlayRadio;
autoPauseCheck.checked=autoPauseRadio;
vibrancyCheckCheck.checked=isVibrancyActive;
if(isVibrancyActive)document.body.classList.add('vibrancy-active');
vibrancyCheck.addEventListener('change',(e)=>{
    isVibrancyActive=e.target.checked;
    localStorage.setItem('vibrancy_active',isVibrancyActive);
    if(isVibrancyActive){
        document.body.classList.add('vibrancy-active');

    }else{
        document.body.classList.remove('vibrancy-active');
    }
});

autoPlayCheck.addEventListener('change',(e)=>{
    autoPlayRadio=e.target.checked;
    localStorage.setItem('auto_play_radio', autoPlayRadio);
});

autoPauseCheck.addEventListener('change',(e)=>{
    autoPauseRadio= e.target.checked;
    localStorage.setItem('auto_pause_radio', autoPauseRadio);

});

settingsBtn.addEventListener('click',()=> settingsModal.classList.add('modal-visible'));
closeSettings.addEventListener('click',()=> settingsModal.classList.remove('modal-visible'));
settingsModal.addEventListener('click',(e)=>{
    if(e.target===  settingsModal){
        settingsModal.classList.remove('modal-visible');
    }
});
const themesModal=document.getElementById('themes-modal');
const themesOpenBtn=document.getElementById('themes-open-btn');
const closeThemes=document.getElementById('close-themes');
themesOpenBtn.addEventListener('click',()=> themesModal.classList.add('modal-visible'));
closeThemes.addEventListener('click',()=>themesModal.classList.remove('modal-visible'));
themesModal.addEventListener('click',(e)=>{
    if(e.target=== themesModal){
        themesModal.classList.remove('modal-visible');
    }
});

const mediaToggleBtn=document.getElementById('media-mode-toggle');
const lofiControls=document.getElementById('lofi-controls');
const localControls=document.getElementById('local-controls');
const localPlaylistView=document.getElementById('local-playlist-view');
const eqCanvasEl=document.getElementById('eq-canvas');
let isLocalMode=false;

mediaToggleBtn.addEventListener('click',()=>{
    isLocalMode=!isLocalMode;
    if(isLocalMode){
        mediaToggleBtn.textContent='Local Player ⟲';
        lofiControls.style.display='none';
        eqCanvasEl.style.display='none';
        localControls.style.display='flex';
        localPlaylistView.style.display='flex';
        if(!bgAudio.paused) toggleRadio(false,true);
        playerStatus.textContent='Ready';

    }else{
        mediaToggleBtn.textContent='Lofi Radio ⟲';
        lofiControls.style.display='flex';
        eqCanvasEl.style.display='block';
        localControls.style.display='none';
        localPlaylistView.style.display='none';
        if(!localAudioEngine.paused){
            localAudioEngine.pause();
            localPlayBtn.textContent='▶';
        }
        playerStatus.textContent= bgAudio.paused? 'Paused':'Live Stream';
        
    }
});

const folderUpload=document.getElementById('folder-upload');
const fileUpload=document.getElementById('file-upload');
const localPlaylistEl=document.getElementById('local-playlist');
const localAudioEngine=document.getElementById('local-audio-engine');
const localPlayBtn=document.getElementById('local-play');
const localPrevBtn= document.getElementById('local-prev');
const localNextBtn= document.getElementById('local-next');
const localTrackTitle=document.getElementById('local-track-title');
const localArtistName=document.getElementById('local-artist-name');
const localProgressBar=document.getElementById('local-progress-bar');
const localProgressContainer= document.getElementById('local-progress-container');
const localVolumeSlider=document.getElementById('local-volume-slider');
localAudioEngine.volume=localVolumeSlider.value;
localVolumeSlider.addEventListener('input',(e)=>{
    localAudioEngine.volume=e.target.value;
});
let localTracks=[];
let currentLocalIndex=0;
const validAudioExts=['.mp3', '.wav', '.flac', '.ogg', '.m4a'];

function handleAudioUpload(e){
    const files= Array.from(e.target.files);
    const newTracks=files.filter(file=> validAudioExts.some(ext=> file.name.toLowerCase().endsWith(ext)));
    if(newTracks.length>0){
        localTracks=[...localTracks, ...newTracks];
        if(localSortSelect.value !=='default'){
            localSortSelect.dispatchEvent(new Event('change'));

        }else{
            renderLocalPlayList();

        }
        if(localTracks.length===newTracks.length){
            loadLocalTrack(0);
        }
    }
    e.target.value='';
}
folderUpload.addEventListener('change', handleAudioUpload);
fileUpload.addEventListener('change', handleAudioUpload);

function renderLocalPlayList(){
    localPlaylistEl.innerHTML='';
    localTracks.forEach((track, index)=>{
        const li=document.createElement('li');
        li.textContent=track.name;
        li.addEventListener('click', ()=>{
            loadLocalTrack(index);
            localAudioEngine.play();
            localPlayBtn.textContent='⏸';
            playerStatus.textContent='Playing Local';

        });
        localPlaylistEl.appendChild(li);
    });
}

function loadLocalTrack(index){
    currentLocalIndex=index;
    const file=localTracks[currentLocalIndex];
    localAudioEngine.src= URL.createObjectURL(file);
    const cleanname=file.name.replace(/\.[^/.]+$/,"");
    if(cleanname.includes(" - ")){
        const parts=cleanname.split(" - ");
        localArtistName.textContent=parts[0].trim();
        localTrackTitle.textContent= parts[1].trim();

    }else if(cleanname.includes("-")){
        const parts= cleanname.split("-");
        localArtistName.textContent=parts[0].trim();
        localTrackTitle.textContent=parts.slice(1).join("-").trim();
    }else{
        localTrackTitle.textContent=cleanname;
        localArtistName.textContent="Unknown Artist";
    }
    
    Array.from(localPlaylistEl.children).forEach((li, i)=>{
        li.classList.toggle('active-track', i=== currentLocalIndex);

    });


}

localPlayBtn.addEventListener('click',()=>{
    if(localTracks.length===0) return;
    if(localAudioEngine.paused){
        localAudioEngine.play();
        localPlayBtn.textContent='⏸';
        playerStatus.textContent='Playing Local';

    }else{
        localAudioEngine.pause();
        localPlayBtn.textContent='▶';
        playerStatus.textContent='Paused';
    }
});

localNextBtn.addEventListener('click',()=>{
    if(localTracks.length=== 0) return;
    loadLocalTrack((currentLocalIndex+1)% localTracks.length);
    localAudioEngine.play();
    localPlayBtn.textContent='⏸';
});

localPrevBtn.addEventListener('click', ()=>{
    if(localTracks.length===0) return;
    loadLocalTrack((currentLocalIndex-1+ localTracks.length)%localTracks.length);
    localAudioEngine.play();
    localPlayBtn.textContent='⏸';
});

localAudioEngine.addEventListener('ended',()=> localNextBtn.click());
localAudioEngine.addEventListener('timeupdate',()=>{
    if(localAudioEngine.duration){
        localProgressBar.style.width=`${(localAudioEngine.currentTime/localAudioEngine.duration)*100}%`;

    }
});
localProgressContainer.addEventListener('click',(e)=>{
    if(localTracks.length===0)return;
    localAudioEngine.currentTime=(e.offsetX/localProgressContainer.clientWidth)* localAudioEngine.duration;
});

localSortSelect.addEventListener('change',(e)=>{
    if(localTracks.length===0)return;
    const currentFile=localTracks[currentLocalIndex];
    const sortType= e.target.value;
    if(sortType==='az'){
        localTracks.sort((a,b)=>a.name.localeCompare(b.name));

    }else if(sortType==='za'){
        localTracks.sort((a,b)=> b.name.localeCompare(a.name));

    }else if(sortType==='shuffle'){
        for(let i = localTracks.length-1; i>0; i--){
            const j=Math.floor(Math.random()*(i+1));
            [localTracks[i], localTracks[j]]= [localTracks[j], localTracks[i]];
        }
    }
    if(currentFile){
        currentLocalIndex=localTracks.indexOf(currentFile);
    }
    renderLocalPlayList();
    Array.from(localPlaylistEl.children).forEach((li,i)=>{
        li.classList.toggle('active-track',i===currentLocalIndex);
    });
});

const localEqCanvas= document.getElementById('local-eq-canvas');
const localCanvasCtx=localEqCanvas.getContext('2d');
let localAudioCtx, localAnalyser, localSource,localDataArray,localBufferLength;
let isLocalAudioInitialized=false;
function initLocalAudioContent(){
    if(isLocalAudioInitialized) return;
    const AudioContext=window.AudioContext||window.webkitAudioContext;
    localAudioCtx=new AudioContext();
    localAnalyser=localAudioCtx.createAnalyser();
    localAnalyser.fftSize=128;
    localBufferLength= localAnalyser.frequencyBinCount;
    localDataArray=new Uint8Array(localBufferLength);
    localSource=localAudioCtx.createMediaElementSource(localAudioEngine);
    localSource.connect(localAnalyser);
    localAnalyser.connect(localAudioCtx.destination);
    isLocalAudioInitialized=true;
    drawLocalEQ();

}
function drawLocalEQ(){
    requestAnimationFrame(drawLocalEQ);
    localCanvasCtx.clearRect(0,0, localEqCanvas.width, localEqCanvas.height);

    if(localAudioEngine.paused){
        localCanvasCtx.fillStyle= themeColors.dim;
        localCanvasCtx.fillRect(0, localEqCanvas.height/2, localEqCanvas.width,1);
        return;
    }

    localAnalyser.getByteFrequencyData(localDataArray);
    const barWidth=(localEqCanvas.width/(localBufferLength/2.5));
    let x=0;
    for(let i=0; i<localBufferLength/2.5; i++){
        let barHeight=(localDataArray[i]/255)*localEqCanvas.height;
        localCanvasCtx.fillStyle=barHeight>(localEqCanvas.height*0.7)?themeColors.accent:themeColors.main;
        localCanvasCtx.fillRect(x,localEqCanvas.height-barHeight,barWidth-1, barHeight);
        x+=barWidth;
    }
}
localAudioEngine.addEventListener('play',initLocalAudioContent);

const wallpaperUpload=document.getElementById('wallpaper-upload');
const clearWallpaper=document.getElementById('clear-wallpaper');

try{
    const savedWallpaper=localStorage.getItem('console_wallpaper');
    if(savedWallpaper){
        document.body.style.backgroundImage=`url("${savedWallpaper}")`;
        document.body.classList.add('has-wallpaper');

    }
}catch(err){
    console.error("Could not load saved wallaper");

}
wallpaperUpload.addEventListener('change',(e)=>{
    const file=e.target.files[0];
    if(!file)return;
    const reader=new FileReader();
    reader.onload=(event)=>{
        const rawDataUrl=event.target.result;
        document.body.style.backgroundImage=`url("${rawDataUrl}")`;
        document.body.classList.add('has-wallpaper');

        const img=new Image();
        img.onload=()=>{
            try{
                const canvas=document.createElement('canvas');
                const ctx=canvas.getContext('2d');
                const MAX_WIDTH=1920;
                let width= img.width;
                let height=img.height;
                if(width>MAX_WIDTH){
                    height *=MAX_WIDTH/width;
                    width=MAX_WIDTH;
                }
                canvas.width=width;
                canvas.height=height;
                ctx.drawImage(img, 0,0,width,height);
                const compressedUrl=canvas.toDataURL('image/jpeg',0.6);
                localStorage.setItem('console_wallpaper', compressedUrl);
                console.log("Wallpaper saved to memoryu");
            }catch(err){
                console.error("save failed, but wallaper is applied forr this session");

            }
        };
        img.src=rawDataUrl;

    };
    reader.readAsDataURL(file);
});

clearWallpaper.addEventListener('click',()=>{
    document.body.style.backgroundImage='';
    document.body.classList.remove('has-wallpaper');
    localStorage.removeItem('console_wallpaper');

});