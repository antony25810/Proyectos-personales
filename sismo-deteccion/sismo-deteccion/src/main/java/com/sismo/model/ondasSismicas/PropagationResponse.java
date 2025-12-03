package com.sismo.model.ondasSismicas;

import java.util.List;

import com.sismo.model.*;

import lombok.Data;

@Data
public class PropagationResponse {
    private Sismo sismo;
    private List<WavePropagation> timeSteps;
}
