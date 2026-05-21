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
    }
})