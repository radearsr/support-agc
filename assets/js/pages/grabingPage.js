const tipeGrabbing = document.querySelector("#tipe-grabing");
const moreOptions = document.querySelectorAll(".more-option");
const title = document.querySelector(".title-more-option");
const findGrabButton = document.querySelector("#find-grab");
const formFinder = document.querySelector("#form-finder");
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
  moreOptions.forEach((moreOption) => {
    if (!moreOption.classList.contains("d-none")) {
      const selected = moreOption.querySelectorAll("select");
      selected.forEach((selects) => {
        console.log(selects.value);
      });
    }
  });
});
