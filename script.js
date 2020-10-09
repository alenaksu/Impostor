var REGION_NAME = 'Impostor';
var SERVER_PORT = 22023;

const ip = document.querySelector('#ip');
const port = document.querySelector('#port');
const form = document.querySelector('#serverFileForm');

/**
 * Convert integer number to little-endian 16-bits int representation
 * @param {number} int
 */
const int16 = (int) => [int & 0xff, (int & 0xff00) >> 8];

/**
 * Convert integer number to little-endian 32-bits int representation
 * @param {number} int
 */
const int32 = (int) => [
    int & 0xff,
    (int & 0xff00) >> 8,
    (int & 0xff0000) >> 16,
    (int & 0xff000000) >> 24,
];

const ipAddressToBytes = (ipAddress) => ipAddress.split('.').map(parseInt);

const stringToBytes = (str) => {
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i));
    }
    return bytes;
};

const showPlatformText = () => {
    const device =
        navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPod/i)
            ? 'ios'
            : navigator.userAgent.match(/android/i)
            ? 'android'
            : 'desktop';

    document.querySelector(`.${device}-support`).style.display = 'block';
};

const saveFile = (blob, fileName) => {
    const a = document.createElement('a');
    a.style.display = 'none';

    a.href = URL.createObjectURL(blob);
    a.download = fileName;

    document.body.appendChild(a);
    a.click();

    setTimeout(() => URL.revokeObjectURL(a.href), 100);
};

const fillIPAdressUsingLocationHash = () => {
    const urlServerAddress = document.location.hash.substr(1).split(':');
    const serverIp = urlServerAddress[0];
    const serverPort =
        urlServerAddress.length > 1
            ? urlServerAddress[1]
            : SERVER_PORT.toString();

    ip.value = serverIp;
    port.value = serverPort;
};

const generateServerFile = (regionName, ip, port) => {
    const bytesArray = int32(0);
    bytesArray.push(regionName.length);
    bytesArray.push(...stringToBytes(regionName));
    bytesArray.push(ip.length);
    bytesArray.push(...stringToBytes(ip));
    bytesArray.push(...int32(1));

    const serverName = `${regionName}-Master-1`;

    bytesArray.push(serverName.length);
    bytesArray.push(...stringToBytes(serverName));
    bytesArray.push(...ipAddressToBytes(ip));
    bytesArray.push(...int16(port));
    bytesArray.push(...int32(0));

    return Uint8Array.from(bytesArray);
};

const setValidated = () => form.classList.add('was-validated');

fillIPAdressUsingLocationHash();
showPlatformText();

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const serverFileBytes = generateServerFile(
        REGION_NAME,
        ip.value,
        port.value
    );
    const blob = new Blob([serverFileBytes.buffer]);
    saveFile(blob, 'regionInfo.dat');
});

form.addEventListener('invalid', setValidated, true);
form.addEventListener('submit', setValidated);
