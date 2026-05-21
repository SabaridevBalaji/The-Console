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