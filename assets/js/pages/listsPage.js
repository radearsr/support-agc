const modalEdit = document.querySelector("#modalEdit");
const modalDelete = document.querySelector("#modalDelete");
const modalAlert = document.getElementById("alert-in-modal");


const showModalAlert = (bgClass, fgClass, message) => {
  modalAlert.classList.add("alert-light-success");
  modalAlert.classList.add("color-success");
  modalAlert.textContent = message;
  modalAlert.classList.remove("d-none");
};

const hideModalAlert = (bgClass, fgClass) => {
  modalAlert.classList.remove(bgClass);
  modalAlert.classList.remove(fgClass);
  modalAlert.classList.add("d-none");
}


const alertController = (status, message, delayAlert) => {
  if (modalAlert.classList.contains("alert-light-success") || modalAlert.classList.contains("color-success")) {
    hideModalAlert("alert-light-success", "color-success");
  } else if (modalAlert.classList.contains("alert-light-danger") || modalAlert.classList.contains("color-danger")) {
    hideModalAlert("alert-light-danger", "color-danger");
  }
  if (status === "success") {
    showModalAlert("alert-light-success", "color-success", message);
    setTimeout(() => {
      hideModalAlert("alert-light-success", "color-success");
    }, delayAlert);
  } else {
    showModalAlert("alert-light-danger", "color-danger");
    setTimeout(() => {
      hideModalAlert("alert-light-danger", "color-danger");
    }, delayAlert);
  }
}

const actionUpdateList = async (payload, listId) => {
  const response = await fetch(`/manga/${listId}`, {
    method: "PUT",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  alertController(result.status, result.message);
};

const actionDeleteList = async (listId) => {
  const response = await fetch(`/manga/${listId}`, {
    method: "DELETE",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
  });
  const result = await response.json();
  alertController(result.status, result.message);
};

modalEdit.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const formSubmit = event.target.querySelector("#form-modal-edit");
  const fields = button.getAttribute("data-bs-field");
  const [title, link, status, listId] = fields.split("],,[");
  const modalTitle = event.target.querySelector(".modal-title");
  const inputTitle = event.target.querySelector("#title-manga");
  const inputLink = event.target.querySelector("#link-manga");
  const selectStatus = event.target.querySelector("#status-manga");
  modalTitle.textContent = `Form Edit ${title}`;
  inputTitle.value = title;
  inputLink.value = link;
  selectStatus.value = status;

  formSubmit.setAttribute("action", `/manga/${listId}/edit`);
});

modalDelete.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const formSubmit = event.target.querySelector("#form-modal-delete");
  const fields = button.getAttribute("data-bs-field");
  const [title, listId] = fields.split("],,[");
  const textMessage = event.target.querySelector(".modal-body > p");
  textMessage.textContent = `Apakah anda yakin ingin menghapus "${title}" dari list auto publish?`;
  formSubmit.setAttribute("action", `/manga/${listId}/delete`);
});

