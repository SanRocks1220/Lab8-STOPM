package edu.eci.arsw.collabpaint.messaging;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import edu.eci.arsw.collabpaint.model.Point;
import java.awt.Polygon;

@Controller
public class PolygonMessage {
    @Autowired
    SimpMessagingTemplate smt;
    
    private static Map<String, List<Point>> pointsMap = new ConcurrentHashMap<>();

    @MessageMapping("/app/newpoint.{numdibujo}")
    public void handleNewPoint(Point pt, @DestinationVariable String numdibujo) throws Exception {
        System.out.println("Nuevo punto recibido en el servidor!:" + pt);
        List<Point> points = pointsMap.computeIfAbsent(numdibujo, k -> new ArrayList<>());
        points.add(pt);

        if (points.size() >= 3) {
            Polygon polygon = createPolygonFromPoints(points);
            smt.convertAndSend("/topic/newpolygon." + numdibujo, polygon);
        }

    }

    private Polygon createPolygonFromPoints(List<Point> points) {

        int[] xPoints = new int[points.size()];
        int[] yPoints = new int[points.size()];

        for (int i = 0; i < points.size(); i++) {
            xPoints[i] = points.get(i).getX();
            yPoints[i] = points.get(i).getY();
        }

        return new Polygon(xPoints, yPoints, points.size());
    }

}
