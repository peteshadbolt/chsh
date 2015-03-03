var time = undefined;

function myUpdate(){
    if (time==0){
        $("#laserbeam").hide();
        $("#alice_photon").hide();
        $("#bob_photon").hide();

        var origin = {"left":"200px", "top":"190px"};
         $("#alice_photon").css(origin);
         $("#bob_photon").css(origin);
    }
    if (time==1){$("#laserbeam").fadeIn(100);}
    if (time==10){$("#laserbeam").fadeOut(100);}

    if (time==8){
         $("#alice_photon").show();
         $("#bob_photon").show();
         $("#alice_photon").animate({ top: "-=90", left: "+=180"}, 800, "linear");
         $("#bob_photon").animate({ top: "+=90", left: "+=180"}, 800, "linear");
    }

    if (time ==15){

    }

    if (time>30){time=undefined;}

    if (time!=undefined){time += 1;}
}

window.onload = function(){
    boot();

    $("#laser").click(function(){
        if (time==undefined){time=0;}
    });

    setInterval(myUpdate, 15);
}

