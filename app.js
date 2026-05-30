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

const themeBtn =  document.getElementById('theme-btn');
if(localStorage.getItem('theme')==='vanilla'){

    document.body.classList.add('vanilla-theme');
}
themeBtn.addEventListener('click', ()=>{
    document.body.classList.toggle('vanilla-theme');
    if(document.body.classList.contains('vanilla-theme')){
        localStorage.setItem('theme', 'vanilla');
    } 
    else{
        localStorage.setItem('theme','dark');
    }
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
bgAudio.volume=volumeSlider.value;
alarmAudio.volume=0.8;
volumeSlider.addEventListener('input', (e)=>{
    bgAudio.volume=e.target.value;
});

function updateFlow(){
    const m=String(Math.floor(flowTime/60)).padStart(2,'0');
    const s=String(flowTime%60).padStart(2,'0');
    flowDisplay.textContent=`${m}:${s}`;

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
        bgAudio.play().catch(()=> console.log('Connecting to stream....'));
        musicToggle.textContent="⏸";
        playerStatus.textContent='Live Stream';
    }
}
musicToggle.addEventListener('click',()=>{
    toggleRadio();
});

flowPlay.addEventListener('click',()=>{
    if(!isFlowing){
        clearInterval(flowTimer);
        toggleRadio(false,true);
        flowPlay.textContent='Start';
    } else{
        flowTimer=setInterval(() => {
            flowTime--;
            updateFlow();
            if(flowTime<=0){
                clearInterval(flowTimer);
                toggleRadio(false,true);
                alarmAudio.play().catch(()=> console.log('add carchime.wav to your foler'));
                flowPlay.textContent='Done';
            }
        }, 1000);
        toggleRadio(true,false);
        flowPlay.textContent='Pause';
    }
    isFlowing=!isFlowing;
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

