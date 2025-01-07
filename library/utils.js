var testActionUrl = "https://script.google.com/macros/s/AKfycbyzL2u8HZ8eviN4Ma7qyks0AfEGXnwStwddbgwDQ5Ds/dev";
var currentActionUrl = "https://script.google.com/macros/s/AKfycbzmS6MigtAPl9gqFdPTc9QDiQ0xL5TR3kVfx01Cl7L51UKCWyyRWHKkPVgZVEpg_b697A/exec";

class myHtmlHeader extends HTMLElement {
    async connectedCallback() {
        const headContent = `
        <!-- common-head.html -->
        <title>ภูธรเดลิเวอรี่</title>
        <link rel="icon" type="image/png" href="https://phurich.github.io/phuthon/library/favicon.png">
        <meta charset="utf-8">
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

async function uploadToImgBB(prefix) {
    const formData = new FormData();
    const base64data = document.getElementById('photo').src.split(',')[1];
    const imageName = `${prefix}${document.getElementById("rider").value}${document.getElementById("row").value}`;
    
    formData.append('image', base64data);
    formData.append('name', imageName);

    try {
        const response = await fetch('https://api.imgbb.com/1/upload?key=3f7f239d1e23ab442c07056617c998e8', {
            method: 'POST',
            body: formData
        });
        if (!response.ok) {
            console.log('Error:', response.status, response.statusText);
            throw new Error('Network response was not ok');
        }
        const responseData = await response.json();
        document.getElementById("imageURL").value = responseData.data.url;
        return true;
    } catch (error) {
        console.error('There was a problem with the upload operation:', error);
        return false;
    }
}

customElements.define('html-header', myHtmlHeader);
