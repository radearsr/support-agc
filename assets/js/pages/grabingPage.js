const tipeGrabbing = document.querySelector("#tipe-grabing");
const moreOptions = document.querySelectorAll(".more-option");
const title = document.querySelector(".title-more-option");
const formFinder = document.querySelector("#form-finder");
const selectUrlGrabbing = document.querySelector("#url-grabing");
const buttonInsertAll = document.getElementById("buttonInsertAll");
const toastElement = document.getElementById("toastGrabManga");
const loadingGetter = document.getElementById("loading-getter");
const loadingInsertAll = document.getElementById("loading-insert-all");
const sectionResult = document.getElementById("section-result");

const toastController = (resStatus, msg) => {
  const toast = new bootstrap.Toast(toastElement);
  if (resStatus === "success") {
    toastElement.classList.remove("alert-light-danger");
    toastElement.classList.add("alert-light-success");
    toastElement.querySelector(".toast-body").textContent = msg;
    toast.show();
  } else {
    toastElement.classList.remove("alert-light-success");
    toastElement.classList.add("alert-light-danger");
    toastElement.querySelector(".toast-body").textContent = msg;
    toast.show();
  }
}

const createTableData = (results) => {
  const tbody = document.querySelector("#bodyTable");
  const mappedResult = results.map((result) => {
    const tableDataText = `
      <tr>
        <td>
          <input type="checkbox" class="form-check-input form-check-primary" checked="" name="checkMangaList" id="customColorCheck1">
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

const getDataManga = async (payload, linkPath) => {
  loadingGetter.classList.remove("d-none");
  const response = await fetch(linkPath,
  {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });
  const result = await response.json();
  if (result.status === "success") {
    toastController(result.status, `Berhasil mengambil ${result.data.length} data manga`);
    loadingGetter.classList.add("d-none");
    return result;
  }
  toastController(result.status, result.message);
  loadingGetter.classList.add("d-none");
};

const insertListManga = async (targetEl) => {
  targetEl.disabled = true;
  const targetParentElement = targetEl.parentElement.parentElement;
  const title = targetParentElement.querySelector("td:nth-child(2)").textContent;
  const link = targetParentElement.querySelector("td:nth-child(3)").textContent;
  const status = targetParentElement.querySelector("td:nth-child(4) > select").value;
  const response = await fetch("/manga/add", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ title, link, status }),
  });
  const result = await response.json();
  if (result.status === "success") {
    targetEl.textContent = "SUCCESS";
    targetEl.classList.remove("btn-orange");
    targetEl.classList.add("btn-success");
  } else {
    targetEl.textContent = "FAILED";
    targetEl.classList.remove("btn-orange");
    targetEl.classList.add("btn-danger");
  }
};

const insertListMangaBulk = async (data) => {
  const tbody = document.querySelector("#bodyTable");
  const response = await fetch("/manga/add/bulk", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ dataManga: data }),
  });
  const result = await response.json();
  toastController(result.status, result.message);
  loadingInsertAll.classList.add("d-none");
  tbody.innerHTML = "";
  sectionResult.classList.add("d-none");
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
        if (selects.getAttribute("id") === "genre-anime") {
          console.log("test");
          const options = selects.querySelectorAll("option");
          const mangaGenres = []
          options.forEach((option) => (
            mangaGenres.push(option.getAttribute("value"))
          ));
          payload["genres"] = mangaGenres.length < 1 ? "all": mangaGenres;
          return;
        }
        if (selects.value === "Pilih") {
          labelTag.classList.add("text-danger");
          spanTag.classList.remove("d-none");
          spanTag.classList.add("text-danger");
          selects.classList.add("is-invalid");
        } else if (labelTag.classList.contains("text-danger") || spanTag.classList.contains("d-none") || spanTag.classList.contains("text-danger") || selects.classList.contains("is-invalid")) {
          labelTag.classList.remove("text-danger");
          spanTag.classList.add("d-none");
          spanTag.classList.remove("text-danger");
          selects.classList.remove("is-invalid");
          payload[name] = selects.value;
        } else {
          payload[name] = selects.value;
        }
      });
    }
  });
  // console.log(payload);
  if (Object.keys(payload).length >= minData) {
    let listsManga;
    if (minData === 3) {
      listsManga = await getDataManga(payload, "/manga/bychar");
    } else if (minData === 5) {
      listsManga = await getDataManga(payload, "/manga/bygenre");
    }
    sectionResult.classList.remove("d-none");
    createTableData(listsManga.data);
    listsResultMangaAction();
  } 
});

// Publish All Button Action
buttonInsertAll.addEventListener("click", async () => {
  // console.log(loadingInsertAll)
  loadingInsertAll.classList.remove("d-none");
  const inputCheckInTables = document.querySelectorAll("input[name='checkMangaList']");
  // console.log(inputCheckInTables[0]);
  const resultPayload = [];

  inputCheckInTables.forEach((inputCheck) => {
    if (inputCheck.checked) {
      const tableRow = inputCheck.parentElement.parentElement;
      const title = tableRow.querySelector("td:nth-child(2)").textContent;
      const link = tableRow.querySelector("td:nth-child(3)").textContent;
      const status = tableRow.querySelector("td:nth-child(4) > select").value;
      resultPayload.push({
        title,
        link,
        status,
      });
    }
  });
  await insertListMangaBulk(resultPayload)
});
