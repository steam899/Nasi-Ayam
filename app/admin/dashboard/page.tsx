// TAMBAH STATE BARU DI ATAS (Dalam komponen AdminDashboard)
const [newStaff, setNewStaff] = useState({ email: '', password: '', fullName: '', branchId: '', role: 'staff' });
const [isAddingStaff, setIsAddingStaff] = useState(false);

// FUNGSI UNTUK TAMBAH STAF VIA API
const handleAddStaff = async () => {
    setIsAddingStaff(true);
    const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        body: JSON.stringify(newStaff)
    });
    const result = await res.json();
    if (result.success) {
        alert("Staf Berjaya Didaftarkan!");
        window.location.reload();
    } else {
        alert("Gagal: " + result.error);
    }
    setIsAddingStaff(false);
};

const handleDeleteStaff = async (id: string) => {
    if(confirm("Hapus akses staf ini?")) {
        // Logik hapus profile
        await supabase.from('profiles').delete().eq('id', id);
        alert("Akses profile dihapus. (Nota: Akaun Auth perlu dipadam manual di Supabase)");
        window.location.reload();
    }
};

// --- GANTIKAN JSX TAB STAFF DENGAN INI ---
{activeTab === 'staff' && (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
        {/* Form Tambah Staf Baru */}
        <div className="bg-white p-8 rounded-[35px] shadow-sm border border-slate-100 space-y-5 h-fit">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-red-50 p-2 rounded-xl text-red-600"><UserPlus size={20}/></div>
                <h3 className="font-black uppercase italic tracking-tight text-slate-800">Daftar Staf Baru</h3>
            </div>
            
            <div className="space-y-4">
                <input type="text" placeholder="NAMA PENUH STAF" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs" onChange={e => setNewStaff({...newStaff, fullName: e.target.value})} />
                <input type="email" placeholder="EMAIL LOGIN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                <input type="password" placeholder="PASSWORD" className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-red-600 font-bold text-xs" onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                
                <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-300 ml-2 uppercase italic">Tugasan Cawangan</label>
                    <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none border-none font-bold text-xs" onChange={e => setNewStaff({...newStaff, branchId: e.target.value})}>
                        <option value="">PILIH CAWANGAN</option>
                        {branches.map(br => (
                            <option key={br.id} value={br.id}>{br.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button 
                onClick={handleAddStaff} 
                disabled={isAddingStaff || !newStaff.email || !newStaff.branchId}
                className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-red-600 transition-all"
            >
                {isAddingStaff ? "SEDANG DIPROSES..." : "DAFTARKAN AKSES STAF"}
            </button>
        </div>

        {/* Senarai Staf & Kawalan */}
        <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-[3px] mb-4">Senarai Kakitangan Aktif</h3>
            <div className="grid gap-4">
                {staffList.map(st => (
                    <div key={st.id} className="bg-white p-6 rounded-[30px] shadow-sm border border-slate-100 flex justify-between items-center group hover:border-red-100 transition-all">
                        <div className="flex items-center gap-4">
                            <div className={`p-4 rounded-2xl font-black ${st.role === 'master' ? 'bg-purple-50 text-purple-600' : 'bg-slate-50 text-slate-400'}`}>
                                {st.full_name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-slate-800 text-sm tracking-tight">{st.full_name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 rounded text-slate-400 uppercase">{st.role}</span>
                                    <span className="text-[9px] font-black text-red-500 uppercase italic">
                                        {st.role === 'master' ? 'All Access' : st.branches?.name}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {st.role !== 'master' && (
                            <button onClick={() => handleDeleteStaff(st.id)} className="opacity-0 group-hover:opacity-100 p-3 text-slate-200 hover:text-red-500 transition-all">
                                <Trash2 size={18}/>
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    </div>
)}
