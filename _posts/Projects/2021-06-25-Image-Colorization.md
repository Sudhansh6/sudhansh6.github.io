---
layout: post
title: Image Colorization
comments: true
categories: [Projects, SoC_2021]
excerpt: A project where I try to build a Machine Learning Model that is capable of converting grayscale images to colored ones. 
---
<!-- Special thanks to https://www.codicode.com/art/how_to_draw_on_a_html5_canvas_with_a_mouse.aspx -->

Check out the repository [here](https://github.com/Sudhansh6/Image-Colorization)

You can test the performance of the models here

<div align = center >
	 <label for="models">Choose a Model:</label>	 	
	<select id = "models" name="models" id="models">
	  <!-- <option value = "alexnet">AlexNet</option>
	  <option value = "vgg">VGG</option> -->
	  <option value = "resnet" selected>ResNet</option>
	</select> <br>
    <canvas id="Canvas" width="300" height="300" style = "padding: 0px; border: 2px solid black;"></canvas> <br>
    <button class = subscribeBtn style = "width: 300px;" onclick="javascript:clearArea('Canvas');return false;">Clear Area</button>
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
	InitThis("Canvas");
	var mousePressed = false;
	var ctx;
	
	function InitThis(str) {
		ctx = document.getElementById(str).getContext("2d");
	    model = str;
	    str = "#" + str;

	    $(document).on('touchstart mousedown', str ,function (e) {
	    	 mousePressed = true;
	        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false, model);
	    });
	    $(document).on('touchmove mousemove', str ,function (e){
	        if (mousePressed) {
	            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true, model);
	        }
	    });
	    $(document).on('touchend mouseup', str ,function (e) {
	        mousePressed = false;
	        getPrediction();
	    });
	    $(document).on('touchend mouseleave', str ,function (e) {
	        mousePressed = false;
	    });

	 //    $(str).mousedown(function (e) {
	 //        mousePressed = true;
	 //        Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, false, model);
	 //    });

	 //    $(str).mousemove(function (e) {
	 //        if (mousePressed) {
	 //            Draw(e.pageX - $(this).offset().left, e.pageY - $(this).offset().top, true, model);
	 //        }
	 //    });

	 //    $(str).mouseup(function (e) {
	 //        mousePressed = false;
	 //        getPrediction();
	 //    });
		// $(str).mouseleave(function (e) {
	 //        mousePressed = false;
	 //    });
	}

	function Draw(x, y, isDown, str) {
		
		str = "#" + str;
		lastX = $(str).data('lastX'); lastY = $(str).data('lastY');
	    if (isDown) {
	        ctx.beginPath();
	        ctx.strokeStyle = "red";
	        ctx.lineWidth = 12;
	        ctx.lineJoin = "round";
	        ctx.moveTo(lastX, lastY);
	        ctx.lineTo(x, y);
	        ctx.closePath();
	        ctx.stroke();
	    }
	    $(str).data('lastX', x); $(str).data('lastY', y);
	}
		
	function clearArea(str) {
	    // Use the identity matrix while clearing the canvas
	    ctx.setTransform(1, 0, 0, 1, 0, 0);
	    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
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