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
			<tr>
				<td colspan="${allHeaders.length}" class="fulltd"><span class="add-detail"><i class="fas fa-plus"></i> Neuer Eintrag</span></td>
			</tr>
        </table>
    `);

	// Attach handler to open a completely new modal for adding a detail
	const addDetailBtn = document.querySelector(".add-detail");
	if (addDetailBtn) {
		addDetailBtn.onclick = function () {
			// build form inputs for each header
			let formFields = allHeaders
				.map((header, idx) => {
					const fid = `detail-field-${idx}`;
					return `
						<label for="${fid}">${header}:</label>
						<input type="text" id="${fid}" name="${header}" />
					`;
				})
				.join("");

			// create a new modal (overlaying the existing details modal)
			const addModal = document.createElement("div");
			addModal.id = "add-detail-modal";
			addModal.classList.add("modal");

			const addModalContent = document.createElement("div");
			addModalContent.classList.add("modal-content");
			addModalContent.innerHTML = `
				<h2>Neuer Eintrag</h2>
				<form id="add-detail-form">
					${formFields}
					<button type="submit">Speichern</button>
				</form>
			`;

			const closeAdd = document.createElement("span");
			closeAdd.classList.add("close-button");
			closeAdd.innerHTML = "<i class='fas fa-xmark'></i>";
			closeAdd.onclick = function () {
				document.body.removeChild(addModal);
			};

			addModalContent.appendChild(closeAdd);
			addModal.appendChild(addModalContent);
			document.body.appendChild(addModal);

			// submit handler
			const form = document.getElementById("add-detail-form");
			form.onsubmit = async function (e) {
				e.preventDefault();
				const payload = [];
				allHeaders.forEach((h, i) => {
					const val = document.getElementById(`detail-field-${i}`).value;
					payload.push(`${h}=${val}`);
				});

				try {
					const resp = await fetch(`http://127.0.0.1:5000/adddetail/${itemId}/${payload.join(",")}`);
					if (resp.ok) {
						// remove add modal and refresh the details modal by reopening it
						document.body.removeChild(addModal);
						// remove current details modal (if it exists) so showDetails will create a fresh one
						const cur = document.getElementById("detail-modal");
						if (cur) document.body.removeChild(cur);
						// reopen details to show the new entry
						await showDetails(itemId);
					} else {
						const text = await resp.text();
						alert("Fehler beim Speichern: " + (text || resp.statusText));
					}
				} catch (err) {
					alert("Fehler beim Senden: " + err.message);
				}
			};
		};
	}
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

	addItem();
}

async function addItem() {
	const plusWrapper = document.createElement("div");
	plusWrapper.id = "plus-wrapper";

	const plusBtn = document.createElement("div");
	plusBtn.id = "add-item-btn";
	plusBtn.innerHTML = `<i class="fas fa-plus"></i>`;
	plusBtn.onclick = function () {
		openModal(`
			<h2>Add New Item</h2>
			<form id="add-item-form">
				<label for="item-name">Name:</label>
				<input type="text" id="item-name" name="item-name" required>
				<label for="item-description">Beschreibung:</label>
				<textarea id="item-description" name="item-description" required></textarea>
				<label for="item-scheme">Alle Detail-Angaben (durch , getrennt)</label>
				<textarea id="item-scheme" name="item-scheme" required></textarea>
				<button type="submit">Add Item</button>
			</form>
		`);
		const form = document.getElementById("add-item-form");
		form.onsubmit = async function (e) {
			e.preventDefault();
			const name = document.getElementById("item-name").value;
			const description = document.getElementById("item-description").value;
			const item_scheme = document.getElementById("item-scheme").value;
			const response = await fetch(`http://127.0.0.1:5000/additem/${name}/${description}/${item_scheme}`);
			if (response.ok) {
				document.body.removeChild(document.getElementById("detail-modal"));
				document.getElementById("content").innerHTML = "";
				loadItems();
			}
		};
	};
	plusWrapper.appendChild(plusBtn);
	document.getElementById("content").appendChild(plusWrapper);
}

loadItems();
