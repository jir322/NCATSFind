chrome.contextMenus.create({id:"image",title:"Image to Structure",contexts:["image"]});
chrome.contextMenus.create({id:"image2",title:"Image to Structure",contexts:["page"]});
chrome.contextMenus.create({id:"display",title:"Display structure of %s",contexts:["selection"]});
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
		if(request.type == "capture"){
			captureImage("TOP");
		}
  });
chrome.commands.onCommand.addListener(function(command) {
  if(command == "capture"){
	//alert(JSON.stringify(command));
	captureImage("TOP");
  }
});  
chrome.contextMenus.onClicked.addListener(function(t){
	//alert("b");
	
	var framen = t.frameUrl;
	if(framen == undefined){
		framen=t.pageUrl;
	}
	var sid= t.menuItemId;
	if(sid=="display"){
		var searchText = t.selectionText.replace(/UNII[-]*/g,"");
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
						  chrome.tabs.sendMessage(tabs[0].id, {greeting: "display", structure: searchText, frame: framen }, function(response) {
						    console.log(response.farewell);
						  });
						});
	}
	
	if(sid=="image"){
		//Simple url case:
		if(t.srcUrl.indexOf("data:")!=0){
			displayResolve("http://tripod.nih.gov/imager?type=url&data=" + t.srcUrl);
		}else{
		//deeper
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {greeting: "imgprocess", imgurl: t.srcUrl, frame: framen }, function(response) {
				displayResolveb64(response.base64);
			});
		});
		}
	}
	
	if(sid=="image2"){
		captureImage(framen);
	}
});
function captureImage(framen){
	chrome.tabs.captureVisibleTab(null, function(img) {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				//var rect2 = {x:200,y:50,width:200,height:45};
				chrome.tabs.sendMessage(tabs[0].id, {greeting: "bbox", image: img,frame: framen}, function(response) {
					//alert("got here");
					//alert(JSON.stringify(response));
					chrome.tabs.sendMessage(tabs[0].id, {greeting: "imagetest", image: img ,frame: framen,rect:response.rect}, function(response2) {
						//alert(response2.base64);
						displayResolveb64(response2.base64);
					});
				});
			});
    	});
}
function displayResolve(url2){
							var xhr = new XMLHttpRequest();
                                    xhr.open("GET", url2, true);
                                    xhr.onreadystatechange = function() {
                                      if (xhr.readyState == 4) {
										 chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
											chrome.tabs.sendMessage(tabs[0].id, {greeting: "image", image: xhr.responseText }, function(response) {});
										 });
										 chrome.storage.local.set({'ncgcImage': xhr.responseText}, function (result2) {
												var newURL = "chrome-extension://cabmomgdahhanlfnlpigldhlcbjijifb/ketcher/ketcher.html";
												//chrome.tabs.create({url:newURL});
												chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
													chrome.tabs.sendMessage(tabs[0].id, {greeting: "displayEdit", frame: "TOP" }, function(response) {});
												});
										});
										 
                                        // alert(xhr.responseText);
                                      }
                                    }
                                    xhr.send();
}
function displayResolveb64(b64){
							var params="type=base64&data=" + encodeURIComponent(b64) ;
							//alert("length:" + params.length);
							var xhr = new XMLHttpRequest();
                                    xhr.open("POST", "http://tripod.nih.gov/imager", true);
									xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
									xhr.setRequestHeader("Content-length", params.length);
									xhr.setRequestHeader("Connection", "close");
									xhr.onreadystatechange = function() {
                                      if (xhr.readyState == 4) {
											//console.log(xhr.responseText);
											//alert(xhr.responseText);
											chrome.storage.local.set({'ncgcImage': xhr.responseText}, function (result2) {
												var newURL = "chrome-extension://cabmomgdahhanlfnlpigldhlcbjijifb/ketcher/ketcher.html";
												//chrome.tabs.create({url:newURL});
												chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
													chrome.tabs.sendMessage(tabs[0].id, {greeting: "displayEdit", frame: "TOP" }, function(response) {});
												});
											});
                                      }
                                    }
									xhr.send(params);
                                    
                                    //xhr.send();
}