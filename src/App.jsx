import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronDown, 
  Search, 
  MapPin, 
  Briefcase, 
  Award,
  Activity,
  LayoutDashboard,
  Store,
  Filter,
  TrendingUp,
  ShoppingCart,
  Target,
  Building2,
  Calendar,
  RefreshCcw,
  Clock
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  LineChart
} from 'recharts';

// --- CSV PARSER (Membaca data sebenar dari Google Sheets) ---
const parseCSV = (str) => {
  const arr = [];
  let quote = false;
  let row = 0, col = 0, c = 0;
  for (; c < str.length; c++) {
      let cc = str[c], nc = str[c+1];
      arr[row] = arr[row] || [];
      arr[row][col] = arr[row][col] || '';
      if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
      if (cc == '"') { quote = !quote; continue; }
      if (cc == ',' && !quote) { ++col; continue; }
      if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
      if (cc == '\n' && !quote) { ++row; col = 0; continue; }
      if (cc == '\r' && !quote) { ++row; col = 0; continue; }
      arr[row][col] += cc;
  }
  
  // Bersihkan kepala lajur daripada BOM (\ufeff) dan ruang kosong
  const headers = arr[0] ? arr[0].map(h => h ? h.trim().replace(/^\ufeff/, '') : '') : [];
  const data = [];
  for (let i = 1; i < arr.length; i++) {
      if (arr[i].length === 1 && arr[i][0] === '') continue; // Abaikan baris kosong
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
          if (headers[j]) obj[headers[j]] = arr[i][j] ? arr[i][j].trim() : '';
      }
      data.push(obj);
  }
  return data;
};

// --- NORMALIZE BULAN ---
const normalizeBulan = (val) => {
  if (!val) return 'Tiada';
  const clean = val.toString().trim().toLowerCase();
  
  if (clean === '1' || clean === '01' || clean.includes('jan')) return 'Jan';
  if (clean === '2' || clean === '02' || clean.includes('feb')) return 'Feb';
  if (clean === '3' || clean === '03' || clean.includes('mac') || clean.includes('mar')) return 'Mac';
  if (clean === '4' || clean === '04' || clean.includes('apr')) return 'Apr';
  if (clean === '5' || clean === '05' || clean.includes('mei') || clean.includes('may')) return 'Mei';
  if (clean === '6' || clean === '06' || clean.includes('jun')) return 'Jun';
  if (clean === '7' || clean === '07' || clean.includes('jul')) return 'Jul';
  if (clean === '8' || clean === '08' || clean.includes('ogo') || clean.includes('aug')) return 'Ogo';
  if (clean === '9' || clean === '09' || clean.includes('sep')) return 'Sep';
  if (clean === '10' || clean.includes('okt') || clean.includes('oct')) return 'Okt';
  if (clean === '11' || clean === 'nov') return 'Nov';
  if (clean === '12' || clean === 'dis' || clean.includes('dec')) return 'Dis';
  
  return val;
};

// --- MOCK DATA GENERATOR (Dijana sekali sahaja secara statik di peringkat modul) ---
const generateMockTransaksi = () => {
  const data = [];
  const months = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  const pics = [
    'Elvy Yulinda Sudirman',
    'Mohammad Syauqi Mohd Jamil',
    'Mohd Rosaidil AB Rafar',
    'Tajul Rosli Abd Hamid',
    'Noorshazana Ishak',
    'Norfirdaus Ahmad',
    'Norreshida Mohd Kori',
    'Nur Ilyana Izzati',
    'Nurul Amiza Paimin',
    'Nurul Hasna binti Khalil'
  ];
  const categories = ['Runcit', 'Borong', 'Pasaraya Besar', 'Kedai Serbaneka', 'Koperasi Sekolah', 'NonCoop'];
  const states = ['Selangor', 'Kuala Lumpur', 'Johor', 'Pulau Pinang', 'Perak', 'Kedah', 'Sabah', 'Sarawak'];
  const koperasis = Array.from({length: 30}, (_, i) => `Koperasi Pembangunan ${i+1} Bhd`);

  for (let i = 0; i < 500; i++) {
    const monthIdx = Math.floor(Math.random() * 4); // Hanya Jan - Apr yang ada data
    const poAmount = Math.floor(Math.random() * 50000) + 5000;
    const invAmount = poAmount * (Math.random() * 0.2 + 0.8);
    
    data.push({
      'TAHUN': '2026',
      'BULAN': months[monthIdx],
      'MINGGU': Math.floor(Math.random() * 4) + 1 + (monthIdx * 4),
      'DISTRIBUTION TYPE': Math.random() > 0.5 ? 'Direct' : 'Distributor',
      'BRAND': 'KPNiaga Brand ' + (Math.floor(Math.random() * 3) + 1),
      'KOPERASI': koperasis[Math.floor(Math.random() * koperasis.length)],
      'OUTLET': `Outlet Cawangan ${Math.floor(Math.random() * 100)}`,
      'PO AMOUNT (RM)': poAmount,
      'INVOICE AMOUNT (RM)': invAmount,
      'P.I.C. SALES': pics[Math.floor(Math.random() * pics.length)],
      'KATEGORI OUTLET': categories[Math.floor(Math.random() * categories.length)],
      'NEGERI': states[Math.floor(Math.random() * states.length)],
    });
  }
  return data;
};

const generateMockOutlet = () => {
  const data = [];
  const jkans = [
    'Johor',
    'Selangor',
    'Negeri Sembilan',
    'Kedah',
    'Kelantan',
    'Wilayah Persekutuan',
    'Melaka',
    'Pahang Barat',
    'Pahang Tengah',
    'Pahang Timur',
    'Perak',
    'Perlis',
    'Pulau Pinang',
    'Sabah',
    'Sarawak',
    'Terengganu'
  ];
  const koperasis = Array.from({length: 3655}, (_, i) => `Koperasi KPNiaga ${i+1} Bhd`);

  koperasis.forEach((kop, i) => {
    const isAktif = Math.random() < 0.4; 
    const year = 2019 + Math.floor(Math.random() * 8); // 2019 - 2026
    const month = Math.floor(Math.random() * 12) + 1;
    const totalSales = isAktif ? Math.floor(Math.random() * 500000) + 10000 : 0;

    data.push({
      'NO': i + 1,
      'NAMA SYARIKAT': kop,
      'DUN': `DUN ${Math.floor(Math.random() * 50)}`,
      'PARLIMEN': `P${Math.floor(Math.random() * 100) + 100}`,
      'JKAN': jkans[Math.floor(Math.random() * jkans.length)],
      'KATEGORI': 'Pengguna',
      'TARIKH DAFTAR': `${year}-${month.toString().padStart(2, '0')}-${Math.floor(Math.random() * 28) + 1}`,
      'TAHUN DAFTAR': year,
      'BULAN DAFTAR': normalizeBulan(month),
      'MINGGU DAFTAR': Math.floor(Math.random() * 52) + 1,
      'JUMLAH JUALAN': totalSales,
      'AKTIF': totalSales > 0
    });
  });
  return data;
};

const stableMockTransaksi = generateMockTransaksi();
const stableMockOutlet = generateMockOutlet();

// --- HELPER FUNCTIONS ---
const formatRM = (val) => new Intl.NumberFormat('ms-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
const formatNum = (val) => new Intl.NumberFormat('ms-MY').format(val);
const COLORS = ['#2563eb', '#0d9488', '#e11d48', '#d97706', '#7c3aed', '#0284c7', '#059669', '#dc2626'];

// --- SEPARATE KPI CARD COMPONENT ---
const KPICard = ({ title, value, icon: Icon, colorClass, subtitle, valueColorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 flex items-center justify-between transition-transform hover:-translate-y-1 duration-200">
    <div>
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${valueColorClass || 'text-slate-800'}`}>{value}</h3>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
      <Icon className={`w-6 h-6 ${colorClass.split(' ')[1] || 'text-blue-600'}`} />
    </div>
  </div>
);

// --- CUSTOM LABEL FOR PIE CHART (Mengikuti Gaya fail "image_2bf9c1.png") ---
const renderCustomizedLabel = (props) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent, name, index } = props;
  const RADIAN = Math.PI / 180;
  
  // Ambil sudut untuk menentukan koordinat paksi-x dan y
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  
  // Titik mula di pinggir bulatan Pie
  const sx = cx + (outerRadius + 2) * cos;
  const sy = cy + (outerRadius + 2) * sin;
  
  // Titik tengah bengkokan talian penunjuk (leader line)
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  
  // Titik akhir mendatar mengikut arah kanan atau kiri
  const ex = mx + (cos >= 0 ? 1 : -1) * 15;
  const ey = my;
  
  const textAnchor = cos >= 0 ? 'start' : 'end';
  const percentage = percent ? `${(percent * 100).toFixed(0)}%` : '0%';
  const color = COLORS[index % COLORS.length];

  return (
    <g>
      {/* Talian Penunjuk (Connector line) */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={color} strokeWidth={1.5} fill="none" />
      {/* Label Teks Kategori & Nilai Peratusan */}
      <text
        x={ex + (cos >= 0 ? 1 : -1) * 5}
        y={ey}
        textAnchor={textAnchor}
        fill={color}
        dominantBaseline="middle"
        className="text-[11px] font-semibold"
      >
        {`${name} ${percentage}`}
      </text>
    </g>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('transaksi');
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  // Data States
  const [dataTransaksi, setDataTransaksi] = useState([]);
  const [dataOutlet, setDataOutlet] = useState([]);

  // Filters State - Transaksi
  const [filterT, setFilterT] = useState({ bulan: 'Semua', minggu: 'Semua', pic: 'Semua', kategori: 'Semua', negeri: 'Semua' });
  // Filters State - Outlet
  const [filterO, setFilterO] = useState({ tahun: 'Semua', bulan: 'Semua', minggu: 'Semua', jkan: 'Semua' });

  const TARGET_SALES = 13475500;

  // PIC dibenarkan sahaja
  const allowedPICs = useMemo(() => [
    'Elvy Yulinda Sudirman',
    'Mohammad Syauqi Mohd Jamil',
    'Mohd Rosaidil AB Rafar',
    'Tajul Rosli Abd Hamid',
    'Noorshazana Ishak',
    'Norfirdaus Ahmad',
    'Norreshida Mohd Kori',
    'Nur Ilyana Izzati',
    'Nurul Amiza Paimin',
    'Nurul Hasna binti Khalil'
  ].map(name => name.trim().toLowerCase()), []);

  // Fungsi penarik data dinamik daripada Google Sheets secara langsung dengan Cache-Buster
  const fetchLiveDatabase = async (isBackground = false) => {
    if (isBackground) {
      setSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      // Penjana parameter rawak masa nyata (cache-busting) untuk menembusi simpanan cache pelayar
      const cacheBust = Date.now();

      // 1. Dapatkan Sheet Transaksi
      const urlTransaksi = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR6i7so7I2PFFuiBfZFkLLZcEP8WPxp0d_USe0OJgdcAe8tSJcshuiquOJ-3rqjv2BiJtyrPeemDP_A/pub?output=csv&single=true&_t=${cacheBust}`;
      const resT = await fetch(urlTransaksi);
      const textT = await resT.text();
      const parsedT = parseCSV(textT);
      
      const formatT = parsedT
        .filter(row => row['TAHUN']) 
        .map(row => ({
          ...row,
          'BULAN': normalizeBulan(row['BULAN']),
          'PO AMOUNT (RM)': parseFloat(row['PO AMOUNT (RM)']?.replace(/,/g, '') || 0),
          'INVOICE AMOUNT (RM)': parseFloat(row['INVOICE AMOUNT (RM)']?.replace(/,/g, '') || 0),
          'MINGGU': parseInt(row['MINGGU'] || 0)
        }));
      
      if (formatT.length > 0) {
        setDataTransaksi(formatT);
      } else {
        setDataTransaksi(stableMockTransaksi);
      }

      // 2. Dapatkan Sheet Outlet (GID: 1114526685)
      const urlOutlet = `https://docs.google.com/spreadsheets/d/e/2PACX-1vR6i7so7I2PFFuiBfZFkLLZcEP8WPxp0d_USe0OJgdcAe8tSJcshuiquOJ-3rqjv2BiJtyrPeemDP_A/pub?output=csv&single=true&gid=1114526685&_t=${cacheBust}`;
      
      try {
        const resO = await fetch(urlOutlet);
        const textO = await resO.text();
        const parsedO = parseCSV(textO);
        
        if (parsedO.length > 0 && parsedO[0]['JKAN'] !== undefined) {
          const formatO = parsedO
            .filter(row => row['NAMA SYARIKAT'])
            .map(row => {
              const jualan = parseFloat(row['JUMLAH JUALAN']?.replace(/,/g, '') || 0);
              
              let tDaftar = row['TARIKH DAFTAR'] || '';
              let tTahun = 'Tiada', tBulan = 'Tiada', tMinggu = '1';
              if (tDaftar) {
                  const match1 = tDaftar.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/); 
                  const match2 = tDaftar.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/); 
                  if (match1) {
                      tTahun = match1[1]; tBulan = normalizeBulan(parseInt(match1[2]));
                  } else if (match2) {
                      tTahun = match2[3]; tBulan = normalizeBulan(parseInt(match2[2]));
                  }
              }
              
              return {
                ...row,
                'TAHUN DAFTAR': tTahun,
                'BULAN DAFTAR': tBulan,
                'MINGGU DAFTAR': tMinggu,
                'JUMLAH JUALAN': jualan,
                'AKTIF': jualan > 0
              };
            });
          setDataOutlet(formatO);
        } else {
          setDataOutlet(stableMockOutlet);
        }
      } catch(e) {
        console.warn("Gagal fetch Outlet. Menggunakan Data Simulasi.", e);
        setDataOutlet(stableMockOutlet);
      }

      // Ambil cap masa terkini sebagai petunjuk kepada pengguna
      const now = new Date();
      setLastUpdated(now.toLocaleTimeString('ms-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

    } catch (error) {
      console.error("Gagal menarik data langsung, kembali kepada Data Simulasi.", error);
      if (dataTransaksi.length === 0) {
        setDataTransaksi(stableMockTransaksi);
        setDataOutlet(stableMockOutlet);
      }
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  // Jalankan fetch pertama apabila dashboard dimuatkan, dan bina sistem auto-polling (60 saat)
  useEffect(() => {
    fetchLiveDatabase();

    const intervalId = setInterval(() => {
      fetchLiveDatabase(true); // Segarkan secara senyap di latar belakang
    }, 60000); // 60,000 milisaat = 60 Saat

    return () => clearInterval(intervalId); // Bersihkan pemasa apabila halaman ditutup
  }, []);

  // --- DERIVED DATA (TRANSAKSI) ---
  const filteredTransaksi = useMemo(() => {
    return dataTransaksi.filter(d => {
      return (filterT.bulan === 'Semua' || d.BULAN === filterT.bulan) &&
             (filterT.minggu === 'Semua' || d.MINGGU.toString() === filterT.minggu.toString()) &&
             (filterT.pic === 'Semua' || d['P.I.C. SALES'] === filterT.pic) &&
             (filterT.kategori === 'Semua' || d['KATEGORI OUTLET'] === filterT.kategori) &&
             (filterT.negeri === 'Semua' || d.NEGERI === filterT.negeri);
    });
  }, [dataTransaksi, filterT]);

  const statsT = useMemo(() => {
    const jumlahJualan = filteredTransaksi.reduce((acc, curr) => acc + curr['INVOICE AMOUNT (RM)'], 0);
    const jumlahTempahan = filteredTransaksi.reduce((acc, curr) => acc + curr['PO AMOUNT (RM)'], 0);
    const pencapaian = (jumlahJualan / TARGET_SALES) * 100;
    const uniqueKoperasi = new Set(filteredTransaksi.map(d => d.KOPERASI)).size;
    
    let valueColorClass = 'text-emerald-600';
    if (pencapaian < 50) {
      valueColorClass = 'text-rose-600';
    } else if (pencapaian < 80) {
      valueColorClass = 'text-amber-500';
    }

    return { jumlahJualan, jumlahTempahan, pencapaian, uniqueKoperasi, valueColorClass };
  }, [filteredTransaksi]);

  const chartTrendJualan = useMemo(() => {
    const grouped = filteredTransaksi.reduce((acc, curr) => {
      if (!acc[curr.BULAN]) acc[curr.BULAN] = 0;
      acc[curr.BULAN] += curr['INVOICE AMOUNT (RM)'];
      return acc;
    }, {});
    const order = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    return order
      .filter(m => grouped[m] !== undefined && grouped[m] > 0)
      .map(m => ({ name: m, Jualan: grouped[m] }));
  }, [filteredTransaksi]);

  const chartTaburanKategori = useMemo(() => {
    const grouped = filteredTransaksi.reduce((acc, curr) => {
      if (!acc[curr['KATEGORI OUTLET']]) acc[curr['KATEGORI OUTLET']] = 0;
      acc[curr['KATEGORI OUTLET']] += curr['INVOICE AMOUNT (RM)'];
      return acc;
    }, {});
    return Object.keys(grouped).map(k => ({ name: k, value: grouped[k] }));
  }, [filteredTransaksi]);

  const chartPrestasiPIC = useMemo(() => {
    const grouped = filteredTransaksi.reduce((acc, curr) => {
      const picName = curr['P.I.C. SALES'] || '';
      if (allowedPICs.includes(picName.trim().toLowerCase())) {
        if (!acc[picName]) acc[picName] = 0;
        acc[picName] += curr['PO AMOUNT (RM)'];
      }
      return acc;
    }, {});
    return Object.keys(grouped).map(k => ({ name: k, Tempahan: grouped[k] })).sort((a, b) => b.Tempahan - a.Tempahan);
  }, [filteredTransaksi, allowedPICs]);

  const tableSenaraiKoperasi = useMemo(() => {
    const grouped = filteredTransaksi.reduce((acc, curr) => {
      const kopName = (curr.KOPERASI || '').trim();
      const catOutlet = (curr['KATEGORI OUTLET'] || '').trim().toLowerCase();
      
      if (kopName.toLowerCase().includes('noncoop') || catOutlet === 'noncoop') {
        return acc;
      }

      const kopUpper = kopName.toUpperCase();
      if (!acc[kopUpper]) acc[kopUpper] = { name: kopUpper, tempahan: 0, jualan: 0 };
      acc[kopUpper].tempahan += curr['PO AMOUNT (RM)'];
      acc[kopUpper].jualan += curr['INVOICE AMOUNT (RM)'];
      return acc;
    }, {});
    return Object.values(grouped).sort((a, b) => b.jualan - a.jualan).slice(0, 100); 
  }, [filteredTransaksi]);

  // --- DERIVED DATA (OUTLET) ---
  const filteredOutlet = useMemo(() => {
    return dataOutlet.filter(d => {
      return (filterO.tahun === 'Semua' || d['TAHUN DAFTAR'].toString() === filterO.tahun.toString()) &&
             (filterO.bulan === 'Semua' || d['BULAN DAFTAR'].toString() === filterO.bulan.toString()) &&
             (filterO.minggu === 'Semua' || d['MINGGU DAFTAR'].toString() === filterO.minggu.toString()) &&
             (filterO.jkan === 'Semua' || d.JKAN === filterO.jkan);
    });
  }, [dataOutlet, filterO]);

  const statsO = useMemo(() => {
    const totalDaftar = filteredOutlet.length;
    const totalAktif = filteredOutlet.filter(d => d.AKTIF).length;
    return { totalDaftar, totalAktif };
  }, [filteredOutlet]);

  const chartPendaftaran = useMemo(() => {
    const key = filterO.tahun === 'Semua' ? 'TAHUN DAFTAR' : 'BULAN DAFTAR';
    
    const grouped = filteredOutlet.reduce((acc, curr) => {
      const val = curr[key];
      if (val === 'Tiada' || val === undefined) return acc;
      if (!acc[val]) {
        acc[val] = { daftar: 0, aktif: 0 };
      }
      acc[val].daftar++;
      if (curr.AKTIF) {
        acc[val].aktif++;
      }
      return acc;
    }, {});

    const monthOrder = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

    return Object.keys(grouped)
      .sort((a, b) => {
        if (filterO.tahun === 'Semua') return parseInt(a) - parseInt(b);
        return monthOrder.indexOf(a) - monthOrder.indexOf(b);
      })
      .map(k => ({ 
        name: k, 
        Daftar: grouped[k].daftar,
        Aktif: grouped[k].aktif
      }));
  }, [filteredOutlet, filterO.tahun]);

  const chartJkan = useMemo(() => {
    const grouped = filteredOutlet.reduce((acc, curr) => {
      const jkan = curr.JKAN || 'Tiada JKAN';
      if (!acc[jkan]) {
        acc[jkan] = { daftar: 0, aktif: 0 };
      }
      acc[jkan].daftar++;
      if (curr.AKTIF) {
        acc[jkan].aktif++;
      }
      return acc;
    }, {});

    return Object.keys(grouped)
      .sort((a, b) => a.localeCompare(b))
      .map(k => ({ 
        name: k, 
        Daftar: grouped[k].daftar,
        Aktif: grouped[k].aktif
      }));
  }, [filteredOutlet]);

  const getUniqueVals = (data, key) => ['Semua', ...new Set(data.map(d => d[key]))].sort();

  const sortedMonthsFilter = useMemo(() => {
    const order = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    return ['Semua', ...order];
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-600 font-medium text-lg">Memuatkan Papan Pemuka KPNiaga...</p>
          <p className="text-slate-400 text-sm mt-1">Mengambil data masa nyata daripada Google Sheets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">KPNiaga<span className="text-blue-600 font-light">Analytics</span></h1>
            </div>

            {/* LIVE DATA SYNC STATUS CONTROL */}
            <div className="hidden md:flex items-center space-x-3 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100 text-xs text-slate-500">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Penyelarasan Live Aktif</span>
              </div>
              {lastUpdated && (
                <span className="text-slate-400 border-l border-slate-200 pl-2">
                  Segar: {lastUpdated}
                </span>
              )}
              <button 
                onClick={() => fetchLiveDatabase(true)} 
                disabled={syncing}
                className="hover:text-blue-600 focus:outline-none disabled:opacity-50 flex items-center space-x-1"
                title="Sinc data sekarang"
              >
                <RefreshCcw className={`w-3.5 h-3.5 ml-1 ${syncing ? 'animate-spin text-blue-600' : ''}`} />
                <span>{syncing ? 'Segar...' : 'Semak'}</span>
              </button>
            </div>
            
            {/* TABS NAVIGATION */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('transaksi')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'transaksi' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Transaksi Jualan</span>
              </button>
              <button
                onClick={() => setActiveTab('outlet')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'outlet' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>Data Outlet</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* SYNC INDICATOR MOBILE */}
        <div className="md:hidden flex justify-between items-center mb-4 bg-white p-3 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Kemaskini: {lastUpdated || 'Baru Selesai'}</span>
          </div>
          <button 
            onClick={() => fetchLiveDatabase(true)} 
            disabled={syncing}
            className="text-blue-600 flex items-center space-x-1 font-semibold"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Kemas...' : 'Kemas Kini Sekarang'}</span>
          </button>
        </div>

        {/* --- TAB 1: TRANSAKSI --- */}
        {activeTab === 'transaksi' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* FILTER BAR */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
              <div className="flex items-center text-slate-500 mr-2">
                <Filter className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Penapis:</span>
              </div>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" 
                      value={filterT.bulan} onChange={e => setFilterT({...filterT, bulan: e.target.value})}>
                {sortedMonthsFilter.map(v => <option key={v} value={v}>{v === 'Semua' ? 'Bulan (Semua)' : v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                      value={filterT.minggu} onChange={e => setFilterT({...filterT, minggu: e.target.value})}>
                <option value="Semua">Minggu (Semua)</option>
                {getUniqueVals(dataTransaksi, 'MINGGU').filter(v=>v!=='Semua').sort((a,b)=>a-b).map(v => <option key={v} value={v}>Minggu {v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                      value={filterT.pic} onChange={e => setFilterT({...filterT, pic: e.target.value})}>
                <option value="Semua">Pegawai Jualan (Semua)</option>
                {getUniqueVals(dataTransaksi, 'P.I.C. SALES').filter(v => v !== 'Semua' && allowedPICs.includes(v.trim().toLowerCase())).map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                      value={filterT.kategori} onChange={e => setFilterT({...filterT, kategori: e.target.value})}>
                <option value="Semua">Kategori Outlet (Semua)</option>
                {getUniqueVals(dataTransaksi, 'KATEGORI OUTLET').filter(v=>v!=='Semua').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border"
                      value={filterT.negeri} onChange={e => setFilterT({...filterT, negeri: e.target.value})}>
                <option value="Semua">Negeri (Semua)</option>
                {getUniqueVals(dataTransaksi, 'NEGERI').filter(v=>v!=='Semua').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* SCORECARDS (KPI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <KPICard title="Jumlah Jualan" value={formatRM(statsT.jumlahJualan)} icon={TrendingUp} colorClass="bg-blue-100 text-blue-600" subtitle={`Dari jumlah inbois`} />
              <KPICard title="Jumlah Tempahan Diterima" value={formatRM(statsT.jumlahTempahan)} icon={ShoppingCart} colorClass="bg-teal-100 text-teal-600" subtitle="Dari jumlah tempahan diterima" />
              <KPICard title="Pencapaian (%)" value={`${statsT.pencapaian.toFixed(1)}%`} icon={Target} colorClass="bg-amber-100 text-amber-600" valueColorClass={statsT.valueColorClass} subtitle={`Sasaran: ${formatRM(TARGET_SALES)}`} />
              <KPICard title="Jumlah Koperasi Tempahan" value={formatNum(statsT.uniqueKoperasi)} icon={Building2} colorClass="bg-purple-100 text-purple-600" subtitle="Koperasi berbeza (Unique)" />
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trend Jualan Mengikut Bulan */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center"><Calendar className="w-5 h-5 mr-2 text-slate-400" /> Trend Jualan Mengikut Bulan (RM)</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartTrendJualan} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis tickFormatter={(val) => `RM${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip formatter={(value) => formatRM(value)} cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="Jualan" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                      <Line type="monotone" dataKey="Jualan" stroke="#0ea5e9" strokeWidth={3} dot={{r: 4, fill: '#fff', stroke: '#0ea5e9', strokeWidth: 2}} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Taburan Jualan Mengikut Kategori (Solid Pie Chart - Mengikuti Gambar image_2bf9c1.png) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center"><Store className="w-5 h-5 mr-2 text-slate-400" /> Taburan Jualan Mengikut Kategori Outlet</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <Pie 
                        data={chartTaburanKategori} 
                        cx="50%" 
                        cy="50%" 
                        outerRadius={75} 
                        dataKey="value" 
                        label={renderCustomizedLabel}
                        labelLine={false}
                      >
                        {chartTaburanKategori.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => formatRM(value)} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Prestasi Pegawai Jualan */}
               <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2 text-slate-400" /> Prestasi Pegawai Jualan (Tempahan Diterima)</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart layout="vertical" data={chartPrestasiPIC} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                      <XAxis type="number" tickFormatter={(val) => `RM${(val/1000).toFixed(0)}k`} axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 11, fontWeight: 500}} width={150} />
                      <RechartsTooltip formatter={(value) => formatRM(value)} cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Bar dataKey="Tempahan" fill="#10b981" radius={[0, 4, 4, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Senarai Prestasi Koperasi (Table) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center"><Award className="w-5 h-5 mr-2 text-slate-400" /> Senarai Prestasi Koperasi</h3>
                <div className="overflow-x-auto h-80 relative rounded-lg border border-slate-200">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 sticky top-0 shadow-sm z-10">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Nama Koperasi</th>
                        <th className="px-4 py-3 font-semibold text-right">Jumlah Tempahan</th>
                        <th className="px-4 py-3 font-semibold text-right">Jumlah Jualan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableSenaraiKoperasi.length > 0 ? tableSenaraiKoperasi.map((row, i) => (
                        <tr key={i} className="bg-white border-b hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                          <td className="px-4 py-3 text-right text-teal-600 font-medium">{formatRM(row.tempahan)}</td>
                          <td className="px-4 py-3 text-right text-blue-600 font-medium">{formatRM(row.jualan)}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="px-4 py-8 text-center text-slate-400">Tiada data dijumpai</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: OUTLET --- */}
        {activeTab === 'outlet' && (
          <div className="space-y-6 animate-fade-in">
             {/* FILTER BAR */}
             <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap gap-4 items-center">
              <div className="flex items-center text-slate-500 mr-2">
                <Filter className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">Penapis (Pendaftaran):</span>
              </div>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border" 
                      value={filterO.tahun} onChange={e => setFilterO({...filterO, tahun: e.target.value})}>
                <option value="Semua">Tahun (Semua)</option>
                {getUniqueVals(dataOutlet, 'TAHUN DAFTAR').filter(v=>v!=='Semua' && v!=='Tiada').sort().map(v => <option key={v} value={v}>{v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
                      value={filterO.bulan} onChange={e => setFilterO({...filterO, bulan: e.target.value})}>
                {sortedMonthsFilter.map(v => <option key={v} value={v}>{v === 'Semua' ? 'Bulan (Semua)' : v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
                      value={filterO.minggu} onChange={e => setFilterO({...filterO, minggu: e.target.value})}>
                <option value="Semua">Minggu (Semua)</option>
                {getUniqueVals(dataOutlet, 'MINGGU DAFTAR').filter(v=>v!=='Semua').sort((a,b)=>a-b).map(v => <option key={v} value={v}>Minggu {v}</option>)}
              </select>
              <select className="text-sm border-slate-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 p-2 border"
                      value={filterO.jkan} onChange={e => setFilterO({...filterO, jkan: e.target.value})}>
                <option value="Semua">JKAN (Semua)</option>
                {getUniqueVals(dataOutlet, 'JKAN').filter(v=>v!=='Semua').map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            {/* SCORECARDS (KPI) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wide">Koperasi Daftar Keseluruhan</p>
                  <h3 className="text-4xl font-extrabold text-slate-800">{formatNum(statsO.totalDaftar)}</h3>
                </div>
                <div className="p-4 rounded-full bg-slate-100 text-slate-600">
                  <UserPlusIcon className="w-10 h-10" />
                </div>
              </div>
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-sm p-6 flex items-center justify-between text-white">
                <div>
                  <p className="text-sm font-medium text-emerald-100 mb-2 uppercase tracking-wide">Koperasi Pembelian / Aktif</p>
                  <h3 className="text-4xl font-extrabold">{formatNum(statsO.totalAktif)}</h3>
                  <p className="text-sm text-emerald-50 font-medium mt-1">
                    {statsO.totalDaftar > 0 ? ((statsO.totalAktif / statsO.totalDaftar) * 100).toFixed(1) : 0}% Kadar Aktif
                  </p>
                </div>
                <div className="p-4 rounded-full bg-white bg-opacity-20 text-white">
                  <TrendingUp className="w-10 h-10" />
                </div>
              </div>
            </div>

            {/* CHARTS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Koperasi berdaftar mengikut tahun/bulan */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" /> 
                  Trend Pendaftaran vs Keaktifan Koperasi {filterO.tahun !== 'Semua' ? `Tahun ${filterO.tahun}` : '(Mengikut Tahun)'}
                </h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartPendaftaran} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                      <Bar dataKey="Daftar" fill="#2563eb" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e40af', fontSize: 10, fontWeight: 'bold' }} />
                      <Bar dataKey="Aktif" fill="#10b981" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#065f46', fontSize: 10, fontWeight: 'bold' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Compare Daftar vs Aktif (Gauge/Bar) */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                <h3 className="text-base font-semibold text-slate-800 mb-6 text-center">Nisbah Status Koperasi</h3>
                <div className="flex-grow flex flex-col justify-center items-center">
                  <div className="relative w-48 h-48 mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Aktif', value: statsO.totalAktif },
                            { name: 'Tidak Aktif', value: statsO.totalDaftar - statsO.totalAktif }
                          ]}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={80} startAngle={90} endAngle={-270}
                          dataKey="value" stroke="none"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f1f5f9" />
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-3xl font-bold text-slate-800">
                        {statsO.totalDaftar > 0 ? Math.round((statsO.totalAktif / statsO.totalDaftar) * 100) : 0}%
                      </span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Aktif</span>
                    </div>
                  </div>
                  <div className="flex space-x-6 text-sm font-medium">
                    <div className="flex items-center"><div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>Aktif ({statsO.totalAktif})</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-slate-200 rounded-full mr-2"></div>Tidak ({statsO.totalDaftar - statsO.totalAktif})</div>
                  </div>
                </div>
              </div>

              {/* Bilangan mengikut JKAN - Kini dwi-bar dengan semua 16 JKAN */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 lg:col-span-3">
                <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-rose-500" /> Perbandingan Pendaftaran vs Keaktifan Mengikut JKAN (Semua 16 JKAN)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartJkan} margin={{ top: 20, right: 10, left: 0, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 500}} angle={-45} textAnchor="end" height={80} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                      <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '12px'}} />
                      <Bar dataKey="Daftar" fill="#2563eb" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#1e40af', fontSize: 9, fontWeight: 'bold' }} />
                      <Bar dataKey="Aktif" fill="#10b981" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#065f46', fontSize: 9, fontWeight: 'bold' }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-center text-sm border-t border-slate-800 mt-auto">
        <p className="font-medium text-slate-300">© 2026 KPNiaga. Hak Cipta Terpelihara.</p>
        <p className="mt-1 opacity-75">oleh Seksyen Perdagangan & Peruncitan, KPNiaga</p>
      </footer>

    </div>
  );
}

// Komponen Ikon Custom SVG untuk mengelakkan isu import lucide-react jika tiada UserPlus secara terus
const UserPlusIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <line x1="19" y1="8" x2="19" y2="14" />
    <line x1="22" y1="11" x2="16" y2="11" />
  </svg>
);