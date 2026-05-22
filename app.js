function runClock(){
    const clock =document.getElementById('clock-text');
    const date=document.getElementById('date-text');
    setInterval(() =>{
        let now =new Date();
        clock.textContent=now.toLocaleTimeString('en-US',{hour12:false});
        date.textContent=now.toDateString();
        },1000);
    }
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