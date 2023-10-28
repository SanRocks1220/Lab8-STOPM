package edu.eci.arsw.collabpaint.messaging;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class PointsExchangeController {
    @MessageMapping("/points")
    @SendTo("/topic/newpoint")
    public PointsExchange exchange(PointsMessage message) throws Exception {
        // Thread.sleep(1000); // simulated delay
        return new PointsExchange(message.getPoint());
    }
}
