let countObj = document.getElementById('count');
let tooltip = document.getElementsByClassName('tooltip')[0];
let cps = document.getElementById('cps');
tooltip.style.transform = 'scale(0)';

let count = 0;

let scale = 1;
let rotation = 0;
let h = 0;

let value = 0;
let incrementBy = 1;
let incrementMultiplier = 1;

let tooltipCooldown = 2000;
let lastTooltip = -1;

let buyAmount = 1;
let x1 = document.getElementById('buy1');
x1.classList.add('selected');
let x10 = document.getElementById('buy10');
let x100 = document.getElementById('buy100');

let upgrade1cost, upgrade2cost;
let upgrade1Obj = document.getElementById('upgrade1'), upgrade2Obj = document.getElementById('upgrade2');
let numGens;
let genAmounts = [];
let originalGenCosts = [10, 200, 1000, 20000, 1_000_000, 200_000_000, 1_500_000_000, 1_000_000_000_000, 150_000_000_000_000, 1_000_000_000_000_000, 1e17, 1e19, 1e21, 1e23, 1e25, 1e27, 1e29, 1e31, 1e33, 1e35, 1e37, 1e39];
let genIncrements = [1, 25, 500, 10000, 500_000, 50_000_000, 500_000_000, 100_000_000_000, 50_000_000_000_000, 500_000_000_000_000, 5e16, 5e18, 5e20, 5e22, 5e24, 5e26, 5e28, 5e30, 5e32, 5e34, 5e36, Infinity];
let genCostObjs = [];
let genAmtObjs = [];
let genCosts = [];
let genObjs = document.getElementsByClassName('generator');

let visible = true;
function removeFadeOut( el, speed ) {
    var seconds = speed / 1000;
    const baseline = 50;
    setTimeout(function () {
        el.classList.add('fade');
    }, baseline);
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, speed + baseline);
}
let PlusText = function(text) {
    this.div = document.createElement("div");
    this.div.innerHTML = text;
    document.body.appendChild( this.div ) ;
    this.div.className = "plustext";
    this.div.style.left = mouse.x - 5 + "px";
    this.div.style.top = mouse.y - 5 + "px";
    this.div.style.color = `hsl(${Math.random() * 360}, 100%, 25%)`;
    removeFadeOut(this.div, 2000);
    return this.div;
}

numGens = originalGenCosts.length;
for (let i = 0; i < numGens; i++) {
    genCostObjs.push(document.getElementById(`gen${i + 1}cost`));
    genAmtObjs.push(document.getElementById(`gen${i + 1}amt`));
    genCosts.push(originalGenCosts[i]);
    genAmounts.push(0);
}

document.addEventListener('visibilitychange', () => {
if (document.hidden) {
    visible = false;
} else {
    visible = true;
}
});

//count can be incremented by clicking the button. this also makes the size of the count object increase like an explosion, where it slowly goes back to normal size if you dont click it. this means if you are clicking super fast it will keep increasing. this has to be animated, so no setting it directly
function increment() {
    //increase the count
    let oldCount = count;
    let incrementAmt = incrementBy * incrementMultiplier;
    let top = Math.ceil(calculateCps() * 0.05) + Math.ceil(calculateCps() * Math.min(0.0001 * incrementAmt, 0.1));
    if (count > 5e6 && count < 1e7) {
        //if 5mil < count < 10 mil, increase by a percentage of the cps
        //lerp between incrementAmt and top based on the percentage of the way to 10 mil
        incrementAmt = Math.ceil(incrementAmt + (top - incrementAmt) * ((count - 5e6) / 5e6));
    } else if (count >= 1e7) {
        incrementAmt = top;
    }
    let plus = new PlusText('+' + format(incrementAmt));
    count += incrementAmt;
    countObj.innerHTML = format(count);

    //if player reaches infinity, throw confetti
    if (count === Infinity || count === NaN) {
        confetti({
            particleCount: 100,
            startVelocity: 30,
            spread: 70,
            origin: { y: 0.65 }
        });
    }

    animate(oldCount, count);

    //play sound
    // let audio = new Audio('click.wav');
    // audio.play();

    //log
    console.log('count incremented');
}

function animate(oldCount, newCount) {
    if (oldCount === newCount && newCount !== Infinity) {
        //if count hasn't changed, don't animate
        return;
    }
    //choose a random rotation between -15 and 15 degrees
    rotation = Math.random() * 30 - 15;
    //choose a random hue
    h = Math.random() * 360;
    scale += getPunch(oldCount, newCount);
    if (newCount / 10 > oldCount / 10) {
        value = 100;
    } else {    
        value = 50;
    }

    countObj.style.color = `hsl(${h}, 100%, ${value}%)`;
    countObj.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
}

function format(num) {
    //return a string representating a human readable number
    if(num === Infinity || num === NaN) return '∞';
    if (num < 1e3) return num;
    if (num < 1e6) return (num / 1e3).toFixed(1) + ' K';
    if (num < 1e9) return (num / 1e6).toFixed(1) + ' M';
    if (num < 1e12) return (num / 1e9).toFixed(1) + ' B';
    if (num < 1e15) return (num / 1e12).toFixed(1) + ' T';
    if (num < 1e18) return (num / 1e15).toFixed(1) + ' q';
    if (num < 1e21) return (num / 1e18).toFixed(1) + ' Q';
    if (num < 1e24) return (num / 1e21).toFixed(1) + ' s';
    if (num < 1e27) return (num / 1e24).toFixed(1) + ' S';
    if (num < 1e30) return (num / 1e27).toFixed(1) + ' o';
    if (num < 1e33) return (num / 1e30).toFixed(1) + ' N';
    if (num < 1e36) return (num / 1e33).toFixed(1) + ' d';
    if (num < 1e39) return (num / 1e36).toFixed(1) + ' U';
    if (num < 1e42) return (num / 1e39).toFixed(1) + ' D';
    //return in scientific notation
    return num.toExponential(2);
}

//returns scale increment based on milestones passed
function getPunch(oldCount, newCount) { 
    if (newCount === Infinity) {
        return 1.7;
    }
    if(Math.floor(newCount / 1000) > Math.floor(oldCount / 1000)) {
        return 1.7;
    }
    if(Math.floor(newCount / 100) > Math.floor(oldCount / 100)) {
        return 1.2;
    }
    if(Math.floor(newCount / 10) > Math.floor(oldCount / 10)) {
        return 0.7;
    }
    if(newCount > oldCount) {
        return 0.2;
    } else {
        return 0;
    }
}

function loop() {
    //decrease the count scale until it reaches 1
    if(scale > 1) {
        scale -= (scale - 1) * 0.1;
        rotation -= rotation * 0.1;
        value -= value * 0.1;
        countObj.style.color = `hsl(${h}, 100%, ${value}%)`;
        countObj.style.transform = `scale(${scale}) rotate(${rotation}deg)`;
    }
    if (lastTooltip !== -1) {
        //hide tooltip if it has been up for tooltipCooldown milliseconds and update last tooltip time
        if (Date.now() - lastTooltip > tooltipCooldown) {
            //if tooltip scale is not 0, decrease it slowly
            if (tooltip.style.transform !== 'scale(0)') {
                let scale = parseFloat(tooltip.style.transform.split('(')[1].split(')')[0]);
                scale -= scale * 0.2;
                tooltip.style.transform = `scale(${scale})`;
            }
        }
        //if tooltip is bigger than 1, decrease it slowly until 1
        if (parseFloat(tooltip.style.transform.split('(')[1].split(')')[0]) > 1) {
            let scale = parseFloat(tooltip.style.transform.split('(')[1].split(')')[0]);
            scale -= scale * 0.05;
            tooltip.style.transform = `scale(${scale})`;
        }
    }
    updateExpensive();
  
    window.requestAnimationFrame(loop);
}
  
requestAnimationFrame(loop);
document.title = format(count);
setInterval(() => {
    //every second, do passive increment from generators
    let oldCount = count;
    count += calculateCps();
    if (count === NaN) {
        count = Infinity;
    }
    countObj.innerHTML = format(count);
    document.title = format(count);

    if (count > oldCount || count === Infinity) {
        //if player reaches infinity, throw confetti
        if ((count === Infinity || count === NaN) && visible) {
            confetti({
                particleCount: 100,
                startVelocity: 30,
                spread: 70,
                origin: { y: 0.65 }
            });
        }

        animate(oldCount, count);
    }
}, 1000);

function updateExpensive() {
    //add expensive class to all upgrades that are too expensive and remove it from the ones that are not
    if (upgrade1cost > count) {
        upgrade1Obj.classList.add('expensive');
    } else {
        upgrade1Obj.classList.remove('expensive');
    }
    if (upgrade2cost > count) {
        upgrade2Obj.classList.add('expensive');
    } else {
        upgrade2Obj.classList.remove('expensive');
    }
    for (let i = 0; i < numGens; i++) {
        if (genCosts[i] > count) {
            genObjs[i].classList.add('expensive');
        } else {
            genObjs[i].classList.remove('expensive');
        }
    }
}

function calculateCps() {  
    let cpsAmt = 0;
    for (let i = 0; i < numGens; i++) {
        let gen = genAmounts[i] * genIncrements[i];
        if (genAmounts[i] === 0) {
            gen = 0;
        }
        cpsAmt += gen;
    }
    if (cpsAmt === NaN) {
        cpsAmt = Infinity;
    }

    cps.innerHTML = format(cpsAmt) + '/s';
    return cpsAmt;
}

function buy1() {
    x1.classList.add('selected');
    x10.classList.remove('selected');
    x100.classList.remove('selected');
    buyAmount = 1;
    calculatePrices();
}

function buy10() {
    x1.classList.remove('selected');
    x10.classList.add('selected');
    x100.classList.remove('selected');
    buyAmount = 10;
    calculatePrices();
}

function buy100() {
    x1.classList.remove('selected');
    x10.classList.remove('selected');
    x100.classList.add('selected');
    buyAmount = 100;
    calculatePrices();
}

function calculatePrices() {
    upgrade1cost = 0;
    for (let i = incrementBy; i < incrementBy + buyAmount; i++) {
        upgrade1cost += Math.ceil(5*Math.pow(1.05, i-1));
    }
    upgrade2cost = 0;
    for (let i = incrementMultiplier; i < incrementMultiplier + buyAmount; i++) {
        upgrade2cost += Math.ceil(100*Math.pow(1.05, i-1));
    }
    for (let i = 0; i < numGens; i++) {
        genCosts[i] = 0;
        for (let j = genAmounts[i]; j < genAmounts[i] + buyAmount; j++) {
            genCosts[i] += Math.ceil(originalGenCosts[i] * Math.pow(1.05, j));
        }
    }
    upgrade1costObj.innerHTML = format(upgrade1cost);
    upgrade2costObj.innerHTML = format(upgrade2cost);
    for(let i = 0; i < numGens; i++) {
        genCostObjs[i].innerHTML = format(genCosts[i]);
    }
}

let upgrade1costObj = document.getElementById('upgrade1cost');
let upgrade1amtObj = document.getElementById('upgrade1amt');
upgrade1amtObj.innerHTML = incrementBy;
function upgrade1() {
    if (count < upgrade1cost) {
        tooltip.style.transform = 'scale(1.2)';
        lastTooltip = Date.now();
        return;
    }
    incrementBy += buyAmount;
    if (upgrade1cost === Infinity && count === Infinity) {
        //infinity minus infinity is NaN, so set it to 0
        count = Infinity;
    } else {
        count -= upgrade1cost;
    }
    calculatePrices();
    upgrade1amtObj.innerHTML = incrementBy;
    countObj.innerHTML = format(count);
}

let upgrade2costObj = document.getElementById('upgrade2cost');
let upgrade2amtObj = document.getElementById('upgrade2amt');
upgrade2amtObj.innerHTML = '×' + incrementMultiplier;
function upgrade2() {
    if (count < upgrade2cost) {
        tooltip.style.transform = 'scale(1.2)';
        lastTooltip = Date.now();
        return;
    }
    incrementMultiplier += buyAmount;
    if (upgrade2cost === Infinity && count === Infinity) {
        //infinity minus infinity is NaN, so set it to 0
        count = Infinity;
    } else {
        count -= upgrade2cost;
    }
    calculatePrices();
    upgrade2amtObj.innerHTML = '×' + incrementMultiplier;
    countObj.innerHTML = format(count);
}

function gen(tier) {
    if (count < genCosts[tier]) {
        tooltip.style.transform = 'scale(1.2)';
        lastTooltip = Date.now();
        return;
    }
    genAmounts[tier] += buyAmount;
    if (genCosts[tier] === Infinity && count === Infinity) {
        //infinity minus infinity is NaN, so set it to 0
        count = Infinity;
    } else {
        count -= genCosts[tier];
    }
    calculatePrices();
    calculateCps();
    genAmtObjs[tier].innerHTML = genAmounts[tier];
    countObj.innerHTML = format(count);
}

calculatePrices();
animate(0, 0.1);