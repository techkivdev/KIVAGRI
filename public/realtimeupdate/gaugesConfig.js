// *******************************************************************************
// SCRIPT : gaugesConfig.js
//
//
// Author : Vivek Thakur
// Date : 14/8/2020
// *******************************************************************************

// https://www.cssscript.com/customizable-gauge-canvas/
// ---------------------------------------
// Gauges Setup for  :          ANALOG PIN
// ---------------------------------------

// Create Analog GUI Component
function createAnalogGUIComponent(allPinDetails) {

    let analog_guages_lines = ''

    println('Create Analog GUI Component')

    let count = 0
    for(eachkey in allPinDetails){
        let eachpindata = allPinDetails[eachkey]
        
        if(eachpindata['TYPE'] == "ANALOG" && eachpindata['STATUS'] == 'TRUE') 
        {
             // Create Set of three
             if(count ==0) {analog_guages_lines += '<div class="row" style="margin-top: 20px;">'}

            count++;

           analog_guages_lines += '\
            <div class="card align-items-center col" style="margin-left: 10px; width: 20rem;">\
              <div class="card-body text-center">\
                <h6 class="card-title">'+eachkey+'</h6>\
                <h6 class="card-subtitle mb-2 text-muted">'+eachpindata['NAME']+'</h6>\
                <h4 class="card-subtitle mb-2 text-muted" id="analog_'+eachkey+'_value_section" style="margin-top : 20px;">1.234</h4>\
                <div>\
                  <b id="analog_'+eachkey+'_value_field" style="font-size : 30px; display : none;"></b>\
                  <canvas id="analog_'+eachkey+'_canvas"></canvas>\
                </div>\
                <a href="#!" id="'+eachkey+'_moreoption" onclick="openAnalogDeviceIDOptions(\'' + eachkey + '\')" class="card-link">More</a>\
              </div>\
            </div> '

            if(count == 3){
                count = 0
                analog_guages_lines += '</div>'
            }
        }


    }

    // Set HTML
    $("#analogguisection").html(' <h2 style="margin-top: 10px;">Analog Inputs</h2>' + analog_guages_lines)

    // Update Analog GUI Parameters
    updateAnalogGUIComponent(allPinDetails)

    

}

// Update Guage Parameters
var gaugeIDDetails = {}
function updateAnalogGUIComponent(allPinDetails)
{
    println("Update Analog GUI Compinent ..")

    for(eachkey in allPinDetails)
    {
        let eachpindata = allPinDetails[eachkey]

        if(eachpindata['TYPE'] == "ANALOG" && eachpindata['STATUS'] == 'TRUE') 
        {

            let canvasID = "analog_"+eachkey+"_canvas"
            let fieldID  = "analog_"+eachkey+"_value_field" 
            
            let rangeset = []
            rangeset[0] = parseInt(eachpindata['EXTRA'].split('#')[0].split(',')[0])
            rangeset[1] = parseInt(eachpindata['EXTRA'].split('#')[0].split(',')[1])
            rangeset[2] = parseInt(eachpindata['EXTRA'].split('#')[0].split(',')[2])
            rangeset[3] = parseInt(eachpindata['EXTRA'].split('#')[0].split(',')[3])

            let colorset = []
            colorset[0] = eachpindata['EXTRA'].split('#')[1].split(',')[0]
            colorset[1] = eachpindata['EXTRA'].split('#')[1].split(',')[1]
            colorset[2] = eachpindata['EXTRA'].split('#')[1].split(',')[2]

            let colormap = {
                G : "#30B32D",
                Y : "#FFDD00",
                R : "#F03E3E"
            }          


            var opts = {
                angle: -0.25,
                lineWidth: 0.2,
                radiusScale:0.9,
                pointer: {
                    length: 0.6,
                    strokeWidth: 0.05,
                    color: '#000000'
                },
                staticLabels: {
                    font: "10px sans-serif",
                    labels: rangeset,
                    fractionDigits: 0
                },
                staticZones: [
                    {strokeStyle: colormap[colorset[0]] , min: rangeset[0], max: rangeset[1]},
                    {strokeStyle: colormap[colorset[1]] , min: rangeset[1], max: rangeset[2]},
                    {strokeStyle: colormap[colorset[2]] , min: rangeset[2], max: rangeset[3]}
                ],
                limitMax: false,
                limitMin: false,
                highDpiSupport: true
            };


            var target = document.getElementById(canvasID); 
            gaugeIDDetails[eachkey] = new Gauge(target).setOptions(opts);

            document.getElementById(fieldID).className = fieldID;
            gaugeIDDetails[eachkey].setTextField(document.getElementById(fieldID));

            gaugeIDDetails[eachkey].maxValue = parseInt(eachpindata['MAXVALUE']);
            gaugeIDDetails[eachkey].setMinValue(parseInt(eachpindata['MINVALUE']));
            gaugeIDDetails[eachkey].set(parseInt(eachpindata['INITVALUE']));
            
            gaugeIDDetails[eachkey].animationSpeed = 32

        }

    }

    println(gaugeIDDetails)

}

// Update Value
function updateAnalogValue(allPinDetails,data)
{
    for(eachkey in allPinDetails)
    {
        let eachpindata = allPinDetails[eachkey]

        if(eachpindata['TYPE'] == "ANALOG" && eachpindata['STATUS'] == 'TRUE') 
        {
            let value = data[eachkey]
            setHTML('analog_'+eachkey+'_value_section',value)
           // println(value)
            gaugeIDDetails[eachkey].set(value)
        }
    }
   
}
