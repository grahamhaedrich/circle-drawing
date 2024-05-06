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

let innerSize = 110;
let outerSize = innerSize * 1.3;
const borderX = canvas.width / 2;
const borderY = canvas.height / 2;

const middleSize = (outerSize - innerSize) / 2;
const leftCircleX = canvas.width / 2 - innerSize - (outerSize - innerSize) / 2;
const rightCircleX = canvas.width / 2 + innerSize + (outerSize - innerSize) / 2;
const middleY = canvas.height / 2;

let data = [];
let accuracy = 0;
let score = 0;
let newScore = 0;
let allAccuracies = [];
let completed = false;
let top = true;
let training = false;

const testingRoundPage = document.getElementById("TestingRound")
const testingPageHeading = testingRoundPage.getElementsByTagName('h1')[0];
const testingPageDesc = document.getElementById('TestingRoundDesc').getElementsByTagName('p')[0]; 

const trainingRoundPage = document.getElementById("Training")
const trainingPageHeading = trainingRoundPage.getElementsByTagName('h1')[0];
const trainingPageDesc = document.getElementById('TrainingRoundDesc').getElementsByTagName('p')[0]; 

const gameTimer = document.getElementById("timer")
const gameRound = document.getElementById("round");
const gameScore = document.getElementById("score");
gameTimer.style.display = "none"
gameRound.style.display = "none" 
gameScore.style.display = "none"
let day = new Date().getDay();

let angle = 45 // degrees 
let radAngle = 0
let rotatedLeftX = 0
let rotatedLeftY = 0

let rotatedRightX = 0
let rotatedRightY = 0

// MAIN PAGE
document.addEventListener("DOMContentLoaded", async function () {
  day = 1
  if (day == 1 || day == 5) {
    training = false
  }
  else {
    training = true
  }
  writeData(
    {
      age: localStorage.getItem("age"),
      gender: localStorage.getItem("gender"),
      handedness: localStorage.getItem("handedness"),
      device: localStorage.getItem("device"),
      training: training,
      day: day
    },
    0,
  );

  await startPage();

  if (training) {
    trainingPageHeading.textContent = `Training Day ${day-1}`
    await trainingPage();
    await instructions();
    await trainingGame();
  } else {
    await testingPage();
    await instructions();
    await testingGame();
  }
  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  document.getElementById("gameOverScreen").style.display = "flex";
});

async function startPage() {
  return new Promise(async (resolve) => {
    const Start = document.getElementById("StartPage")
    Start.style.display = "flex";

    const dayBoxElement = document.getElementById('day' + day);
    if (dayBoxElement != null) {
      dayBoxElement.style.backgroundColor = '#b6ffb6';
    }
   
    const button = document.getElementById("startButton");
    button.addEventListener("click", () => {
      Start.style.display = "none";
      resolve();
    });
  });
}

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
let trainingBlocks = 3;
let trainingMovements = 120;
let trainingRestInterval = 30;
let trainingDemoTime = 10 * 1000;
let trainingRestTime = 5 * 60 * 1000;

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
    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    trainingRoundPage.style.display = "flex";

    const button = document.getElementById("beginTraining");

    button.addEventListener("click", () => {
      trainingRoundPage.style.display = "none";
      resolve();
    });
  });
}

async function trainingGame() {
  return new Promise(async (resolve) => {
    let round = 0;
    for (let b = 0; b < trainingBlocks; b++) {
      trainingPageHeading.textContent = `Training Block ${b+1}`
      trainingPageDesc.textContent = `Goal time range: ${trainingMinTime} - ${trainingMaxTime}ms. Goal accuracy: 75%.`
      await trainingPage()
      for (let m = 0; m < trainingMovements; m++) {
        round++;

        gameScore.textContent = `Score: ${score}`;
        gameScore.style.display = "flex";

        gameRound.textContent = `Round: ${round}`;
        gameRound.style.display = "flex";

        gameTimer.textContent = `Time: 0ms`;
        gameTimer.style.display = "flex";

        displayBoundary();
        await beginRound((trainingMinTime + trainingMaxTime)/2);
        data = await beginDraw(trainingMinTime, trainingMaxTime);
        accuracy = calculateAccuracy(data["data"]);
        allAccuracies.push(accuracy);
        await drawPath(data["data"]);

        if (
          data["time"] >= trainingMinTime / 1000 &&
          data["time"] <= trainingMaxTime / 1000 &&
          accuracy >= 75
        ) {
          completed = true;
          score += trainingReward;
        } else {
          completed = false;
        }

        gameScore.textContent = `Score: ${score}`;

        await displayAccuracy(accuracy, data["time"], trainingMinTime, trainingMaxTime);

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
      if (b < trainingBlocks - 1) {
        await trainingBreak();
      }
    }

    gameScore.style.display = "none";
    gameRound.style.display = "none";
    gameTimer.style.display = "none";

    const averageAccuracy =  allAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) /allAccuracies.length;
    resolve();
  });
}

function trainingDemo() {
  return new Promise(async (resolve) => {
    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gameScore.style.display = "none";
    gameRound.style.display = "none";
    goalTimer.style.display = "none";
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
    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    gameScore.style.display = "none";
    gameRound.style.display = "none";
    gameTimer.style.display = "none";
    const Break = document.getElementById("TrainingBreak");
    Break.style.display = "flex";

    const countdownElement = document.getElementById("countdownValue");
    let remainingSeconds = trainingRestTime / 1000;
    countdownElement.textContent = remainingSeconds;

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
const testRanges = [
  { min: 240, max: 420 },
  { min: 400, max: 600 },
  { min: 640, max: 960 },
  { min: 800, max: 1200 },
  { min: 1200, max: 1800 },
];
const testAngles = [0, 15, 30, 60, 90, 180, 195, 210, 240, 270]
const testBlocks = 50
const testBlockTrials = 12

let testRounds = shuffleArray(testRanges).concat(shuffleArray(testRanges))

const testingRestTime = 10 * 1000;
const testingDemoTime = 10 * 1000;
const testingPracticeMovements = 0;
let warmUpMinTime = 0;
let warmUpMaxTime = 1000 * 1000;
let warmUp = true

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

async function practiceRounds(round) {
  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (round == 1) {
    return new Promise(async (resolve) => {
      const page = document.getElementById("TrainingRound1");
      page.style.display = "flex";

      const button = document.getElementById("beginRound1");

      button.addEventListener("click", () => {
        page.style.display = "none";
        resolve();
      });
    });
  } else if (round == 2) {
      return new Promise(async (resolve) => {
        const page = document.getElementById("TrainingRound2");
        page.style.display = "flex";
  
        const button = document.getElementById("beginRound2");

        button.addEventListener("click", () => {
          page.style.display = "none";
          resolve();
        });
      });
  } else if (round == 3) {
      return new Promise(async (resolve) => {
        const page = document.getElementById("TrainingRound3");
        page.style.display = "flex";
  
        const button = document.getElementById("beginRound3");

        button.addEventListener("click", () => {
          page.style.display = "none";
          resolve();
        });
      });
  } else if (round == 4) {
      return new Promise(async (resolve) => {
        const page = document.getElementById("TrainingRound4");
        page.style.display = "flex";
  
        const button = document.getElementById("beginRound4");

        button.addEventListener("click", () => {
          page.style.display = "none";
          resolve();
        });
      });
  }
}

async function testingGame() {
  return new Promise(async (resolve) => {
    gameTimer.textContent = `Time: 0ms`;

    let round = 0;
    for (let m = 0; m < testingPracticeMovements; m++) {
        round++;

        if (round == 1) {
          gameRound.style.display = "none";
          gameScore.style.display = "none";
          gameTimer.style.display = "none";
          warmUpMinTime = 0;
          warmUpMaxTime = 2000;
          await practiceRounds(1)
        } else if (round == 11) {
          gameRound.style.display = "none";
          gameScore.style.display = "none";
          gameTimer.style.display = "none";
          await practiceRounds(2)
          warmUpMinTime = 960 
          warmUpMaxTime = 1440
        } else if (round == 21) {
          gameRound.style.display = "none";
          gameScore.style.display = "none";
          gameTimer.style.display = "none";
          await practiceRounds(3)
          warmUpMinTime = 520
          warmUpMaxTime = 780
        } else if (round == 31) {
          gameRound.style.display = "none";
          gameScore.style.display = "none";
          gameTimer.style.display = "none";
          await practiceRounds(4)
          warmUpMinTime = 360
          warmUpMaxTime = 540
        }

        gameRound.textContent = `Practice Round ${round}`;
        gameScore.textContent = `Score: ${score}`;
        gameRound.style.display = "flex";
        gameScore.style.display = "flex";
        gameTimer.style.display = "flex";

        displayBoundary()
        await beginRound((warmUpMinTime + warmUpMaxTime)/2);
        data = await beginDraw(warmUpMinTime, warmUpMaxTime);
        await drawPath(data["data"]);
        accuracy = calculateAccuracy(data["data"]);
        newScore = Math.round(accuracy/(data['time']*10))
        await displayAccuracy(accuracy, data["time"], warmUpMinTime, warmUpMaxTime);

        top = !top;
    }
    gameRound.style.display = "none";
    gameScore.style.display = "none";
    gameTimer.style.display = "none";
    warmUp = false;
    top = true;
    round = 0
    score = 0

    for (let b = 0; b < testBlocks; b++) {
        testingPageHeading.textContent = `Testing Round ${b+1}`;
        testingPageDesc.textContent = `12 movements, goal time: ${testingRounds[b].min}-${testingRounds[b].max}ms`;
        
        gameRound.style.display = "none";
        gameScore.style.display = "none";
        gameTimer.style.display = "none";
        await testingRoundStart();
        gameRound.style.display = "flex";
        gameScore.style.display = "flex";
        gameTimer.style.display = "flex";

        for (let m = 0; m < testingBlockMovements; m++) {
          round++
          gameRound.textContent = `Round ${round}`;
          gameScore.textContent = `Score: ${score}`;

          displayBoundary();
          await beginRound( (testingRounds[b].min + testingRounds[b].max) / 2);
          data = await beginDraw(testingRounds[b].min, testingRounds[b].max);

          accuracy = calculateAccuracy(data["data"]);
          newScore = Math.round(accuracy/(data['time']*10))
          let dataToStore = {
              interval: testingRounds[b],
              points: data["data"],
              accuracy: accuracy,
              time: data["time"],
              completed: data["completed"],
          };

          await drawPath(data["data"]);
          accuracy = calculateAccuracy(data["data"]);
          await displayAccuracy(accuracy, data["time"], testingRounds[b].min, testingRounds[b].max, score);

          writeData(dataToStore, round);

          top = !top;
        }
    }

    const averageAccuracy = allAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) / allAccuracies.length;
    resolve()
    });
}

function testingRoundStart() {
  return new Promise(async (resolve) => {
    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    testingRoundPage.style.display = "flex";
    
    const button = document.getElementById("beginTestRound")
    button.addEventListener("click", () => {
      testingRoundPage.style.display = "none";
      resolve();
    });
  });
}

// GAME
function displayBoundary() {
  gameTimer.textContent = `Time: 0ms`;
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

  radAngle = angle * (Math.PI / 180);
  rotatedLeftX = borderX + (leftCircleX - borderX) * Math.cos(radAngle)
  rotatedLeftY = borderY + (leftCircleX - borderX) * Math.sin(radAngle)

  rotatedRightX = borderX + (rightCircleX - borderX) * Math.cos(radAngle)
  rotatedRightY = borderY + (rightCircleX - borderX) * Math.sin(radAngle)

  if (top == true) {
    ctx.fillStyle = "rgb(115, 147, 179)";
    ctx.beginPath();
    ctx.arc(rotatedLeftX, rotatedLeftY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(rotatedRightX, rotatedRightY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgb(115, 147, 179)";
    ctx.beginPath();
    ctx.arc(rotatedLeftX, rotatedLeftY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(rotatedRightX, rotatedRightY, middleSize, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();
  }
}

function beginRound(intervalTime) {
  return new Promise(async (resolve) => {
    var roundStart = false
    var isMouseInsideCircle = false;
    var mouseInCircleTime = 0;
    var intervalId;
    
    canvas.addEventListener("mousemove", function (event) {
      var mouseX = event.offsetX;
      var mouseY = event.offsetY;

      if (top == true) {
        if (
          Math.sqrt((mouseX - rotatedLeftX) ** 2 + (mouseY - rotatedLeftY) ** 2) <=
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
          Math.sqrt((mouseX - rotatedRightX) ** 2 + (mouseY - rotatedRightY) ** 2) <=
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

    async function checkTime() {
      var elapsedTime = Date.now() - mouseInCircleTime;
      if (elapsedTime >= 1000 && roundStart == false) {
        roundStart = true
        var sound = document.getElementById("readySound");

        ctx.fillStyle = "rgb(255, 0, 0)"; // red
        ctx.beginPath();
        if (top == true) {
          ctx.arc(rotatedLeftX, rotatedLeftY, middleSize, 0, 2 * Math.PI);
        } else {
          ctx.arc(rotatedRightX, rotatedRightY, middleSize, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();
        sound.play();
        await wait(intervalTime)

        if (!isMouseInsideCircle) {
          roundStart = false
          ctx.fillStyle = "rgb(115, 147, 179)";
          ctx.fill();
          ctx.stroke();
          ctx.beginPath()
          return
        }
        ctx.fillStyle = "rgb(255, 162, 0)"; // orange
        ctx.fill();
        ctx.stroke();
        sound.currentTime = 0
        sound.play();
        await wait(intervalTime)

        if (!isMouseInsideCircle) {
          roundStart = false
          ctx.fillStyle = "rgb(115, 147, 179)";
          ctx.fill();
          ctx.stroke();
          ctx.beginPath()
          return
        }
        ctx.fillStyle = "rgb(255, 255, 102)"; // yellow
        ctx.fill();
        ctx.stroke();
        sound.currentTime = 0
        sound.play();
        await wait(intervalTime)

        if (!isMouseInsideCircle) {
          roundStart = false
          ctx.fillStyle = "rgb(115, 147, 179)";
          ctx.fill();
          ctx.stroke();
          ctx.beginPath()
          return
        }
        canvas.removeEventListener("mousemove", beginRound);

        ctx.fillStyle = "rgb(0, 255, 0)"; // green
        ctx.fill();
        ctx.stroke();
        var sound = document.getElementById("goSound");
        sound.play();
      
        clearInterval(intervalId);
        resolve();
      }
    }
  });
}  

function beginDraw(minTime, maxTime) {
  return new Promise(async (resolve) => {
    var startTime = new Date().getTime();
    var elapsedTime = 0;
    var mouseX = 0;
    var mouseY = 0;
    var data = [];
    var completed = false
    canvas.addEventListener("mousemove", mouseMovement);
  
    async function mouseMovement(event) {
      elapsedTime = new Date().getTime() - startTime;
      gameTimer.textContent = `Time: ${elapsedTime}ms`;
      gameTimer.style.display = "flex";

      mouseX = event.offsetX;
      mouseY = event.offsetY;
      data.push({
        x: mouseX - canvas.width / 2,
        y: mouseY - canvas.height / 2,
      });

      var insideCircle = false;
      if (
        (top == true &&
          mouseX >= rotatedRightX - middleSize &&
          mouseX <= rotatedRightX + middleSize &&
          mouseY >= rotatedRightY - middleSize &&
          mouseY <= rotatedRightY + middleSize) ||
        top == false &&
          mouseX >= rotatedLeftX - middleSize &&
          mouseX <= rotatedLeftX + middleSize &&
          mouseY >= rotatedLeftY - middleSize &&
          mouseY <= rotatedLeftY + middleSize)
        {
        canvas.removeEventListener("mousemove", mouseMovement);
        if (elapsedTime < minTime) {
          var sound = document.getElementById("failSound");
          sound.play();
        } else {
          var sound = document.getElementById("finishSound");
          sound.play();
        }
        completed = true



        ctx.fillStyle = "rgb(0, 255, 0)";
        ctx.beginPath();
        if (top == true) {
          ctx.arc(rotatedLeftX, rotatedLeftY, middleSize, 0, 2 * Math.PI);
        } else {
          ctx.arc(rotatedRightX, rotatedRightY, middleSize, 0, 2 * Math.PI);
        }
        ctx.fill();
        ctx.stroke();

        var time = ((new Date().getTime() - startTime) / 1000).toFixed(3);
        resolve({ data: data, time: time });
      }
    }

    setTimeout(async function () {
      canvas.removeEventListener("mousemove", mouseMovement);
      if (completed == false) {
        gameTimer.textContent = `Time: ${maxTime}ms`;
        var sound = document.getElementById("failSound");
        sound.play();
      }

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

function displayAccuracy(accuracy, time, minTime, maxTime) {
  return new Promise((resolve) => {
    time *= 1000;

    if (training) {
      const display = document.getElementById("TrainingFeedback");
      const feedback = document.getElementById("feedback");
      if (time < minTime) {
        feedback.textContent = `Slow down. No points.`;
      } else if (time > maxTime) {
        feedback.textContent = `Speed up. No points.`;
      } else {
        if (accuracy >= 75) {
          score += newScore
          feedback.textContent = `${Math.round(accuracy)}% accuracy. +${trainingReward} points.`;
        } else {
          feedback.textContent = `${Math.round(accuracy)}% accuracy. No points.`;
        }
      }
      display.style.display = "flex";
      setTimeout(() => {
        display.style.display = "none";
        resolve();
      }, 3000);
    }
    else if (warmUp) {
        const display = document.getElementById("TestingFeedback");
        const feedback = document.getElementById("testingF");
        if (time < warmUpMinTime) {
          feedback.textContent = `Slow down. No points.`;
        } else if (time > warmUpMaxTime) {
          feedback.textContent = `Speed up. No points.`;
        } else {
          if (accuracy >= 80) {
            feedback.textContent = `${Math.round(accuracy)}% accuracy. +${trainingReward} points.`;
          } else {
            feedback.textContent = `${Math.round(accuracy)}% accuracy. No points.`;
          }
        }
        display.style.display = "flex";
        setTimeout(() => {
          display.style.display = "none";
          resolve();
        }, 2000);
    }
    else {
        const display = document.getElementById("TestingFeedback");
        const feedback = document.getElementById("testingF");
        if (time < minTime) {
            feedback.textContent = `Go slower`;
        } else if (time > maxTime) {
            feedback.textContent = `Go faster`;
        } else {
          if (accuracy >= 80) {
            score += newScore
            feedback.textContent = `${Math.round(accuracy)}% accuracy. +${newScore} points.`;
          } else {
            feedback.textContent = `${Math.round(accuracy)}% accuracy. No points.`;
          }
        }
        display.style.display = "flex";
        setTimeout(() => {
          display.style.display = "none";
          resolve();
        }, 1500);
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
      Math.sqrt((x - rotatedLeftX) ** 2 + (y - rotatedLeftY) ** 2) <= middleSize
    );
  } else {
    return (
      (distanceToCenter <= outerSize &&
        distanceToCenter >= innerSize &&
        y - canvas.height / 2 >= 0) ||
      Math.sqrt((x - rotatedRightX) ** 2 + (y - rotatedRightY) ** 2) <= middleSize
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
  const shuffledArray = array.slice();
  for (var i = shuffledArray.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = shuffledArray[i];
    shuffledArray[i] = shuffledArray[j];
    shuffledArray[j] = temp;
  }
  return shuffledArray;
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
