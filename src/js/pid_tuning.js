// 'use strict';

const pid_tuning = {
    rate_saving_ack :0,
    pid_saving_ack :0,
};
pid_tuning.initialize = function (callback) {
    const self = this;
    if (GUI.active_tab !== 'pid_tuning') {
        GUI.active_tab = 'pid_tuning';
        self.activeSubtab = 'pid';
    }
    // Local cache of current rates
    self.currentRates = {
        roll_rate:     FC.RC_TUNING.roll_rate,
        pitch_rate:    FC.RC_TUNING.pitch_rate,
        yaw_rate:      FC.RC_TUNING.yaw_rate,
        // rc_rate:       FC.RC_TUNING.RC_RATE,
        rc_rate:       FC.RC_TUNING.rcRollRate,
        rc_rate_roll:  FC.RC_TUNING.rcRollRate,
        rc_rate_yaw:   FC.RC_TUNING.rcYawRate,
        // rc_expo:       FC.RC_TUNING.RC_EXPO,
        rc_expo:       FC.RC_TUNING.RC_ROLL_EXPO,
        rc_roll_expo:  FC.RC_TUNING.RC_ROLL_EXPO,
        rc_yaw_expo:   FC.RC_TUNING.RC_YAW_EXPO,
        rc_rate_pitch: FC.RC_TUNING.rcPitchRate,
        rc_pitch_expo: FC.RC_TUNING.RC_PITCH_EXPO,
        // superexpo:   FC.FEATURE_CONFIG.features.isEnabled('SUPEREXPO_RATES'),
        deadband: FC.RC_DEADBAND_CONFIG.deadband,
        yawDeadband: FC.RC_DEADBAND_CONFIG.yaw_deadband,
        roll_rate_limit:   FC.RC_TUNING.roll_rate_limit,
        pitch_rate_limit:  FC.RC_TUNING.pitch_rate_limit,
        yaw_rate_limit:    FC.RC_TUNING.yaw_rate_limit
    };
    
    $('#content').load("./src/html/pid_tuning.html", function () {
    i18n.localizePage();
    
    $('.tab-pid_tuning .tab-container .pid').on('click', () => activateSubtab('pid'));

    $('.tab-pid_tuning .tab-container .rates').on('click', () => activateSubtab('rates'));

  

    //update == save
    $('a.update').click(function () {

            
            if(self.activeSubtab == 'pid'){
                mavlink_send_pid();

            }else if(self.activeSubtab == 'rates'){
                form_to_pid_and_rc();
            }else {

            }

        
    });
    function checkInput(element) {
        let value = parseFloat(element.val());
        if (value < parseFloat(element.prop('min'))
            || value > parseFloat(element.prop('max'))) {
            value = undefined;
        }

        return value;
    }
    function drawAxes(curveContext, width, height) {
        curveContext.strokeStyle = '#000000';
        curveContext.lineWidth = 4;

        // Horizontal
        curveContext.beginPath();
        curveContext.moveTo(0, height / 2);
        curveContext.lineTo(width, height / 2);
        curveContext.stroke();

        // Vertical
        curveContext.beginPath();
        curveContext.moveTo(width / 2, 0);
        curveContext.lineTo(width / 2, height);
        curveContext.stroke();

    }

    let useLegacyCurve = false;
    self.rateCurve = new RateCurve(useLegacyCurve);
    function printMaxAngularVel(rate, rcRate, rcExpo, useSuperExpo, deadband, limit, maxAngularVelElement) {
        const maxAngularVel = self.rateCurve.getMaxAngularVel(rate, rcRate, rcExpo, useSuperExpo, deadband, limit).toFixed(0);
        maxAngularVelElement.text(maxAngularVel);

        return maxAngularVel;
    }
    function drawCurve(rate, rcRate, rcExpo, useSuperExpo, deadband, limit, maxAngularVel, colour, yOffset, context) {
        context.save();
        context.strokeStyle = colour;
        context.translate(0, yOffset);
        self.rateCurve.draw(rate, rcRate, rcExpo, useSuperExpo, deadband, limit, maxAngularVel, context);
        context.restore();
    }

    const rcCurveElement = $('.rate_curve canvas#rate_curve_layer0').get(0);
    const curveContext = rcCurveElement.getContext("2d");
    let updateNeeded = true;
    let maxAngularVel;

    // make these variables global scope so that they can be accessed by the updateRates function.
    self.maxAngularVelRollElement    = $('.pid_tuning .maxAngularVelRoll');
    self.maxAngularVelPitchElement   = $('.pid_tuning .maxAngularVelPitch');
    self.maxAngularVelYawElement     = $('.pid_tuning .maxAngularVelYaw');

    rcCurveElement.width = 1000;
    rcCurveElement.height = 1000;
    updateRates = function(event) {
        setTimeout(function () { // let global validation trigger and adjust the values first
            if (event) { // if an event is passed, then use it
                const targetElement = $(event.target);
                let targetValue = checkInput(targetElement);

                if (self.currentRates.hasOwnProperty(targetElement.attr('name')) && targetValue !== undefined) {
                    const stepValue = parseFloat(targetElement.prop('step')); // adjust value to match step (change only the result, not the the actual value)
                    if (stepValue != null) {
                        targetValue = Math.round(targetValue / stepValue) * stepValue;
                    }

                    self.currentRates[targetElement.attr('name')] = targetValue;
                    console.log(targetElement.attr('name')+targetValue);

                    updateNeeded = true;
                }

                
            } else { // no event was passed, just force a graph update
                updateNeeded = true;
            }
            if (updateNeeded) {
                const curveHeight = rcCurveElement.height;
                const curveWidth = rcCurveElement.width;
                const lineScale = curveContext.canvas.width / curveContext.canvas.clientWidth;

                curveContext.clearRect(0, 0, curveWidth, curveHeight);

                if (!useLegacyCurve) {
                    maxAngularVel = Math.max(
                        printMaxAngularVel(self.currentRates.roll_rate, self.currentRates.rc_rate_roll, self.currentRates.rc_roll_expo, self.currentRates.superexpo, self.currentRates.deadband, self.currentRates.roll_rate_limit, self.maxAngularVelRollElement),
                        printMaxAngularVel(self.currentRates.pitch_rate, self.currentRates.rc_rate_pitch, self.currentRates.rc_pitch_expo, self.currentRates.superexpo, self.currentRates.deadband, self.currentRates.pitch_rate_limit, self.maxAngularVelPitchElement),
                        printMaxAngularVel(self.currentRates.yaw_rate, self.currentRates.rc_rate_yaw, self.currentRates.rc_yaw_expo, self.currentRates.superexpo, self.currentRates.yawDeadband, self.currentRates.yaw_rate_limit, self.maxAngularVelYawElement));

                    // make maxAngularVel multiple of 200deg/s so that the auto-scale doesn't keep changing for small changes of the maximum curve
                    maxAngularVel = self.rateCurve.setMaxAngularVel(maxAngularVel);

                    //画坐标轴
                    drawAxes(curveContext, curveWidth, curveHeight);

                } else {
                    maxAngularVel = 0;
                }

                curveContext.lineWidth = 2 * lineScale;
                drawCurve(self.currentRates.roll_rate, self.currentRates.rc_rate_roll, self.currentRates.rc_roll_expo, self.currentRates.superexpo, self.currentRates.deadband, self.currentRates.roll_rate_limit, maxAngularVel, '#ff0000', 0, curveContext);
                drawCurve(self.currentRates.pitch_rate, self.currentRates.rc_rate_pitch, self.currentRates.rc_pitch_expo, self.currentRates.superexpo, self.currentRates.deadband, self.currentRates.pitch_rate_limit, maxAngularVel, '#00ff00', -4, curveContext);
                drawCurve(self.currentRates.yaw_rate, self.currentRates.rc_rate_yaw, self.currentRates.rc_yaw_expo, self.currentRates.superexpo, self.currentRates.yawDeadband, self.currentRates.yaw_rate_limit, maxAngularVel, '#0000ff', 4, curveContext);

                self.updateRatesLabels();

                updateNeeded = false;
            }
        }, 0);
    }

    

    // UI Hooks
    // curves
    $('.pid_tuning').on('input change', updateRates).trigger('input');
    $('.throttle input')
    .on('input change', () => setTimeout(() => redrawThrottleCurve(true), 0));


    redrawThrottleCurve = function(forced) {
        if (!forced && !pid_tuning.checkThrottle()) {
            return;
        }

        /*
        Quadratic curve formula taken from:
            https://stackoverflow.com/a/9195706/176210
        */

        function getQBezierValue(t, p1, p2, p3) {
            const iT = 1 - t;
            return iT * iT * p1 + 2 * iT * t * p2 + t * t * p3;
        }

        function getQuadraticCurvePoint(startX, startY, cpX, cpY, endX, endY, position) {
            return {
                x:  getQBezierValue(position, startX, cpX, endX),
                y:  getQBezierValue(position, startY, cpY, endY),
            };
        }

        /* --- */

        // let global validation trigger and adjust the values first
        var throttleMidE = $('.throttle input[name="mid"]');
        var throttleExpoE = $('.throttle input[name="expo"]');
        var mid = parseFloat(throttleMidE.val());
        var expo = parseFloat(throttleExpoE.val());
        var throttleCurve = $('.throttle .throttle_curve canvas').get(0);
        var context = throttleCurve.getContext("2d");

        // local validation to deal with input event
        if (mid >= parseFloat(throttleMidE.prop('min')) &&
            mid <= parseFloat(throttleMidE.prop('max')) &&
            expo >= parseFloat(throttleExpoE.prop('min')) &&
            expo <= parseFloat(throttleExpoE.prop('max'))) {
            // continue
        } else {
            return;
        }

        throttleCurve.width = throttleCurve.height *
            (throttleCurve.clientWidth / throttleCurve.clientHeight);

        const canvasHeight = throttleCurve.height;
        const canvasWidth = throttleCurve.width;

        // math magic by englishman
        const midx = canvasWidth * mid;
        const midxl = midx * 0.5;
        const midxr = (((canvasWidth - midx) * 0.5) + midx);
        const midy = canvasHeight - (midx * (canvasHeight / canvasWidth));
        const midyl = canvasHeight - ((canvasHeight - midy) * 0.5 *(expo + 1));
        const midyr = (midy / 2) * (expo + 1);

        let thrPercent = (FC.RC.channels[3] - 1000) / 1000,
            thrpos = thrPercent <= mid
                ? getQuadraticCurvePoint(0, canvasHeight, midxl, midyl, midx, midy, thrPercent * (1.0 / mid))
                : getQuadraticCurvePoint(midx, midy, midxr, midyr, canvasWidth, 0, (thrPercent - mid) * (1.0 / (1.0 - mid)));

        // draw
        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.beginPath();
        context.moveTo(0, canvasHeight);
        context.quadraticCurveTo(midxl, midyl, midx, midy);
        context.moveTo(midx, midy);
        context.quadraticCurveTo(midxr, midyr, canvasWidth, 0);
        context.lineWidth = 2;
        context.strokeStyle = '#ffbb00';
        context.stroke();
        context.beginPath();
        context.arc(thrpos.x, thrpos.y, 4, 0, 2 * Math.PI);
        context.fillStyle = context.strokeStyle;
        context.fill();
        context.save();
        let fontSize = 10;
        context.font = fontSize + "pt Verdana, Arial, sans-serif";
        let realthr = thrPercent * 100.0,
            expothr = 100 - (thrpos.y / canvasHeight) * 100.0,
            thrlabel = Math.round(thrPercent <= 0 ? 0 : realthr) + "%" +
                " = " + Math.round(thrPercent <= 0 ? 0 : expothr) + "%",
            textWidth = context.measureText(thrlabel);
        context.fillStyle = '#000';
        context.scale(textWidth / throttleCurve.clientWidth, 1);
        context.fillText(thrlabel, 5, 5 + fontSize);
        context.restore();
    }





    activateSubtab(self.activeSubtab);

      callback();
    });

    function checkInput(element) {
        let value = parseFloat(element.val());
        if (value < parseFloat(element.prop('min'))
            || value > parseFloat(element.prop('max')) 
            ||isNaN(value)) {
            value = undefined;
        }
        return value;
        
    }

    function form_to_pid_and_rc() {
        FC.PID_NAMES.forEach(function(elementPid, indexPid) {

            // Look into the PID table to a row with the name of the pid
            const searchRow = $('.pid_tuning .' + elementPid + ' input');

            // Assign each value
            searchRow.each(function (indexInput) {
                if ($(this).val()) {
                    FC.PIDS[indexPid][indexInput] = parseFloat($(this).val());
                }
            });
        });

        // catch RC_tuning changes
        const rc_rate_roll_e = $('.pid_tuning input[name="rc_rate_roll"]');
        const roll_rate_e = $('.pid_tuning input[name="roll_rate"]');
        const rc_roll_expo_e = $('.pid_tuning input[name="rc_roll_expo"]');

        const rc_rate_pitch_e = $('.pid_tuning input[name="rc_rate_pitch"]');
        const pitch_rate_e = $('.pid_tuning input[name="pitch_rate"]');
        const rc_pitch_expo_e = $('.pid_tuning input[name="rc_pitch_expo"]'); 
        
        const rc_rate_yaw_e = $('.pid_tuning input[name="rc_rate_yaw"]');
        const yaw_rate_e = $('.pid_tuning input[name="yaw_rate"]');
        const rc_yaw_expo_e = $('.pid_tuning input[name="rc_yaw_expo"]');
        
        
        const throttleMidE = $('.throttle input[name="mid"]');
        const throttleExpoE = $('.throttle input[name="expo"]');
        if(checkInput(rc_rate_roll_e)==undefined || checkInput(roll_rate_e)==undefined || checkInput(rc_roll_expo_e)==undefined ||
        checkInput(rc_rate_pitch_e)==undefined || checkInput(pitch_rate_e)==undefined || checkInput(rc_pitch_expo_e)==undefined ||
        checkInput(rc_rate_yaw_e)==undefined || checkInput(yaw_rate_e)==undefined || checkInput(rc_yaw_expo_e)==undefined ||
        checkInput(throttleMidE)==undefined || checkInput(throttleExpoE)==undefined){
            alert("Saving failed! Please check the rate's value is valid!");
            return;
        }else{
            setTimeout(()=>{
                if(pid_tuning.rate_saving_ack){
                    pid_tuning.rate_saving_ack = 0;
                    alert("rate saving successful!");
                }else{
                    alert("rate saving failed! Please check the connection!");
                }

            },2000)
            
        }


        
        FC.RC_TUNING.rcRollRate = parseFloat(rc_rate_roll_e.val());
        FC.RC_TUNING.roll_rate = parseFloat(roll_rate_e.val());
        FC.RC_TUNING.RC_ROLL_EXPO = parseFloat(rc_roll_expo_e.val());
        
        FC.RC_TUNING.rcPitchRate = parseFloat(rc_rate_pitch_e.val());
        FC.RC_TUNING.pitch_rate = parseFloat(pitch_rate_e.val());
        FC.RC_TUNING.RC_PITCH_EXPO = parseFloat(rc_pitch_expo_e.val());

        FC.RC_TUNING.rcYawRate = parseFloat(rc_rate_yaw_e.val());
        FC.RC_TUNING.yaw_rate = parseFloat(yaw_rate_e.val());
        FC.RC_TUNING.RC_YAW_EXPO = parseFloat(rc_yaw_expo_e.val());
        
        var mid = parseFloat(throttleMidE.val());
        var expo = parseFloat(throttleExpoE.val());

        
        let msg = new mavlink10.messages.rate(FC.RC_TUNING.rcRollRate, FC.RC_TUNING.roll_rate, FC.RC_TUNING.RC_ROLL_EXPO, 
            FC.RC_TUNING.rcPitchRate, FC.RC_TUNING.pitch_rate,FC.RC_TUNING.RC_PITCH_EXPO,
            FC.RC_TUNING.rcYawRate,FC.RC_TUNING.yaw_rate,FC.RC_TUNING.RC_YAW_EXPO,
            mid,expo
            );
        console.log(msg);
        let buffer = msg.pack(msg);
        console.log(buffer);
        mavlinkSend(buffer);
    }

    function mavlink_send_pid(){
        const roll_p_e = $('.ROLL input[name="p"]');
        const roll_i_e = $('.ROLL input[name="i"]');
        const roll_d_e = $('.ROLL input[name="d"]');
        const roll_i_max_e = $('.ROLL input[name="imax"]');
        const roll_d_cutfreq_e = $('.ROLL input[name="cutfreq"]');

        const pitch_p_e = $('.PITCH input[name="p"]');
        const pitch_i_e = $('.PITCH input[name="i"]');
        const pitch_d_e = $('.PITCH input[name="d"]');
        const pitch_i_max_e = $('.PITCH input[name="imax"]');
        const pitch_d_cutfreq_e = $('.PITCH input[name="cutfreq"]');

        const yaw_p_e = $('.YAW input[name="p"]');
        const yaw_i_e = $('.YAW input[name="i"]');
        const yaw_d_e = $('.YAW input[name="d"]');
        const yaw_i_max_e = $('.YAW input[name="imax"]');
        const yaw_d_cutfreq_e = $('.YAW input[name="cutfreq"]');

        if(checkInput(roll_p_e)==undefined || checkInput(roll_i_e)==undefined || checkInput(roll_d_e)==undefined || checkInput(roll_i_max_e)==undefined || checkInput(roll_d_cutfreq_e)==undefined 
        || checkInput(pitch_p_e)==undefined || checkInput(pitch_i_e)==undefined || checkInput(pitch_d_e)==undefined || checkInput(pitch_i_max_e)==undefined || checkInput(pitch_d_cutfreq_e)==undefined
        || checkInput(yaw_p_e)==undefined || checkInput(yaw_i_e)==undefined || checkInput(yaw_d_e)==undefined ||checkInput(yaw_i_max_e)==undefined ||checkInput(yaw_d_cutfreq_e)==undefined){
            console.log("Saving failed! Please check the PID's value is valid!");
            alert("Saving failed! Please check the PID's value is valid!");
            return;
        }else{
            console.log("PID saving!");
            setTimeout(()=>{
                if(pid_tuning.pid_saving_ack){
                    pid_tuning.pid_saving_ack = 0;
                    alert("PID saving successful!");
                }else{
                    alert("PID saving failed! Please check the connection!");
                }       

            },2000)
            
        }
        
        const roll_p = parseFloat(roll_p_e.val()).toFixed(2);
        const roll_i = parseFloat(roll_i_e.val()).toFixed(2);
        const roll_d = parseFloat(roll_d_e.val()).toFixed(2);
        const roll_i_max = parseInt(roll_i_max_e.val());
        const roll_d_cutfreq = parseInt(roll_d_cutfreq_e.val());

        const pitch_p = parseFloat(pitch_p_e.val()).toFixed(2);
        const pitch_i = parseFloat(pitch_i_e.val()).toFixed(2);
        const pitch_d = parseFloat(pitch_d_e.val()).toFixed(2);
        const pitch_i_max = parseInt(pitch_i_max_e.val());
        const pitch_d_cutfreq = parseInt(pitch_d_cutfreq_e.val());

        const yaw_p = parseFloat(yaw_p_e.val()).toFixed(2);
        const yaw_i = parseFloat(yaw_i_e.val()).toFixed(2);
        const yaw_d = parseFloat(yaw_d_e.val()).toFixed(2);
        const yaw_i_max = parseInt(yaw_i_max_e.val());
        const yaw_d_cutfreq = parseInt(yaw_d_cutfreq_e.val());
        console.log("roll_p:"+roll_p);

        let msg = new mavlink10.messages.pid(roll_p, roll_i, roll_d, roll_i_max, roll_d_cutfreq,
            pitch_p, pitch_i, pitch_d, pitch_i_max, pitch_d_cutfreq,
            yaw_p, yaw_i, yaw_d, yaw_i_max, yaw_d_cutfreq);
        console.log(msg);
        let buffer = msg.pack(msg);
        console.log(buffer);
        mavlinkSend(buffer);
    }

    


    
   
    function activateSubtab(subtabName) {
      const names = ['pid', 'rates'];
      if (!names.includes(subtabName)) {
          console.debug('Invalid subtab name: "' + subtabName + '"');
          return;
      }
      for (name of names) {
          const el = $('.tab-pid_tuning .subtab-' + name);
          el[name == subtabName ? 'show' : 'hide']();
      }
      $('.tab-pid_tuning .tab-container .tab').removeClass('active');
      $('.tab-pid_tuning .tab-container .' + subtabName).addClass('active');
      self.activeSubtab = subtabName;
      if (subtabName == 'rates') {
        
      }
   }



pid_tuning.checkThrottle = function() {
    // Function monitors for change in the received rc throttle data and returns true if a change is detected.
    if (!this.oldThrottle) {
        this.oldThrottle = FC.RC.channels[3];
        return true;
    }
    const updateRequired = this.oldThrottle !== FC.RC.channels[3];
    this.oldThrottle = FC.RC.channels[3];
    return updateRequired;
};

  activateSubtab(self.activeSubtab);

};



pid_tuning.updateRatesLabels = function() {
    const self = this;
    if (!self.rateCurve.useLegacyCurve && self.rateCurve.maxAngularVel) {

        const drawAxisLabel = function(context, axisLabel, x, y, align, color) {

            context.fillStyle = color || '#000000' ;
            context.textAlign = align || 'center';
            context.fillText(axisLabel, x, y);
        };

        const drawBalloonLabel = function(context, axisLabel, x, y, align, colors, dirty) {

            /**
             * curveContext is the canvas to draw on
             * axisLabel is the string to display in the center of the balloon
             * x, y are the coordinates of the point of the balloon
             * align is whether the balloon appears to the left (align 'right') or right (align left) of the x,y coordinates
             * colors is an object defining color, border and text are the fill color, border color and text color of the balloon
             */

            const DEFAULT_OFFSET        = 125; // in canvas scale; this is the horizontal length of the pointer
            const DEFAULT_RADIUS        = 10; // in canvas scale, this is the radius around the balloon
            const DEFAULT_MARGIN        = 5;  // in canvas scale, this is the margin around the balloon when it overlaps

            const fontSize = parseInt(context.font);

            // calculate the width and height required for the balloon
            const width = (context.measureText(axisLabel).width * 1.2);
            const height = fontSize * 1.5; // the balloon is bigger than the text height
            const pointerY = y; // always point to the required Y
            // coordinate, even if we move the balloon itself to keep it on the canvas

            // setup balloon background
            context.fillStyle   = colors.color   || '#ffffff' ;
            context.strokeStyle = colors.border  || '#000000' ;

            // correct x position to account for window scaling
            x *= context.canvas.clientWidth/context.canvas.clientHeight;

            // adjust the coordinates for determine where the balloon background should be drawn
            x += ((align=='right') ? -(width + DEFAULT_OFFSET) : 0) + ((align=='left') ? DEFAULT_OFFSET : 0);
            y -= (height / 2); if (y < 0) y = 0; else if (y > context.height) y = context.height; // prevent balloon from going out of canvas

            // check that the balloon does not already overlap
            for (let i = 0; i < dirty.length; i++) {
                if ((x >= dirty[i].left && x <= dirty[i].right) || (x + width >= dirty[i].left && x + width <= dirty[i].right)) { // does it overlap horizontally
                    if ((y >= dirty[i].top && y<= dirty[i].bottom) || (y + height >= dirty[i].top && y + height <= dirty[i].bottom )) { // this overlaps another balloon
                        // snap above or snap below
                        if (y <= (dirty[i].bottom - dirty[i].top) / 2 && (dirty[i].top - height) > 0) {
                            y = dirty[i].top - height;
                        } else { // snap down
                            y = dirty[i].bottom;
                        }
                    }
                }
            }

            // Add the draw area to the dirty array
            dirty.push({left:x, right:x+width, top:y-DEFAULT_MARGIN, bottom:y+height+DEFAULT_MARGIN});


            const pointerLength =  (height - 2 * DEFAULT_RADIUS ) / 6;

            context.beginPath();
            context.moveTo(x + DEFAULT_RADIUS, y);
            context.lineTo(x + width - DEFAULT_RADIUS, y);
            context.quadraticCurveTo(x + width, y, x + width, y + DEFAULT_RADIUS);

            if (align === 'right') { // point is to the right
                context.lineTo(x + width, y + DEFAULT_RADIUS + pointerLength);
                context.lineTo(x + width + DEFAULT_OFFSET, pointerY);  // point
                context.lineTo(x + width, y + height - DEFAULT_RADIUS - pointerLength);
            }
            context.lineTo(x + width, y + height - DEFAULT_RADIUS);

            context.quadraticCurveTo(x + width, y + height, x + width - DEFAULT_RADIUS, y + height);
            context.lineTo(x + DEFAULT_RADIUS, y + height);
            context.quadraticCurveTo(x, y + height, x, y + height - DEFAULT_RADIUS);

            if (align === 'left') { // point is to the left
                context.lineTo(x, y + height - DEFAULT_RADIUS - pointerLength);
                context.lineTo(x - DEFAULT_OFFSET, pointerY); // point
                context.lineTo(x, y + DEFAULT_RADIUS - pointerLength);
            }
            context.lineTo(x, y + DEFAULT_RADIUS);

            context.quadraticCurveTo(x, y, x + DEFAULT_RADIUS, y);
            context.closePath();

            // fill in the balloon background
            context.fill();
            context.stroke();

            // and add the label
            drawAxisLabel(context, axisLabel, x + (width/2), y + (height + fontSize)/2 - 4, 'center', colors.text);

        };

        const BALLOON_COLORS = {
            roll    : {color: 'rgba(255,128,128,0.4)', border: 'rgba(255,128,128,0.6)', text: '#000000'},
            pitch   : {color: 'rgba(128,255,128,0.4)', border: 'rgba(128,255,128,0.6)', text: '#000000'},
            yaw     : {color: 'rgba(128,128,255,0.4)', border: 'rgba(128,128,255,0.6)', text: '#000000'}
        };

        const rcStickElement = $('.rate_curve canvas#rate_curve_layer1').get(0);
        if (rcStickElement) {
            rcStickElement.width = 1000;
            rcStickElement.height = 1000;

            const stickContext = rcStickElement.getContext("2d");

            stickContext.save();

            const maxAngularVelRoll   = self.maxAngularVelRollElement.text()  + ' deg/s';
            const maxAngularVelPitch  = self.maxAngularVelPitchElement.text() + ' deg/s';
            const maxAngularVelYaw    = self.maxAngularVelYawElement.text()   + ' deg/s';
            let currentValues         = [];
            let balloonsDirty         = [];
            const curveHeight         = rcStickElement.height;
            const curveWidth          = rcStickElement.width;
            const maxAngularVel       = self.rateCurve.maxAngularVel;
            const windowScale         = (400 / stickContext.canvas.clientHeight);
            const rateScale           = (curveHeight / 2) / maxAngularVel;
            const lineScale           = stickContext.canvas.width / stickContext.canvas.clientWidth;
            const textScale           = stickContext.canvas.clientHeight / stickContext.canvas.clientWidth;

            stickContext.clearRect(0, 0, curveWidth, curveHeight);

            // calculate the fontSize based upon window scaling
            if (windowScale <= 1) {
                stickContext.font = "24pt Verdana, Arial, sans-serif";
            } else {
                stickContext.font = (24 * windowScale) + "pt Verdana, Arial, sans-serif";
            }

            if (FC.RC.channels[0] && FC.RC.channels[1] && FC.RC.channels[2]) {
                currentValues.push(self.rateCurve.drawStickPosition(FC.RC.channels[0], self.currentRates.roll_rate, self.currentRates.rc_rate, self.currentRates.rc_expo, self.currentRates.superexpo, self.currentRates.deadband, self.currentRates.roll_rate_limit, maxAngularVel, stickContext, '#FF8080') + ' deg/s');
                currentValues.push(self.rateCurve.drawStickPosition(FC.RC.channels[1], self.currentRates.pitch_rate, self.currentRates.rc_rate_pitch, self.currentRates.rc_pitch_expo, self.currentRates.superexpo, self.currentRates.deadband, self.currentRates.pitch_rate_limit, maxAngularVel, stickContext, '#80FF80') + ' deg/s');
                currentValues.push(self.rateCurve.drawStickPosition(FC.RC.channels[2], self.currentRates.yaw_rate, self.currentRates.rc_rate_yaw, self.currentRates.rc_yaw_expo, self.currentRates.superexpo, self.currentRates.yawDeadband, self.currentRates.yaw_rate_limit, maxAngularVel, stickContext, '#8080FF') + ' deg/s');
            } else {
                currentValues = [];
            }

            stickContext.lineWidth = lineScale;

            // use a custom scale so that the text does not appear stretched
            stickContext.scale(textScale, 1);

            // add the maximum range label
            drawAxisLabel(stickContext, maxAngularVel.toFixed(0) + ' deg/s', ((curveWidth / 2) - 10) / textScale, parseInt(stickContext.font)*1.2, 'right');

            // and then the balloon labels.
            balloonsDirty = []; // reset the dirty balloon draw area (for overlap detection)
            // create an array of balloons to draw
            const balloons = [
                {value: parseInt(maxAngularVelRoll), balloon: function() {drawBalloonLabel(stickContext, maxAngularVelRoll,  curveWidth, rateScale * (maxAngularVel - parseInt(maxAngularVelRoll)),  'right', BALLOON_COLORS.roll, balloonsDirty);}},
                {value: parseInt(maxAngularVelPitch), balloon: function() {drawBalloonLabel(stickContext, maxAngularVelPitch, curveWidth, rateScale * (maxAngularVel - parseInt(maxAngularVelPitch)), 'right', BALLOON_COLORS.pitch, balloonsDirty);}},
                {value: parseInt(maxAngularVelYaw), balloon: function() {drawBalloonLabel(stickContext, maxAngularVelYaw,   curveWidth, rateScale * (maxAngularVel - parseInt(maxAngularVelYaw)),   'right', BALLOON_COLORS.yaw, balloonsDirty);}}
            ];
            // show warning message if any axis angular velocity exceeds 1800d/s
            const MAX_RATE_WARNING = 1800;
            const warningRates = (parseInt(maxAngularVelRoll) > MAX_RATE_WARNING || parseInt(maxAngularVelPitch) > MAX_RATE_WARNING
                || parseInt(maxAngularVelYaw) > MAX_RATE_WARNING);
            $('.maxRateWarning').toggle(warningRates);

            // and sort them in descending order so the largest value is at the top always
            balloons.sort(function(a,b) {return (b.value - a.value);});

            // add the current rc values
            if (currentValues[0] && currentValues[1] && currentValues[2]) {
                balloons.push(
                    {value: parseInt(currentValues[0]), balloon: function() {drawBalloonLabel(stickContext, currentValues[0], 10, 150, 'none', BALLOON_COLORS.roll, balloonsDirty);}},
                    {value: parseInt(currentValues[1]), balloon: function() {drawBalloonLabel(stickContext, currentValues[1], 10, 250, 'none', BALLOON_COLORS.pitch, balloonsDirty);}},
                    {value: parseInt(currentValues[2]), balloon: function() {drawBalloonLabel(stickContext, currentValues[2], 10, 350,  'none', BALLOON_COLORS.yaw, balloonsDirty);}}
                );
            }
            // then display them on the chart
            for (const balloon of balloons) {
                balloon.balloon();
            }

            stickContext.restore();
        }
    }
};



pid_tuning.cleanup = function (callback) {
    const self = this;

    self.keepRendering = false;
    if (callback) callback();
};

