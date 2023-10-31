var app = (function () {

    class Point{
        constructor(x,y){
            this.x=x;
            this.y=y;
        }        
    }
    
    var stompClient = null;
    var theMessage = null;

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
                publishPoint(x,y);
            }
        });
    }

    var getMousePosition = function (evt) {
        canvas = document.getElementById("canvas");
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    };


    var connectAndSubscribe = function () {
        console.info('Connecting to WS...');
        var socket = new SockJS('/stompendpoint');
        stompClient = Stomp.over(socket);
        let x = null;
        let y = null;
        
        //subscribe to /topic/newpoint when connections succeed
        stompClient.connect({}, function (frame) {
            console.log('Connected: ' + frame);
            stompClient.subscribe('/topic/newpoint', function (eventbody) {
                // alert('Suscribed sucessfully: ' + eventbody.body);
                theMessage=JSON.parse(eventbody.body); // Variable global
                console.log("Antes");
                addPointToCanvas(theMessage);
                console.log("Despues");
            });
        });
    };

    var publishPoint = function(px,py){
        var pt=new Point(px,py);
        console.info("publishing point at "+pt);
        addPointToCanvas(pt);
        //publicar el evento
        stompClient.send("/topic/newpoint", {}, JSON.stringify(pt));
    };
    
    return {

        init: function () {
            var can = document.getElementById("canvas");

            document.getElementById("Send point").addEventListener("click", function () {
                x = document.getElementById("x").value;
                y = document.getElementById("y").value;
                publishPoint(x,y);
            });

            canvas.setAttribute("data-selected-canvas", "false");
            canvas.addEventListener("click", function () {
                canvas.setAttribute("data-selected-canvas", "true");
            });
            captureClickEvent();
            //websocket connection
            connectAndSubscribe();
        },
        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }
    };

})();