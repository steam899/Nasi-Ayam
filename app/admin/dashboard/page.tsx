"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, Users, QrCode, LogOut, MapPin, 
  CheckCircle, Plus, Store, UserPlus, Trash2, BarChart3,
  Edit3, Save, X, Loader2, Download, Calendar, Clock, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [profile, setProfile] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Report Filter States
  const [reportFilterBranch, setReportFilterBranch] = useState('all');
  const [reportFilterStatus, setReportFilterStatus] = useState('all');
  const [reportSortBy, setReportSortBy] = useState('date-desc'); // date-desc, date-asc, time-desc, time-asc
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Form States
  const [newBranch, setNewBranch] = useState({ name: '', address: '', whatsapp: '' });
  const [newStaff, setNewStaff] = useState({ email: '', password: '', fullName: '', branchId: '', role: 'staff' });
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*, branches(name)').eq('id', user.id).single();
      if (!prof) {
          router.push('/admin/login');
          return;
      }
      setProfile(prof);
      fetchData(prof);
    } else {
      router.push('/admin/login');
    }
  }

  async function fetchData(prof: any) {
    setLoading(true);
    // 1. Fetch Bookings
    let bQuery = supabase.from('bookings').select('*, branches(name)').order('created_at', { ascending: false });
    if (prof.role === 'staff') bQuery = bQuery.eq('branch_id', prof.branch_id);
    const { data: bData } = await bQuery;
    setBookings(bData || []);

    // 2. Fetch Branches & Staff (Master Only)
    if (prof.role === 'master') {
      const { data: brData } = await supabase.from('branches').select('*');
      setBranches(brData || []);
      
      const { data: stData } = await supabase.from('profiles').select('*, branches(name)').order('role', { ascending: false });
      setStaffList(stData || []);
    }
    setLoading(false);
  }

  // --- LOGIK STAFF & MASTER ---
  const handleCheckIn = async (id: string) => {
    await supabase.from('bookings').update({ status: 'checked_in' }).eq('id', id);
    alert("Pelanggan Check-in!");
    fetchData(profile);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // --- LOGIK MASTER: PENGURUSAN STAF ---
  const handleAddStaff = async () => {
    if (!newStaff.email || !newStaff.password || !newStaff.branchId) return alert("Sila lengkapkan data!");
    setIsProcessing(true);
    const res = await fetch('/api/admin/create-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaff)
    });
    const result = await res.json();
    if (result.success) {
        alert("Staf Berjaya Didaftarkan!");
        setNewStaff({ email: '', password: '', fullName: '', branchId: '', role: 'staff' });
        fetchData(profile);
    } else {
        alert("Error: " + result.error);
    }
    setIsProcessing(false);
  };

  const handleUpdateStaff = async () => {
    setIsProcessing(true);
    const res = await fetch('/api/admin/update-staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: editingStaff.id,
            fullName: editingStaff.full_name,
            branchId: editingStaff.branch_id,
            role: editingStaff.role
        })
    });
    const result = await res.json();
    if (result.success) {
        alert("Data staf dikemaskini!");
        setEditingStaff(null);
        fetchData(profile);
    }
    setIsProcessing(false);
  };

  const handleDeleteStaff = async (id: string) => {
    if(confirm("Hapus akses staf ini?")) {
        await supabase.from('profiles').delete().eq('id', id);
        fetchData(profile);
    }
  };

  // --- LOGIK MASTER: CAWANGAN ---
  const handleAddBranch = async () => {
    await supabase.from('branches').insert([{ name: newBranch.name, address: newBranch.address, whatsapp_number: newBranch.whatsapp }]);
    alert("Cawangan ditambah!");
    setNewBranch({ name: '', address: '', whatsapp: '' });
    fetchData(profile);
  };

  const handleDeleteBranch = async (id: string) => {
    if(confirm("Hapus cawangan ini?")) {
        await supabase.from('branches').delete().eq('id', id);
        fetchData(profile);
    }
  };

  // --- REPORT FILTERING & SORTING ---
  const getFilteredAndSortedBookings = () => {
    let filtered = [...bookings];

    // Filter by branch
    if (reportFilterBranch !== 'all') {
      filtered = filtered.filter(b => b.branch_id === reportFilterBranch);
    }

    // Filter by status
    if (reportFilterStatus !== 'all') {
      filtered = filtered.filter(b => b.status === reportFilterStatus);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter(b => new Date(b.created_at) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(b => new Date(b.created_at) <= toDate);
    }

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      if (reportSortBy === 'date-desc') return dateB.getTime() - dateA.getTime();
      if (reportSortBy === 'date-asc') return dateA.getTime() - dateB.getTime();
      if (reportSortBy === 'time-desc') {
        const timeA = dateA.getHours() * 60 + dateA.getMinutes();
        const timeB = dateB.getHours() * 60 + dateB.getMinutes();
        return timeB - timeA;
      }
      if (reportSortBy === 'time-asc') {
        const timeA = dateA.getHours() * 60 + dateA.getMinutes();
        const timeB = dateB.getHours() * 60 + dateB.getMinutes();
        return timeA - timeB;
      }
      return 0;
    });

    return filtered;
  };

  // --- DOWNLOAD REPORT ---
  const downloadReport = () => {
    const filteredData = getFilteredAndSortedBookings();
    
    const csvContent = [
      ['LAPORAN TEMPAHAN NASI AYAM', new Date().toLocaleString('ms-MY')].join(' | '),
      [],
      ['Tarikh', 'Masa', 'Nama Pelanggan', 'No. Telefon', 'Cawangan', 'Status', 'Nota'],
      ...filteredData.map(b => {
        const bookingDate = new Date(b.created_at);
        return [
          bookingDate.toLocaleDateString('ms-MY'),
          bookingDate.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' }),
          b.customer_name,
          b.customer_phone,
          b.branches?.name || '-',
          b.status === 'checked_in' ? 'Selesai' : 'Menunggu',
          b.notes || ''
        ];
      })
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent));
    element.setAttribute('download', `Laporan_Tempahan_${new Date().getTime()}.csv`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // --- DOWNLOAD PDF REPORT ---
  const downloadPdfReport = () => {
    const filteredData = getFilteredAndSortedBookings();
    
    let htmlContent = `
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Laporan Tempahan</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
          .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
          .header h1 { color: #1f2937; margin: 0; font-size: 24px; }
          .header p { color: #6b7280; margin: 5px 0 0 0; }
          .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
          .summary-card { background: white; padding: 15px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .summary-card h3 { color: #6b7280; margin: 0 0 10px 0; font-size: 12px; font-weight: bold; }
          .summary-card .value { font-size: 28px; font-weight: bold; color: #1f2937; }
          table { width: 100%; border-collapse: collapse; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          th { background: #f9fafb; padding: 12px; text-align: left; font-weight: bold; color: #374151; font-size: 12px; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          tr:nth-child(even) { background: #f9fafb; }
          .status-completed { color: #10b981; background: #ecfdf5; padding: 4px 8px; border-radius: 4px; }
          .status-pending { color: #f59e0b; background: #fffbeb; padding: 4px 8px; border-radius: 4px; }
          .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>LAPORAN TEMPAHAN NASI AYAM HANA</h1>
          <p>Dijana pada ${new Date().toLocaleString('ms-MY')}</p>
        </div>
        
        <div class="summary">
          <div class="summary-card">
            <h3>JUMLAH TEMPAHAN</h3>
            <div class="value">${filteredData.length}</div>
          </div>
          <div class="summary-card">
            <h3>SIAP DIAMBIL</h3>
            <div class="value" style="color: #10b981;">${filteredData.filter(b => b.status === 'checked_in').length}</div>
          </div>
          <div class="summary-card">
            <h3>MENUNGGU SLOT</h3>
            <div class="value" style="color: #f59e0b;">${filteredData.filter(b => b.status === 'confirmed').length}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Tarikh</th>
              <th>Masa</th>
              <th>Nama Pelanggan</th>
              <th>No. Telefon</th>
              <th>Cawangan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map(b => {
              const bookingDate = new Date(b.created_at);
              const statusClass = b.status === 'checked_in' ? 'status-completed' : 'status-pending';
              const statusText = b.status === 'checked_in' ? 'Selesai' : 'Menunggu';
              return `
                <tr>
                  <td>${bookingDate.toLocaleDateString('ms-MY')}</td>
                  <td>${bookingDate.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td>${b.customer_name}</td>
                  <td>+${b.customer_phone}</td>
                  <td>${b.branches?.name || '-'}</td>
                  <td><span class="${statusClass}">${statusText}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Laporan ini dijana secara automatik dari sistem NAHA Panel</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'width=900,height=600');
    printWindow?.document.write(htmlContent);
    printWindow?.document.close();
    printWindow?.print();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold uppercase tracking-widest text-slate-300 animate-pulse text-xs">Memuatkan Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white border-r p-8 space-y-10 shadow-sm z-20">
        <div className="flex items-center gap-3">
            <img src="/logo.png" className="h-10" />
            <span className="font-black italic text-lg tracking-tighter uppercase">NAHA Panel</span>
        </div>

        <nav className="space-y-2">
          <button onClick={() => setActiveTab('bookings')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'bookings' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
            <LayoutDashboard size={18}/> Tempahan
          </button>

          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'reports' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
            <BarChart3 size={18}/> Laporan
          </button>

          {profile?.role === 'master' && (
            <>
              <button onClick={() => setActiveTab('branches')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'branches' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
                <Store size={18}/> Urus Cawangan
              </button>
              <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-sm transition-all ${activeTab === 'staff' ? 'bg-red-600 text-white' : 'text-slate-400 hover:bg-red-50 hover:text-red-600'}`}>
                <Users size={18}/> Pengurusan Staf
              </button>
            </>
          )}
          
          <a href="/admin/scan" className="w-full flex items-center gap-3 p-4 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-2xl font-bold text-sm transition-all">
            <QrCode size={18}/> Scan QR Tiket
          </a>
        </nav>

        <div className="pt-10 border-t">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Akaun Login</p>
            <p className="font-bold text-slate-700 mt-1 truncate uppercase">{profile?.full_name}</p>
            <div className="mt-4 flex items-center justify-between">
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 flex items-center gap-2 hover:underline"><LogOut size={14}/> Log Keluar</button>
            </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-grow p-6 md:p-12 overflow-y-auto pb-20">
        
        <header className="mb-10 flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-black text-slate-800 uppercase italic">
                    {activeTab === 'bookings' && 'Senarai Tempahan'}
                    {activeTab === 'branches' && 'Urus Cawangan'}
                    {activeTab === 'staff' && 'Akses Staf'}
                    {activeTab === 'reports' && 'Analisis Laporan'}
                </h1>
                <p className="text-slate-400 font-medium text-sm">Log masuk sebagai <span className="text-red-600 font-bold uppercase underline italic">{profile?.role === 'master' ? 'Master Admin' : 'Staff'}</span></p>
            </div>
        </header>

        {/* TAB: REPORTS */}
        {activeTab === 'reports' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Total Tempahan</p>
                        <p className="text-4xl font-black text-slate-800 mt-2">{getFilteredAndSortedBookings().length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Pelanggan Sampai</p>
                        <p className="text-4xl font-black text-green-500 mt-2">{getFilteredAndSortedBookings().filter(b => b.status === 'checked_in').length}</p>
                    </div>
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Menunggu Slot</p>
                        <p className="text-4xl font-black text-amber-500 mt-2">{getFilteredAndSortedBookings().filter(b => b.status === 'confirmed').length}</p>
                    </div>
                </div>

                {/* FILTER & SORT CONTROLS */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6">
                    <h3 className="font-black text-slate-800 uppercase italic mb-4 tracking-tight flex items-center gap-2">
                        <Filter size={18} className="text-red-600"/> Penapis & Isihan
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        {/* Branch Filter */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-2">Cawangan</label>
                            <select 
                                value={reportFilterBranch} 
                                onChange={e => setReportFilterBranch(e.target.value)}
                                className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-xs uppercase text-slate-600 border border-slate-100 focus:border-red-600 transition-colors">
                                <option value="all">Semua Cawangan</option>
                                {branches.map(br => <option key={br.id} value={br.id}>{br.name}</option>)}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-2">Status</label>
                            <select 
                                value={reportFilterStatus} 
                                onChange={e => setReportFilterStatus(e.target.value)}
                                className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-xs uppercase text-slate-600 border border-slate-100 focus:border-red-600 transition-colors">
                                <option value="all">Semua Status</option>
                                <option value="confirmed">Menunggu Slot</option>
                                <option value="checked_in">Siap Diambil</option>
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-2 flex items-center gap-1">
                                <Calendar size={12}/> Dari Tarikh
                            </label>
                            <input 
                                type="date" 
                                value={dateFrom}
                                onChange={e => setDateFrom(e.target.value)}
                                className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-xs text-slate-600 border border-slate-100 focus:border-red-600 transition-colors" />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-2 flex items-center gap-1">
                                <Calendar size={12}/> Hingga Tarikh
                            </label>
                            <input 
                                type="date" 
                                value={dateTo}
                                onChange={e => setDateTo(e.target.value)}
                                className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-xs text-slate-600 border border-slate-100 focus:border-red-600 transition-colors" />
                        </div>

                        {/* Sort By */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic block mb-2 flex items-center gap-1">
                                <Clock size={12}/> Isihan
                            </label>
                            <select 
                                value={reportSortBy} 
                                onChange={e => setReportSortBy(e.target.value)}
                                className="w-full p-3 bg-slate-50 rounded-xl outline-none font-bold text-xs uppercase text-slate-600 border border-slate-100 focus:border-red-600 transition-colors">
                                <option value="date-desc">Tarikh Terbaru</option>
                                <option value="date-asc">Tarikh Terlama</option>
                                <option value="time-desc">Masa Lewat</option>
                                <option value="time-asc">Masa Awal</option>
                            </select>
                        </div>
                    </div>

                    {/* Download Buttons */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button 
                            onClick={downloadReport}
                            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-colors shadow-lg">
                            <Download size={16}/> Muat Turun CSV
                        </button>
                        <button 
                            onClick={downloadPdfReport}
                            className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-red-700 transition-colors shadow-lg">
                            <Download size={16}/> Cetak Laporan
                        </button>
                    </div>
                </div>

                {/* BRANCH PERFORMANCE (Master Only) */}
                {profile?.role === 'master' && (
                    <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100">
                        <h3 className="font-black text-slate-800 uppercase italic mb-6 tracking-tight">Prestasi Mengikut Cawangan</h3>
                        <div className="space-y-4">
                            {branches.map(br => {
                                const count = getFilteredAndSortedBookings().filter(b => b.branch_id === br.id).length;
                                const percentage = getFilteredAndSortedBookings().length > 0 ? (count / getFilteredAndSortedBookings().length) * 100 : 0;
                                return (
                                    <div key={br.id} className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span>{br.name}</span>
                                            <span>{count} Tempahan ({percentage.toFixed(1)}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                            <div className="bg-red-600 h-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* DETAILED TABLE */}
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-black text-slate-800 uppercase italic tracking-tight">Butiran Tempahan ({getFilteredAndSortedBookings().length})</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <tr>
                                    <th className="p-4">Tarikh & Masa</th>
                                    <th className="p-4">Pelanggan</th>
                                    <th className="p-4">No. Telefon</th>
                                    <th className="p-4">Cawangan</th>
                                    <th className="p-4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {getFilteredAndSortedBookings().map((b) => {
                                    const bookingDate = new Date(b.created_at);
                                    return (
                                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-700 text-xs">{bookingDate.toLocaleDateString('ms-MY')}</p>
                                                <p className="text-[10px] text-slate-400">{bookingDate.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit' })}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-bold text-slate-700 uppercase text-sm">{b.customer_name}</p>
                                            </td>
                                            <td className="p-4 text-[10px] text-slate-400 font-bold">+{b.customer_phone}</td>
                                            <td className="p-4 italic font-bold text-slate-400 text-[10px] uppercase">{b.branches?.name}</td>
                                            <td className="p-4">
                                                {b.status === 'checked_in' ? (
                                                    <span className="text-[9px] font-black text-green-500 uppercase bg-green-50 px-3 py-1.5 rounded-full italic tracking-widest">Selesai</span>
                                                ) : (
                                                    <span className="text-[9px] font-black text-amber-600 uppercase bg-amber-50 px-3 py-1.5 rounded-full italic tracking-widest">Menunggu</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* TAB: BOOKINGS */}
        {activeTab === 'bookings' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2">
                <div className="bg-white rounded-[35px] shadow-sm border border-slate-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Pelanggan</th>
                                <th className="p-6">Cawangan</th>
                                <th className="p-6 text-center">Tindakan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {bookings.map((b) => (
                                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-6">
                                        <p className="font-bold text-slate-700 uppercase text-sm leading-none mb-1">{b.customer_name}</p>
                                        <p className="text-[10px] text-slate-300 font-bold italic">+{b.customer_phone}</p>
                                    </td>
                                    <td className="p-6 italic font-bold text-slate-400 text-[10px] uppercase">{b.branches?.name}</td>
                                    <td className="p-6 text-center">
                                        {b.status === 'confirmed' ? (
                                            <button onClick={() => handleCheckIn(b.id)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mx-auto">
                                                <CheckCircle size={14}/> Check-in
                                            </button>
                                        ) : (
                                            <span className="text-[9px] font-black text-green-500 uppercase bg-green-50 px-4 py-2 rounded-full italic tracking-widest">Selesai</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* TAB: BRANCHES */}
        {activeTab === 'branches' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[40px] shadow-sm border h-fit space-y-6">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight text-slate-800"><Plus className="text-red-600" /> Tambah Outlet</h3>
                    <input 
                        type="text" 
                        placeholder="NAMA CAWANGAN" 
                        value={newBranch.name}
                        onChange={e => setNewBranch({...newBranch, name: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" />
                    <input 
                        type="text" 
                        placeholder="ALAMAT RINGKAS" 
                        value={newBranch.address}
                        onChange={e => setNewBranch({...newBranch, address: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" />
                    <input 
                        type="tel" 
                        placeholder="WHATSAPP (601...)" 
                        value={newBranch.whatsapp}
                        onChange={e => setNewBranch({...newBranch, whatsapp: e.target.value})}
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" />
                    <button 
                        onClick={handleAddBranch} 
                        className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-red-700 transition-colors">
                        Simpan Cawangan
                    </button>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {branches.map(br => (
                        <div key={br.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:border-red-100">
                            <div className="flex items-center gap-5">
                                <div className="bg-slate-50 p-5 rounded-2xl text-slate-300 group-hover:text-red-600 transition-colors"><Store/></div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight">{br.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{br.address}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDeleteBranch(br.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* TAB: STAFF (MASTER ONLY - FULL MANAGEMENT) */}
        {activeTab === 'staff' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Register/Edit Staff */}
                <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-100 space-y-6 h-fit">
                    <h3 className="font-black uppercase italic text-sm flex items-center gap-2 tracking-tight">
                        <div className="bg-red-50 p-2 rounded-lg text-red-600"><UserPlus size={18}/></div> 
                        {editingStaff ? 'Edit Maklumat Staf' : 'Daftar Staf Baru'}
                    </h3>
                    
                    <div className="space-y-3">
                        <input type="text" placeholder="NAMA PENUH" 
                            className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs uppercase" 
                            value={editingStaff ? editingStaff.full_name : newStaff.fullName}
                            onChange={e => editingStaff ? setEditingStaff({...editingStaff, full_name: e.target.value}) : setNewStaff({...newStaff, fullName: e.target.value})} />
                        
                        {!editingStaff && (
                            <>
                                <input type="email" placeholder="EMAIL LOGIN" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" onChange={e => setNewStaff({...newStaff, email: e.target.value})} />
                                <input type="password" placeholder="PASSWORD" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-xs" onChange={e => setNewStaff({...newStaff, password: e.target.value})} />
                            </>
                        )}

                        <select className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-black text-[10px] uppercase text-slate-500" 
                            value={editingStaff ? editingStaff.branch_id : newStaff.branchId}
                            onChange={e => editingStaff ? setEditingStaff({...editingStaff, branch_id: e.target.value}) : setNewStaff({...newStaff, branchId: e.target.value})}>
                            <option value="">-- TUGASKAN CAWANGAN --</option>
                            {branches.map(br => <option key={br.id} value={br.id}>{br.name.toUpperCase()}</option>)}
                        </select>
                    </div>

                    {editingStaff ? (
                        <div className="flex gap-2">
                            <button onClick={handleUpdateStaff} disabled={isProcessing} className="flex-grow bg-slate-900 text-white p-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                {isProcessing ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Simpan
                            </button>
                            <button onClick={() => setEditingStaff(null)} className="bg-slate-100 p-4 rounded-2xl text-slate-400 hover:text-red-500 transition-colors"><X size={14}/></button>
                        </div>
                    ) : (
                        <button onClick={handleAddStaff} disabled={isProcessing} className="w-full bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-red-700 transition-colors disabled:opacity-50">
                            {isProcessing ? "Memproses..." : "Daftarkan Staf"}
                        </button>
                    )}
                </div>

                {/* List Staff */}
                <div className="lg:col-span-2 space-y-4">
                    {staffList.map(st => (
                        <div key={st.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-slate-50 flex justify-between items-center group transition-all hover:border-red-100">
                            <div className="flex items-center gap-5">
                                <div className={`p-5 rounded-2xl font-black text-lg ${st.role === 'master' ? 'bg-purple-50 text-purple-600' : 'bg-slate-100 text-slate-300'}`}>{st.full_name.charAt(0).toUpperCase()}</div>
                                <div>
                                    <h4 className="font-black uppercase text-slate-800 tracking-tight text-sm leading-none mb-1">{st.full_name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase ${st.role === 'master' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{st.role === 'master' ? 'Master' : 'Staff'}</span>
                                        <span className="text-[9px] font-black text-slate-300 uppercase italic">{st.role === 'master' ? 'All HQ Access' : st.branches?.name}</span>
                                    </div>
                                </div>
                            </div>
                            {st.role !== 'master' && (
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => setEditingStaff(st)} className="p-3 text-slate-200 hover:text-blue-500 transition-colors"><Edit3 size={18}/></button>
                                    <button onClick={() => handleDeleteStaff(st.id)} className="p-3 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

      </div>
    </div>
  );
}
