const tipeGrabbing = document.querySelector("#tipe-grabing");
const moreOptions = document.querySelectorAll(".more-option");
const title = document.querySelector(".title-more-option");
const formFinder = document.querySelector("#form-finder");
const selectUrlGrabbing = document.querySelector("#url-grabing");
const loadingElement = document.querySelector(".bg-loading");

const createTableData = (results) => {
  const tbody = document.querySelector("#bodyTable");
  const mappedResult = results.map((result) => {
    const tableDataText = `
      <tr>
        <td>
          <input type="checkbox" class="form-check-input form-check-primary" checked="" name="customCheck" id="customColorCheck1">
        </td>
        <td>${result.title}</td>
        <td>${result.link}</td>
        <td>
          <select name="viewmenu" class="form-select status-episode-publish">
            <option value="1" selected>Active</option>
            <option value="0">Non Active</option>
          </select>
        </td>
        <td class="text-center">
          <button class="btn btn-sm btn-orange btn-insert mb-1">
            INSERT
          </button>
        </td>
      </tr>
    `;
    return tableDataText;
  })
  tbody.innerHTML = mappedResult.join("");
}

const getDataManga = async (payload) => {
  try {
    const response = await fetch("/manga/bychar",
    {
      method: "POST",
      headers: {
        "Accept": "application/json, text/plain, */*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    return result;
  } catch (error) {
    return error;
  }
};

const insertListManga = async (targetEl) => {
  const targetParentElement = targetEl.parentElement.parentElement;

  const title = targetParentElement.querySelector("td:nth-child(2)").textContent;
  const link = targetParentElement.querySelector("td:nth-child(3)").textContent;
  const status = targetParentElement.querySelector("td:nth-child(4) > select").value;
  console.log({ title, link, status });
  const response = await fetch("/manga/add", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title, link, status}),
  });
  const result = await response.json();
};

const listsResultMangaAction = () => {
  const buttonInserts = document.querySelectorAll(".btn-insert");
  buttonInserts.forEach((btnIns) => {
    btnIns.addEventListener("click", (event) => insertListManga(event.target));
  });
};


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

formFinder.addEventListener("submit", async (event) => {
  event.preventDefault();
  const sourceGrabName = selectUrlGrabbing.getAttribute("name");
  const sourceGrabLabel = selectUrlGrabbing.parentElement.querySelector("label");
  const sourceGrabSpan = selectUrlGrabbing.parentElement.querySelector("span");

  // Declare Variable For Search Manga
  const payload = {};
  let minData;

  // Validation Link Source
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

  // Validation Select More Option
  moreOptions.forEach((moreOption) => {
    if (!moreOption.classList.contains("d-none")) {
      minData = moreOption.querySelector("button").getAttribute("name") === "button-all" ? 3 : 5;
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
  if (Object.keys(payload).length >= minData) {
    loadingElement.classList.remove("d-none");
    const listsManga = await getDataManga(payload);
    console.log(listsManga);
    if (listsManga.status === "success") {
      createTableData(listsManga.data);
      loadingElement.classList.add("d-none");
      listsResultMangaAction();
    }
  } 
});
