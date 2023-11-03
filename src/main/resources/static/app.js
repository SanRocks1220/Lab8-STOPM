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
    var pointsBuffer = [];
    var polygonToDraw = [];

    var addPointToCanvas = function (point) {
        var canvas = document.getElementById("canvas");
        var ctx = canvas.getContext("2d");
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        polygonToDraw.push(point)
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
        currentNumber = number;polygonToDraw
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
                
                console.log("polygonToDraw");
                console.log(polygonToDraw);

                drawPolygon(polygonToDraw);
                polygonToDraw = []
            });
        });
    };

    function drawPolygon(points) {
        let c2 = canvas.getContext('2d');
        c2.fillStyle = '#ffa4a4';
        c2.beginPath();
        c2.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            console.log(points[i]);
            c2.lineTo(points[i].x, points[i].y);
        }
        c2.closePath();
        c2.fill();
    }

    var publishPoint = function (px, py) {
        var pt = new Point(px, py);
        console.info("publishing point at " + pt);
        addPointToCanvas(pt);

        console.log("Este es el buffer")
        console.log(pointsBuffer)
        console.log("este es el codigo bien hecho de polygonToDraw")
        console.log(polygonToDraw)

        pointsBuffer.push(pt);
        if (polygonToDraw.length%7 == 0) {
            stompClient.send("/topic/newpolygon." + currentNumber, {}, JSON.stringify(pointsBuffer));
            pointsBuffer = []
        } else {
            stompClient.send("/topic/newpoint." + currentNumber, {}, JSON.stringify(pt));
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

                
                pointsBuffer = [];

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
