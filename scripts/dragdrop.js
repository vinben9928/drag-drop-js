//Copyright © Vincent Bengtsson 2018
//All rights reserved.

var ___dragDropDraggedElement = null;

function makeDraggable(element, onDrop, onBeginDrag) {
    if(element == null) { throw "Element must be a valid HTML element!"; }
    if(onDrop == null || typeof onDrop !== "function") { throw "onDrop must be a callback function!"; }

    //Subscribe to mouse down events.
    element.addEventListener("mousedown", function(event) { element_MouseDown(event, element, onDrop, onBeginDrag); });
}

function element_MouseDown(event, element, onDrop, onBeginDrag) {
    if(event.button != 0 || ___dragDropDraggedElement != null) { return; }
    if(onBeginDrag != null && onBeginDrag(event) == true) { return; }

    //Get element dimensions and absolute position.
    var pos = $(element).offset();
    var width = $(element).outerWidth();
    var height = $(element).outerHeight();

    //Clone original element and set the clone's position and dimensions to that of the original element.
    var dragElement = $(element.cloneNode(true));
    dragElement.css("position", "absolute");
    dragElement.css("left",     pos.left + "px");
    dragElement.css("top",      pos.top  + "px");
    dragElement.css("width",    width    + "px");
    dragElement.css("height",   height   + "px");

    //Make it non-selectable.
    dragElement.css("-webkit-touch-callout", "none"); /* iOS Safari */
    dragElement.css("-webkit-user-select",   "none"); /* Safari */
    dragElement.css("-khtml-user-select",    "none"); /* Konqueror HTML */
    dragElement.css("-moz-user-select",      "none"); /* Firefox */
    dragElement.css("-ms-user-select",       "none"); /* Internet Explorer/Edge */
    dragElement.css("user-select",           "none"); /* Non-prefixed version, currently
                                                         supported by Chrome and Opera */

    //Append the clone directly to the body.
    document.body.appendChild(dragElement[0]);

    //Create mouse event handlers.
    var mouseMoveHandler = function(mevent) { document_MouseMove(mevent, dragElement[0], event.pageX - pos.left, event.pageY - pos.top); };
    var mouseUpHandler = function(mevent) {
        if(mevent.button != 0) { return; }
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", mouseUpHandler);
        document_MouseUp(mevent, dragElement[0], onDrop);
    };

    //Subscribe to mouse events.
    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);

    //Hide original element.
    ___dragDropDraggedElement = element;
    $(___dragDropDraggedElement).hide();

    event.stopPropagation();
}

function document_MouseMove(event, dragElement, clickX, clickY) {
    $(dragElement).css("left", (event.pageX - clickX) + "px");
    $(dragElement).css("top",  (event.pageY - clickY) + "px");
    event.stopPropagation();
}

function document_MouseUp(event, dragElement, onDrop) {
    //Show the original element.
    var element = ___dragDropDraggedElement;
    ___dragDropDraggedElement = null;
    $(element).show();

    //Remove cloned element.
    document.body.removeChild(dragElement);

    //Call onDrop callback.
    onDrop(event, element, document.elementFromPoint(event.clientX, event.clientY));

    event.stopPropagation();
}