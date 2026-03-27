import { useEffect, useState } from "react";
import { useApi, useToast, api } from "../utils";
import { Toast, PageHeader, Btn, Modal, Input, Select, Table, Card, Badge, Loading, ErrorBox } from "../components/UI";

const BLOOD = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const empty = { name:"", age:"", gender:"Male", contact:"", address:"", blood_type:"O+" };
const BLOOD_COLORS = { "A+":"#ef4444","A-":"#dc2626","B+":"#3b82f6","B-":"#2563eb","AB+":"#8b5cf6","AB-":"#7c3aed","O+":"#10b981","O-":"#059669" };

export default function Patients() {
  const { data, loading, error, load } = useApi("patients");
  const { toast, show } = useToast();
  const [modal, setModal]   = useState(false);
  const [form, setForm]     = useState(empty);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    load();
  }, [load]);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(empty); setEditId(null); setModal(true); };
  const openEdit = (p) => {
    setForm({ name: p.name, age: p.age, gender: p.gender, contact: p.contact, address: p.address, blood_type: p.blood_type || "O+" });
    setEditId(p._id); setModal(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, age: parseInt(form.age) };
      if (editId) { await api("PUT", `patients/${editId}`, body); show("Patient updated!"); }
      else        { await api("POST", "patients", body);          show("Patient registered!"); }
      setModal(false); load();
    } catch { show("Error saving patient", "err"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    await api("DELETE", `patients/${id}`);
    show("Patient deleted"); load();
  };

  const filtered = data.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) || p.contact?.includes(search)
  );

  const cols = [
    { key: "name",      label: "Patient",    render: p => (
      <div style={{ display:"flex", alignItems:"center", gap: 10 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:"#e0f2fe",
          display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>
          {p.gender === "Female" ? "👩" : "👨"}
        </div>
        <div>
          <div style={{ fontWeight:600, color:"#0f172a" }}>{p.name}</div>
          <div style={{ fontSize:11, color:"#94a3b8" }}>{p._id?.slice(-8)}</div>
        </div>
      </div>
    )},
    { key: "age",       label: "Age",        render: p => `${p.age} yrs` },
    { key: "gender",    label: "Gender" },
    { key: "blood_type",label: "Blood",      render: p => p.blood_type ? <Badge label={p.blood_type} color={BLOOD_COLORS[p.blood_type]}/> : "—" },
    { key: "contact",   label: "Contact" },
    { key: "address",   label: "Address",    render: p => <span style={{color:"#64748b"}}>{p.address}</span> },
    { key: "actions",   label: "Actions",    render: p => (
      <div style={{ display:"flex", gap:6 }}>
        <Btn variant="ghost" onClick={() => openEdit(p)}>Edit</Btn>
        <Btn variant="danger" onClick={() => del(p._id)}>Delete</Btn>
      </div>
    )},
  ];

  return (
    <div>
      <Toast toast={toast} />
      <PageHeader
        title="Patients"
        sub={`${data.length} total records`}
        action={<Btn onClick={openAdd}>+ Register Patient</Btn>}
      />

      {error && <ErrorBox msg={error} />}

      <Card>
        <div style={{ padding: "14px 18px", borderBottom: "1px solid #f1f5f9", display:"flex", gap:12 }}>
          <input
            placeholder="Search by name or contact..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex:1, padding:"8px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none", fontFamily:"inherit" }}
          />
        </div>
        {loading ? <Loading /> : <Table cols={cols} rows={filtered} emptyMsg="No patients registered yet." />}
      </Card>

      {modal && (
        <Modal title={editId ? "Edit Patient" : "Register New Patient"} onClose={() => setModal(false)}>
          <form onSubmit={submit}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={{ gridColumn:"1/-1" }}>
                <Input label="Full Name *" required value={form.name} onChange={e => f("name", e.target.value)} placeholder="e.g. Kamal Perera"/>
              </div>
              <Input label="Age *" type="number" min="0" max="150" required value={form.age} onChange={e => f("age", e.target.value)} placeholder="35"/>
              <Select label="Gender" value={form.gender} onChange={e => f("gender", e.target.value)}>
                <option>Male</option><option>Female</option><option>Other</option>
              </Select>
              <Input label="Contact *" required value={form.contact} onChange={e => f("contact", e.target.value)} placeholder="0771234567"/>
              <Select label="Blood Type" value={form.blood_type} onChange={e => f("blood_type", e.target.value)}>
                {BLOOD.map(b => <option key={b}>{b}</option>)}
              </Select>
              <div style={{ gridColumn:"1/-1" }}>
                <Input label="Address *" required value={form.address} onChange={e => f("address", e.target.value)} placeholder="Colombo, Sri Lanka"/>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"flex-end", gap:10, marginTop:20 }}>
              <Btn variant="ghost" onClick={() => setModal(false)}>Cancel</Btn>
              <Btn type="submit">{editId ? "Update" : "Register"}</Btn>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}