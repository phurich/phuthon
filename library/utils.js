var testActionUrl = "https://script.google.com/macros/s/AKfycbyzL2u8HZ8eviN4Ma7qyks0AfEGXnwStwddbgwDQ5Ds/dev";
var currentActionUrl = "https://script.google.com/macros/s/AKfycbw2y4cvE2e0yfANv0wijFKba7WJKM-ap90jEwMqQqoZEB2Zskhn51mnryHYDm7U9v9JIQ/exec";

class myHtmlHeader extends HTMLElement {
    async connectedCallback() {
        const headContent = `
        <!-- common-head.html -->
        <title>ภูธรเดลิเวอรี่</title>
        <link rel="icon" type="image/png" href="https://phurich.github.io/phuthon/library/favicon.png">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Kanit&display=swap">
        `;

        document.head.insertAdjacentHTML('afterbegin', headContent);

        // Wait for the script to load
        await this.loadScript('https://unpkg.com/sweetalert/dist/sweetalert.min.js');

        // Define SweetAlert functions once script is loaded
        window.swalShowError = function (message) {
            swal("ผิดพลาด", message, "error");
        }

        window.swalShowSuccess = function (message) {
            swal("สำเร็จ", message, "success");
        };


        window.swalShowWarning = function (title,message) {
            return swal({
                title: title,
                text: message,
                icon: "warning",
                buttons: {
                    confirm: {
                        text: "ถูกแล้ว",
                        value: true,
                        visible: true,
                        className: "",
                        closeModal: true,
                    },
                    cancel: {
                        text: "ยกเลิก",
                        value: false,
                        visible: true,
                        className: "",
                        closeModal: true,
                    }
                }
            }).then((value) => {
                return value; // true if OK, false if Cancel
            });
        };

        this.remove();
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
}

customElements.define('html-header', myHtmlHeader);

async function mergeImagesVertically() {
    const files = document.getElementById('fileInput').files;

    if (files.length > 0) {
        const canvas = document.getElementById('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        const maxWidth = 800;
        const lineHeight = 20; // Height of the separating line
        let totalHeight = lineHeight * (files.length - 1); // Initial height for the separating lines
        const brightness = 1.1; // Increase 10% brightness

        const results = await Promise.all(
            Array.from(files).map(async (file) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        const img = new Image();
                        img.onload = function () {
                            let width = img.width;
                            let height = img.height;

                            // Create a temporary canvas
                            const tempCanvas = document.createElement('canvas');
                            const tempCtx = tempCanvas.getContext('2d');

                            if (width > maxWidth) {
                                // Scale down if width is greater than maxWidth
                                const scale = maxWidth / width;
                                width *= scale;
                                height *= scale;
                            }

                            // Set temporary canvas dimensions to image dimensions
                            tempCanvas.width = Math.max(width, maxWidth);
                            tempCanvas.height = height;

                            // Fill the background with white
                            tempCtx.fillStyle = 'white';
                            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                            // Calculate the x-offset for centering
                            const xOffset = (tempCanvas.width - width) / 2;

                            // Draw the image onto the centered position
                            tempCtx.drawImage(img, xOffset, 0, width, height);

                            resolve({ img: tempCanvas, width: tempCanvas.width, height: tempCanvas.height });
                        };
                        img.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });
            })
        );

        // Calculate total height with separating lines included
        results.forEach((result) => {
            totalHeight += result.height;
        });

        canvas.width = maxWidth;
        canvas.height = totalHeight;

        let y = 0;
        results.forEach((result, index) => {
            // Ensure the entire canvas row is filled with white
            context.fillStyle = 'white';
            context.fillRect(0, y, maxWidth, result.height);

            // Center the image in the full canvas width
            const xOffset = (maxWidth - result.width) / 2;
            context.drawImage(result.img, xOffset, y, result.width, result.height);
            y += result.height;

            // Draw separating line if not the last image
            if (index < results.length - 1) {
                y += lineHeight;
                context.fillRect(0, y - lineHeight, maxWidth, lineHeight);
            }
        });

        // Adjust brightness
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(data[i] * brightness, 255); // Clamp to 255 to prevent overflow
            data[i + 1] = Math.min(data[i + 1] * brightness, 255);
            data[i + 2] = Math.min(data[i + 2] * brightness, 255);
        }

        context.putImageData(imageData, 0, 0);

        // Generate and display the image only if files were selected
        const compressedImageData = canvas.toDataURL('image/jpeg', 0.4);
        document.getElementById('photo').src = compressedImageData;
        document.getElementById('imageBase64').value = document.getElementById('photo').src.split(',')[1];
        document.getElementById('photo').style.display = 'block';
    }
}