package edu.eci.arsw.collabpaint.messaging;

import edu.eci.arsw.collabpaint.model.Point;

public class PointsMessage {
    private Point location;

    public PointsMessage(){
    }

    public PointsMessage(Point location){
        this.location = location;
    }

    public Point getPoint(){
        return this.location;
    }

    public void setPoint(Point newLoc){
        this.location = newLoc;
    }
}
