---
layout: page
permalink: /misc/
title: Random
---
<html>
<head>
  <script> document.addEventListener('DOMContentLoaded',()=>{
	var c = document.getElementById("myCanvas");
	var n = 30,t = 10, flag;
	var myVar = setInterval(drawShape, 5); 
	function drawShape()
	{
	  var ctx = c.getContext("2d");
	  ctx.clearRect(0, 0, c.width, c.height);
	  ctx.beginPath();
	  for(var k =1; k<=n; k++)
	  {
	  	flag = 1;
	  	var i = Math.floor(t/10);
	  	if( i < 360)
	  	{
			ctx.moveTo(100+50*Math.cos(k*i*Math.PI/180),100+50*Math.sin(k*i*Math.PI/180));		
			ctx.arc(100+50*Math.cos(k*i*Math.PI/180),100+50*Math.sin(k*i*Math.PI/180),4,0,2*Math.PI);

			ctx.moveTo(200-50*Math.cos(k*i*Math.PI/180),100-50*Math.sin(k*i*Math.PI/180));
			ctx.arc(200-50*Math.cos(k*i*Math.PI/180),100-50*Math.sin(k*i*Math.PI/180),4,0,2*Math.PI);
	  		flag = 0;
	  	}
	  }
	  t+=1;
	  
	ctx.fillStyle = "#"+(t/4).toString(16)+(t/4).toString(16)+"ffff";
	ctx.fill();
	ctx.stroke();
	  if(t > 720)
	  {
	  	if(flag)
		  {
		  	t = 0;
		  }
	  	//clearTimeout(myVar);
	    //t=0;
	  }
	}
	
	});</script>
</head>
<body>
<div style="margin: auto;">
	<canvas id="myCanvas" height=200px style="padding-left: 0;
    padding-right: 0;
    margin-left: auto;
    margin-right: auto;
    display: block;"></canvas>
</div>

</body>
</html>

I converted RGB images into colored text [here](https://pixels-to-text.herokuapp.com/)  

Are you hungry? Order totally authentic food from [Cravings!](https://sudhansh.pythonanywhere.com/)  

# Useful Websites

I'm adding a list of useful websites that can be used for handy computations. Thanks to [Amit](https://amitrajaraman.github.io/) for many of these.

- [Differentiation of matrices](http://www.matrixcalculus.org/)
- [Merge PDFs](https://www.adobe.com/in/acrobat/online/merge-pdf.html#:~:text=Click%20the%20Select%20files%20button,Click%20Merge%20files.)
- [Remove Background from images](https://www.remove.bg/)
- [Image Color Picker](https://imagecolorpicker.com/)
- [Other png tool](https://onlinepngtools.com/)
- [LateX symbol decoder](https://detexify.kirelabs.org/classify.html)
- [Website word counter](https://wordcounter.net/website-word-count)
- [Numerical Analysis Simulators](https://atozmath.com/CONM/RungeKutta.aspx?q=meuler&m=1&q1=1%2b(x-y)%5e2%602%601%603%600.25%60meuler%600&dp=4&do=1#PrevPart)
- [Papers we love](https://github.com/papers-we-love/papers-we-love)
- [Algorithms for Decision Making](https://algorithmsbook.com/)
- [Machine Learning Concepts in depth](https://www.d2l.ai/)
- [Matrix Cookbook](https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf)
- [The best Geometric Processing Library](https://github.com/micycle1/PGS)

# Fun Websites
- [Oatmeal Comics](https://theoatmeal.com/comics/)
