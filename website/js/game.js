var maxCircles = 5;
var circle_num = 0;
const userID = Math.floor(getRandomNum(0, 100000));

function getRandomNum(min, max) {
    return Math.random()*(max-min+1) + min;
}

function flashCircle(ctx, canvas) {
    return new Promise(async resolve => {
        let minFlashTime = 1000;
        let maxFlashTime = 1000;
        let flashDuration = getRandomNum(minFlashTime, maxFlashTime);
        
        let minCircleSize = 10;
        let maxCircleSize = 150;
        let circleSize = Math.round(getRandomNum(minCircleSize, maxCircleSize));
        
        let circleX = canvas.width/2;
        let circleY = canvas.height/2;
        
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(circleX, circleY, circleSize, 0, 2*Math.PI);
        ctx.stroke();
        await new Promise(resolve => setTimeout(resolve, flashDuration));

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let circleData = [ { x: circleX, y: circleY, r: circleSize }];
        resolve(circleData)
    });
}

function drawCircle(ctx, canvas) {
    return new Promise(resolve => {
        let circleData = []
        function startDrawing(event) {
            const mouseX = event.clientX - canvas.getBoundingClientRect().left;
            const mouseY = event.clientY - canvas.getBoundingClientRect().top;

            ctx.beginPath();
            ctx.moveTo(mouseX, mouseY);

            canvas.addEventListener('mousemove', drawLine);
            canvas.addEventListener('mouseup', stopDrawing);
        }

        function drawLine(event) {
            const mouseX = event.clientX - canvas.getBoundingClientRect().left;
            const mouseY = event.clientY - canvas.getBoundingClientRect().top;

            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            circleData.push({ x: mouseX, y: mouseY })
        }

        function stopDrawing() {
            canvas.removeEventListener('mousemove', drawLine);
            canvas.removeEventListener('mousedown', startDrawing)
            canvas.removeEventListener('mouseup', drawCircle);
            resolve(circleData);
        }

        canvas.addEventListener('mousedown', startDrawing);
    });
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.7.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDB-h4RQa4PCTy5ZcaIfO2kq-ujH48VueA",
    authDomain: "circle-drawing-a78f9.firebaseapp.com",
    projectId: "circle-drawing-a78f9",
    storageBucket: "circle-drawing-a78f9.appspot.com",
    messagingSenderId: "740528213712",
    appId: "1:740528213712:web:1fdd1f0137196e00abd8d5",
    measurementId: "G-ER236S69LP",
    databaseURL: "https://circle-drawing-a78f9-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);

function writeCircleData(type, circleName, data) {
    const db = getDatabase();
    const reference = ref(db, `circles/${userID}/${type}/${circleName}`) 
    set(reference, JSON.stringify(data));
}

async function game() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    
    while (maxCircles > circle_num){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        circle_num++;
        let flashedCircleData = await flashCircle(ctx, canvas);
        let drawnCircleData = await drawCircle(ctx, canvas);  
        writeCircleData('generated', circle_num, flashedCircleData)
        writeCircleData('drawn', circle_num, drawnCircleData)
    }
    document.getElementById('gameOverScreen').style.display = 'flex';
}

document.addEventListener("DOMContentLoaded", function() {
    game();
});