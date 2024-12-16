export class FileManager {
    constructor() {
        // this.checkFileExists();
    }
    async checkFileExists(url) {
        let FileFound = false;
        const userAgent =
            navigator.userAgent || navigator.vendor || window.opera;
        if (/iPhone|iPad|iPod/.test(userAgent)) {
            url = `${url}.usdz`;
        } else {
            url = `${url}.glb`;
        }
        while (!FileFound) {
            try {
                const response = await fetch(url, { method: "HEAD" });
                if (response.ok) return true; // File exists, exit the loop
            } catch (error) {
                alert("Checking file existence failed:", error);
            }
        }
        return false; // File not found after max attempts
    }
}