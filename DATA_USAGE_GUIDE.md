# Chrome Web Store Data Usage Form - Browser Sound Booster

## Veri Kullanımı Formu Doldurma Kılavuzu

### 📋 **Form Bölümleri ve Cevaplar:**

#### 1. **Kullanıcılardan Şimdi veya Gelecekte Hangi Kullanıcı Verilerini Toplamayı Planlıyorsunuz?**

**✅ HİÇBİR VERİ TOPLANMAZ - Tüm kutuları BOŞ bırakın**

Neden boş bırakıyoruz:
- Extension sadece ses ayarlarını yerel olarak kaydeder
- Hiçbir kişisel veri toplanmaz
- Harici sunucuya veri gönderilmez
- Sadece `chrome.storage.local` kullanılır

#### 2. **Veri Toplama Kategorileri:**

**❌ Kimliği tanımlayabilecek bilgiler** - TOPLANMAZ
**❌ Sağlık bilgileri** - TOPLANMAZ
**❌ Finansal bilgiler ve ödeme bilgileri** - TOPLANMAZ
**❌ Kimlik doğrulama bilgileri** - TOPLANMAZ
**❌ Kişisel iletişimler** - TOPLANMAZ
**❌ Konum** - TOPLANMAZ
**❌ Web geçmişi** - TOPLANMAZ
**❌ Kullanıcı etkinliği** - TOPLANMAZ
**❌ Web sitesi içeriği** - TOPLANMAZ

#### 3. **Geliştirici Program Politikaları Onayları:**

**✅ Onaylanan kullanım alanları dışında üçüncü taraflara kullanıcı verilerini satmıyorum veya aktarmıyorum**
- Doğru: Hiç veri toplanmadığı için satma/aktarma da yok

**✅ Kullanıcı verilerini, öğemin tek amacıyla ilgili olmayan amaçlar için kullanmıyorum veya aktarmıyorum**
- Doğru: Tek amaç ses kontrolü, başka amaç yok

**✅ Kullanıcı verilerini, kredi vermeye uygun olup olmadığını değerlendirme veya kredi verme amacıyla kullanmıyorum ya da aktarmıyorum**
- Doğru: Finansal veri yok, kredi ile ilgili hiçbir şey yok

#### 4. **Gizlilik Politikası URL'si:**

**GitHub Raw URL kullanın:**
```
https://raw.githubusercontent.com/altunbas11/browser-sound-booster/main/PRIVACY_POLICY.md
```

Veya **GitHub Pages URL:**
```
https://altunbas11.github.io/browser-sound-booster/PRIVACY_POLICY.html
```

**✅ URL'ler güncellendi - artık gerçek GitHub repo bilgilerini içeriyor**

### 🔗 **Gizlilik Politikası Yayınlama:**

#### **Seçenek 1: GitHub Raw (Önerilen)**
1. `PRIVACY_POLICY.md` dosyasını GitHub'a yükleyin
2. Raw URL'yi alın: `https://raw.githubusercontent.com/.../PRIVACY_POLICY.md`

#### **Seçenek 2: GitHub Pages**
1. GitHub Pages'i etkinleştirin
2. `PRIVACY_POLICY.md` → `PRIVACY_POLICY.html` çevirin
3. URL: `https://[USERNAME].github.io/[REPO]/PRIVACY_POLICY.html`

#### **Seçenek 3: Kişisel Website**
- Kendi sitenizde yayınlayın
- HTTPS zorunlu

### 📝 **Form Doldurma Adımları:**

1. **Chrome Web Store Developer Dashboard**'a gidin
2. **Extension** → **Privacy** → **Data usage** sekmesine tıklayın
3. **Data collection** bölümünde hiçbir kutuyu işaretlemeyin
4. **Policy statements**'da tüm üç onay kutusunu işaretleyin
5. **Privacy policy URL** alanına yukarıdaki URL'yi girin
6. **Save** butonuna tıklayın

### ⚠️ **Önemli Notlar:**

- **Hiç veri toplamıyorsanız** tüm veri kategorilerini boş bırakın
- **Gizlilik politikası zorunlu** - veri toplamasa bile
- **HTTPS URL gerekli** - HTTP kabul edilmez
- **URL erişilebilir olmalı** - 404 hatası onay reddine neden olur

### 🎯 **Neden Bu Yanıtlar Doğru?**

**Extension Analizi:**
- Sadece `chrome.storage.local` kullanır
- Ses seviyeleri ve mute durumu saklar
- Harici API çağrısı yok
- Kişisel veri yok
- Takip kodu yok

**Single Purpose Uyumluluğu:**
- Tek amaç: Ses amplifikasyonu
- Veri toplama: Yok
- Üçüncü parti: Yok

### 📞 **Sorun Yaşarsanız:**

Eğer onay alamazsanız:
1. Gizlilik politikasının erişilebilir olduğunu kontrol edin
2. URL'nin HTTPS olduğunu doğrulayın
3. Veri toplamadığınızı tekrar belirtin

---

**✅ Form Hazır - Onay İçin Uygun!**</content>
<parameter name="filePath">c:\Users\user\Desktop\projeler\browserSoundBooster\DATA_USAGE_GUIDE.md