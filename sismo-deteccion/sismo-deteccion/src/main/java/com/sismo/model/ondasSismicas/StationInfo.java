package com.sismo.model.ondasSismicas;

import java.util.Map;

import lombok.Data;

@Data
public class StationInfo {
    private int id;
    private String name;
    private double latitude;
    private double longitude;
    private Map<String, Double> arrivalTimes;
}