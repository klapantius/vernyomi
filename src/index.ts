import { Application } from "./app";

new Application()
    .runAsync()
    .then(_ => {
        console.log('done');
        process.exit();
    });
