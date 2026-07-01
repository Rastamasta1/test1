// Application entry point.
// The UI wiring, form submit handling, and message rendering live in app.js,
// which imports the data service (messagesService.js) and the shared
// Supabase client (supabaseClient.js). Importing app.js here runs its
// initialization side-effects (attaching the submit handler and loading
// the initial list of messages).
//
// index.html can load either app.js directly or this main.js as the module
// entry point; both bootstrap the same application.

import './app.js';
