function openModal(content) {
	// open modal
	const modal = document.createElement("div");
	modal.id = "detail-modal";
	modal.classList.add("modal");

	const modalContent = document.createElement("div");
	modalContent.classList.add("modal-content");
	modalContent.innerHTML = content;

	const closeButton = document.createElement("span");
	closeButton.id = "close-modal";
	closeButton.classList.add("close-button");
	closeButton.innerHTML = "<i class='fas fa-xmark'></i>";

	closeButton.onclick = function () {
		document.body.removeChild(modal);
	};

	modalContent.appendChild(closeButton);
	modal.appendChild(modalContent);

	document.body.appendChild(modal);
}

async function showDetails(itemId) {
	// scheme
	const responseScheme = await fetch(`http://127.0.0.1:5000/item/${itemId}/scheme`);
	const dataScheme = await responseScheme.json();
	const allHeaders = [...new Set(dataScheme.flatMap((obj) => Object.keys(obj).filter((key) => key !== "position")))];

	// details
	const responseItems = await fetch(`http://127.0.0.1:5000/item/${itemId}/details`);
	const dataItems = await responseItems.json();
	const thsAll = allHeaders.map((field) => `<th>${field}</th>`).join("");
	const trs = dataItems
		.map((item) => {
			return `<tr>${allHeaders.map((header) => `<td>${item[header] || ""}</td>`).join("")}</tr>`;
		})
		.join("");

	// get item name for title
	const responseItem = await fetch(`http://127.0.0.1:5000/item/${itemId}`);
	const dataItem = await responseItem.json();

	openModal(`
        <h2>${dataItem.name}</h2>
        <table>
            <tr>${thsAll}</tr>
            ${trs}
        </table>
    `);
}

async function loadItems() {
	const response = await fetch("http://127.0.0.1:5000/items");
	const data = await response.json();
	const itemsContainer = document.getElementById("content");
	data.items.forEach((item) => {
		const itemDiv = document.createElement("div");
		itemDiv.classList.add("item");
		itemDiv.id = item.id;
		itemDiv.innerHTML = `
            <div class="item-header">${item.name}</div>
            <div class="item-body">
                <div class="info-container">
                    <div class="icon-wrapper">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <div class="info">
                        ${item.description}
                    </div>
                </div>
                <div class="info-container">
                    <div class="icon-wrapper">
                        <i class="fas fa-location-dot"></i>
                    </div>
                    <div class="info">
                        ${item.places.join(", ")}
                    </div>
                </div>
                <button onclick="showDetails(${item.id})">Details</button>
            </div>
        `;
		itemsContainer.appendChild(itemDiv);
	});
}

loadItems();
