// Browser console'da çalıştır (santasmission.com'da F12 aç)
// Bu script profilini düzeltecek

const API_URL = 'https://btmzk05gh8.execute-api.eu-central-1.amazonaws.com/prod';
const user = JSON.parse(localStorage.getItem('santa_user'));

async function fixProfile() {
    try {
        const response = await fetch(`${API_URL}/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.userId,
                firstName: 'Semih',
                lastName: 'Coşkun',  // Türkçe ş karakteri
                username: 'semihcoskun',
                email: user.email,
                photo: user.photo,
                profileEdited: false  // Tekrar düzenleyebilmek için
            })
        });
        
        const data = await response.json();
        console.log('Response:', data);
        
        if (data.success || (data.body && JSON.parse(data.body).success)) {
            console.log('✅ Profil düzeltildi!');
            // LocalStorage'ı güncelle
            user.firstName = 'Semih';
            user.lastName = 'Coşkun';
            localStorage.setItem('santa_user', JSON.stringify(user));
            location.reload();
        } else {
            console.error('❌ Hata:', data);
        }
    } catch (error) {
        console.error('❌ Hata:', error);
    }
}

fixProfile();
