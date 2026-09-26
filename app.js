const SB_URL="https://dctqsupasambvnyiyccn.supabase.co";
const SB_KEY="sb_publishable_XI18ywtyEn5lme6X6uTWBA_jgtvY3f5";

const headers=()=>({
  "apikey":SB_KEY,
  "Authorization":"Bearer "+(localStorage.getItem("mpc-access-token")||SB_KEY),
  "Content-Type":"application/json"
});

async function sb(path,options={}){
  const r=await fetch(SB_URL+path,{
    ...options,
    headers:{...headers(),...(options.headers||{})}
  });
  const text=await r.text();
  let data=null;
  try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok)throw new Error(data?.message||data?.error_description||text||r.statusText);
  return data;
}

async function ensureAuth(){
  const token=localStorage.getItem("mpc-access-token");
  if(token)return;

  const r=await fetch(SB_URL+"/auth/v1/signup",{
    method:"POST",
    headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
    body:"{}"
  });
  const d=await r.json();

  if(!r.ok)throw new Error(d.message||d.error_description||"Anonymous sign-in failed");
  if(!d.access_token)throw new Error("Anonymous sign-in did not return an access token");

  localStorage.setItem("mpc-access-token",d.access_token);
}

function q(s){return document.querySelector(s)}

function escapeHtml(v){
  return String(v??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    "\"":"&quot;",
    "'":"&#039;"
  }[c]));
}

async function collection(table){
  return sb("/rest/v1/"+table+"?select=*&order=created_at.desc");
}

async function getCaseImageUrl(path){
  if(!path)return null;
  const data=await sb("/storage/v1/object/sign/case-images/"+encodeURIComponent(path),{
    method:"POST",
    body:JSON.stringify({expiresIn:3600})
  });
  return SB_URL+"/storage/v1"+data.signedURL;
}

async function init(){
  if(!document.querySelector("#case-form,#term-form"))return;

  try{
    await ensureAuth();
    initCases();
    initTerms();
  }catch(e){
    console.error(e);
    document.querySelectorAll(".db-error").forEach(x=>{
      x.textContent="Database error: "+e.message
    });
  }
}

async function initCases(){
  const form=q("#case-form");
  if(!form)return;

  const list=q("#case-list");
  const file=q("#case-image");
  const preview=q("#case-preview");
  let selected=null;

  file?.addEventListener("change",()=>{
    selected=file.files?.[0]||null;
    if(!selected){
      preview.hidden=true;
      return;
    }
    preview.src=URL.createObjectURL(selected);
    preview.hidden=false;
  });

  async function render(){
    const data=await collection("cases");

    if(!data?.length){
      list.innerHTML='<p class="empty-state">Chưa có case nào.</p>';
      return;
    }

    const cards=await Promise.all(data.map(async(x,i)=>{
      const imageUrl=x.image_path?await getCaseImageUrl(x.image_path):null;

      return '<article class="saved-card">'+
        '<div class="saved-number">CASE '+String(i+1).padStart(2,"0")+"</div>"+
        "<h3>"+escapeHtml(x.problem)+"</h3>"+
        (x.keywords?
          "<p><strong>Keywords + Units / Numbers</strong><br>"+
          escapeHtml(x.keywords).replace(/\\n/g,"<br>")+"</p>":"")+
        (x.deconstruct_small_problems?
          "<p><strong>Deconstruct → Small Problems</strong><br>"+
          escapeHtml(x.deconstruct_small_problems).replace(/\\n/g,"<br>")+"</p>":"")+
        (imageUrl?
          '<img class="saved-case-image" src="'+escapeHtml(imageUrl)+'" alt="Case image" loading="lazy">':"")+
        '<button class="delete-button" type="button" data-case-delete="'+x.id+'">Xóa case</button>'+
        "</article>";
    }));

    list.innerHTML=cards.join("");
  }

  form.addEventListener("submit",async e=>{
    e.preventDefault();

    const row={
      problem:q("#case-problem").value.trim(),
      keywords:q("#case-keywords").value.trim(),
      deconstruct_small_problems:q("#case-deconstruct").value.trim()
    };

    if(!row.problem||!row.keywords||!row.deconstruct_small_problems){
      return alert("Hãy nhập đủ Problem, Keywords + Units / Numbers và Deconstruct → Small Problems.");
    }

    try{
      if(selected){
        const user=await sb("/auth/v1/user");
        const path=user.id+"/"+crypto.randomUUID()+"-"+selected.name.replace(/[^a-zA-Z0-9._-]/g,"_");

        const r=await fetch(SB_URL+"/storage/v1/object/case-images/"+path,{
          method:"POST",
          headers:{
            "apikey":SB_KEY,
            "Authorization":"Bearer "+localStorage.getItem("mpc-access-token"),
            "Content-Type":selected.type,
            "x-upsert":"false"
          },
          body:selected
        });

        if(!r.ok)throw new Error("Upload ảnh thất bại");
        row.image_path=path;
      }

      await sb("/rest/v1/cases",{
        method:"POST",
        headers:{"Prefer":"return=minimal"},
        body:JSON.stringify(row)
      });

      form.reset();
      preview.hidden=true;
      selected=null;
      await render();
    }catch(e){
      console.error(e);
      alert("Không thể lưu case: "+e.message);
    }
  });

  list.addEventListener("click",async e=>{
    const b=e.target.closest("[data-case-delete]");
    if(!b)return;

    try{
      const row=await sb("/rest/v1/cases?id=eq."+b.dataset.caseDelete+"&select=image_path");
      if(row?.[0]?.image_path){
        await fetch(SB_URL+"/storage/v1/object/case-images/"+row[0].image_path,{
          method:"DELETE",
          headers:{
            "apikey":SB_KEY,
            "Authorization":"Bearer "+localStorage.getItem("mpc-access-token")
          }
        });
      }

      await sb("/rest/v1/cases?id=eq."+b.dataset.caseDelete,{method:"DELETE"});
      await render();
    }catch(e){
      console.error(e);
      alert("Không thể xóa case: "+e.message);
    }
  });

  await render();
}

async function initTerms(){
  const form=q("#term-form");
  if(!form)return;

  const list=q("#term-list");

  async function render(){
    const data=await collection("terms");

    list.innerHTML=data?.length?
      data.map(x=>
        '<article class="term-card"><div><h3>'+
        escapeHtml(x.term)+
        "</h3><p>"+
        escapeHtml(x.explanation)+
        '</p></div><button class="delete-button" type="button" data-term-delete="'+
        x.id+
        '">Xóa</button></article>'
      ).join(""):
      '<p class="empty-state">Chưa có thuật ngữ.</p>';
  }

  form.addEventListener("submit",async e=>{
    e.preventDefault();

    const term=q("#term-name").value.trim();
    const explanation=q("#term-explanation").value.trim();

    if(!term||!explanation)return;

    try{
      await sb("/rest/v1/terms",{
        method:"POST",
        headers:{"Prefer":"return=minimal"},
        body:JSON.stringify({term,explanation})
      });

      form.reset();
      await render();
    }catch(e){
      console.error(e);
      alert("Không thể lưu thuật ngữ: "+e.message);
    }
  });

  list.addEventListener("click",async e=>{
    const b=e.target.closest("[data-term-delete]");
    if(!b)return;

    try{
      await sb("/rest/v1/terms?id=eq."+b.dataset.termDelete,{method:"DELETE"});
      await render();
    }catch(e){
      console.error(e);
      alert("Không thể xóa thuật ngữ: "+e.message);
    }
  });

  await render();
}

const geminiForm=q("#gemini-form");

if(geminiForm)geminiForm.addEventListener("submit",async e=>{
  e.preventDefault();
  const p=q("#gemini-prompt").value.trim();
  if(p)try{await navigator.clipboard.writeText(p)}catch{}
  window.open("https://gemini.google.com/","_blank","noopener,noreferrer")
});

document.addEventListener("DOMContentLoaded",init);