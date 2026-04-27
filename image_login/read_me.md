# 📁 Image Login - Intégration

## 🎯 Objectif

Ajouter une image de fond pour la partie gauche de la page de login **sans impacter le formulaire existant**.

---

## 📂 Structure attendue

Le fichier image est placé ici :

```
/image login/imagelogin.png
```

---

## ⚠️ Contraintes importantes

* Ne **pas modifier** le formulaire de login existant
* Ne **pas superposer l’image sur le formulaire**
* L’image doit être visible **uniquement à gauche**
* Le design actuel doit rester **lisible et propre**
* Le layout doit rester **responsive**

---

## 🧱 Structure HTML attendue

La page doit être séparée en 2 parties :

```html
<div class="login-container">
    <div class="login-left"></div>
    <div class="login-right">
        <!-- FORMULAIRE EXISTANT (ne pas modifier) -->
    </div>
</div>
```

---

## 🎨 Intégration CSS

```css
.login-container {
    display: flex;
    height: 100vh;
}

/* PARTIE IMAGE */
.login-left {
    flex: 1;
    background-image: url("/image login/imagelogin.png");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: relative;
}

/* Overlay léger pour lisibilité */
.login-left::after {
    content: "";
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.25);
}

/* PARTIE FORMULAIRE */
.login-right {
    width: 420px;
    background: #f5f1e8; /* garder le style actuel */
    display: flex;
    align-items: center;
    justify-content: center;
}
```

---

## 📱 Responsive

Option recommandé :

```css
@media (max-width: 768px) {
    .login-left {
        display: none;
    }

    .login-right {
        width: 100%;
    }
}
```

---

## ✅ Résultat attendu

* Image visible uniquement à gauche
* Formulaire intact à droite
* Design élégant et lisible
* Aucun conflit avec le code existant

---

## 🚫 À ne pas faire

* Ne pas mettre l’image en background global (`body`)
* Ne pas ajouter l’image derrière le formulaire
* Ne pas changer les styles existants du login
* Ne pas casser le responsive

---
