
    $.tomCropper = function(object, customOptions) {

        var defaultOptions = {
            allowMove : true,
            allowResize : true,
            allowSelect : true,
            aspectRatio : 0,
            displayPreview : false,
            displaySizeHint : false,
            minSelect : [0, 0],
            minSize : [0, 0],
            maxSize : [0, 0],
            outlineOpacity : 0.5,
            overlayOpacity : 0.5,
            previewBoundary : 90,
            previewFadeOnBlur : 1,
            previewFadeOnFocus : 0.35,
            selectionPosition : [0, 0],
            selectionWidth : 0,
            selectionHeight : 0,

            // Event handler's
            onChange : function() {},
            onSelect : function() {}

        };

        // Set options to default
        var options = defaultOptions;

        // And merge them with the custom options
        setOptions(customOptions);

        // Initialize the image layer
        var $image = $(object);

        // Initialize an image holder
        var $holder = $('<div />')
            .css({
                position : 'relative'
            })
            .width($image.width())
            .height($image.height());

        // Wrap the holder around the image
        $image.wrap($holder)
            .css({
                position : 'absolute'
            });

        // Initialize an overlay layer and place it above the image
        var $overlay = $('<div id="image-crop-overlay" />')
            .css({
                opacity : options.overlayOpacity,
                position : 'absolute'
            })
            .width($image.width())
            .height($image.height())
            .insertAfter($image);

        // Initialize a trigger layer and place it above the overlay layer
        var $trigger = $('<div />')
            .css({
                backgroundColor : '#000000',
                opacity : 0,
                position : 'absolute'
            })
            .width($image.width())
            .height($image.height())
            .insertAfter($overlay);

        // Initialize an outline layer and place it above the trigger layer
        var $outline = $('<div id="image-crop-outline" />')
            .css({
                opacity : options.outlineOpacity,
                position : 'absolute'
            })
            .insertAfter($trigger);

        // Initialize a selection layer and place it above the outline layer
        var $selection = $('<div />')
            .css({
                background : 'url(' + $image.attr('src') + ') no-repeat',
                position : 'absolute'
            })
            .insertAfter($outline);

        // Initialize a background layer of size hint and place it above the selection layer
        var $sizeHintBackground = $('<div id="image-crop-size-hint-background" />')
        .css({
            opacity : 0.35,
            position : 'absolute'
        })
        .insertAfter($selection);

        // Initialize a foreground layer of size hint and place it above the background layer
        var $sizeHintForeground = $('<span id="image-crop-size-hint-foreground" />')
            .css({
                position : 'absolute'
            })
            .insertAfter($sizeHintBackground);

        // Initialize a north/west resize handler and place it above the selection layer
        var $nwResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-nw-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize a north resize handler and place it above the selection layer
        var $nResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-n-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize a north/east resize handler and place it above the selection layer
        var $neResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-ne-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize an west resize handler and place it above the selection layer
        var $wResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-w-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize an east resize handler and place it above the selection layer
        var $eResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-e-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize a south/west resize handler and place it above the selection layer
        var $swResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-sw-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize a south resize handler and place it above the selection layer
        var $sResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-s-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize a south/east resize handler and place it above the selection layer
        var $seResizeHandler = $('<div class="image-crop-resize-handler" id="image-crop-se-resize-handler" />')
            .css({
                opacity : 0.5,
                position : 'absolute'
            })
            .insertAfter($selection);

        // Initialize a preview holder and place it after the outline layer
        var $previewHolder = $('<div id="image-crop-preview-holder" />')
                .css({
                opacity : options.previewFadeOnBlur,
                overflow : 'hidden',
                position : 'absolute'
            })
            .insertAfter($outline);

        // Initialize a preview image and append it to the preview holder
        var $preview = $('<img alt="Crop preview" id="image-crop-preview" />')
            .css({
                position : 'absolute'
            })
            .attr('src', $image.attr('src'))
            .appendTo($previewHolder);

        // Initialize global variables
        var selectionExists,
            selectionOffset = [0, 0],
            selectionOrigin = [0, 0];

        // Verify if the selection size is bigger than the minimum accepted and set the selection existence accordingly
        if (options.selectionWidth > options.minSelect[0] && options.selectionHeight > options.minSelect[1]) {
            selectionExists = true;
        }
        else {
            selectionExists = false;
        }

        // Call the 'updateInterface' function for the first time to initialize the plug-in interface
        updateInterface();

        if (options.allowSelect) {
            // Bind an event handler to the 'mousedown' event of the trigger layer
            $trigger.mousedown(setSelection);
        }

        // Get the current offset of an element
        function getElementOffset(object) {
            var offset = $(object).offset();

            return [offset.left, offset.top];
        };

        // Get the current mouse position relative to the image position
        function getMousePosition(event) {
            var imageOffset = getElementOffset($image);

            var x = event.pageX - imageOffset[0],
                y = event.pageY - imageOffset[1];

            x = (x < 0) ? 0 : (x > $image.width()) ? $image.width() : x;
            y = (y < 0) ? 0 : (y > $image.height()) ? $image.height() : y;

            return [x, y];
        };

        // Update the overlay layer
        function updateOverlayLayer() {
            $overlay.css({
                display : selectionExists ? 'block' : 'none'
            });
        };

        // Update the overlay layer
        function updateOverlayLayer() {
            $overlay.css({
                display : selectionExists ? 'block' : 'none'
            });
        };

        // Update the trigger layer
        function updateTriggerLayer() {
            $trigger.css({
                cursor : options.allowSelect ? 'crosshair' : 'default'
            });
        };

        // Update the selection
        function updateSelection() {
            // Update the outline layer
            $outline.css({
                cursor : 'default',
                display : selectionExists ? 'block' : 'none',
                left : options.selectionPosition[0],
                top : options.selectionPosition[1]
            })
            .width(options.selectionWidth)
            .height(options.selectionHeight);

            // Update the selection layer
            $selection.css({
                backgroundPosition : ( - options.selectionPosition[0] - 1) + 'px ' + ( - options.selectionPosition[1] - 1) + 'px',
                cursor : options.allowMove ? 'move' : 'default',
                display : selectionExists ? 'block' : 'none',
                left : options.selectionPosition[0] + 1,
                top : options.selectionPosition[1] + 1
            })
            .width((options.selectionWidth - 2 > 0) ? (options.selectionWidth - 2) : 0)
            .height((options.selectionHeight - 2 > 0) ? (options.selectionHeight - 2) : 0);
        };

        // Update the cursor type
        function updateCursor(cursorType) {
            $trigger.css({
                    cursor : cursorType
                });

            $outline.css({
                    cursor : cursorType
                });

            $selection.css({
                    cursor : cursorType
                });
        };

        // Update the plug-in's interface
        function updateInterface(sender) {
            switch (sender) {
                case 'setSelection' :
                    updateOverlayLayer();
                    updateSelection();

                    break;
                case 'resizeSelection' :
                    updateSelection();
                    updateCursor('crosshair');

                    break;
                default :
                    updateTriggerLayer();
                    updateOverlayLayer();
                    updateSelection();
            }
        };

        // Set a new selection
        function setSelection(event) {
            // Prevent the default action of the event
            event.preventDefault();

            // Prevent the event from being notified
            event.stopPropagation();

            // Bind an event handler to the 'mousemove' and 'mouseup' events
            $(document).mousemove(resizeSelection).mouseup(releaseSelection);

            // Notify that a selection exists
            selectionExists = true;

            // Reset the selection size
            options.selectionWidth = 0;
            options.selectionHeight = 0;

            // Get the selection origin
            selectionOrigin = getMousePosition(event);

            // And set its position
            options.selectionPosition[0] = selectionOrigin[0];
            options.selectionPosition[1] = selectionOrigin[1];

            // Update only the needed elements of the plug-in interface
            // by specifying the sender of the current call
            updateInterface('setSelection');

        // Resize the current selection
        function resizeSelection(event) {
            // Prevent the default action of the event
            event.preventDefault();

            // Prevent the event from being notified
            event.stopPropagation();

            var mousePosition = getMousePosition(event);

            // Get the selection size
            options.selectionWidth = mousePosition[0] - selectionOrigin[0];
            options.selectionHeight = mousePosition[1] - selectionOrigin[1];

            if (options.selectionWidth < 0) {
                options.selectionWidth = Math.abs(options.selectionWidth);
                options.selectionPosition[0] = selectionOrigin[0] - options.selectionWidth;
            } else
                options.selectionPosition[0] = selectionOrigin[0];

            if (options.selectionHeight < 0) {
                options.selectionHeight = Math.abs(options.selectionHeight);
                options.selectionPosition[1] = selectionOrigin[1] - options.selectionHeight;
            } else
                options.selectionPosition[1] = selectionOrigin[1];

            // Update only the needed elements of the plug-in interface
            // by specifying the sender of the current call
            updateInterface('resizeSelection');
        };

        // Release the current selection
        function releaseSelection(event) {
            // Prevent the default action of the event
            event.preventDefault();

            // Prevent the event from being notified
            event.stopPropagation();

            // Unbind the event handler to the 'mousemove' event
            $(document).unbind('mousemove');

            // Unbind the event handler to the 'mouseup' event
            $(document).unbind('mouseup');

            // Update the selection origin
            selectionOrigin[0] = options.selectionPosition[0];
            selectionOrigin[1] = options.selectionPosition[1];

            // Verify if the selection size is bigger than the minimum accepted
            // and set the selection existence accordingly
            if (options.selectionWidth > options.minSelect[0] &&
                options.selectionHeight > options.minSelect[1])
                selectionExists = true;
            else
                selectionExists = false;

            // Update only the needed elements of the plug-in interface
            // by specifying the sender of the current call
            updateInterface('releaseSelection');
        };




        // Merge current options with the custom option
        function setOptions(customOptions) {
            options = $.extend(options, customOptions);
        };
    };

    $.fn.tomCropper = function(customOptions) {
        //Iterate over each object
        this.each(function() {
            var currentObject = this,
            image = new Image();

            // attach imageCrop when the object is loaded
            image.onload = function() {
                $.tomCropper(currentObject, customOptions);
            };

            // Reset the src because cached images don't fire load sometimes
            image.src = currentObject.src;
        });

        return this;
    };
}) (jQuery);