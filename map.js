(() => {
  "use strict";
  const STORAGE_KEY = "mpc-map-progress-v1";
  const boxes = [...document.querySelectorAll("[data-map-item]")];
  const count = document.getElementById("map-progress-count");
  const caption = document.getElementById("map-progress-caption");
  const bar = document.getElementById("map-progress-bar");
  const track = document.querySelector(".progress-track");
  const reset = document.getElementById("reset-progress");
  const search = document.getElementById("topic-search");
  const subjectFilter = document.getElementById("subject-filter");
  const levelFilter = document.getElementById("level-filter");
  const clearFilters = document.getElementById("clear-map-filters");
  const resultCount = document.getElementById("filter-result-count");
  const pathStatus = document.getElementById("learning-path-status");
  let activePath = null;

  // A practical starter graph, not a claim that every topic has only one valid order.
  const prerequisites = {
    "Đạo hàm": ["Hàm số & giới hạn", "Đọc đồ thị và độ dốc"],
    "Tích phân": ["Hàm số & giới hạn", "Đạo hàm"],
    "Phương trình vi phân": ["Đạo hàm", "Phương trình & bất phương trình"],
    "Thống kê suy diễn": ["Thống kê mô tả và sai số đo", "Xác suất cơ bản + phân phối"],
    "Hồi quy và khớp dữ liệu": ["Đọc đồ thị và độ dốc", "Thống kê mô tả và sai số đo"],
    "Nhiệt động lực học": ["Nhiệt độ, nhiệt lượng và nhiệt dung", "Bảo toàn năng lượng, động lượng, mô men"],
    "Mạch điện": ["Điện tích, dòng điện và điện áp", "Đơn vị đo và phân tích thứ nguyên"],
    "Điện trở, công suất và năng lượng điện": ["Mạch điện", "Điện tích, dòng điện và điện áp"],
    "Cảm ứng điện từ và máy biến áp": ["Điện trường & từ trường", "Mạch điện"],
    "Định luật Maxwell cơ bản": ["Điện trường & từ trường", "Sóng điện từ & ánh sáng"],
    "Cân bằng phương trình & stoichiometry": ["Cấu trúc nguyên tử & bảng tuần hoàn", "Số và phép toán cơ bản"],
    "Nồng độ, mol, khí": ["Cân bằng phương trình & stoichiometry", "Tỉ lệ, phần trăm và tỷ số"],
    "Nhiệt hóa học": ["Cân bằng phương trình & stoichiometry", "Nhiệt động lực học"],
    "Động học phản ứng": ["Nồng độ, mol, khí", "Tỉ lệ, phần trăm và tỷ số"],
    "Cân bằng hóa học": ["Động học phản ứng", "Nồng độ, mol, khí"],
    "Điện hóa học cơ bản": ["Axit–base & oxi hóa–khử", "Cân bằng hóa học"],
    "Tế bào: cấu trúc và chức năng": ["Đặc điểm chung của sự sống"],
    "DNA RNA và protein": ["Tế bào: cấu trúc và chức năng", "Cấu trúc nguyên tử & bảng tuần hoàn"],
    "Enzyme và phản ứng sinh học": ["DNA RNA và protein", "Tế bào: cấu trúc và chức năng"],
    "Trao đổi chất và năng lượng trong tế bào": ["Enzyme và phản ứng sinh học"],
    "Quang hợp và hô hấp tế bào": ["Trao đổi chất và năng lượng trong tế bào", "Nhiệt độ, nhiệt lượng và nhiệt dung"],
    "Sinh học hệ thống và mô hình toán sinh học": ["Đạo hàm", "Thống kê mô tả và sai số đo", "Tế bào: cấu trúc và chức năng"]
  };

  const paths = {
    circuit: ["Đơn vị đo và phân tích thứ nguyên", "Đọc đồ thị và độ dốc", "Điện tích, dòng điện và điện áp", "Mạch điện", "Điện trở, công suất và năng lượng điện", "Đại lượng, đơn vị và phép đo vật lý"],
    methane: ["Số và phép toán cơ bản", "Tỉ lệ, phần trăm và tỷ số", "Phương trình & bất phương trình", "Cấu trúc nguyên tử & bảng tuần hoàn", "Cân bằng phương trình & stoichiometry", "Nồng độ, mol, khí"],
    plant: ["Tỉ lệ, phần trăm và tỷ số", "Thống kê mô tả và sai số đo", "Hồi quy và khớp dữ liệu", "Cấu trúc nguyên tử & bảng tuần hoàn", "Hóa sinh cơ bản", "Đặc điểm chung của sự sống", "Tế bào: cấu trúc và chức năng", "Trao đổi chất và năng lượng trong tế bào", "Quang hợp và hô hấp tế bào", "Chu trình vật chất và dòng năng lượng sinh thái", "Thiết kế thí nghiệm và đọc dữ liệu sinh học"]
  };

  function readSaved() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch { return {}; }
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

  function showPrerequisiteHint(box) {
    const item = box.closest(".map-item");
    const oldHint = item.querySelector(".prerequisite-hint");
    if (oldHint) oldHint.remove();
    if (!box.checked) return;
    const needs = prerequisites[box.dataset.mapItem];
    if (!needs) return;
    const missing = needs.filter(name => {
      const prerequisiteBox = boxes.find(candidate => candidate.dataset.mapItem === name);
      return prerequisiteBox && !prerequisiteBox.checked;
    });
    if (!missing.length) return;
    const hint = document.createElement("p");
    hint.className = "prerequisite-hint";
    hint.textContent = "Có thể ôn trước: " + missing.join(" · ") + ". Đây là gợi ý, không phải điều kiện khóa.";
    item.append(hint);
  }

  function applyFilters() {
    const query = (search?.value || "").trim().toLocaleLowerCase("vi");
    const subject = subjectFilter?.value || "all";
    const level = levelFilter?.value || "all";
    let visible = 0;
    boxes.forEach(box => {
      const item = box.closest(".map-item");
      const topic = (box.dataset.mapItem + " " + (box.parentElement?.textContent || "")).toLocaleLowerCase("vi");
      const matches = (!query || topic.includes(query)) &&
        (subject === "all" || box.dataset.subject === subject) &&
        (level === "all" || box.dataset.level === level);
      item.hidden = !matches;
      if (matches) visible++;
      item.classList.toggle("is-route-match", Boolean(activePath && paths[activePath]?.includes(box.dataset.mapItem)));
    });
    document.querySelectorAll(".map-branch").forEach(branch => {
      const items = [...branch.querySelectorAll(".map-item")];
      const anyVisible = items.some(item => !item.hidden);
      branch.hidden = Boolean(query || subject !== "all" || level !== "all") && !anyVisible;
      if (query || subject !== "all" || level !== "all") branch.open = anyVisible;
    });
    document.querySelectorAll(".map-group").forEach(group => {
      const groupItems = [...group.querySelectorAll(".map-item")];
      const anyVisible = groupItems.some(item => !item.hidden);
      group.hidden = Boolean(query || subject !== "all" || level !== "all") && !anyVisible;
    });
    if (resultCount) resultCount.textContent = visible === boxes.length
      ? "Hiển thị tất cả " + boxes.length + " chủ đề."
      : "Đang hiển thị " + visible + " / " + boxes.length + " chủ đề.";
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
    boxes.forEach(showPrerequisiteHint);
    persist();
  }

  const saved = readSaved();
  boxes.forEach(box => {
    box.checked = saved[box.dataset.mapItem] === true;
    box.addEventListener("change", () => { update(); applyFilters(); });
  });
  update();
  applyFilters();

  reset?.addEventListener("click", () => {
    if (!boxes.some(box => box.checked)) return;
    if (!window.confirm("Bỏ tích toàn bộ tiến độ học trên trình duyệt này?")) return;
    boxes.forEach(box => { box.checked = false; });
    update();
    applyFilters();
  });

  search?.addEventListener("input", applyFilters);
  subjectFilter?.addEventListener("change", applyFilters);
  levelFilter?.addEventListener("change", applyFilters);
  clearFilters?.addEventListener("click", () => {
    if (search) search.value = "";
    if (subjectFilter) subjectFilter.value = "all";
    if (levelFilter) levelFilter.value = "all";
    activePath = null;
    document.querySelectorAll("[data-learning-path]").forEach(button => button.setAttribute("aria-pressed", "false"));
    pathStatus.textContent = "Đã xóa bộ lọc và lựa chọn lộ trình.";
    applyFilters();
  });

  document.querySelectorAll("[data-learning-path]").forEach(button => {
    button.addEventListener("click", () => {
      const chosen = button.dataset.learningPath;
      activePath = activePath === chosen ? null : chosen;
      document.querySelectorAll("[data-learning-path]").forEach(other => {
        other.setAttribute("aria-pressed", String(other === button && activePath === chosen));
      });
      if (activePath) {
        const names = paths[activePath] || [];
        pathStatus.textContent = "Đã làm nổi bật " + names.length + " chủ đề gợi ý. Cuộn xuống bản đồ để xem; bạn vẫn có thể tìm kiếm hoặc lọc môn học.";
        document.querySelectorAll(".map-group").forEach(group => {
          if (names.some(name => boxes.some(box => box.dataset.mapItem === name && box.closest(".map-group") === group))) {
            group.hidden = false;
          }
        });
      } else {
        pathStatus.textContent = "Đã bỏ chọn lộ trình.";
      }
      applyFilters();
      if (activePath) {
        const firstMatch = boxes.find(box => paths[activePath].includes(box.dataset.mapItem));
        firstMatch?.closest(".map-group")?.scrollIntoView({behavior:"smooth", block:"start"});
      }
    });
  });
})();