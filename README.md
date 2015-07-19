# Selectonic
[![Build Status](https://travis-ci.org/anovi/selectonic.png?branch=master)](https://travis-ci.org/anovi/selectonic)

jQuery (Zepto) based plugin for making any list of items selectable by mouse and keyboard. It could be usefull in webapp where are different widgets like menus, dropdowns with keyboard input, lists with multiple selection and so on. It maybe too bold for just a simple menu in one place.

**Features**:
- Single or multiple selection (uses CSS-classes);
- Keyboard input like in classic filemanagers;
- Possibility to set handle – elements for selecting items;
- Auto-scrolling list's element and window;
- And other configurable stuff.

See examples on [demo page](http://anovi.github.io/selectonic/ "Selectonic — jQuery plugin").

## Getting started
Download the [production version][min] (_minified_) or the [development version][max].

[min]: https://raw.github.com/anovi/selectonic/master/dist/selectonic.min.js
[max]: https://raw.github.com/anovi/selectonic/master/dist/selectonic.js

…or you could install it by Bower:
```
bower install selectonic
```

Use it like any jQuery (Zepto) plugin:
```javascript
$(".itemsList").selectonic({
	multi: true,
    mouseMode: "standard",
    keyboard: true,
    select: function(event, ui) {
        // do something cool, for expample enable actions buttons
    },
    unselectAll: function(event, ui) {
        // …and disable actions buttons
    }
});
```

Do not forget some css-styling:
```css
.j-selected {
	color: #FFFFFF;
	background-color: #2979d1;
}
```


## Options

<table>
	
	<thead>
		<tr>
			<th>Option</th>
			<th>Description</th>
			<th>Type</th>
			<th>Default</th>
		</tr>
	</thead>

	<tbody>
		<tr>
			<td><strong>multi</strong></td>
			<td>User can select many items in a list.</td>
			<td>Boolean</td>
			<td>true</td>
		</tr>
		<tr>
			<td><strong>filter</strong></td>
			<td>Matches descendant elements, that can be selected.</td>
			<td>String</td>
			<td>"* &gt;"</td>
		</tr>
		<tr>
			<th colspan="4">MOUSE</th>
		</tr>
		<tr>
			<td><strong>mouseMode</strong></td>
			<td>
				<table>
					<tr>
						<td><code>standard</code></td>
						<td>Mouse click selects targeted item and clears other selection in a list; to add/remove item to selection user needs holds <strong>ctrl</strong> and <strong>shift</strong> to select range of items (file manager style);</td>
					</tr>
					<tr>
						<td><code>mouseup</code></td>
						<td>Selects item which is under mouse cursor when user releases mouse button. It doesn't matter where mouse button was pressed. It nicely combines with <code>focusOnhover: true</code> option and single selection.</td>
					</tr>
					<tr>
						<td><code>toggle</code></td>
						<td>Click selects or unselects items, depends from their states (like group of checkboxes);</td>
					</tr>
				</table>
			</td>
			<td>String</td>
			<td>"standard"</td>
		</tr>
		<tr>
			<td><strong>focusBlur</strong></td>
			<td>List clears focus when user clicks outside of the list.</td>
			<td>Boolean</td>
			<td>false</td>
		</tr>
		<tr>
			<td><strong>selectionBlur</strong></td>
			<td>List clears selection when user clicks outside of the list.</td>
			<td>Boolean</td>
			<td>false</td>
		</tr>
		<tr>
			<td><strong>focusOnHover</strong></td>
			<td>Focus always under cursor when mouse moves through the list. If cursor go out of the list and option <code>focusBlur: true</code> then focus clears.</td>
			<td>Boolean</td>
			<td>false</td>
		</tr>
		<tr>
			<td><strong>handle</strong></td>
			<td>Matches descendant elements, that serves as clickable areas inside each item to select/unselect these items. I do not recommend to use <code>&lt;input type="checkbox"&gt;</code> for that purpose. If you need something looks like checkbox - make a custom one with html/css.</td>
			<td>String</td>
			<td>null</td>
		</tr>
		<tr>
			<td><strong>textSelection</strong></td>
			<td>Allows text selection in the list. It could be annoying when you selecting items with <strong>shift+click</strong>.</td>
			<td>Boolean</td>
			<td>false</td>
		</tr>
		<tr>
			<th colspan="4">KEYBOARD</th>
		</tr>
		<tr>
			<td><strong>keyboard</strong></td>
			<td>Possibility to use keys <strong>Up</strong>, <strong>Down</strong> and <strong>Home</strong>, <strong>End</strong>, <strong>PageUp</strong>, <strong>PageDown</strong> to move list's focus, select range of items by holding <strong>shift</strong> and select all items by pressing <strong>ctrl+A</strong>.</td>
			<td>Boolean</td>
			<td>false</td>
		</tr>
		<tr>
			<td><strong>keyboardMode</strong></td>
			<td>
				<table>
					<tr>
						<td><code>select</code></td>
						<td>pressing keys up/down selects targeted item and clears other selection in a list; to add/remove item to selection user needs holds <strong>shift</strong> key (file manager style);</td>
					</tr>
					<tr>
						<td><code>toggle</code></td>
						<td>pressing keys up/down and other only moves list's focus, to select/unselect items user needs press <strong>space</strong>;</td>
					</tr>
				</table>
			</td>
			<td>String</td>
			<td>"select"</td>
		</tr>
		<tr>
			<td><strong>autoScroll</strong></td>
			<td>Scrollable element. When user moves list's focus by keyboard – plugin calculates elements's scroll position in a way that focused item is always visible. Accepts values: <br>
				<table>
					<tr>
						<td><code>true</code></td>
						<td>list's element is scrollable;</td>
					</tr>
					<tr>
						<td><code>false</code></td>
						<td>no scrollable element except the window;</td>
					</tr>
					<tr>
						<td><code>selector (String)</code></td>
						<td>another element that is not list's element.</td>
					</tr>
				</table>
			</td>
			<td>Boolean or String</td>
			<td>true</td>
		</tr>
		<tr>
			<td><strong>loop</strong></td>
			<td>If <code>keyboard: true</code> and focused element is last in a list, pressing key <strong>Down</strong> set focus to first element of the list; oppositely with <strong>Up</strong> key, when focus on first element.</td>
			<td>Boolean</td>
			<td>false</td>
		</tr>
		<tr>
			<td><strong>preventInputs</strong></td>
			<td>Prevents any reactions to keyboard events when they triggers from a text input or textarea.</td>
			<td>Boolean</td>
			<td>true</td>
		</tr>
		<tr>
			<th colspan="4">HTML CLASSES</th>
		</tr>
		<tr>
			<td><strong>listClass</strong></td>
			<td>HTML class for selectable list.</td>
			<td>String</td>
			<td>"j-selectable"</td>
		</tr>
		<tr>
			<td><strong>focusClass</strong></td>
			<td>HTML class for focused element.</td>
			<td>String</td>
			<td>"j-focused"</td>
		</tr>
		<tr>
			<td><strong>selectedClass</strong></td>
			<td>HTML class for selected element.</td>
			<td>String</td>
			<td>"j-selected"</td>
		</tr>
		<tr>
			<td><strong>disabledClass</strong></td>
			<td>HTML class for selectable list which is disabled.</td>
			<td>String</td>
			<td>"j-disabled"</td>
		</tr>
		<tr>
			<th colspan="4">CALLBACKS</th>
		</tr>
		<tr>
			<td>
				<strong>before</strong>, <strong>select</strong>, <strong>unselect</strong>, <strong>unselectAll</strong>, <strong>focusLost</strong>, <strong>stop</strong>, <strong>create</strong>, <strong>destroy</strong>
			</td>
			<td>Callback functions, that described in the next section.</td>
			<td>Function</td>
			<td>null</td>
		</tr>
	</tbody>
</table>

### Set default options
Default options object accessible from outside by `$.fn.selectonic.defaults`.


## Callbacks (Events)
Callback functions except `create` and `destroy` may get arguments:
* `event` — event object from mouse or keyboard handlers.
* `ui` — object that contains properties with HTML elements:
	* `target` — link to an element, that has clicked or chosen by keyboard.
	* `focus` — link to an element that has been a target previously;
	* `items` — jquery collection of changed items – it could differ from event to event. Look at a table below.

Callback functions in order which they are called and with arguments which they receives:
<table>
	<thead>
		<tr>
			<td><strong>Callback</strong></td>
			<td><strong>event</strong></td>
			<td><strong>ui.target</strong></td>
			<td><strong>ui.focus</strong></td>
			<td><strong>ui.items</strong></td>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>
				<strong>create</strong> — calls after initialization.
			</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>before</strong> — calls in every work cycle before any changes.
			</td>
			<td>YES</td>
			<td>if exists</td>
			<td>if exists</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>unselect</strong> — one or more elements has been unselected.
			</td>
			<td>YES</td>
			<td>if exists</td>
			<td>if exists</td>
			<td>jquery collection of unselected elements</td>
		</tr>
		<tr>
			<td>
				<strong>select</strong> — when one or more elements has been selected.
			</td>
			<td>YES</td>
			<td>YES</td>
			<td>if exists</td>
			<td>jquery collection of selected elements</td>
		</tr>
		<tr>
			<td>
				<strong>unselectAll</strong> — when all elements in the list has been unselected.
			</td>
			<td>YES</td>
			<td>if exists</td>
			<td>if exists</td>
			<td>jquery collection of unselected elements</td>
		</tr>
		<tr>
			<td>
				<strong>focusLost</strong> — when the focus of the list is lost.
			</td>
			<td>YES</td>
			<td>—</td>
			<td>YES. Focus will be removed after this callback.</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>stop</strong> — calls in the end of every work cycle.
			</td>
			<td>YES</td>
			<td>if exists</td>
			<td>if exists – but it will already be a new focus.</td>
			<td>all changed items (if they were)</td>
		</tr>
		<tr>
			<td>
				<strong>destroy</strong> — calls before plugin's destroy.
			</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
			<td>—</td>
		</tr>
	</tbody>
</table>


Link `this` inside callbacks refers to list's initial element wrapped in jQuery, so you may call any method inside callbacks functions like `this.selectonic("disable");`.


## Methods
Calling a method:
```javascript
$(elem).selectonic("getSelected");
```

<table width="100%">
	<tr>
		<th valign="top" width="120px" align="left">Method</th>
		<th valign="top" align="left">Description</th>
	</tr>
	<tr>
		<td valign="top"><strong>isEnabled</strong></td>
		<td valign="top">Returns <code>true</code> if list is in enabled state.</td>
	</tr>
	<tr>
		<td valign="top"><strong>blur</strong></td>
		<td valign="top">Clears focus and selection of the list, if it's permitted by list's options.</td>
	</tr>
	<tr>
		<td valign="top"><strong>getSelected</strong></td>
		<td valign="top">Gets a jQuery collection of selected elements.</td>
	</tr>
	<tr>
		<td valign="top"><strong>getSelectedId</strong></td>
		<td valign="top">Gets an array of id's of selected elements.</td>
	</tr>
	<tr>
		<td valign="top"><strong>scroll</strong></td>
		<td valign="top">If a list has focused element and list is scrollable, it will recalculate list's scroll position in a way that focused element will be in a viewport.</td>
	</tr>
	<tr>
		<td valign="top"><strong>disable</strong></td>
		<td valign="top">Disables selectable list, but keeps data and saves it state.</td>
	</tr>
	<tr>
		<td valign="top"><strong>enable</strong></td>
		<td valign="top">Turns on disabled plugin.</td>
	</tr>
	<tr>
		<td valign="top"><strong>refresh</strong></td>
		<td valign="top">Refreshes plugin data. That is necessary when some items in a list has been removed.</td>
	</tr>
	<tr>
		<td valign="top"><strong>destroy</strong></td>
		<td valign="top">Detaches handlers, clears data and removes HTML-classes.</td>
	</tr>
</table>

### option
Gets or sets one or more options.

**Getter**:
```javascript
var mouseMode = $(elem).selectonic("option", "mouseMode");
```
…or you can get whole options object:
```javascript
var options = $(elem).selectonic("option");
```
**Setter**:
```javascript
$(elem).selectonic("option", "mouseMode", "toggle");
```
or
```javascript
$(elem).selectonic("option", {
    loop: true,
    mouseMode: "mouseup"
});
```

### cancel
Cancel current changes in a list or prevent it, if called in `before` callback. Method can be called only inside callback function:
```javascript
elem.selectonic({
    stop: function(event, ui) {
        if( condition ) {
            this.selectonic("cancel"); // inside callback
        }
    }
});
```

### focus
Gets focused element or `null` or sets new focused element.

**Getter:**
```javascript
$(elem).selectonic("focus"); //returns focus or null if there is no one
```
**Setter:**
```javascript
$(elem).selectonic("focus", elem); //if elem is a list's item it will be focused
```
```javascript
$(elem).selectonic("focus", 0); //first element in the list
```

### select
If in any scenario you need auto-select items (select first item at the beginning) then you need pass element to `select` method:
```javascript
$(elem).selectonic("select", $(".someElements"));
```
or selector:
```javascript
$(elem).selectonic("select", ":even");
```
```javascript
$(elem).selectonic("select", "li:eq(3)");
```
You also could select an item by passing its number:
```javascript
$(elem).selectonic("select", 0);
```
`select` method only selects passed items but doesn't clear selection from others items, if they are. Method doesn't change focused element.

### unselect
Unselects passed items or all items if no one has been passed:
```javascript
$(elem).selectonic("unselect", $(".someElements")); //clear selection for these items
$(elem).selectonic("unselect"); //clear selection for all items
```
Method doesn't change focused element.

## Compatibility
- Requires **jQuery 1.7+** or **Zepto**
- Tested in Firefox, Chrome, Safari, Opera, IE8+

## [Release notes](https://github.com/anovi/selectonic/releases)
