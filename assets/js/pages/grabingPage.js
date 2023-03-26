const tipeGrabbing = document.querySelector("#tipe-grabing");
const moreOptions = document.querySelectorAll(".more-option");
const title = document.querySelector(".title-more-option");
const findGrabButton = document.querySelector("#find-grab");
const formFinder = document.querySelector("#form-finder");
const selectUrlGrabbing = document.querySelector("#url-grabing");
let currentMoreOption;

tipeGrabbing.addEventListener("change", (event) => {
  if (event.target.value === "Pilih") {
    title.classList.add("d-none");
  } else {
    title.classList.remove("d-none");
  }
  moreOptions.forEach((moreOption) => {
    if (moreOption.classList.contains(event.target.value)) {
      moreOption.classList.remove("d-none");
    }else {
      moreOption.classList.add("d-none");
    }
  });
});

formFinder.addEventListener("submit", (event) => {
  event.preventDefault();
  const sourceGrabName = selectUrlGrabbing.getAttribute("name");
  const sourceGrabLabel = selectUrlGrabbing.parentElement.querySelector("label");
  const sourceGrabSpan = selectUrlGrabbing.parentElement.querySelector("span");

  const payload = {};

  if (selectUrlGrabbing.value === "Pilih") {
    sourceGrabLabel.classList.add("text-danger");
    sourceGrabSpan.classList.remove("d-none");
    sourceGrabSpan.classList.add("text-danger");
    selectUrlGrabbing.classList.add("is-invalid");
  } else {
    sourceGrabLabel.classList.remove("text-danger");
    sourceGrabSpan.classList.add("d-none");
    sourceGrabSpan.classList.remove("text-danger");
    selectUrlGrabbing.classList.remove("is-invalid");
    payload[sourceGrabName] = selectUrlGrabbing.value;
  }

  moreOptions.forEach((moreOption) => {
    if (!moreOption.classList.contains("d-none")) {
      const selected = moreOption.querySelectorAll("select");
      selected.forEach((selects) => {
        const name = selects.getAttribute("name");
        const labelTag = selects.parentElement.querySelector("label");
        const spanTag = selects.parentElement.querySelector("span");
        if (selects.value === "Pilih") {
          labelTag.classList.add("text-danger");
          spanTag.classList.remove("d-none");
          spanTag.classList.add("text-danger");
          selects.classList.add("is-invalid");
        } else {
          labelTag.classList.remove("text-danger");
          spanTag.classList.add("d-none");
          spanTag.classList.remove("text-danger");
          selects.classList.remove("is-invalid");
          payload[name] = selects.value;
        }
      });
    }
  });

  console.log(payload);
});
