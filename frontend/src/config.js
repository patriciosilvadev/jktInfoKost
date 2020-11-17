export const RESTAPIDOMAIN = 'http://localhost:5000'
export const ROLE = {
    0: {
        name: 'Penyewa',
        access: {
            Dashboard: 'Dashboard',
            Kontak: 'Kontak',
            Tagihan: 'Tagihan'
        },
    },
    1: {
        name: 'Pemilik',
        access: {
            Dashboard: 'Dashboard',
            Sewaan: 'Sewaan',
            Tanah: 'Tanah',
            Kontak: 'Kontak',
            Tagihan: 'Tagihan'
        },
    },
}
