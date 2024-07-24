// WEBSITE
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  child,
  update
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
const canvas = document.getElementById("mainCanvas");
const mouseCanvas = document.getElementById("mouseCanvas")
const perfectPathCanvas = document.getElementById("pathCanvas")

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
mouseCanvas.width = window.innerWidth;
mouseCanvas.height = window.innerHeight;
perfectPathCanvas.width = window.innerWidth;
perfectPathCanvas.height = window.innerHeight;

const ctx = canvas.getContext("2d");
const mouseCtx = mouseCanvas.getContext("2d");
const perfectPathCtx = perfectPathCanvas.getContext("2d")

ctx.lineWidth = 1;
ctx.strokeStyle = "black";

let innerSize = 110;
let outerSize = innerSize * 1.7;

const borderX = canvas.width / 2;
const borderY = canvas.height / 2;

const startSize = (outerSize - innerSize) / 6;
const targetHeight = 200;
const targetWidth = 20
const leftCircleX = canvas.width / 2 - innerSize - (outerSize - innerSize) / 2;

let data = [];
let accuracy = 0;
let timingAccuracy = 0;
let blockAccuracy = 0;
let allAccuracies = [];
let completed = false;
let training = false;
let experimentDay = 0;
let clickedDayNumber = 0
let timerColor = '#66FF99'

const testingRoundPage = document.getElementById("TestingRound")
const testingPageHeading = testingRoundPage.getElementsByTagName('h1')[0];
const testingPageDesc = document.getElementById('TestingRoundDesc').getElementsByTagName('p')[0]; 

const trainingRoundPage = document.getElementById("Training")
const trainingPageHeading = trainingRoundPage.getElementsByTagName('h1')[0];
const trainingPageDesc = document.getElementById('TrainingRoundDesc').getElementsByTagName('p')[0]; 

const gameTimer = document.getElementById("timer")
const gameRound = document.getElementById("round");
const goalTime = document.getElementById("goalTime");

gameTimer.style.display = "none"
gameRound.style.display = "none" 
goalTime.style.display = "none"

let angle = 0 // degrees 
let radAngle = 0
let rotatedLeftX = 0
let rotatedLeftY = 0

let rotatedRightX = 0
let rotatedRightY = 0

let gameOver = false

const updateTimerAndRoundPosition = () => {
  const borderY = window.innerHeight / 2;
  gameTimer.style.top = `${borderY - targetHeight * 1.5}px`;
  goalTime.style.top = `${borderY - targetHeight * 1.8}px`;
  gameRound.style.top = `${borderY - targetHeight * 2.1}px`;
};

updateTimerAndRoundPosition();
window.addEventListener('resize', updateTimerAndRoundPosition);
window.addEventListener('zoom', updateTimerAndRoundPosition);

// MAIN PAGE
document.addEventListener("DOMContentLoaded", async function () {
  const dbRef = ref(getDatabase());
  let today = new Date().getDay();
  let endRound = false;

  await get(child(dbRef, `users/${localStorage.getItem("userID")}/experimentData/day${experimentDay}/experimentDay`)).then((snapshot) => {
    if (snapshot.exists()) { 
      experimentDay = snapshot.val()
    } else {
      experimentDay = 1
      writeData(
        {
          experimentDay: experimentDay
        },
        `experimentData/day${experimentDay}`
      )
    }
  });

  await get(child(dbRef, `users/${localStorage.getItem("userID")}/experimentData/day${experimentDay}/actualDay`)).then((snapshot) => {
    if(snapshot.exists())
      if(snapshot.val() != today) {
        experimentDay += 1
        writeData(
          {
            experimentDay: experimentDay
          },
          `experimentData/day${experimentDay}`
        )
      }
  });

  writeData(
    {
      actualDay: today,
    },
    `experimentData/day${experimentDay}`
  )

  /*await get(child(dbRef, `users/${localStorage.getItem("userID")}/completed/day`)).then((snapshot) => {
    if(snapshot.exists()) {
      if(snapshot.val() == experimentDay) {
        endPage();
        endRound = true
      }
      if (snapshot.val() == 5) {
        experimentComplete();
        endRound = true
      }
    }
  });*/

  if (endRound) {
    return
  }
  /* commented out for Prolific experiment
  var dayBoxes = document.querySelectorAll('.day-box');
  var suggestedDay = 'day' + experimentDay;
  var warningMessage = document.getElementById('warningMessage');

  dayBoxes.forEach(function(box) {
    box.addEventListener('click', function() {
      dayBoxes.forEach(function(b) {
        b.classList.remove('clickDay');
      });

      this.classList.add('clickDay');
            
      clickedDayNumber = parseInt(this.id.replace('day', ''));

      if (this.id !== suggestedDay) {
        warningMessage.innerText = `Warning: Day ${clickedDayNumber} selected but you are on Day ${experimentDay}`;
        warningMessage.style.display = 'block';
      } else {
        warningMessage.style.display = 'none';
      }
    });
  });
  
  document.getElementById("EndPage").style.display = "none"
  document.getElementById("ExperimentComplete").style.display = "none"

  await startPage();

  if (clickedDayNumber == 1 || clickedDayNumber == 5) {
    training = false
  } else {
    training = true
  }
 */

  clickedDayNumber = 1
  training = false

  let loggedIn = localStorage.getItem("loggedIn")
  if (loggedIn == false || loggedIn == "false") {
    // await calibrateMouse();
    writeData(
      {
        age: localStorage.getItem("age"),
        gender: localStorage.getItem("gender"),
        handedness: localStorage.getItem("handedness"),
        device: localStorage.getItem("device"),
        calibration: parseFloat(scaleFactor.toFixed(3)),
      },
      "userData"
    );
  } else {
    // await get(child(dbRef, `users/${localStorage.getItem("loginID")}/userData/calibration`)).then((snapshot) => {
    //  scaleFactor = snapshot.val()
    // });
  }

  writeData(
    {
      selectedDay: clickedDayNumber,
      training: training,
    },
    `experimentData/day${experimentDay}`
  )

  await instructions();
  if (training) {
    trainingPageHeading.textContent = `Training Day ${clickedDayNumber-1}`
    await trainingPage();
    await trainingGame();
  } else {
    await testingPage();
    await testingGame();
  }

  gameOver = true
  document.exitPointerLock()
  document.removeEventListener("mousemove", drawMouse, false);
  mouseCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
  gameRound.style.display = "none";
  gameTimer.style.display = "none";
  goalTime.style.display = "none";

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.getElementById("GameOver").style.display = "flex";
  const feedbackInput = document.getElementById('feedbackInput');
  const feedbackSubmitted = document.getElementById('feedbackSubmitted');

  feedbackInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        writeData({
            feedback: feedbackInput.value.trim(),
        }, 'feedback');
        feedbackInput.value = '';
        feedbackSubmitted.textContent = 'Feedback submitted, thank you!';
    }
});
});

async function startPage() {
  return new Promise(async (resolve) => {
    const Start = document.getElementById("StartPage")
    Start.style.display = "flex";

    const dayBoxElement = document.getElementById('day' + experimentDay);
    if (dayBoxElement != null) {
      dayBoxElement.style.backgroundColor = '#b6ffb6';
    }

    function handleEnterPress(event) {
      if (event.key === "Enter") {
        if (clickedDayNumber == 0) {
          document.getElementById('warningMessage').innerText = `No day selected`;
        } else {
          Start.style.display = "none";
          resolve();
        }
      }
    }

    document.addEventListener("keydown", handleEnterPress);
  });
}

async function instructions() {
  return new Promise(async (resolve) => {
    const Instructions = document.getElementById("MovementInstructions");
    Instructions.style.display = "flex";

    function handleEnterPress(event) {
      if (event.key === "Enter") {
        document.removeEventListener("keydown", handleEnterPress);
        Instructions.style.display = "none";
        resolve();
      }
    }

    document.addEventListener("keydown", handleEnterPress);
  });
}

// MOUSE CALIBRATION
canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock ||
                            canvas.webkitRequestPointerLock;

document.exitPointerLock = document.exitPointerLock ||
                           document.mozExitPointerLock ||
                           document.webkitExitPointerLock;
                                          
async function lockPointer() {
  return new Promise((resolve) => {
    const clickHandler = async () => {
      await canvas.requestPointerLock({unadjustedMovement: true});
      resolve();
      document.removeEventListener("click", clickHandler);
    };

    setTimeout(() => {
      document.addEventListener("click", clickHandler);
    }, 5000);
  });
}

async function lockChange() {
  if(document.pointerLockElement === canvas ||
     document.mozPointerLockElement === canvas ||
     document.webkitPointerLockElement === canvas) {
      // pointer locked
      document.getElementById('MouseOverlay').style.display = 'none'
      document.addEventListener("mousemove", drawMouse, false);
    } else {
      // pointer unlocked
      if (gameOver == false) {
        document.getElementById('MouseOverlay').style.display = 'flex';
        document.removeEventListener("mousemove", drawMouse, false);
        mouseCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);
        await lockPointer();
      }
    }
}

function requestLock() {
  canvas.requestPointerLock({unadjustedMovement: true});
  document.addEventListener('pointerlockchange', lockChange, false);
  document.addEventListener('mozpointerlockchange', lockChange, false);
  document.addEventListener('webkitpointerlockchange', lockChange, false);
}

var actualX, actualY
document.addEventListener('mousemove', function(e){
  actualX = e.screenX
  actualY = e.screenY;
}, false);

let mouseX = mouseCanvas.width/2;
let mouseY = mouseCanvas.height/2;
let prevMouseX = mouseCanvas.width/2;
let prevMouseY = mouseCanvas.height/2;
let animation;
let scaleFactor = 2.4
function drawMouse(e) {
  if (e) {
    prevMouseX = mouseX;
    prevMouseY = mouseY;
    mouseX += e.movementX*scaleFactor;
    mouseY += e.movementY*scaleFactor;
  }

  mouseX = Math.max(0, Math.min(mouseX, mouseCanvas.width));
  mouseY = Math.max(0, Math.min(mouseY, mouseCanvas.height));

  mouseCtx.clearRect(0, 0, mouseCanvas.width, mouseCanvas.height);

  if (!animation) {
    animation = requestAnimationFrame(function () {
      animation = null;

      mouseCtx.fillStyle = 'white';
      mouseCtx.strokeStyle = 'black';
      mouseCtx.lineWidth = 2;

      mouseCtx.beginPath();
      mouseCtx.arc(mouseX, mouseY, 5, 0, 2 * Math.PI, true);
      mouseCtx.fill();
      mouseCtx.stroke();
    });
  }
}

let cardLength = 2.125 // inches
let circleDiaIn = 0.6 // distance the user has to move
let circleDiaPx = (innerSize + outerSize) // px
function calcScaleFactor() {
  function median(numbers) {
    numbers.sort((a, b) => a - b);
    const mid = Math.floor(numbers.length / 2);
    if (numbers.length % 2 === 0) {
        return (numbers[mid - 1] + numbers[mid]) / 2;
    } else {
        return numbers[mid];
    }
  }

  let pxTraveled = median(movements)
  let pxPerInch = pxTraveled/cardLength
  let desiredPxPerInch = circleDiaPx/circleDiaIn
  scaleFactor = desiredPxPerInch/pxPerInch * 1/2
}

var movements = []
async function calibrateMouse() {
  return new Promise(async (resolve) => {
    requestLock()

    const page = document.getElementById("CalibrationProcess");
    page.style.display = "flex";

    const warning = document.getElementById("movementWarningMessage")
    warning.style.display = "none";

    const movement1 = document.getElementById("movement1")
    const movement2 = document.getElementById("movement2")
    const movement3 = document.getElementById("movement3")
    const movement4 = document.getElementById("movement4")
    const movement5 = document.getElementById("movement5")

    const button = document.getElementById("calibrationProcessButton");
    button.disabled = true
    button.style.backgroundColor = "#fabdbd";
    button.style.color = "black"
    const message = document.getElementById("movementMessage")

    let maxDeltaX = 200
    let maxDeltaY = 40
    let numMovements = 5
    let startX, startY, endX, endY, deltaX, deltaY
    let inMovement = false, redo = false

    function keyPress(e) {
      if (e.key.toLowerCase() == "r" && button.disabled == true) {
        movements = []
        inMovement = false

        movement1.innerText = "Movement 1: No Data"
        movement2.innerText = "Movement 2: No Data"
        movement3.innerText = "Movement 3: No Data"
        movement4.innerText = "Movement 4: No Data"
        movement5.innerText = "Movement 5: No Data"
        movement1.style.backgroundColor = "#fabdbd"
        movement2.style.backgroundColor = "#fabdbd"
        movement3.style.backgroundColor = "#fabdbd"
        movement4.style.backgroundColor = "#fabdbd"
        movement5.style.backgroundColor = "#fabdbd"
        message.style.display = "none"
        button.innerText = 'Complete Calibration Procedure'
        redo = false
      } else if (e.key.toLowerCase() == "s" && inMovement == false && redo == false && button.disabled == true) {
        inMovement = true
        message.innerText = `Movement Started`
        message.style.borderColor = "blue"
        message.style.display = "flex"
        startX = mouseX;
        startY = mouseY;
      } else if (e.key.toLowerCase() == "e" && inMovement == true && redo == false && button.disabled == true) {
        inMovement = false
        endX = mouseX;
        endY = mouseY;
        deltaX = Math.abs(startX - endX)
        deltaY = Math.abs(startY - endY)
        let mov = movements.length + 1
        if (deltaY > maxDeltaY) {
          message.innerText = `Movement ${mov} Failed: Movement was not horizontal. Please try again.`
          message.style.borderColor = "red"
        } else if (deltaX < 50) {
          message.innerText = `Movement ${mov} Failed: Movement was too short. Please increase sensitivity and try again.`
          message.style.borderColor = "red"
        } else {
          movements.push(deltaX)
          let box = document.getElementById(`movement${mov}`)
          box.innerText = `Movement ${mov}: ${deltaX} pixels`
          box.style.backgroundColor = '#b6ffb6'

          if (movements.length == numMovements) {
            let err = Math.max(...movements) - Math.min(...movements)
            if (err > maxDeltaX) {
              redo = true
              message.innerText = `Movements have too much difference (max accepted is ${maxDeltaX}px, you have ${err}px). Please click 'r' to redo.`
              movement1.style.backgroundColor = "#fabdbd"
              movement2.style.backgroundColor = "#fabdbd"
              movement3.style.backgroundColor = "#fabdbd"
              movement4.style.backgroundColor = "#fabdbd"
              movement5.style.backgroundColor = "#fabdbd"
              button.style.backgroundColor = "#fabdbd"
              message.style.borderColor = "red"
              button.innerText = 'Press "r" to Restart Calibration'
            }
            else {
              message.innerText = 'All Movements Complete. Please Click "Enter" to Continue.'
              message.style.borderColor = "green"
              button.style.backgroundColor = '#b6ffb6'
              button.innerText = 'Press "Enter" to Continue'
              button.disabled = false
            }  
          } else {
            message.innerText = `Movement ${mov} Complete.`
            message.style.borderColor = "green"
          }
        }
      } else if (e.key == "Enter" && button.disabled == false) {
        document.removeEventListener("keydown", keyPress)
        page.style.display = "none";
        calcScaleFactor();
        resolve();
      }
    }

    document.addEventListener("keydown", keyPress)
  });
}

// TRAINING
let trainingBlocks = 4;
let trainingMovements = 50;
let trainingDemoTime = 10 * 1000;
let trainingRestTime = 2 * 60 * 1000;

// slow group
//let trainingMinTime = 960;
//let trainingMaxTime = 1440;
//let trainingReward = 3;

// medium group
let trainingMinTime = 520
let trainingMaxTime = 780
let trainingReward = 4

// fast group
//let trainingMinTime = 360
//let trainingMaxTime = 540
//let trainingReward = 5

async function trainingPage() {
  return new Promise(async (resolve) => {

    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    trainingRoundPage.style.display = "flex";

    function handleEnterPress(event) {
      if (event.key === "Enter") {
        document.removeEventListener("keydown", handleEnterPress);
        trainingRoundPage.style.display = "none";
        resolve();
      }
    }
    
    document.addEventListener("keydown", handleEnterPress);
  });
}

async function trainingGame() {
  return new Promise(async (resolve) => {
    let round = 0;
    let totalRounds = 0;
    blockAccuracy = 0;
    let blockMovements = 0;
    angle = 180
    for (let b = 0; b < trainingBlocks; b++) {
      trainingPageHeading.textContent = `Training Block ${b+1}`

      if (b == 0) {
        trainingPageDesc.textContent = `Goal time range: ${trainingMinTime} - ${trainingMaxTime} ms. Goal accuracy: 75%.`
      } else if (blockMovements == 0) {
        trainingPageDesc.innerHTML = `Your average accuracy in the previous block was 0%<br>Now, Block ${b+1}: goal time range of ${trainingMinTime} - ${trainingMaxTime} ms, goal accuracy of 75%`
      } else {
        trainingPageDesc.innerHTML = `Your average accuracy in the previous block was ${Math.round(blockAccuracy/(blockMovements))}%<br>Now, Block ${b+1}: goal time range of ${trainingMinTime} - ${trainingMaxTime} ms, goal accuracy of 75%`
      }
      blockAccuracy = 0
      await trainingPage()
      for (let m = 0; m < trainingMovements; m++) {
        if (angle == 0) {
          angle = 180
        } else {
          angle = 0
        }
        round++;
        totalRounds++;

        gameRound.textContent = `Movements Remaining: ${trainingMovements * trainingBlocks + 1 - round}`;
        gameRound.style.display = "flex";

        goalTime.textContent = `Your Goal Time: ${trainingMinTime} - ${trainingMaxTime} ms`
        goalTime.style.color = 'white'
        goalTime.style.display = "flex"
        gameTimer.textContent = `Your Movement Time: 0 ms`;
        gameTimer.style.color = 'white'
        gameTimer.style.display = "flex";
        
        displayBoundary();
        await beginRound((trainingMinTime + trainingMaxTime)/2);
        data = await beginDraw(trainingMinTime, trainingMaxTime);
        accuracy = calculateAccuracy(data["data"]);
        allAccuracies.push(accuracy);
        await drawPath(data["data"]);

        if (data["data"].length > 0) {
          blockAccuracy += accuracy
          blockMovements++
        } else {
          blockAccuracy += 0
        }
        
        if (
          data["time"] >= trainingMinTime / 1000 &&
          data["time"] <= trainingMaxTime / 1000 &&
          accuracy >= 75
        ) {
          completed = true;
        } else {
          completed = false;
        }

        await displayAccuracy(data["data"], data["time"], trainingMinTime, trainingMaxTime);

        if (accuracy != NaN) {
          writeData(
            {
              points: data["data"],
              movementAccuracy: accuracy,
              timingAccuracy: timingAccuracy,
              time: parseFloat(data["time"]),
              completed: completed,
            },
            `experimentData/day${experimentDay}/training/round${totalRounds}`,
          );
        }
        /*
        if (round % trainingRestInterval == 0) {
          await trainingDemo();
        }*/
      }
      round = 0
      await trainingBreak();
    }

    gameRound.style.display = "none";
    gameTimer.style.display = "none";
    goalTime.style.display = "none";

    const averageAccuracy =  allAccuracies.reduce((sum, accuracy) => sum + accuracy, 0) /allAccuracies.length;
    resolve();
  });
}

function trainingDemo() {
  return new Promise(async (resolve) => {
    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    gameRound.style.display = "none";
    goalTime.style.display = "none";
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
    gameRound.style.display = "none";
    gameTimer.style.display = "none";
    goalTime.style.display = "none";

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
// extra round for the fastest condition
const testTimes_1 = [
  { min: 240, max: 420 },
  { min: 240, max: 420 },
  { min: 400, max: 600 },
  { min: 640, max: 960 },
  { min: 800, max: 1200 },
  //{ min: 1200, max: 1800 },
];

//extra round for the second fastest condition
const testTimes_2 = [
  { min: 240, max: 420 },
  { min: 400, max: 600 },
  { min: 400, max: 600 },
  { min: 640, max: 960 },
  { min: 800, max: 1200 },
]


const angles = [0, 90, 180, 270]
const numTimeIntervals = 20 // 20
const numTrials = 16 // 16

let testTimeIntervals = shuffleArray(testTimes_1).concat(shuffleArray(testTimes_2)).concat(shuffleArray(testTimes_1)).concat(shuffleArray(testTimes_2))
let shuffledAngles = []

const testingRestTime = 10 * 1000;
const testingDemoTime = 10 * 1000;
const testingPracticeRounds = 32 // 32
let warmUpMinTime = 0;
let warmUpMaxTime = 1000 * 1000;
let warmUp = true

async function testingPage() {
  return new Promise(async (resolve) => {
    const Testing = document.getElementById("Testing");
    Testing.style.display = "flex";

    function handleEnterPress(event) {
      if (event.key === "Enter") {
        document.removeEventListener("keydown", handleEnterPress);
        Testing.style.display = "none";
        resolve();
      }
    }

    document.addEventListener("keydown", handleEnterPress);
  });
}

async function practiceRounds(round) {
  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  function handleTrainingRound(pageId) {
    return new Promise((resolve) => {
      const page = document.getElementById(pageId);
      page.style.display = "flex";

      function handleEnterPress(event) {
        if (event.key === "Enter") {
          document.removeEventListener("keydown", handleEnterPress);
          page.style.display = "none";
          resolve();
        }
      }

      document.addEventListener("keydown", handleEnterPress);
    });
  }

  switch (round) {
    case 1:
      return handleTrainingRound("TrainingRound1");
    case 2:
      return handleTrainingRound("TrainingRound2");
    case 3:
      return handleTrainingRound("TrainingRound3");
    case 4:
      return handleTrainingRound("TrainingRound4");
  }
}

async function testingGame() {
  return new Promise(async (resolve) => {
    let round = 0;
    angle = 90
    blockAccuracy = 0
    let shuffledAngles = []
    shuffledAngles = shuffleArray(shuffleArray(angles)).concat(shuffleArray(angles)).concat(shuffleArray(angles)).concat(shuffleArray(angles)).concat(shuffleArray(angles)).concat(shuffleArray(angles)).concat(shuffleArray(angles)).concat(shuffleArray(angles))

    for (let m = 0; m < testingPracticeRounds; m++) {
        round++;
        angle = shuffledAngles[m]
        perfectPathCtx.clearRect(0, 0, canvas.width, canvas.height);
 
        if (round == 1) {
          gameRound.style.display = "none";
          gameTimer.style.display = "none";
          goalTime.style.display = "none";
          warmUpMinTime = 800; //800
          warmUpMaxTime = 1200; //1200
          await practiceRounds(1)
        } else if (round == 9) { 
          gameRound.style.display = "none";
          gameTimer.style.display = "none";
          goalTime.style.display = "none";
          await practiceRounds(2)
          warmUpMinTime = 640 
          warmUpMaxTime = 960
        } else if (round == 17) {
          gameRound.style.display = "none";
          gameTimer.style.display = "none";
          goalTime.style.display = "none";
          await practiceRounds(3)
          warmUpMinTime = 400
          warmUpMaxTime = 600
        } else if (round == 25) {
          gameRound.style.display = "none";
          gameTimer.style.display = "none";
          goalTime.style.display = "none";
          await practiceRounds(4)
          warmUpMinTime = 240
          warmUpMaxTime = 400
        }

        goalTime.textContent = `Your Goal Time: ${warmUpMinTime} - ${warmUpMaxTime} ms`
        gameTimer.textContent = `Your Movement Time: 0 ms`;
        gameTimer.style.color = 'white'
        goalTime.style.color = 'white'

        gameRound.textContent = `Movements Remaining: ${testingPracticeRounds + 1 - round}`;
        
        gameRound.style.display = "flex";
        gameTimer.style.display = "flex";
        goalTime.style.display = "flex";

        displayBoundary()
        await beginRound((warmUpMinTime + warmUpMaxTime)/2);
        data = await beginDraw(warmUpMinTime, warmUpMaxTime);
        await drawPath(data["data"]);
        accuracy = calculateAccuracy(data["data"]);
        
        if (accuracy >= 0 && data["completed"] == true) {
          blockAccuracy += accuracy
        } else {
          blockAccuracy += 0
        }

        await displayAccuracy(data["data"], data["time"], warmUpMinTime, warmUpMaxTime);
        
        let dataToStore = {
          interval: {min: warmUpMinTime, max: warmUpMaxTime},
          points: data["data"],
          movementAccuracy: accuracy,
          timingAccuracy: timingAccuracy,
          angle: angle,
          time: parseFloat(data["time"]),
          completed: data["completed"],
        };

        if (data['data'].length == 0) {
          dataToStore['movementAccuracy'] = 0
        }
        
        accuracy = calculateAccuracy(data["data"]);
        writeData(dataToStore, `experimentData/day${experimentDay}/warmUp/round${round}`);
    }

    gameRound.style.display = "none";
    gameTimer.style.display = "none";
    goalTime.style.display = "none";
    warmUp = false;
    round = 0
    let totalRounds = 0
    let angleRound = 0
    angle = 0
    blockAccuracy = 0
    let blockMovements = 0
    totalRounds = numTrials*numTimeIntervals + 1

    for (let t = 0; t < numTimeIntervals; t++) {
      round++
      perfectPathCtx.clearRect(0, 0, canvas.width, canvas.height);
      testingPageHeading.textContent = `Testing Round ${round}`;

      if (round == 1) {
        testingPageDesc.innerHTML = `16 movements, goal time: ${testTimeIntervals[t].min} - ${testTimeIntervals[t].max}ms<br><b class="reminder">Prioritize moving at the right speed!</b>`;
      } else if (blockMovements == 0) {
        testingPageDesc.innerHTML = `Your average accuracy in the previous block was 0%<br>Next block: 16 movements, goal time of ${testTimeIntervals[t].min} - ${testTimeIntervals[t].max} ms<br><b class="reminder">Prioritize moving at the right speed!</b>`;
      } else {
        testingPageDesc.innerHTML = `Your average accuracy in the previous block was ${Math.round(blockAccuracy/(blockMovements))}%<br>Next block: 16 movements, goal time of ${testTimeIntervals[t].min} - ${testTimeIntervals[t].max} ms<br><b class="reminder">Prioritize moving at the right speed!</b>`;
      }

      gameRound.style.display = "none";
      gameTimer.style.display = "none";
      goalTime.style.display = "none";
      await testingRoundStart();
      gameRound.style.display = "flex";
      gameTimer.style.display = "flex";
      goalTime.style.display = "flex";
      blockAccuracy = 0
      blockMovements = 0

      for (let n = 0; n < numTrials; n++) {
        if (n%4 == 0) {
          shuffledAngles = shuffleArray(angles)
        }

        angleRound++
        totalRounds--
       
        angle = shuffledAngles[n%4]

        gameRound.textContent = `Movements Remaining: ${totalRounds}`;

        goalTime.textContent = `Your Goal Time:  ${testTimeIntervals[t].min} - ${testTimeIntervals[t].max} ms`
        gameTimer.textContent = `Your Movement Time: 0 ms`;
        goalTime.style.color = 'white'
        gameTimer.style.color = 'white'
        
        displayBoundary();
        await beginRound( (testTimeIntervals[t].min + testTimeIntervals[t].max) / 2);
        data = await beginDraw(testTimeIntervals[t].min, testTimeIntervals[t].max);

        accuracy = calculateAccuracy(data["data"]);

        if (data["completed"] == true) {
          blockAccuracy += accuracy
          blockMovements++
        } else {
          blockAccuracy += 0
        }
          
        let dataToStore = {
            interval: testTimeIntervals[t],
            points: data["data"],
            movementAccuracy: accuracy,
            timingAccuracy: timingAccuracy,
            angle: angle,
            time: parseFloat(data["time"]),
            completed: data["completed"],
        };

        if (data['data'].length == 0) {
          dataToStore['movementAccuracy'] = 0
        }

        if (data["completed"] == true && (dataToStore.time*1000) >= testTimeIntervals[t].min && (dataToStore.time*1000) <= testTimeIntervals[t].max) {
          await drawPath(data["data"]);
        }
        
        accuracy = calculateAccuracy(data["data"]);
        await displayAccuracy(data["data"], data["time"], testTimeIntervals[t].min, testTimeIntervals[t].max);

        writeData(dataToStore, `experimentData/day${experimentDay}/testing/round${angleRound}`);
      }
    }
  resolve()
  });
}

function testingRoundStart() {
  return new Promise(async (resolve) => {
    ctx.fillStyle = "rgb(211, 211, 211)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    testingRoundPage.style.display = "flex";
    
    function handleEnterPress(event) {
      if (event.key === "Enter") {
        document.removeEventListener("keydown", handleEnterPress);
        testingRoundPage.style.display = "none";
        resolve();
      }
    }

    document.addEventListener("keydown", handleEnterPress);
  });
}

// GAME
function lineToAngle(ctx, x1, y1, length, ang) {
  var angle = (ang - 90) * Math.PI / 180;
  var x2 = x1 + length * Math.cos(angle),
      y2 = y1 + length * Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fill();

  return {
    x: x2,
    y: y2
  };
}

function displayBoundary() {
  perfectPathCtx.clearRect(0, 0, canvas.width, canvas.height);

  document.documentElement.style.setProperty('--borderX', `${borderX}px`);
  document.documentElement.style.setProperty('--borderY', `${borderY}px`);
  document.documentElement.style.setProperty('--outerSize', `${outerSize}px`);  
  document.documentElement.style.setProperty('--diameter', `${outerSize-innerSize}px`); 

  ctx.setLineDash([]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";

  ctx.fillStyle = "rgb(211, 211, 211)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  radAngle = angle * (Math.PI / 180);
  rotatedLeftX = borderX + (leftCircleX - borderX) * Math.cos(radAngle)
  rotatedLeftY = borderY + (leftCircleX - borderX) * Math.sin(radAngle)

  let radAngleRight = radAngle + Math.PI;
  rotatedRightX = borderX + (leftCircleX - borderX) * Math.cos(radAngleRight)
  rotatedRightY = borderY + (leftCircleX - borderX) * Math.sin(radAngleRight)

  // display start circle
  ctx.fillStyle = "rgb(115, 147, 179)";
  ctx.beginPath();
  ctx.arc(rotatedLeftX, rotatedLeftY, startSize, 0, 2 * Math.PI);
  ctx.fill();
  ctx.stroke();

  // display end target
  const colors = ['#ff4545', '#ffa535', '#ffe233', '#b8dd28', '#58e32c', '#b8dd28', '#ffe233', '#ffa535', '#ff4545'];
  const numRings = colors.length;
  const ringHeight = targetHeight / numRings;

  ctx.save();
  ctx.translate(rotatedRightX, rotatedRightY);
  ctx.rotate(angle*Math.PI/180+Math.PI/2);
  for (let i = 0; i < numRings; i++) {
    ctx.fillStyle = colors[i];
    ctx.fillRect(-targetWidth / 2, -targetHeight / 2 + ringHeight * i, targetWidth, ringHeight);
    ctx.strokeRect(-targetWidth / 2, -targetHeight / 2 + ringHeight * i, targetWidth, ringHeight);
  }
  ctx.restore();

  ctx.setLineDash([3, 6]);
  ctx.strokeStyle = "black";
  ctx.lineWidth = 3;    
  ctx.beginPath();
  ctx.arc(borderX, borderY, (innerSize + outerSize)/2, radAngle + Math.PI, radAngle + Math.PI*2);
  ctx.stroke();

  ctx.setLineDash([]);
  lineToAngle(ctx, rotatedRightX, rotatedRightY, 12, angle - 45);
  lineToAngle(ctx, rotatedRightX, rotatedRightY, 12, angle + 45);
  
  ctx.setLineDash([]);
  ctx.lineWidth = 1;
  ctx.strokeStyle = "black";
}

function beginRound(intervalTime) {
  return new Promise(async (resolve) => {
    requestLock()
    var roundStart = false
    var isMouseInsideCircle = false;
    var mouseInCircleTime = 0;
    var intervalId;
    
    canvas.addEventListener("mousemove", function (event) {
      if (
        Math.sqrt((mouseX - rotatedLeftX) ** 2 + (mouseY - rotatedLeftY) ** 2) <=
        startSize
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
    });

    async function checkTime() {
      var elapsedTime = Date.now() - mouseInCircleTime;
      if (elapsedTime >= 1000 && roundStart == false) {
        roundStart = true
        var sound = document.getElementById("readySound");

        ctx.fillStyle = "rgb(255, 0, 0)"; // red
        ctx.beginPath();
        ctx.arc(rotatedLeftX, rotatedLeftY, startSize, 0, 2 * Math.PI);
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

function isMouseOnTarget(mouseX, mouseY) {
  function lineIntersect(a, b, c, d, p, q, r, s) {
    var det, gamma, lambda;
    det = (c - a) * (s - q) - (r - p) * (d - b);
    if (det === 0) {
      return false;
    } else {
      lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
      gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
      return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
    }
  };
    
  let [targetStartX, targetStartY, targetEndX, targetEndY] = [0, 0, 0, 0]
  let [targetStartX_Opposite, targetStartY_Opposite, targetEndX_Opposite, targetEndY_Opposite] = [0, 0, 0, 0]

  if (angle == 0 || angle == 180) {
    targetStartX = rotatedRightX - targetHeight/2
    targetStartY = rotatedRightY - targetWidth/2
    targetEndX = rotatedRightX + targetHeight/2
    targetEndY = rotatedRightY + targetWidth/2
    targetStartX_Opposite = rotatedRightX + targetHeight/2
    targetStartY_Opposite = rotatedRightY + targetWidth/2
    targetEndX_Opposite = rotatedRightX - targetHeight/2
    targetEndY_Opposite = rotatedRightY - targetWidth/2
  } else if (angle == 90 || angle == 270) {
    targetStartX = rotatedRightX - targetWidth/2
    targetStartY = rotatedRightY - targetHeight/2
    targetEndX = rotatedRightX + targetWidth/2
    targetEndY = rotatedRightY + targetHeight/2
    targetStartX_Opposite = rotatedRightX + targetWidth/2
    targetStartY_Opposite = rotatedRightY + targetHeight/2
    targetEndX_Opposite = rotatedRightX - targetWidth/2
    targetEndY_Opposite = rotatedRightY - targetHeight/2
  }

  return (mouseX >= targetStartX &&
          mouseX <= targetEndX &&
          mouseY >= targetStartY &&
          mouseY <= targetEndY
          ) || lineIntersect(prevMouseX, prevMouseY, mouseX, mouseY, targetStartX, targetStartY, targetEndX, targetEndY)
            || lineIntersect(prevMouseX, prevMouseY, mouseX, mouseY, targetStartX_Opposite, targetStartY_Opposite, targetEndX_Opposite, targetEndY_Opposite)
}

function beginDraw(minTime, maxTime) {
  return new Promise(async (resolve) => {
    var startTime = new Date().getTime();
    var elapsedTime = 0;
    var data = [];
    var completed = false;
    let time = 0
    let meanTime = (minTime + maxTime)/2
    let soundPlayed = false
    let roundOver = false
    let finalAnimation = false;
    let lastX = 0
    let lastY = 0

    async function gameRound() {
      elapsedTime = new Date().getTime() - startTime;
      gameTimer.style.display = "flex";

      if (elapsedTime > maxTime || elapsedTime < minTime) {
        gameTimer.innerHTML = `Your Movement Time: <span style="color: red"> &nbsp${elapsedTime} ms</span>`;
      } else {
        gameTimer.innerHTML = `Your Movement Time: <span style="color:${timerColor}"> &nbsp${elapsedTime} ms</span>`;
      }

      // draw perfect path
      let progress = elapsedTime / meanTime;
      let currentAngle = radAngle + Math.PI + progress * Math.PI;
      const perfectX = borderX + ((innerSize + outerSize) / 2) * Math.cos(currentAngle);
      const perfectY = borderY + ((innerSize + outerSize) / 2) * Math.sin(currentAngle);
      
      if(progress <= 1) {
        perfectPathCtx.lineWidth = 2;
        perfectPathCtx.clearRect(0, 0, canvas.width, canvas.height);
        perfectPathCtx.beginPath();
        perfectPathCtx.arc(perfectX, perfectY, 5, 0, 2 * Math.PI);
        perfectPathCtx.fillStyle = "lightgreen";
        perfectPathCtx.fill();
        perfectPathCtx.strokeStyle = "black";
        perfectPathCtx.stroke();

        perfectPathCtx.strokeStyle = "lightgreen";
        perfectPathCtx.lineWidth = 5;    
        perfectPathCtx.beginPath();
        perfectPathCtx.arc(borderX, borderY, (innerSize + outerSize)/2, radAngle + Math.PI, Math.max(radAngle + Math.PI, currentAngle - 2.2*Math.PI/180));
        perfectPathCtx.stroke();
        lastX = perfectX
        lastY = perfectY
      } else if (finalAnimation == false) {
        perfectPathCtx.lineWidth = 5;
        lineToAngle(perfectPathCtx, rotatedRightX, rotatedRightY, 12, angle - 45);
        lineToAngle(perfectPathCtx, rotatedRightX, rotatedRightY, 12, angle + 45);

        perfectPathCtx.lineWidth = 2;
        perfectPathCtx.beginPath();
        perfectPathCtx.arc(lastX, lastY, 5, 0, 2 * Math.PI);
        perfectPathCtx.fillStyle = "lightgreen";
        perfectPathCtx.fill();
        perfectPathCtx.strokeStyle = "black";
        perfectPathCtx.stroke();
        finalAnimation = true
      }

      if (elapsedTime >= meanTime && soundPlayed == false) {
        var sound = document.getElementById("meanSound");
        sound.play();
        soundPlayed = true
      }

      data.push({
        x: mouseX - canvas.width / 2,
        y: canvas.height / 2 - mouseY, //mouseY is 0 at the top of the screen
        t: elapsedTime
      });
    
      if ( isMouseOnTarget(mouseX, mouseY) )
        {
          roundOver = true

          if (elapsedTime > maxTime || elapsedTime < minTime) {
            completed = false
          } else {
            completed = true
          }
          
          ctx.save();
          ctx.translate(rotatedRightX, rotatedRightY);
          ctx.rotate(angle*Math.PI/180+Math.PI/2);
          ctx.strokeStyle = "rgb(0, 255, 0)";
          ctx.strokeRect(-targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
          ctx.restore();
  
          time = ((new Date().getTime() - startTime) / 1000).toFixed(3);

          if (soundPlayed == false) {
            await wait(meanTime - elapsedTime)
            var sound = document.getElementById("meanSound");
            sound.play();
          }
          resolve({
            data: data,
            time: time,
            completed: completed,
          });
      } else if (roundOver == false) {
        setTimeout(gameRound, 10);
      }
    }

    gameRound();
  });
}

// ACCURACY
function calculateAccuracy(data) {
  let totalAccuracy = 0
  for (const coord of data) {
    let { x, y } = coord;
    x += canvas.width / 2;
    y += canvas.height / 2 - 2*y;
    totalAccuracy += dotAccuracy(x, y)
  }
  
  const accuracyPercentage = (totalAccuracy/data.length).toFixed(2);
  return parseFloat(accuracyPercentage);
}

function lineStraightness(points) {
  const startPoint = points[0];
  const endPoint = points[points.length - 1];

  const dx = endPoint[0] - startPoint[0];
  const dy = endPoint[1] - startPoint[1];
  const lengthSquared = dx * dx + dy * dy;

  let sumOfSquaredDistances = 0;
  points.forEach(point => {
      const px = point[0];
      const py = point[1];
      const t = ((px - startPoint[0]) * dx + (py - startPoint[1]) * dy) / lengthSquared;
      const closestPointOnLine = {
          x: startPoint[0] + t * dx,
          y: startPoint[1] + t * dy
      };
      const distance = Math.sqrt((px - closestPointOnLine.x) ** 2 + (py - closestPointOnLine.y) ** 2);
      sumOfSquaredDistances += distance ** 2;
  });

  return Math.sqrt(sumOfSquaredDistances / points.length);
}

function displayAccuracy(data, time, minTime, maxTime) {
  return new Promise((resolve) => {
    time *= 1000;
    let mean = (minTime + maxTime)/2
    timingAccuracy = 50 * (1 + (1 - (3 * Math.abs(time - mean) / (maxTime - minTime))));

    const points = data.map(point => [point.x, point.y]);
    const straightness = lineStraightness(points)
    const minStraightness = 25

    if (training) {
      const display = document.getElementById("TrainingFeedback");
      const feedback = document.getElementById("feedback");
      if (straightness <= minStraightness) {
        feedback.textContent = `Straight line detected, please follow the curved path! 5s timeout penalty`;
        display.style.display = "flex";
        setTimeout(() => {
          display.style.display = "none";
          resolve();
        }, 5000);
      }
      else if (time < minTime) {
        feedback.textContent = `Move Slower! 3s timeout penalty`;
        display.style.display = "flex";
        setTimeout(() => {
          display.style.display = "none";
          resolve();
        }, 3000);
      } else if (time > maxTime) {
        feedback.textContent = `Move Faster! 3s timeout penalty`;
        display.style.display = "flex";
        setTimeout(() => {
          display.style.display = "none";
          resolve();
        }, 3000);
      } else {
        resolve();
      }
      /*else {
        feedback.innerHTML = `Accuracy: ${Math.round(accuracy)}%`;
      } */
    }
    else if (warmUp) {
        const display = document.getElementById("TestingFeedback");
        const feedback = document.getElementById("testingF");
        if (straightness <= minStraightness) {
          feedback.textContent = `Straight line detected, please follow the curved path! 5s timeout penalty`;
          display.style.display = "flex";
          setTimeout(() => {
            display.style.display = "none";
            resolve();
          }, 5000);
        }
        else if (time < warmUpMinTime) {
          feedback.textContent = `Move Slower! 3s timeout penalty`;
          display.style.display = "flex";
          setTimeout(() => {
            display.style.display = "none";
            resolve();
          }, 3000);
        } else if (time > warmUpMaxTime) {
          feedback.textContent = `Move Faster! 3s timeout penalty`;
          display.style.display = "flex";
          setTimeout(() => {
            display.style.display = "none";
            resolve();
          }, 3000);
        } else {
          resolve();
        }
        /*else {
          feedback.innerHTML = `Accuracy: ${Math.round(accuracy)}%`;
        }*/
    }
    else {
        const display = document.getElementById("TestingFeedback");
        const feedback = document.getElementById("testingF");
        if (straightness <= minStraightness) {
          feedback.textContent = `Straight line detected, please follow the curved path! 5s timeout penalty`;
          display.style.display = "flex";
          setTimeout(() => {
            display.style.display = "none";
            resolve();
          }, 5000);
        }
        else if (time < minTime) {
            feedback.textContent = `Move Slower! 3s timeout penalty`;
            display.style.display = "flex";
            setTimeout(() => {
              display.style.display = "none";
              resolve();
            }, 3000);
        } else if (time > maxTime) {
            feedback.textContent = `Move Faster! 3s timeout penalty`;
            display.style.display = "flex";
            setTimeout(() => {
              display.style.display = "none";
              resolve();
            }, 3000);
        } else {
          resolve();
        }
        /*else {
          feedback.innerHTML = `Accuracy: ${Math.round(accuraFcy)}%`;
        }*/
    }
  });
}

// DATABASE
function writeData(gameData, header) {
  const db = getDatabase();
  const reference = ref(
    db,
    `users/${localStorage.getItem("userID")}/${header}`
  );
  update(reference, gameData).catch( () => {
    console.error("error sending data");
  });
}

// HELPER
function dotAccuracy(x, y) {
  const dx = x - borderX;
  const dy = y - borderY;
  const distToCenter = Math.sqrt(dx**2 + dy**2);
  const radius = (innerSize + outerSize)/2
  
  let dotAngle = Math.atan2(dy, dx) + Math.PI;
  let radAngleStart = angle * (Math.PI / 180);
  let radAngleEnd = radAngle + Math.PI;
  if (radAngleEnd > 2*Math.PI && dotAngle >= 0 && dotAngle <= 1/2*Math.PI) {
    dotAngle += 2*Math.PI
  }
  
  // we consider a 1px difference as an error of 3%
  if (dotAngle >= radAngleStart && dotAngle <= radAngleEnd) {
      return Math.max(100 - Math.abs(radius - distToCenter)*3, 0);
  } else {
    let distanceToStart = Math.sqrt( (x - rotatedLeftX)**2 + (y - rotatedLeftY)**2 )
    let distanceToEnd = Math.sqrt( (x - rotatedRightX)**2 + (y - rotatedRightY)**2 );
    return Math.max(100 - distanceToStart, 100 - distanceToEnd, 0);
  }
}

const colorScale = chroma.scale(['#58e32c', '#b8dd28', '#ffe233', '#ffa535', '#ff4545']).domain([100, 0]);
function drawPath(data) {
  return new Promise(async (resolve) => {
    for (const coord of data) {
      let { x, y } = coord;
      x += canvas.width / 2;
      y += canvas.height / 2 - 2*y;

      perfectPathCtx.strokeStyle = "black";
      perfectPathCtx.lineWidth = 1;   
      perfectPathCtx.fillStyle = colorScale(dotAccuracy(x, y)).hex();
      perfectPathCtx.beginPath();
      perfectPathCtx.arc(x, y, 3, 0, 2 * Math.PI);
      perfectPathCtx.fill();
      perfectPathCtx.stroke();
    }
    await wait(1000);
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
            var 
            shapeX;
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
