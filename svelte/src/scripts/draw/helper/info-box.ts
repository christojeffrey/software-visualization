import type { infoBoxData } from "$types";

export function renderInfoBox(data: infoBoxData, color: string) {
    // Set the data for the info box
			const infoBox = document.getElementById('info-box')!;
			infoBox.style.display = 'block';
			infoBox.style.background = color;
			document.getElementById('info-box-name')!.innerText = data.simpleName;
			const subHeading = data.rs === '' ? data.kind : data.kind + ' - ' + data.rs;
			document.getElementById('info-box-heading2')!.innerText = subHeading;
			document.getElementById('info-box-desc')!.innerText = data.description;
}