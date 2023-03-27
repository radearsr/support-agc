const modalEdit = document.querySelector("#modalEdit");
const modelDelete = document.querySelector("#modalDelete");

modalEdit.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const fields = button.getAttribute("data-bs-field");
  const [title, link, status] = fields.split("],,[");
  const modalTitle = event.target.querySelector(".modal-title");
  const inputTitle = event.target.querySelector("#title-manga");
  const inputLink = event.target.querySelector("#link-manga");
  const selectStatus = event.target.querySelector("#status-manga");
  modalTitle.textContent = `Form Edit ${title}`;
  inputTitle.value = title;
  inputLink.value = link;
  selectStatus.value = status;
});

modelDelete.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const fields = button.getAttribute("data-bs-field");
  const [title, id] = fields.split("],,[");
  const textMessage = event.target.querySelector(".modal-body > p");
  textMessage.textContent = `Apakah anda yakin ingin menghapus "${title}" dari list auto publish?`;
});

