const selectedTipeSchedule = document.querySelector("#tipe-schedule");
const fieldsActionValue = document.querySelectorAll(".action-value");
const formSetting = document.querySelector("#formSetting");

selectedTipeSchedule.addEventListener("change", (event) => {
  fieldsActionValue.forEach((field) => {
    console.log(field);
    if (field.classList.contains(event.target.value)) {
      field.lastElementChild.setAttribute("name", "actionVal");
      field.classList.remove("d-none");
    } else if (field.classList.contains("d-none")) {
      return;
    } else {
      field.lastElementChild.removeAttribute("name", "actionVal");
      field.classList.add("d-none");
    }
  });
});

const cronPatternGenerator = (type, value) => {
  if (type === "perhari") {
    const [hours, minutes] = value.split(":");
    return `* ${minutes} ${hours} * * *`;
  } else if (type === "perjam") {
    return `0 0 */${value} * * *`;
  } else if (type === "permenit") {
    return `0 */${value} * * * *`;
  } else {
    return "* * * * * *";
  }
};

const postToInsertSetting = async (payload) => {
  try {
    const response = await fetch("/dashboard/setting", {
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

formSetting.addEventListener("submit", async (evt) => {
  evt.preventDefault();
  const formData = new FormData(formSetting);
  const linkAgc = formData.get("linkAgc");
  const emailAgc = formData.get("emailAgc");
  const passwordAgc = formData.get("passwordAgc");
  const idTelegram = formData.get("idTelegram");
  const tipeSchedule = formData.get("tipeSchedule");
  const actionCount = formData.get("actionCount");
  const actionVal = formData.get("actionVal");

  const insertedSetting = await postToInsertSetting({
    linkAgc,
    emailAgc,
    passwordAgc,
    idTelegram,
    tipeSchedule,
    actionCount,
    cronPattern: cronPatternGenerator(tipeSchedule, actionVal),
  });
  console.log(insertedSetting);
});
