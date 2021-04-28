export default class Alert {
    constructor(text, type) {
        this.DOMElement = document.createElement('div');
        this.DOMElement.classList.add('alert');
        this.DOMElement.classList.add(type);
        this.DOMElement.textContent = text;
        let closeButton = document.createElement('span');
        closeButton.innerHTML = '&times;';
        closeButton.classList.add('closeButton');
        this.DOMElement.appendChild(closeButton);
        let alertList = document.querySelector('[rel=js-alertList]');
        alertList.appendChild(this.DOMElement);
        setTimeout(() => {
            this.DOMElement.classList.add('hidden');
        }, 5000);
    }
}
