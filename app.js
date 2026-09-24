document.addEventListener("DOMContentLoaded",()=>{const q=s=>document.querySelector(s);

function loadList(key){try{return JSON.parse(localStorage.getItem(key)||"[]")}catch{return[]}}
function saveList(key,list){localStorage.setItem(key,JSON.stringify(list))}

const caseForm=q("#case-form");
if(caseForm){
 const file=q("#case-image"), preview=q("#case-preview"), list=q("#case-list");
 let imageData="";
 file?.addEventListener("change",()=>{const f=file.files?.[0];if(!f){imageData="";preview.hidden=true;return}if(!f.type.startsWith("image/")){file.value="";return}const reader=new FileReader();reader.onload=()=>{imageData=reader.result;preview.src=imageData;preview.hidden=false};reader.readAsDataURL(f)});
 function renderCases(){const items=loadList("mpc-cases");list.innerHTML=items.length?items.map((x,i)=>`<article class="saved-card"><div class="saved-number">CASE ${String(i+1).padStart(2,"0")}</div><h3>${escapeHtml(x.problem)}</h3><p><strong>Branches</strong><br>${escapeHtml(x.branches).replace(/\n/g,"<br>")}</p>${x.image?`<img src="${x.image}" alt="Ảnh ghi chú giải quyết vấn đề trên giấy">`:""}<button type="button" class="delete-button" data-delete="${i}">Xóa case</button></article>`).join(""):"<p class='empty-state'>Chưa có case nào. Hãy ghi lại vấn đề đầu tiên bạn đã thực sự giải quyết.</p>"}
 caseForm.addEventListener("submit",e=>{e.preventDefault();const problem=q("#case-problem").value.trim(),branches=q("#case-branches").value.trim();if(!problem||!branches)return;const items=loadList("mpc-cases");items.unshift({problem,branches,image:imageData,createdAt:new Date().toISOString()});try{saveList("mpc-cases",items);caseForm.reset();imageData="";preview.hidden=true;renderCases()}catch{alert("Ảnh quá lớn để lưu trong trình duyệt. Hãy dùng ảnh nhỏ hơn.")}});
 list.addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(!b)return;const items=loadList("mpc-cases");items.splice(Number(b.dataset.delete),1);saveList("mpc-cases",items);renderCases()});renderCases();
}

const geminiForm=q("#gemini-form");\nif(geminiForm){geminiForm.addEventListener("submit",async e=>{e.preventDefault();const prompt=q("#gemini-prompt").value.trim();if(prompt){try{await navigator.clipboard.writeText(prompt)}catch{} }window.open("https://gemini.google.com/","_blank","noopener,noreferrer")})}\n\nconst termForm=q("#term-form");
if(termForm){
 const list=q("#term-list");
 function renderTerms(){const items=loadList("mpc-terms");list.innerHTML=items.length?items.map((x,i)=>`<article class="term-card"><div><h3>${escapeHtml(x.term)}</h3><p>${escapeHtml(x.explanation)}</p></div><button type="button" class="delete-button" data-delete="${i}">Xóa</button></article>`).join(""):"<p class='empty-state'>Chưa có thuật ngữ. Thêm một từ và giải thích theo cách bạn thực sự hiểu nó.</p>"}
 termForm.addEventListener("submit",e=>{e.preventDefault();const term=q("#term-name").value.trim(),explanation=q("#term-explanation").value.trim();if(!term||!explanation)return;const items=loadList("mpc-terms");items.unshift({term,explanation});saveList("mpc-terms",items);termForm.reset();renderTerms()});
 list.addEventListener("click",e=>{const b=e.target.closest("[data-delete]");if(!b)return;const items=loadList("mpc-terms");items.splice(Number(b.dataset.delete),1);saveList("mpc-terms",items);renderTerms()});renderTerms();
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
});