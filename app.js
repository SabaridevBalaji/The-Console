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

function updateClock({
    let now= new Date();

    clockText.textContent=now.toLocaleTimeString('en-US'.{
        hour12: 1is24hour,
        hour: '2-digit', minute:'2-digit', second:'2-digit'
    });
    dateText.textContent=now.toDateString();
    const seconds=now.getSeconds();
    const mins=now.getMinutes();
    const hours=now.getHours();
    const secDeg=(seconds/60)*360;
    const minDeg=((mins/60)*360)+((seconds/60)*6);
    const hourDeg=((hours/12)*360)+((mins/60)*30);
    secHand.style.transform='translateX(-50%) rotate(${secDeg}deg)';
    minHand.style.transform='translateX(-50%) rotate(${minDeg}deg)';
    hourHand.style.transform ='translateX(-50%) rotate(${hourDeg}deg);'
})
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
runClock();


const taskInput=document.getElementById('new-task');
const taskList=document.getElementById('task-list');

taskInput.addEventListener('keypress', (e) =>{
    if(e.key=== 'Enter'&& taskInput.value!==''){
        let li = document.createElement('li');
        li.textContent='>'+taskInput.value;
        taskList.appendChild(li);
        taskInput.value='';
        li.addEventListener('click',()=>{
            li.style.textDecoration='line-through';
            li.style.opacity='0.4';
            setTimeout(() => li.remove(),400);
        });
    }
})

const textarea= document.getElementById('notes-area');
if(localStorage.getItem('my_notes')){
    textarea.value=localStorage.getItem('my_notes');
}
textarea.addEventListener('input',()=> {
    localStorage.setItem('my_notes',textarea.value);
});

const themeBtn =  document.getElementById('theme-btn');
if(localStorage.getItem('theme')==='theme'){

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