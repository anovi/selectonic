# Selectonic
[![Build Status](https://travis-ci.org/anovi/selectonic.png?branch=master)](https://travis-ci.org/anovi/selectonic)

jQuery based plugin for making any list of items selectable by mouse and keyboard. It could be usefull in webapp where are different widgets like menus, dropdowns with keyboard input, lists with multiple selection and so on. It maybe too bold for just a simple menu in one place.

**Features**:
- Single or multiple selection (uses CSS-classes);
- Keyboard input like in classic filemanagers;
- Possibility to set handle – checkbox or other element for selecting items;
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

Use it like any jQuery plugin:
```javascript
$(".itemsList").selectonic({
	multi: true,
    mouseMode: "select",
    keyboard: true,
    select: function(event, ui) {
        // do something cool, for expample enable actions buttons
    }
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

Option | Description | Type | Default
--- | --- | --- | ---
**multi** | User can select many items in a list. | Boolean | true
**filter** | Matches child elements, that can be selected. | String | "* >"
**focusBlur** | List loses focus when user clicks outside of the list. | Boolean | false
**selectionBlur** | List clears selection when user clicks outside of the list. | Boolean | false
**mouseMode** | `select` – mouse click selects target item and clear other selection in a list; to add/remove item to selection user need holding **ctrl** key (file manager style);<br>`toggle` – mouse click to select/unselect items (like group of checkboxes); | String | "select"
**event** | `mousedown` – item will be selected when user push on left mouse button. <br>`click` – item will be selected when user click (press and release) on left mouse button. <br>`hybrid` – unselected items will react on mousedown, but selected items will react on click (press and release). It can be usefull when there is another plugin, for example to dragging selected items. | String | "mousedown"
**handle** | Matches child elemets, that will be served as clickable area inside each item to select/unselect these items. | String | null
**textSelection** | Allow text selection in a list's element. It could be annoying when you selecting items with `shift`+`click`. | Boolean | false
**keyboard** | Possibility to use keys **Up**, **Down** and **Home**, **End** to move cursor (focus), select range of items by holding **shift** and select all items by pressing **ctrl+A**. | Boolean | false
**autoScroll** | Scrollable element. When user moves cursor by keys **Up**, **Down**, **Home**, **End** – plugin calculates elements's scroll position in a way that focused item is always visible. Accepts values: <br>`true` – list's element is scrollable; <br>`false` – no scrollable element; <br>`selector (String)` – custom element that is not list's element. | Boolean or String | true
**loop** | If `keyboard: true` and focused element is last in a list, pressing key **Down** set focus to first element of the list; oppositely with **Up** key, when focus on a first element. | Boolean | false
**preventInputs** | Prevent any reactions on keyboard input when focus is on a text input or textarea.  | Boolean | true |
**listClass** | HTML class for selectable list. | String | "j-selectable"
**focusClass** | HTML class for focused element. | String | "j-focused"
**selectedClass** | HTML class for selected element. | String | "j-selected"
**disabledClass** | HTML class for selectable list which is disabled. | String | "j-disabled"
**before**, **select**, **unselect**, **unselectAll**, **focusLost**, **stop**, **create**, **destroy** | Callback functions, that described in the next section. | Function | null


## Callbacks (Events)
Callback functions except `create` and `destroy` may get arguments:
* `event` — event object from mouse or keyboard handlers.
* `ui` — object that contains properties with HTML elements:
	* `target` — link to targeted element, that has clicked or chosen by keyboard.
	* `focus` — link to focused element.
	* `items` — jquery collection of changed items – it could differ from event to event. Look at a table below.

Callback functions and arguments that they receives:
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
			<td>if exist</td>
			<td>if exist</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>select</strong> — when one or more elements has been selected.
			</td>
			<td>YES</td>
			<td>YES</td>
			<td>YES</td>
			<td>jquery collection of selected elements</td>
		</tr>
		<tr>
			<td>
				<strong>unselect</strong> — one or more elements has been unselected.
			</td>
			<td>YES</td>
			<td>if exist</td>
			<td>if exist</td>
			<td>jquery collection of unselected elements</td>
		</tr>
		<tr>
			<td>
				<strong>unselectAll</strong> — when all elements in the list has been unselected.
			</td>
			<td>YES</td>
			<td>if exist</td>
			<td>if exist</td>
			<td>jquery collection of unselected elements</td>
		</tr>
		<tr>
			<td>
				<strong>focusLost</strong> — when the focus of the list is lost.
			</td>
			<td>YES</td>
			<td>—</td>
			<td>YES. Link will be removed after this callback.</td>
			<td>—</td>
		</tr>
		<tr>
			<td>
				<strong>stop</strong> — calls in the end of every work cycle.
			</td>
			<td>YES</td>
			<td>if exist</td>
			<td>if exist</td>
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


Link `this` inside callbacks refer to list's initial element wrapped in jQuery, so you may call any method inside callbacks functions like `this.selectonic("disable");`.


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
		<td valign="top">Clears selection and focus in a list.</td>
	</tr>
	<tr>
		<td valign="top"><strong>getSelected</strong></td>
		<td valign="top">Get jQuery collection of selected elements.</td>
	</tr>
	<tr>
		<td valign="top"><strong>getSelectedId</strong></td>
		<td valign="top">Get array of id's of selected elements.</td>
	</tr>
	<tr>
		<td valign="top"><strong>getFocused</strong></td>
		<td valign="top">Get focused element or <code>null</code> if there is no one.</td>
	</tr>
	<tr>
		<td valign="top"><strong>disable</strong></td>
		<td valign="top">Disable selectable list, but keep data and save it state.</td>
	</tr>
	<tr>
		<td valign="top"><strong>enable</strong></td>
		<td valign="top">Turn on disabled plugin.</td>
	</tr>
	<tr>
		<td valign="top"><strong>refresh</strong></td>
		<td valign="top">Refresh plugin data. That is necessary when some items in a list has been removed.</td>
	</tr>
	<tr>
		<td valign="top"><strong>destroy</strong></td>
		<td valign="top">Detach handlers, clear data and remove plugin's classes.</td>
	</tr>
</table>

### option
Get or set one or more options.

**Getter**:
```javascript
$(elem).selectonic("option", "mouseMode");
```
…or you can get whole options object:
```javascript
$(elem).selectonic("option");
```
**Setter**:
```javascript
$(elem).selectonic("option", "mouseMode", "toggle");
```
or
```javascript
$(elem).selectonic("option", {
    loop: true,
    mouseMode: "select"
});
```

### cancel
Cancel current changes in a list or prevent it, if called in *before* callback. Method can be called only inside callback functions:
```javascript
elem.selectonic({
    stop: function(event, ui) {
        if( condition ) {
            this.selectonic("cancel"); // inside callback
        }
    }
});
```


### Selecting items by API
If in any scenario you need auto-select items (select first item at the beginning) then you need pass elements to plugins interface:
```javascript
$(elem).selectonic( $(".someElements")  );
```
or selector:
```javascript
$(elem).selectonic(":even");
```
```javascript
$(elem).selectonic("li:eq(3)");
```


## Compatibility
Requires jQuery 1.7+  
Tested in Firefox, Chrome, Safari, Opera, IE8+
