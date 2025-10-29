
- Create plugin system using native federation
    - Service with the following API endpoints:
        - GET /api/manifest - returns the manifest generated from the list of modules
        - POST /api/add-module - Adds a module to the manifest. Takes in a unique name and a URL or folder path. The folder is expected to have a remoteEntry.json file. Returns the updated array of modules
        - POST /api/remove-module - Removes a module from the manifest. Takes in a name. Returns the updated array of modules
        - POST /api/update-module - Updates a module in the manifest. Takes in a name and a URL or file path. Returns the updated array of modules
        - GET /index.html - front-end UI for managing the manifest. Contains a table allowing you to add/remove rows. Each row contains a different module with a name column and a column for url/path.
    - Service should be implemented using node/typescript
    - Simple database storing the list of modules
    - A static http server which serves the files in the modules entries that use a folder path. Module files are served under the /modules/{name} path. To get the remoteEntry.json file for a module, you would call /modules/{name}/remoteEntry.json
    - A front-end module that exports the following function
        - getPlugins<T>(): T[] - Returns a list of plugins. Internally this calls the /api/manifest endpoint and passes the result to initFederation. It then loops through the list of modules in the manifest and calls loadRemoteModule(remoteName, "./plugin"). Every plugin is expected to have a plugin module which has a default export of type T. getPlugins returns the list of these default exports.
    - Font-end module should be implemented using typescript/vite


