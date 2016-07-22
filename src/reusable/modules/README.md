A reusable module would be more than just a simple, Presentation
 component.  A module contains it's own state Redux store and it's
 management along with its constituent Presentation component(s).
 So, that means each module has an initial state, a Redux reducer and
 actions.

They are intended to be included into host React/Redux applications by
 configuring:

 * the host app's Redux store with a module's initial state include,
 * combining the host app's Redux reducers with a module's reducer.
 * providing access to the module's actions where called for in the host app
 * add the module's Components into the host app's rendering where needed.

The module's root index.js file should be considered the public API
 for the module. IOW's: access to the module in the host app should
 always defer to that module for access to the module content, not
 the internal components, containers, or modules.
