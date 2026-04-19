# SplitKos

Web app sederhana untuk mencatat patungan/split bill antar teman kos.

## Fitur

- Buat grup patungan (mis. "Kos A", "Trip Bali")
- Tambah anggota ke grup
- Catat transaksi (siapa bayar, jumlah, untuk apa, tanggal)
- Status transaksi: **lunas** / **belum lunas**
- Edit & hapus transaksi
- Sistem otomatis menghitung:
	- Total hutang tiap orang
	- Siapa berhutang ke siapa (daftar transfer)
- Target total per grup (budget) + progress terpakai

Catatan: perhitungan transaksi diasumsikan **dibagi rata ke semua anggota** dalam grup.

## Menjalankan

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
npm run preview
```

## Struktur Folder

- [src/components](src/components)
	- `Navbar.jsx`: header aplikasi
	- `GroupList.jsx`: list grup + modal buat grup
	- `TransactionList.jsx`: anggota + list transaksi + modal tambah/edit transaksi
	- `Summary.jsx`: ringkasan hutang + daftar transfer
	- `Modal.jsx`: modal generik
- [src/context/AppContext.jsx](src/context/AppContext.jsx): state global (useContext) + aksi CRUD + auto-save ke localStorage
- [src/utils/calc.js](src/utils/calc.js): logic perhitungan saldo & transfer
- [src/utils/storage.js](src/utils/storage.js): load/save localStorage

## Ringkas Logic Perhitungan Hutang

1. Untuk setiap transaksi yang **belum lunas**:
	 - Misal anggota = N, amount = A, maka tiap orang punya share = A / N
	 - Semua anggota: saldo -= share
	 - Payer: saldo += A
2. Saldo akhir:
	 - Saldo positif = orang tersebut **harus dibayar**
	 - Saldo negatif = orang tersebut **berhutang**
3. Daftar "siapa bayar ke siapa" dibuat dengan mencocokkan debtor (saldo negatif) dan creditor (saldo positif) sampai semua seimbang.
