package fr.myitworld.ticketing.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class VideoController {


    @GetMapping("/info")
    public String getInformation() {
        return "hello world";
    }



}
