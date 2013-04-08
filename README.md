# MultiSelectable
jQuery-plugin for making selectable lists by mouse and keyboard, configurable with options, methods and callbacks.  
[Demo page](http://anovi.github.io/multiSelectable/ "MultiSelectable — jQuery plugin") 

Author: Alexey Novichkov  
Version: 1.0

## Usage
```javascript
$(".selector").multiSelectable({
    mouseMode: "select",
    keyboardInput: true,
    select: function(event, ui) {
        // do something
    }
});
```

## Options
### multi
*Type: boolean, Default: true*  
User can select many items in a list.

### focusBlur
*Type: boolean, Default: false*  
Plugin lose focus when user clicks outside of the list.

### selectionBlur
*Type: boolean,  default: false*  
plugin clear selection when user clicks outside of the list;

### keyboardInput
*Type: boolean, Default: false*  
Possibility to use keys **Up**, **Down** and **Home**, **End** to move cursor (focus), select several items by holding **shift** and select all items by pressing **ctrl+A**.

### loop
*Type: boolean, Default: false*  
If *keyboardInput* is *true* and focused element is last in a list, pressing key **Down** set focus to begin of the list; same with key **Up** – when focus on first item of the list.

### handle
*Type: selector, Default: null*  
Match child elemets, that will be served as clickable area inside each item to select/unselect these items.

### mouseMode
*Type: string, Default: "select"*  
Mode for toggle selection on item:
* select – mouse click select target item and clear other selection in a list; to add/remove element to selection user need holding **ctrl** key (file manager style);
* toggle – mouse click select/unselect item (like group of checkboxes);

### event
*Type: string, Default: "mousedown"*  
Which event plugin will react for: 
* mousedown – plugin will react when user pushes down on right mouse button.
* click – plugin will react when user clicks (press and release) on left mouse button.
* hybrid – plugin will select item when user pushes down mouse button on an element, that is not selected, but user must press and release mouse button to unselect selected item. It can be used, for example, when there is another plugin for dragging selected items.

### filter
*Type: selector,  Default: "* >"*   
Match child elements, that can be selected.

### wrapperClass
*Type: selector,  Default: "j-multiSelectable"*  
name of class for element which plugin attached to.

### focusClass
*Type: selector,  Default: "j-multiSelectable-focused"*  
Name of class on focused element.

### selectedClass
*Type: selector,  Default: "j-multiSelectable-selected"*  
Name of class on selected element.

### disabledClass
*Type: selector,  Default: "j-multiSelectable-disabled"*  
Name of class on plugin's element which in disabled state.

## Methods
Example of a method call:
```javascript
$(elem).multiSelectable("getSelected");
```

### blur
Clear selection in a list.

### getSelect
Get array of selected elements.

### getSelectedId
Get array of id's of selected elements.

### disable
Disable plugin, but keep data and save it state.

### enable
Turn on disabled plugin.

### refresh
Refresh plugin data. That is necessary when some items in list was removed.

### option
Get or set one or more options.  
**Getter**:
```javascript
$(elem).multiSelectable("option", "mouseMode");
```
or you can get whole options object:
```javascript
$(elem).multiSelectable("option");
```
**Setter**:
```javascript
$(elem).multiSelectable("option", "mouseMode", "toggle")
```
or
```javascript
$(elem).multiSelectable("option", {
    loop: true,
    mouseMode: "select"
})
```

### cancel
Cancel last changes in a list or prevent it, if called in *beforeSelect* callback. Method can be call only inside callback functions:
```javascript
elem.multiSelectable({
    stop: function(event, ui) {
        if( condition ) {
            this.multiSelectable("cancel"); // inside callback
        }
    }
});
```

### Select method
You can select items by plugin's interface. Plugin accept elements:
```javascript
$(elem).multiSelectable( $(".someElements")  );
```
or selector:
```javascript
$(elem).multiSelectable(":even");
```
```javascript
$(elem).multiSelectable("li:eq(3)");
```

### destroy
Detach handlers, clear data and remove plugin's classes.

## Callbacks (Events)
Callback functions and arguments they receives:  
* event — event object from mouse or keyboard handlers.
* ui — object that contains properties with DOM elements:
* ui.target — link to target element, that was clicked.
	* ui.focus — link to focused element.
	* ui.items — jquery collection of changed elements – it differ from event to event.

<table>
	<thead>
		<tr>
			<td>
				Callback function
			</td></span>
			<td>event</td>
			<td>ui.target</td>
			<td>ui.focus</td>
			<td>ui.items</td>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<strong>beforeSelect</strong> — calls in every work cycle before any changes will performed
			</td>
			<td>event</td>
			<td>if exist</td>
			<td>if exist</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>select</strong> — when one or several elements is selected
			</td>
			<td>event</td>
			<td>target element</td>
			<td>if exist</td>
			<td>jquery collection of elements that was selected</td>
		</tr>
		<tr>
			<td>
				<strong>unSelect</strong> — one or several elements has been unselected
			</td>
			<td>event</td>
			<td>if exist</td>
			<td>if exist</td>
			<td>jquery collection of elements that was unselected</td>
		</tr>
		<tr>
			<td>
				<strong>unSelectAll</strong> — when all elements in list is unselected
			</td>
			<td>event</td>
			<td>if exist</td>
			<td>if exist</td>
			<td>jquery collection of elements that was unselected</td>
		</tr>
		<tr>
			<td>
				<strong>focusLost</strong> — when the focus of list is lost
			</td>
			<td>event</td>
			<td>—</td>
			<td>Link on focused element. Link will be deleted after this callback.</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>stop</strong> — calls in the end of every work cycle
			</td>
			<td>event</td>
			<td>if exist</td>
			<td>if exist</td>
			<td>all changed items (if they was)</td>
		</tr>
		<tr>
			<td>
				<strong>create</strong> — calls after initialization
			</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>destroy</strong> — calls before plugin will be destroyed
			</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
		</tr>
	</tbody>
</table>

## Known issues
If lists container has a scrollbar and located inside (primary parent) element with **display:table-row** there is a problem with calculation of scroll position.

## Compatibility
Requires jQuery 1.7+  
Tested in Firefox, Chrome, Safari, Opera, IE8+
