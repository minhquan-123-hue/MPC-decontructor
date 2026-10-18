(() => {
  "use strict";
  const STORAGE_KEY = "mpc-map-progress-v1";
  const boxes = [...document.querySelectorAll("[data-map-item]")];
  const count = document.getElementById("map-progress-count");
  const caption = document.getElementById("map-progress-caption");
  const bar = document.getElementById("map-progress-bar");
  const track = document.querySelector(".progress-track");
  const reset = document.getElementById("reset-progress");

  function readSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function persist() {
    const state = Object.fromEntries(boxes.map(box => [box.dataset.mapItem, box.checked]));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      caption.textContent = "Đã tự lưu trên trình duyệt này.";
    } catch {
      caption.textContent = "Trình duyệt không cho phép lưu. Hãy kiểm tra cài đặt quyền riêng tư.";
    }
  }

  function update() {
    const done = boxes.filter(box => box.checked).length;
    const total = boxes.length;
    const percent = total ? Math.round(done / total * 100) : 0;
    count.textContent = done + " / " + total + " chủ đề";
    bar.style.width = percent + "%";
    track.setAttribute("aria-valuenow", String(percent));
    document.querySelectorAll(".map-group").forEach(group => {
      const groupBoxes = [...group.querySelectorAll("[data-map-item]")];
      const groupDone = groupBoxes.filter(box => box.checked).length;
      const heading = group.querySelector("h2");
      let status = group.querySelector(".subject-progress");
      if (!status) {
        status = document.createElement("span");
        status.className = "subject-progress";
        heading.append(status);
      }
      status.textContent = groupDone + "/" + groupBoxes.length;
    });
    document.querySelectorAll(".map-branch").forEach(branch => {
      const branchBoxes = [...branch.querySelectorAll("[data-map-item]")];
      const branchDone = branchBoxes.filter(box => box.checked).length;
      const summary = branch.querySelector("summary");
      let status = summary.querySelector(".branch-progress");
      if (!status) {
        status = document.createElement("span");
        status.className = "branch-progress";
        summary.append(status);
      }
      status.textContent = branchDone + "/" + branchBoxes.length;
    });
    persist();
  }

  const saved = readSaved();
  boxes.forEach(box => {
    box.checked = saved[box.dataset.mapItem] === true;
    box.addEventListener("change", update);
  });
  update();

  reset?.addEventListener("click", () => {
    if (!boxes.some(box => box.checked)) return;
    if (!window.confirm("Bỏ tích toàn bộ tiến độ học trên trình duyệt này?")) return;
    boxes.forEach(box => { box.checked = false; });
    update();
  });
})();