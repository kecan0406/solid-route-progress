---
'solid-route-progress': patch
---

Keep the loading drift in browsers without CSS `linear()`: the bar used to jump straight to its target there, and now eases along a `cubic-bezier()` fit of the same curve. A load that starts while the previous bar completes now honors `delay` too, so a quick follow-up navigation no longer flashes the bar when `delay` is longer than `speed`. `track()` also clears its `timeout` timer once the promise settles. `ProgressController.options` is now typed `Readonly`, as it was always meant to be read only.
