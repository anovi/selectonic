# MultiSelectable
jQuery-plugin for making selectable lists by mouse and keyboard, configurable with options, methods and callbacks.

Author: Alexey Novichkov
Varsion: 1.0

## Usage
```javascript
$(".selecter").multiSelectable({
    mouseMode: "select",
    keyboardInput: true,
    select: function(event, ui) {
        // do something
    }
});
```

## Options
**multi** – (boolean) user can select many items in a list;

**focusBlur** – (boolean) plugin lose focus when user clicks outside of the list;

**selectionBlur** – (boolean) plugin clear selection when user clicks outside of the list;

**keyboardInput** – (boolean) possibility to use keys *↓* *↑* and *Home* *End* to move cursor (focus), select several items by holding *shift* and select all items by pressing *ctrl + a*;

**loop** – (boolean) if *keyboardInput* is *true* and focused element is last in a list, pressing key *↓* set focus to begin of the list; same with key *↑* – when focus on first item of the list;

**handler** – (selector) match child elemets, that will be served as clickable area inside each item to select/unselect these items.

**mouseMode** – Mode for toggle selection on item:
* select – mouse click select target item and clear other selection in a list; to add/remove element to selection user need holding *ctrl* key (file manager style);
* toggle – mouse click select/unselect item (like group of checkboxes);

**event** – What event plugin will react for: 
* mousedown – plugin will react when user pushes down on right mouse button.
* click – plugin will react when user clicks(press and release) on left mouse button.
* hybrid – plugin will select item when user pushes down mouse button on an element, that is not selected, but user must press and release mouse button to unselect selected item. It can be used, for example, when there is another plugin for dragging selected items.

**filter** – (selector) match child elements, that can be selected ( default = "* >" );

**wrapperClass** – name of class for element which plugin attached to ( default = "j-multiSelectable" ).

**focusClass** – name of class on focused element ( default = "j-multiSelectable-focused" ).

**selectedClass** – name of class on selected element ( default = "j-multiSelectable-selected" ).

**disabledClass** – name of class on plugin's element which in disabled state ( default = "j-multiSelectable-disabled" ).

## Methods
Example of a method call:
```javascript
$(elem).multiSelectable("getSelected");
```

**destroy**
Detach handlers, clear data and remove plugin's classes.

**blur**
Clear selection in a list.

**getSelect**
Get array of selected elements.

**getSelectedId**
Get array of id's of selected elements.

**disable**
Disable plugin, but keep data and save it state.

**enable**
Turn on disabled plugin.

**refresh**
Refresh plugin data. That is necessary when some items in list was removed.

**option**
Get or set one or more options.

Getter:
```javascript
$(elem).multiSelectable("option", "mouseMode");
```
Setter:
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

**cancel**
Cancel last changes in a list or prevent it, if called in *beforeSelect* callback. Method can be call only inside callback functions:
```javascript
elem.multiSelectable({
    stop: function(event, ui) {
        if( condition ) {
            **this.multiSelectable("cancel");**
        }
    }
});
```

	**Select method**
You can select items by plugin's interface. Plugin accept selector or element:
```javascript
$(elem).multiSelectable($someElements);
```
```javascript
$(elem).multiSelectable(":even");
```
```javascript
$(elem).multiSelectable(":eq(3)");
```

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
								<span class="g-option">beforeSelect</span>
								<span class="options-description">— calls in every work cycle before any changes will performed</span>
							</td>
							<td>event</td>
							<td>if exist</td>
							<td>if exist</td>
							<td>—</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">select</span>
								<span class="options-description">— when one or several elements is selected</span>
							</td>
							<td>event</td>
							<td>target element</td>
							<td>if exist</td>
							<td>jquery collection of elements that was selected</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">unSelect</span>
								<span class="options-description">— one or several elements has been unselected</span>
							</td>
							<td>event</td>
							<td>if exist</td>
							<td>if exist</td>
							<td>jquery collection of elements that was unselected</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">unSelectAll</span>
								<span class="options-description">— when all elements in list is unselected</span>
							</td>
							<td>event</td>
							<td>if exist</td>
							<td>if exist</td>
							<td>jquery collection of elements that was unselected</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">focusLost</span>
								<span class="options-description">— when the focus of list is lost</span>
							</td>
							<td>event</td>
							<td>—</td>
							<td>Link on focused element. Link will be deleted after this callback.</td>
							<td>—</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">stop</span>
								<span class="options-description">— calls in the end of every work cycle</span>
							</td>
							<td>event</td>
							<td>if exist</td>
							<td>if exist</td>
							<td>all changed items (if they was)</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">create</span>
								<span class="options-description">— calls after initialization</span>
							</td>
							<td>—</td>
							<td>—</td>
							<td>—</td>
							<td>—</td>
						</tr>
						<tr>
							<td>
								<span class="g-option">destroy</span>
								<span class="options-description">— calls before plugin will be destroyed</span>
							</td>
							<td>—</td>
							<td>—</td>
							<td>—</td>
							<td>—</td>
						</tr>
					</tbody>
				</table>

## Known issues
If lists container has scrollbar and located inside (primary parent) element with *display:table-row* there is a problem with calculation of scroll position.

## Compatibility
Requires jQuery 1.7+
Tested in Firefox, Chrome, Safari, Opera, IE8+

## License
Released under the MIT License. Feel free to use it in personal and commercial projects.