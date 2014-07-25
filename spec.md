# Tagged API Client JS
## Technical Spec

### Description

The Tagged API Client for JS offers developers an easy way to execute API calls,
process results, and handle errors in any JavaScript environment.

## Requirements

1. The client **must** be compatible with node.js as well as the browser.
2. The client **must** use promises for result handling.
3. The client **may** batch requests together.
4. The client **may** be used as middleware for `connect`.
5. The client **must** make API calls on behalf of the user.
6. The client **may not** make API calls on behalf of another user.
7. The client **will** provide adapters for node.js and AngularJS.

## API

    [TaggedApi] new TaggedApi([string] host, [object|null] options, [object|null] httpAdapter)

    [Promise] TaggedApi#execute([string] method, [object|null] params)
        resolves: [object] result
        rejects: [string] error
