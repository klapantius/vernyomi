# Development Manual

## Data Flow

`src/app.ts Application.setupServer() =>` API:
- _session-data[?limit|50])_: load sessions
- _start-session body: {comment}_: create new session
- _save-measurement body: {session_id, dia, sys, puls}_: add new measurement to a session
- _update-measurement body {measurement_id, dia, sys, puls}_: update measurement
- _delete-measurement body {measurement_id}_: delete measurement
- _update_session body: {session_id, comment}_: update session data (not implemented yet)
- _delete_session body: {session_id}_: delete session with all measurements (not implemented yet)

`src/services/[Measurement,Session]Service`: connects the API layer to the data repositories

`repositories/[Measurement,Session]Repository`: translates request and data from API to sql queries and forwards them to the database interface

`src/services/database/[some]Database`: transfers sql queries and responses between a database server and a repository implementation