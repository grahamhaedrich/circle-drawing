// WEBSITE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
} from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDB-h4RQa4PCTy5ZcaIfO2kq-ujH48VueA",
  authDomain: "circle-drawing-a78f9.firebaseapp.com",
  projectId: "circle-drawing-a78f9",
  storageBucket: "circle-drawing-a78f9.appspot.com",
  messagingSenderId: "740528213712",
  appId: "1:740528213712:web:1fdd1f0137196e00abd8d5",
  measurementId: "G-ER236S69LP",
  databaseURL: "https://circle-drawing-a78f9-default-rtdb.firebaseio.com",
};

const app = initializeApp(firebaseConfig);

// PARAMETERS
const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
ctx.lineWidth = 1;
ctx.strokeStyle = "black";

const innerSize = 110;
const outerSize = innerSize * 1.3;
const borderX = canvas.width / 2;
const borderY = canvas.height / 2;

const middleSize = (outerSize - innerSize) / 2;
const leftCircleX = canvas.width / 2 - innerSize - (outerSize - innerSize) / 2;
const rightCircleX = canvas.width / 2 + innerSize + (outerSize - innerSize) / 2;
const middleY = canvas.height / 2;

let data = [];
let accuracy = 0;
let allAccuracies = [];
let completed = false;
let top = true;

// MAIN PAGE
document.addEventListener("DOMContentLoaded", async function () {
  writeData(
    {
      age: localStorage.getItem("age"),
      gender: localStorage.getItem("gender"),
      handedness: localStorage.getItem("handedness"),
      device: localStorage.getItem("device"),
      training: training,
    },
    0,
  );

  //await instructions();

  if (training) {
    await trainingPage();
    await trainingGame();
    document.getElementById("trainingOver").style.display = "flex";
  } else {
    await testingPage();
    await testingGame();
    document.getElementById("testingOver").style.display = "flex";
  }
});

async function instructions() {
  return new Promise(async (resolve) => {
    const Instructions = document.getElementById("Instructions");
    Instructions.style.display = "flex";

    const button = document.getElementById("beginPractice");

    button.addEventListener("click", () => {
      Instructions.style.display = "none";
      resolve();
    });
  });
}

// TRAINING
let training = false;
let trainingBlocks = 3;
let trainingMovements = 120;
let trainingRestInterval = 30;
let trainingDemoTime = 10 * 1000;
let trainingRestTime = 5 * 60 * 1000;
let trainingScore = 0;

// slow group
let trainingMinTime = 960;
let trainingMaxTime = 1440;
let trainingReward = 3;

// medium group
/*let trainingMinTime = 520
  let trainingMaxTime = 780
  let trainingReward = 4*/

// fast group
/*let trainingMinTime = 360
  let trainingMaxTime = 540
  let trainingReward = 5*/

async function trainingPage() {
  return new Promise(async (resolve) => {
    const Instructions = document.getElementById("Training");
    Instructions.style.display = "flex";

    const button = document.getElementById("beginTraining");

    button.addEventListener("click", () => {
      Instructions.style.display = "none";
      resolve();
    });
  });
}

async function trainingGame() {
  return new Promise(async (resolve) => {
    let round = 0;
    for (let b = 0; b < trainingBlocks; b++) {
      for (let m = 0; m < trainingMovements; m++) {
        round++;

        const score = document.getElementById("score");
        score.textContent = `Score: ${trainingScore}`;
        score.style.display = "flex";

        const goalTime = document.getElementById("goalTime");
        goalTime.textContent = `Min: ${trainingMinTime}ms, Max: ${trainingMaxTime}ms`;
        goalTime.style.display = "flex";

        displayBoundary();
        await beginRound();
        data = await beginDraw(trainingMaxTime);
        accuracy = calculateAccuracy(data["data"]);
        allAccuracies.push(accuracy);
        await drawPath(data["data"]);

        if (
          data["time"] >= testingRounds[b].min / 1000 &&
          data["time"] <= testingRounds[b].max / 1000 &&
          accuracy >= 70
        ) {
          completed = true;
          trainingScore += trainingReward;
        } else {
          completed = false;
        }

        await displayAccuracy(accuracy, data["time"]);

        writeData(
          {
            points: data["data"],
            accuracy: accuracy,
            time: data["time"],
            completed: completed,
          },
          round,
        );

        if (round % trainingRestInterval == 0) {
          await trainingDemo();
        }

        top = !top;
      }
      await trainingBreak();
    }

    score.style.display = "none";
    goalTime.style.display = "none";

    const averageAccuracy =
      allAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) /
      allAccuracies.length;
    document.getElementById("averageAccuracy").textContent +=
      `${averageAccuracy.toFixed(2)}%`;
    resolve();
  });
}

function trainingDemo() {
  return new Promise(async (resolve) => {
    const Demo = document.getElementById("TrainingDemo");
    Demo.style.display = "flex";

    setTimeout(() => {
      Demo.style.display = "none";
      resolve();
    }, trainingDemoTime);
  });
}

function trainingBreak() {
  return new Promise(async (resolve) => {
    const Break = document.getElementById("TrainingBreak");
    Break.style.display = "flex";

    const countdownElement = document.getElementById("countdownValue");
    let remainingSeconds = trainingRestTime / 1000;

    const countdownInterval = setInterval(() => {
      countdownElement.textContent = remainingSeconds;
      remainingSeconds--;

      if (remainingSeconds == 0) {
        clearInterval(countdownInterval);
        Break.style.display = "none";
        resolve();
      }
    }, 1000); // Update every second
  });
}

// TESTING
const testingRanges = [
  { min: 240, max: 420 },
  { min: 400, max: 600 },
  { min: 640, max: 960 },
  { min: 800, max: 1200 },
  { min: 1200, max: 1800 },
];
const testingRounds = testingRanges.flatMap((range) => [range, range]); // two of each time range
shuffleArray(testingRounds); // randomize range

const testingRestTime = 10 * 1000;
const testingPracticeMovements = 40;
const testingBlocks = 10;
const testingBlockMovements = 10;
const warmUpMaxTime = 1000 * 1000;

async function testingPage() {
  return new Promise(async (resolve) => {
    const Testing = document.getElementById("Testing");
    Testing.style.display = "flex";

    const button = document.getElementById("beginTesting");

    button.addEventListener("click", () => {
      Testing.style.display = "none";
      resolve();
    });
  });
}

async function testingGame() {
  return new Promise(async (resolve) => {
    let warmUpRound = document.getElementById("WarmUpRound");
    let warmUpScore = document.getElementById("WarmUpScore");

    let round = 0, score = 0;
    for (let m = 0; m < testingPracticeMovements; m++) {
        round++;
        document.getElementById("wuRound").textContent = `Warm-up Round: ${round}`;
        document.getElementById("wuScore").textContent = `Score: ${score}`;
        warmUpRound.style.display = "flex";
        warmUpScore.style.display = "flex";

        await beginRound();
        data = await beginDraw(warmUpMaxTime);
        
        accuracy = calculateAccuracy(data["data"], innerSize, outerSize);
        await displayAccuracy(accuracy, data["time"]);

        top = !top;
    }

    top = true;

    for (b = 0; b < testingBlocks; b++) {
        for (m = 0; m < testingBlockMovements; m++) {
        displayBoundary();
        await beginRound();
        data = await beginDraw(testRounds[b].max);

        accuracy = calculateAccuracy(data["data"], innerSize, outerSize);
        await displayAccuracy(accuracy, data["time"]);

        let dataToStore = {
            interval: testingRounds[b],
            points: data["data"],
            accuracy: accuracy,
            time: data["time"],
            completed: data["completed"],
        };

        allAccuracies.push(accuracy);

        writeData(dataToStore, currentGame);

        top = !top;
        }
    }

    const averageAccuracy =
        allAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) /
        allAccuracies.length;
    document.getElementById("averageAccuracy").textContent +=
        `${averageAccuracy.toFixed(2)}%`;
    resolve()
    });
}

// GAME
function displayBoundary() {
  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgb(255, 255, 255)";
  ctx.beginPath();
  ctx.arc(borderX, borderY, outerSize, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.beginPath();
  ctx.arc(borderX, borderY, innerSize, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  if (top == true) {
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.beginPath();
    ctx.arc(leftCircleX, middleY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(rightCircleX, middleY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(leftCircleX, middleY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.beginPath();
    ctx.arc(rightCircleX, middleY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

function beginRound() {
  return new Promise(async (resolve) => {
    var isMouseInsideCircle = false;
    var mouseInCircleTime = 0;
    var intervalId;

    canvas.addEventListener("mousemove", function (event) {
      var mouseX = event.offsetX;
      var mouseY = event.offsetY;

      if (top == true) {
        if (
          Math.sqrt((mouseX - leftCircleX) ** 2 + (mouseY - middleY) ** 2) <=
          middleSize
        ) {
          if (!isMouseInsideCircle) {
            isMouseInsideCircle = true;
            mouseInCircleTime = Date.now();
            intervalId = setInterval(checkTime, 100);
          }
        } else {
          isMouseInsideCircle = false;
          clearInterval(intervalId);
        }
      } else {
        if (
          Math.sqrt((mouseX - rightCircleX) ** 2 + (mouseY - middleY) ** 2) <=
          middleSize
        ) {
          if (!isMouseInsideCircle) {
            isMouseInsideCircle = true;
            mouseInCircleTime = Date.now();
            intervalId = setInterval(checkTime, 100);
          }
        } else {
          isMouseInsideCircle = false;
          clearInterval(intervalId);
        }
      }
    });

    function checkTime() {
      var elapsedTime = Date.now() - mouseInCircleTime;
      if (elapsedTime >= 1000) {
        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.beginPath();

        if (top == true) {
          ctx.arc(leftCircleX, middleY, middleSize, 0, 2 * Math.PI);
        } else {
          ctx.arc(rightCircleX, middleY, middleSize, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
        clearInterval(intervalId);
        resolve();
      }
    }
  });
}

function beginDraw(maxTime) {
  return new Promise(async (resolve) => {
    var startTime = new Date().getTime();
    var mouseX = 0;
    var mouseY = 0;
    var data = [];

    canvas.addEventListener("mousemove", mouseMovement);

    async function mouseMovement(event) {
      mouseX = event.offsetX;
      mouseY = event.offsetY;
      data.push({
        x: mouseX - canvas.width / 2,
        y: mouseY - canvas.height / 2,
      });

      if (
        (top == true &&
          mouseX >= rightCircleX - middleSize &&
          mouseX <= rightCircleX + middleSize &&
          mouseY >= middleY - middleSize &&
          mouseY <= middleY + middleSize) ||
        (top == false &&
          mouseX >= leftCircleX - middleSize &&
          mouseX <= leftCircleX + middleSize &&
          mouseY >= middleY - middleSize &&
          mouseY <= middleY + middleSize)
      ) {
        canvas.removeEventListener("mousemove", mouseMovement);
        var time = ((new Date().getTime() - startTime) / 1000).toFixed(3);
        resolve({ data: data, time: time });
      }
    }

    setTimeout(async function () {
      canvas.removeEventListener("mousemove", mouseMovement);
      await drawPath(data);
      resolve({
        data: data,
        time: ((new Date().getTime() - startTime) / 1000).toFixed(3),
        completed: completed,
      });
    }, maxTime);
  });
}

// ACCURACY
function calculateAccuracy(data) {
  let errorCount = 0;
  for (const coord of data) {
    let { x, y } = coord;
    x += canvas.width / 2;
    y += canvas.height / 2;
    if (!insideBorder(x, y)) {
      errorCount++;
    }
  }

  const accuracyPercentage = (
    ((data.length - errorCount) / data.length) *
    100
  ).toFixed(2);
  return parseFloat(accuracyPercentage);
}

function displayAccuracy(accuracy, time) {
  const display = document.getElementById("TrainingFeedback");
  const feedback = document.getElementById("feedback");

  return new Promise((resolve) => {
    if (training) {
      time *= 1000;
      if (time < trainingMinTime) {
        feedback.textContent = `Slow down, you took ${time}ms, minimum time is ${trainingMinTime}ms. No score added.`;
      } else if (time > trainingMaxTime) {
        feedback.textContent = `Speed up, maximum time is ${trainingMaxTime}ms. No score added.`;
      } else {
        if (accuracy >= 85) {
          feedback.textContent = `${accuracy}% accuracy, great job!. Rewarded +${trainingReward} score`;
        } else {
          feedback.textContent = `${accuracy}% accuracy, room for improvement! No score added.`;
        }
      }

      display.style.display = "flex";
      setTimeout(() => {
        display.style.display = "none";
        resolve();
      }, 3000);
    }
  });
}

// DATABASE
function writeData(gameData, gameNum) {
  const db = getDatabase();
  const reference = ref(
    db,
    `circles/${localStorage.getItem("userID")}/${gameNum}`,
  );
  set(reference, JSON.stringify(gameData));
  set(reference, JSON.stringify(gameData));
}

// HELPER
function insideBorder(x, y) {
  var distanceToCenter = Math.sqrt((x - borderX) ** 2 + (y - borderY) ** 2);

  if (top == true) {
    return (
      (distanceToCenter <= outerSize &&
        distanceToCenter >= innerSize &&
        y - canvas.height / 2 <= 0) ||
      Math.sqrt((x - leftCircleX) ** 2 + (y - middleY) ** 2) <= middleSize
    );
  } else {
    return (
      (distanceToCenter <= outerSize &&
        distanceToCenter >= innerSize &&
        y - canvas.height / 2 >= 0) ||
      Math.sqrt((x - rightCircleX) ** 2 + (y - middleY) ** 2) <= middleSize
    );
  }
}

function drawPath(data) {
  return new Promise(async (resolve) => {
    for (const coord of data) {
      let { x, y } = coord;
      x += canvas.width / 2;
      y += canvas.height / 2;
      ctx.fillStyle = insideBorder(x, y) ? "white" : "rgb(255, 0, 0)";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    }
    await wait(1500);
    resolve();
  });
}

function getRandomNum(min, max) {
  return Math.random() * (max - min + 1) + min;
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/*
function flashShape(ctx, canvas, shapeType) {
    let minFlashTime = 5000;
    let maxFlashTime = 5000;
    let flashDuration = getRandomNum(minFlashTime, maxFlashTime);

    let minShapeSize = 100
    let maxShapeSize = 100
    let shapeSize = getRandomNum(minShapeSize, maxShapeSize)
    let shapeX = canvas.width/2
    let shapeY = canvas.height/2

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'white';
    ctx.beginPath();

    return new Promise(async resolve => {
        if (shapeType == 'circle') { 
            ctx.arc(shapeX, shapeY, shapeSize, 0, 2*Math.PI); 
        } 
        else if (shapeType == 'rectangle') { 
            ctx.rect(shapeX - shapeSize / 2, shapeY - shapeSize / 2, shapeSize, shapeSize); 
        } 
        else if (shapeType == 'triangle') {
            ctx.moveTo(shapeX, shapeY - shapeSize / 2);
            ctx.lineTo(shapeX - shapeSize / 2, shapeY + shapeSize / 2);
            ctx.lineTo(shapeX + shapeSize / 2, shapeY + shapeSize / 2);
            ctx.closePath();
        }
        else if (shapeType == 'diamond') {
            ctx.moveTo(shapeX, shapeY - shapeSize / 2);
            ctx.lineTo(shapeX + shapeSize / 2, shapeY);
            ctx.lineTo(shapeX, shapeY + shapeSize / 2);
            ctx.lineTo(shapeX - shapeSize / 2, shapeY);
            ctx.closePath();
        }
        else if (shapeType == 'pentagon' || shapeType == 'hexagon' || shapeType == 'heptagon' || shapeType == 'octagon' || shapeType == 'decagon') {
            let numberOfSides = 0;
            if (shapeType == 'pentagon') {
                numberOfSides = 5;
            } 
            else if (shapeType == 'hexagon') {
                numberOfSides = 6;
            } 
            else if (shapeType == 'heptagon') {
                numberOfSides = 7;
            } 
            else if (shapeType == 'octagon') {
                numberOfSides = 8;
            } 
            else if (shapeType == 'decagon') {
                numberOfSides = 10;
            }

            let rotation = 0
            if (numberOfSides == 5) {
                rotation = -Math.PI/(2*numberOfSides)
            }
            else if (numberOfSides == 7) {
                rotation = Math.PI/(2*numberOfSides)
            }
            else if (numberOfSides%4 == 0) {
                rotation = Math.PI/(numberOfSides)
            }
            ctx.moveTo (shapeX + shapeSize * Math.cos(rotation), shapeY + shapeSize *  Math.sin(rotation));          
            for (var i = 1; i <= numberOfSides;i += 1) {
              ctx.lineTo (shapeX + shapeSize * Math.cos(i * 2 * Math.PI / numberOfSides + rotation), shapeY + shapeSize * Math.sin(i * 2 * Math.PI / numberOfSides + rotation));
            }
        } 
        else if(shapeType == 'star') {
            var spikes = 5;
            var rotation = Math.PI/2*3;
            var x = shapeX;
            var y = shapeY;
            var step = Math.PI/spikes;

            ctx.moveTo(shapeX, shapeY - shapeSize)
            for(i = 0; i < spikes; i++) {
              x = shapeX + Math.cos(rotation)*shapeSize;
              y = shapeY + Math.sin(rotation)*shapeSize;
              ctx.lineTo(x, y)
              rotation += step
      
              x = shapeX + Math.cos(rotation)*shapeSize/2;
              y = shapeY + Math.sin(rotation)*shapeSize/2;
              ctx.lineTo(x, y)
              rotation += step
            }
            ctx.lineTo(shapeX, shapeY - shapeSize);
            ctx.closePath();
        }

        ctx.stroke();
        await new Promise(resolve => setTimeout(resolve, flashDuration));
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let shapeData = {x: shapeX, y: shapeY, size: shapeSize, shape: shapeType}
        resolve(shapeData)
    });
}
*/
