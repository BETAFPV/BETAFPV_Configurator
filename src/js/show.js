const show = {};


show.initialize = function (callback) {

    $('#content').load("./src/html/show.html", function () {

        const bar_names = [
            "Roll [A]",
            "Pitch [E]",
            "Yaw [R]",
            "Throttle [T]",
            "AUX 1",
            "AUX 2",
            "AUX 3",
            "AUX 4"
        ];
        const numBars = 8;
        const barContainer = $('.tab-show .bars');
    
        for (let i = 0; i < numBars; i++) {
            let name;
            if (i < bar_names.length) {
                name = bar_names[i];
            } 
    
            barContainer.append('\
                <ul>\
                    <li class="name">' + name + '</li>\
                    <li class="meter">\
                        <div class="meter-bar">\
                            <div class="label"></div>\
                            <div class="fill' + '' + '">\
                                <div class="label"></div>\
                            </div>\
                        </div>\
                    </li>\
                </ul>\
            ');
        }
    
        const meterScale = {
            'min': 800,
            'max': 2200
        };
    
        const meterFillArray = [];
        const meterLabelArray = [];
        $('.meter .fill', barContainer).each(function () {
            meterFillArray.push($(this));
        });
    
        
        $('.meter', barContainer).each(function () {
            meterLabelArray.push($('.label' , this));
        });

        // correct inner label margin on window resize (i don't know how we could do this in css)
        tabresize = function () {
            const containerWidth = $('.meter:first', barContainer).width(),
                labelWidth = $('.meter .label:first', barContainer).width(),
                margin = (containerWidth / 2) - (labelWidth / 2);

            for (let i = 0; i < meterLabelArray.length; i++) {
                meterLabelArray[i].css('margin-left', margin);
            }
        };

        $(window).on('resize', tabresize).resize(); // trigger so labels get correctly aligned on creation



        $('a.refresh').click(function () {

        });

        function update_ui() {
            // update bars with latest data
            for (let i = 0; i < 8; i++) {
                // meterFillArray[i].css('width', (HidConfig.channel_data[i] - meterScale.min) / (meterScale.max - meterScale.min)*100+'%');
                // meterLabelArray[i].text(HidConfig.channel_data[i]);
            }
        }
        let plotUpdateRate;
        const rxRefreshRate = $('select[name="tx_refresh_rate"]');

        rxRefreshRate.change(function () {
            plotUpdateRate = parseInt($(this).val(), 10);

            GUI.interval_remove('receiver_pull');

            GUI.interval_add('receiver_pull', update_ui, plotUpdateRate, true);

            console.log('rate');
        });

        rxRefreshRate.change(); 
        
        callback();
    });
};


show.cleanup = function (callback) {
    if (callback) callback();
};
