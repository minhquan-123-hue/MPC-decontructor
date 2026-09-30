const SB_URL="https://dctqsupasambvnyiyccn.supabase.co";
const SB_KEY="sb_publishable_XI18ywtyEn5lme6X6uTWBA_jgtvY3f5";
const OWNER_EMAIL="time205gon@gmail.com";
const OWNER_USERNAME="minhquan-123-hue";

const getAccessToken=()=>localStorage.getItem("mpc-access-token");
const getRefreshToken=()=>localStorage.getItem("mpc-refresh-token");

const headers=()=>({
  "apikey":SB_KEY,
  "Authorization":"Bearer "+(getAccessToken()||SB_KEY),
  "Content-Type":"application/json"
});

async function refreshAuth(){
  const refreshToken=getRefreshToken();
  if(!refreshToken)return false;
  const r=await fetch(SB_URL+"/auth/v1/token?grant_type=refresh_token",{
    method:"POST",
    headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({refresh_token:refreshToken})
  });
  const d=await r.json().catch(()=>null);
  if(!r.ok||!d?.access_token||!d?.refresh_token){
    localStorage.removeItem("mpc-access-token");
    localStorage.removeItem("mpc-refresh-token");
    return false;
  }
  localStorage.setItem("mpc-access-token",d.access_token);
  localStorage.setItem("mpc-refresh-token",d.refresh_token);
  return true;
}

async function signIn(password){
  const r=await fetch(SB_URL+"/auth/v1/token?grant_type=password",{
    method:"POST",
    headers:{"apikey":SB_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({email:OWNER_EMAIL,password})
  });
  const d=await r.json().catch(()=>null);
  if(!r.ok||!d?.access_token||!d?.refresh_token){
    throw new Error(d?.message||d?.error_description||"Login failed");
  }
  localStorage.setItem("mpc-access-token",d.access_token);
  localStorage.setItem("mpc-refresh-token",d.refresh_token);
  return d;
}

async function signOut(){
  const token=getAccessToken();
  if(token)await fetch(SB_URL+"/auth/v1/logout",{
    method:"POST",
    headers:{"apikey":SB_KEY,"Authorization":"Bearer "+token}
  }).catch(()=>{});
  localStorage.removeItem("mpc-access-token");
  localStorage.removeItem("mpc-refresh-token");
}

async function currentUser(){
  const token=getAccessToken();
  if(!token)return null;
  let r=await fetch(SB_URL+"/auth/v1/user",{
    headers:{"apikey":SB_KEY,"Authorization":"Bearer "+token}
  });
  if(r.ok)return await r.json();
  if(await refreshAuth()){
    r=await fetch(SB_URL+"/auth/v1/user",{
      headers:{"apikey":SB_KEY,"Authorization":"Bearer "+getAccessToken()}
    });
    if(r.ok)return await r.json();
  }
  return null;
}

async function requireAuth(){
  const user=await currentUser();
  if(user)return user;
  window.location.href="login.html";
  throw new Error("Authentication required");
}

async function sb(path,options={},retry=true){
  const r=await fetch(SB_URL+path,{
    ...options,
    headers:{...headers(),...(options.headers||{})}
  });
  const text=await r.text();
  let data=null;
  try{data=text?JSON.parse(text):null}catch{}
  if(!r.ok){
    const jwtError=r.status===401||data?.code===403||data?.error_code==="bad_jwt";
    if(retry&&jwtError&&await refreshAuth())return sb(path,options,false);
    throw new Error(data?.message||data?.error_description||data?.msg||text||r.statusText);
  }
  return data;
}

function q(s){return document.querySelector(s)}

function escapeHtml(v){
  return String(v??"").replace(/[&<>"']/g,c=>({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"
  }[c]));
}

async function collection(table){
  return sb("/rest/v1/"+table+"?select=*&order=created_at.desc");
}

function encodeStoragePath(path){
  return path.split("/").map(encodeURIComponent).join("/");
}

async function getCaseImageUrl(path){
  if(!path)return null;
  if(/^https?:\/\//i.test(path))return path;
  const data=await sb("/storage/v1/object/sign/case-images/"+encodeStoragePath(path),{
    method:"POST",
    body:JSON.stringify({expiresIn:3600})
  });
  const signedUrl=data?.signedURL||data?.signedUrl;
  if(!signedUrl)throw new Error("Supabase không trả về signed URL cho ảnh");
  return /^https?:\/\//i.test(signedUrl)
    ? signedUrl
    : SB_URL+"/storage/v1"+(signedUrl.startsWith("/")?signedUrl:"/"+signedUrl);
}

async function initLogin(){
  const form=q("#login-form");
  if(!form)return;
  if(await currentUser()){
    window.location.href="cases.html";
    return;
  }
  form.addEventListener("submit",async e=>{
    e.preventDefault();
    const button=form.querySelector("button");
    const error=q("#login-error");
    button.disabled=true;
    error.textContent="";
    try{
      await signIn(q("#login-password").value);
      window.location.href="cases.html";
    }catch(err){
      error.textContent=err.message;
    }finally{
      button.disabled=false;
    }
  });
}

async function initCases(){
  const user=await requireAuth();
  const form=q("#case-form");
  if(!form)return;
  const owner=q("#owner-name");
  if(owner)owner.textContent=OWNER_USERNAME;

  q("#logout-button")?.addEventListener("click",async()=>{
    await signOut();
    window.location.href="login.html";
  });

  const list=q("#case-list");
  const file=q("#case-image");
  const preview=q("#case-preview");
  let selected=null;

  file?.addEventListener("change",()=>{
    selected=file.files?.[0]||null;
    if(!selected){preview.hidden=true;return;}
    preview.src=URL.createObjectURL(selected);
    preview.hidden=false;
  });

  async function render(){
    const data=await collection("cases");
    if(!data?.length){
      list.innerHTML='<p class="empty-state">Chưa có case nào. Đây là notebook mới của bạn.</p>';
      return;
    }
    const cards=await Promise.all(data.map(async(x,i)=>{
      let imageUrl=null;
      let imageError=false;
      if(x.image_path){
        try{imageUrl=await getCaseImageUrl(x.image_path)}
        catch(e){console.error("Không thể tạo URL ảnh:",x.image_path,e);imageError=true}
      }
      return '<article class="saved-card">'+
        '<div class="saved-number">CASE '+String(i+1).padStart(2,"0")+"</div>"+
        "<h3>"+escapeHtml(x.problem)+"</h3>"+
        (x.keywords?"<p><strong>Keywords + Units / Numbers</strong><br>"+escapeHtml(x.keywords).replace(/\\n/g,"<br>")+"</p>":"")+
        (x.deconstruct_small_problems?"<p><strong>Deconstruct → Small Problems</strong><br>"+escapeHtml(x.deconstruct_small_problems).replace(/\\n/g,"<br>")+"</p>":"")+
        (imageUrl?'<img class="saved-case-image" src="'+escapeHtml(imageUrl)+'" alt="Case image" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true;this.nextElementSibling.hidden=false;"><p class="input-note" hidden>Ảnh không thể hiển thị từ URL Storage.</p>':(imageError?'<p class="input-note">Không thể tạo URL cho ảnh đã lưu.</p>':""))+
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
        const path=user.id+"/"+crypto.randomUUID()+"-"+selected.name.replace(/[^a-zA-Z0-9._-]/g,"_");
        const r=await fetch(SB_URL+"/storage/v1/object/case-images/"+encodeStoragePath(path),{
          method:"POST",
          headers:{
            "apikey":SB_KEY,
            "Authorization":"Bearer "+getAccessToken(),
            "Content-Type":selected.type||"application/octet-stream",
            "x-upsert":"false"
          },
          body:selected
        });
        if(!r.ok){
          const d=await r.json().catch(()=>null);
          throw new Error(d?.message||"Upload ảnh thất bại");
        }
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
      const row=await sb("/rest/v1/cases?id=eq."+encodeURIComponent(b.dataset.caseDelete)+"&select=image_path");
      if(row?.[0]?.image_path){
        await fetch(SB_URL+"/storage/v1/object/case-images/"+encodeStoragePath(row[0].image_path),{
          method:"DELETE",
          headers:{"apikey":SB_KEY,"Authorization":"Bearer "+getAccessToken()}
        });
      }
      await sb("/rest/v1/cases?id=eq."+encodeURIComponent(b.dataset.caseDelete),{method:"DELETE"});
      await render();
    }catch(e){
      console.error(e);
      alert("Không thể xóa case: "+e.message);
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

document.addEventListener("DOMContentLoaded",()=>{
  if(q("#login-form"))initLogin().catch(console.error);
  if(q("#case-form"))initCases().catch(e=>{
    if(e.message!=="Authentication required"){
      console.error(e);
      document.querySelectorAll(".db-error").forEach(x=>x.textContent="Database error: "+e.message);
    }
  });
});