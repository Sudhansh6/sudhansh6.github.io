---
layout: post
title: Image Colorization
comments: true
categories: [Projects, SoC_2021]
excerpt: A project where I try to build a Machine Learning Model that is capable of converting grayscale images to colored ones. 
---
<!-- Special thanks to https://www.codicode.com/art/how_to_draw_on_a_html5_canvas_with_a_mouse.aspx -->

Check out the repository [here](https://github.com/Sudhansh6/ImageColorization)

While working on this project, I have also built digit recognition models. You can test the performance of the models here. *Note.* The model may take above 30 seconds to load as the backend Heroku app needs to boot up. 

Select a model from the list of models. Draw a digit in the canvas, and the predicted value is displayed below.
<div align = center >
	 <label for="models">Choose a Model:</label>	 	
	<select id = "models" name="models" id="models">
	  <option value = "alexnet">AlexNet</option>
	  <!-- <option value = "vgg">VGG</option> -->
	  <option value = "resnet" selected>ResNet</option>
	</select> <br>
    <canvas id="Canvas" width="300" height="300" style = "padding: 0px; border: 2px solid black;"></canvas> <br>
    <button class = subscribeBtn style = "width: 300px;" id = "clear" onclick="javascript:clearArea('Canvas');return false;">Clear Area</button>
	<!-- <img height = 200 width = 200 style = "padding: 0px; border: 2px solid black;" id="frame"> -->
	<div> The predicted value is : <span id = result> --- </span> </div> 
</div>
<style>
#models{
	font-size: 20px;
	margin: 10px 8px 10px 14px;
	padding: 0px 8px 0px 14px;
	border-radius: 20px;
	color:  white;
	background-color: #4CAF50;
}
#result{
	font-size: 50px;
	color: red;
}
</style>
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>

<script>
// =============
// == Globals ==
// =============
const canvas = document.getElementById('Canvas');
const canvasContext = canvas.getContext('2d');
const clearButton = document.getElementById('clear');
const state = {
  mousedown: false
};

// ===================
// == Configuration ==
// ===================
const lineWidth = 20;
const halfLineWidth = lineWidth / 2;
const fillStyle = '#333';
const lineJoin = "round";
const strokeStyle = "red";
const shadowColor = '#333';
const shadowBlur = lineWidth / 4;

// =====================
// == Event Listeners ==
// =====================
canvas.addEventListener('mousedown', handleWritingStart);
canvas.addEventListener('mousemove', handleWritingInProgress);
canvas.addEventListener('mouseup', handleDrawingEnd);
canvas.addEventListener('mouseout', handleDrawingEnd);

canvas.addEventListener('touchstart', handleWritingStart);
canvas.addEventListener('touchmove', handleWritingInProgress);
canvas.addEventListener('touchend', handleDrawingEnd);

clearButton.addEventListener('click', handleClearButtonClick);

// ====================
// == Event Handlers ==
// ====================
function handleWritingStart(event) {
  event.preventDefault();

  const mousePos = getMousePositionOnCanvas(event);

  canvasContext.beginPath();

  canvasContext.moveTo(mousePos.x, mousePos.y);

  canvasContext.lineJoin = lineJoin;
  canvasContext.lineWidth = lineWidth;
  canvasContext.strokeStyle = strokeStyle;
  canvasContext.shadowColor = null;
  canvasContext.shadowBlur = null;

  canvasContext.fill();

  state.mousedown = true;
}

function handleWritingInProgress(event) {
  event.preventDefault();

  if (state.mousedown) {
    const mousePos = getMousePositionOnCanvas(event);

    canvasContext.lineTo(mousePos.x, mousePos.y);
    canvasContext.stroke();
  }
}

function handleDrawingEnd(event) {
  event.preventDefault();
  getPrediction();
  if (state.mousedown) {
    canvasContext.shadowColor = shadowColor;
    canvasContext.shadowBlur = shadowBlur;

    canvasContext.stroke();
  }

  state.mousedown = false;
}

function handleClearButtonClick(event) {
  event.preventDefault();

  clearCanvas();
}

// ======================
// == Helper Functions ==
// ======================
function getMousePositionOnCanvas(event) {
  const clientX = event.clientX || event.touches[0].clientX;
  const clientY = event.clientY || event.touches[0].clientY;
  const rect = event.target.getBoundingClientRect();
  const offsetLeft = rect.left;
  const offsetTop = rect.top;
  const canvasX = clientX - offsetLeft;
  const canvasY = clientY - offsetTop;

  return { x: canvasX, y: canvasY };
}

function clearCanvas() {
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
}
function getPrediction()
	{
		var Pic = document.getElementById("Canvas").toDataURL();
    	var flag = true;
    	Pic = Pic.replace(/^data:image\/(png|jpg);base64,/, "");
		let model = $("#models option:selected").val();
		let url = "https://soc2021.herokuapp.com/CNN";
		// let url = "http://0.0.0.0:5000/CNN";
		// let url = "http://127.0.0.1:5000/CNN";
		console.log("Sent a request to " + url);
		let res = document.getElementById('result');
		if(flag)
			res.innerHTML = '<img width = 50 height = 50 src = "/assets/loading.gif">';
		$.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify({"imageData" : Pic, "model" : model}),
        contentType: 'application/json',
        xhrFields: {
       	withCredentials: true
    	},
        crossDomain: true,
        success: function(result) {
        			flag = false;
        			if(result.result == "")
        			document.getElementById('frame').src = 'data:;base64,' + result['image'];
        			else
        			res.innerHTML = result.result;
                    // document.getElementById('frame').src = 'data:image/jpg;base64,'+ result;
                },
         error: function(error) {
        	console.log("error");
        }
    	})
	}
</script>