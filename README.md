# Orhan Şahin — Portfolio

HTML, CSS ve JavaScript ile hazırlanmış kişisel portfolyo. Kurulum veya derleme gerektirmez.

## Klasörler

- `index.html`: Tanıtım, projeler, yetenekler ve iletişim bilgileri.
- `styles.css`: Renkler, sayfa düzeni, mobil görünüm ve animasyonlar.
- `script.js`: Mobil menü ve fareyi takip eden ışık efekti.
- `assets/`: Profil fotoğrafı ve projelerde kullanılan ekran görüntüleri.
- `games/battleship/`: Portfolyodan açılan Battleship oyunu.

## Bilgisayarda açma

ZIP dosyasını bir klasöre çıkarıp `index.html` dosyasını tarayıcıda açabilirsin.
VS Code kullanıyorsan Live Server ile de çalıştırabilirsin.

Python yüklüyse proje klasöründe aşağıdaki komutu çalıştırabilirsin:

```sh
python3 -m http.server 8000
```

Ardından tarayıcıda `http://localhost:8000` adresini aç.

## Düzenleme

- Metinler, proje bağlantıları ve e-posta: `index.html`.
- Renkler: `styles.css` dosyasının başındaki `:root` bölümü.
- Işığın boyutu ve yoğunluğu: CSS içindeki `.cursor-glow`.
- Menü ve ışığın davranışı: `script.js`.

Kod açıklamaları ve site içeriği Hollandacadır. Mobil görünüm kuralları CSS dosyasının sonundadır.
Işık efekti yalnızca fareyle kullanılır; azaltılmış hareket tercihinde kapalıdır.

## GitHub'a hazırlık

ZIP'i açtıktan sonra içindeki dosya ve klasörleri birlikte depoya ekle.
`index.html` depo kökünde olmalı. `assets` ve `games` klasörlerinin isimlerini koru.
Görseller ve oyun göreli bağlantılar kullandığı için sitenin ayrı bir veritabanına ihtiyacı yoktur.

GitHub'a dosya eklemek tek başına siteyi yayımlamaz. Yayınlama ve özel alan adı bağlantısı ayrıca yapılmalıdır.
Bu pakette alan adına özel bir ayar yoktur.

## Projeler hakkında

- Battleship portfolyonun içinde çalışır. Ülke seçiminden oyuna geçiş hatası düzeltilmiştir.
- Webshop için GitHub bağlantısı ve mevcut giriş arayüzünün ekran görüntüsü bulunur.
  Webshop'un PHP kodu ve veritabanı bu pakete dahil değildir.
- Webshop görseli, veritabanına bağlanmadan yerelde görüntülenen mevcut giriş formudur.
- Zuul ve Secure Web App kartlarındaki şekiller dekoratif CSS çizimleridir.
- Google Fonts yazı tipleri internet üzerinden yüklenir; bağlantı yoksa sistem yazı tipi kullanılır.

## Kaynaklar

Battleship: https://github.com/Orhan257/WebGame-Battleship-Pacific

Webshop: https://github.com/Orhan257/Webshop


## 3B satranç alanı

`chess.js`, iletişim bölümündeki etkileşimli tahtayı yönetir. Fareyle sürükleme
kamerayı döndürür; taşa ve hedef kareye tıklamak taşı hareket ettirir. Serbest
yerleştirme modudur: yasal hamle, sıra, şah/mat veya bilgisayar rakibi yoktur.
Görünür başlık, açıklama veya ayar düğmesi yoktur. Ok tuşlarıyla kamera
döndürülebilir; Escape seçimi kaldırır.
Sayfayı yenilemek yerleşimi sıfırlar. HTTP sunucusu ve WebGL2 gerekir.

Three.js r180 dosyaları `assets/vendor/` içinde yereldir; çalışma sırasında
harici CDN kullanılmaz. MIT lisansı aynı klasördedir. Kütüphane tahta görünür
olduğunda yüklenir; çizim yalnızca etkileşim ve boyut değişiminde yapılır.
