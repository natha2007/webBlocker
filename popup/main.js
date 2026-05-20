import { initSession } from './session.js';
import { initBlocker } from './blocker.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("salut");
    initSession();
    initBlocker();
});