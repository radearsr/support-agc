const modalEdit = document.querySelector("#modalEdit");
const modalDelete = document.querySelector("#modalDelete");

modalEdit.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const formSubmit = event.target.querySelector("#form-modal-edit");
  const fields = button.getAttribute("data-bs-field");
  const [title, listId] = fields.split("],,[");
  const modalTitle = event.target.querySelector(".modal-title");
  const inputTitle = event.target.querySelector("#title-manga");
  modalTitle.textContent = `Form Edit ${title}`;
  inputTitle.value = title;
  formSubmit.setAttribute("action", `/dashboard/listswp/${listId}/edit`);
});
