# Utilities

## reduxFormFieldAdapter

Refunds uses [`redux-form`](http://redux-form.com) to manage the form
state of a set of user input to be submitted. Contains a set of field
`reduxFormFieldAdapter.js` contains reusable field adapters that group a
label, the input field and a span for showing to a user if the field is
invalid. The span can be tooltipped to provide more information than the
terse span may contain. Per 508c compliance, labels are linked up with
the input fields they label.
