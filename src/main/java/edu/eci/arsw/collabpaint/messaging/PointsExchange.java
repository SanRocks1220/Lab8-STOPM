package edu.eci.arsw.collabpaint.messaging;

import edu.eci.arsw.collabpaint.model.Point;

public class PointsExchange {
    private Point content;

    public PointsExchange() {
    }

    public PointsExchange(Point content) {
        this.content = content;
    }

    public Point getContent() {
        return content;
    }
}
