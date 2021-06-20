---
layout: page
title: Contact
permalink: /contact/
---
<head>
<style>
	.section{
		text-align: center;
	}
	.input{
	  width: 80%;
	  padding: 12px 20px;
	  margin: 8px 0;
	  display: inline-block;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  box-sizing: border-box;
	  font-size: 18px;
	  background-color: #fff3ff;
	}
</style>
</head>
<body>
<form action="https://formspree.io/xyynbvap" class = form method="POST">
	<div class = section>
		<label> Name </label><br>
		<input class = input type="text" name="name" required>
	</div>
	<div class = section>
		<label>Email</label><br>
		<input class = input type="text" name="_replyto" required>
	</div>
	<div class = section>
		<label>Message</label><br>
		<textarea class = input name="message" required></textarea>
	</div>
	<div class = section>
	  	<button class = subscribeBtn type="submit">Send</button>
	</div>
</form>
</body>
