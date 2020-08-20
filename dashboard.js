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

function update_sensor_data(now=-1){
    $.getJSON(`${root}/sensors.json?from=${now}`, (data) => {

        // Battery Level (%)
        if (data.battery_level.data.length) {
            document.querySelector('#batt_charge').innerHTML = data.battery_level.data.pop()[1][0];
        }

        // Battery Temperature (C)
        if (data.battery_temp.data.length) {
            document.querySelector('#batt_temp').innerHTML = data.battery_temp.data.pop()[1][0];
            // document.querySelector('#batt_temp').innerHTML = Math.round((batt_temp*1.8) + 32);
            // document.querySelector('#batt_temp').title = `${Math.round((batt_temp*1.8) + 32)}&deg;F`
        }

        // Rotation Vector (Quaternion)
        if (data.rot_vector.data.length) {
            let rv = data.rot_vector.data.pop();

            let gyro_x = rv[1][0];
            let gyro_y = rv[1][1];
            let gyro_z = rv[1][2];
            let gyro_w = rv[1][3];

            let pitch = Math.atan2(-2 * (gyro_w * gyro_x + gyro_y * gyro_z),
                1 - 2 * (gyro_x * gyro_x + gyro_y * gyro_y)) + Math.PI;
            let roll = Math.asin(2 * (gyro_w * gyro_y - gyro_z * gyro_x));
            if (pitch > Math.PI) {
                roll = Math.PI - roll;
            }
            let yaw = Math.atan2(-2 * (gyro_w * gyro_z + gyro_x * gyro_y),
                1 - 2 * (gyro_y * gyro_y + gyro_z * gyro_z));

            document.querySelector('#rot_roll').style.transform = `rotate(${roll}rad)`;
            document.querySelector('#rot_roll+span').innerHTML = `${(roll/Math.PI*180).toFixed(2)}&deg;`;
            document.querySelector('#rot_pitch').style.transform = `rotate(${pitch}rad)`;
            document.querySelector('#rot_pitch+span').innerHTML = `${(90-pitch/Math.PI*180).toFixed(2)}&deg;`;
            document.querySelector('#rot_yaw').style.transform = `rotate(${yaw}rad)`;
            document.querySelector('#rot_yaw+span').innerHTML = `${(yaw/Math.PI*180).toFixed(2)}&deg;`;
        }

        // Compute the most recent time stamp
        $.each(data, (type, stream) => {
            $.each(stream.data, (i, cell) => {
                now = Math.max(now, cell[0]);
            });
        });

        // Schedule receipt of the next batch of sensor data
        setTimeout(() => update_sensor_data(now), 100);
    });
}

//get information about the current status of the camera and update the
//controls on the dashboard accordingly
function get_camera_status(){
    $.getJSON(`${root}/status.json`, (data) => {
        if (data.curvals.ffc == "on"){
            //front-facing camera shown
            $("#front_camera").parent().addClass("active");
            $("#rear_camera").parent().removeClass("active");
        }
        else{
            // rear-facing camera shown
            $("#rear_camera").parent().addClass("active");
            $("#front_camera").parent().removeClass("active");
        }

        if (data.curvals.torch == "on"){
            //flash is on
            $("#flash_on").parent().addClass("active");
            $("#flash_off").parent().removeClass("active");
        }
        else{
            // flash is off
            $("#flash_off").parent().addClass("active");
            $("#flash_on").parent().removeClass("active");
        }

        if (data.curvals.night_vision == "on"){
            //NV is on
            $("#nv_on").parent().addClass("active");
            $("#nv_off").parent().removeClass("active");
        }
        else{
            //NV is off
            $("#nv_off").parent().addClass("active");
            $("#nv_on").parent().removeClass("active");
        }

        //set NV Gain and Exposure
        $("#nv-gain").val(data.curvals.night_vision_gain);
        $("#nv-gain-current").html(Number(data.curvals.night_vision_gain).toFixed(0));
        $("#nv-exposure").val(data.curvals.night_vision_average);
        $("#nv-exposure-current").html(data.curvals.night_vision_average);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    $('#batt_temp').tooltip();

    //set camera IP and port
    document.querySelector("#submit-addr").onclick = () => {
        ip = document.querySelector("#ip-addr").value;
        port = document.querySelector("#port").value;
        root = `http://${ip}:${port}/`;
        document.querySelector("#video-feed").src = root + "video";

        //update status of controls
        get_camera_status();

        //start live-updating sensor data
        update_sensor_data();
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

    //take snapshot
    document.querySelector("#take-snapshot").onclick = () => {
        //Get an image from the camera

        let uri = `${root}/shot.jpg?${Math.floor(Math.random()*100000)}`;

        //generate HTML source
        let new_snapshot_source = `
        <div class="col-6 mb-4">
            <button type="button" class="close text-danger d-none snapshot-close" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <img src="${uri}" class="img-fluid">
        </div>
        `;

        //convert HTML source into a DOM object
        let template = document.createElement('template');
        template.innerHTML = new_snapshot_source;
        let new_snapshot = template.content.firstElementChild;

        //show close button only on mouseover
        new_snapshot.onmouseover = () => {
            new_snapshot.querySelector('.snapshot-close').classList.toggle('d-none', false);
        };
        new_snapshot.onmouseout = () => {
            new_snapshot.querySelector('.snapshot-close').classList.toggle('d-none', true);
        };

        //delete snapshot when close button clicked
        new_snapshot.querySelector('.snapshot-close').onclick = () => {
            new_snapshot.remove();
        };

        //add new snapshot to document
        let snapshot_area = document.querySelector('#snapshot-area');
        snapshot_area.insertBefore(new_snapshot, snapshot_area.childNodes[0]);
    };

});

