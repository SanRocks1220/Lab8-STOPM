var app = (function () {
    class Point {
      constructor(x, y) {
        this.x = x;
        this.y = y;
      }
    }
  
    var stompClient = null;
    var theMessage = null;
    var currentNumber = null;
  
    var addPointToCanvas = function (point) {
      var canvas = document.getElementById("canvas");
      var ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.stroke();
    };
  
    function captureClickEvent() {
      var canvas = document.getElementById("canvas");
  
      canvas.addEventListener("click", function (event) {
        if (canvas.getAttribute("data-selected-canvas") === "true") {
          var x = event.clientX - canvas.getBoundingClientRect().left;
          var y = event.clientY - canvas.getBoundingClientRect().top;
          publishPoint(x, y);
        }
      });
    }
  
    var getMousePosition = function (evt) {
      canvas = document.getElementById("canvas");
      var rect = canvas.getBoundingClientRect();
      return {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top,
      };
    };
  
    // Conectar y suscribirse a los canales de WebSocket
    var connectAndSubscribe = function (number) {
      currentNumber = number;
      console.info("Connecting to WS...");
      var socket = new SockJS("/stompendpoint");
      stompClient = Stomp.over(socket);
      
      stompClient.connect({}, function (frame) {
        console.log("Connected: " + frame);
  
        // Suscribirse a /topic/newpoint
        stompClient.subscribe("/topic/newpoint." + number, function (eventbody) {
          theMessage = JSON.parse(eventbody.body);
          addPointToCanvas(theMessage);
        });
  
        // Suscribirse a /topic/newpolygon
        stompClient.subscribe("/topic/newpolygon." + number, function (eventbody) {
          theMessage = JSON.parse(eventbody.body);
          console.log("Poligono Recibido");
          drawPolygon(context, theMessage);
        });
      });
    };
  
    function drawPolygon(ctx, points) {
      // Lógica para dibujar el polígono
      // ...
  
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
  
      for (var i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
  
      ctx.lineTo(points[0].x, points[0].y);
  
      ctx.closePath();
      ctx.fillStyle = "blue";
      ctx.fill();
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  
    var pointsBuffer = [];
  
    var publishPoint = function (px, py) {
      var pt = new Point(px, py);
      console.info("publishing point at " + pt);
      addPointToCanvas(pt);
  
      pointsBuffer.push(pt);
      if (pointsBuffer.length >= 3) {
        stompClient.send("/app/newpolygon." + currentNumber, {}, JSON.stringify(pointsBuffer));
      } else {
        stompClient.send("/app/newpoint." + currentNumber, {}, JSON.stringify(pt));
      }
    };
  
    return {
      init: function () {
        var can = document.getElementById("canvas");
  
        document.getElementById("Send point").addEventListener("click", function () {
          x = document.getElementById("x").value;
          y = document.getElementById("y").value;
          publishPoint(x, y);
        });
  
        document.getElementById("Conectarse").addEventListener("click", function () {
          number = document.getElementById("number").value;
          var canvas = document.getElementById("canvas");
          var contexto = canvas.getContext("2d");
          contexto.clearRect(0, 0, canvas.width, canvas.height);
          connectAndSubscribe(number);
        });
  
        canvas.setAttribute("data-selected-canvas", "false");
        canvas.addEventListener("click", function () {
          canvas.setAttribute("data-selected-canvas", "true");
        });
        captureClickEvent();
      },
      disconnect: function () {
        if (stompClient !== null) {
          stompClient.disconnect();
        }
        setConnected(false);
        console.log("Disconnected");
      },
    };
  })();
  