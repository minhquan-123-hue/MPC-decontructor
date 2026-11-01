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

  // Helpful learning suggestions, not hard gates or a single mandatory sequence.
  const prerequisites = {
    "Đạo hàm và tốc độ thay đổi": ["Khái niệm hàm số, tập xác định và tập giá trị", "Giới hạn và tính liên tục"],
    "Nguyên hàm và tích phân": ["Đạo hàm và tốc độ thay đổi"],
    "Phương trình vi phân cơ bản": ["Đạo hàm và tốc độ thay đổi", "Phương trình và bất phương trình"],
    "Phương trình và bất phương trình": ["Biểu thức đại số, biến và hằng số"],
    "Định luật Newton": ["Lực và biểu diễn lực", "Vận tốc và gia tốc"],
    "Công, công suất và hiệu suất": ["Lực và biểu diễn lực", "Quãng đường, độ dịch chuyển và tốc độ"],
    "Động năng, thế năng và cơ năng": ["Công, công suất và hiệu suất"],
    "Lưu lượng thể tích và vận tốc dòng chảy": ["Độ dài, diện tích, thể tích và đơn vị đo", "Quãng đường, độ dịch chuyển và tốc độ"],
    "Phương trình liên tục và Bernoulli": ["Lưu lượng thể tích và vận tốc dòng chảy", "Áp suất và áp suất chất lỏng"],
    "Lập và cân bằng phương trình hóa học": ["Nguyên tố hóa học và ký hiệu hóa học", "Phân tử, đơn chất và hợp chất"],
    "Tính toán theo phương trình hóa học": ["Lập và cân bằng phương trình hóa học", "Mol và khối lượng mol"],
    "Nồng độ phần trăm và nồng độ mol": ["Mol và khối lượng mol", "Tỉ số, tỉ lệ, phần trăm và tốc độ đơn giản"],
    "Tốc độ phản ứng hóa học": ["Nồng độ phần trăm và nồng độ mol", "Lập và cân bằng phương trình hóa học"],
    "Phản ứng thuận nghịch và cân bằng hóa học": ["Tốc độ phản ứng hóa học"],
    "DNA, gene và nhiễm sắc thể": ["Tế bào nhân sơ và tế bào nhân thực"],
    "Quy luật di truyền Mendel": ["DNA, gene và nhiễm sắc thể"],
    "Quang hợp và các yếu tố ảnh hưởng": ["Tế bào nhân sơ và tế bào nhân thực", "Trao đổi chất và chuyển hóa năng lượng trong tế bào"],
    "Sinh trưởng và sinh sản của vi sinh vật": ["Tế bào nhân sơ và tế bào nhân thực", "Trao đổi chất và chuyển hóa năng lượng trong tế bào"],
    "Động học sinh trưởng vi sinh vật": ["Sinh trưởng và sinh sản của vi sinh vật", "Hàm số mũ và hàm số logarit"],
    "Phân hủy sinh học và xử lý nước thải": ["Sinh trưởng và sinh sản của vi sinh vật", "Tốc độ phản ứng hóa học", "Nồng độ phần trăm và nồng độ mol"]
  };

  const paths = {
    water: [
      "Tỉ số, tỉ lệ, phần trăm và tốc độ đơn giản",
      "Phân tích thứ nguyên và kiểm tra đơn vị",
      "Phương trình vi phân cơ bản",
      "Lưu lượng thể tích và vận tốc dòng chảy",
      "Áp suất và áp suất chất lỏng",
      "Nồng độ phần trăm và nồng độ mol",
      "Thang pH và chất chỉ thị",
      "Tốc độ phản ứng hóa học",
      "Sinh trưởng và sinh sản của vi sinh vật",
      "Quần thể và sự tăng trưởng quần thể",
      "Hệ sinh thái và diễn thế sinh thái",
      "Phân hủy sinh học và xử lý nước thải"
    ],
    motion: [
      "Đại lượng vật lý, đơn vị SI và phép đo",
      "Độ dài, diện tích, thể tích và đơn vị đo",
      "Quãng đường, độ dịch chuyển và tốc độ",
      "Vận tốc và gia tốc",
      "Lực và biểu diễn lực",
      "Định luật Newton",
      "Áp suất và áp suất chất lỏng",
      "Lưu lượng thể tích và vận tốc dòng chảy",
      "Phương trình liên tục và Bernoulli"
    ],
    plant: [
      "Tỉ số, tỉ lệ, phần trăm và tốc độ đơn giản",
      "Thu thập, phân loại và biểu diễn dữ liệu",
      "Quang hợp và các yếu tố ảnh hưởng",
      "Hấp thụ nước và chất khoáng",
      "Vận chuyển nước và thoát hơi nước",
      "Trao đổi chất và chuyển hóa năng lượng trong tế bào",
      "Nguyên tố hóa học và ký hiệu hóa học",
      "Mol và khối lượng mol",
      "Thiết kế thí nghiệm sinh học"
    ]
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
      const topic = (box.dataset.mapItem + " " + (box.parentElement?.textContent || "") + " " + (box.dataset.grade || "")).toLocaleLowerCase("vi");
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
    pathStatus.textContent = "Đã xóa bộ lọc và lựa chọn problem.";
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
        pathStatus.textContent = "Đã làm nổi bật " + names.length + " chủ đề gợi ý. Cuộn xuống bản đồ để xem.";
      } else {
        pathStatus.textContent = "Đã bỏ chọn problem.";
      }
      applyFilters();
      if (activePath) {
        const firstMatch = boxes.find(box => paths[activePath].includes(box.dataset.mapItem));
        firstMatch?.closest(".map-group")?.scrollIntoView({behavior:"smooth", block:"start"});
      }
    });
  });
})();