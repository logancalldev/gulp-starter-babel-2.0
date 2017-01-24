function ready(fn) {
	if (document.readyState !== "loading") {
		fn();
	} else {
		document.addEventListener("DOMContentLoaded", fn);
	}
}

ready(() => {
	// console.log("index-priority.ts is compiling");
});
