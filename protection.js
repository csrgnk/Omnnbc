// Disable Right Click
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable Selection (Drag)
document.onselectstart = function() { return false; };

// Disable Keyboard Shortcuts (Ctrl+C, Ctrl+U, Ctrl+S, F12)
document.onkeydown = function(e) {
    if (e.keyCode == 123) return false; // F12
    if (e.ctrlKey && (e.keyCode == 'U'.charCodeAt(0) || e.keyCode == 'C'.charCodeAt(0) || e.keyCode == 'S'.charCodeAt(0) || e.keyCode == 'A'.charCodeAt(0))) {
        return false;
    }
};

// Add CSS to disable selection via Style tag
const style = document.createElement('style');
style.innerHTML = `
    * {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
`;
document.head.appendChild(style);
