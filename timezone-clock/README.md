# Interactive Analog Time Zone Map

A React/TypeScript application visualizing the current time across time zones using an interactive analog clock and a dynamic time zone map. The hour hand is draggable to explore different time zones, which highlights the corresponding time zones on the map.

## Features

* Main analog clock that displays the current device time with an hour and minute hands. The hour hand can be dragged to adjust the hour. The corresponding time zone is highlighted.

* Interactive time zone map that highlights the currently selected time zone on a world map. Non-selected time zones are desaturated, the active zone is brightened and highlighted with an outline.

* Two auxillary clocks showing time in the next (`+1`) and the previous (`-1`) time zones relative to the main clock. Automatically updated when the main clock time is changed.

## Tech Stack

* React

* TypeScript

* NPM