let countObj = document.getElementById('count');
let count = 0;
let scale = 1;
let rotation = 0;
let h = 0;
let value = 0;

//count can be incremented by clicking the button. this also makes the size of the count object increase like an explosion, where it slowly goes back to normal size if you dont click it. this means if you are clicking super fast it will keep increasing. this has to be animated, so no setting it directly
function increment() {
    countObj = document.getElementById('count');

    //increase the count
    count++;
    countObj.innerHTML = count;

    //scale
    scale += 0.2;
    //choose a random rotation between -15 and 15 degrees
    rotation = Math.random() * 30 - 15;
    //choose a random hue
    h = Math.random() * 360;
    value = 50;
    if (count % 10 == 0) { 
        value = 100;
        scale += 0.5;
    }

    if (count % 100 == 0) {
        scale += 1;
    }

    countObj.style.color = `hsl(${h}, 100%, ${value}%)`;
    countObj.style.transform = `scale(${scale}) rotate(${rotation}deg)`;

    //log
    console.log('count incremented');
}

function decrease() {
    //decrease the count scale until it reaches 1
    if(scale > 1) {
        scale -= (scale - 1) * 0.1;
        rotation -= rotation * 0.1;
        value -= value * 0.1;
        countObj.style.color = `hsl(${h}, 100%, ${value}%)`;
        countObj.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    }
  
    window.requestAnimationFrame(decrease);
}
  
requestAnimationFrame(decrease);

countObj.addEventListener('click', increment);