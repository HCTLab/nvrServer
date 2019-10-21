/*
this is a demo script for camera which allow watch the live, get data from camera and set data to it.
the detail of the data as xml format
<Config>
<normalizedScreenSize>  <!--req-->
<normalizedScreenWidth> <!-- req, xs:integer --></normalizedScreenWidth>
<normalizedScreenHeight> <!-- req, xs:integer --></normalizedScreenHeight>
</normalizedScreenSize>
<RegionCoordinatesList>
<RegionCoordinates>  <!-- req, --> 
<positionX>      <!-- req, xs:integer;coordinate -->    </positionX> 
<positionY>      <!-- req, xs:integer;coordinate  -->   </positionY> 
</RegionCoordinates>
</RegionCoordinatesList>
<Test1>    <!-- opt, req, xs:string -->     </Test1>
<Test2>    <!-- opt, req, xs:string -->     </Test2>
<Test3>    <!-- opt, req, xs:string -->     </Test3>
<Test4>    <!-- opt, req, xs:string -->     </Test4>
</Config>
*/
$(function(){
	//custom protocol
	var HTTP = location.protocol + '//';
	//Host Address
	var HOST = location.hostname;
	//custom protocol port
	var PORT = '6789';
	//video Protocol
	var RTSP = 'rtsp://';
	//video path
	var LIVE = '/ISAPI/streaming/channels/101';
	//login session info
	var SESSION = window.parent.getUserSession();
	//user info, security upgrade. it's no safe in stream URL, replace by session type;
	var USERINFO = window.parent.getUserAuth(true);
	//stream auth
	var AUTH = '?auth=' + (SESSION ? SESSION : USERINFO);

	//screen normalized max Length
	var screenMaxWidth = 1000;
	var screenMaxHeight = 1000;
	
	//allow IE cross site
	$.support.cors = true;
	
	//init video, data...
	initLiveView();
	var rectCanvas = RectCanvas("liveviewCanvas");
	rectCanvas.initRectCanvas(352, 288);
	getParam();
	
	//use quicktime plugin
	function initLiveView() {
		try {
			//ie plugin
			new ActiveXObject('QuickTimeCheckObject.QuickTimeCheck.1');
			$('#liveview').html('' 
				+ '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" width="100%" height="100%" codebase="http://www.apple.com/qtactivex/qtplugin.cab">'
					+ '<param name="src" value="index.html"/>'
					+ '<param name="loop" value="false">' 
					+ '<param name="autoplay" value="true">'
					+ '<param name="qtsrc" value="' + RTSP + HOST + LIVE + AUTH + '">' //video path
					+ '<param name="scale" value="tofit">'
					+ '<param name="controller" value="false">'
					+ '<param name="wmode" value="transparent">'				//set this allow transparent shield
				+ '</object>');
		} catch (e) {
			//non ie plugin
			$('#liveview').html(''
				+ '<embed src="index.html" '
				+ 'type="video/quicktime" '
				+ 'width="100%" height="100%" '
				+ 'autoplay="true" '
				+ 'qtsrc="' + RTSP + HOST + LIVE + AUTH + '" '
				+ 'target="myself" scale="tofit" '
				+ 'controller="false" wmode="transparent" '
				+ 'pluginspage="http://www.apple.com/quicktime/download/" '
				+ 'loop="false">');
		}
	}
	
	//get param from device
	function getParam() {
		$.ajax({
			url: HTTP + HOST + ":" + PORT + "/APP/Config?app=openplatformdemo",
			type: "GET",
			async: false,
			success: function (xmlDoc, textStatus, xhr) {
				//text param
				$("#Test1").val($(xmlDoc).find("Test1").text());
				$("#Test2").val($(xmlDoc).find("Test2").text());
				$("#Test3").val($(xmlDoc).find("Test3").text());
				$("#Test4").val($(xmlDoc).find("Test4").text());
				
				//draw data
				var rectPoints = [];
				$(xmlDoc).find("RegionCoordinates").each(function(){
					rectPoints.push({
						x: parseInt($(this).find("positionX").text(), 10),
						y: parseInt($(this).find("positionY").text(), 10)
					})
				});
				
				screenMaxWidth = parseInt($(xmlDoc).find("normalizedScreenWidth").text(), 10);
				screenMinHeight = parseInt($(xmlDoc).find("normalizedScreenHeight").text(), 10);
				
				//draw the rect
				rectCanvas.drawLines(rectCanvas.setRectPoints(rectPoints, screenMaxWidth, screenMinHeight));
			},
			error: function(xhr, text){
				alert(text);
			}
		});
	}
	
	//draw rect on canvas
	function RectCanvas(id) {
		//canvas element
        this.canvasElement = $("#" + id)[0];
        try {
			//browser which support canvas
            this.context2D = this.canvasElement.getContext("2d");
        } catch (e) {
			//for ie8
            G_vmlCanvasManager.init($("#" + id).parent()[0]);
            this.canvasElement = $("#" + id)[0];
            this.context2D = this.canvasElement.getContext("2d");
        }
		//canvas width and height
		this.width = 0;
        this.height = 0;
		
		//line color
		this.lineColor = '#FF0000';
		
		//allow draw
		this.allowDraw = false;
        var that = this;
		
		//points in rect
		var rectPoints = [];
		
		//init canvas width, height and event
		this.initRectCanvas = function(width, height) {
			this.setPanelSize(width, height);
			_clear();
			_bindEvent();
		}

        //draw lines, will clear pre lines first
		this.drawLines = function(aMaps) {
            _clear();
            var iLength = aMaps.length;
            for (var i = 0; i < iLength; i++) {
                _drawLine({x: aMaps[i].start.x, y: aMaps[i].start.y}, {x: aMaps[i].end.x, y: aMaps[i].end.y});
            }
        }

        //set canvas width and height
		this.setPanelSize = function (width, height) {
			that.width = width;
        	that.height = height;
        }
		
		//get points in rect, iNormalized is max size of point
		this.getRectPoints = function(iNormalizedWidth, iNormalizedHeight){
			var len = rectPoints.length;
			var normalizedPoints = [];
			for(var i = 0; i < len; i++) {
				normalizedPoints.push({
					x: Math.ceil(rectPoints[i].x * iNormalizedWidth / that.width),
					y: Math.ceil(rectPoints[i].y * iNormalizedHeight / that.height)
				});
			}
			return normalizedPoints;
		}
		
		//set points to canvas
		this.setRectPoints = function(rect, iNormalizedWidth, iNormalizedHeight){
			var lines = [];
			var len = rect.length;
			for(var i = 0; i < len; i++) {
				lines.push({
					start: {
						x: rect[i].x * that.width / iNormalizedWidth,
						y: rect[i].y * that.height / iNormalizedHeight
					},
					end: {
						x: rect[(i + 1) == len ? 0 : (i + 1)].x * that.width / iNormalizedWidth,
						y: rect[(i + 1) == len ? 0 : (i + 1)].y * that.height / iNormalizedHeight
					}
				});
			}
			return lines;
		}
		
		//clear the rect
		this.clearRect = function(){
			that.context2D.clearRect(0, 0, that.width, that.height);
		}


		//draw line
		function _drawLine(start, end) {
            if (start.x == end.x && start.y == end.y) {
                return;
            }

            //line property
			that.context2D.strokeStyle = that.lineColor;
            that.context2D.lineJoin = "round";
            that.context2D.lineWidth = 1;

            //draw line
            that.context2D.beginPath();
            that.context2D.moveTo(start.x, start.y);
            that.context2D.lineTo(end.x, end.y);
            that.context2D.stroke();
        }
		
		//clear lines
        function _clear() {
            that.context2D.clearRect(0, 0, that.canvasElement.width, that.canvasElement.height);
        }
		
		//bind canvas mouseup and mousedown event
		function _bindEvent() {
			var start = null;
			var isStart = false;
			//mouse start draw
			$(that.canvasElement).on("mousedown", function(event){
				if(that.allowDraw) {
					var tmpX = event.pageX - ($(that.canvasElement).offset()).left;
					var tmpY = event.pageY - ($(that.canvasElement).offset()).top;
					start = {x: tmpX, y: tmpY};
					isStart = true;
				}
			});
			
			$(that.canvasElement).on("mousemove", function(event){
				if(isStart) {
					var tmpX = event.pageX - ($(that.canvasElement).offset()).left;
					var tmpY = event.pageY - ($(that.canvasElement).offset()).top;
					//non ie8 act fast, show the rect immediately
					//if(!G_vmlCanvasManager) {
						that.drawLines(_getRect(tmpX, tmpY));
					//}
				}
			});
			
			//mouse up end draw
			$(that.canvasElement).on("mouseup", function(event){
				if(isStart) {
					var tmpX = event.pageX - ($(that.canvasElement).offset()).left;
					var tmpY = event.pageY - ($(that.canvasElement).offset()).top;
					//ie8 performance bad with VML, need finish draw and show the rect
					if(G_vmlCanvasManager) {
						that.drawLines(_getRect(tmpX, tmpY));
					}
				}
				isStart = false;
				start = null;
			});
			
			//translate draw rect points to line
			function _getRect(x, y){
				rectPoints.length;
				var rect = [
						{x: start.x, y: start.y},
						{x: x, y: start.y},
						{x: x, y: y},
						{x: start.x, y: y}
					];
				rectPoints = rect;
				var lines = [];
				var len = rect.length;
				for(var i = 0; i < len; i++) {
					lines.push({start: rect[i], end: rect[(i + 1) == len ? 0 : (i + 1)]});
				}
				return lines;
			}
		}
		
		return that;
    };
	
	//demo interface for browser window environment
	var demoInterface = {};
	
	//draw button status
	var drawBtnStart = false;
	
	//for draw button
	function draw() {
		$("#drawBtn").val(drawBtnStart ? "Start Draw" : "End Draw");
		drawBtnStart = !drawBtnStart;
		rectCanvas.allowDraw = drawBtnStart;
	}
	
	//for clear button
	function clearRect() {
		rectCanvas.clearRect();
	}
	
	//save param to device
	function setParam() {
		//data as xml format
		var xmlDoc = ''
			+ '<Config>'
			+ '<normalizedScreenSize>'
			+ '<normalizedScreenWidth>' + screenMaxWidth + '</normalizedScreenWidth>'
			+ '<normalizedScreenHeight>' + screenMaxHeight + '</normalizedScreenHeight>'
			+ '</normalizedScreenSize>'
			+ '<RegionCoordinatesList>';
			
		var rectPoints = rectCanvas.getRectPoints(screenMaxWidth, screenMaxHeight);
		var len = rectPoints.length;
		for(var i = 0; i < len; i++) {
			xmlDoc += ''
				+ '<RegionCoordinates>' 
				+ '<positionX>' + rectPoints[i].x + '</positionX>'
				+ '<positionY>' + rectPoints[i].y + '</positionY>'
				+ '</RegionCoordinates>';
		}
		xmlDoc += ''
			+ '</RegionCoordinatesList>'
			+ '<Test1>' + $("#Test1").val() + '</Test1>'
			+ '<Test2>' + $("#Test2").val() + '</Test2>'
			+ '<Test3>' + $("#Test3").val() + '</Test3>'
			+ '<Test4>' + $("#Test4").val() + '</Test4>'
			+ '</Config>';
		$.ajax({
			url: HTTP + HOST + ":" + PORT + "/APP/Config?app=openplatformdemo",
			type: "PUT",
			async: false,
			data: xmlDoc,
			success: function (xmlDoc, textStatus, xhr) {
				alert('save success');
			},
			error: function(){
				alert('failed');
			}
		});
	}
	
	demoInterface.draw = draw;
	demoInterface.clearRect = clearRect;
	demoInterface.setParam = setParam;
	window.demoInterface = demoInterface;
})

