import { useState, useEffect } from "react";
const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
type User = { id:number; name:string; email:string; dob:string; phone:string; nic:string; username:string; };

export default function App(){
  const [view,setView]=useState<"register"|"login"|"profile">(()=>localStorage.getItem("token")?"profile":"register");
  const [token,setToken]=useState(()=>localStorage.getItem("token")||"");
  const [user,setUser]=useState<User|null>(()=>{const s=localStorage.getItem("user"); return s?JSON.parse(s):null;});
  const [firstName,setFirstName]=useState(""); const [lastName,setLastName]=useState("");
  const [dob,setDob]=useState(""); const [gender,setGender]=useState("");
  const [email,setEmail]=useState(""); const [phone,setPhone]=useState("");
  const [nic,setNic]=useState(""); const [password,setPassword]=useState(""); const [password_confirmation,setPasswordConfirm]=useState("");
  const [showPass,setShowPass]=useState(false); const [loginUsername,setLoginUsername]=useState(""); const [loginPassword,setLoginPassword]=useState("");
  const [editName,setEditName]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [success,setSuccess]=useState("");

  const baseHeaders = { "Accept":"application/json", "Content-Type":"application/json" };
  const authHeaders = ()=> ({...baseHeaders, "Authorization":`Bearer ${token}` });

  const handleRegister = async (e:React.FormEvent)=>{
    e.preventDefault(); if(password!==password_confirmation){ setError("Passwords don't match"); return; }
    setLoading(true); setError("");
    try{
   const res = await fetch(`${API_BASE}/register`, {
  method: "POST",
  headers: baseHeaders,
 body: JSON.stringify({
  name: `${firstName} ${lastName}`.trim(),
  username: `${firstName}${lastName}`.toLowerCase(), // මේ line එක අලුතෙන් දාන්න
  email: email.trim(),
  dob: dob,
  phone: phone,
  nic: nic,
  password: password,
  password_confirmation: password_confirmation
}),
});
      const data = await res.json(); if(!res.ok) throw data;
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token); setUser(data.user); setEditName(data.user.name); setView("profile");
    }catch(err:any){ setError((err.message||"Register failed")+" "+JSON.stringify(err.errors||err)); } finally{ setLoading(false); }
  };
  const handleLogin = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setError("");
    try{
      const res = await fetch(`${API_BASE}/login`,{ method:"POST", headers: baseHeaders, body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }) });
      const data = await res.json(); if(!res.ok) throw data;
      localStorage.setItem("token", data.token); localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token); setUser(data.user); setEditName(data.user.name); setView("profile");
    }catch(err:any){ setError(err.message||"Login failed"); } finally{ setLoading(false); }
  };
  const fetchProfile = async ()=>{
    const res = await fetch(`${API_BASE}/profile`,{ headers: authHeaders() });
    if(res.status===401){ handleLogout(); return; }
    const data = await res.json(); const u=data.user?data.user:data; setUser(u); setEditName(u.name); localStorage.setItem("user", JSON.stringify(u));
  };
  useEffect(()=>{ if(token && view==="profile") fetchProfile(); },[view]);
  const handleUpdate = async (e:React.FormEvent)=>{
    e.preventDefault(); setLoading(true); setSuccess(""); setError("");
    try{
      const res = await fetch(`${API_BASE}/profile`,{ method:"PUT", headers: authHeaders(), body: JSON.stringify({ name: editName }) });
      const data=await res.json(); if(!res.ok) throw data;
      setUser(data.user); localStorage.setItem("user", JSON.stringify(data.user)); setSuccess("Profile Updated Successfully!");
    }catch(err:any){ setError(err.message); } finally{ setLoading(false); }
  };
  const handleLogout = async ()=>{
    try{ await fetch(`${API_BASE}/logout`,{ method:"POST", headers: authHeaders() }); }catch{}
    localStorage.clear(); setToken(""); setUser(null); setView("login");
  };
  const inputStyle={width:"100%", padding:10, borderRadius:8, border:"none", marginTop:5} as any;
  const labelStyle={fontWeight:600, fontSize:14} as any;

  if(view==="profile" && user){
    return (
    <div style={{background:"#e6f0ff", minHeight:"100vh", display:"flex", justifyContent:"center", padding:20}}>
      <div style={{background:"#a9d1ff", padding:30, borderRadius:15, width:500}}>
        <h1 style={{textAlign:"center" ,marginBottom:"20"}}>Profile</h1>
        {error && <p style={{color:"red", background:"white", padding:8, borderRadius:6}}>{error}</p>}
        {success && <p style={{color:"green", background:"white", padding:8, borderRadius:6}}>{success}</p>}
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Username:</b> {user.name}</p>
        <p><b>NIC:</b> {user.nic}</p>
        <p><b>Phone:</b> {user.phone}</p>
        <p><b>DOB:</b> {user.dob? user.dob.substring(0,10) : ""}</p>
        <form onSubmit={handleUpdate} style={{marginTop:20}}>
          <label style={labelStyle}>Update Name Only</label>
          <input style={inputStyle} value={editName} onChange={e=>setEditName(e.target.value)} required/>
          <button style={{width:"100%", padding:12, marginTop:10, background:"#2563eb", color:"white", border:"none", borderRadius:8}} disabled={loading}>Update</button>
        </form>
        <button onClick={handleLogout} style={{width:"100%", padding:12, marginTop:15, background:"#dc3545", color:"white", border:"none", borderRadius:8}}>Logout</button>
      </div>
    </div>
    )
  }

  return (
    <div style={{background:"#f2f2f2", minHeight:"100vh", display:"flex", justifyContent:"center", padding:20}}>
      <div style={{background:"#a9d1ff", padding:30, borderRadius:15, width:600}}>
        <h1 style={{textAlign:"center", marginBottom:"20px"}}>Create Your Profile</h1>
        <div style={{display:"flex", gap:10, justifyContent:"center", marginBottom:15}}><button onClick={()=>setView("register")} style={{padding:"6px 12px", background:view==="register"?"#2563eb":"white", color:view==="register"?"white":"black", borderRadius:6, border:"none"}}>Register</button><button onClick={()=>setView("login")} style={{padding:"6px 12px", background:view==="login"?"#2563eb":"white", color:view==="login"?"white":"black", borderRadius:6, border:"none"}}>Login</button></div>
        {error && <p style={{color:"red", background:"white", padding:8, borderRadius:6, fontSize:13, whiteSpace:"pre-wrap"}}>{error}</p>}
        <form onSubmit={view==="register"?handleRegister:handleLogin} noValidate>
          {view==="register" && <>
            <div style={{display:"flex", gap:15}}><div style={{flex:1}}><label style={labelStyle}>First Name</label><input style={inputStyle} value={firstName} onChange={e=>setFirstName(e.target.value)}placeholder="John" required/></div><div style={{flex:1}}><label style={labelStyle}>Last Name</label><input style={inputStyle} value={lastName} onChange={e=>setLastName(e.target.value)} placeholder="Deo"required/></div></div>
            <div style={{display:"flex", gap:15, marginTop:15}}><div style={{flex:1}}><label style={labelStyle}>DOB</label><input type="date" style={inputStyle} value={dob} onChange={e=>setDob(e.target.value)} required/></div><div style={{flex:1}}><label style={labelStyle}>Gender</label><select style={inputStyle} value={gender} onChange={e=>setGender(e.target.value)}><option>Male</option><option>Female</option></select></div></div>
            <div style={{marginTop:15}}><label style={labelStyle}>Email</label><input type="email" style={inputStyle} value={email} onChange={e=>setEmail(e.target.value)} placeholder="john8888@gmail.com" required/></div>
            <div style={{marginTop:15}}><label style={labelStyle}>Phone</label><input style={inputStyle} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+94770000000"required/></div>
            <div style={{marginTop:15}}><label style={labelStyle}>NIC</label><input style={inputStyle} value={nic} onChange={e=>setNic(e.target.value)} placeholder="200410101010" required/></div>
            <div style={{marginTop:15}}><label style={labelStyle}>Password</label><div style={{display:"flex", gap:8, alignItems:"center"}}><input type={showPass?"text":"password"} style={{flex:1, padding:10, borderRadius:8, border:"none", marginTop:5}} value={password} onChange={e=>setPassword(e.target.value)} required/><span onClick={()=>setShowPass(!showPass)} style={{color:"#2563eb", cursor:"pointer", fontWeight:600}}>{showPass?"Hide":"Show"}</span></div></div>
            <div style={{marginTop:15}}><label style={labelStyle}>Confirm Password</label><input type="password" style={inputStyle} value={password_confirmation} onChange={e=>setPasswordConfirm(e.target.value)} required/></div>
          </>}
          {view==="login" && <>
            <label style={labelStyle}>Username / Email / NIC</label><input style={inputStyle} value={loginUsername} onChange={e=>setLoginUsername(e.target.value)} required/>
            <div style={{marginTop:15}}><label style={labelStyle}>Password</label><input type="password" style={inputStyle} value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} required/></div>
          </>}
          <button type="submit" disabled={loading} style={{width:"100%", padding:12, marginTop:20, background:"#2563eb", color:"white", border:"none", borderRadius:8, fontWeight:700}}>{loading?"Loading...":view==="register"?"Register":"Login"}</button>
        </form>
      </div>
    </div>
  );
}