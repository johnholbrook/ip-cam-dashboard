// var root = "http://192.168.1.245:8080/";
var ip = "";
var port = "";
var root = "";

var sensor_update = null;

function display_error(param, value){
    `<div class="alert alert-danger alert-fixed alert-dismissible fade show my-4 w-50 float" role="alert" id="error-alert">
        <strong>ERROR:</strong> Can't set ${param} to ${value}.
        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>`

    let clone = document.querySelector("#alert-template").cloneNode(true);
    console.log(clone);

    $('#error-alert').alert();

    setTimeout(() => {
        $('#error-alert').alert('close');
    }, 5000);
}

function update_sensor_data(){
    $.getJSON(root+"sensors.json", (data) => {
        //extract relevent JSON data
        let batt_charge = data.battery_level.data[0][1][0];
        let batt_temp = data.battery_temp.data[0][1][0];
        let gyro = data.gyro.data[0][1];
        let gyro_x = gyro[0];
        let gyro_y = gyro[1];
        let gyro_z = gyro[2];

        // write data to page
        document.querySelector("#batt_charge").innerHTML = batt_charge;
        document.querySelector("#batt_temp").innerHTML = Math.round((batt_temp*1.8) + 32);
        document.querySelector("#gyro_x").innerHTML = gyro_x.toFixed(3);
        document.querySelector("#gyro_y").innerHTML = gyro_y.toFixed(3);
        document.querySelector("#gyro_z").innerHTML = gyro_z.toFixed(3);

        // console.log(`Battery ${batt_level}%, ${batt_temp}C; Gyro ${gyro_x} X; ${gyro_y} Y; ${gyro_z} Z`);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    //set camera IP and port
    document.querySelector("#submit-addr").onclick = () => {
        ip = document.querySelector("#ip-addr").value;
        port = document.querySelector("#port").value;
        root = `http://${ip}:${port}/`;
        document.querySelector("#video-feed").src = root + "video";

        //start live-updating sensor data
        clearInterval(sensor_update);
        sensor_update = setInterval(() => {
            update_sensor_data();
        }, 200);
    };

    //choose front or rear-facing camera
    document.querySelectorAll("#camera-select input").forEach(button => {
        button.onclick = () => {
            if (document.querySelector("#front_camera").checked){
                console.log("Front Camera");
                // $.ajax(root+'settings/ffc?set=on').fail(display_error('ffc', 'on'));
                $.ajax(root+'settings/ffc?set=on')
            }
            else{
                console.log("Back Camera");
                // $.ajax(root+'settings/ffc?set=off').fail(display_error('ffc', 'off'));
                $.ajax(root+'settings/ffc?set=off')
            }
        };
    });

    //turn flash on or off
    document.querySelectorAll("#flash-toggle input").forEach(button => {
        button.onclick = () => {
            if (document.querySelector("#flash_on").checked){
                console.log("Flash On");
                // $.ajax(root+'enabletorch').fail(display_error('flash', 'on'));
                $.ajax(root+'enabletorch')
            }
            else{
                console.log("Flash Off");
                // $.ajax(root+'disabletorch').fail(display_error('flash', 'off'));
                $.ajax(root+'disabletorch')
            }
        };
    });

    //turn night vision mode on or off
    document.querySelectorAll("#nv-toggle input").forEach(button => {
        button.onclick = () => {
            if (document.querySelector("#nv_on").checked){
                console.log("Night Vision On");
                // $.ajax(root+'settings/night_vision?set=on').fail(display_error('night_vision', 'on'));
                $.ajax(root+'settings/night_vision?set=on')
            }
            else{
                console.log("Night Vision Off");
                // $.ajax(root+'settings/night_vision?set=off').fail(display_error('night_vision', 'off'));
                $.ajax(root+'settings/night_vision?set=off')
            }
        };
    });

    //adjust night vision gain
    document.querySelector("#nv-gain").oninput = () => {
        let val = document.querySelector("#nv-gain").value;
        document.querySelector("#nv-gain-current").innerHTML = val;
        $.ajax(root+'/settings/night_vision_gain?set='+val);
    };
    
    //adjust nigth vision exposure
    document.querySelector("#nv-exposure").oninput = () => {
        let val = document.querySelector("#nv-exposure").value;
        document.querySelector("#nv-exposure-current").innerHTML = val;
        $.ajax(root+'/settings/night_vision_average?set='+val);
    };

});

